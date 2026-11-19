import type { ItemInstance } from "../shared/items.js";
import type { ActiveStatusEffect } from "../shared/statusEffects.js";
import type {
  Id,
  PartyMode,
  RaidOutcome,
  ZombieAiState,
} from "../shared/types.js";
import type { Vec2 } from "../shared/maps.js";

/** In-raid only. Cleared or settled when the raid ends (đề cương §11). */
export interface RaidPlayerState {
  playerId: Id;
  position: Vec2;
  hp: number;
  stamina: number;
  carried: ItemInstance[];
  statusEffects: ActiveStatusEffect[];
  isDowned: boolean;
  hasExtracted: boolean;
}

export interface RaidZombieState {
  id: Id;
  position: Vec2;
  aiState: ZombieAiState;
  targetPlayerId?: Id;
}

export interface RaidSurvivorNpcState {
  id: Id;
  spawnDefinitionId: Id;
  displayName: string;
  position: Vec2;
  hp: number;
  /** First interacting party claims escort (đề cương §4 khuyến nghị). */
  escortClaimPlayerId?: Id;
  isEscorting: boolean;
  hasExtracted: boolean;
}

export interface RaidExtractionRuntime {
  definitionId: Id;
  isActive: boolean;
  holdRemainingSeconds: number;
  extractedPlayerIds: Id[];
  extractedNpcIds: Id[];
}

export interface RaidState {
  id: Id;
  mapId: Id;
  partyMode: PartyMode;
  startedAtIso: string;
  timeRemainingSeconds: number;
  weather: "clear" | "rain" | "flood_risk";
  players: RaidPlayerState[];
  zombies: RaidZombieState[];
  survivors: RaidSurvivorNpcState[];
  extractions: RaidExtractionRuntime[];
  outcome?: RaidOutcome;
}

export interface RaidResult {
  raidId: Id;
  outcome: RaidOutcome;
  /** Loot successfully brought out, keyed by playerId. */
  extractedLootByPlayer: Record<string, ItemInstance[]>;
  /** NPC ids that extracted alive with the claiming escort. */
  rescuedNpcIds: Id[];
  /** NPCs left behind / dead — rescue failed. */
  failedNpcIds: Id[];
  notes: string[];
}
