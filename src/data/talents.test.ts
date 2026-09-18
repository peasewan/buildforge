import { describe, expect, it } from "vitest";
import { betaTalents, DATA_VERSION, previousBetaTalents, talents } from "./talents";
import { compareTalentVersions } from "../lib/talentDiff";
import type { TalentDataset } from "./datasets";

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

  it("classifies the 21 Forever talents by specialization", () => {
    const newTalents = betaTalents.filter((talent) => talent.changeType === "new");

    expect(newTalents).toHaveLength(21);
    expect(newTalents.filter((talent) => talent.branch === "holy")).toHaveLength(9);
    expect(newTalents.filter((talent) => talent.branch === "protection")).toHaveLength(5);
    expect(newTalents.filter((talent) => talent.branch === "retribution")).toHaveLength(7);
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
        expect(ids).toContain(prerequisite.talentId);
        expect(prerequisite.requiredRank).toBeNull();
      }
    }
  });

  it("keeps change history separate from field-level verification", () => {
    for (const talent of talents) {
      expect(talent.dataVersion).toBe(DATA_VERSION);
      expect(talent.verificationStatus).toBe("client_verified");
      expect(talent.rankDescriptions).toHaveLength(talent.maxRank);
      expect(talent.clientNodeId).toEqual(expect.any(Number));
      expect(talent.spellId).toEqual(expect.any(Number));
      expect(["classic_unchanged", "moved", "updated", "new"]).toContain(
        talent.changeType,
      );
      expect(talent.verification).toEqual({
        name: expect.any(String),
        maxRank: expect.any(String),
        tier: expect.any(String),
        description: expect.any(String),
        prerequisiteLink: "client_verified",
        prerequisiteRule: "derived_assumption",
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
      expect(talent?.verification.name).toBe("client_verified");
      expect(talent?.verification.description).toBe("client_verified");
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
    expect(holyPower?.verification.name).toBe("client_verified");
  });

  it("captures the exact 69876 to 69893 client diff", () => {
    const dataset = (sourceVersion: string, entries: typeof talents): TalentDataset => ({
      role: "beta",
      sourceVersion,
      label: sourceVersion,
      status: "complete",
      coverage: { holy: "complete", protection: "complete", retribution: "complete" },
      talents: entries,
    });
    const diff = compareTalentVersions(
      dataset("wow_forever_beta_1.60.1.69876", previousBetaTalents),
      dataset(DATA_VERSION, betaTalents),
    );

    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed.map((change) => change.name)).toEqual([
      "Light's Vigil",
      "Vindication",
      "Seal of Command",
    ]);
    expect(diff.unchanged).toHaveLength(49);
    expect(diff.metadataChanged).toHaveLength(52);
    expect(diff.changed.find((change) => change.id === "vindication")?.changes.rankDescriptions).toHaveLength(3);
  });
});
