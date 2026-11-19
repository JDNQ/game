import type { Id } from "./types.js";

export interface Vec2 {
  x: number;
  y: number;
}

export interface SpawnPoint {
  id: Id;
  label: string;
  position: Vec2;
}

export interface ExtractionPointDefinition {
  id: Id;
  label: string;
  position: Vec2;
  /** Seconds the team must hold the point after activation. */
  holdSeconds: number;
  /** Optional requirements shown before the raid (keys, signal, etc.). */
  openConditions: readonly string[];
}

export interface LootSpawnDefinition {
  id: Id;
  position: Vec2;
  /** Weighted table of item definition IDs. */
  pool: readonly { definitionId: Id; weight: number }[];
  /** Relative danger / risk for designers (1 = safe, 5 = hot). */
  risk: 1 | 2 | 3 | 4 | 5;
}

export interface NpcRescueSpawnDefinition {
  id: Id;
  label: string;
  position: Vec2;
  /** Extra steps before escort can start (heal, find key, clear room). */
  rescueRequirements: readonly string[];
}

export interface MapDefinition {
  id: Id;
  name: string;
  description: string;
  /** Soft time limit for the raid in seconds. */
  raidDurationSeconds: number;
  entrySpawns: readonly SpawnPoint[];
  extractions: readonly ExtractionPointDefinition[];
  lootSpawns: readonly LootSpawnDefinition[];
  rescuedSurvivorSpawns: readonly NpcRescueSpawnDefinition[];
  landmarks: readonly string[];
}

/** Prototype map: khu dân cư ven kênh (đề cương §8, §12). */
export const PROTOTYPE_MAP: MapDefinition = {
  id: "canal_neighborhood_v0",
  name: "Khu dân cư ven kênh",
  description:
    "Hẻm nhỏ, nhà ống, chợ tạm, trạm y tế và bến phà rút quân. Tuyến an toàn dài hơn; tuyến nhanh đi qua chợ và hẻm tối.",
  raidDurationSeconds: 10 * 60,
  entrySpawns: [
    {
      id: "entry_alley_north",
      label: "Hẻm phía Bắc",
      position: { x: 12, y: 4 },
    },
    {
      id: "entry_road_east",
      label: "Đường lớn phía Đông",
      position: { x: 48, y: 22 },
    },
  ],
  extractions: [
    {
      id: "extract_ferry",
      label: "Bến phà",
      position: { x: 8, y: 40 },
      holdSeconds: 8,
      openConditions: ["reach_point", "survive_hold"],
    },
  ],

  lootSpawns: [
    {
      id: "loot_clinic",
      position: { x: 30, y: 18 },
      risk: 4,
      pool: [
        { definitionId: "bandage", weight: 4 },
        { definitionId: "medkit", weight: 2 },
        { definitionId: "bottled_water", weight: 1 },
      ],
    },
    {
      id: "loot_market",
      position: { x: 22, y: 28 },
      risk: 3,
      pool: [
        { definitionId: "canned_food", weight: 4 },
        { definitionId: "bottled_water", weight: 3 },
        { definitionId: "scrap_metal", weight: 2 },
      ],
    },
    {
      id: "loot_corner_shop",
      position: { x: 40, y: 12 },
      risk: 2,
      pool: [
        { definitionId: "pistol_ammo", weight: 3 },
        { definitionId: "bandage", weight: 2 },
        { definitionId: "makeshift_pistol", weight: 1 },
      ],
    },
  ],
  rescuedSurvivorSpawns: [
    {
      id: "npc_rooftop_survivor",
      label: "Người sống sót trên sân thượng nhà ống",
      position: { x: 26, y: 16 },
      rescueRequirements: ["reach_npc", "optional_heal_if_bleeding"],
    },
  ],
  landmarks: [
    "hem",
    "nha_ong",
    "cho",
    "tram_y_te",
    "bo_kenh",
    "ben_pha",
  ],
};

export const MAP_DEFINITIONS: Readonly<Record<string, MapDefinition>> = {
  [PROTOTYPE_MAP.id]: PROTOTYPE_MAP,
};

export function getMapDefinition(mapId: Id): MapDefinition {
  const map = MAP_DEFINITIONS[mapId];
  if (!map) {
    throw new Error(`Unknown map: ${mapId}`);
  }
  return map;
}
