import { encodeBuild, type Build } from '../lib/build'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'

export type BetaLevelingPageId = 'leveling' | 'protection-leveling' | 'retribution-leveling'

export interface BetaLevelingSnapshot {
  pageId: BetaLevelingPageId
  title: string
  current: { level: number; points: number; allocation: string; build: Build; note: string }
  next: { level: number; points: number; allocation: string; note: string }
  milestones: string[]
  recommendationSource: { label: string; href: string; updated: string }
}

const retributionCurrent: Build = {
  benediction: 5,
  conviction: 5,
  pursuit_of_justice: 1,
}

const protectionCurrent: Build = {
  improved_holy_strike: 2,
  redoubt: 5,
  precision: 3,
  anticipation: 1,
}

const retributionSnapshot = {
  title: 'Retribution-first Beta leveling path',
  current: {
    level: PALADIN_BETA_SNAPSHOT.phase.levelCap,
    points: PALADIN_BETA_SNAPSHOT.phase.levelCap - 9,
    allocation: '0/0/11',
    build: retributionCurrent,
    note: 'Spend the current 11 points into Benediction, Conviction, then the first rank of Pursuit of Justice.',
  },
  next: {
    level: PALADIN_BETA_SNAPSHOT.phase.nextLevelCap,
    points: PALADIN_BETA_SNAPSHOT.phase.nextLevelCap - 9,
    allocation: '0/0/21',
    note: 'The community route continues through Pursuit of Justice, Seal of Command, Sanctified Judgement, Sacred Arbiter, Crusade, Vindication, and Vengeance.',
  },
  milestones: ['5/5 Benediction', '5/5 Conviction', 'Pursuit of Justice → Seal of Command', 'Vengeance at the level-30 target'],
  recommendationSource: {
    label: 'Mobalytics Paladin Leveling Guide (Level 1–30)',
    href: 'https://mobalytics.gg/wow-forever/classes/paladin-leveling-guide',
    updated: 'September 17, 2026',
  },
}

export const BETA_LEVELING_SNAPSHOTS: Record<BetaLevelingPageId, BetaLevelingSnapshot> = {
  leveling: { pageId: 'leveling', ...retributionSnapshot },
  'retribution-leveling': { pageId: 'retribution-leveling', ...retributionSnapshot },
  'protection-leveling': {
    pageId: 'protection-leveling',
    title: 'Protection Beta leveling path',
    current: {
      level: PALADIN_BETA_SNAPSHOT.phase.levelCap,
      points: PALADIN_BETA_SNAPSHOT.phase.levelCap - 9,
      allocation: '2/9/0',
      build: protectionCurrent,
      note: 'Use 2 points in Improved Holy Strike, then build Redoubt, Precision, and the first rank of Anticipation for the current cap.',
    },
    next: {
      level: PALADIN_BETA_SNAPSHOT.phase.nextLevelCap,
      points: PALADIN_BETA_SNAPSHOT.phase.nextLevelCap - 9,
      allocation: '2/19/0',
      note: 'The community level-30 target adds Anticipation, Shield Specialization, Improved Righteous Fury, and threat or durability flex points.',
    },
    milestones: ['2/2 Improved Holy Strike', '5/5 Redoubt', '3/3 Precision', 'Shield Specialization → Improved Righteous Fury'],
    recommendationSource: {
      label: 'Mobalytics Protection Paladin Guide',
      href: 'https://mobalytics.gg/wow-forever/classes/protection-paladin-guide',
      updated: 'September 19, 2026',
    },
  },
}

export const betaLevelingSnapshot = (pageId: BetaLevelingPageId) => BETA_LEVELING_SNAPSHOTS[pageId]

export const betaLevelingPlannerHref = (pageId: BetaLevelingPageId) =>
  `/build?id=${encodeBuild(betaLevelingSnapshot(pageId).current.build)}#calculator`

export const BETA_LEVEL_CAP_SOURCE = {
  label: 'Blizzard — WoW Forever Beta Now Live',
  href: 'https://news.blizzard.com/en-us/article/24304160/the-world-of-warcraft-forever-beta-now-live',
}
