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
    dataVersion: "v1",
    changeType: "new",
    verificationStatus: "demo_verified",
    verification: {
      name: "demo_verified",
      maxRank: "demo_verified",
      tier: "demo_verified",
      description: "demo_verified",
      prerequisite: "demo_verified",
    },
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
    status: "available",
    talents: [],
    ...overrides,
  };
}

describe("compareTalentVersions", () => {
  it("returns a waiting diff when beta has no real data yet, not 52 removals", () => {
    const previous = makeDataset({ role: "community-preview", talents: [makeTalent()] });
    const next = makeDataset({ status: "waiting", talents: [] });

    const diff = compareTalentVersions(previous, next);

    expect(diff.status).toBe("waiting");
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
    expect(diff.unchanged).toHaveLength(0);
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

  it("reports a preview talent absent from beta as removed", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ id: "old-talent" })] }),
      makeDataset({ talents: [] }),
    );

    expect(diff.removed.map((talent) => talent.id)).toEqual(["old-talent"]);
  });

  it("captures a rank change", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ maxRank: 1 })] }),
      makeDataset({ talents: [makeTalent({ maxRank: 3 })] }),
    );

    expect(diff.changed[0].changes.maxRank).toEqual({ before: 1, after: 3 });
  });

  it("captures a tier change", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ requiredTreePoints: 5 })] }),
      makeDataset({ talents: [makeTalent({ requiredTreePoints: 10 })] }),
    );

    expect(diff.changed[0].changes.requiredTreePoints).toEqual({ before: 5, after: 10 });
  });

  it("captures a row move", () => {
    const diff = compareTalentVersions(
      makeDataset({ talents: [makeTalent({ y: 5 })] }),
      makeDataset({ talents: [makeTalent({ y: 4 })] }),
    );

    expect(diff.changed[0].changes.y).toEqual({ before: 5, after: 4 });
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
