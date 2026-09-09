import type { DrawState, VehicleKind } from "./types";
import { HORIZON_T, clamp, roadAt, laneX, curveBend } from "./road";

export interface Assets {
  player: HTMLImageElement;
  hatch: HTMLImageElement;
  sedan: HTMLImageElement;
  taxi: HTMLImageElement;
  suv: HTMLImageElement;
  truck: HTMLImageElement;
  police: HTMLImageElement;
  hatchFront: HTMLImageElement;
  sedanFront: HTMLImageElement;
  taxiFront: HTMLImageElement;
  suvFront: HTMLImageElement;
  explode: HTMLImageElement[];
}

const KIND_SRC: Record<Exclude<VehicleKind, "player">, keyof Omit<Assets, "explode" | "player">> = {
  hatch: "hatch",
  sedan: "sedan",
  taxi: "taxi",
  suv: "suv",
  truck: "truck",
  police: "police",
};

const FRONT_SRC: Record<Exclude<VehicleKind, "player">, "hatchFront" | "sedanFront" | "taxiFront" | "suvFront"> = {
  hatch: "hatchFront",
  sedan: "sedanFront",
  taxi: "taxiFront",
  suv: "suvFront",
  truck: "suvFront",
  police: "sedanFront",
};

function assetUrl(path: string) {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");
  return `${base}${path.replace(/^\//, "")}`;
}

function rAt(s: DrawState, sy: number) {
  return roadAt(sy, s.w, s.h, s.cameraY, s.playerY, s.levelId);
}

function lX(s: DrawState, lane: number, sy: number) {
  return laneX(lane, sy, s.w, s.h, s.cameraY, s.playerY, s.levelId);
}

function themeSky(theme: DrawState["theme"]): [string, string, string] {
  switch (theme) {
    case "day":
      return ["#7ea7c4", "#c5d6e2", "#dfe7dc"];
    case "dusk":
      return ["#2a3344", "#c2784a", "#e8c39a"];
    case "night":
      return ["#07080c", "#12151d", "#1a2030"];
    case "rain":
      return ["#141820", "#1c222c", "#2a3038"];
    default:
      return ["#07080c", "#12151d", "#1a2030"];
  }
}

function fillSky(ctx: CanvasRenderingContext2D, s: DrawState) {
  const [a, b, c] = themeSky(s.theme);
  const g = ctx.createLinearGradient(0, 0, 0, s.h);
  g.addColorStop(0, a);
  g.addColorStop(0.42, b);
  g.addColorStop(1, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s.w, s.h);
}

