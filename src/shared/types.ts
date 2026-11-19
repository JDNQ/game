/** Core IDs and enums shared across Persistent World and Raid. */

export type Id = string;

export type ItemCategory =
  | "medical"
  | "survival"
  | "ammo"
  | "weapon"
  | "tool"
  | "quest"
  | "material";

export type StatusEffectKind = "bleeding" | "exhaustion" | "dehydration";

export type ZombieAiState =
  | "wander"
  | "suspicious"
  | "chase"
  | "search"
  | "return";

export type RaidOutcome = "success" | "partial" | "failure";

export type PartyMode = "solo" | "friends" | "alliance";

export interface WeightedValue {
  weightKg: number;
  /** Grid/slot cost when inventory uses size limits. */
  size: number;
}
