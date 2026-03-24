"use server";

import { redirect } from "next/navigation";

import { buildFeedbackRedirectPath } from "@/lib/action-feedback";

const CHECKLIST_FIELDS = ["margin", "inventory", "velocity", "rationale"] as const;

type ChecklistField = (typeof CHECKLIST_FIELDS)[number];

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:4000";

  return baseUrl.replace(/\/$/, "");
}

function buildChecklistPayload(formData: FormData) {
  return CHECKLIST_FIELDS.reduce<Record<ChecklistField, boolean>>(
    (result, field) => ({
      ...result,
      [field]: formData.get(`checklist_${field}`) === "true"
    }),
    {
      margin: false,
      inventory: false,
      velocity: false,
      rationale: false
    }
  );
}

export async function savePricingReviewWorkspaceAction(
  recommendationId: string,
  returnPath: string,
  formData: FormData
) {
  let outcome: "success" | "missing" | "unavailable" | "error" = "error";

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/pricing/recommendations/${encodeURIComponent(recommendationId)}/review-workspace`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          checklist: buildChecklistPayload(formData),
          notes: String(formData.get("notes") ?? ""),
          operatorLabel: String(formData.get("operatorLabel") ?? "")
        }),
        cache: "no-store"
      }
    );

    if (response.ok) {
      outcome = "success";
    } else if (response.status === 404) {
      outcome = "missing";
    } else if (response.status === 503) {
      outcome = "unavailable";
    }
  } finally {
    redirect(
      buildFeedbackRedirectPath(returnPath, {
        scope: "pricing",
        action: "save",
        outcome
      })
    );
  }
}
