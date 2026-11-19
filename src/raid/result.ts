import { acceptSurvivor } from "../persistent/survivorRoster.js";
import {
  markRaidSettled,
  type PersistentWorldState,
} from "../persistent/save.js";
import { addItemToStorage } from "../persistent/storage.js";
import { BALANCE } from "../shared/balance.js";
import type { ItemInstance } from "../shared/items.js";
import type { Id, RaidOutcome } from "../shared/types.js";
import type { RaidResult, RaidState } from "./types.js";

function summarizeOutcome(raid: RaidState): RaidOutcome {
  const anyExtracted = raid.players.some((p) => p.hasExtracted);
  const allExtracted =
    raid.players.length > 0 && raid.players.every((p) => p.hasExtracted);
  if (allExtracted) return "success";
  if (anyExtracted) return "partial";
  return "failure";
}

/**
 * Builds a RaidResult from current raid flags. Does not mutate persistent world.
 */
export function buildRaidResult(raid: RaidState): RaidResult {
  const outcome = raid.outcome ?? summarizeOutcome(raid);
  const extractedLootByPlayer: Record<string, ItemInstance[]> = {};
  const notes: string[] = [];

  for (const player of raid.players) {
    if (player.hasExtracted) {
      extractedLootByPlayer[player.playerId] = structuredClone(player.carried);
      continue;
    }

    if (BALANCE.raid.failureLosesCarriedLoot) {
      if (BALANCE.raid.failureKeepsOneEquippedWeapon) {
        const kept = player.carried.filter(
          (i) => i.definitionId === "makeshift_pistol",
        );
        extractedLootByPlayer[player.playerId] = structuredClone(kept);
        notes.push(
          `${player.playerId}: thất bại — mất loot, giữ tối đa 1 vũ khí trang bị.`,
        );
      } else {
        extractedLootByPlayer[player.playerId] = [];
        notes.push(`${player.playerId}: thất bại — mất toàn bộ đồ mang theo.`);
      }
    }
  }

  const rescuedNpcIds: Id[] = [];
  const failedNpcIds: Id[] = [];

  for (const npc of raid.survivors) {
    const claimerExtracted =
      npc.escortClaimPlayerId !== undefined &&
      raid.players.some(
        (p) => p.playerId === npc.escortClaimPlayerId && p.hasExtracted,
      );

    if (npc.hasExtracted && npc.hp > 0 && claimerExtracted) {
      rescuedNpcIds.push(npc.id);
    } else {
      failedNpcIds.push(npc.id);
      notes.push(`Cứu hộ thất bại: ${npc.displayName}`);
    }
  }

  return {
    raidId: raid.id,
    outcome,
    extractedLootByPlayer,
    rescuedNpcIds,
    failedNpcIds,
    notes,
  };
}

export interface SettleRaidOptions {
  /** Organization that receives rescued NPCs. */
  organizationId: Id;
  /** Shelter that receives community upkeep resources. */
  shelterId: Id;
}

/**
 * Applies raid results exactly once into the persistent world.
 * Loot returns to the player's personal stash for the next loadout.
 */
export function settleRaidResult(
  world: PersistentWorldState,
  raid: RaidState,
  options: SettleRaidOptions,
): { applied: boolean; result: RaidResult } {
  const result = buildRaidResult(raid);

  if (!markRaidSettled(world, raid.id)) {
    return { applied: false, result };
  }

  const org = world.organizations.find((o) => o.id === options.organizationId);
  const shelter = world.shelters.find((s) => s.id === options.shelterId);
  if (!org || !shelter) {
    throw new Error("Organization or shelter missing while settling raid");
  }

  const participantIds = new Set(raid.players.map((p) => p.playerId));

  for (const player of world.players) {
    if (!participantIds.has(player.id)) continue;

    const loot = result.extractedLootByPlayer[player.id] ?? [];
    player.stats.raidsAttempted += 1;
    if (raid.players.some((p) => p.playerId === player.id && p.hasExtracted)) {
      player.stats.raidsExtracted += 1;
    }

    // Clear old carried loadout from stash representation: stash already had
    // items withdrawn at raid start. Deposit whatever was extracted.
    for (const stack of loot) {
      if (stack.definitionId === "bottled_water") {
        shelter.waterReserve += stack.quantity;
      }
      if (stack.definitionId === "canned_food") {
        shelter.foodReserve += stack.quantity;
      }
      if (!addItemToStorage(player.personalStash, stack.definitionId, stack.quantity)) {
        result.notes.push(
          `Kho cá nhân đầy — không nhận hết ${stack.quantity}x ${stack.definitionId}.`,
        );
      }
    }
  }

  for (const npcId of result.rescuedNpcIds) {
    const npc = raid.survivors.find((s) => s.id === npcId);
    if (!npc) continue;
    acceptSurvivor(org.roster, {
      id: npc.id,
      displayName: npc.displayName,
      rescuedFrom: `${raid.mapId}:${npc.spawnDefinitionId}`,
      health: npc.hp,
      notes: ["rescued_via_extraction"],
    });
    const claimer = world.players.find((p) => p.id === npc.escortClaimPlayerId);
    if (claimer) {
      claimer.stats.survivorsRescued += 1;
    }
  }

  return { applied: true, result };
}
