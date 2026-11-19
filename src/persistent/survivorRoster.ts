import type { Id } from "../shared/types.js";

/**
 * Survivors who were successfully extracted and accepted into the organization.
 * Skills/needs can expand later (đề cương §4, §9).
 */
export interface RosterSurvivor {
  id: Id;
  displayName: string;
  /** Origin map / rescue spawn id for narrative tracking. */
  rescuedFrom: string;
  joinedAtIso: string;
  health: number;
  notes: string[];
}

export interface SurvivorRoster {
  members: RosterSurvivor[];
}

export function createEmptyRoster(): SurvivorRoster {
  return { members: [] };
}

export function acceptSurvivor(
  roster: SurvivorRoster,
  survivor: Omit<RosterSurvivor, "joinedAtIso"> & { joinedAtIso?: string },
): RosterSurvivor {
  if (roster.members.some((m) => m.id === survivor.id)) {
    throw new Error(`Survivor already in roster: ${survivor.id}`);
  }
  const entry: RosterSurvivor = {
    ...survivor,
    joinedAtIso: survivor.joinedAtIso ?? new Date().toISOString(),
  };
  roster.members.push(entry);
  return entry;
}

export function rosterSize(roster: SurvivorRoster): number {
  return roster.members.length;
}
