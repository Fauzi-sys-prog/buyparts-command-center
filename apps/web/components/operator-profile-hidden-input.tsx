"use client";

import { useEffect, useState } from "react";

import {
  OPERATOR_PROFILE_STORAGE_KEY,
  OPERATOR_PROFILE_UPDATED_EVENT,
  normalizeOperatorProfile
} from "@/lib/operator-profile";

type OperatorProfileHiddenInputProps = {
  name?: string;
};

export function OperatorProfileHiddenInput({
  name = "operatorLabel"
}: OperatorProfileHiddenInputProps) {
  const [operatorLabel, setOperatorLabel] = useState("Local operator");

  useEffect(() => {
    function syncProfile() {
      try {
        const rawValue = window.localStorage.getItem(OPERATOR_PROFILE_STORAGE_KEY);

        if (!rawValue) {
          setOperatorLabel("Local operator");
          return;
        }

        const parsed = JSON.parse(rawValue) as { displayName?: string; updatedAt?: string | null };
        setOperatorLabel(normalizeOperatorProfile(parsed).displayName);
      } catch {
        setOperatorLabel("Local operator");
      }
    }

    syncProfile();
    window.addEventListener(OPERATOR_PROFILE_UPDATED_EVENT, syncProfile);

    return () => {
      window.removeEventListener(OPERATOR_PROFILE_UPDATED_EVENT, syncProfile);
    };
  }, []);

  return <input type="hidden" name={name} value={operatorLabel} readOnly />;
}
