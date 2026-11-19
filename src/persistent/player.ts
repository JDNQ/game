import { BALANCE } from "../shared/balance.js";
import {
  addItemToStorage,
  createStorage,
  type StorageContainer,
} from "./storage.js";
import type { Id } from "../shared/types.js";

export interface PlayerProfile {
  id: Id;
  displayName: string;
  organizationId: Id;
  /** Personal stash between raids. */
  personalStash: StorageContainer;
  /** Preferred loadout item definition IDs selected on the prep screen. */
  loadoutDefinitionIds: Id[];
  stats: {
    raidsAttempted: number;
    raidsExtracted: number;
    survivorsRescued: number;
  };
}

export function createPlayerProfile(
  id: Id,
  displayName: string,
  organizationId: Id,
): PlayerProfile {
  const profile: PlayerProfile = {
    id,
    displayName,
    organizationId,
    personalStash: createStorage(`${id}:stash`, "Kho cá nhân", 80),
    loadoutDefinitionIds: [],
    stats: {
      raidsAttempted: 0,
      raidsExtracted: 0,
      survivorsRescued: 0,
    },
  };

  // Starter kit for first raid prep.
  addItemToStorage(profile.personalStash, "bandage", 3);
  addItemToStorage(profile.personalStash, "bottled_water", 2);
  addItemToStorage(profile.personalStash, "canned_food", 1);
  addItemToStorage(profile.personalStash, "pistol_ammo", 15);
  addItemToStorage(profile.personalStash, "makeshift_pistol", 1);
  profile.loadoutDefinitionIds = [
    "makeshift_pistol",
    "pistol_ammo",
    "bandage",
    "bottled_water",
  ];

  return profile;
}

export function maxCarryWeightKg(): number {
  return BALANCE.player.baseCarryWeightKg;
}
