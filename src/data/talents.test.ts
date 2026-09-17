import { describe, expect, it } from "vitest";
import { DATA_VERSION, talents } from "./talents";

describe("WoW Forever Paladin talent data", () => {
  it("contains the complete 52-node Beta client dataset", () => {
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

  it("keeps change history separate from field-level verification", () => {
    for (const talent of talents) {
      expect(talent.dataVersion).toBe(DATA_VERSION);
      expect(talent.verificationStatus).toBe("beta_verified");
      expect(talent.rankDescriptions).toHaveLength(talent.maxRank);
      expect(["classic_unchanged", "moved", "updated", "new"]).toContain(
        talent.changeType,
      );
      expect(talent.verification).toEqual({
        name: expect.any(String),
        maxRank: expect.any(String),
        tier: expect.any(String),
        description: expect.any(String),
        prerequisite: expect.any(String),
      });
      expect(talent.sources.length).toBeGreaterThan(0);
      for (const source of talent.sources) {
        expect(source.label).toBeTruthy();
        expect(source.type).toBeTruthy();
      }
    }
  });

  it("keeps official announcements alongside Beta-client field verification", () => {
    const officiallyNamed = [
      "light_s_vigil",
      "templar_s_bulwark",
      "twist_of_light",
      "sacred_arbiter",
      "champion_of_the_light",
      "instrument_of_law",
    ];

    for (const id of officiallyNamed) {
      const talent = talents.find((candidate) => candidate.id === id);
      expect(talent?.verification.name).toBe("beta_verified");
      expect(talent?.verification.description).toBe("beta_verified");
      expect(talent?.sources.some((source) => source.type === "official")).toBe(
        true,
      );
    }
  });

  it("retains Classic comparison as provenance rather than verification", () => {
    const holyPower = talents.find((talent) => talent.id === "holy_power");
    expect(holyPower?.changeType).toBe("updated");
    expect(
      holyPower?.sources.some((source) => source.type === "classic_reference"),
    ).toBe(true);
    expect(holyPower?.verification.name).toBe("beta_verified");
  });
});
