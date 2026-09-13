import { describe, expect, it } from "vitest";
import { talents } from "./talents";

describe("WoW Forever Paladin talent data", () => {
  it("contains the complete 52-node community transcription", () => {
    expect(talents).toHaveLength(52);
    expect(talents.filter((talent) => talent.branch === "holy")).toHaveLength(
      18,
    );
    expect(
      talents.filter((talent) => talent.branch === "protection"),
    ).toHaveLength(16);
    expect(
      talents.filter((talent) => talent.branch === "retribution"),
    ).toHaveLength(18);
  });

  it("uses unique ids and valid prerequisites", () => {
    const ids = talents.map((talent) => talent.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const talent of talents) {
      expect(talent.x).toBeGreaterThan(0);
      expect(talent.x).toBeLessThan(100);
      expect(talent.y).toBeGreaterThan(0);
      expect(talent.y).toBeLessThan(100);
      for (const prerequisite of talent.prerequisite ?? []) {
        expect(ids).toContain(prerequisite);
      }
    }
  });
});
