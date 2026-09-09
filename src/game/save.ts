const KEY = "rebase-save-v1";
const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  highScore: number;
  bestOvertakes: number;
  unlocked: number;
  muted: boolean;
}

const defaults: SaveData = {
  version: SAVE_VERSION,
  highScore: 0,
  bestOvertakes: 0,
  unlocked: 1,
  muted: false,
};

function migrate(raw: SaveData): SaveData {
  const s = { ...defaults, ...raw, version: SAVE_VERSION };
  s.unlocked = Math.min(8, Math.max(1, s.unlocked | 0));
  s.highScore = Math.max(0, s.highScore | 0);
  s.bestOvertakes = Math.max(0, s.bestOvertakes | 0);
  s.muted = Boolean(s.muted);
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
