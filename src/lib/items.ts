import type { Item } from "../data/types";

export const COMPONENT_ORDER = [
  "DA_Component_BFSword",
  "DA_Component_RecurveBow",
  "DA_Component_NeedlesslyLargeRod",
  "DA_Component_TearOfTheGoddess",
  "DA_Component_ChainVest",
  "DA_Component_NegatronCloak",
  "DA_Component_GiantsBelt",
  "DA_Component_SparringGloves",
  "DA_Component_Spatula",
  "DA_Component_FryingPan",
] as const;

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("+");
}

export function buildRecipeMap(items: Item[]): Map<string, Item> {
  const map = new Map<string, Item>();
  for (const item of items) {
    if (item.composition.length !== 2) continue;
    map.set(pairKey(item.composition[0], item.composition[1]), item);
  }
  return map;
}

export function combineItems(items: Item[], left: string, right: string): Item | undefined {
  return buildRecipeMap(items).get(pairKey(left, right));
}

export function componentsOf(items: Item[]): Item[] {
  const byId = new Map(items.filter((item) => item.kind === "component").map((item) => [item.id, item]));
  return COMPONENT_ORDER.map((id) => byId.get(id)).filter((item): item is Item => Boolean(item));
}

export function completedOf(items: Item[]): Item[] {
  return items.filter((item) => item.kind !== "component");
}
