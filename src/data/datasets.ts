import type { Branch } from "../lib/build";
import type { Talent } from "./talents";
import { betaTalents, communityPreviewTalents, previousBetaTalents } from "./talents";

// The archived public-demo dataset is retained only for historical diffs.
// Production uses the complete Beta client dataset.
export type DatasetRole = "community-preview" | "beta";
export type DatasetStatus = "waiting" | "partial" | "complete";
export type BranchCoverage = "waiting" | "partial" | "complete";

export interface TalentDataset {
  role: DatasetRole;
  sourceVersion: string;
  label: string;
  status: DatasetStatus;
  coverage: Record<Branch, BranchCoverage>;
  talents: Talent[];
}

export const communityPreviewDataset: TalentDataset = {
  role: "community-preview",
  sourceVersion: "wow_forever_demo_2026-09-13",
  label: "Archived Public Demo Snapshot",
  status: "complete",
  coverage: { holy: "complete", protection: "complete", retribution: "complete" },
  talents: communityPreviewTalents,
};

export const betaDataset: TalentDataset = {
  role: "beta",
  sourceVersion: "wow_forever_beta_1.60.1.69893",
  label: "WoW Forever Beta · 1.60.1.69893",
  status: "complete",
  coverage: { holy: "complete", protection: "complete", retribution: "complete" },
  talents: betaTalents,
};

export const previousBetaDataset: TalentDataset = {
  role: "beta",
  sourceVersion: "wow_forever_beta_1.60.1.69876",
  label: "WoW Forever Beta · 1.60.1.69876",
  status: "complete",
  coverage: { holy: "complete", protection: "complete", retribution: "complete" },
  talents: previousBetaTalents,
};
