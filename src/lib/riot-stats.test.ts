import { describe, expect, it } from "vitest";
import { STATS, formatItemStat, hasLadderStats, ladderCaption, platformLabel } from "./riot-stats";

describe("committed ladder snapshot", () => {
  it("ships an NA ranked snapshot, not invented holders", () => {
    expect(STATS.platform).toBe("na1");
    expect(STATS.region).toBe("americas");
    expect(STATS.queueId).toBe(1100);
    expect(STATS.setNumber).toBe(18);
    expect(STATS.minSample).toBe(20);
    expect(STATS.matches).toBeGreaterThan(0);
    expect(STATS.units.length).toBeGreaterThan(0);
    expect(hasLadderStats()).toBe(true);
    expect(ladderCaption()).toMatch(/^NA \d+ games$/);
    expect(platformLabel("na1")).toBe("NA");
    expect(JSON.stringify(STATS)).not.toMatch(/RGAPI/);
  });

  it("formats n / avg / delta for the overlay", () => {
    expect(formatItemStat({ n: 412, avgPlace: 3.94, delta: -0.21 })).toBe("n=412 · 3.94 · −0.21");
    expect(formatItemStat({ n: 20, avgPlace: 4, delta: 0 })).toBe("n=20 · 4.00 · 0.00");
    expect(formatItemStat({})).toBe("");
  });
});
