import type { Alliance, ConflictState } from "./alliance.js";
import type { Organization } from "./organization.js";
import type { PlayerProfile } from "./player.js";
import type { Shelter } from "./shelter.js";

/**
 * Persistent world snapshot. Raid data must NOT live here — settle into this
 * once via RaidResultService (đề cương §11 ranh giới dữ liệu).
 */
export interface PersistentWorldState {
  version: 1;
  savedAtIso: string;
  players: PlayerProfile[];
  organizations: Organization[];
  shelters: Shelter[];
  alliances: Alliance[];
  conflicts: ConflictState[];
  /** Prevents double-applying the same raid result after disconnect. */
  settledRaidIds: string[];
}

export function createEmptyWorld(): PersistentWorldState {
  return {
    version: 1,
    savedAtIso: new Date().toISOString(),
    players: [],
    organizations: [],
    shelters: [],
    alliances: [],
    conflicts: [],
    settledRaidIds: [],
  };
}

export function parseWorldJson(raw: string): PersistentWorldState {
  const parsed = JSON.parse(raw) as PersistentWorldState;
  if (parsed.version !== 1) {
    throw new Error(`Unsupported save version: ${String(parsed.version)}`);
  }
  return parsed;
}

export function serializeWorld(world: PersistentWorldState): string {
  world.savedAtIso = new Date().toISOString();
  return JSON.stringify(world, null, 2);
}

export function markRaidSettled(
  world: PersistentWorldState,
  raidId: string,
): boolean {
  if (world.settledRaidIds.includes(raidId)) {
    return false;
  }
  world.settledRaidIds.push(raidId);
  return true;
}
