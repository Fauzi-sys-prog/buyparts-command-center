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
        <button type="submit" className="action-button action-queue">
          Queue
        </button>
      </form>
      <form action={cancelAction} className="action-form">
        <button type="submit" className="action-button action-reject">
          Cancel
        </button>
      </form>
    </div>
  );
}
