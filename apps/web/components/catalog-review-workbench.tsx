"use client";

import { useEffect, useMemo, useState } from "react";

import { FormSubmitButton } from "@/components/form-submit-button";
import type { CatalogRunReviewState } from "@/lib/api";
import { saveCatalogReviewWorkspaceAction } from "@/lib/catalog-review-workspace-actions";
import {
  normalizeOperatorProfile,
  OPERATOR_PROFILE_STORAGE_KEY,
  OPERATOR_PROFILE_UPDATED_EVENT
} from "@/lib/operator-profile";

type ChecklistId = "title" | "highlights" | "attributes" | "fitment" | "payload";

type CatalogReviewWorkbenchProps = {
  runId: string;
  returnPath: string;
  initialReviewState: CatalogRunReviewState;
  productTitle: string;
  providerLabel: string;
  promptVersionLabel: string;
  draftModeLabel: string;
  highlightCount: number;
  attributeCount: number;
  fitmentCount: number;
};

type ReviewDraftState = {
  checklist: Record<ChecklistId, boolean>;
  notes: string;
  operatorLabel: string;
  updatedAt: string | null;
};

const CHECKLIST_ITEMS: Array<{
  id: ChecklistId;
  label: string;
  detail: string;
}> = [
  {
    id: "title",
    label: "Title is commercially clear",
    detail: "Confirm the proposed title is accurate, specific, and worth shipping to the storefront."
  },
  {
    id: "highlights",
    label: "Highlights are conversion-ready",
    detail: "Check whether the key bullets are strong enough to help search relevance and buyer confidence."
  },
  {
    id: "attributes",
    label: "Attributes are normalized",
    detail: "Review normalized fields for naming consistency, units, and missing values."
  },
  {
    id: "fitment",
    label: "Fitment and tag signals make sense",
    detail: "Make sure tag and fitment hints are not misleading for downstream filtering or ads."
  },
  {
    id: "payload",
    label: "Payload and prompt context reviewed",
    detail: "Sanity-check the prompt family, provider state, and raw payload before changing run status."
  }
];

const QUICK_NOTES = [
  {
    label: "Provider",
    note: "Needs provider configuration before final review."
  },
  {
    label: "Title",
    note: "Title still feels too generic for high-intent search."
  },
  {
    label: "Fitment",
    note: "Review fitment tags against supplier source data."
  },
  {
    label: "Attributes",
    note: "Attributes need another normalization pass."
  },
  {
    label: "Ready",
    note: "Ready for queue once notes are addressed."
  }
];

