export type ActionFeedbackTone = "success" | "warning" | "error";

export type ActionFeedback = {
  tone: ActionFeedbackTone;
  title: string;
  detail: string;
};

type FeedbackScope = "pricing" | "catalog";
type FeedbackAction = "approve" | "reject" | "queue" | "cancel" | "save";
type FeedbackOutcome =
  | "success"
  | "conflict"
  | "missing"
  | "unavailable"
  | "error"
  | "empty"
  | "partial";

type SearchParamValue = string | string[] | undefined;

type SearchParamRecord = Record<string, SearchParamValue>;

type FeedbackDescriptor = {
  scope: FeedbackScope;
  action: FeedbackAction;
  outcome: FeedbackOutcome;
  count?: number;
  total?: number;
};

const FEEDBACK_PARAM = "feedback";
const FEEDBACK_COUNT_PARAM = "feedbackCount";
const FEEDBACK_TOTAL_PARAM = "feedbackTotal";

function getSingleValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isFeedbackDescriptor(value: string): value is `${FeedbackScope}:${FeedbackAction}:${FeedbackOutcome}` {
  const parts = value.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [scope, action, outcome] = parts;

  return (
    (scope === "pricing" || scope === "catalog") &&
    (action === "approve" ||
      action === "reject" ||
      action === "queue" ||
      action === "cancel" ||
      action === "save") &&
    (outcome === "success" ||
      outcome === "conflict" ||
      outcome === "missing" ||
      outcome === "unavailable" ||
      outcome === "error" ||
      outcome === "empty" ||
      outcome === "partial")
  );
}

