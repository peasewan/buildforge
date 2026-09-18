import type { Branch } from "./build";
import type { TalentDiff } from "./talentDiff";
import type { EvidenceStatus } from "../data/verification";

export type BetaChangeType =
  | "added"
  | "removed"
  | "moved"
  | "rank_changed"
  | "tooltip_changed"
  | "prerequisite_changed";

export interface BetaChangeDraftEntry {
  type: BetaChangeType;
  talentId: string;
  talentName: string;
  branch: Branch;
  rank?: number;
  before?: unknown;
  after?: unknown;
  verificationStatus: EvidenceStatus;
}

export interface BetaChangesDraft {
  fromBuild: string;
  toBuild: string;
  status: "no_changes" | "review_required";
  changeTypes: BetaChangeType[];
  entries: BetaChangeDraftEntry[];
}

const CHANGE_ORDER: BetaChangeType[] = [
  "added", "removed", "moved", "rank_changed", "tooltip_changed", "prerequisite_changed",
];

export function createBetaChangesDraft(
  diff: TalentDiff,
  builds: { fromBuild: string; toBuild: string },
): BetaChangesDraft {
  const entries: BetaChangeDraftEntry[] = [];
  for (const talent of diff.added) entries.push({ type: "added", talentId: talent.id, talentName: talent.name, branch: talent.branch, after: talent, verificationStatus: "client_datamined" });
  for (const talent of diff.removed) entries.push({ type: "removed", talentId: talent.id, talentName: talent.name, branch: talent.branch, before: talent, verificationStatus: "client_datamined" });
  for (const talent of diff.changed) {
    if (talent.changes.row || talent.changes.column || talent.changes.branch) {
      entries.push({ type: "moved", talentId: talent.id, talentName: talent.name, branch: talent.branch, before: { row: talent.changes.row?.before, column: talent.changes.column?.before, branch: talent.changes.branch?.before }, after: { row: talent.changes.row?.after, column: talent.changes.column?.after, branch: talent.changes.branch?.after }, verificationStatus: "client_datamined" });
    }
    if (talent.changes.maxRank) entries.push({ type: "rank_changed", talentId: talent.id, talentName: talent.name, branch: talent.branch, ...talent.changes.maxRank, verificationStatus: "client_datamined" });
    for (const rank of talent.changes.rankDescriptions ?? []) entries.push({ type: "tooltip_changed", talentId: talent.id, talentName: talent.name, branch: talent.branch, rank: rank.rank, before: rank.before, after: rank.after, verificationStatus: "client_datamined" });
    if (!talent.changes.rankDescriptions && talent.changes.description) entries.push({ type: "tooltip_changed", talentId: talent.id, talentName: talent.name, branch: talent.branch, ...talent.changes.description, verificationStatus: "client_datamined" });
    if (talent.changes.prerequisite) entries.push({ type: "prerequisite_changed", talentId: talent.id, talentName: talent.name, branch: talent.branch, ...talent.changes.prerequisite, verificationStatus: "client_datamined" });
  }
  return {
    ...builds,
    status: entries.length ? "review_required" : "no_changes",
    changeTypes: CHANGE_ORDER.filter((type) => entries.some((entry) => entry.type === type)),
    entries,
  };
}

