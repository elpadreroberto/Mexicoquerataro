export type Lane = number;
export type Theme = "day" | "dusk" | "night" | "rain";
export type VehicleKind = "player" | "hatch" | "sedan" | "taxi" | "suv" | "truck" | "police";
export type Phase = "attract" | "playing" | "paused" | "clear" | "dying" | "over";

export interface LevelDef {
  id: number;
  name: string;
  place: string;
  blurb: string;
  goal: number;
  speed: number;
  traffic: number;
  spawnDistance: number;
  doubleChance: number;
  truckChance: number;
  theme: Theme;
}

export interface TrafficCar {
  id: number;
  active: boolean;
  lane: Lane;
  worldY: number;
  kind: Exclude<VehicleKind, "player">;
  length: number;
  speed: number;
  passed: boolean;
  nearMissed: boolean;
  oncoming: boolean;
}

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  kind: "spark" | "smoke" | "dust" | "rain";
}

export interface Floater {
  active: boolean;
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

export interface Hud {
  phase: Phase;
  score: number;
  highScore: number;
  overtakes: number;
  totalOvertakes: number;
  goal: number;
  level: number;
  levelName: string;
  place: string;
  blurb: string;
  speedKmh: number;
  distanceM: number;
  combo: number;
  unlocked: number;
  muted: boolean;
  reducedMotion: boolean;
  banner: string;
  wrongWay: boolean;
  throttle: number;
  fines: number;
  ticket: boolean;
}

export interface DrawState {
  w: number;
  h: number;
  phase: Phase;
  theme: Theme;
  levelId: number;
  cameraY: number;
  playerX: number;
  playerY: number;
  playerLane: number;
  playerRoll: number;
  playerFlash: number;
  speed: number;
  shakeX: number;
  shakeY: number;
  flash: number;
  rain: boolean;
  traffic: TrafficCar[];
  particles: Particle[];
  floaters: Floater[];
  explodeT: number;
  explodeX: number;
  explodeY: number;
  reduced: boolean;
}

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer: (v: number) => void;
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

export {};
