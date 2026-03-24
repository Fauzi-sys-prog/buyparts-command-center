"use server";

import { redirect } from "next/navigation";

import { buildFeedbackRedirectPath } from "@/lib/action-feedback";

type PricingReviewDecision = "approve" | "reject";
type BulkOutcome = "success" | "conflict" | "missing" | "unavailable" | "error" | "empty" | "partial";

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:4000";

  return baseUrl.replace(/\/$/, "");
}

function getOperatorLabel(formData: FormData | null | undefined) {
  const value = formData?.get("operatorLabel");

  if (typeof value !== "string") {
    return "Local operator";
  }

  return value.trim().length > 0 ? value.trim() : "Local operator";
}

async function submitPricingReview(
  recommendationId: string,
  decision: PricingReviewDecision,
  returnPath: string,
  formData?: FormData
) {
  let outcome: "success" | "conflict" | "missing" | "unavailable" | "error" = "error";
  const operatorLabel = getOperatorLabel(formData);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/pricing/recommendations/${encodeURIComponent(recommendationId)}/${decision}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          source: "web",
          operatorLabel
        }),
        cache: "no-store"
      }
    );

    if (response.ok) {
      outcome = "success";
    } else if (response.status === 409) {
      outcome = "conflict";
    } else if (response.status === 404) {
      outcome = "missing";
    } else if (response.status === 503) {
      outcome = "unavailable";
    }
  } finally {
    redirect(
      buildFeedbackRedirectPath(returnPath, {
        scope: "pricing",
        action: decision,
        outcome
      })
    );
  }
}

function getSelectedRecommendationIds(formData: FormData) {
  return [...new Set(formData.getAll("selectedIds").map((value) => String(value).trim()).filter(Boolean))];
}

function resolveBulkOutcome(counts: {
  success: number;
  conflict: number;
  missing: number;
  unavailable: number;
  error: number;
  total: number;
}): BulkOutcome {
  if (counts.total === 0) {
    return "empty";
  }

  if (counts.success === counts.total) {
    return "success";
  }

  if (counts.success > 0) {
    return "partial";
  }

  if (counts.unavailable === counts.total) {
    return "unavailable";
  }

  if (counts.conflict === counts.total) {
    return "conflict";
  }

  if (counts.missing === counts.total) {
    return "missing";
  }

  return "error";
}

async function submitBulkPricingReview(
  decision: PricingReviewDecision,
  returnPath: string,
  formData: FormData
) {
  const selectedIds = getSelectedRecommendationIds(formData);
  const operatorLabel = getOperatorLabel(formData);
  const counts = {
    success: 0,
    conflict: 0,
    missing: 0,
    unavailable: 0,
    error: 0,
    total: selectedIds.length
  };

  if (selectedIds.length > 0) {
    const responses = await Promise.all(
      selectedIds.map(async (recommendationId) => {
        try {
          const response = await fetch(
            `${getApiBaseUrl()}/pricing/recommendations/${encodeURIComponent(recommendationId)}/${decision}`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                source: "web-bulk",
                operatorLabel
              }),
              cache: "no-store"
            }
          );

          if (response.ok) {
            return "success" as const;
          }

          if (response.status === 409) {
            return "conflict" as const;
          }

          if (response.status === 404) {
            return "missing" as const;
          }

          if (response.status === 503) {
            return "unavailable" as const;
          }

          return "error" as const;
        } catch {
          return "error" as const;
        }
      })
    );

    for (const outcome of responses) {
      counts[outcome] += 1;
    }
  }

  redirect(
    buildFeedbackRedirectPath(returnPath, {
      scope: "pricing",
      action: decision,
      outcome: resolveBulkOutcome(counts),
      count: counts.success,
      total: counts.total
    })
  );
}

export async function approvePricingRecommendationAction(
  recommendationId: string,
  returnPath: string,
  formData: FormData
) {
  await submitPricingReview(recommendationId, "approve", returnPath, formData);
}

export async function rejectPricingRecommendationAction(
  recommendationId: string,
  returnPath: string,
  formData: FormData
) {
  await submitPricingReview(recommendationId, "reject", returnPath, formData);
}

export async function approveSelectedPricingRecommendationsAction(
  returnPath: string,
  formData: FormData
) {
  await submitBulkPricingReview("approve", returnPath, formData);
}

export async function rejectSelectedPricingRecommendationsAction(
  returnPath: string,
  formData: FormData
) {
  await submitBulkPricingReview("reject", returnPath, formData);
}
