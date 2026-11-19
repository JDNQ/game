import { buildRaidResult } from "../raid/result.js";
import { BALANCE } from "../shared/balance.js";
import {
  getItemDefinition,
  itemStackWeightKg,
  type ItemInstance,
} from "../shared/items.js";
import { getMapDefinition } from "../shared/maps.js";
import {
  createActiveStatusEffect,
  getStatusEffectDefinition,
} from "../shared/statusEffects.js";
import {
  pointInRect,
  resolveCircleWalls,
} from "../shared/worldGeometry.js";
import type { InputState } from "./input.js";
import {
  emitNoise,
  pushMessage,
  type PlayableRaid,
} from "./playable.js";

const PLAYER_RADIUS = 0.45;
const ZOMBIE_RADIUS = 0.5;
const NPC_RADIUS = 0.4;
const INTERACT_RANGE = 1.6;
const LOOT_RANGE = 1.3;
const EXTRACT_RANGE = 2.2;
const SCALE = 16;

export function worldToScreen(
  x: number,
  y: number,
  camX: number,
  camY: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  return {
    x: (x - camX) * SCALE + canvasW / 2,
    y: (y - camY) * SCALE + canvasH / 2,
  };
}

export function screenToWorld(
  sx: number,
  sy: number,
  camX: number,
  camY: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  return {
    x: (sx - canvasW / 2) / SCALE + camX,
    y: (sy - canvasH / 2) / SCALE + camY,
  };
}

export { SCALE };

function carriedWeight(items: ItemInstance[]): number {
  return items.reduce((s, i) => s + itemStackWeightKg(i), 0);
}

function countItem(items: ItemInstance[], definitionId: string): number {
  return items
    .filter((i) => i.definitionId === definitionId)
    .reduce((s, i) => s + i.quantity, 0);
}

function consumeItem(
  items: ItemInstance[],
  definitionId: string,
  qty = 1,
): boolean {
  let need = qty;
  for (let i = items.length - 1; i >= 0 && need > 0; i--) {
    const stack = items[i]!;
    if (stack.definitionId !== definitionId) continue;
    const take = Math.min(stack.quantity, need);
    stack.quantity -= take;
    need -= take;
    if (stack.quantity <= 0) items.splice(i, 1);
  }
  return need === 0;
}

