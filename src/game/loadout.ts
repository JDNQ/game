import type { PlayerProfile } from "../persistent/player.js";
import { removeItemFromStorage } from "../persistent/storage.js";
import {
  createItemInstance,
  getItemDefinition,
  itemStackWeightKg,
  type ItemInstance,
} from "../shared/items.js";
import { BALANCE } from "../shared/balance.js";
import type { Id } from "../shared/types.js";

export function stashSummary(player: PlayerProfile): { id: Id; name: string; qty: number; instanceIds: Id[] }[] {
  const map = new Map<string, { id: Id; name: string; qty: number; instanceIds: Id[] }>();
  for (const item of player.personalStash.items) {
    const cur = map.get(item.definitionId);
    if (cur) {
      cur.qty += item.quantity;
      cur.instanceIds.push(item.instanceId);
    } else {
      map.set(item.definitionId, {
        id: item.definitionId,
        name: getItemDefinition(item.definitionId).name,
        qty: item.quantity,
        instanceIds: [item.instanceId],
      });
    }
  }
  return [...map.values()];
}

export function plannedWeight(definitionCounts: Record<string, number>): number {
  let w = 0;
  for (const [id, qty] of Object.entries(definitionCounts)) {
    if (qty <= 0) continue;
    w += getItemDefinition(id).weightKg * qty;
  }
  return w;
}

/** Withdraw planned loadout from stash into carried instances. */
export function withdrawLoadout(
  player: PlayerProfile,
  definitionCounts: Record<string, number>,
): ItemInstance[] {
  const weight = plannedWeight(definitionCounts);
  if (weight > BALANCE.player.baseCarryWeightKg + 0.001) {
    throw new Error("Vượt tải trọng cho phép");
  }

  const carried: ItemInstance[] = [];
  for (const [definitionId, want] of Object.entries(definitionCounts)) {
    let remaining = want;
    if (remaining <= 0) continue;
    const stacks = player.personalStash.items.filter(
      (i) => i.definitionId === definitionId,
    );
    for (const stack of [...stacks]) {
      if (remaining <= 0) break;
      const take = Math.min(stack.quantity, remaining);
      const removed = removeItemFromStorage(
        player.personalStash,
        stack.instanceId,
        take,
      );
      if (!removed) continue;
      carried.push(createItemInstance(definitionId, removed.quantity));
      remaining -= take;
    }
    if (remaining > 0) {
      throw new Error(`Không đủ ${getItemDefinition(definitionId).name} trong kho`);
    }
  }
  return carried;
}

export function carriedWeightKg(items: ItemInstance[]): number {
  return items.reduce((s, i) => s + itemStackWeightKg(i), 0);
}
