import { withTransaction } from "../client.js";

const CHECKLIST_KEYS = ["title", "highlights", "attributes", "fitment", "payload"] as const;

type ChecklistKey = (typeof CHECKLIST_KEYS)[number];

type CatalogRunExistsRow = {
  id: string;
};

type CatalogReviewWorkspaceRow = {
  checklist: unknown;
  notes: string;
  operator_label: string | null;
  created_at: string;
  updated_at: string;
};

export type CatalogReviewWorkspaceState = {
  checklist: Record<ChecklistKey, boolean>;
  notes: string;
  operatorLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SaveCatalogReviewWorkspaceInput = {
  checklist?: Record<string, unknown> | null;
  notes?: string | null;
  operatorLabel?: string | null;
};

export type SaveCatalogReviewWorkspaceResult =
  | {
      outcome: "not_found";
    }
  | {
      outcome: "saved";
      item: CatalogReviewWorkspaceState;
    };

function normalizeChecklist(value: Record<string, unknown> | null | undefined) {
  return CHECKLIST_KEYS.reduce<Record<ChecklistKey, boolean>>(
    (result, key) => ({
      ...result,
      [key]: value?.[key] === true
    }),
    {
      title: false,
      highlights: false,
      attributes: false,
      fitment: false,
      payload: false
    }
  );
}

function toWorkspaceState(row: CatalogReviewWorkspaceRow): CatalogReviewWorkspaceState {
  const checklistValue =
    row.checklist && typeof row.checklist === "object" && !Array.isArray(row.checklist)
      ? (row.checklist as Record<string, unknown>)
      : null;

  return {
    checklist: normalizeChecklist(checklistValue),
    notes: row.notes ?? "",
    operatorLabel: row.operator_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function insertCatalogReviewEvent(
  client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  runId: string,
  eventType: string,
  summary: string,
  payload: Record<string, unknown>
) {
  await client.query(
    `
      INSERT INTO catalog_review_events (
        catalog_run_id,
        event_type,
        summary,
        payload
      )
      VALUES ($1, $2, $3, $4::jsonb)
    `,
    [runId, eventType, summary, JSON.stringify(payload)]
  );
}

export async function saveCatalogReviewWorkspace(
  runId: string,
  input: SaveCatalogReviewWorkspaceInput
): Promise<SaveCatalogReviewWorkspaceResult> {
  const checklist = normalizeChecklist(input.checklist ?? null);
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const operatorLabel =
    typeof input.operatorLabel === "string" && input.operatorLabel.trim().length > 0
      ? input.operatorLabel.trim()
      : "Local operator";

  return withTransaction(async (client) => {
    const runResult = await client.query<CatalogRunExistsRow>(
      `
        SELECT id
        FROM catalog_enrichment_runs
        WHERE id = $1
        LIMIT 1
      `,
      [runId]
    );

    if (!runResult.rows[0]) {
      return {
        outcome: "not_found"
      };
    }

    const workspaceResult = await client.query<CatalogReviewWorkspaceRow>(
      `
        INSERT INTO catalog_review_workspaces (
          catalog_run_id,
          checklist,
          notes,
          operator_label
        )
        VALUES ($1, $2::jsonb, $3, $4)
        ON CONFLICT (catalog_run_id)
        DO UPDATE
        SET
          checklist = EXCLUDED.checklist,
          notes = EXCLUDED.notes,
          operator_label = EXCLUDED.operator_label,
          updated_at = NOW()
        RETURNING
          checklist,
          notes,
          operator_label,
          created_at::text,
          updated_at::text
      `,
      [runId, JSON.stringify(checklist), notes, operatorLabel]
    );

    const savedWorkspace = workspaceResult.rows[0];

    await insertCatalogReviewEvent(
      client,
      runId,
      "review_workspace_saved",
      `Review workspace saved by ${operatorLabel}.`,
      {
        checklist,
        notesLength: notes.length,
        operatorLabel
      }
    );

    return {
      outcome: "saved",
      item: toWorkspaceState(savedWorkspace)
    };
  });
}
