import { BALANCE } from "../shared/balance.js";
import { createItemInstance, type ItemInstance } from "../shared/items.js";
import { getMapDefinition, type Vec2 } from "../shared/maps.js";
import type { Id, PartyMode } from "../shared/types.js";
import type {
  RaidExtractionRuntime,
  RaidPlayerState,
  RaidState,
  RaidSurvivorNpcState,
  RaidZombieState,
} from "./types.js";

export interface StartRaidInput {
  raidId: Id;
  mapId: Id;
  partyMode: PartyMode;
  weather?: RaidState["weather"];
  participants: {
    playerId: Id;
    entrySpawnId: Id;
    carried: ItemInstance[];
  }[];
}

export interface WorldLootPickup {
  id: Id;
  position: Vec2;
  item: ItemInstance;
  risk: number;
}

function spawnAt(mapId: Id, entrySpawnId: Id): Vec2 {
  const map = getMapDefinition(mapId);
  const spawn = map.entrySpawns.find((s) => s.id === entrySpawnId);
  if (!spawn) {
    throw new Error(`Unknown entry spawn ${entrySpawnId} on ${mapId}`);
  }
  return { ...spawn.position };
}

function pickWeighted(pool: readonly { definitionId: Id; weight: number }[]): Id {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.definitionId;
  }
  return pool[pool.length - 1]!.definitionId;
}

export function spawnWorldLoot(mapId: Id): WorldLootPickup[] {
  const map = getMapDefinition(mapId);
  const loot: WorldLootPickup[] = [];
  for (const spawn of map.lootSpawns) {
    const count = spawn.risk >= 4 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const definitionId = pickWeighted(spawn.pool);
      loot.push({
        id: crypto.randomUUID(),
        position: {
          x: spawn.position.x + (Math.random() - 0.5) * 1.5,
          y: spawn.position.y + (Math.random() - 0.5) * 1.5,
        },
        item: createItemInstance(definitionId, 1),
        risk: spawn.risk,
      });
    }
  }
  return loot;
}

function spawnZombies(mapId: Id): RaidZombieState[] {
  const map = getMapDefinition(mapId);
  const seeds: Vec2[] = [
    { x: 30, y: 18 },
    { x: 32, y: 19 },
    { x: 22, y: 28 },
    { x: 24, y: 29 },
    { x: 40, y: 14 },
    { x: 14, y: 20 },
    { x: 18, y: 34 },
    { x: 10, y: 38 },
    { x: 35, y: 32 },
    { x: 27, y: 22 },
  ];
  // Keep at least one near clinic + market from map loot markers.
  for (const loot of map.lootSpawns) {
    seeds.push({ x: loot.position.x + 1.5, y: loot.position.y + 1 });
  }
  return seeds.map((position) => ({
    id: crypto.randomUUID(),
    position: { ...position },
    aiState: "wander" as const,
  }));
}

/** Builds a fresh RaidState from map definitions — no persistent data mixed in. */
export function createRaidState(input: StartRaidInput): RaidState {
  const map = getMapDefinition(input.mapId);

  const players: RaidPlayerState[] = input.participants.map((p) => ({
    playerId: p.playerId,
    position: spawnAt(input.mapId, p.entrySpawnId),
    hp: BALANCE.player.maxHp,
    stamina: BALANCE.player.maxStamina,
    carried: structuredClone(p.carried),
    statusEffects: [],
    isDowned: false,
    hasExtracted: false,
  }));

  const survivors: RaidSurvivorNpcState[] = map.rescuedSurvivorSpawns.map(
    (s) => ({
      id: crypto.randomUUID(),
      spawnDefinitionId: s.id,
      displayName: s.label,
      position: { ...s.position },
      hp: 60,
      isEscorting: false,
      hasExtracted: false,
    }),
  );

  const extractions: RaidExtractionRuntime[] = map.extractions.map((e) => ({
    definitionId: e.id,
    isActive: false,
    holdRemainingSeconds: e.holdSeconds,
    extractedPlayerIds: [],
    extractedNpcIds: [],
  }));

  return {
    id: input.raidId,
    mapId: input.mapId,
    partyMode: input.partyMode,
    startedAtIso: new Date().toISOString(),
    timeRemainingSeconds: map.raidDurationSeconds,
    weather: input.weather ?? (Math.random() < 0.35 ? "rain" : "clear"),
    players,
    zombies: spawnZombies(input.mapId),
    survivors,
    extractions,
  };
}
