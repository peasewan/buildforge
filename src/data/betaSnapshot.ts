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
  clientBuild: "1.60.1.69913",
  talentPayloadBuild: "1.60.1.69893",
  comparedWithBuild: "1.15.9.69722",
  updatedAt: "2026-09-20",
  betaStartsAt: "2026-09-17",
  betaEndsAt: "2026-10-21",
  phase: {
    label: "Beta Week 1",
    levelCap: 20,
    nextLevelCap: 30,
  },
  counts: {
    paladinTalents: 52,
    paladinNewTalents: 21,
    newTalentsByBranch: {
      holy: 9,
      protection: 5,
      retribution: 7,
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
      detail: "The Protection seal favors fast weapons, grants small absorb shields, and lets Judgment taunt.",
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
    {
      label: "Blizzard — Beta live, Week 1 level cap, and schedule",
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
