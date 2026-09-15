import type { Branch } from "./build";
import type { Talent } from "../data/talents";
import type { TalentDataset } from "../data/datasets";

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
    prerequisite?: FieldChange<string[]>;
  };
}

export interface TalentDiff {
  status: "waiting" | "partial" | "available";
  added: Talent[];
  removed: Talent[];
  changed: TalentChange[];
  unchanged: Talent[];
}

const emptyDiff = (status: TalentDiff["status"]): TalentDiff => ({
  status,
  added: [],
  removed: [],
  changed: [],
  unchanged: [],
});

function arraysDiffer(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return true;
  return left.some((value, index) => value !== right[index]);
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
  const nextById = new Map(next.talents.map((talent) => [talent.id, talent]));

  const added: Talent[] = [];
  const removed: Talent[] = [];
  const changed: TalentChange[] = [];
  const unchanged: Talent[] = [];

  for (const nextTalent of next.talents) {
    const previousTalent = previousById.get(nextTalent.id);
    if (!previousTalent) {
      added.push(nextTalent);
      continue;
    }

    const changes: TalentChange["changes"] = {};
    if (previousTalent.name !== nextTalent.name) changes.name = { before: previousTalent.name, after: nextTalent.name };
    if (previousTalent.description !== nextTalent.description) changes.description = { before: previousTalent.description, after: nextTalent.description };
    if (previousTalent.maxRank !== nextTalent.maxRank) changes.maxRank = { before: previousTalent.maxRank, after: nextTalent.maxRank };
    if (previousTalent.requiredTreePoints !== nextTalent.requiredTreePoints) changes.requiredTreePoints = { before: previousTalent.requiredTreePoints, after: nextTalent.requiredTreePoints };
    if (previousTalent.row !== nextTalent.row) changes.row = { before: previousTalent.row, after: nextTalent.row };
    if (previousTalent.column !== nextTalent.column) changes.column = { before: previousTalent.column, after: nextTalent.column };
    if (previousTalent.branch !== nextTalent.branch) changes.branch = { before: previousTalent.branch, after: nextTalent.branch };
    if (arraysDiffer(previousTalent.prerequisite ?? [], nextTalent.prerequisite ?? [])) changes.prerequisite = { before: previousTalent.prerequisite ?? [], after: nextTalent.prerequisite ?? [] };

    if (Object.keys(changes).length > 0) {
      changed.push({ id: nextTalent.id, name: nextTalent.name, branch: nextTalent.branch, changes });
    } else {
      unchanged.push(nextTalent);
    }
  }

  for (const previousTalent of previous.talents) {
    if (!nextById.has(previousTalent.id) && next.coverage[previousTalent.branch] === "complete") {
      removed.push(previousTalent);
    }
  }

  return {
    status: next.status === "partial" ? "partial" : "available",
    added,
    removed,
    changed,
    unchanged,
  };
}
