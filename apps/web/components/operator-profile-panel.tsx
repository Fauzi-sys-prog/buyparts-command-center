"use client";

import { useEffect, useState } from "react";

import {
  normalizeOperatorProfile,
  OPERATOR_PROFILE_STORAGE_KEY,
  OPERATOR_PROFILE_UPDATED_EVENT
} from "@/lib/operator-profile";

function formatDate(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function OperatorProfilePanel() {
  const [displayName, setDisplayName] = useState("Local operator");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(OPERATOR_PROFILE_STORAGE_KEY);

      if (stored) {
        const profile = normalizeOperatorProfile(JSON.parse(stored));
        setDisplayName(profile.displayName);
        setUpdatedAt(profile.updatedAt);
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  function saveProfile() {
    const profile = normalizeOperatorProfile({
      displayName,
      updatedAt: new Date().toISOString()
    });

    setDisplayName(profile.displayName);
    setUpdatedAt(profile.updatedAt);
    window.localStorage.setItem(OPERATOR_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent(OPERATOR_PROFILE_UPDATED_EVENT, { detail: profile }));
    setIsEditing(false);
  }

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("") || "BP";

  return (
    <div className="operator-panel">
      <div className="operator-summary">
        <div className="operator-copy">
          <strong>{displayName}</strong>
          <p className="operator-role">Internal Operator</p>
          <p className="operator-caption">
            {hydrated ? `Saved locally · ${formatDate(updatedAt)}` : "Loading local profile"}
          </p>
        </div>

        <div className="operator-avatar" aria-hidden="true">
          {initials}
        </div>

        <button
          type="button"
          className="operator-toggle"
          onClick={() => setIsEditing((current) => !current)}
        >
          {isEditing ? "Close" : "Edit"}
        </button>
      </div>

      {isEditing ? (
        <div className="operator-panel-controls">
          <label className="operator-field">
            <span>Name</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.currentTarget.value)}
              placeholder="Local operator"
            />
          </label>
          <button type="button" className="action-button action-queue" onClick={saveProfile}>
            Save
          </button>
        </div>
      ) : null}
    </div>
  );
}
