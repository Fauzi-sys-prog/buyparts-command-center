import { withTransaction } from "../client.js";
import { insertPricingReviewEvent } from "./pricing-review-workspace-repository.js";

export type PricingReviewDecision = "approved" | "rejected";

type PricingRecommendationStateRow = {
  id: string;
  status: string;
  reviewed_at: string | null;
  review_operator_label: string | null;
  review_source: string | null;
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
        reviewOperatorLabel: string | null;
        reviewSource: string | null;
      };
    }
  | {
      outcome: "reviewed";
      item: {
        id: string;
        status: string;
        reviewedAt: string | null;
        reviewOperatorLabel: string | null;
        reviewSource: string | null;
      };
    };

export async function reviewPricingRecommendation(
  id: string,
  decision: PricingReviewDecision,
  input?: {
    operatorLabel?: string | null;
    source?: string | null;
  }
): Promise<PricingReviewResult> {
  const operatorLabel =
    typeof input?.operatorLabel === "string" && input.operatorLabel.trim().length > 0
      ? input.operatorLabel.trim()
      : "Local operator";
  const reviewSource =
    typeof input?.source === "string" && input.source.trim().length > 0 ? input.source.trim() : "web";

  return withTransaction(async (client) => {
    const existingResult = await client.query<PricingRecommendationStateRow>(
      `
        SELECT
          id,
          status,
          reviewed_at::text,
          review_operator_label,
          review_source
        FROM pricing_recommendations
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    const existing = existingResult.rows[0];

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
          reviewedAt: existing.reviewed_at,
          reviewOperatorLabel: existing.review_operator_label,
          reviewSource: existing.review_source
        }
      };
    }

    const result = await client.query<PricingRecommendationStateRow>(
      `
        UPDATE pricing_recommendations
        SET
          status = $2,
          reviewed_at = NOW(),
          review_operator_label = $3,
          review_source = $4
        WHERE id = $1
        RETURNING
          id,
          status,
          reviewed_at::text,
          review_operator_label,
          review_source
      `,
      [id, decision, operatorLabel, reviewSource]
    );

    const reviewed = result.rows[0];

    if (!reviewed) {
      return {
        outcome: "not_found"
      };
    }

    await insertPricingReviewEvent(
      client,
      id,
      "status_updated",
      decision === "approved"
        ? `${operatorLabel} approved this pricing recommendation.`
        : `${operatorLabel} rejected this pricing recommendation.`,
      {
        status: reviewed.status,
        reviewedAt: reviewed.reviewed_at,
        operatorLabel,
        source: reviewSource
      }
    );

    return {
      outcome: "reviewed",
      item: {
        id: reviewed.id,
        status: reviewed.status,
        reviewedAt: reviewed.reviewed_at,
        reviewOperatorLabel: reviewed.review_operator_label,
        reviewSource: reviewed.review_source
      }
    };
  });
}
