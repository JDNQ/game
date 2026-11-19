import type { Vec2 } from "./maps.js";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WorldGeometry {
  bounds: Rect;
  /** Solid buildings / walls. */
  walls: Rect[];
  /** Slow + infection risk when standing inside. */
  floodZones: Rect[];
  labels: { text: string; position: Vec2 }[];
}

/** Collision + landmark layout for khu dân cư ven kênh. */
export const CANAL_WORLD: WorldGeometry = {
  bounds: { x: 0, y: 0, w: 56, h: 48 },
  walls: [
    // Nhà ống block near NPC
    { x: 24, y: 12, w: 6, h: 2 },
    { x: 24, y: 12, w: 2, h: 8 },
    { x: 28, y: 12, w: 2, h: 8 },
    // Trạm y tế
    { x: 28, y: 16, w: 8, h: 1.2 },
    { x: 28, y: 20, w: 8, h: 1.2 },
    { x: 28, y: 16, w: 1.2, h: 5.2 },
    { x: 34.8, y: 16, w: 1.2, h: 5.2 },
    // Chợ stalls
    { x: 18, y: 26, w: 3, h: 2 },
    { x: 22, y: 30, w: 3, h: 2 },
    { x: 26, y: 26, w: 3, h: 2 },
    // Corner shop
    { x: 38, y: 10, w: 6, h: 5 },
    // Hẻm walls north
    { x: 8, y: 0, w: 1.5, h: 10 },
    { x: 16, y: 0, w: 1.5, h: 10 },
    // Warehouse east
    { x: 46, y: 18, w: 8, h: 10 },
  ],
  floodZones: [
    { x: 0, y: 42, w: 56, h: 6 },
    { x: 0, y: 36, w: 6, h: 12 },
  ],
  labels: [
    { text: "Hẻm Bắc", position: { x: 12, y: 2 } },
    { text: "Nhà ống", position: { x: 27, y: 14 } },
    { text: "Trạm y tế", position: { x: 32, y: 18 } },
    { text: "Chợ", position: { x: 23, y: 28 } },
    { text: "Cửa hàng", position: { x: 41, y: 12 } },
    { text: "Bến phà", position: { x: 8, y: 40 } },
    { text: "Ngập", position: { x: 28, y: 45 } },
  ],
};

export function circleHitsRect(
  cx: number,
  cy: number,
  radius: number,
  r: Rect,
): boolean {
  const nearestX = Math.max(r.x, Math.min(cx, r.x + r.w));
  const nearestY = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function pointInRect(p: Vec2, r: Rect): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

export function resolveCircleWalls(
  pos: Vec2,
  radius: number,
  walls: readonly Rect[],
  bounds: Rect,
): Vec2 {
  let { x, y } = pos;
  x = Math.max(bounds.x + radius, Math.min(bounds.x + bounds.w - radius, x));
  y = Math.max(bounds.y + radius, Math.min(bounds.y + bounds.h - radius, y));

  for (const wall of walls) {
    if (!circleHitsRect(x, y, radius, wall)) continue;
    const nearestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const nearestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    let dx = x - nearestX;
    let dy = y - nearestY;
    let dist = Math.hypot(dx, dy);
    if (dist < 0.0001) {
      // Center stuck inside: push out via shortest axis
      const left = x - wall.x;
      const right = wall.x + wall.w - x;
      const top = y - wall.y;
      const bottom = wall.y + wall.h - y;
      const m = Math.min(left, right, top, bottom);
      if (m === left) x = wall.x - radius;
      else if (m === right) x = wall.x + wall.w + radius;
      else if (m === top) y = wall.y - radius;
      else y = wall.y + wall.h + radius;
      continue;
    }
    const overlap = radius - dist;
    if (overlap > 0) {
      dx /= dist;
      dy /= dist;
      x += dx * overlap;
      y += dy * overlap;
    }
  }
  return { x, y };
}
