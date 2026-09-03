import type { Champion, Item, SetSnapshot, Trait } from "../data/types";
import snapshot from "../data/set.json";

export const setData = snapshot as SetSnapshot;

export const championById = new Map(setData.champions.map((champ) => [champ.id, champ]));
export const itemById = new Map(setData.items.map((item) => [item.id, item]));
export const traitByName = new Map(setData.traits.map((trait) => [trait.name, trait]));

export function champ(id: string): Champion | undefined {
  return championById.get(id);
}

export function item(id: string): Item | undefined {
  return itemById.get(id);
}

export function trait(name: string): Trait | undefined {
  return traitByName.get(name);
}

export const COST_COLORS: Record<number, string> = {
  1: "#cfd6d2",
  2: "#27c46a",
  3: "#4aa3ff",
  4: "#c084fc",
  5: "#f5c84c",
  6: "#ff7ad9",
  7: "#ff8a4a",
};