function tryAddCarried(playerItems: ItemInstance[], item: ItemInstance): boolean {
  const def = getItemDefinition(item.definitionId);
  const weight = def.weightKg * item.quantity;
  if (carriedWeight(playerItems) + weight > BALANCE.player.baseCarryWeightKg) {
    return false;
  }
  const existing = playerItems.find(
    (i) =>
      i.definitionId === item.definitionId && i.quantity < def.maxStack,
  );
  if (existing) {
    const space = def.maxStack - existing.quantity;
    const move = Math.min(space, item.quantity);
    existing.quantity += move;
    item.quantity -= move;
    if (item.quantity <= 0) return true;
  }
  if (item.quantity > 0) {
    playerItems.push({ ...item, instanceId: crypto.randomUUID() });
  }
  return true;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function endRaid(play: PlayableRaid, reason: string): void {
  if (play.ended) return;
  play.ended = true;
  const player = play.raid.players[0]!;
  if (!player.hasExtracted && player.isDowned) {
    play.raid.outcome = "failure";
  } else if (!player.hasExtracted && play.raid.timeRemainingSeconds <= 0) {
    play.raid.outcome = "failure";
    pushMessage(play, "Hết giờ rút quân!");
  }
  play.raid.outcome = play.raid.outcome ?? buildRaidResult(play.raid).outcome;
  play.result = buildRaidResult(play.raid);
  pushMessage(play, reason, 4);
}

export function updatePlayableRaid(
  play: PlayableRaid,
  input: InputState,
  dt: number,
  canvasW: number,
  canvasH: number,
): void {
  if (play.ended) return;

  const raid = play.raid;
  const player = raid.players[0]!;
  const map = getMapDefinition(raid.mapId);

  raid.timeRemainingSeconds = Math.max(0, raid.timeRemainingSeconds - dt);
  if (raid.timeRemainingSeconds <= 0 && !player.hasExtracted) {
    endRaid(play, "Thất bại — không kịp extraction.");
    return;
  }

  play.fireCooldown = Math.max(0, play.fireCooldown - dt);
  for (const msg of play.messages) msg.ttl -= dt;
  play.messages = play.messages.filter((m) => m.ttl > 0);
  for (const n of play.noises) n.ttl -= dt;
  play.noises = play.noises.filter((n) => n.ttl > 0);

  // --- Status ticks ---
  for (const effect of player.statusEffects) {
    effect.nextTickInSeconds -= dt;
    const def = getStatusEffectDefinition(effect.kind);
    if (effect.nextTickInSeconds <= 0) {
      effect.nextTickInSeconds = def.tickIntervalSeconds;
      if (effect.kind === "bleeding") {
        player.hp -=
          BALANCE.status.bleedingHpLossPerIntensityPerTick * effect.intensity;
      }
      if (effect.kind === "exhaustion" && def.decaysNaturally) {
        effect.intensity = Math.max(0, effect.intensity - 1);
      }
    }
  }
  player.statusEffects = player.statusEffects.filter((e) => e.intensity > 0);

  if (player.hp <= 0) {
    player.hp = 0;
    player.isDowned = true;
    endRaid(play, "Bạn đã ngã quỵ.");
    return;
  }

  const weight = carriedWeight(player.carried);
  const overload =
    weight >= BALANCE.player.baseCarryWeightKg * BALANCE.inventory.overloadRatio;
  const exhaustion = player.statusEffects.find((e) => e.kind === "exhaustion");
  const staminaPenalty =
    (exhaustion?.intensity ?? 0) *
    BALANCE.status.exhaustionStaminaPenaltyPerIntensity;
  const maxStamina = BALANCE.player.maxStamina * (1 - staminaPenalty);

  const inFlood = play.floodZones.some((z) => pointInRect(player.position, z));
  const rainSlow = raid.weather === "rain" ? 0.9 : 1;
  const floodSlow = inFlood ? 0.55 : 1;

  // --- Movement ---
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  const len = Math.hypot(mx, my);
  if (len > 0 && !player.isDowned) {
    mx /= len;
    my /= len;
    const wantSprint = input.sprint && player.stamina > 0 && !overload;
    const speed =
      (wantSprint ? BALANCE.player.sprintSpeed : BALANCE.player.walkSpeed) *
      rainSlow *
      floodSlow *
      (overload ? 0.75 : 1);
    if (wantSprint) {
      player.stamina = Math.max(
        0,
        player.stamina - BALANCE.player.sprintStaminaCostPerSecond * dt,
      );
      if (Math.random() < dt * 0.15) {
        emitNoise(play, player.position.x, player.position.y, 6, 0.4);
      }
      if (overload && Math.random() < dt * 0.4) {
        const existing = player.statusEffects.find((e) => e.kind === "exhaustion");
        if (existing) {
          existing.intensity = Math.min(
            getStatusEffectDefinition("exhaustion").maxIntensity,
            existing.intensity + 1,
          );
        } else {
          player.statusEffects.push(
            createActiveStatusEffect(
              "exhaustion",
              "heavy_load_sprint",
              map.raidDurationSeconds - raid.timeRemainingSeconds,
            ),
          );
          pushMessage(play, "Kiệt sức vì mang nặng!");
        }
      }
    } else {
      player.stamina = Math.min(
        maxStamina,
        player.stamina + BALANCE.player.staminaRegenPerSecond * dt,
      );
    }
    player.position.x += mx * speed * dt;
    player.position.y += my * speed * dt;
    player.position = resolveCircleWalls(
      player.position,
      PLAYER_RADIUS,
      play.walls,
      play.bounds,
    );
  } else if (!player.isDowned) {
    player.stamina = Math.min(
      maxStamina,
      player.stamina + BALANCE.player.staminaRegenPerSecond * dt,
    );
  }

  if (inFlood && Math.random() < dt * 0.08) {
    pushMessage(play, "Lội nước ngập — di chuyển chậm, nguy cơ nhiễm trùng.");
  }

  // Facing toward mouse
  const aim = screenToWorld(
    input.mouseX,
    input.mouseY,
    player.position.x,
    player.position.y,
    canvasW,
    canvasH,
  );
  play.facing = Math.atan2(aim.y - player.position.y, aim.x - player.position.x);

  // --- Fire ---
  const hasGun = player.carried.some((i) => i.definitionId === "makeshift_pistol");
  const ammo = countItem(player.carried, "pistol_ammo");
  if (
    input.firePressed &&
    play.fireCooldown <= 0 &&
    hasGun &&
    ammo > 0 &&
    !player.isDowned
  ) {
    consumeItem(player.carried, "pistol_ammo", 1);
    play.fireCooldown = 0.35;
    emitNoise(
      play,
      player.position.x,
      player.position.y,
      BALANCE.combat.pistolNoiseRadius,
      1.2,
    );
    pushMessage(play, "Bang! Tiếng súng rất lớn.");

    // Hitscan
    let best: { i: number; d: number } | undefined;
    for (let i = 0; i < raid.zombies.length; i++) {
      const z = raid.zombies[i]!;
      const toZx = z.position.x - player.position.x;
      const toZy = z.position.y - player.position.y;
      const along =
        toZx * Math.cos(play.facing) + toZy * Math.sin(play.facing);
      if (along < 0 || along > 22) continue;
      const px = player.position.x + Math.cos(play.facing) * along;
      const py = player.position.y + Math.sin(play.facing) * along;
      const perp = dist(px, py, z.position.x, z.position.y);
      if (perp < 0.7 && (best === undefined || along < best.d)) {
        best = { i, d: along };
      }
    }
    if (best) {
      raid.zombies.splice(best.i, 1);
      pushMessage(play, "Zombie gục!");
    }
  } else if (input.firePressed && (!hasGun || ammo <= 0)) {
    pushMessage(play, hasGun ? "Hết đạn!" : "Không có súng!");
  }

  // --- Consumables ---
  if (input.useBandagePressed) {
    const hasBleed = player.statusEffects.some((e) => e.kind === "bleeding");
    if (hasBleed && consumeItem(player.carried, "bandage", 1)) {
      player.statusEffects = player.statusEffects.filter((e) => e.kind !== "bleeding");
      pushMessage(play, "Đã băng vết thương.");
    } else if (hasBleed && consumeItem(player.carried, "medkit", 1)) {
      player.statusEffects = player.statusEffects.filter((e) => e.kind !== "bleeding");
      player.hp = Math.min(BALANCE.player.maxHp, player.hp + 25);
      pushMessage(play, "Dùng bộ y tế — cầm máu và hồi máu.");
    } else if (!hasBleed) {
      pushMessage(play, "Không bị chảy máu.");
    } else {
      pushMessage(play, "Không còn băng gạc / bộ y tế.");
    }
  }

  if (input.useWaterPressed) {
    if (consumeItem(player.carried, "bottled_water", 1)) {
      const exh = player.statusEffects.find((e) => e.kind === "exhaustion");
      if (exh) exh.intensity = Math.max(0, exh.intensity - 1);
      player.stamina = Math.min(maxStamina, player.stamina + 30);
      pushMessage(play, "Uống nước — đỡ kiệt sức.");
    } else {
      pushMessage(play, "Không còn nước sạch.");
    }
  }

  // --- Loot / NPC / Extract interact ---
  play.interactHint = "";
  let nearestLoot = -1;
  let nearestLootDist = LOOT_RANGE;
  for (let i = 0; i < play.loot.length; i++) {
    const l = play.loot[i]!;
    const d = dist(player.position.x, player.position.y, l.position.x, l.position.y);
    if (d < nearestLootDist) {
      nearestLootDist = d;
      nearestLoot = i;
    }
  }
  if (nearestLoot >= 0) {
    const item = play.loot[nearestLoot]!;
    play.interactHint = `E: Nhặt ${getItemDefinition(item.item.definitionId).name}`;
  }

  const npc = raid.survivors[0];
  if (
    npc &&
    !npc.isEscorting &&
    dist(player.position.x, player.position.y, npc.position.x, npc.position.y) <
      INTERACT_RANGE
  ) {
    play.interactHint = "E: Hộ tống người sống sót";
  }

  const extractDef = map.extractions[0]!;
  const extractRt = raid.extractions[0]!;
  const nearExtract =
    dist(
      player.position.x,
      player.position.y,
      extractDef.position.x,
      extractDef.position.y,
    ) < EXTRACT_RANGE;
  if (nearExtract) {
    play.interactHint = extractRt.isActive
      ? `Đang rút... ${extractRt.holdRemainingSeconds.toFixed(1)}s`
      : "E: Kích hoạt bến phà (extraction)";
  }

  if (input.interactPressed) {
    if (nearestLoot >= 0) {
      const pickup = play.loot[nearestLoot]!;
      if (tryAddCarried(player.carried, structuredClone(pickup.item))) {
        play.loot.splice(nearestLoot, 1);
        pushMessage(
          play,
          `Nhặt ${getItemDefinition(pickup.item.definitionId).name}`,
        );
        if (pickup.risk >= 4) {
          emitNoise(play, pickup.position.x, pickup.position.y, 10, 0.6);
        }
      } else {
        pushMessage(play, "Quá tải — không nhặt thêm được.");
      }
    } else if (
      npc &&
      !npc.isEscorting &&
      dist(player.position.x, player.position.y, npc.position.x, npc.position.y) <
        INTERACT_RANGE
    ) {
      npc.isEscorting = true;
      npc.escortClaimPlayerId = player.playerId;
      pushMessage(play, "Đang hộ tống — dẫn tới bến phà!");
    } else if (nearExtract && !extractRt.isActive) {
      extractRt.isActive = true;
      extractRt.holdRemainingSeconds = extractDef.holdSeconds;
      emitNoise(
        play,
        extractDef.position.x,
        extractDef.position.y,
        18,
        1.5,
      );
      pushMessage(play, "Phà đang tới — giữ vị trí!");
    }
  }

  // Escort follow
  if (npc?.isEscorting && !npc.hasExtracted) {
    const dx = player.position.x - npc.position.x;
    const dy = player.position.y - npc.position.y;
    const d = Math.hypot(dx, dy);
    if (d > 1.2) {
      npc.position.x += (dx / d) * 3.0 * dt;
      npc.position.y += (dy / d) * 3.0 * dt;
      npc.position = resolveCircleWalls(
        npc.position,
        NPC_RADIUS,
        play.walls,
        play.bounds,
      );
    }
  }

  // Extraction hold
  if (extractRt.isActive && !player.hasExtracted) {
    if (nearExtract) {
      extractRt.holdRemainingSeconds -= dt;
      if (extractRt.holdRemainingSeconds <= 0) {
        player.hasExtracted = true;
        extractRt.extractedPlayerIds.push(player.playerId);
        if (npc?.isEscorting && npc.hp > 0 && nearExtract) {
          // NPC must also be near extract
          const npcNear =
            dist(
              npc.position.x,
              npc.position.y,
              extractDef.position.x,
              extractDef.position.y,
            ) < EXTRACT_RANGE + 1;
          if (npcNear) {
            npc.hasExtracted = true;
            extractRt.extractedNpcIds.push(npc.id);
          }
        }
        raid.outcome = "success";
        endRaid(play, "Rút quân thành công!");
        return;
      }
    } else {
      // Cancel if leave
      extractRt.isActive = false;
      extractRt.holdRemainingSeconds = extractDef.holdSeconds;
      pushMessage(play, "Rời điểm rút — hủy extraction.");
    }
  }

  // --- Zombie AI ---
  for (const z of raid.zombies) {
    let alerted = false;
    const see =
      dist(z.position.x, z.position.y, player.position.x, player.position.y) <=
      BALANCE.zombie.detectVisionRange;

    for (const n of play.noises) {
      if (dist(z.position.x, z.position.y, n.x, n.y) <= n.radius) {
        alerted = true;
        z.targetPlayerId = player.playerId;
        z.aiState = "chase";
      }
    }

    if (see) {
      z.aiState = "chase";
      z.targetPlayerId = player.playerId;
    } else if (z.aiState === "chase" && !alerted) {
      z.aiState = "search";
    }

    if (z.aiState === "wander") {
      z.position.x += Math.sin(performance.now() / 900 + z.position.x) * 0.4 * dt;
      z.position.y += Math.cos(performance.now() / 1100 + z.position.y) * 0.4 * dt;
    } else if (z.aiState === "chase" || z.aiState === "search") {
      const tx = player.position.x;
      const ty = player.position.y;
      const dx = tx - z.position.x;
      const dy = ty - z.position.y;
      const d = Math.hypot(dx, dy) || 1;
      const spd =
        z.aiState === "chase"
          ? BALANCE.zombie.chaseSpeed
          : BALANCE.zombie.walkSpeed;
      z.position.x += (dx / d) * spd * dt;
      z.position.y += (dy / d) * spd * dt;

      if (d < PLAYER_RADIUS + ZOMBIE_RADIUS + 0.15) {
        const bite = Math.random() < 0.25;
        const dmg = bite
          ? BALANCE.zombie.biteDamage
          : BALANCE.zombie.scratchDamage;
        player.hp -= dmg * dt * 2.5;
        const bleedChance = bite
          ? BALANCE.zombie.biteBleedChance
          : BALANCE.zombie.scratchBleedChance;
        if (
          Math.random() < bleedChance * dt * 1.5 &&
          !player.statusEffects.some((e) => e.kind === "bleeding")
        ) {
          player.statusEffects.push(
            createActiveStatusEffect(
              "bleeding",
              bite ? "zombie_bite" : "zombie_scratch",
              map.raidDurationSeconds - raid.timeRemainingSeconds,
            ),
          );
          pushMessage(play, bite ? "Bị cắn — chảy máu!" : "Bị cào — chảy máu!");
        }
      }

      if (z.aiState === "search" && d > BALANCE.zombie.detectVisionRange * 1.4) {
        z.aiState = "wander";
        Reflect.deleteProperty(z, "targetPlayerId");
      }
    }

    z.position = resolveCircleWalls(
      z.position,
      ZOMBIE_RADIUS,
      play.walls,
      play.bounds,
    );
  }
}
