import type { TalentDataset } from "../data/datasets";
import { createBetaChangesDraft, type BetaChangesDraft } from "./betaChangesDraft";
import { compareTalentVersions } from "./talentDiff";
import { validateTalentDataset } from "./talentValidator";

export interface ReleaseSimulationResult {
  ok: boolean;
  errors: string[];
  draft?: BetaChangesDraft;
}

const buildFromVersion = (version: string) => version.replace("wow_forever_beta_", "");

export function simulateTalentRelease(previous: TalentDataset, candidate: TalentDataset): ReleaseSimulationResult {
  const errors = validateTalentDataset(candidate).map((error) => `${error.id}: ${error.message}`);
  if (candidate.role !== "beta") errors.push("Candidate must be a beta dataset");
  if (candidate.status !== "complete") errors.push("Candidate dataset is incomplete");
  if (candidate.sourceVersion === previous.sourceVersion) errors.push("Candidate build is not newer");
  if (errors.length) return { ok: false, errors };
  const diff = compareTalentVersions(previous, candidate);
  return {
    ok: true,
    errors: [],
    draft: createBetaChangesDraft(diff, {
      fromBuild: buildFromVersion(previous.sourceVersion),
      toBuild: buildFromVersion(candidate.sourceVersion),
    }),
  };
}

