import type { Id, StatusEffectKind } from "./types.js";

/**
 * Status effect: nguyên nhân → ảnh hưởng → cách xử lý (đề cương §6).
 * Prototype starts with bleeding + exhaustion; dehydration is stubbed for later.
 */
export interface StatusEffectDefinition {
  kind: StatusEffectKind;
  name: string;
  /** What causes this in the world. */
  causes: readonly string[];
  /** Gameplay impact summary for UI / design. */
  effects: readonly string[];
  /** Item definition IDs or rest actions that treat it. */
  treatments: readonly string[];
  /** Max intensity before character goes down / soft-lock. */
  maxIntensity: number;
  /** If true, intensity ticks down over time without treatment. */
  decaysNaturally: boolean;
  tickIntervalSeconds: number;
}

export interface ActiveStatusEffect {
  kind: StatusEffectKind;
  intensity: number;
  source: string;
  appliedAtRaidTimeSeconds: number;
  /** Remaining seconds until next tick; systems own the countdown. */
  nextTickInSeconds: number;
}

export const STATUS_EFFECT_DEFINITIONS: Readonly<
  Record<StatusEffectKind, StatusEffectDefinition>
> = {
  bleeding: {
    kind: "bleeding",
    name: "Chảy máu",
    causes: [
      "zombie_scratch",
      "zombie_bite",
      "gunshot",
      "broken_glass",
      "barbed_wire",
    ],
    effects: ["hp_drain_over_time", "can_cause_downed_if_severe"],
    treatments: ["bandage", "medkit"],
    maxIntensity: 5,
    decaysNaturally: false,
    tickIntervalSeconds: 2,
  },
  exhaustion: {
    kind: "exhaustion",
    name: "Kiệt sức",
    causes: [
      "prolonged_sprint",
      "climbing",
      "swimming",
      "heavy_load",
      "heat_exposure",
    ],
    effects: ["reduced_max_stamina", "slower_stamina_regen"],
    treatments: ["rest", "bottled_water", "reduce_load"],
    maxIntensity: 4,
    decaysNaturally: true,
    tickIntervalSeconds: 5,
  },
  dehydration: {
    kind: "dehydration",
    name: "Mất nước",
    causes: ["no_water", "heat_humidity", "long_exertion", "fever"],
    effects: ["reduced_stamina", "slower_recovery"],
    treatments: ["bottled_water"],
    maxIntensity: 4,
    decaysNaturally: false,
    tickIntervalSeconds: 10,
  },
};

export function getStatusEffectDefinition(
  kind: StatusEffectKind,
): StatusEffectDefinition {
  return STATUS_EFFECT_DEFINITIONS[kind];
}

export function createActiveStatusEffect(
  kind: StatusEffectKind,
  source: string,
  raidTimeSeconds: number,
  intensity = 1,
): ActiveStatusEffect {
  const def = getStatusEffectDefinition(kind);
  const clamped = Math.min(Math.max(intensity, 1), def.maxIntensity);
  return {
    kind,
    intensity: clamped,
    source,
    appliedAtRaidTimeSeconds: raidTimeSeconds,
    nextTickInSeconds: def.tickIntervalSeconds,
  };
}

/** Returns true if any treatment item in inventory can clear/reduce the effect. */
export function canTreatWithItem(
  kind: StatusEffectKind,
  itemDefinitionId: Id,
): boolean {
  return getStatusEffectDefinition(kind).treatments.includes(itemDefinitionId);
}
