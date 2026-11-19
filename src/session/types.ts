import type { Id, PartyMode } from "../shared/types.js";

/** Session layer stubs — expand when co-op lands (đề cương §4, §11). */
export interface PartyMember {
  playerId: Id;
  organizationId: Id;
  /** True when invited from an allied organization. */
  isAllianceGuest: boolean;
}

export interface Party {
  id: Id;
  mode: PartyMode;
  hostPlayerId: Id;
  members: PartyMember[];
  /** Soft cap for prototype; finalize later. */
  maxSize: number;
}

export function createSoloParty(playerId: Id, organizationId: Id): Party {
  return {
    id: crypto.randomUUID(),
    mode: "solo",
    hostPlayerId: playerId,
    members: [
      { playerId, organizationId, isAllianceGuest: false },
    ],
    maxSize: 1,
  };
}
