import {
  approvePricingRecommendationAction,
  rejectPricingRecommendationAction
} from "@/lib/pricing-review-actions";

type PricingReviewActionsProps = {
  recommendationId: string;
  returnPath: string;
};

export function PricingReviewActions({
  recommendationId,
  returnPath
}: PricingReviewActionsProps) {
  const approveAction = approvePricingRecommendationAction.bind(
    null,
    recommendationId,
    returnPath
  );
  const rejectAction = rejectPricingRecommendationAction.bind(
    null,
    recommendationId,
    returnPath
  );

  return (
    <div className="action-row">
      <form action={approveAction} className="action-form">
        <button type="submit" className="action-button action-approve">
          Approve
        </button>
      </form>
      <form action={rejectAction} className="action-form">
        <button type="submit" className="action-button action-reject">
          Reject
        </button>
      </form>
    </div>
  );
}
