import { describe, expect, it } from "vitest";
import { ARTIFACT_HOLDERS } from "../data/meta";
import { findChampion, findItem } from "./lookup";
import { ITEM_GUIDE, META_COMPS, META_RESOLVE_ISSUES, guideForChampion, isReroll, threeStarNames } from "./meta";

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

  it("marks 3-star targets on every reroll line", () => {
    const rerolls = META_COMPS.filter((comp) => isReroll(comp));
    expect(rerolls.length).toBeGreaterThanOrEqual(6);
    for (const comp of rerolls) {
      expect(threeStarNames(comp).length).toBeGreaterThanOrEqual(2);
    }
    const kayle = META_COMPS.find((comp) => comp.id === "kayle-reroll");
    expect(threeStarNames(kayle!)).toEqual(expect.arrayContaining(["Kayle", "Xayah", "Ornn"]));
    const primal = META_COMPS.find((comp) => comp.id === "primal-malphite");
    expect(threeStarNames(primal!)).toEqual([]);
  });

  it("lists artifacts and unit recommendations", () => {
    expect(ITEM_GUIDE.some((row) => row.kind === "artifact")).toBe(true);
    expect(findItem("Fishbones")?.kind).toBe("artifact");
    for (const row of ARTIFACT_HOLDERS) {
      expect(findItem(row.artifact)?.kind).toBe("artifact");
      for (const name of row.units) {
        expect(findChampion(name)?.name).toBe(name);
      }
    }
    const nidalee = findChampion("Nidalee");
    const guide = guideForChampion(nidalee!.id);
    expect(guide.items.map((item) => item.name)).toEqual(expect.arrayContaining(["Infinity Edge"]));
    expect(guide.artifacts.length).toBeGreaterThan(0);
    expect(guide.artifacts.length).toBeLessThanOrEqual(3);
    expect(guide.comps.map((comp) => comp.name)).toEqual(expect.arrayContaining(["Primal Malphite"]));

    const horizon = ARTIFACT_HOLDERS.find((row) => row.artifact === "Horizon Focus");
    expect(horizon?.units).toEqual(expect.arrayContaining(["Kennen", "Sejuani", "Rammus"]));
    expect(horizon?.units).not.toContain("Zyra");
    expect(horizon?.units).not.toContain("Soraka");
    const zyra = guideForChampion(findChampion("Zyra")!.id);
    expect(zyra.artifacts.map((item) => item.name)).not.toContain("Horizon Focus");
    expect(zyra.artifacts.map((item) => item.name)).toEqual(
      expect.arrayContaining(["Luden's Tempest", "Blighting Jewel"]),
    );
  });
});
