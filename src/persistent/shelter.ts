import { BALANCE } from "../shared/balance.js";
import type { Id } from "../shared/types.js";
import {
  addItemToStorage,
  createStorage,
  removeItemFromStorage,
  type StorageContainer,
} from "./storage.js";
import type { SurvivorRoster } from "./survivorRoster.js";

/**
 * Between-raid hub: storage, care area, living area, loadout board (đề cương §9).
 */
export interface Shelter {
  id: Id;
  organizationId: Id;
  name: string;
  storage: StorageContainer;
  /** Simple upkeep counters for prototype visibility. */
  waterReserve: number;
  foodReserve: number;
  lastUpkeepIso: string;
}

export function createShelter(
  id: Id,
  organizationId: Id,
  name: string,
): Shelter {
  return {
    id,
    organizationId,
    name,
    storage: createStorage(`${id}:storage`, "Kho nơi trú ẩn", 200),
    waterReserve: 5,
    foodReserve: 5,
    lastUpkeepIso: new Date().toISOString(),
  };
}

/** Consume daily needs for rescued survivors; returns false if shortage. */
export function applyDailyUpkeep(
  shelter: Shelter,
  roster: SurvivorRoster,
  nowIso: string = new Date().toISOString(),
): { ok: boolean; waterUsed: number; foodUsed: number } {
  const heads = Math.max(1, roster.members.length);
  const waterUsed = heads * BALANCE.shelter.dailyWaterPerSurvivor;
  const foodUsed = heads * BALANCE.shelter.dailyFoodPerSurvivor;
  const ok =
    shelter.waterReserve >= waterUsed && shelter.foodReserve >= foodUsed;

  if (ok) {
    shelter.waterReserve -= waterUsed;
    shelter.foodReserve -= foodUsed;
  }
  shelter.lastUpkeepIso = nowIso;
  return { ok, waterUsed, foodUsed };
}

/** Deposit extracted loot into shelter storage; leftover stays in `remaining`. */
export function depositLootToShelter(
  shelter: Shelter,
  definitionId: Id,
  quantity: number,
): { deposited: number; remaining: number } {
  let left = quantity;
  let deposited = 0;
  while (left > 0) {
    if (!addItemToStorage(shelter.storage, definitionId, 1)) break;
    deposited += 1;
    left -= 1;
  }
  return { deposited, remaining: left };
}

export function withdrawFromShelter(
  shelter: Shelter,
  instanceId: Id,
  quantity?: number,
) {
  return removeItemFromStorage(shelter.storage, instanceId, quantity);
}
