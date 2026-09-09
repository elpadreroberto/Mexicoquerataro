import type { Difficulty } from "./types";

const KEY = "rebase-save-v1";
const SAVE_VERSION = 2;

const DIFFICULTIES: Difficulty[] = ["basico", "medio", "avanzado", "pro"];

export interface SaveData {
  version: number;
  highScore: number;
  bestOvertakes: number;
  unlocked: number;
  muted: boolean;
  difficulty: Difficulty;
}

const defaults: SaveData = {
  version: SAVE_VERSION,
  highScore: 0,
  bestOvertakes: 0,
  unlocked: 1,
  muted: false,
  difficulty: "medio",
};

function migrate(raw: SaveData): SaveData {
  const s = { ...defaults, ...raw, version: SAVE_VERSION };
  s.unlocked = Math.min(8, Math.max(1, s.unlocked | 0));
  s.highScore = Math.max(0, s.highScore | 0);
  s.bestOvertakes = Math.max(0, s.bestOvertakes | 0);
  s.muted = Boolean(s.muted);
  s.difficulty = DIFFICULTIES.includes(s.difficulty) ? s.difficulty : "medio";
  return s;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return migrate(JSON.parse(raw) as SaveData);
  } catch {
    return { ...defaults };
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
  } catch {
    /* private mode / quota */
  }
}
