import {
  createEmptyWorld,
  parseWorldJson,
  serializeWorld,
  type PersistentWorldState,
} from "../persistent/save.js";
import { createOrganization } from "../persistent/organization.js";
import { createPlayerProfile } from "../persistent/player.js";
import { createShelter } from "../persistent/shelter.js";
import { applyDailyUpkeep } from "../persistent/shelter.js";

const SAVE_KEY = "vn-zombie-extraction-world-v1";

export const IDS = {
  player: "player-local",
  org: "org-saigon-canal",
  shelter: "shelter-warehouse",
} as const;

export function createNewWorld(displayName: string): PersistentWorldState {
  const world = createEmptyWorld();
  const org = createOrganization(IDS.org, "Tổ tự vệ ven kênh", IDS.player);
  const player = createPlayerProfile(IDS.player, displayName || "Người sống sót", IDS.org);
  const shelter = createShelter(IDS.shelter, IDS.org, "Kho xưởng bỏ hoang");
  world.organizations.push(org);
  world.players.push(player);
  world.shelters.push(shelter);
  return world;
}

export function loadWorld(): PersistentWorldState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return parseWorldJson(raw);
  } catch {
    return null;
  }
}

export function saveWorld(world: PersistentWorldState): void {
  localStorage.setItem(SAVE_KEY, serializeWorld(world));
}

export function resetWorld(displayName: string): PersistentWorldState {
  const world = createNewWorld(displayName);
  saveWorld(world);
  return world;
}

export function getPlayer(world: PersistentWorldState) {
  const p = world.players.find((x) => x.id === IDS.player);
  if (!p) throw new Error("Player missing");
  return p;
}

export function getOrg(world: PersistentWorldState) {
  const o = world.organizations.find((x) => x.id === IDS.org);
  if (!o) throw new Error("Org missing");
  return o;
}

export function getShelter(world: PersistentWorldState) {
  const s = world.shelters.find((x) => x.id === IDS.shelter);
  if (!s) throw new Error("Shelter missing");
  return s;
}

export function runShelterUpkeep(world: PersistentWorldState): string {
  const shelter = getShelter(world);
  const org = getOrg(world);
  const result = applyDailyUpkeep(shelter, org.roster);
  saveWorld(world);
  if (result.ok) {
    return `Tiêu hao ngày: ${result.waterUsed} nước, ${result.foodUsed} thực phẩm.`;
  }
  return `Thiếu lương thực/nước! Cần ${result.waterUsed} nước và ${result.foodUsed} thực phẩm.`;
}
