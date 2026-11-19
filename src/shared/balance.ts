/**
 * Tunable numbers for the prototype. Keep combat/AI numbers out of hardcoded
 * systems so designers can iterate without touching logic.
 */
export const BALANCE = {
  player: {
    maxHp: 100,
    maxStamina: 100,
    baseCarryWeightKg: 25,
    walkSpeed: 3.2,
    sprintSpeed: 5.6,
    sprintStaminaCostPerSecond: 12,
    staminaRegenPerSecond: 8,
  },
  inventory: {
    /** Soft overload: above this ratio of carry weight, apply exhaustion risk. */
    overloadRatio: 0.85,
  },
  combat: {
    pistolDamage: 28,
    pistolNoiseRadius: 35,
    meleeNoiseRadius: 8,
  },
  zombie: {
    detectVisionRange: 14,
    detectHearingScale: 1,
    walkSpeed: 1.6,
    chaseSpeed: 3.4,
    scratchDamage: 12,
    biteDamage: 22,
    scratchBleedChance: 0.55,
    biteBleedChance: 0.85,
  },
  status: {
    bleedingHpLossPerIntensityPerTick: 2,
    exhaustionStaminaPenaltyPerIntensity: 0.12,
  },
  raid: {
    /** On full failure, carried items are lost (đề cương §10 — luật báo trước). */
    failureLosesCarriedLoot: true,
    /** Equipped weapon may be kept on failure for softer early prototype. */
    failureKeepsOneEquippedWeapon: true,
  },
  shelter: {
    dailyWaterPerSurvivor: 1,
    dailyFoodPerSurvivor: 1,
  },
} as const;

export type BalanceConfig = typeof BALANCE;
