import type { Branch } from "./build";
import type { Talent } from "../data/talents";
import type { TalentDataset } from "../data/datasets";
import type { TalentPrerequisite } from "./build";

export interface FieldChange<T> {
  before: T;
  after: T;
}

export interface TalentChange {
  id: string;
  name: string;
  branch: Branch;
  changes: {
    name?: FieldChange<string>;
    description?: FieldChange<string>;
    maxRank?: FieldChange<number>;
    requiredTreePoints?: FieldChange<number>;
    row?: FieldChange<number>;
    column?: FieldChange<number>;
    branch?: FieldChange<Branch>;
    prerequisite?: FieldChange<TalentPrerequisite[]>;
    rankDescriptions?: RankDescriptionChange[];
  };
}

export interface RankDescriptionChange {
  rank: number;
  before: string;
  after: string;
}

export interface TalentMetadataChange {
  id: string;
  name: string;
  clientNodeId?: FieldChange<number | undefined>;
  spellId?: FieldChange<number | undefined>;
}

export interface TalentDiff {
  status: "waiting" | "partial" | "available";
  added: Talent[];
  removed: Talent[];
  changed: TalentChange[];
  metadataChanged: TalentMetadataChange[];
  unchanged: Talent[];
}

const emptyDiff = (status: TalentDiff["status"]): TalentDiff => ({
  status,
  added: [],
  removed: [],
  changed: [],
  metadataChanged: [],
  unchanged: [],
});

function prerequisitesDiffer(left: TalentPrerequisite[], right: TalentPrerequisite[]): boolean {
  if (left.length !== right.length) return true;
  return left.some((value, index) => {
    const other = right[index];
    return !other || value.talentId !== other.talentId || value.requiredRank !== other.requiredRank;
  });
}

function changedRankDescriptions(previous: Talent, next: Talent): RankDescriptionChange[] | undefined {
  if (!previous.rankDescriptions || !next.rankDescriptions) return undefined;
  const length = Math.max(previous.rankDescriptions.length, next.rankDescriptions.length);
  const changes: RankDescriptionChange[] = [];
  for (let index = 0; index < length; index += 1) {
    const before = previous.rankDescriptions[index] ?? "";
    const after = next.rankDescriptions[index] ?? "";
    if (before !== after) changes.push({ rank: index + 1, before, after });
  }
  return changes.length > 0 ? changes : undefined;
}

// Compares two talent datasets by id and reports every field that moved.
//
// Semantic fields (row, column, requiredTreePoints) are compared, not the CSS
// percentages used for rendering. "Removed" only applies to branches the next
// dataset marks "complete": a partial or waiting branch is simply not fully
// transcribed yet, so its absent talents are not removals.
export function compareTalentVersions(previous: TalentDataset, next: TalentDataset): TalentDiff {
  if (next.status === "waiting") return emptyDiff("waiting");

  const previousById = new Map(previous.talents.map((talent) => [talent.id, talent]));
  const previousByNodeId = new Map(previous.talents.filter((talent) => talent.clientNodeId !== undefined).map((talent) => [talent.clientNodeId, talent]));
  const previousBySpellId = new Map(previous.talents.filter((talent) => talent.spellId !== undefined).map((talent) => [talent.spellId, talent]));
  const matchedPreviousIds = new Set<string>();

  const added: Talent[] = [];
  const removed: Talent[] = [];
  const changed: TalentChange[] = [];
  const metadataChanged: TalentMetadataChange[] = [];
  const unchanged: Talent[] = [];

  for (const nextTalent of next.talents) {
    const previousTalent =
      (nextTalent.clientNodeId !== undefined ? previousByNodeId.get(nextTalent.clientNodeId) : undefined)
      ?? (nextTalent.spellId !== undefined ? previousBySpellId.get(nextTalent.spellId) : undefined)
      ?? previousById.get(nextTalent.id);
    if (!previousTalent) {
      added.push(nextTalent);
      continue;
    }
    matchedPreviousIds.add(previousTalent.id);

    const changes: TalentChange["changes"] = {};
    if (previousTalent.name !== nextTalent.name) changes.name = { before: previousTalent.name, after: nextTalent.name };
    if (previousTalent.description !== nextTalent.description) changes.description = { before: previousTalent.description, after: nextTalent.description };
    if (previousTalent.maxRank !== nextTalent.maxRank) changes.maxRank = { before: previousTalent.maxRank, after: nextTalent.maxRank };
    if (previousTalent.requiredTreePoints !== nextTalent.requiredTreePoints) changes.requiredTreePoints = { before: previousTalent.requiredTreePoints, after: nextTalent.requiredTreePoints };
    if (previousTalent.row !== nextTalent.row) changes.row = { before: previousTalent.row, after: nextTalent.row };
    if (previousTalent.column !== nextTalent.column) changes.column = { before: previousTalent.column, after: nextTalent.column };
    if (previousTalent.branch !== nextTalent.branch) changes.branch = { before: previousTalent.branch, after: nextTalent.branch };
    if (prerequisitesDiffer(previousTalent.prerequisite ?? [], nextTalent.prerequisite ?? [])) changes.prerequisite = { before: previousTalent.prerequisite ?? [], after: nextTalent.prerequisite ?? [] };
    const rankDescriptionChanges = changedRankDescriptions(previousTalent, nextTalent);
    if (rankDescriptionChanges) changes.rankDescriptions = rankDescriptionChanges;

    const metadata: TalentMetadataChange = { id: nextTalent.id, name: nextTalent.name };
    if (previousTalent.clientNodeId !== nextTalent.clientNodeId) metadata.clientNodeId = { before: previousTalent.clientNodeId, after: nextTalent.clientNodeId };
    if (previousTalent.spellId !== nextTalent.spellId) metadata.spellId = { before: previousTalent.spellId, after: nextTalent.spellId };
    if (metadata.clientNodeId || metadata.spellId) metadataChanged.push(metadata);

    if (Object.keys(changes).length > 0) {
      changed.push({ id: nextTalent.id, name: nextTalent.name, branch: nextTalent.branch, changes });
    } else {
      unchanged.push(nextTalent);
    }
  }

  for (const previousTalent of previous.talents) {
    if (!matchedPreviousIds.has(previousTalent.id) && next.coverage[previousTalent.branch] === "complete") {
      removed.push(previousTalent);
    }
  }

  return {
    status: next.status === "partial" ? "partial" : "available",
    added,
    removed,
    changed,
    metadataChanged,
    unchanged,
  };
}
