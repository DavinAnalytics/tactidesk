import statsSnapshot from "../data/stats.json";
import { championById, itemById } from "../data/catalog";

export type StatsItemRow = {
  itemId: string;
  kind: string;
  n: number;
  avgPlace: number;
  delta: number;
};

export type StatsUnitRow = {
  championId: string;
  n: number;
  avgPlace: number;
  items: StatsItemRow[];
};

export type StatsSnapshot = {
  version: number;
  platform: string;
  region: string;
  queueId: number;
  setNumber: number;
  minSample: number;
  fetchedAt: string | null;
  matches: number;
  players: number;
  units: StatsUnitRow[];
};

export type StatGuideItem = {
  itemId: string;
  name: string;
  icon: string;
  kind: string;
  n: number;
  avgPlace: number;
  delta: number;
};

export type StatHolder = {
  championId: string;
  name: string;
  icon: string;
  cost: number;
  n: number;
  avgPlace: number;
  delta: number;
};

export const STATS = statsSnapshot as StatsSnapshot;

export function hasLadderStats(stats: StatsSnapshot = STATS): boolean {
  return stats.matches > 0 && stats.units.length > 0;
}

export function platformLabel(platform: string = STATS.platform): string {
  if (platform === "na1") return "NA";
  return platform.toUpperCase();
}

export function ladderCaption(stats: StatsSnapshot = STATS): string {
  if (!hasLadderStats(stats)) return "";
  return `${platformLabel(stats.platform)} ${stats.matches} games`;
}

export function formatDelta(delta: number): string {
  const body = Math.abs(delta).toFixed(2);
  if (delta > 0) return `+${body}`;
  if (delta < 0) return `−${body}`;
  return "0.00";
}

export function formatItemStat(row: { n?: number; avgPlace?: number; delta?: number } | null | undefined): string {
  if (row?.n == null || row.avgPlace == null || row.delta == null) return "";
  return `n=${row.n} · ${Number(row.avgPlace).toFixed(2)} · ${formatDelta(row.delta)}`;
}

function unitRow(stats: StatsSnapshot, championId: string): StatsUnitRow | undefined {
  return stats.units.find((row) => row.championId === championId);
}

export function riotItemsForChampion(
  championId: string,
  kind: "completed" | "emblem" | "artifact",
  limit = kind === "artifact" ? 3 : 6,
  stats: StatsSnapshot = STATS,
): StatGuideItem[] {
  const unit = unitRow(stats, championId);
  if (!unit) return [];
  const minSample = stats.minSample ?? 20;
  const ranked = unit.items
    .filter((item) => item.kind === kind && item.n >= minSample)
    .sort((a, b) => a.delta - b.delta || b.n - a.n || a.itemId.localeCompare(b.itemId))
    .slice(0, limit);
  const rows: StatGuideItem[] = [];
  for (const row of ranked) {
    const item = itemById.get(row.itemId);
    if (!item) continue;
    rows.push({
      itemId: item.id,
      name: item.name,
      icon: item.icon,
      kind: item.kind,
      n: row.n,
      avgPlace: row.avgPlace,
      delta: row.delta,
    });
  }
  return rows;
}

export function riotHoldersForItem(itemId: string, stats: StatsSnapshot = STATS): StatHolder[] {
  const minSample = stats.minSample ?? 20;
  const holders: StatHolder[] = [];
  for (const unit of stats.units) {
    const item = unit.items.find((entry) => entry.itemId === itemId);
    if (!item || item.n < minSample) continue;
    const champ = championById.get(unit.championId);
    if (!champ) continue;
    holders.push({
      championId: champ.id,
      name: champ.name,
      icon: champ.icon,
      cost: champ.cost,
      n: item.n,
      avgPlace: item.avgPlace,
      delta: item.delta,
    });
  }
  holders.sort((a, b) => a.delta - b.delta || b.n - a.n);
  return holders;
}
