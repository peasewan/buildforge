import { describe, expect, it } from "vitest";
import { createBetaChangesDraft } from "./betaChangesDraft";
import type { TalentDiff } from "./talentDiff";
import type { Talent } from "../data/talents";

const talent = (id: string, name = id): Talent => ({
  id, name, branch: "holy", maxRank: 1, requiredTreePoints: 0, prerequisite: [],
  description: "after", rankDescriptions: ["after"], clientNodeId: 1, spellId: 2,
  icon: "/icon.png", dataVersion: "wow_forever_beta_1.60.1.69900", changeType: "updated",
  verificationStatus: "client_verified", verification: {
    name: "client_verified", maxRank: "client_verified", tier: "client_verified",
    description: "client_verified", prerequisiteLink: "client_verified", prerequisiteRule: "derived_assumption",
  }, row: 1, column: 1, x: 10, y: 10,
  sources: [{ type: "beta_client", label: "69900" }],
});

describe("Beta Changes draft", () => {
  it("turns a talent diff into explicit publishable change categories", () => {
    const next = talent("next", "Next Talent");
    const diff: TalentDiff = {
      status: "available", added: [next], removed: [talent("old", "Old Talent")], unchanged: [], metadataChanged: [],
      changed: [{ id: "changed", name: "Changed Talent", branch: "holy", changes: {
        row: { before: 1, after: 2 }, column: { before: 1, after: 3 },
        maxRank: { before: 3, after: 5 },
        prerequisite: { before: [], after: [{ talentId: "next", requiredRank: null }] },
        rankDescriptions: [{ rank: 2, before: "old", after: "new" }],
      } }],
    };
    const draft = createBetaChangesDraft(diff, { fromBuild: "69893", toBuild: "69900" });
    expect(draft.changeTypes).toEqual([
      "added", "removed", "moved", "rank_changed", "tooltip_changed", "prerequisite_changed",
    ]);
    expect(draft.entries.filter((entry) => entry.type === "tooltip_changed")[0].rank).toBe(2);
    expect(draft.status).toBe("review_required");
  });
});

