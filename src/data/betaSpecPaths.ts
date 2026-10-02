import { encodeBuild, type Branch, type Build } from '../lib/build'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { BETA_LEVEL_CAP_SOURCE, EMPTY_PALADIN_PLANNER_HREF, PROTECTION_ROUTE_ARCHIVE_NOTICE, type BetaRouteStatus } from './levelingBeta'

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
  next: { level: number; points: number; note: string; status: 'under_review' }
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
    status: 'archived',
    archiveNotice: PROTECTION_ROUTE_ARCHIVE_NOTICE,
    bestFor: ['Dungeon tanking', 'Group leveling', 'Defensive play'],
    current: {
      level: currentLevel,
      points: currentPoints,
      allocation: '2/9/0',
      build: {
        improved_holy_strike: 2,
        redoubt: 5,
        precision: 3,
        anticipation: 1,
      },
      steps: [
        { levels: 'Levels 10–11', talent: '2/2 Improved Holy Strike' },
        { levels: 'Levels 12–16', talent: '5/5 Redoubt' },
        { levels: 'Levels 17–19', talent: '3/3 Precision' },
        { levels: 'Level 20', talent: '1/5 Anticipation' },
      ],
    },
    next: {
      level: nextLevel,
      points: nextPoints,
      note: 'No replacement Level 30 Protection route has been verified after Improved Holy Strike was removed. The old projection is withheld.',
      status: 'under_review',
    },
    recommendationSource: {
      label: 'Mobalytics Protection Paladin Guide',
      href: 'https://mobalytics.gg/wow-forever/classes/protection-paladin-guide',
      updated: 'September 19, 2026',
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
