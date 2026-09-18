import { describe, expect, it } from "vitest";
import type { Talent } from "../data/talents";
import type { TalentDataset } from "../data/datasets";
import { validateTalentDataset } from "./talentValidator";

function makeTalent(overrides: Partial<Talent> = {}): Talent {
  return {
    id: "a",
    branch: "holy",
    maxRank: 1,
    requiredTreePoints: 0,
    prerequisite: undefined,
    name: "Talent A",
    description: "A description.",
    icon: "/img.png",
    dataVersion: "wow_forever_demo_2026-09-13",
    changeType: "new",
    verificationStatus: "demo_verified",
    verification: {
      name: "demo_verified",
      maxRank: "demo_verified",
      tier: "demo_verified",
      description: "demo_verified",
      prerequisiteLink: "demo_verified",
      prerequisiteRule: "derived_assumption",
    },
    row: 0,
    column: 0,
    x: 50,
    y: 0,
    sources: [{ type: "demo_recording", label: "Demo" }],
    ...overrides,
  };
}

function makeDataset(overrides: Partial<TalentDataset> = {}): TalentDataset {
  return {
    role: "beta",
    sourceVersion: "v2",
    label: "Beta",
    status: "complete",
    coverage: { holy: "complete", protection: "complete", retribution: "complete" },
    talents: [],
    ...overrides,
  };
}

describe("validateTalentDataset", () => {
  it("accepts a clean dataset", () => {
    const errors = validateTalentDataset(makeDataset({ talents: [makeTalent()] }));
    expect(errors).toHaveLength(0);
  });

  it("flags duplicate ids", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [makeTalent({ id: "a" }), makeTalent({ id: "a" })] }),
    );
    expect(errors.some((error) => error.message === "Duplicate talent id")).toBe(true);
  });

  it("flags a prerequisite that points to a missing talent", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [makeTalent({ id: "a", prerequisite: [{ talentId: "ghost", requiredRank: null }] })] }),
    );
    expect(errors.some((error) => error.message.includes("ghost"))).toBe(true);
  });

  it("flags a missing source", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [makeTalent({ sources: [] })] }),
    );
    expect(errors.some((error) => error.message === "Missing source")).toBe(true);
  });

  it("flags an invalid rank", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [makeTalent({ maxRank: 0 })] }),
    );
    expect(errors.some((error) => error.message === "Invalid maxRank")).toBe(true);
  });

  it("flags rank tooltip counts that do not match maxRank", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [makeTalent({ maxRank: 2, rankDescriptions: ["Rank one"] })] }),
    );
    expect(errors.some((error) => error.message === "rankDescriptions length does not match maxRank")).toBe(true);
  });

  it("flags duplicate branch grid positions", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [makeTalent({ id: "a" }), makeTalent({ id: "b" })] }),
    );
    expect(errors.some((error) => error.message === "Duplicate talent grid position")).toBe(true);
  });

  it("flags duplicate client node and spell ids when present", () => {
    const errors = validateTalentDataset(
      makeDataset({ talents: [
        makeTalent({ id: "a", clientNodeId: 42, spellId: 9001 }),
        makeTalent({ id: "b", row: 1, clientNodeId: 42, spellId: 9001 }),
      ] }),
    );
    expect(errors.some((error) => error.message === "Duplicate clientNodeId")).toBe(true);
    expect(errors.some((error) => error.message === "Duplicate spellId")).toBe(true);
  });

  it("flags prerequisite cycles", () => {
    const errors = validateTalentDataset(makeDataset({ talents: [
      makeTalent({ id: "a", prerequisite: [{ talentId: "b", requiredRank: null }] }),
      makeTalent({ id: "b", row: 1, prerequisite: [{ talentId: "a", requiredRank: null }] }),
    ] }));
    expect(errors.some((error) => error.message === "Prerequisite cycle detected")).toBe(true);
  });
});
