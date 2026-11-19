import {
  createRaidState,
  spawnWorldLoot,
  type WorldLootPickup,
} from "../raid/bootstrap.js";
import type { RaidResult, RaidState } from "../raid/types.js";
import type { ItemInstance } from "../shared/items.js";
import { CANAL_WORLD, type Rect } from "../shared/worldGeometry.js";
import type { Id, PartyMode } from "../shared/types.js";

export interface NoisePulse {
  id: Id;
  x: number;
  y: number;
  radius: number;
  ttl: number;
}

export interface FloatingMessage {
  text: string;
  ttl: number;
}

export interface PlayableRaid {
  raid: RaidState;
  loot: WorldLootPickup[];
  noises: NoisePulse[];
  walls: Rect[];
  floodZones: Rect[];
  bounds: Rect;
  facing: number;
  fireCooldown: number;
  messages: FloatingMessage[];
  interactHint: string;
  ended: boolean;
  result?: RaidResult;
}

export function createPlayableRaid(input: {
  raidId: Id;
  mapId: Id;
  partyMode: PartyMode;
  playerId: Id;
  entrySpawnId: Id;
  carried: ItemInstance[];
}): PlayableRaid {
  const raid = createRaidState({
    raidId: input.raidId,
    mapId: input.mapId,
    partyMode: input.partyMode,
    participants: [
      {
        playerId: input.playerId,
        entrySpawnId: input.entrySpawnId,
        carried: input.carried,
      },
    ],
  });

  return {
    raid,
    loot: spawnWorldLoot(input.mapId),
    noises: [],
    walls: [...CANAL_WORLD.walls],
    floodZones: [...CANAL_WORLD.floodZones],
    bounds: { ...CANAL_WORLD.bounds },
    facing: 0,
    fireCooldown: 0,
    messages: [],
    interactHint: "",
    ended: false,
  };
}

export function pushMessage(play: PlayableRaid, text: string, ttl = 2.5): void {
  play.messages.push({ text, ttl });
  if (play.messages.length > 5) play.messages.shift();
}

export function emitNoise(
  play: PlayableRaid,
  x: number,
  y: number,
  radius: number,
  ttl = 0.8,
): void {
  play.noises.push({
    id: crypto.randomUUID(),
    x,
    y,
    radius,
    ttl,
  });
}
