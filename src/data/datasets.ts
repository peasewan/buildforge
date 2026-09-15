import type { Branch } from "../lib/build";
import type { Talent } from "./talents";
import { talents } from "./talents";

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
  talents,
};

// Beta is intentionally EMPTY with an explicit "waiting" status. "Waiting"
// means "no real beta data has been transcribed yet", which is different from
// an available-but-empty release. A partial beta (some branches transcribed,
// others not) uses "partial" plus per-branch coverage so the diff never reports
// a not-yet-transcribed branch as a batch of removals.
export const betaDataset: TalentDataset = {
  role: "beta",
  sourceVersion: "wow_forever_beta_pending",
  label: "WoW Forever Beta",
  status: "waiting",
  coverage: { holy: "waiting", protection: "waiting", retribution: "waiting" },
  talents: [],
};
