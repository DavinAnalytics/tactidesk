import { championById, itemById, setData, traitByName } from "../data/catalog";
import {
  META_PATCH,
  RAW_META_COMPS,
  notebookFromMeta,
  type ItemHolder,
  type MetaTier,
  type ResolvedMetaComp,
  type ResolvedMetaUnit,
} from "../data/meta";
import { findChampion, findItem } from "./lookup";
import {
  STATS,
  formatItemStat,
  riotHoldersForItem,
  riotItemsForChampion,
  type StatsSnapshot,
} from "./riot-stats";

export { META_PATCH, notebookFromMeta };
export type { ItemHolder, ResolvedMetaComp, MetaTier };

export type ResolveIssue = { comp: string; field: "champion" | "item"; name: string };

export type ItemGuideRow = {
  itemId: string;
  name: string;
  kind: string;
  icon: string;
  holders: Array<ItemHolder & { name: string; icon: string; cost: number }>;
};

function resolveUnit(
  compId: string,
  raw: { champion: string; items: string[]; stars?: 1 | 2 | 3 },
  issues: ResolveIssue[],
): ResolvedMetaUnit | null {
  const champ = findChampion(raw.champion);
  if (!champ) {
    issues.push({ comp: compId, field: "champion", name: raw.champion });
    return null;
  }
  const itemIds: string[] = [];
  for (const itemName of raw.items) {
    const item = findItem(itemName);
    if (!item) {
      issues.push({ comp: compId, field: "item", name: itemName });
      continue;
    }
    itemIds.push(item.id);
  }
  return {
    championId: champ.id,
    champion: champ,
    itemIds,
    stars: raw.stars ?? 2,
  };
}

export function resolveMetaComps(issues: ResolveIssue[] = []): ResolvedMetaComp[] {
  return RAW_META_COMPS.map((raw) => ({
    id: raw.id,
    name: raw.name,
    tier: raw.tier,
    style: raw.style,
    notes: raw.notes,
    units: raw.units
      .map((unit) => resolveUnit(raw.id, unit, issues))
      .filter((unit): unit is ResolvedMetaUnit => Boolean(unit)),
  }));
}

export const META_RESOLVE_ISSUES: ResolveIssue[] = [];
export const META_COMPS = resolveMetaComps(META_RESOLVE_ISSUES);

export function isReroll(comp: { style: string }): boolean {
  return /reroll/i.test(comp.style);
}

export function threeStarNames(comp: ResolvedMetaComp): string[] {
  return comp.units.filter((unit) => unit.stars === 3).map((unit) => unit.champion.name);
}

export function displayUnits(comp: ResolvedMetaComp): ResolvedMetaUnit[] {
  return [...comp.units].sort((a, b) => Number(b.stars === 3) - Number(a.stars === 3));
}

