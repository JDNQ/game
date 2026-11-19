import { getItemDefinition } from "../shared/items.js";
import { getMapDefinition } from "../shared/maps.js";
import { CANAL_WORLD } from "../shared/worldGeometry.js";
import { BALANCE } from "../shared/balance.js";
import { itemStackWeightKg } from "../shared/items.js";
import type { PlayableRaid } from "./playable.js";
import { SCALE, worldToScreen } from "./raidSim.js";

function drawRect(
  ctx: CanvasRenderingContext2D,
  play: PlayableRaid,
  camX: number,
  camY: number,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
): void {
  const a = worldToScreen(x, y, camX, camY, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = fill;
  ctx.fillRect(a.x, a.y, w * SCALE, h * SCALE);
}

export function renderRaid(
  ctx: CanvasRenderingContext2D,
  play: PlayableRaid,
): void {
  const { width, height } = ctx.canvas;
  const player = play.raid.players[0]!;
  const camX = player.position.x;
  const camY = player.position.y;
  const map = getMapDefinition(play.raid.mapId);

  // Atmosphere
  const sky =
    play.raid.weather === "rain"
      ? "#1a2430"
      : play.raid.weather === "flood_risk"
        ? "#1c2a28"
        : "#243028";
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Ground
  drawRect(
    ctx,
    play,
    camX,
    camY,
    play.bounds.x,
    play.bounds.y,
    play.bounds.w,
    play.bounds.h,
    "#3d4f3a",
  );

  // Flood
  for (const z of play.floodZones) {
    drawRect(ctx, play, camX, camY, z.x, z.y, z.w, z.h, "rgba(40,90,140,0.45)");
  }

  // Roads hint
  drawRect(ctx, play, camX, camY, 10, 0, 4, 48, "#4a5348");
  drawRect(ctx, play, camX, camY, 0, 20, 56, 3.5, "#4a5348");

  // Walls / buildings
  for (const w of play.walls) {
    drawRect(ctx, play, camX, camY, w.x, w.y, w.w, w.h, "#2a221c");
    const a = worldToScreen(w.x, w.y, camX, camY, width, height);
    ctx.strokeStyle = "#5a4638";
    ctx.strokeRect(a.x, a.y, w.w * SCALE, w.h * SCALE);
  }

  // Labels
  ctx.font = "12px 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(220,220,200,0.55)";
  for (const label of CANAL_WORLD.labels) {
    const p = worldToScreen(
      label.position.x,
      label.position.y,
      camX,
      camY,
      width,
      height,
    );
    ctx.fillText(label.text, p.x, p.y);
  }

  // Extraction zone
  const ex = map.extractions[0]!;
  const exRt = play.raid.extractions[0]!;
  const ep = worldToScreen(ex.position.x, ex.position.y, camX, camY, width, height);
  ctx.beginPath();
  ctx.arc(ep.x, ep.y, 2.2 * SCALE, 0, Math.PI * 2);
  ctx.fillStyle = exRt.isActive
    ? "rgba(80,200,120,0.35)"
    : "rgba(80,160,220,0.28)";
  ctx.fill();
  ctx.strokeStyle = "#7ec8ff";
  ctx.stroke();
  ctx.fillStyle = "#cfefff";
  ctx.fillText("BẾN PHÀ", ep.x - 24, ep.y - 2.4 * SCALE);

  // Loot
  for (const loot of play.loot) {
    const p = worldToScreen(
      loot.position.x,
      loot.position.y,
      camX,
      camY,
      width,
      height,
    );
    ctx.fillStyle = loot.risk >= 4 ? "#e8c56a" : "#a8d88a";
    ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
  }

  // NPC
  for (const npc of play.raid.survivors) {
    if (npc.hasExtracted) continue;
    const p = worldToScreen(
      npc.position.x,
      npc.position.y,
      camX,
      camY,
      width,
      height,
    );
    ctx.beginPath();
    ctx.arc(p.x, p.y, 0.4 * SCALE, 0, Math.PI * 2);
    ctx.fillStyle = npc.isEscorting ? "#6ec6ff" : "#f0d878";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(npc.isEscorting ? "NPC+" : "NPC", p.x - 12, p.y - 12);
  }

  // Zombies
  for (const z of play.raid.zombies) {
    const p = worldToScreen(
      z.position.x,
      z.position.y,
      camX,
      camY,
      width,
      height,
    );
    ctx.beginPath();
    ctx.arc(p.x, p.y, 0.5 * SCALE, 0, Math.PI * 2);
    ctx.fillStyle =
      z.aiState === "chase"
        ? "#c23b2a"
        : z.aiState === "search"
          ? "#c27a2a"
          : "#6a7a4a";
    ctx.fill();
  }

  // Noise rings
  for (const n of play.noises) {
    const p = worldToScreen(n.x, n.y, camX, camY, width, height);
    ctx.beginPath();
    ctx.arc(p.x, p.y, n.radius * SCALE * (n.ttl > 0.5 ? 1 : n.ttl * 2), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,200,80,${Math.min(0.7, n.ttl)})`;
    ctx.stroke();
  }

  // Player
  const pp = worldToScreen(
    player.position.x,
    player.position.y,
    camX,
    camY,
    width,
    height,
  );
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, 0.45 * SCALE, 0, Math.PI * 2);
  ctx.fillStyle = player.isDowned ? "#555" : "#dce8ff";
  ctx.fill();
  ctx.strokeStyle = "#8af";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pp.x, pp.y);
  ctx.lineTo(
    pp.x + Math.cos(play.facing) * 14,
    pp.y + Math.sin(play.facing) * 14,
  );
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.lineWidth = 1;

  // Rain overlay
  if (play.raid.weather === "rain") {
    ctx.strokeStyle = "rgba(180,200,220,0.25)";
    for (let i = 0; i < 60; i++) {
      const rx = (i * 97 + performance.now() * 0.2) % width;
      const ry = (i * 53 + performance.now() * 0.45) % height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 2, ry + 10);
      ctx.stroke();
    }
  }

  drawHud(ctx, play);
}

function drawHud(ctx: CanvasRenderingContext2D, play: PlayableRaid): void {
  const player = play.raid.players[0]!;
  const { width } = ctx.canvas;
  const weight = player.carried.reduce((s, i) => s + itemStackWeightKg(i), 0);
  const ammo = player.carried
    .filter((i) => i.definitionId === "pistol_ammo")
    .reduce((s, i) => s + i.quantity, 0);
  const mm = Math.floor(play.raid.timeRemainingSeconds / 60);
  const ss = Math.floor(play.raid.timeRemainingSeconds % 60);

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(12, 12, 280, 118);
  ctx.fillStyle = "#e8efe6";
  ctx.font = "13px 'Segoe UI', sans-serif";
  ctx.fillText(`HP ${Math.ceil(player.hp)} / ${BALANCE.player.maxHp}`, 24, 34);
  ctx.fillStyle = "#3a8";
  ctx.fillRect(24, 40, Math.max(0, (player.hp / BALANCE.player.maxHp) * 200), 8);
  ctx.fillStyle = "#e8efe6";
  ctx.fillText(
    `Stamina ${Math.ceil(player.stamina)}`,
    24,
    66,
  );
  ctx.fillStyle = "#48a";
  ctx.fillRect(
    24,
    72,
    Math.max(0, (player.stamina / BALANCE.player.maxStamina) * 200),
    6,
  );
  ctx.fillStyle = "#e8efe6";
  ctx.fillText(
    `Tải ${weight.toFixed(1)}/${BALANCE.player.baseCarryWeightKg}kg · Đạn ${ammo}`,
    24,
    98,
  );
  ctx.fillText(
    `Thời gian ${mm}:${ss.toString().padStart(2, "0")} · ${play.raid.weather === "rain" ? "Mưa" : "Quang"}`,
    24,
    118,
  );

  // Effects
  let ey = 140;
  for (const e of player.statusEffects) {
    ctx.fillStyle = e.kind === "bleeding" ? "#e55" : "#eaa";
    ctx.fillText(
      `${e.kind === "bleeding" ? "Chảy máu" : "Kiệt sức"} x${e.intensity}`,
      24,
      ey,
    );
    ey += 16;
  }

  // Inventory strip
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(width - 240, 12, 228, 160);
  ctx.fillStyle = "#e8efe6";
  ctx.fillText("Túi đồ", width - 228, 32);
  let iy = 50;
  const counts = new Map<string, number>();
  for (const item of player.carried) {
    counts.set(
      item.definitionId,
      (counts.get(item.definitionId) ?? 0) + item.quantity,
    );
  }
  for (const [id, qty] of counts) {
    ctx.fillText(`${getItemDefinition(id).name} x${qty}`, width - 228, iy);
    iy += 18;
  }

  if (play.interactHint) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    const tw = ctx.measureText(play.interactHint).width + 24;
    ctx.fillRect(width / 2 - tw / 2, ctx.canvas.height - 70, tw, 28);
    ctx.fillStyle = "#ffe9a8";
    ctx.fillText(play.interactHint, width / 2 - tw / 2 + 12, ctx.canvas.height - 50);
  }

  // Messages
  let my = ctx.canvas.height - 100;
  for (let i = play.messages.length - 1; i >= 0; i--) {
    const m = play.messages[i]!;
    ctx.fillStyle = `rgba(255,240,200,${Math.min(1, m.ttl)})`;
    ctx.fillText(m.text, 24, my);
    my -= 18;
  }

  ctx.fillStyle = "rgba(200,200,180,0.5)";
  ctx.font = "11px 'Segoe UI', sans-serif";
  ctx.fillText(
    "WASD di chuyển · Shift chạy · Chuột nhắm/bắn · E tương tác · 1 băng gạc · 2 nước",
    12,
    ctx.canvas.height - 12,
  );
}
