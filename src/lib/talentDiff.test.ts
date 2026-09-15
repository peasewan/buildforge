import { describe, expect, it } from "vitest";
import type { Talent } from "../data/talents";
import type { TalentDataset } from "../data/datasets";
import { compareTalentVersions } from "./talentDiff";

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
      prerequisite: "demo_verified",
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

describe("compareTalentVersions", () => {
  it("returns a waiting diff when beta has no real data yet", () => {
    const previous = makeDataset({ role: "community-preview", talents: [makeTalent()] });
    const next = makeDataset({
      status: "waiting",
      coverage: { holy: "waiting", protection: "waiting", retribution: "waiting" },
      talents: [],
    });

    const diff = compareTalentVersions(previous, next);

    expect(diff.status).toBe("waiting");
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
    expect(diff.unchanged).toHaveLength(0);
  });

  it("does not report removals for branches that are only partial", () => {
    const previous = makeDataset({
      talents: [makeTalent({ id: "holy-a" }), makeTalent({ id: "prot-a", branch: "protection" })],
    });
    const next = makeDataset({
      status: "partial",
      coverage: { holy: "complete", protection: "partial", retribution: "waiting" },
      talents: [makeTalent({ id: "holy-a" })],
    });

    const diff = compareTalentVersions(previous, next);

    expect(diff.status).toBe("partial");
    // prot-a is missing from the partial beta, but its branch is only "partial",
    // so it must NOT be reported as removed.
    expect(diff.removed).toHaveLength(0);
  });

  it("reports removals only for branches marked complete", () => {
    const previous = makeDataset({
      talents: [makeTalent({ id: "holy-a" }), makeTalent({ id: "prot-a", branch: "protection" })],
    });
    const next = makeDataset({
      status: "complete",
      talents: [makeTalent({ id: "holy-a" })],
    });

    const diff = compareTalentVersions(previous, next);

    expect(diff.removed.map((talent) => talent.id)).toEqual(["prot-a"]);
  });

  it("marks an identical talent unchanged", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent()] }),
      makeDataset({ talents: [makeTalent()] }),
    );

    expect(diff.status).toBe("available");
    expect(diff.unchanged).toHaveLength(1);
    expect(diff.changed).toHaveLength(0);
  });

  it("reports a beta talent absent from preview as added", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [] }),
      makeDataset({ talents: [makeTalent({ id: "new-talent" })] }),
    );

    expect(diff.added.map((talent) => talent.id)).toEqual(["new-talent"]);
  });

  it("captures a rank change", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ maxRank: 1 })] }),
      makeDataset({ talents: [makeTalent({ maxRank: 3 })] }),
    );

    expect(diff.changed[0].changes.maxRank).toEqual({ before: 1, after: 3 });
  });

  it("captures a required-tree-points change", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ requiredTreePoints: 5 })] }),
      makeDataset({ talents: [makeTalent({ requiredTreePoints: 10 })] }),
    );

    expect(diff.changed[0].changes.requiredTreePoints).toEqual({ before: 5, after: 10 });
  });

  it("captures a row move", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ row: 5 })] }),
      makeDataset({ talents: [makeTalent({ row: 4 })] }),
    );

    expect(diff.changed[0].changes.row).toEqual({ before: 5, after: 4 });
  });

  it("captures a column move", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ column: 1 })] }),
      makeDataset({ talents: [makeTalent({ column: 2 })] }),
    );

    expect(diff.changed[0].changes.column).toEqual({ before: 1, after: 2 });
  });

  it("captures a prerequisite change", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ prerequisite: ["x"] })] }),
      makeDataset({ talents: [makeTalent({ prerequisite: ["y"] })] }),
    );

    expect(diff.changed[0].changes.prerequisite).toEqual({ before: ["x"], after: ["y"] });
  });

  it("captures a name and description update", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ name: "Old Name", description: "Old text." })] }),
      makeDataset({ talents: [makeTalent({ name: "New Name", description: "New text." })] }),
    );

    expect(diff.changed[0].changes.name).toEqual({ before: "Old Name", after: "New Name" });
    expect(diff.changed[0].changes.description).toEqual({ before: "Old text.", after: "New text." });
  });
});
