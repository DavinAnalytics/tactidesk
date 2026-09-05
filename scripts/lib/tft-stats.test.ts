import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addMatch,
  buildCatalogMaps,
  createAccumulator,
  emptySnapshot,
  finalizeSnapshot,
  formatItemStat,
  holdersForItem,
  isEligibleMatch,
  itemsForChampion,
  mapChampion,
  mapItem,
  regionForPlatform,
} from "./tft-stats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const setData = JSON.parse(readFileSync(join(ROOT, "src/data/set.json"), "utf8"));
const maps = buildCatalogMaps(setData);

function match(overrides: Record<string, unknown> = {}) {
  return {
    info: {
      queue_id: 1100,
      tft_set_number: 18,
      participants: [
        {
          placement: 2,
          units: [
            {
              character_id: "DA_18_Zyra",
              itemNames: ["TFT_Item_JeweledGauntlet", "DA_Artifact_LudensTempest", "TFT_Item_BFSword"],
            },
          ],
        },
      ],
      ...overrides,
    },
  };
}

describe("riot platform routing", () => {
  it("maps na1 onto the americas regional host", () => {
    expect(regionForPlatform("na1")).toBe("americas");
    expect(regionForPlatform("euw1")).toBe("europe");
    expect(regionForPlatform("kr")).toBe("asia");
    expect(emptySnapshot({ platform: "na1" }).region).toBe("americas");
  });
});

describe("catalog mapping", () => {
  it("maps Riot and CDragon champion ids onto the set snapshot", () => {
    expect(mapChampion("DA_18_Zyra", maps)?.name).toBe("Zyra");
    expect(mapChampion("TFT18_Zyra", maps)?.id).toBe("DA_18_Zyra");
    expect(mapChampion("TFT18_Nidalee", maps)?.id).toBe("DA_Nidalee18_AP");
    expect(mapChampion("TFT18_MasterYi", maps)?.name).toBe("Master Yi");
  });

  it("canonicalizes duplicate item ids onto the DA_ row", () => {
    const ie = mapItem("TFT_Item_InfinityEdge", maps);
    expect(ie?.id).toBe("DA_InfinityEdge");
    expect(ie?.kind).toBe("completed");
    expect(mapItem("DA_Artifact_HorizonFocus", maps)?.name).toBe("Horizon Focus");
    expect(mapItem("TFT_Item_Artifact_HorizonFocus", maps)?.id).toBe("DA_Artifact_HorizonFocus");
    expect(mapItem("TFT_Item_BFSword", maps)?.kind).toBe("component");
  });
});

describe("match filter and aggregate", () => {
  it("keeps ranked set 18 and drops normals", () => {
    expect(isEligibleMatch(match())).toBe(true);
    expect(isEligibleMatch(match({ queue_id: 1090 }))).toBe(false);
    expect(isEligibleMatch(match({ tft_set_number: 17 }))).toBe(false);
  });

  it("skips components and scores items against the unit baseline", () => {
    const acc = createAccumulator();
    addMatch(acc, match(), maps);
    addMatch(
      acc,
      match({
        participants: [
          {
            placement: 8,
            units: [{ character_id: "TFT18_Zyra", itemNames: ["TFT_Item_Artifact_HorizonFocus"] }],
          },
        ],
      }),
      maps,
    );
    addMatch(
      acc,
      match({
        participants: [
          {
            placement: 1,
            units: [{ character_id: "DA_18_Zyra", itemNames: ["DA_Artifact_LudensTempest"] }],
          },
        ],
      }),
      maps,
    );

    const snapshot = finalizeSnapshot(acc, { platform: "na1", minSample: 1, players: 3 });
    expect(snapshot.matches).toBe(3);
    expect(snapshot.platform).toBe("na1");

    const zyra = snapshot.units.find((unit: { championId: string }) => unit.championId === "DA_18_Zyra");
    expect(zyra.n).toBe(3);
    expect(zyra.items.map((item: { itemId: string }) => item.itemId)).not.toContain("TFT_Item_BFSword");
    expect(zyra.items.some((item: { kind: string }) => item.kind === "component")).toBe(false);

    const ludens = zyra.items.find((item: { itemId: string }) => item.itemId === "DA_Artifact_LudensTempest");
    const horizon = zyra.items.find((item: { itemId: string }) => item.itemId === "DA_Artifact_HorizonFocus");
    expect(ludens.n).toBe(2);
    expect(ludens.avgPlace).toBe(1.5);
    expect(ludens.delta).toBeLessThan(0);
    expect(horizon.n).toBe(1);
    expect(horizon.avgPlace).toBe(8);
    expect(horizon.delta).toBeGreaterThan(0);

    const ranked = itemsForChampion(snapshot, "DA_18_Zyra", "artifact", 3);
    expect(ranked[0].itemId).toBe("DA_Artifact_LudensTempest");
    expect(ranked.map((item: { itemId: string }) => item.itemId)).toContain("DA_Artifact_HorizonFocus");
  });

  it("hides pairs below minSample so a one-off Horizon Focus does not rank", () => {
    const acc = createAccumulator();
    addMatch(acc, match(), maps);
    const snapshot = finalizeSnapshot(acc, { minSample: 20 });
    expect(itemsForChampion(snapshot, "DA_18_Zyra", "completed", 6)).toEqual([]);
    expect(itemsForChampion(snapshot, "DA_18_Zyra", "artifact", 3)).toEqual([]);
    expect(holdersForItem(snapshot, "DA_Artifact_HorizonFocus")).toEqual([]);
  });

  it("formats the overlay stat line", () => {
    expect(formatItemStat({ n: 412, avgPlace: 3.94, delta: -0.21 })).toBe("n=412 · 3.94 · −0.21");
    expect(formatItemStat({ n: 20, avgPlace: 4.5, delta: 0.4 })).toBe("n=20 · 4.50 · +0.40");
  });
});

describe("fetch-stats entry", () => {
  it("exits with a clear error when the key is missing", () => {
    const result = spawnSync(process.execPath, ["scripts/fetch-stats.mjs"], {
      cwd: ROOT,
      env: { ...process.env, RIOT_API_KEY: "" },
      encoding: "utf8",
    });
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/Missing RIOT_API_KEY/);
  });
});
