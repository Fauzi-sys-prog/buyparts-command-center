import { query } from "../client.js";

export type PricingReviewDecision = "approved" | "rejected";

type PricingRecommendationStateRow = {
  id: string;
  status: string;
  reviewed_at: string | null;
};

export type PricingReviewResult =
  | {
      outcome: "not_found";
    }
  | {
      outcome: "already_reviewed";
      item: {
        id: string;
        status: string;
        reviewedAt: string | null;
      };
    }
  | {
      outcome: "reviewed";
      item: {
        id: string;
        status: string;
        reviewedAt: string | null;
      };
    };

async function getPricingRecommendationState(id: string) {
  const result = await query<PricingRecommendationStateRow>(
    `
      SELECT
        id,
        status,
        reviewed_at::text
      FROM pricing_recommendations
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result?.rows[0] ?? null;
}

export async function reviewPricingRecommendation(
  id: string,
  decision: PricingReviewDecision
): Promise<PricingReviewResult> {
  const existing = await getPricingRecommendationState(id);

  if (!existing) {
    return {
      outcome: "not_found"
    };
  }

  if (existing.status !== "pending") {
    return {
      outcome: "already_reviewed",
      item: {
        id: existing.id,
        status: existing.status,
        reviewedAt: existing.reviewed_at
      }
    };
  }

  const result = await query<PricingRecommendationStateRow>(
    `
      UPDATE pricing_recommendations
      SET
        status = $2,
        reviewed_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        status,
        reviewed_at::text
    `,
    [id, decision]
  );

  const reviewed = result?.rows[0];

  if (!reviewed) {
    return {
      outcome: "not_found"
    };
  }

  return {
    outcome: "reviewed",
    item: {
      id: reviewed.id,
      status: reviewed.status,
      reviewedAt: reviewed.reviewed_at
    }
  };
}
