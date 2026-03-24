"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  className: string;
  idleLabel: string;
  pendingLabel: string;
};

export function FormSubmitButton({
  className,
  idleLabel,
  pendingLabel
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
