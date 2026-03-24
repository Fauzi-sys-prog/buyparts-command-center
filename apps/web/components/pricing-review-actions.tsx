import { FormSubmitButton } from "@/components/form-submit-button";
import { OperatorProfileHiddenInput } from "@/components/operator-profile-hidden-input";
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
        <OperatorProfileHiddenInput />
        <FormSubmitButton
          className="action-button action-approve"
          idleLabel="Approve"
          pendingLabel="Approving..."
        />
      </form>
      <form action={rejectAction} className="action-form">
        <OperatorProfileHiddenInput />
        <FormSubmitButton
          className="action-button action-reject"
          idleLabel="Reject"
          pendingLabel="Rejecting..."
        />
      </form>
    </div>
  );
}
