import { FormSubmitButton } from "@/components/form-submit-button";
import { OperatorProfileHiddenInput } from "@/components/operator-profile-hidden-input";
import {
  cancelCatalogRunAction,
  queueCatalogRunAction
} from "@/lib/catalog-run-actions";

type CatalogRunActionsProps = {
  runId: string;
  returnPath: string;
};

export function CatalogRunActions({ runId, returnPath }: CatalogRunActionsProps) {
  const queueAction = queueCatalogRunAction.bind(null, runId, returnPath);
  const cancelAction = cancelCatalogRunAction.bind(null, runId, returnPath);

  return (
    <div className="action-row">
      <form action={queueAction} className="action-form">
        <OperatorProfileHiddenInput />
        <FormSubmitButton
          className="action-button action-queue"
          idleLabel="Queue"
          pendingLabel="Queueing..."
        />
      </form>
      <form action={cancelAction} className="action-form">
        <OperatorProfileHiddenInput />
        <FormSubmitButton
          className="action-button action-reject"
          idleLabel="Cancel"
          pendingLabel="Cancelling..."
        />
      </form>
    </div>
  );
}
