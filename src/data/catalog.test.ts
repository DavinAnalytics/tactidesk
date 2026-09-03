import { describe, expect, it } from "vitest";
import { setData, championById, itemById } from "../data/catalog";
import { COMPONENT_ORDER, combineItems } from "../lib/items";

describe("set snapshot", () => {
  it("loads Enchanted Wilds with shop units and traits", () => {
    expect(setData.set).toBe(18);
    expect(setData.name).toBe("Enchanted Wilds");
    expect(setData.champions.length).toBeGreaterThan(50);
    expect(setData.traits.length).toBeGreaterThan(20);
    expect(setData.items.length).toBeGreaterThan(50);
    expect(setData.augments.length).toBeGreaterThan(100);
    expect(championById.get("DA_18_Ornn")?.name).toBe("Ornn");
  });

  it("has a complete component forge", () => {
    for (const id of COMPONENT_ORDER) {
      expect(itemById.get(id)?.kind).toBe("component");
    }
    expect(combineItems(setData.items, "DA_Component_BFSword", "DA_Component_SparringGloves")?.name).toBe(
      "Infinity Edge",
    );
    expect(combineItems(setData.items, "DA_Component_Spatula", "DA_Component_Spatula")?.name).toMatch(/Crown/i);
  });
});
