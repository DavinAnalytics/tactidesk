import { describe, expect, it } from "vitest";
import { ARTIFACT_HOLDERS } from "../data/meta";
import { findChampion, findItem } from "./lookup";
import { ITEM_GUIDE, META_COMPS, META_RESOLVE_ISSUES, guideForChampion, isReroll, threeStarNames } from "./meta";
import type { StatsSnapshot } from "./riot-stats";

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

  it("lists an artifact holder for every artifact, including usual notes when n < 3", () => {
    expect(ITEM_GUIDE.some((row) => row.kind === "artifact")).toBe(true);
    expect(findItem("Fishbones")?.kind).toBe("artifact");
    for (const row of ARTIFACT_HOLDERS) {
      expect(findItem(row.artifact)?.kind).toBe("artifact");
      for (const name of row.units) {
        expect(findChampion(name)?.name).toBe(name);
      }
    }
    const artifacts = ITEM_GUIDE.filter((row) => row.kind === "artifact");
    expect(artifacts.length).toBeGreaterThanOrEqual(20);
    for (const row of artifacts) {
      expect(row.holders.length, row.name).toBeGreaterThanOrEqual(1);
    }

    const gamblers = ITEM_GUIDE.find((row) => row.name === "Gambler's Blade");
    expect(gamblers?.holdersFrom).toBe("notes");
    expect(gamblers?.holders.map((holder) => holder.name)).toEqual(expect.arrayContaining(["Aphelios"]));
    expect(gamblers?.holders.map((holder) => holder.name)).toContain("Xayah");
    expect(gamblers?.holders.every((holder) => holder.n == null)).toBe(true);

    const pact = ITEM_GUIDE.find((row) => row.name === "Eternal Pact");
    expect(pact?.holdersFrom).toBe("riot");
    expect(pact?.holders.map((holder) => holder.name)).toEqual(expect.arrayContaining(["Veigar"]));
    expect(pact?.holders.find((holder) => holder.name === "Veigar")?.n).toBeGreaterThanOrEqual(3);

    const nidalee = findChampion("Nidalee");
    const guide = guideForChampion(nidalee!.id);
    expect(guide.itemsFrom).toBe("riot");
    expect(guide.items.length).toBeGreaterThan(0);
    expect(guide.items.every((item) => (item.n ?? 0) >= 20)).toBe(true);
    expect(guide.artifacts.map((item) => item.name)).not.toContain("Horizon Focus");
    expect(guide.comps.map((comp) => comp.name)).toEqual(expect.arrayContaining(["Primal Malphite"]));

    const horizon = ARTIFACT_HOLDERS.find((row) => row.artifact === "Horizon Focus");
    expect(horizon?.units).toEqual(expect.arrayContaining(["Kennen", "Sejuani", "Rammus"]));
    expect(horizon?.units).not.toContain("Zyra");
    expect(horizon?.units).not.toContain("Soraka");
    const zyra = guideForChampion(findChampion("Zyra")!.id);
    expect(zyra.itemsFrom).toBe("riot");
    expect(zyra.artifacts.map((item) => item.name)).not.toContain("Horizon Focus");
    expect(zyra.artifacts.map((item) => item.name)).not.toContain("Luden's Tempest");
    expect(zyra.items.map((item) => item.name)).toEqual(expect.arrayContaining(["Spear of Shojin"]));
    expect(zyra.items.every((item) => (item.n ?? 0) >= 20)).toBe(true);
  });

  it("uses ranked Riot items when the sample is large enough", () => {
    const zyraId = findChampion("Zyra")!.id;
    const fixture: StatsSnapshot = {
      version: 1,
      platform: "na1",
      region: "americas",
      queueId: 1100,
      setNumber: 18,
      minSample: 20,
      fetchedAt: "2026-09-05T00:00:00.000Z",
      matches: 80,
      players: 35,
      units: [
        {
          championId: zyraId,
          n: 80,
          avgPlace: 4.1,
          items: [
            {
              itemId: findItem("Luden's Tempest")!.id,
              kind: "artifact",
              n: 40,
              avgPlace: 3.7,
              delta: -0.4,
            },
            {
              itemId: findItem("Horizon Focus")!.id,
              kind: "artifact",
              n: 2,
              avgPlace: 5.8,
              delta: 1.7,
            },
            {
              itemId: findItem("Jeweled Gauntlet")!.id,
              kind: "completed",
              n: 55,
              avgPlace: 3.9,
              delta: -0.2,
            },
          ],
        },
      ],
    };
    const zyra = guideForChampion(zyraId, fixture);
    expect(zyra.itemsFrom).toBe("riot");
    expect(zyra.artifactsFrom).toBe("riot");
    expect(zyra.items.map((item) => item.name)).toEqual(["Jeweled Gauntlet"]);
    expect(zyra.artifacts.map((item) => item.name)).toEqual(["Luden's Tempest"]);
    expect(zyra.artifacts.map((item) => item.name)).not.toContain("Horizon Focus");
    expect(zyra.artifacts[0]?.n).toBe(40);
  });
});
