import { describe, expect, it } from "vitest";
import { buildRecipeMap, combineItems, pairKey } from "./items";
import { matchesQuery, substitutePlaceholders } from "./text";
import { addUnit, createComp, importComps, upsertComp } from "./storage";
import type { Item } from "../data/types";

const items: Item[] = [
  {
    id: "DA_InfinityEdge",
    name: "Infinity Edge",
    icon: "",
    text: "",
    composition: ["DA_Component_BFSword", "DA_Component_SparringGloves"],
    unique: false,
    kind: "completed",
  },
  {
    id: "DA_Deathblade",
    name: "Deathblade",
    icon: "",
    text: "",
    composition: ["DA_Component_BFSword", "DA_Component_BFSword"],
    unique: false,
    kind: "completed",
  },
];

describe("item recipes", () => {
  it("combines components in either order", () => {
    expect(combineItems(items, "DA_Component_SparringGloves", "DA_Component_BFSword")?.name).toBe(
      "Infinity Edge",
    );
    expect(combineItems(items, "DA_Component_BFSword", "DA_Component_BFSword")?.name).toBe("Deathblade");
  });

  it("builds a stable pair key", () => {
    expect(pairKey("b", "a")).toBe("a+b");
    expect(buildRecipeMap(items).size).toBe(2);
  });
});

describe("text helpers", () => {
  it("substitutes named placeholders and strips markup", () => {
    const text = substitutePlaceholders(
      "Stun for @StunDuration@s and deal @Damage*100@% <magicDamage>damage</magicDamage>",
      { StunDuration: 1.5, Damage: 0.8 },
    );
    expect(text).toBe("Stun for 1.5s and deal 80% damage");
  });

  it("matches queries across fields", () => {
    expect(matchesQuery("lux", "Lux (Coven)", "Avatar")).toBe(true);
    expect(matchesQuery("  edge ", "Infinity Edge")).toBe(true);
    expect(matchesQuery("void", "Warmog")).toBe(false);
  });
});

describe("comp notebook", () => {
  it("creates, updates, and adds unique units", () => {
    const created = createComp("Riftbeast");
    const withUnit = addUnit(created, "DA_18_Ornn");
    const again = addUnit(withUnit, "DA_18_Ornn");
    expect(withUnit.units).toHaveLength(1);
    expect(again.units).toHaveLength(1);
    const saved = upsertComp([], withUnit);
    expect(saved[0].name).toBe("Riftbeast");
  });

  it("imports a comps payload", () => {
    const payload = JSON.stringify({
      version: 1,
      comps: [{ id: "a", name: "Test", notes: "", pinned: true, units: [], createdAt: 1, updatedAt: 1 }],
    });
    expect(importComps(payload)).toHaveLength(1);
  });
});
