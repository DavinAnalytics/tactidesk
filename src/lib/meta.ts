import { championById, itemById, setData, traitByName } from "../data/catalog";
import {
  EMBLEM_HOLDERS,
  META_PATCH,
  RAW_META_COMPS,
  notebookFromMeta,
  type ItemHolder,
  type MetaTier,
  type ResolvedMetaComp,
  type ResolvedMetaUnit,
} from "../data/meta";
import { findChampion, findItem } from "./lookup";

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

export function holdersByItem(): Map<string, ItemHolder[]> {
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

  for (const row of EMBLEM_HOLDERS) {
    const emblem = findItem(row.emblem);
    if (!emblem) continue;
    for (const unitName of row.units) {
      const champ = findChampion(unitName);
      if (champ) add(emblem.id, champ.id, `${emblem.name} holder`);
    }
  }

  for (const list of map.values()) {
    list.sort((a, b) => b.comps.length - a.comps.length);
  }
  return map;
}

export const ITEM_HOLDERS = holdersByItem();

export function itemGuideRows(): ItemGuideRow[] {
  const rows: ItemGuideRow[] = [];
  for (const [itemId, holders] of ITEM_HOLDERS) {
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
  const kindRank = { completed: 0, emblem: 1, component: 2 };
  rows.sort((a, b) => {
    const kindDelta = (kindRank[a.kind as keyof typeof kindRank] ?? 9) - (kindRank[b.kind as keyof typeof kindRank] ?? 9);
    if (kindDelta) return kindDelta;
    return b.holders.length - a.holders.length || a.name.localeCompare(b.name);
  });
  return rows;
}

export const ITEM_GUIDE = itemGuideRows();
