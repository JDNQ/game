import type { Id, ItemCategory, WeightedValue } from "./types.js";

/** Static item definition — never mutated at runtime. */
export interface ItemDefinition extends WeightedValue {
  id: Id;
  name: string;
  category: ItemCategory;
  /** Relative loot value; higher usually means riskier spawn. */
  value: number;
  /** Max stack in one inventory slot; 1 = unique/non-stackable. */
  maxStack: number;
  /** Optional medical / consumable tags for systems that care. */
  tags?: readonly string[];
}

export interface ItemInstance {
  instanceId: Id;
  definitionId: Id;
  quantity: number;
}

/** Prototype loot: medical, survival, ammo/weapons (đề cương §12). */
export const ITEM_DEFINITIONS: Readonly<Record<string, ItemDefinition>> = {
  bandage: {
    id: "bandage",
    name: "Băng gạc",
    category: "medical",
    weightKg: 0.1,
    size: 1,
    value: 8,
    maxStack: 10,
    tags: ["treats:bleeding"],
  },
  medkit: {
    id: "medkit",
    name: "Bộ y tế",
    category: "medical",
    weightKg: 1.2,
    size: 2,
    value: 35,
    maxStack: 2,
    tags: ["treats:bleeding", "field_care"],
  },
  bottled_water: {
    id: "bottled_water",
    name: "Nước sạch",
    category: "survival",
    weightKg: 0.5,
    size: 1,
    value: 10,
    maxStack: 6,
    tags: ["drink", "treats:dehydration"],
  },
  canned_food: {
    id: "canned_food",
    name: "Thực phẩm đóng hộp",
    category: "survival",
    weightKg: 0.4,
    size: 1,
    value: 12,
    maxStack: 8,
    tags: ["food"],
  },
  pistol_ammo: {
    id: "pistol_ammo",
    name: "Đạn súng ngắn",
    category: "ammo",
    weightKg: 0.02,
    size: 1,
    value: 6,
    maxStack: 30,
  },
  makeshift_pistol: {
    id: "makeshift_pistol",
    name: "Súng ngắn tự chế",
    category: "weapon",
    weightKg: 1.1,
    size: 2,
    value: 40,
    maxStack: 1,
    tags: ["noisy"],
  },
  scrap_metal: {
    id: "scrap_metal",
    name: "Sắt vụn",
    category: "material",
    weightKg: 0.8,
    size: 2,
    value: 5,
    maxStack: 20,
    tags: ["shelter_repair"],
  },
} as const;

export function getItemDefinition(definitionId: Id): ItemDefinition {
  const def = ITEM_DEFINITIONS[definitionId];
  if (!def) {
    throw new Error(`Unknown item definition: ${definitionId}`);
  }
  return def;
}

export function createItemInstance(
  definitionId: Id,
  quantity = 1,
  instanceId: Id = crypto.randomUUID(),
): ItemInstance {
  const def = getItemDefinition(definitionId);
  if (quantity < 1 || quantity > def.maxStack) {
    throw new Error(
      `Quantity ${quantity} out of range for ${definitionId} (1..${def.maxStack})`,
    );
  }
  return { instanceId, definitionId, quantity };
}

export function itemStackWeightKg(instance: ItemInstance): number {
  return getItemDefinition(instance.definitionId).weightKg * instance.quantity;
}
