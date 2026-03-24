"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BulkSelectionToggleProps = {
  disabled?: boolean;
  group: string;
};

function getGroupCheckboxes(group: string) {
  return [...document.querySelectorAll<HTMLInputElement>(`input[data-bulk-group="${group}"]`)].filter(
    (input) => !input.disabled
  );
}

export function BulkSelectionToggle({ disabled = false, group }: BulkSelectionToggleProps) {
  const [selectionState, setSelectionState] = useState<"none" | "some" | "all">("none");
  const checkboxId = useMemo(() => `bulk-toggle-${group.replace(/[^a-z0-9_-]/gi, "-")}`, [group]);
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function syncSelectionState() {
      if (disabled) {
        setSelectionState("none");
        return;
      }

      const checkboxes = getGroupCheckboxes(group);
      const selectedCount = checkboxes.filter((input) => input.checked).length;

      if (selectedCount === 0) {
        setSelectionState("none");
        return;
      }

      setSelectionState(selectedCount === checkboxes.length ? "all" : "some");
    }

    syncSelectionState();

    function handleChange(event: Event) {
      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target.dataset.bulkGroup === group) {
        syncSelectionState();
      }
    }

    document.addEventListener("change", handleChange);
    return () => document.removeEventListener("change", handleChange);
  }, [disabled, group]);

  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.indeterminate = selectionState === "some";
    }
  }, [selectionState]);

  function handleToggle(checked: boolean) {
    for (const input of getGroupCheckboxes(group)) {
      input.checked = checked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  return (
    <label className="bulk-toggle" htmlFor={checkboxId}>
      <input
        ref={toggleRef}
        id={checkboxId}
        type="checkbox"
        checked={selectionState === "all"}
        disabled={disabled}
        aria-label="Select all visible rows"
        onChange={(event) => handleToggle(event.currentTarget.checked)}
      />
      <span>Select all visible</span>
    </label>
  );
}
