export const HORIZON_T = 0.16;
export const LANE_MIN = -2;
export const LANE_MAX = 3;

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function playWidth(w: number, _h: number) {
  return Math.max(360, w * 0.99);
}

function hash01(n: number) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 374761393);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const SUPER = 5600;

export function curveBend(worldY: number, levelId: number): number {
  if (levelId < 2) return 0;
  const y = Math.max(0, worldY);
  const i = Math.floor(y / SUPER);
  const t = (y - i * SUPER) / SUPER;
  const seed = 23 + levelId * 17;
  const base = i === 0 ? 0.3 : 0.56;
  const straightFrac = clamp(base + hash01(i + seed) * 0.18 - (levelId - 2) * 0.012, 0.28, 0.8);
  if (t < straightFrac) return 0;

  const packT = (t - straightFrac) / Math.max(0.12, 1 - straightFrac);
  const env = Math.sin(clamp(packT, 0, 1) * Math.PI);
  if (env <= 0.002) return 0;

  const dir = hash01(i * 7 + seed) > 0.5 ? 1 : -1;
  const freq = 1.05 + hash01(i * 11 + seed) * 2.35;
  const wobble = 0.18 + hash01(i * 13 + seed) * 0.28;
  const amp = (0.54 + (levelId - 2) * 0.09) * (0.78 + hash01(i * 19 + seed) * 0.5);
  return dir * env * (Math.sin(packT * Math.PI * freq) + Math.sin(packT * Math.PI * freq * 0.45 + 0.8) * wobble) * amp;
}

const LANE_KEYS = [-2, -1, 0, 1, 2, 3];
const LANE_FRACS = [0.09, 0.23, 0.445, 0.605, 0.76, 0.925];

export function laneFrac(lane: number): number {
  if (lane <= LANE_KEYS[0]!) return LANE_FRACS[0]!;
  if (lane >= LANE_KEYS[5]!) return LANE_FRACS[5]!;
  for (let i = 0; i < 5; i++) {
    const a = LANE_KEYS[i]!;
    const b = LANE_KEYS[i + 1]!;
    if (lane <= b) {
      const u = (lane - a) / (b - a);
      return LANE_FRACS[i]! + (LANE_FRACS[i + 1]! - LANE_FRACS[i]!) * u;
    }
  }
  return 0.605;
}

export function roadAt(
  sy: number,
  w: number,
  h: number,
  cameraY = 0,
  playerY = h * 0.78,
  levelId = 1,
) {
  const horizon = h * HORIZON_T;
  const t = clamp((sy - horizon) / (h - horizon), 0, 1);
  const pw = playWidth(w, h);
  const roadHalf = Math.min((0.36 + 0.66 * t) * pw * 0.5, w * 0.48 - 8);
  const worldY = cameraY + (playerY - sy);
  const delta = curveBend(worldY, levelId) - curveBend(cameraY, levelId);
  const bend = delta * pw * 0.36 * (0.5 + 0.5 * t);
  const cx = clamp(w / 2 + bend, roadHalf + 8, w - roadHalf - 8);
  return { t, horizon, cx, roadHalf, scale: 0.34 + 0.66 * t, worldY };
}

export function laneX(
  lane: number,
  sy: number,
  w: number,
  h: number,
  cameraY = 0,
  playerY = h * 0.78,
  levelId = 1,
) {
  const r = roadAt(sy, w, h, cameraY, playerY, levelId);
  return r.cx - r.roadHalf + laneFrac(lane) * r.roadHalf * 2;
}

export function isOncomingLane(lane: number) {
  return lane < 0;
}

export function isShoulder(lane: number) {
  return lane >= 2.5;
}
