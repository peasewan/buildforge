import { encodeBuild, type Build } from '../lib/build'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'

export type BetaLevelingPageId = 'leveling' | 'protection-leveling' | 'retribution-leveling'
export type BetaRouteStatus = 'current' | 'archived'
export const EMPTY_PALADIN_PLANNER_HREF = '/build?id=#calculator'

export const PROTECTION_ROUTE_ARCHIVE_NOTICE = 'Archived September 24, 2026: Blizzard removed Improved Holy Strike from the Beta talent tree. This 1.60.1.69913-era allocation is historical; a replacement Protection route has not been verified.'

export interface BetaLevelingSnapshot {
  pageId: BetaLevelingPageId
  title: string
  status: BetaRouteStatus
  archiveNotice?: string
  current: { level: number; points: number; allocation: string; build: Build; note: string }
  next: { level: number; points: number; note: string; status: 'under_review' }
  milestones: string[]
  recommendationSource: { label: string; href: string; updated: string }
}

const retributionCurrent: Build = {
  benediction: 5,
  conviction: 5,
  seal_of_command: 1,
}

const protectionCurrent: Build = {
  improved_holy_strike: 2,
  redoubt: 5,
  precision: 3,
  anticipation: 1,
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
    note: 'No Level 30 allocation has been reviewed against the updated client tree. The September 24 Crusade report remains unresolved in the imported data.',
    status: 'under_review' as const,
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
    status: 'archived',
    archiveNotice: PROTECTION_ROUTE_ARCHIVE_NOTICE,
    current: {
      level: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap,
      points: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap - 9,
      allocation: '2/9/0',
      build: protectionCurrent,
      note: 'The pre-September 24 route used 2 points in Improved Holy Strike before Redoubt, Precision, and Anticipation. It is retained only to explain the historical allocation.',
    },
    next: {
      level: PALADIN_BETA_SNAPSHOT.phase.levelCap,
      points: PALADIN_BETA_SNAPSHOT.phase.levelCap - 9,
      note: 'No replacement Level 30 route has been verified after Improved Holy Strike was removed. The old projection is withheld.',
      status: 'under_review',
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
  betaLevelingSnapshot(pageId).status === 'archived'
    ? EMPTY_PALADIN_PLANNER_HREF
    : `/build?id=${encodeBuild(betaLevelingSnapshot(pageId).current.build)}&level=20#calculator`

export const BETA_LEVEL_CAP_SOURCE = {
  label: 'Blizzard — October 1 Beta development notes',
  href: PALADIN_BETA_SNAPSHOT.phase.officialSource,
}
