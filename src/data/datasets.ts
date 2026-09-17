import type { Branch } from "../lib/build";
import type { Talent } from "./talents";
import { betaTalents, communityPreviewTalents } from "./talents";

// A dataset separates its ROLE (community-preview vs beta) from its SOURCE
// (which public material the transcription came from). The current demo
// transcription plays the "community-preview" role but keeps its original
// sourceVersion and label so the demo-vs-beta distinction is never washed out.
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
  label: "Pre-Beta Demo Preview",
  status: "complete",
  coverage: { holy: "complete", protection: "complete", retribution: "complete" },
  talents: communityPreviewTalents,
};

export const betaDataset: TalentDataset = {
  role: "beta",
  sourceVersion: "wow_forever_beta_1.60.1.69876",
  label: "WoW Forever Beta · 1.60.1.69876",
  status: "complete",
  coverage: { holy: "complete", protection: "complete", retribution: "complete" },
  talents: betaTalents,
};
