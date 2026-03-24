"use server";

import { redirect } from "next/navigation";

type PricingReviewDecision = "approve" | "reject";

function getApiBaseUrl() {
  const baseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:4000";

  return baseUrl.replace(/\/$/, "");
}

async function submitPricingReview(
  recommendationId: string,
  decision: PricingReviewDecision,
  returnPath: string
) {
  try {
    await fetch(
      `${getApiBaseUrl()}/pricing/recommendations/${encodeURIComponent(recommendationId)}/${decision}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          source: "web"
        }),
        cache: "no-store"
      }
    );
  } finally {
    redirect(returnPath);
  }
}

export async function approvePricingRecommendationAction(
  recommendationId: string,
  returnPath: string
) {
  await submitPricingReview(recommendationId, "approve", returnPath);
}

export async function rejectPricingRecommendationAction(
  recommendationId: string,
  returnPath: string
) {
  await submitPricingReview(recommendationId, "reject", returnPath);
}
