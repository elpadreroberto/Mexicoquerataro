import type { Difficulty, LevelDef } from "./types";

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "Circuito",
    place: "Interior, CDMX",
    route: "De CDMX centro a la primera salida al Periférico",
    blurb: "Tres carriles y acotamiento. Aprende a cambiarte.",
    goal: 8,
    speed: 260,
    traffic: 90,
    spawnDistance: 180,
    doubleChance: 0.22,
    truckChance: 0,
    theme: "day",
  },
  {
    id: 2,
    name: "Periférico",
    place: "Naucalpan",
    route: "De Naucalpan a la caseta de Tepotzotlán",
    blurb: "Curvas y sentido contrario. El acotamiento salva.",
    goal: 12,
    speed: 300,
    traffic: 100,
    spawnDistance: 170,
    doubleChance: 0.28,
    truckChance: 0.08,
    theme: "day",
  },
  {
    id: 3,
    name: "México–Qro",
    place: "Autopista 57",
    route: "De Tepotzotlán a Palmillas",
    blurb: "Curvas más cerradas. Cuidado de frente.",
    goal: 16,
    speed: 340,
    traffic: 110,
    spawnDistance: 160,
    doubleChance: 0.38,
    truckChance: 0.18,
    theme: "dusk",
  },
  {
    id: 4,
    name: "Palmillas",
    place: "Caseta y recta",
    route: "De la caseta Palmillas a San Juan del Río",
    blurb: "Velocidad de crucero. Rebasa con decisión.",
    goal: 20,
    speed: 380,
    traffic: 125,
    spawnDistance: 150,
    doubleChance: 0.46,
    truckChance: 0.24,
    theme: "dusk",
  },
  {
    id: 5,
    name: "Del Sol",
    place: "San Juan del Río",
    route: "De San Juan del Río a Pedro Escobedo",
    blurb: "Noche en la recta. Mira las luces traseras.",
    goal: 24,
    speed: 410,
    traffic: 135,
    spawnDistance: 145,
    doubleChance: 0.54,
    truckChance: 0.3,
    theme: "night",
  },
  {
    id: 6,
    name: "La 57",
    place: "Querétaro sur",
    route: "De Pedro Escobedo a Querétaro sur",
    blurb: "Tráfico denso. Un carril siempre queda libre.",
    goal: 28,
    speed: 440,
    traffic: 145,
    spawnDistance: 140,
    doubleChance: 0.6,
    truckChance: 0.34,
    theme: "night",
  },
  {
    id: 7,
    name: "Aguacero",
    place: "Lluvia en la 57",
    route: "De Palmillas a Querétaro bajo la lluvia",
    blurb: "Pista mojada. El auto resbala un poco al cambiar.",
    goal: 32,
    speed: 420,
    traffic: 130,
    spawnDistance: 145,
    doubleChance: 0.64,
    truckChance: 0.38,
    theme: "rain",
  },
  {
    id: 8,
    name: "Infinito",
    place: "Carrera abierta",
    route: "De CDMX a Querétaro y de vuelta, sin caseta final",
    blurb: "Sin meta. Sobrevive y suma rebasadas.",
    goal: 0,
    speed: 470,
    traffic: 150,
    spawnDistance: 135,
    doubleChance: 0.7,
    truckChance: 0.42,
    theme: "night",
  },
];

export const MAX_SPEED = 560;

export const DIFFICULTY_ORDER: Difficulty[] = ["basico", "medio", "avanzado", "pro"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  basico: "Básico",
  medio: "Medio",
  avanzado: "Avanzado",
  pro: "Pro",
};

export const DIFFICULTY_MUL: Record<
  Difficulty,
  { speed: number; traffic: number; spawn: number; double: number; truck: number; goal: number }
> = {
  basico: { speed: 0.88, traffic: 0.82, spawn: 1.28, double: 0.4, truck: 0.35, goal: 0.75 },
  medio: { speed: 1, traffic: 1, spawn: 1, double: 1, truck: 1, goal: 1 },
  avanzado: { speed: 1.1, traffic: 1.14, spawn: 0.78, double: 1.28, truck: 1.25, goal: 1.15 },
  pro: { speed: 1.2, traffic: 1.24, spawn: 0.62, double: 1.5, truck: 1.45, goal: 1.35 },
};

export function tuneLevel(lv: LevelDef, difficulty: Difficulty): LevelDef {
  const m = DIFFICULTY_MUL[difficulty];
  return {
    ...lv,
    speed: lv.speed * m.speed,
    traffic: lv.traffic * m.traffic,
    spawnDistance: lv.spawnDistance * m.spawn,
    doubleChance: Math.min(0.92, lv.doubleChance * m.double),
    truckChance: Math.min(0.72, lv.truckChance * m.truck),
    goal: lv.goal <= 0 ? 0 : Math.max(4, Math.round(lv.goal * m.goal)),
  };
}
