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
  status: "client-data-available" as const,
  clientBuild: "1.60.1.69876",
  comparedWithBuild: "1.15.9.69722",
  updatedAt: "2026-09-17",
  betaStartsAt: "2026-09-17",
  betaEndsAt: "2026-10-21",
  counts: {
    allClassTalentSpells: 60,
    paladinTalentSpells: 16,
    paladinSpells: 30,
    paladinSets: 9,
  },
  missingTreeFields: [
    "Talent tree positions",
    "Point costs and complete ranks",
    "Complete icons and prerequisites",
    "In-game verification for every tooltip",
  ],
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
  ] satisfies BetaSource[],
};