function parsePositiveInteger(value: SearchParamValue) {
  const singleValue = getSingleValue(value);

  if (!singleValue) {
    return undefined;
  }

  const parsed = Number.parseInt(singleValue, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function getItemLabel(scope: FeedbackScope, count: number) {
  const singular = scope === "pricing" ? "pricing recommendation" : "catalog run";
  return count === 1 ? singular : `${singular}s`;
}

function getActionLabel(scope: FeedbackScope, action: FeedbackAction) {
  if (scope === "pricing") {
    if (action === "save") {
      return "save this pricing review draft";
    }

    return action === "approve" ? "approve this pricing recommendation" : "reject this pricing recommendation";
  }

  if (action === "save") {
    return "save this review draft";
  }

  return action === "queue" ? "queue this catalog run" : "cancel this catalog run";
}

function buildFeedbackCopy({ scope, action, outcome, count, total }: FeedbackDescriptor): ActionFeedback {
  const actionLabel = getActionLabel(scope, action);
  const scopeLabel = scope === "pricing" ? "Pricing workflow" : "Catalog workflow";
  const effectiveCount = count ?? 1;
  const effectiveTotal = total ?? effectiveCount;
  const itemLabel = getItemLabel(scope, effectiveCount);
  const totalLabel = getItemLabel(scope, effectiveTotal);
  const pluralActionLabel =
    scope === "pricing"
      ? action === "save"
        ? "save the selected pricing review draft"
        : action === "approve"
          ? "approve the selected pricing recommendations"
          : "reject the selected pricing recommendations"
      : action === "save"
        ? "save the review draft"
        : action === "queue"
        ? "queue the selected catalog runs"
        : "cancel the selected catalog runs";

  if (outcome === "success") {
    if (scope === "pricing" && action === "save") {
      return {
        tone: "success",
        title: "Pricing review draft saved",
        detail:
          "The pricing checklist and operator notes are now stored in PostgreSQL for this recommendation."
      };
    }

    if (scope === "catalog" && action === "save") {
      return {
        tone: "success",
        title: "Review draft saved",
        detail:
          "The checklist and notes have been stored in PostgreSQL and the review timeline is up to date."
      };
    }

    if (scope === "pricing") {
      return {
        tone: "success",
        title:
          effectiveCount === 1
            ? action === "approve"
              ? "Pricing recommendation approved"
              : "Pricing recommendation rejected"
            : action === "approve"
              ? `${effectiveCount} pricing recommendations approved`
              : `${effectiveCount} pricing recommendations rejected`,
        detail:
          effectiveCount === 1
            ? action === "approve"
              ? "The review decision has been saved and the pricing queue is up to date."
              : "The rejection has been saved and the pricing queue is up to date."
            : `The selected ${itemLabel} were updated and the pricing queue is now in sync with those review decisions.`
      };
    }

    return {
      tone: "success",
      title:
        effectiveCount === 1
          ? action === "queue"
            ? "Catalog run queued"
            : "Catalog run cancelled"
          : action === "queue"
            ? `${effectiveCount} catalog runs queued`
            : `${effectiveCount} catalog runs cancelled`,
      detail:
        effectiveCount === 1
          ? action === "queue"
            ? "The catalog run is active in the queue again and will stay visible as pending work."
            : "The catalog run is no longer counted as pending work."
          : action === "queue"
            ? "The selected catalog runs are back in the queue and visible as active work."
            : "The selected catalog runs were removed from the pending workload."
    };
  }

  if (outcome === "partial") {
    return {
      tone: "warning",
      title: `${scopeLabel} partially updated`,
      detail:
        action === "save"
          ? "Part of the review draft could not be saved cleanly. Refresh the page and try saving again."
          : `Updated ${effectiveCount} of ${effectiveTotal} selected ${totalLabel}. Some rows could not be changed because they were already finalized, unavailable, or not fully configured.`
    };
  }

  if (outcome === "empty") {
    return {
      tone: "warning",
      title: `${scopeLabel} selection required`,
      detail: `Select at least one row before trying to ${pluralActionLabel}.`
    };
  }

  if (outcome === "conflict") {
    return {
      tone: "warning",
      title: `${scopeLabel} already changed`,
      detail:
        effectiveTotal > 1
          ? `None of the selected ${totalLabel} could be updated because a review decision had already been recorded.`
          : `We could not ${actionLabel} because another review decision has already been recorded.`
    };
  }

  if (outcome === "missing") {
    return {
      tone: "error",
      title: `${scopeLabel} item not found`,
      detail:
        effectiveTotal > 1
          ? `None of the selected ${totalLabel} could be updated because they no longer exist in the current environment.`
          : `We could not ${actionLabel} because the selected record no longer exists in the current environment.`
    };
  }

  if (outcome === "unavailable") {
    return {
      tone: "warning",
      title: `${scopeLabel} unavailable`,
      detail:
        effectiveTotal > 1
          ? `We could not update the selected ${totalLabel} because the API is not fully configured yet.`
          : `We could not ${actionLabel} because the API is not fully configured yet.`
    };
  }

  return {
    tone: "error",
    title: `${scopeLabel} update failed`,
    detail:
      effectiveTotal > 1
        ? `We could not update the selected ${totalLabel} because the request did not complete successfully.`
        : `We could not ${actionLabel} because the request did not complete successfully.`
  };
}

export function buildFeedbackRedirectPath(returnPath: string, descriptor: FeedbackDescriptor) {
  const [pathname, query = ""] = returnPath.split("?");
  const params = new URLSearchParams(query);

  params.set(FEEDBACK_PARAM, `${descriptor.scope}:${descriptor.action}:${descriptor.outcome}`);

  if (typeof descriptor.count === "number") {
    params.set(FEEDBACK_COUNT_PARAM, String(descriptor.count));
  } else {
    params.delete(FEEDBACK_COUNT_PARAM);
  }

  if (typeof descriptor.total === "number") {
    params.set(FEEDBACK_TOTAL_PARAM, String(descriptor.total));
  } else {
    params.delete(FEEDBACK_TOTAL_PARAM);
  }

  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export function getActionFeedback(searchParams: SearchParamRecord): ActionFeedback | null {
  const rawValue = getSingleValue(searchParams[FEEDBACK_PARAM]);

  if (!rawValue || !isFeedbackDescriptor(rawValue)) {
    return null;
  }

  const [scope, action, outcome] = rawValue.split(":") as [FeedbackScope, FeedbackAction, FeedbackOutcome];
  return buildFeedbackCopy({
    scope,
    action,
    outcome,
    count: parsePositiveInteger(searchParams[FEEDBACK_COUNT_PARAM]),
    total: parsePositiveInteger(searchParams[FEEDBACK_TOTAL_PARAM])
  });
}
