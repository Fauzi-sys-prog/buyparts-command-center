import { withTransaction } from "../client.js";

const CHECKLIST_KEYS = ["margin", "inventory", "velocity", "rationale"] as const;

type ChecklistKey = (typeof CHECKLIST_KEYS)[number];

type RecommendationExistsRow = {
  id: string;
};

type PricingReviewWorkspaceRow = {
  checklist: unknown;
  notes: string;
  operator_label: string | null;
  created_at: string;
  updated_at: string;
};

export type PricingReviewWorkspaceState = {
  checklist: Record<ChecklistKey, boolean>;
  notes: string;
  operatorLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SavePricingReviewWorkspaceInput = {
  checklist?: Record<string, unknown> | null;
  notes?: string | null;
  operatorLabel?: string | null;
};

export type SavePricingReviewWorkspaceResult =
  | {
      outcome: "not_found";
    }
  | {
      outcome: "saved";
      item: PricingReviewWorkspaceState;
    };

function normalizeChecklist(value: Record<string, unknown> | null | undefined) {
  return CHECKLIST_KEYS.reduce<Record<ChecklistKey, boolean>>(
    (result, key) => ({
      ...result,
      [key]: value?.[key] === true
    }),
    {
      margin: false,
      inventory: false,
      velocity: false,
      rationale: false
    }
  );
}

export function toPricingWorkspaceState(row: PricingReviewWorkspaceRow): PricingReviewWorkspaceState {
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

export async function insertPricingReviewEvent(
  client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  recommendationId: string,
  eventType: string,
  summary: string,
  payload: Record<string, unknown>
) {
  await client.query(
    `
      INSERT INTO pricing_review_events (
        pricing_recommendation_id,
        event_type,
        summary,
        payload
      )
      VALUES ($1, $2, $3, $4::jsonb)
    `,
    [recommendationId, eventType, summary, JSON.stringify(payload)]
  );
}

export async function savePricingReviewWorkspace(
  recommendationId: string,
  input: SavePricingReviewWorkspaceInput
): Promise<SavePricingReviewWorkspaceResult> {
  const checklist = normalizeChecklist(input.checklist ?? null);
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const operatorLabel =
    typeof input.operatorLabel === "string" && input.operatorLabel.trim().length > 0
      ? input.operatorLabel.trim()
      : "Local operator";

  return withTransaction(async (client) => {
    const recommendationResult = await client.query<RecommendationExistsRow>(
      `
        SELECT id
        FROM pricing_recommendations
        WHERE id = $1
        LIMIT 1
      `,
      [recommendationId]
    );

    if (!recommendationResult.rows[0]) {
      return {
        outcome: "not_found"
      };
    }

    const workspaceResult = await client.query<PricingReviewWorkspaceRow>(
      `
        INSERT INTO pricing_review_workspaces (
          pricing_recommendation_id,
          checklist,
          notes,
          operator_label
        )
        VALUES ($1, $2::jsonb, $3, $4)
        ON CONFLICT (pricing_recommendation_id)
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
      [recommendationId, JSON.stringify(checklist), notes, operatorLabel]
    );

    await insertPricingReviewEvent(
      client,
      recommendationId,
      "review_workspace_saved",
      `Pricing review workspace saved by ${operatorLabel}.`,
      {
        checklist,
        notesLength: notes.length,
        operatorLabel
      }
    );

    return {
      outcome: "saved",
      item: toPricingWorkspaceState(workspaceResult.rows[0])
    };
  });
}
