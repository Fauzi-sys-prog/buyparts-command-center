import { query } from "../client.js";

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

async function getCatalogRunState(id: string) {
  const result = await query<CatalogRunStateRow>(
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

  return result?.rows[0] ?? null;
}

export async function reviewCatalogRun(
  id: string,
  decision: CatalogRunDecision
): Promise<CatalogRunReviewResult> {
  const existing = await getCatalogRunState(id);

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

  const result = await query<CatalogRunStateRow>(
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

  const updated = result?.rows[0];

  if (!updated) {
    return {
      outcome: "not_found"
    };
  }

  return {
    outcome: "updated",
    item: {
      id: updated.id,
      status: updated.status,
      completedAt: updated.completed_at,
      errorMessage: updated.error_message
    }
  };
}
