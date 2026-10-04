import { encodeBuild, type Branch, type Build } from '../lib/build'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { BETA_LEVEL_CAP_SOURCE, EMPTY_PALADIN_PLANNER_HREF, type BetaRouteStatus } from './levelingBeta'
import { PROTECTION_LEVEL_20, PROTECTION_LEVEL_30, PROTECTION_ROUTE_EVIDENCE } from './protectionCurrentRoute'

export interface BetaSpecPath {
  branch: Branch
  title: string
  status: BetaRouteStatus
  archiveNotice?: string
  bestFor: string[]
  current: {
    level: number
    points: number
    allocation: string
    build: Build
    steps: { levels: string; talent: string }[]
  }
  next: { level: number; points: number; note: string; status: 'under_review' | 'community_reviewed' | 'editorial_reviewed'; allocation?: string; build?: Build }
  recommendationSource: { label: string; href: string; updated: string }
}

const currentLevel = PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap
const currentPoints = currentLevel - 9
const nextLevel = PALADIN_BETA_SNAPSHOT.phase.levelCap
const nextPoints = nextLevel - 9

export const BETA_SPEC_PATHS: Record<Branch, BetaSpecPath> = {
  holy: {
    branch: 'holy',
    title: 'Holy Beta talent path',
    status: 'current',
    bestFor: ['Dungeon healing', 'Group leveling', 'Paladin support'],
    current: {
      level: currentLevel,
      points: currentPoints,
      allocation: '11/0/0',
      build: {
        divine_intellect: 5,
        healing_light: 3,
        spiritual_focus: 2,
        reverence: 1,
      },
      steps: [
        { levels: 'Levels 10–14', talent: '5/5 Divine Intellect' },
        { levels: 'Levels 15–17', talent: '3/3 Healing Light' },
        { levels: 'Levels 18–19', talent: '2/2 Spiritual Focus' },
        { levels: 'Level 20', talent: '1/3 Reverence' },
      ],
    },
    next: {
      level: nextLevel,
      points: nextPoints,
      note: 'No Level 30 Holy allocation has been reviewed against the updated client tree. The Level 20 route is only a starting snapshot.',
      status: 'under_review',
    },
    recommendationSource: {
      label: 'Mobalytics Holy Paladin Guide',
      href: 'https://mobalytics.gg/wow-forever/classes/holy-paladin-guide',
      updated: 'September 19, 2026',
    },
  },
  protection: {
    branch: 'protection',
    title: 'Protection Beta talent path',
    status: 'current',
    bestFor: ['Dungeon tanking', 'Group leveling', 'Defensive play'],
    current: {
      level: currentLevel,
      points: currentPoints,
      allocation: '0/11/0',
      build: PROTECTION_LEVEL_20,
      steps: [
        { levels: 'Levels 10–14', talent: '5/5 Toughness' },
        { levels: 'Levels 15–19', talent: '5/5 Redoubt' },
        { levels: 'Level 20', talent: '1/3 Precision' },
      ],
    },
    next: {
      level: nextLevel,
      points: nextPoints,
      note: 'Extend Precision to 3/3, add Anticipation 5/5, then Improved Righteous Fury 3/3. This 21-point standard-progression route is editorial, not a tested best build. Redoubt was changed to 4/8/12/16/20% in the October 1 official notes.',
      allocation: '0/21/0',
      build: PROTECTION_LEVEL_30,
      status: 'editorial_reviewed',
    },
    recommendationSource: {
      label: '70170 Paladin TraitNode source — editorial order by BuildForgeTools',
      href: PROTECTION_ROUTE_EVIDENCE.traitNodes,
      updated: PROTECTION_ROUTE_EVIDENCE.reviewedAt,
    },
  },
  retribution: {
    branch: 'retribution',
    title: 'Retribution Beta talent path',
    status: 'current',
    bestFor: ['Solo leveling', 'Questing', 'Dungeon damage'],
    current: {
      level: currentLevel,
      points: currentPoints,
      allocation: '0/0/11',
      build: {
        benediction: 5,
        conviction: 5,
        seal_of_command: 1,
      },
      steps: [
        { levels: 'Levels 10–14', talent: '5/5 Benediction' },
        { levels: 'Levels 15–19', talent: '5/5 Conviction' },
        { levels: 'Level 20', talent: '1/1 Seal of Command' },
      ],
    },
    next: {
      level: nextLevel,
      points: nextPoints,
      note: 'No Level 30 Retribution allocation has been reviewed against the updated client tree. The earlier projection included removed Improved Holy Strike and is withheld.',
      status: 'under_review',
    },
    recommendationSource: {
      label: 'Mobalytics Retribution Paladin Guide',
      href: 'https://mobalytics.gg/wow-forever/classes/retribution-paladin-guide',
      updated: 'September 19, 2026',
    },
  },
}

export const betaSpecPath = (branch: Branch) => BETA_SPEC_PATHS[branch]

export const betaSpecPlannerHref = (branch: Branch) =>
  betaSpecPath(branch).status === 'archived'
    ? EMPTY_PALADIN_PLANNER_HREF
    : `/build?id=${encodeBuild(betaSpecPath(branch).current.build)}&level=20#calculator`

export { BETA_LEVEL_CAP_SOURCE }
