import { paladinLevelingHref } from './paladinLevelingProgression'
import { type Build } from '../lib/build'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { PROTECTION_LEVEL_20, PROTECTION_LEVEL_30, PROTECTION_ROUTE_EVIDENCE, protectionPlannerHref } from './protectionCurrentRoute'

export type BetaLevelingPageId = 'leveling' | 'protection-leveling' | 'retribution-leveling'
export type BetaRouteStatus = 'current' | 'archived'
export const EMPTY_PALADIN_PLANNER_HREF = '/build?id=#calculator'

export interface BetaLevelingSnapshot {
  pageId: BetaLevelingPageId
  title: string
  status: BetaRouteStatus
  archiveNotice?: string
  current: { level: number; points: number; allocation: string; build: Build; note: string }
  next: { level: number; points: number; note: string; status: 'under_review' | 'community_reviewed' | 'editorial_reviewed'; allocation?: string; build?: Build }
  milestones: string[]
  recommendationSource: { label: string; href: string; updated: string }
}

const retributionCurrent: Build = {
  benediction: 5,
  conviction: 5,
  seal_of_command: 1,
}

const retributionSnapshot = {
  title: 'Retribution-first Beta leveling path',
  status: 'current' as const,
  current: {
    level: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap,
    points: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap - 9,
    allocation: '0/0/11',
    build: retributionCurrent,
    note: 'This reviewed Level 20 starting route spends 11 points into Benediction, Conviction, then Seal of Command. It is a partial allocation at the current Level 30 cap.',
  },
  next: {
    level: PALADIN_BETA_SNAPSHOT.phase.levelCap,
    points: PALADIN_BETA_SNAPSHOT.phase.levelCap - 9,
    note: 'A community Level 10–30 Retribution timeline was reviewed October 4. It avoids Crusade; the complete updated client tree remains unverified.',
    status: 'community_reviewed' as const,
  },
  milestones: ['5/5 Benediction', '5/5 Conviction', 'Seal of Command at Level 20', 'Later points pending client reconciliation'],
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
    status: 'current',
    current: {
      level: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap,
      points: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap - 9,
      allocation: '0/11/0',
      build: PROTECTION_LEVEL_20,
      note: 'Standard progression without Legacy: Talented. Spend Toughness 5, Redoubt 5, then Precision 1. These selected nodes were reviewed in the 70170 Trait client tables; this editorial order is not a measured best build.',
    },
    next: {
      level: PALADIN_BETA_SNAPSHOT.phase.levelCap,
      points: PALADIN_BETA_SNAPSHOT.phase.levelCap - 9,
      allocation: '0/21/0',
      build: PROTECTION_LEVEL_30,
      note: 'Extend Precision to 3, add Anticipation 5, then Improved Righteous Fury 3. This is a legal editorial 21-point route for standard progression, not an official or performance-tested recommendation. Blizzard changed Redoubt to 4/8/12/16/20% on October 1; the imported 69913 tooltip remains older.',
      status: 'editorial_reviewed',
    },
    milestones: ['Levels 10–14: Toughness 5/5', 'Levels 15–19: Redoubt 5/5', 'Level 20: Precision 1/3', 'Levels 21–22: Precision 3/3', 'Levels 23–27: Anticipation 5/5', 'Levels 28–30: Improved Righteous Fury 3/3'],
    recommendationSource: {
      label: '70170 Paladin TraitNode source — editorial order by BuildForgeTools',
      href: PROTECTION_ROUTE_EVIDENCE.traitNodes,
      updated: PROTECTION_ROUTE_EVIDENCE.reviewedAt,
    },
  },
}

export const betaLevelingSnapshot = (pageId: BetaLevelingPageId) => BETA_LEVELING_SNAPSHOTS[pageId]

export const betaLevelingPlannerHref = (pageId: BetaLevelingPageId) =>
  pageId === 'protection-leveling'
    ? protectionPlannerHref(20)
    : betaLevelingSnapshot(pageId).status === 'archived'
    ? EMPTY_PALADIN_PLANNER_HREF
    : paladinLevelingHref(30)

export const BETA_LEVEL_CAP_SOURCE = {
  label: 'Blizzard — October 1 Beta development notes',
  href: PALADIN_BETA_SNAPSHOT.phase.officialSource,
}
