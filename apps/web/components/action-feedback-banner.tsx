import type { ActionFeedback } from "@/lib/action-feedback";

type ActionFeedbackBannerProps = {
  feedback: ActionFeedback;
};

export function ActionFeedbackBanner({ feedback }: ActionFeedbackBannerProps) {
  return (
    <div className={`banner-card banner-${feedback.tone}`}>
      <strong>{feedback.title}</strong>
      <p>{feedback.detail}</p>
    </div>
  );
}
