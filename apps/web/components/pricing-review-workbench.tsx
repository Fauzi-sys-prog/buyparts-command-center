"use client";

import { useEffect, useMemo, useState } from "react";

import { FormSubmitButton } from "@/components/form-submit-button";
import type { SkuPricingHistoryItem } from "@/lib/api";
import {
  normalizeOperatorProfile,
  OPERATOR_PROFILE_STORAGE_KEY,
  OPERATOR_PROFILE_UPDATED_EVENT
} from "@/lib/operator-profile";
import { savePricingReviewWorkspaceAction } from "@/lib/pricing-review-workspace-actions";

type ChecklistId = "margin" | "inventory" | "velocity" | "rationale";

type PricingReviewWorkbenchProps = {
  recommendationId: string;
  returnPath: string;
  reviewState: SkuPricingHistoryItem["reviewState"];
  skuLabel: string;
  changeLabel: string;
  confidenceLabel: string;
};

type DraftState = {
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
    id: "margin",
    label: "Margin impact reviewed",
    detail: "Sanity-check whether the new recommendation still feels safe for margin guardrails."
  },
  {
    id: "inventory",
    label: "Inventory context reviewed",
    detail: "Use stock position to decide whether the recommendation should move faster or slower."
  },
  {
    id: "velocity",
    label: "Sales velocity reviewed",
    detail: "Confirm that recent sell-through supports the proposed pricing direction."
  },
  {
    id: "rationale",
    label: "Reasoning and notes captured",
    detail: "Leave notes that explain why this recommendation is good to approve or reject."
  }
];

const QUICK_NOTES = [
  {
    label: "Margin",
    note: "Margin still needs validation before approving this price change."
  },
  {
    label: "Inventory",
    note: "Inventory is tight, so a more defensive pricing stance may make sense."
  },
  {
    label: "Velocity",
    note: "Sell-through looks healthy enough to test this recommendation."
  },
  {
    label: "Ready",
    note: "Operator review complete and ready for a pricing decision."
  }
];

function getStorageKey(recommendationId: string) {
  return `buyparts.pricing-review.${recommendationId}`;
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

function normalizeDraftState(input: Partial<DraftState>): DraftState {
  return {
    checklist: {
      margin: input.checklist?.margin === true,
      inventory: input.checklist?.inventory === true,
      velocity: input.checklist?.velocity === true,
      rationale: input.checklist?.rationale === true
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

function applyOperatorDefault(draft: DraftState, operatorLabel: string | null) {
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

function toInitialDraftState(reviewState: SkuPricingHistoryItem["reviewState"]): DraftState {
  return normalizeDraftState({
    checklist: reviewState.checklist,
    notes: reviewState.notes,
    operatorLabel: reviewState.operatorLabel ?? "Local operator",
    updatedAt: reviewState.updatedAt
  });
}

function pickNewestDraft(serverDraft: DraftState, localDraft: DraftState | null): DraftState {
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

export function PricingReviewWorkbench({
  recommendationId,
  returnPath,
  reviewState,
  skuLabel,
  changeLabel,
  confidenceLabel
}: PricingReviewWorkbenchProps) {
  const serverDraft = useMemo(() => toInitialDraftState(reviewState), [reviewState]);
  const [draft, setDraft] = useState<DraftState>(serverDraft);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageMode, setStorageMode] = useState<"server" | "local">("server");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(getStorageKey(recommendationId));
      const globalOperatorLabel = getStoredOperatorLabel();

      if (!stored) {
        setDraft(applyOperatorDefault(serverDraft, globalOperatorLabel));
        setStorageMode("server");
      } else {
        const parsed = normalizeDraftState(JSON.parse(stored) as Partial<DraftState>);
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
  }, [recommendationId, serverDraft]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(getStorageKey(recommendationId), JSON.stringify(draft));
  }, [draft, isHydrated, recommendationId]);

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
  const saveAction = savePricingReviewWorkspaceAction.bind(null, recommendationId, returnPath);
  const hasServerSnapshot = Boolean(reviewState.updatedAt);

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

  function appendQuickNote(note: string) {
    setDraft((current) => ({
      ...current,
      notes: current.notes.trim().length > 0 ? `${current.notes.trim()}\n- ${note}` : `- ${note}`,
      updatedAt: new Date().toISOString()
    }));
    setStorageMode("local");
  }

  function resetToServerSnapshot() {
    const nextDraft = applyOperatorDefault(serverDraft, getStoredOperatorLabel());
    setDraft(nextDraft);
    setStorageMode("server");
    window.localStorage.setItem(getStorageKey(recommendationId), JSON.stringify(nextDraft));
  }

  return (
    <div className="review-progress pricing-review-workbench">
      <div className="list-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pricing Review</p>
            <h3>Operator review draft</h3>
          </div>
          <span className="status-pill status-medium">{completionPercent}% ready</span>
        </div>

        <p className="hero-copy">
          {skuLabel} · {changeLabel} · {confidenceLabel}
        </p>

        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>

        <div className="definition-list">
          <div className="definition-row">
            <span>Checklist complete</span>
            <strong>
              {completedCount}/{CHECKLIST_ITEMS.length}
            </strong>
          </div>
          <div className="definition-row">
            <span>Notes lines</span>
            <strong>{noteLineCount}</strong>
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
            <span>Last saved</span>
            <strong>{formatDate(reviewState.updatedAt)}</strong>
          </div>
        </div>
      </div>

      <div className="checklist-stack">
        {CHECKLIST_ITEMS.map((item) => (
          <label key={item.id} className="checklist-item">
            <input
              type="checkbox"
              checked={draft.checklist[item.id]}
              onChange={(event) => updateChecklist(item.id, event.target.checked)}
            />
            <div className="checklist-copy">
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="chip-row">
        {QUICK_NOTES.map((item) => (
          <button
            key={item.label}
            type="button"
            className="chip button-reset"
            onClick={() => appendQuickNote(item.note)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form action={saveAction} className="list-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Operator notes</p>
            <h3>Persist review context</h3>
          </div>
        </div>

        {CHECKLIST_ITEMS.map((item) => (
          <input
            key={item.id}
            type="hidden"
            name={`checklist_${item.id}`}
            value={draft.checklist[item.id] ? "true" : "false"}
            readOnly
          />
        ))}

        <label className="operator-field">
          <span>Operator</span>
          <input
            type="text"
            name="operatorLabel"
            value={draft.operatorLabel}
            onChange={(event) => updateOperatorLabel(event.target.value)}
          />
        </label>

        <label className="note-field">
          <span className="eyebrow">Notes</span>
          <textarea
            name="notes"
            className="note-textarea"
            value={draft.notes}
            onChange={(event) => updateNotes(event.target.value)}
            placeholder="Capture pricing reasoning, risk notes, or follow-up needed before deciding."
          />
        </label>

        <div className="chip-row">
          <span className="chip">{hasServerSnapshot ? "Server snapshot available" : "No server snapshot yet"}</span>
          <span className="chip">{reviewState.operatorLabel ?? "No saved operator yet"}</span>
        </div>

        <div className="filter-actions">
          <FormSubmitButton
            className="action-button action-queue"
            idleLabel="Save pricing review draft"
            pendingLabel="Saving..."
          />
          <button type="button" className="text-link button-reset" onClick={resetToServerSnapshot}>
            Reset to saved draft
          </button>
        </div>
      </form>
    </div>
  );
}
