import type { Id } from "../shared/types.js";

/**
 * Alliance / conflict stubs for later phases (đề cương §9, §12 bước 5–6).
 * Kept in the foundation so Organization can attach without redesign.
 */
export interface Alliance {
  id: Id;
  name: string;
  organizationIds: Id[];
}

export interface ConflictState {
  id: Id;
  allianceAId: Id;
  allianceBId: Id;
  objective: string;
  endsAtIso: string;
  rewardSummary: string;
}

export function createAlliance(
  id: Id,
  name: string,
  organizationIds: Id[],
): Alliance {
  return { id, name, organizationIds: [...organizationIds] };
}

export function canInviteAllianceMember(
  alliance: Alliance,
  hostOrgId: Id,
  guestOrgId: Id,
): boolean {
  return (
    alliance.organizationIds.includes(hostOrgId) &&
    alliance.organizationIds.includes(guestOrgId) &&
    hostOrgId !== guestOrgId
  );
}
