export interface BetaSource {
  label: string;
  url: string;
  kind: "official" | "datamine";
}

export interface ConfirmedPaladinChange {
  title: string;
  detail: string;
}

export const PALADIN_BETA_SNAPSHOT = {
  status: "tree-data-verified" as const,
  clientBuild: "1.60.1.70245",
  talentPayloadBuild: "1.60.1.70170",
  comparedWithBuild: "1.15.9.69722",
  updatedAt: "2026-10-07",
  betaStartsAt: "2026-09-17",
  betaEndsAt: "2026-10-21",
  phase: {
    label: "October 1 Beta update",
    levelCap: 30,
    routeSnapshotLevelCap: 20,
    updatedAt: "2026-10-01",
    officialSource: "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1",
  },
  counts: {
    paladinTalents: 50,
    paladinNewTalents: 19,
    newTalentsByBranch: {
      holy: 8,
      protection: 5,
      retribution: 6,
    },
    allClassTalentSpells: 60,
    paladinTalentSpells: 16,
    paladinSpells: 30,
    paladinSets: 9,
  },
  missingTreeFields: [],
  confirmedChanges: [
    {
      title: "Holy Strike",
      detail: "Paladins gain the instant Holy-damage weapon strike at level 6.",
    },
    {
      title: "Seal of Fury",
      detail: "Seal of Fury supports the Protection toolkit; weapon-speed and threat comparisons need separate gameplay evidence.",
    },
    {
      title: "Consecration",
      detail: "Consecration becomes baseline at level 20 and emphasizes its first four targets.",
    },
    {
      title: "Updated talent paths",
      detail: "Holy, Protection, and Retribution each receive newly described milestone talents and alternate paths.",
    },
  ] satisfies ConfirmedPaladinChange[],
  sources: [
    { label: "Wago DB2 — 70245 Paladin TraitTree 1100 structure", url: "https://wago.tools/db2/TraitNode/csv?build=1.60.1.70245", kind: "datamine" },
    { label: "Talents Forever — resolved 70170 rank text, CC BY 4.0", url: "https://talentsforever.com/data.json", kind: "datamine" },
    {
      label: "Blizzard — October 1 Beta development notes and Level 30 cap",
      url: "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1",
      kind: "official",
    },
    {
      label: "Blizzard — Beta launch, initial Level 20 cap, and schedule",
      url: "https://news.blizzard.com/en-us/article/24304160/the-world-of-warcraft-forever-beta-now-live",
      kind: "official",
    },
    {
      label: "Blizzard — Beta dates and access",
      url: "https://news.blizzard.com/en-us/article/24301508/pre-purchase-world-of-warcraft-forever-upgrades-and-begin-your-next-journey-in-azeroth",
      kind: "official",
    },
    {
      label: "Blizzard — Forever Deep Dive recap",
      url: "https://news.blizzard.com/en-us/article/24303313/world-of-warcraft-forever-deep-dive-panel-recap",
      kind: "official",
    },
    {
      label: "Community client datamine — Paladin abilities",
      url: "https://wowforeverbuilds.com/abilities/paladin",
      kind: "datamine",
    },
    {
      label: "ForeverDiff — per-build client record",
      url: "https://foreverdiff.com/builds/",
      kind: "datamine",
    },
    {
      label: "WoW Classic Forever — build 1.60.1.69913 Paladin talents",
      url: "https://wowclassicforever.info/talent/paladin/",
      kind: "datamine",
    },
    {
      label: "TheWoWDB — build 1.60.1.69913 Paladin talent table",
      url: "https://thewowdb.com/wow-forever/talents/",
      kind: "datamine",
    },
    {
      label: "WoW Classic Forever — client data updates",
      url: "https://wowclassicforever.info/updates/",
      kind: "datamine",
    },
  ] satisfies BetaSource[],
};
