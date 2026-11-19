import type { Id } from "../shared/types.js";
import {
  createEmptyRoster,
  type SurvivorRoster,
} from "./survivorRoster.js";

export interface Organization {
  id: Id;
  name: string;
  /** Player IDs that belong to this community. */
  memberPlayerIds: Id[];
  /** Safety level 0–100; prototype placeholder for future shelter threats. */
  safety: number;
  roster: SurvivorRoster;
}

export function createOrganization(
  id: Id,
  name: string,
  founderPlayerId: Id,
): Organization {
  return {
    id,
    name,
    memberPlayerIds: [founderPlayerId],
    safety: 40,
    roster: createEmptyRoster(),
  };
}

export function addPlayerToOrganization(
  org: Organization,
  playerId: Id,
): void {
  if (!org.memberPlayerIds.includes(playerId)) {
    org.memberPlayerIds.push(playerId);
  }
}