function getStorageKey(runId: string) {
  return `buyparts.catalog-review.${runId}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function normalizeDraftState(input: Partial<ReviewDraftState>): ReviewDraftState {
  return {
    checklist: {
      title: input.checklist?.title === true,
      highlights: input.checklist?.highlights === true,
      attributes: input.checklist?.attributes === true,
      fitment: input.checklist?.fitment === true,
      payload: input.checklist?.payload === true
    },
    notes: input.notes ?? "",
    operatorLabel: input.operatorLabel?.trim() ? input.operatorLabel : "Local operator",
    updatedAt: input.updatedAt ?? null
  };
}

function getStoredOperatorLabel() {
  try {
    const stored = window.localStorage.getItem(OPERATOR_PROFILE_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    return normalizeOperatorProfile(JSON.parse(stored)).displayName;
  } catch {
    return null;
  }
}

function applyOperatorDefault(draft: ReviewDraftState, operatorLabel: string | null) {
  if (!operatorLabel) {
    return draft;
  }

  if (draft.operatorLabel.trim().length > 0 && draft.operatorLabel !== "Local operator") {
    return draft;
  }

  return {
    ...draft,
    operatorLabel
  };
}

function toInitialDraftState(initialReviewState: CatalogRunReviewState): ReviewDraftState {
  return normalizeDraftState({
    checklist: initialReviewState.checklist,
    notes: initialReviewState.notes,
    operatorLabel: initialReviewState.operatorLabel ?? "Local operator",
    updatedAt: initialReviewState.updatedAt
  });
}

function pickNewestDraft(
  serverDraft: ReviewDraftState,
  localDraft: ReviewDraftState | null
): ReviewDraftState {
  if (!localDraft?.updatedAt) {
    return serverDraft;
  }

  if (!serverDraft.updatedAt) {
    return localDraft;
  }

  return new Date(localDraft.updatedAt).getTime() > new Date(serverDraft.updatedAt).getTime()
    ? localDraft
    : serverDraft;
}

export function CatalogReviewWorkbench({
  runId,
  returnPath,
  initialReviewState,
  productTitle,
  providerLabel,
  promptVersionLabel,
  draftModeLabel,
  highlightCount,
  attributeCount,
  fitmentCount
}: CatalogReviewWorkbenchProps) {
  const serverDraft = useMemo(() => toInitialDraftState(initialReviewState), [initialReviewState]);
  const [draft, setDraft] = useState<ReviewDraftState>(serverDraft);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageMode, setStorageMode] = useState<"server" | "local">("server");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(getStorageKey(runId));
      const globalOperatorLabel = getStoredOperatorLabel();

      if (!stored) {
        setDraft(applyOperatorDefault(serverDraft, globalOperatorLabel));
        setStorageMode("server");
      } else {
        const parsed = normalizeDraftState(JSON.parse(stored) as Partial<ReviewDraftState>);
        const newestDraft = applyOperatorDefault(pickNewestDraft(serverDraft, parsed), globalOperatorLabel);
        setDraft(newestDraft);
        setStorageMode(newestDraft.updatedAt === parsed.updatedAt ? "local" : "server");
      }
    } catch {
      setDraft(applyOperatorDefault(serverDraft, getStoredOperatorLabel()));
      setStorageMode("server");
    } finally {
      setIsHydrated(true);
    }
  }, [runId, serverDraft]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(getStorageKey(runId), JSON.stringify(draft));
  }, [draft, isHydrated, runId]);

  useEffect(() => {
    function handleOperatorProfileUpdate() {
      const globalOperatorLabel = getStoredOperatorLabel();

      if (!globalOperatorLabel) {
        return;
      }

      setDraft((current) => applyOperatorDefault(current, globalOperatorLabel));
    }

    window.addEventListener(OPERATOR_PROFILE_UPDATED_EVENT, handleOperatorProfileUpdate);
    return () => window.removeEventListener(OPERATOR_PROFILE_UPDATED_EVENT, handleOperatorProfileUpdate);
  }, []);

  const completedCount = useMemo(
    () => CHECKLIST_ITEMS.filter((item) => draft.checklist[item.id]).length,
    [draft.checklist]
  );
  const completionPercent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);
  const noteLineCount = draft.notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
  const readyForAction = completedCount >= 4 && draft.notes.trim().length > 0;
  const hasServerSnapshot = Boolean(initialReviewState.updatedAt);
  const saveAction = saveCatalogReviewWorkspaceAction.bind(null, runId, returnPath);

  function updateChecklist(id: ChecklistId, checked: boolean) {
    setDraft((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [id]: checked
      },
      updatedAt: new Date().toISOString()
    }));
    setStorageMode("local");
  }

  function updateNotes(value: string) {
    setDraft((current) => ({
      ...current,
      notes: value,
      updatedAt: new Date().toISOString()
    }));
    setStorageMode("local");
  }

  function updateOperatorLabel(value: string) {
    setDraft((current) => ({
      ...current,
      operatorLabel: value,
      updatedAt: new Date().toISOString()
    }));
    setStorageMode("local");
  }

  function appendQuickNote(snippet: string) {
    setDraft((current) => ({
      ...current,
      notes: current.notes.trim().length > 0 ? `${current.notes.trim()}\n- ${snippet}` : `- ${snippet}`,
      updatedAt: new Date().toISOString()
    }));
    setStorageMode("local");
  }

  function resetDraft() {
    setDraft({
      ...serverDraft,
      updatedAt: new Date().toISOString()
    });
    setStorageMode("local");
  }

  return (
    <form action={saveAction} className="list-stack">
      <div className="list-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workbench</p>
            <h3>Operator review draft</h3>
          </div>
          <span className={`status-pill ${readyForAction ? "status-success" : "status-pending"}`}>
            {readyForAction ? "ready for action" : "in review"}
          </span>
        </div>

        <div className="review-progress">
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="definition-list">
            <div className="definition-row">
              <span>Checklist progress</span>
              <strong>
                {completedCount}/{CHECKLIST_ITEMS.length} complete
              </strong>
            </div>
            <div className="definition-row">
              <span>Operator notes</span>
              <strong>{noteLineCount} line(s)</strong>
            </div>
            <div className="definition-row">
              <span>Draft source</span>
              <strong>
                {storageMode === "local"
                  ? "Local draft in this browser"
                  : hasServerSnapshot
                    ? "PostgreSQL workspace snapshot"
                    : "Unsaved local draft"}
              </strong>
            </div>
            <div className="definition-row">
              <span>Last updated</span>
              <strong>{formatDate(draft.updatedAt)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="list-card">
        <strong>Review checklist</strong>
        <div className="checklist-stack">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.id} className="checklist-item">
              <input
                type="checkbox"
                name={`checklist_${item.id}`}
                value="true"
                checked={draft.checklist[item.id]}
                onChange={(event) => updateChecklist(item.id, event.currentTarget.checked)}
              />
              <div className="checklist-copy">
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="list-card">
        <strong>Operator notes</strong>
        <p className="list-meta">
          Edit locally as you review {productTitle}, then save to persist this draft in PostgreSQL.
        </p>

        <label className="filter-field note-field">
          <span>Operator label</span>
          <input
            type="text"
            name="operatorLabel"
            value={draft.operatorLabel}
            onChange={(event) => updateOperatorLabel(event.currentTarget.value)}
            placeholder="Local operator"
          />
        </label>

        <div className="chip-row">
          {QUICK_NOTES.map((item) => (
            <button
              key={item.label}
              type="button"
              className="action-button action-queue"
              onClick={() => appendQuickNote(item.note)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="filter-field note-field">
          <span>Review notes</span>
          <textarea
            name="notes"
            className="note-textarea"
            value={draft.notes}
            onChange={(event) => updateNotes(event.currentTarget.value)}
            placeholder="Capture what needs to change before this run should be queued, cancelled, or marked ready."
            rows={8}
          />
        </label>

        <div className="filter-actions">
          <button type="button" className="action-button" onClick={resetDraft}>
            Reset to latest saved draft
          </button>
          <FormSubmitButton
            className="action-button action-approve"
            idleLabel="Save review draft"
            pendingLabel="Saving review draft..."
          />
          <span className="filter-result-count">Local changes are cached in this browser while you work.</span>
        </div>
      </div>

      <div className="list-card">
        <strong>Review summary</strong>
        <div className="definition-list">
          <div className="definition-row">
            <span>Provider state</span>
            <strong>{providerLabel}</strong>
          </div>
          <div className="definition-row">
            <span>Prompt version</span>
            <strong>{promptVersionLabel}</strong>
          </div>
          <div className="definition-row">
            <span>Draft source</span>
            <strong>{draftModeLabel}</strong>
          </div>
          <div className="definition-row">
            <span>Highlights ready</span>
            <strong>{highlightCount}</strong>
          </div>
          <div className="definition-row">
            <span>Attributes normalized</span>
            <strong>{attributeCount}</strong>
          </div>
          <div className="definition-row">
            <span>Fitment signals</span>
            <strong>{fitmentCount}</strong>
          </div>
        </div>
      </div>
    </form>
  );
}
