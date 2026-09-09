import { DIFFICULTY_LABEL, DIFFICULTY_ORDER, LEVELS, MAX_SPEED, tuneLevel } from "./levels";
import type {
  Difficulty,
  DrawState,
  Floater,
  Hud,
  Lane,
  Particle,
  Phase,
  TrafficCar,
  VehicleKind,
} from "./types";
import { loadSave, writeSave, type SaveData } from "./save";
import * as audio from "./audio";
import { clamp, laneX, LANE_MIN, LANE_MAX } from "./road";

const STEP = 1 / 60;
const MAX_ACC = 0.1;
const POOL = 72;
const PARTS = 96;
const FLOATS = 12;
const CAR_LEN = 72;
const TRUCK_LEN = 118;
const PLAYER_LEN = 70;
const SWITCH_T = 0.16;
const FOLLOW_DIST = 140;
const RAM_SPEED = 70;

export interface Engine {
  tick: (dt: number, keys: Set<string>, canvasW: number, canvasH: number) => void;
  startRun: (levelId: number) => void;
  skipLevel: (dir: number) => void;
  cycleDifficulty: () => void;
  pause: () => void;
  resume: () => void;
  retry: () => void;
  continueLevel: () => void;
  quitToTitle: () => void;
  nudge: (dir: number) => void;
  hud: () => Hud;
  setMuted: (v: boolean) => void;
  snapshot: () => DrawState;
  destroy: () => void;
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function createEngine(): Engine {
  const save: SaveData = loadSave();
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let phase: Phase = "attract";
  let levelIndex = 0;
  let score = 0;
  let overtakes = 0;
  let totalOvertakes = 0;
  let combo = 0;
  let comboT = 0;
  let distance = 0;
  let banner = "";
  let bannerT = 0;
  let startLevelId = 1;

  let playerLane: Lane = 1;
  let fromLane: number = 1;
  let toLane: number = 1;
  let switchT = 1;
  let playerWorldY = 0;
  let speed = LEVELS[0]!.speed;
  let invuln = 0;
  let dieT = 0;
  let trauma = 0;
  let flash = 0;
  let playerFlash = 0;
  let explodeT = -1;
  let explodeX = 0;
  let explodeY = 0;
  let w = 390;
  let h = 844;
  let nextSpawnY = 400;
  let nextOppY = 500;
  let idSeq = 1;
  let attractSteerT = 0;
  let injected = new Set<string>();
  let injectedSteer = 0;
  let noiseT = 0;
  let passLane: Lane = 1;
  let passStreak = 0;
  let heat = 0;
  let fines = 0;
  let ticketT = 0;
  let ticketCd = 0;
  let throttle = 0;
  let difficulty: Difficulty = save.difficulty;

  const traffic: TrafficCar[] = Array.from({ length: POOL }, () => ({
    id: 0,
    active: false,
    lane: 1,
    worldY: 0,
    kind: "sedan" as const,
    length: CAR_LEN,
    speed: 100,
    passed: false,
    nearMissed: false,
    oncoming: false,
  }));
  const particles: Particle[] = Array.from({ length: PARTS }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    max: 1,
    size: 2,
    kind: "dust" as const,
  }));
  const floaters: Floater[] = Array.from({ length: FLOATS }, () => ({
    active: false,
    text: "",
    x: 0,
    y: 0,
    life: 0,
    color: "#e8eaef",
  }));

  function visualLane() {
    const t = clamp(switchT, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    return fromLane + (toLane - fromLane) * e;
  }

  function playerScreenY() {
    return h * 0.78;
  }

  function persist() {
    save.highScore = Math.max(save.highScore, score);
    save.bestOvertakes = Math.max(save.bestOvertakes, totalOvertakes);
    writeSave(save);
  }

  function emitFloater(text: string, color: string) {
    const f = floaters.find((p) => !p.active);
    if (!f) return;
    f.active = true;
    f.text = text;
    f.x = w / 2;
    f.y = playerScreenY() - 90;
    f.life = 0.85;
    f.color = color;
  }

  function burst(x: number, y: number, n: number, kind: Particle["kind"]) {
    let left = n;
    for (const p of particles) {
      if (left <= 0) break;
      if (p.active) continue;
      p.active = true;
      p.kind = kind;
      p.x = x;
      p.y = y;
      p.vx = rand(-90, 90);
      p.vy = rand(-140, 40);
      p.life = rand(0.25, 0.7);
      p.max = p.life;
      p.size = kind === "smoke" ? rand(8, 18) : rand(2, 5);
      left--;
    }
  }

  function allocCar(): TrafficCar | null {
    return traffic.find((c) => !c.active) ?? null;
  }

  function spawnCar(
    lane: Lane,
    atY: number,
    oncoming: boolean,
    lv: (typeof LEVELS)[number],
  ) {
    const car = allocCar();
    if (!car) return;
    const police = !oncoming && Math.random() < 0.13;
    const truck = !oncoming && !police && Math.random() < lv.truckChance;
    const kinds: Exclude<VehicleKind, "player">[] = police
      ? ["police"]
      : truck
        ? ["truck"]
        : ["hatch", "sedan", "taxi", "suv"];
    car.active = true;
    car.id = idSeq++;
    car.lane = lane;
    car.worldY = atY + rand(-8, 8);
    car.kind = pick(kinds);
    car.length = car.kind === "truck" ? TRUCK_LEN : CAR_LEN;
    car.speed = oncoming
      ? -(lv.traffic * 1.55 + 90) * rand(0.9, 1.12)
      : police
        ? lv.traffic * rand(1.02, 1.14)
        : lv.traffic * rand(0.88, 1.08);
    car.passed = false;
    car.nearMissed = false;
    car.oncoming = oncoming;
  }

  function currentLevel() {
    return tuneLevel(LEVELS[levelIndex]!, difficulty);
  }

  function spawnRow(atY: number, forceLane?: Lane) {
    const lv = currentLevel();
    const blocked = (lane: Lane) =>
      traffic.some(
        (c) => c.active && c.lane === lane && Math.abs(c.worldY - atY) < Math.max(c.length, CAR_LEN) * 1.8,
      );

    if (passStreak <= 0) {
      const options = ([0, 1, 2] as Lane[]).filter((l) => l !== passLane);
      passLane = pick(options);
      passStreak = 3 + Math.floor(Math.random() * 4);
    }
    passStreak -= 1;

    const free = ([0, 1, 2] as Lane[]).filter((l) => !blocked(l) && l !== passLane);
    if (free.length === 0) return;
    const occupied = new Set<Lane>();
    if (forceLane !== undefined && free.includes(forceLane)) occupied.add(forceLane);
    else {
      occupied.add(pick(free));
      const wantTwo = Math.random() < lv.doubleChance && free.length >= 2;
      if (wantTwo) {
        const rest = free.filter((l) => !occupied.has(l));
        if (rest.length) occupied.add(pick(rest));
      }
    }
    occupied.delete(passLane);
    for (const lane of occupied) spawnCar(lane, atY, false, lv);
  }

  function spawnOncoming(atY: number) {
    const lv = currentLevel();
    if (lv.id < 2 && difficulty !== "pro") return;
    const blocked = (lane: Lane) =>
      traffic.some(
        (c) => c.active && c.lane === lane && Math.abs(c.worldY - atY) < Math.max(c.length, CAR_LEN) * 1.6,
      );
    const free = ([-2, -1] as Lane[]).filter((l) => !blocked(l));
    if (free.length === 0) return;
    const first = pick(free);
    spawnCar(first, atY, true, lv);
    if (free.length > 1 && Math.random() < 0.28) {
      const rest = free.filter((l) => l !== first);
      if (rest[0] !== undefined) spawnCar(rest[0], atY + rand(-40, 40), true, lv);
    }
  }

  function clearPool() {
    for (const c of traffic) c.active = false;
    for (const p of particles) p.active = false;
    for (const f of floaters) f.active = false;
  }

  function configureLevel(idx: number, keepScore: boolean) {
    levelIndex = clamp(idx, 0, LEVELS.length - 1);
    const lv = currentLevel();
    speed = lv.speed;
    if (!keepScore) {
      score = 0;
      totalOvertakes = 0;
      distance = 0;
    }
    overtakes = 0;
    combo = 0;
    comboT = 0;
    playerLane = 1;
    fromLane = 1;
    toLane = 1;
    switchT = 1;
    invuln = 1.4;
    dieT = 0;
    explodeT = -1;
    flash = 0;
    playerFlash = 0;
    trauma = 0;
    passLane = 1;
    passStreak = 5;
    heat = 0;
    ticketT = 0;
    ticketCd = 0;
    throttle = 0;
    banner = lv.id === 8 ? "INFINITO" : `NIVEL ${lv.id}`;
    bannerT = 1.6;
    clearPool();
    nextSpawnY = playerWorldY + 260;
    nextOppY = playerWorldY + 520;
    const seedGap = Math.max(150, lv.spawnDistance);
    for (let i = 0; i < 7; i++) {
      spawnRow(nextSpawnY, i % 2 === 0 ? 0 : 2);
      nextSpawnY += seedGap + rand(0, 28);
    }
    if (lv.id >= 2 || difficulty === "pro") spawnOncoming(playerWorldY + 640);
  }

  function startSwitch(next: Lane) {
    if (next === toLane) return;
    if (switchT < 1 && Math.abs(toLane - fromLane) >= 1 && next === fromLane) {
      fromLane = visualLane();
      toLane = next;
      switchT = 0;
      playerLane = next;
      audio.sfxWhoosh();
      return;
    }
    if (switchT < 0.55) return;
    fromLane = visualLane();
    toLane = next;
    switchT = 0;
    playerLane = next;
    audio.sfxWhoosh();
  }

  function beginAttract() {
    phase = "attract";
    playerWorldY = 0;
    configureLevel(0, false);
    invuln = 999;
    banner = "";
    audio.updateEngine(speed, false);
  }

  function startRun(levelId: number) {
    startLevelId = clamp(levelId, 1, save.unlocked);
    playerWorldY = 0;
    distance = 0;
    score = 0;
    totalOvertakes = 0;
    fines = 0;
    configureLevel(startLevelId - 1, false);
    phase = "playing";
    audio.startEngine();
    audio.updateEngine(speed, true);
  }

  function kill() {
    if (phase !== "playing" || invuln > 0) return;
    phase = "dying";
    dieT = 0;
    explodeT = 0;
    explodeX = w / 2;
    explodeY = playerScreenY();
    trauma = reduced ? 0.25 : 0.9;
    flash = 0.7;
    audio.sfxCrash();
    audio.updateEngine(speed, false);
    burst(explodeX, explodeY, 28, "spark");
    burst(explodeX, explodeY, 10, "smoke");
    persist();
  }

  function issueFine() {
    if (phase !== "playing" || ticketCd > 0 || invuln > 0.25) return;
    fines += 1;
    score = Math.max(0, score - 150);
    heat = 0.1;
    ticketT = 1.35;
    ticketCd = 3.6;
    flash = Math.max(flash, 0.28);
    emitFloater("MULTA", "#c4453c");
    audio.sfxTicket();
  }

  function step(dt: number, keys: Set<string>) {
    noiseT += dt;
    const lv = currentLevel();
    const left =
      keys.has("KeyA") ||
      keys.has("ArrowLeft") ||
      injected.has("KeyA") ||
      injected.has("ArrowLeft") ||
      injectedSteer > 0.4;
    const right =
      keys.has("KeyD") ||
      keys.has("ArrowRight") ||
      injected.has("KeyD") ||
      injected.has("ArrowRight") ||
      injectedSteer < -0.4;
    const holdBoost =
      keys.has("KeyW") || keys.has("ArrowUp") || injected.has("KeyW") || injected.has("ArrowUp");
    const holdBrake =
      keys.has("KeyS") || keys.has("ArrowDown") || injected.has("KeyS") || injected.has("ArrowDown");

    if (phase === "attract") {
      attractSteerT -= dt;
      if (attractSteerT <= 0) {
        attractSteerT = rand(0.8, 1.6);
        const n = pick<Lane>([0, 1, 2]);
        startSwitch(n);
      }
    } else if (phase === "playing") {
      if (left && !right) {
        const next = clamp(Math.round(toLane) - 1, LANE_MIN, LANE_MAX);
        startSwitch(next);
      } else if (right && !left) {
        const next = clamp(Math.round(toLane) + 1, LANE_MIN, LANE_MAX);
        startSwitch(next);
      }
    }

    if (switchT < 1) {
      const rainSlow = lv.theme === "rain" ? 0.78 : 1;
      const cross = (fromLane >= 0) !== (toLane >= 0);
      const dur = (SWITCH_T * (cross ? 1.28 : 1)) / rainSlow;
      switchT = clamp(switchT + dt / dur, 0, 1);
      if (switchT >= 1) {
        fromLane = toLane;
        playerLane = toLane;
      }
    }

    const target = phase === "dying" ? speed * 0.2 : lv.speed;
    let desired = target;
    const laneNow = Math.round(visualLane()) as Lane;
    let leader: TrafficCar | null = null;
    let leaderGap = Infinity;
    if (phase === "playing" || phase === "attract") {
      for (const car of traffic) {
        if (!car.active || car.oncoming || car.lane !== laneNow) continue;
        const gap = car.worldY - playerWorldY;
        if (gap > 8 && gap < leaderGap) {
          leaderGap = gap;
          leader = car;
        }
      }
    }
    if (phase === "playing") {
      if (holdBoost) desired = Math.min(MAX_SPEED, target * 1.22);
      if (holdBrake) desired = Math.min(desired, Math.max(55, lv.traffic * 0.5));
      if (leader && leaderGap < FOLLOW_DIST && !holdBoost) {
        const tightness = 1 - leaderGap / FOLLOW_DIST;
        const followSpeed = leader.speed * 0.96;
        desired = desired * (1 - tightness * tightness) + followSpeed * tightness * tightness;
      }
    }
    const rate = holdBrake ? 7.2 : leader && leaderGap < FOLLOW_DIST ? 5.4 : 3.2;
    speed += (desired - speed) * (1 - Math.exp(-rate * dt));
    if (leader && leaderGap < (PLAYER_LEN + leader.length) * 0.45 && !holdBoost) {
      speed = Math.min(speed, leader.speed);
    }

    const wantThrot = holdBrake ? -1 : holdBoost ? 1 : 0;
    throttle += (wantThrot - throttle) * (1 - Math.exp(-11 * dt));

    if (phase === "playing" || phase === "attract" || phase === "dying") {
      playerWorldY += speed * dt;
      if (phase === "playing") distance += speed * dt;
    }

    if (phase === "playing") {
      const rel = Math.max(40, speed - lv.traffic);
      const gap = Math.max(132, lv.spawnDistance, rel * 0.52);
      const lookAhead = Math.max(640, h * 0.72, rel * 1.8);
      while (playerWorldY + lookAhead > nextSpawnY) {
        spawnRow(nextSpawnY);
        nextSpawnY += gap + rand(0, 28);
      }
      if (lv.id >= 2 || difficulty === "pro") {
        while (playerWorldY + lookAhead > nextOppY) {
          spawnOncoming(nextOppY);
          nextOppY += 280 + rand(0, 140);
        }
      }
    } else if (phase === "attract") {
      while (playerWorldY + h * 0.95 > nextSpawnY) {
        spawnRow(nextSpawnY);
        nextSpawnY += 260;
      }
      if (lv.id >= 2) {
        while (playerWorldY + h * 0.95 > nextOppY) {
          spawnOncoming(nextOppY);
          nextOppY += 380;
        }
      }
    }

    const vLane = visualLane();
    const collideLane = Math.round(vLane);

    for (const car of traffic) {
      if (!car.active) continue;
      car.worldY += car.speed * dt;
      if (car.worldY < playerWorldY - 280) {
        car.active = false;
        continue;
      }
      const overlapY = Math.abs(car.worldY - playerWorldY) < (PLAYER_LEN + car.length) * 0.28;
      if (phase === "playing" && overlapY) {
        if (car.lane === collideLane) {
          const ahead = car.worldY >= playerWorldY - 6;
          const closing = speed - car.speed;
          if (!car.oncoming && ahead && closing < RAM_SPEED) {
            speed = Math.min(speed, car.speed);
            const minGap = (PLAYER_LEN + car.length) * 0.42;
            if (car.worldY - playerWorldY < minGap) {
              playerWorldY = car.worldY - minGap;
            }
          } else {
            explodeX = w / 2;
            explodeY = playerScreenY() - 10;
            kill();
          }
        } else if (!car.nearMissed && Math.abs(car.lane - collideLane) === 1) {
          car.nearMissed = true;
          combo += 1;
          comboT = 1.4;
          const bonus = (car.oncoming ? 40 : 20) + combo * 5;
          score += bonus;
          flash = Math.max(flash, 0.12);
          emitFloater(car.oncoming ? "CONTRA" : combo > 2 ? `CERCA x${combo}` : "CERCA", "#d7dbe3");
          burst(w / 2, playerScreenY() - 40, 6, "dust");
        }
      }
      if (
        !car.oncoming &&
        !car.passed &&
        car.worldY + car.length * 0.2 < playerWorldY - PLAYER_LEN * 0.2
      ) {
        car.passed = true;
        if (phase === "playing") {
          overtakes += 1;
          totalOvertakes += 1;
          const gained = 100 + combo * 10;
          score += gained;
          audio.sfxOvertake();
          emitFloater("+REBASE", "#e8eaef");
          if (laneNow >= 3 || laneNow < 0) heat = Math.min(1.4, heat + 0.36);
          if (lv.goal > 0 && overtakes >= lv.goal) {
            phase = "clear";
            audio.sfxClear();
            banner = "NIVEL LISTO";
            bannerT = 2;
            if (levelIndex + 2 > save.unlocked) {
              save.unlocked = Math.min(8, levelIndex + 2);
            }
            persist();
          }
        }
      }
    }

    if (phase === "playing") {
      score += dt * speed * 0.08;
      const illegal = laneNow >= 3 || laneNow < 0;
      if (illegal) heat = Math.min(1.4, heat + dt * (laneNow < 0 ? 0.55 : 0.42));
      else heat = Math.max(0, heat - dt * 0.5);
      let copNear = false;
      for (const c of traffic) {
        if (!c.active || c.kind !== "police") continue;
        if (Math.abs(c.worldY - playerWorldY) < 580) {
          copNear = true;
          break;
        }
      }
      ticketCd = Math.max(0, ticketCd - dt);
      ticketT = Math.max(0, ticketT - dt);
      if (heat >= 1 && copNear) issueFine();
    }

    comboT -= dt;
    if (comboT <= 0) combo = 0;
    invuln = Math.max(0, invuln - dt);
    bannerT = Math.max(0, bannerT - dt);
    if (bannerT <= 0) banner = "";
    flash = Math.max(0, flash - dt * 2.4);
    playerFlash = Math.max(0, playerFlash - dt * 3);
    trauma = Math.max(0, trauma - dt * 1.6);
    if (explodeT >= 0) explodeT += dt;

    if (phase === "dying") {
      dieT += dt;
      if (dieT > 1.15) phase = "over";
    }

    for (const p of particles) {
      if (!p.active) continue;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      if (p.life <= 0) p.active = false;
    }
    for (const f of floaters) {
      if (!f.active) continue;
      f.life -= dt;
      f.y -= 46 * dt;
      if (f.life <= 0) f.active = false;
    }

    if (phase === "playing" && Math.round(visualLane()) >= 3 && !reduced) {
      const p = particles.find((x) => !x.active);
      if (p) {
        p.active = true;
        p.kind = "dust";
        p.x = w / 2 + rand(-18, 18);
        p.y = playerScreenY() + rand(8, 22);
        p.vx = rand(-20, 20);
        p.vy = rand(30, 80);
        p.life = 0.35;
        p.max = 0.35;
        p.size = rand(2, 5);
      }
    }

    if (lv.theme === "rain" && (phase === "playing" || phase === "attract")) {
      for (let i = 0; i < 3; i++) {
        const p = particles.find((x) => !x.active);
        if (!p) break;
        p.active = true;
        p.kind = "rain";
        p.x = rand(0, w);
        p.y = rand(-40, 0);
        p.vx = -40;
        p.vy = 780;
        p.life = 0.9;
        p.max = 0.9;
        p.size = rand(8, 16);
      }
    }

    audio.updateEngine(speed, phase === "playing" || phase === "attract");
  }

  let acc = 0;

  const api: Engine = {
    tick(dt, keys, canvasW, canvasH) {
      w = canvasW;
      h = canvasH;
      const d = Math.min(dt, MAX_ACC);
      if (phase === "paused" || phase === "clear" || phase === "over") {
        audio.updateEngine(speed, false);
        return;
      }
      acc += d;
      let guard = 0;
      while (acc >= STEP && guard++ < 8) {
        step(STEP, keys);
        acc -= STEP;
      }
    },
    startRun,
    skipLevel(dir: number) {
      const next = clamp(levelIndex + Math.sign(dir || 1), 0, LEVELS.length - 1);
      if (next === levelIndex) return;
      if (next + 1 > save.unlocked) {
        save.unlocked = Math.min(8, next + 1);
        writeSave(save);
      }
      configureLevel(next, true);
      if (phase === "paused" || phase === "clear" || phase === "over" || phase === "dying") {
        phase = "playing";
      }
      audio.startEngine();
      audio.updateEngine(speed, true);
    },
    cycleDifficulty() {
      const i = DIFFICULTY_ORDER.indexOf(difficulty);
      difficulty = DIFFICULTY_ORDER[(i + 1) % DIFFICULTY_ORDER.length]!;
      save.difficulty = difficulty;
      writeSave(save);
      const lv = currentLevel();
      speed = lv.speed;
      banner = DIFFICULTY_LABEL[difficulty].toUpperCase();
      bannerT = 1.2;
    },
    pause() {
      if (phase === "playing") phase = "paused";
    },
    resume() {
      if (phase === "paused") phase = "playing";
    },
    retry() {
      startRun(LEVELS[levelIndex]!.id);
    },
    nudge(dir: number) {
      if (phase !== "playing") return;
      const next = clamp(Math.round(toLane) + (dir < 0 ? -1 : 1), LANE_MIN, LANE_MAX);
      startSwitch(next);
    },
    continueLevel() {
      if (phase !== "clear") return;
      if (levelIndex >= LEVELS.length - 1) {
        configureLevel(LEVELS.length - 1, true);
        phase = "playing";
        return;
      }
      configureLevel(levelIndex + 1, true);
      phase = "playing";
    },
    quitToTitle() {
      persist();
      beginAttract();
    },
    hud() {
      const lv = currentLevel();
      return {
        phase,
        score: Math.floor(score),
        highScore: Math.max(save.highScore, Math.floor(score)),
        overtakes,
        totalOvertakes,
        goal: lv.goal,
        level: lv.id,
        levelName: lv.name,
        place: lv.place,
        route: lv.route,
        blurb: lv.blurb,
        difficulty,
        speedKmh: Math.round(78 + speed * 0.18),
        distanceM: Math.floor(distance),
        combo,
        unlocked: save.unlocked,
        muted: save.muted,
        reducedMotion: reduced,
        banner,
        wrongWay: Math.round(visualLane()) < 0,
        throttle,
        fines,
        ticket: ticketT > 0,
      };
    },
    setMuted(v) {
      save.muted = v;
      audio.setMuted(v);
      writeSave(save);
    },
    snapshot() {
      const lv = currentLevel();
      const shake = reduced ? trauma * 2 : trauma * trauma * 14;
      const nx = Math.sin(noiseT * 37.1);
      const ny = Math.cos(noiseT * 29.4);
      const vl = visualLane();
      const pY = playerScreenY();
      const pX = laneX(vl, pY, w, h, playerWorldY, pY, lv.id);
      return {
        w,
        h,
        phase,
        theme: lv.theme,
        levelId: lv.id,
        cameraY: playerWorldY,
        playerX: pX,
        playerY: pY,
        playerLane: vl,
        playerRoll: 0,
        playerFlash,
        speed,
        shakeX: nx * shake,
        shakeY: ny * shake,
        flash,
        rain: lv.theme === "rain",
        traffic,
        particles,
        floaters,
        explodeT,
        explodeX,
        explodeY,
        reduced,
      };
    },
    destroy() {
      audio.stopEngine();
      if (typeof window !== "undefined" && window.__controlsTest) {
        delete window.__controlsTest;
      }
    },
  };

  beginAttract();
  audio.setMuted(save.muted);

  if (typeof window !== "undefined") {
    window.__controlsTest = {
      getYaw: () => {
        const snap = api.snapshot();
        return -(snap.playerX - snap.w / 2) / 80;
      },
      getSpeed: () => speed / 80,
      setSteer(v) {
        injectedSteer = v;
      },
      setKeys(codes) {
        injected = new Set(codes);
        injectedSteer = 0;
        if (phase === "playing") {
          if (codes.includes("KeyA") || codes.includes("ArrowLeft")) {
            startSwitch(clamp(Math.round(toLane) - 1, LANE_MIN, LANE_MAX));
          } else if (codes.includes("KeyD") || codes.includes("ArrowRight")) {
            startSwitch(clamp(Math.round(toLane) + 1, LANE_MIN, LANE_MAX));
          }
        }
      },
    };
  }

  return api;
}
