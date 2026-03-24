import { withTransaction } from "../client.js";
import { insertCatalogReviewEvent } from "./catalog-review-workspace-repository.js";

export type CatalogRunDecision = "queued" | "cancelled";

type CatalogRunStateRow = {
  id: string;
  status: string;
  completed_at: string | null;
  error_message: string | null;
};

export type CatalogRunReviewResult =
  | {
      outcome: "not_found";
    }
  | {
      outcome: "already_finalized";
      item: {
        id: string;
        status: string;
        completedAt: string | null;
        errorMessage: string | null;
      };
    }
  | {
      outcome: "updated";
      item: {
        id: string;
        status: string;
        completedAt: string | null;
        errorMessage: string | null;
      };
    };

export async function reviewCatalogRun(
  id: string,
  decision: CatalogRunDecision,
  input?: {
    operatorLabel?: string | null;
    source?: string | null;
  }
): Promise<CatalogRunReviewResult> {
  const operatorLabel =
    typeof input?.operatorLabel === "string" && input.operatorLabel.trim().length > 0
      ? input.operatorLabel.trim()
      : "Local operator";
  const source =
    typeof input?.source === "string" && input.source.trim().length > 0 ? input.source.trim() : "web";

  return withTransaction(async (client) => {
    const existingResult = await client.query<CatalogRunStateRow>(
      `
        SELECT
          id,
          status,
          completed_at::text,
          error_message
        FROM catalog_enrichment_runs
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

    if (existing.status === "completed" || existing.status === "cancelled") {
      return {
        outcome: "already_finalized",
        item: {
          id: existing.id,
          status: existing.status,
          completedAt: existing.completed_at,
          errorMessage: existing.error_message
        }
      };
    }

    const result = await client.query<CatalogRunStateRow>(
      `
        UPDATE catalog_enrichment_runs
        SET
          status = $2,
          completed_at = CASE WHEN $2 = 'cancelled' THEN NOW() ELSE NULL END,
          error_message = CASE
            WHEN $2 = 'cancelled' THEN 'Cancelled by operator.'
            ELSE NULL
          END
        WHERE id = $1
        RETURNING
          id,
          status,
          completed_at::text,
          error_message
      `,
      [id, decision]
    );

    const updated = result.rows[0];

    if (!updated) {
      return {
        outcome: "not_found"
      };
    }

    await insertCatalogReviewEvent(
      client,
      id,
      "status_updated",
      decision === "queued"
        ? `${operatorLabel} returned the catalog run to the active queue.`
        : `${operatorLabel} cancelled this catalog run.`,
      {
        status: updated.status,
        errorMessage: updated.error_message,
        operatorLabel,
        source
      }
    );

    return {
      outcome: "updated",
      item: {
        id: updated.id,
        status: updated.status,
        completedAt: updated.completed_at,
        errorMessage: updated.error_message
      }
    };
  });
}
