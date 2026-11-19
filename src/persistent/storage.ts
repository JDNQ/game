import {
  createItemInstance,
  getItemDefinition,
  itemStackWeightKg,
  type ItemInstance,
} from "../shared/items.js";
import type { Id } from "../shared/types.js";

/** Personal storage for prototype (đề cương §13 — chọn kho cá nhân). */
export interface StorageContainer {
  id: Id;
  label: string;
  capacityKg: number;
  items: ItemInstance[];
}

export function createStorage(
  id: Id,
  label: string,
  capacityKg: number,
  items: ItemInstance[] = [],
): StorageContainer {
  return { id, label, capacityKg, items: [...items] };
}

export function storageWeightKg(storage: StorageContainer): number {
  return storage.items.reduce((sum, item) => sum + itemStackWeightKg(item), 0);
}

export function canFitItem(
  storage: StorageContainer,
  definitionId: Id,
  quantity: number,
): boolean {
  const def = getItemDefinition(definitionId);
  const added = def.weightKg * quantity;
  return storageWeightKg(storage) + added <= storage.capacityKg;
}

/**
 * Adds to an existing stack when possible; otherwise creates a new instance.
 * Returns false if over capacity.
 */
export function addItemToStorage(
  storage: StorageContainer,
  definitionId: Id,
  quantity: number,
): boolean {
  if (!canFitItem(storage, definitionId, quantity)) {
    return false;
  }

  const def = getItemDefinition(definitionId);
  let remaining = quantity;

  for (const stack of storage.items) {
    if (stack.definitionId !== definitionId) continue;
    const space = def.maxStack - stack.quantity;
    if (space <= 0) continue;
    const move = Math.min(space, remaining);
    stack.quantity += move;
    remaining -= move;
    if (remaining === 0) return true;
  }

  while (remaining > 0) {
    const chunk = Math.min(def.maxStack, remaining);
    storage.items.push(createItemInstance(definitionId, chunk));
    remaining -= chunk;
  }
  return true;
}

export function removeItemFromStorage(
  storage: StorageContainer,
  instanceId: Id,
  quantity?: number,
): ItemInstance | undefined {
  const index = storage.items.findIndex((i) => i.instanceId === instanceId);
  if (index < 0) return undefined;

  const stack = storage.items[index]!;
  const removeQty = quantity ?? stack.quantity;
  if (removeQty <= 0 || removeQty > stack.quantity) {
    throw new Error(`Invalid remove quantity ${removeQty} for ${instanceId}`);
  }

  if (removeQty === stack.quantity) {
    storage.items.splice(index, 1);
    return stack;
  }

  stack.quantity -= removeQty;
  return {
    instanceId: crypto.randomUUID(),
    definitionId: stack.definitionId,
    quantity: removeQty,
  };
}