export function activeTraits(comp: ResolvedMetaComp): Array<{ name: string; count: number; min: number }> {
  const counts = new Map<string, number>();
  for (const unit of comp.units) {
    for (const traitName of unit.champion.traits) {
      counts.set(traitName, (counts.get(traitName) || 0) + 1);
    }
  }
  const rows = [];
  for (const [name, count] of counts) {
    const trait = traitByName.get(name);
    const min = trait?.breakpoints[0]?.min ?? 99;
    if (count >= min) rows.push({ name, count, min });
  }
  return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function holdersByItem(stats: StatsSnapshot = STATS): Map<string, ItemHolder[]> {
  const map = new Map<string, ItemHolder[]>();

  function add(itemId: string, championId: string, compName: string) {
    const list = map.get(itemId) || [];
    const existing = list.find((row) => row.championId === championId);
    if (existing) {
      if (!existing.comps.includes(compName)) existing.comps.push(compName);
    } else {
      list.push({ championId, comps: [compName] });
    }
    map.set(itemId, list);
  }

  for (const comp of META_COMPS) {
    for (const unit of comp.units) {
      for (const itemId of unit.itemIds) add(itemId, unit.championId, comp.name);
    }
  }

  for (const item of setData.items) {
    if (item.kind === "component") continue;
    const riot = riotHoldersForItem(item.id, stats);
    if (!riot.length) continue;
    map.set(
      item.id,
      riot.map((holder) => ({
        championId: holder.championId,
        comps: [formatItemStat(holder)],
        n: holder.n,
        avgPlace: holder.avgPlace,
        delta: holder.delta,
      })),
    );
  }

  for (const list of map.values()) {
    list.sort((a, b) => {
      if (a.n != null && b.n != null) return (a.delta ?? 0) - (b.delta ?? 0) || b.n - a.n;
      return b.comps.length - a.comps.length;
    });
  }
  return map;
}

export const ITEM_HOLDERS = holdersByItem();

export function itemGuideRows(stats: StatsSnapshot = STATS): ItemGuideRow[] {
  const holderMap = holdersByItem(stats);
  const rows: ItemGuideRow[] = [];
  for (const [itemId, holders] of holderMap) {
    const item = itemById.get(itemId) || setData.items.find((entry) => entry.id === itemId);
    if (!item) continue;
    rows.push({
      itemId,
      name: item.name,
      kind: item.kind,
      icon: item.icon,
      holders: holders.map((holder) => {
        const champ = championById.get(holder.championId);
        return {
          ...holder,
          name: champ?.name || holder.championId,
          icon: champ?.icon || "",
          cost: champ?.cost || 0,
        };
      }),
    });
  }
  const seen = new Set(rows.map((row) => row.itemId));
  for (const item of setData.items) {
    if (item.kind === "component" || seen.has(item.id)) continue;
    if (item.kind !== "artifact" && item.kind !== "emblem") continue;
    rows.push({
      itemId: item.id,
      name: item.name,
      kind: item.kind,
      icon: item.icon,
      holders: [],
    });
  }
  const kindRank = { completed: 0, artifact: 1, emblem: 2, component: 3 };
  rows.sort((a, b) => {
    const kindDelta = (kindRank[a.kind as keyof typeof kindRank] ?? 9) - (kindRank[b.kind as keyof typeof kindRank] ?? 9);
    if (kindDelta) return kindDelta;
    return b.holders.length - a.holders.length || a.name.localeCompare(b.name);
  });
  return rows;
}

const TIER_RANK: Record<MetaTier, number> = { S: 0, A: 1, B: 2, C: 3 };

export type UnitGuideItem = {
  itemId: string;
  name: string;
  icon: string;
  kind: string;
  n?: number;
  avgPlace?: number;
  delta?: number;
};
export type UnitGuideComp = { id: string; name: string; tier: MetaTier; style: string };
export type GuideSource = "riot" | "board";
export type UnitGuide = {
  items: UnitGuideItem[];
  emblems: UnitGuideItem[];
  artifacts: UnitGuideItem[];
  comps: UnitGuideComp[];
  itemsFrom: GuideSource;
  emblemsFrom: GuideSource;
  artifactsFrom: GuideSource;
};

function toGuideItem(itemId: string): UnitGuideItem | null {
  const item = itemById.get(itemId);
  if (!item) return null;
  return { itemId: item.id, name: item.name, icon: item.icon, kind: item.kind };
}

export function guideForChampion(championId: string, stats: StatsSnapshot = STATS): UnitGuide {
  const counts = new Map<string, number>();
  const comps: UnitGuideComp[] = [];
  for (const comp of META_COMPS) {
    const unit = comp.units.find((entry) => entry.championId === championId);
    if (!unit) continue;
    comps.push({ id: comp.id, name: comp.name, tier: comp.tier, style: comp.style });
    for (const itemId of unit.itemIds) {
      counts.set(itemId, (counts.get(itemId) || 0) + 1);
    }
  }
  comps.sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.name.localeCompare(b.name));

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([itemId]) => toGuideItem(itemId))
    .filter((item): item is UnitGuideItem => Boolean(item));

  const boardItems = ranked.filter((item) => item.kind === "completed").slice(0, 6);
  const boardEmblems = ranked.filter((item) => item.kind === "emblem").slice(0, 6);
  const boardArtifacts = ranked.filter((item) => item.kind === "artifact").slice(0, 3);

  const riotItems = riotItemsForChampion(championId, "completed", 6, stats);
  const riotEmblems = riotItemsForChampion(championId, "emblem", 6, stats);
  const riotArtifacts = riotItemsForChampion(championId, "artifact", 3, stats);

  return {
    items: riotItems.length ? riotItems : boardItems,
    emblems: riotEmblems.length ? riotEmblems : boardEmblems,
    artifacts: riotArtifacts.length ? riotArtifacts : boardArtifacts,
    comps,
    itemsFrom: riotItems.length ? "riot" : "board",
    emblemsFrom: riotEmblems.length ? "riot" : "board",
    artifactsFrom: riotArtifacts.length ? "riot" : "board",
  };
}

export const ITEM_GUIDE = itemGuideRows();
