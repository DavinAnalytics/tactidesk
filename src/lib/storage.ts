import type { Comp, CompUnit } from "../data/types";

const COMPS_KEY = "tactidesk.comps.v1";
const NOTES_KEY = "tactidesk.augmentNotes.v1";
const SETTINGS_KEY = "tactidesk.settings.v1";

export type Settings = {
  compact: boolean;
  opacity: number;
};

export const defaultSettings: Settings = {
  compact: false,
  opacity: 0.94,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadComps(): Comp[] {
  const comps = readJson<Comp[]>(COMPS_KEY, []);
  return Array.isArray(comps) ? comps : [];
}

export function saveComps(comps: Comp[]): void {
  writeJson(COMPS_KEY, comps);
}

export function createComp(name = "New board"): Comp {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    notes: "",
    pinned: false,
    units: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertComp(comps: Comp[], next: Comp): Comp[] {
  const updated = { ...next, updatedAt: Date.now() };
  const index = comps.findIndex((comp) => comp.id === updated.id);
  if (index === -1) return [updated, ...comps];
  const copy = comps.slice();
  copy[index] = updated;
  return copy;
}

export function addUnit(comp: Comp, championId: string): Comp {
  if (comp.units.some((unit) => unit.championId === championId)) return comp;
  const unit: CompUnit = { championId, items: [], stars: 2 };
  return { ...comp, units: [...comp.units, unit], updatedAt: Date.now() };
}

export function removeUnit(comp: Comp, championId: string): Comp {
  if (!comp.units.some((unit) => unit.championId === championId)) return comp;
  return {
    ...comp,
    units: comp.units.filter((unit) => unit.championId !== championId),
    updatedAt: Date.now(),
  };
}

export function loadAugmentNotes(): Record<string, string> {
  return readJson<Record<string, string>>(NOTES_KEY, {});
}

export function saveAugmentNotes(notes: Record<string, string>): void {
  writeJson(NOTES_KEY, notes);
}

export function loadSettings(): Settings {
  return { ...defaultSettings, ...readJson<Partial<Settings>>(SETTINGS_KEY, {}) };
}

export function saveSettings(settings: Settings): void {
  writeJson(SETTINGS_KEY, settings);
}

export function exportComps(comps: Comp[]): string {
  return JSON.stringify({ version: 1, comps }, null, 2);
}

export function importComps(raw: string): Comp[] {
  const parsed = JSON.parse(raw) as { comps?: Comp[] } | Comp[];
  const list = Array.isArray(parsed) ? parsed : parsed.comps;
  if (!Array.isArray(list)) throw new Error("File does not contain a comps list");
  return list.filter((comp) => comp && typeof comp.id === "string" && typeof comp.name === "string");
}
