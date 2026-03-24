export const OPERATOR_PROFILE_STORAGE_KEY = "buyparts.operator-profile";
export const OPERATOR_PROFILE_UPDATED_EVENT = "buyparts:operator-profile-updated";

export type OperatorProfile = {
  displayName: string;
  updatedAt: string | null;
};

export function normalizeOperatorProfile(input: Partial<OperatorProfile> | null | undefined): OperatorProfile {
  return {
    displayName:
      typeof input?.displayName === "string" && input.displayName.trim().length > 0
        ? input.displayName.trim()
        : "Local operator",
    updatedAt: input?.updatedAt ?? null
  };
}