function drawSunMoon(ctx: CanvasRenderingContext2D, s: DrawState) {
  if (s.theme === "rain") return;
  ctx.save();
  if (s.theme === "day") {
    ctx.fillStyle = "#f3f1e4";
    ctx.beginPath();
    ctx.arc(s.w * 0.78, s.h * 0.12, 22, 0, Math.PI * 2);
    ctx.fill();
  } else if (s.theme === "dusk") {
    ctx.fillStyle = "#f0c27a";
    ctx.beginPath();
    ctx.arc(s.w * 0.82, s.h * 0.18, 26, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#d7dbe3";
    ctx.beginPath();
    ctx.arc(s.w * 0.76, s.h * 0.1, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(215,219,227,0.18)";
    ctx.beginPath();
    ctx.arc(s.w * 0.76, s.h * 0.1, 28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHills(ctx: CanvasRenderingContext2D, s: DrawState) {
  const horizon = s.h * HORIZON_T;
  const shift = curveBend(s.cameraY + 700, s.levelId) * 120;
  const farPeak = s.h * 0.11;
  const nearPeak = s.h * 0.07;

  ctx.fillStyle = s.theme === "day" ? "#5a6b6e" : s.theme === "dusk" ? "#262320" : "#090b0f";
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(0, horizon - farPeak * 0.3);
  ctx.quadraticCurveTo(s.w * 0.1 + shift * 0.22, horizon - farPeak, s.w * 0.22 + shift * 0.18, horizon - farPeak * 0.38);
  ctx.quadraticCurveTo(s.w * 0.38 + shift * 0.28, horizon - farPeak * 1.18, s.w * 0.52 + shift * 0.16, horizon - farPeak * 0.34);
  ctx.quadraticCurveTo(s.w * 0.68 + shift * 0.2, horizon - farPeak * 1.08, s.w * 0.82 + shift * 0.1, horizon - farPeak * 0.3);
  ctx.quadraticCurveTo(s.w * 0.92 + shift * 0.08, horizon - farPeak * 0.78, s.w, horizon - farPeak * 0.22);
  ctx.lineTo(s.w, horizon);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = s.theme === "day" ? "#4d5c4a" : s.theme === "dusk" ? "#2b2a28" : "#0c0e12";
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(0, horizon - nearPeak * 0.22);
  ctx.quadraticCurveTo(s.w * 0.18 + shift, horizon - nearPeak * 1.12, s.w * 0.34 + shift * 0.55, horizon - nearPeak * 0.26);
  ctx.quadraticCurveTo(s.w * 0.52 + shift * 0.45, horizon - nearPeak * 0.98, s.w * 0.7 + shift * 0.3, horizon - nearPeak * 0.2);
  ctx.quadraticCurveTo(s.w * 0.86 + shift * 0.22, horizon - nearPeak * 0.78, s.w, horizon + 2);
  ctx.lineTo(s.w, horizon);
  ctx.closePath();
  ctx.fill();
}

function drawGround(ctx: CanvasRenderingContext2D, s: DrawState) {
  const horizon = s.h * HORIZON_T;
  const g = ctx.createLinearGradient(0, horizon, 0, s.h);
  if (s.theme === "day") {
    g.addColorStop(0, "#5a6848");
    g.addColorStop(1, "#3e4a32");
  } else if (s.theme === "dusk") {
    g.addColorStop(0, "#3a332c");
    g.addColorStop(1, "#2a241f");
  } else {
    g.addColorStop(0, "#16181d");
    g.addColorStop(1, "#101216");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, s.w, s.h - horizon);
}

function drawRoad(ctx: CanvasRenderingContext2D, s: DrawState) {
  const horizon = s.h * HORIZON_T;
  const rumble = s.theme === "day" ? ["#c4453c", "#e8eaef"] : ["#a83b34", "#cfd3da"];
  const asphalt = s.theme === "rain" ? "#22262c" : s.theme === "day" ? "#3a3e46" : "#2c3036";
  const asphaltFar = s.theme === "rain" ? "#2a2e34" : "#3f434b";
  const shoulder = s.theme === "day" ? "#4a463c" : "#323028";
  const contra = s.theme === "day" ? "#34383f" : "#262a30";
  const mark = s.theme === "night" || s.theme === "rain" ? "#d7dbe3" : "#ececec";
  const yellow = "#e2c15a";

  for (let y = Math.floor(horizon); y < s.h; y += 2) {
    const r = rAt(s, y);
    const left = r.cx - r.roadHalf;
    const width = r.roadHalf * 2;
    const stripe = Math.floor(r.worldY / 18) % 2 === 0;
    ctx.fillStyle = rumble[stripe ? 0 : 1]!;
    ctx.fillRect(left - 7, y, 7, 2);
    ctx.fillRect(left + width, y, 7, 2);
    ctx.fillStyle = r.t < 0.35 ? asphaltFar : asphalt;
    ctx.fillRect(left, y, width, 2);
    ctx.fillStyle = contra;
    ctx.fillRect(left, y, width * 0.32, 2);
    ctx.fillStyle = shoulder;
    ctx.fillRect(left + width * 0.84, y, width * 0.16, 2);
  }

  for (let y = Math.floor(horizon); y < s.h; y += 3) {
    const r = rAt(s, y);
    const left = r.cx - r.roadHalf;
    const width = Math.max(8, r.roadHalf * 2);
    const tw = Math.max(1.5, 3.4 * r.t);
    ctx.fillStyle = yellow;
    ctx.fillRect(left + width * 0.318 - tw / 2, y, tw, 3);
    ctx.fillRect(left + width * 0.348 - tw / 2, y, tw, 3);
    ctx.fillStyle = mark;
    ctx.fillRect(left + width * 0.84 - tw / 2, y, tw, 3);
    const world = r.worldY;
    const ownOn = ((world % 56) + 56) % 56 < 28;
    const oppOn = ((-world % 56) + 56) % 56 < 28;
    if (ownOn) {
      ctx.fillRect(left + width * 0.525 - tw / 2, y, tw, 3);
      ctx.fillRect(left + width * 0.685 - tw / 2, y, tw, 3);
    }
    if (oppOn) {
      ctx.fillRect(left + width * 0.16 - tw / 2, y, tw, 3);
    }
  }
}

function drawLamps(ctx: CanvasRenderingContext2D, s: DrawState) {
  if (s.theme === "day") return;
  const horizon = s.h * HORIZON_T;
  for (let i = 0; i < 8; i++) {
    const world = Math.floor(s.cameraY / 220) * 220 + i * 220;
    const y = s.playerY - (world - s.cameraY);
    if (y < horizon || y > s.h) continue;
    const r = rAt(s, y);
    const glow = s.theme === "night" || s.theme === "rain";
    for (const side of [-1, 1]) {
      const x = r.cx + side * (r.roadHalf + 16 * r.scale);
      ctx.fillStyle = "#1a1c20";
      ctx.fillRect(x - 1.5 * r.scale, y - 70 * r.scale, 3 * r.scale, 70 * r.scale);
      if (glow) {
        const grd = ctx.createRadialGradient(x, y - 70 * r.scale, 2, x, y - 40 * r.scale, 50 * r.scale);
        grd.addColorStop(0, "rgba(232, 210, 150, 0.45)");
        grd.addColorStop(1, "rgba(232, 210, 150, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y - 48 * r.scale, 50 * r.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function carImg(assets: Assets, kind: VehicleKind, oncoming: boolean) {
  if (kind === "player") return assets.player;
  if (oncoming) return assets[FRONT_SRC[kind]];
  return assets[KIND_SRC[kind]];
}

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  s: DrawState,
  assets: Assets,
  kind: VehicleKind,
  lane: number,
  worldY: number,
  roll = 0,
  flash = 0,
  oncoming = false,
) {
  const sy = s.playerY - (worldY - s.cameraY);
  if (sy < s.h * 0.1 || sy > s.h + 40) return;
  const r = rAt(s, sy);
  const x = lX(s, lane, sy);
  const img = carImg(assets, kind, oncoming);
  const isTruck = kind === "truck";
  const laneW = r.roadHalf * 2 * 0.155;
  const baseW = clamp(laneW * (isTruck ? 0.94 : 0.84), 64 * r.scale, 176 * r.scale);
  const aspect = img.naturalHeight && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.72;
  const baseH = baseW * aspect * (isTruck ? 1.15 : 1);

  ctx.save();
  ctx.translate(x, sy);
  ctx.rotate(roll);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, baseH * 0.42, baseW * 0.38, baseH * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, -baseW / 2, -baseH * 0.72, baseW, baseH);
  } else {
    ctx.fillStyle = kind === "player" ? "#e8eaef" : "#8b93a1";
    ctx.fillRect(-baseW / 2, -baseH * 0.7, baseW, baseH);
  }
  if (flash > 0) {
    ctx.globalAlpha = flash;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-baseW / 2, -baseH * 0.72, baseW, baseH);
  }
  if (oncoming) {
    ctx.globalAlpha = s.theme === "day" ? 0.35 : 0.7;
    const glow = ctx.createRadialGradient(0, -baseH * 0.15, 2, 0, -baseH * 0.15, 28 * r.scale);
    glow.addColorStop(0, "rgba(255,236,180,0.85)");
    glow.addColorStop(1, "rgba(255,236,180,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(-baseW * 0.22, -baseH * 0.12, 16 * r.scale, 0, Math.PI * 2);
    ctx.arc(baseW * 0.22, -baseH * 0.12, 16 * r.scale, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "police") {
    const blink = Math.floor(s.cameraY / 14) % 2 === 0;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = blink ? "#3d6adf" : "#c4453c";
    ctx.beginPath();
    ctx.arc(-baseW * 0.1, -baseH * 0.58, 5 * r.scale, 0, Math.PI * 2);
    ctx.arc(baseW * 0.1, -baseH * 0.58, 5 * r.scale, 0, Math.PI * 2);
    ctx.fill();
  } else if ((s.theme === "night" || s.theme === "rain") && kind !== "player") {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#c4453c";
    ctx.fillRect(-baseW * 0.28, -baseH * 0.08, 8 * r.scale, 4 * r.scale);
    ctx.fillRect(baseW * 0.18, -baseH * 0.08, 8 * r.scale, 4 * r.scale);
  }
  ctx.restore();
}

function drawTraffic(ctx: CanvasRenderingContext2D, s: DrawState, assets: Assets) {
  const cars = s.traffic.filter((c) => c.active).sort((a, b) => b.worldY - a.worldY);
  for (const c of cars) {
    drawVehicle(ctx, s, assets, c.kind, c.lane, c.worldY, 0, 0, c.oncoming);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: DrawState, assets: Assets) {
  if (s.phase === "dying" || s.phase === "over") return;
  drawVehicle(ctx, s, assets, "player", s.playerLane, s.cameraY, s.playerRoll, s.playerFlash);
}

function drawExplode(ctx: CanvasRenderingContext2D, s: DrawState, assets: Assets) {
  if (s.explodeT < 0 || s.explodeT > 0.55) return;
  const frame = Math.min(3, Math.floor(s.explodeT / 0.12));
  const img = assets.explode[frame];
  if (!img?.complete) return;
  const size = 180 + s.explodeT * 80;
  ctx.drawImage(img, s.explodeX - size / 2, s.explodeY - size / 2, size, size);
}

function drawParticles(ctx: CanvasRenderingContext2D, s: DrawState) {
  for (const p of s.particles) {
    if (!p.active) continue;
    const a = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = a;
    if (p.kind === "rain") {
      ctx.strokeStyle = "rgba(210,220,230,0.55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 0.03, p.y + p.size);
      ctx.stroke();
    } else if (p.kind === "smoke") {
      ctx.fillStyle = "rgba(40,42,48,0.7)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.2 - a), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.kind === "spark" ? "#f0d0a0" : "#9aa3b0";
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}

function drawSpeedlines(ctx: CanvasRenderingContext2D, s: DrawState) {
  if (s.reduced || s.speed < 360) return;
  const n = Math.floor((s.speed - 340) / 30);
  ctx.strokeStyle = "rgba(232,234,239,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const x = (s.w * (i + 1)) / (n + 1);
    const len = 18 + (s.speed - 340) * 0.08;
    ctx.beginPath();
    ctx.moveTo(x, s.h * 0.3);
    ctx.lineTo(x, s.h * 0.3 + len);
    ctx.stroke();
  }
}

function drawFloaters(ctx: CanvasRenderingContext2D, s: DrawState) {
  ctx.save();
  ctx.font = "700 22px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.12em";
  for (const f of s.floaters) {
    if (!f.active) continue;
    ctx.globalAlpha = clamp(f.life * 1.4, 0, 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, s: DrawState) {
  const g = ctx.createRadialGradient(s.w / 2, s.h * 0.55, s.h * 0.2, s.w / 2, s.h * 0.5, s.h * 0.78);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s.w, s.h);
  if (s.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${s.flash * 0.35})`;
    ctx.fillRect(0, 0, s.w, s.h);
  }
}

export function drawWorld(ctx: CanvasRenderingContext2D, s: DrawState, assets: Assets) {
  ctx.save();
  ctx.translate(s.shakeX, s.shakeY);
  fillSky(ctx, s);
  drawSunMoon(ctx, s);
  drawHills(ctx, s);
  drawGround(ctx, s);
  drawRoad(ctx, s);
  drawLamps(ctx, s);
  drawTraffic(ctx, s, assets);
  drawPlayer(ctx, s, assets);
  drawExplode(ctx, s, assets);
  drawParticles(ctx, s);
  drawSpeedlines(ctx, s);
  drawFloaters(ctx, s);
  drawVignette(ctx, s);
  ctx.restore();
}

export function loadAssets(): Promise<Assets> {
  const names = ["player", "hatch", "sedan", "taxi", "suv", "truck", "police"] as const;
  const load = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`sprite ${src}`));
      img.src = src;
    });
  return Promise.all([
    ...names.map((n) => load(assetUrl(`sprites/${n}.png?v=2`))),
    load(assetUrl("sprites/hatch-front.png?v=1")),
    load(assetUrl("sprites/sedan-front.png?v=1")),
    load(assetUrl("sprites/taxi-front.png?v=1")),
    load(assetUrl("sprites/suv-front.png?v=1")),
    load(assetUrl("sprites/explode-1.png")),
    load(assetUrl("sprites/explode-2.png")),
    load(assetUrl("sprites/explode-3.png")),
    load(assetUrl("sprites/explode-4.png")),
  ]).then((imgs) => ({
    player: imgs[0]!,
    hatch: imgs[1]!,
    sedan: imgs[2]!,
    taxi: imgs[3]!,
    suv: imgs[4]!,
    truck: imgs[5]!,
    police: imgs[6]!,
    hatchFront: imgs[7]!,
    sedanFront: imgs[8]!,
    taxiFront: imgs[9]!,
    suvFront: imgs[10]!,
    explode: [imgs[11]!, imgs[12]!, imgs[13]!, imgs[14]!],
  }));
}

export function emptyAssets(): Assets {
  const blank = new Image();
  return {
    player: blank,
    hatch: blank,
    sedan: blank,
    taxi: blank,
    suv: blank,
    truck: blank,
    police: blank,
    hatchFront: blank,
    sedanFront: blank,
    taxiFront: blank,
    suvFront: blank,
    explode: [blank, blank, blank, blank],
  };
}
