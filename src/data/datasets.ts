import type { Talent } from "./talents";
import { talents } from "./talents";

// A dataset separates its ROLE (community-preview vs beta) from its SOURCE
// (which public material the transcription came from). The current demo
// transcription plays the "community-preview" role but keeps its original
// sourceVersion and label so the demo-vs-beta distinction is never washed out.
export type DatasetRole = "community-preview" | "beta";
export type DatasetStatus = "available" | "waiting";

export interface TalentDataset {
  role: DatasetRole;
  sourceVersion: string;
  label: string;
  status: DatasetStatus;
  talents: Talent[];
}

export const communityPreviewDataset: TalentDataset = {
  role: "community-preview",
  sourceVersion: "wow_forever_demo_2026-09-13",
  label: "Pre-Beta Demo Preview",
  status: "available",
  talents,
};

// Beta is intentionally EMPTY with an explicit "waiting" status. "Waiting"
// means "no real beta data has been transcribed yet", which is different from
// an available-but-empty release. The diff engine treats these separately.
export const betaDataset: TalentDataset = {
  role: "beta",
  sourceVersion: "wow_forever_beta_pending",
  label: "WoW Forever Beta",
  status: "waiting",
  talents: [],
};
