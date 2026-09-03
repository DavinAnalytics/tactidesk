import { describe, expect, it } from "vitest";
import { findChampion, findItem } from "./lookup";
import { ITEM_GUIDE, META_COMPS, META_RESOLVE_ISSUES } from "./meta";

describe("meta snapshot", () => {
  it("resolves every champion and item name", () => {
    expect(META_RESOLVE_ISSUES).toEqual([]);
    expect(META_COMPS.length).toBeGreaterThanOrEqual(12);
    expect(META_COMPS.filter((comp) => comp.tier === "S")).toHaveLength(3);
  });

  it("maps Infinity Edge onto AD carries", () => {
    const ie = findItem("IE");
    expect(ie?.name).toBe("Infinity Edge");
    const row = ITEM_GUIDE.find((entry) => entry.itemId === ie?.id);
    expect(row?.holders.map((holder) => holder.name)).toEqual(
      expect.arrayContaining(["Nidalee", "Sivir", "Aphelios"]),
    );
  });

  it("looks up Kayle and Gargoyle", () => {
    expect(findChampion("Kayle")?.id).toBe("DA_18_Kayle");
    expect(findItem("Gargoyle")?.id).toBe("DA_GargoyleStoneplate");
    expect(findItem("Warmogs")?.name).toMatch(/Warmog/i);
  });

  it("pins a meta board with stable id", () => {
    const primal = META_COMPS.find((comp) => comp.id === "primal-malphite");
    expect(primal?.units[0]?.champion.name).toBe("Nidalee");
    expect(primal?.units[0]?.itemIds.length).toBe(3);
  });
});
