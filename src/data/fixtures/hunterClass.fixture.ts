import type {
  ClassBuild,
  ClassDefinition,
  ClassPageDefinition,
  ClassPageKind,
  ClassPageSection,
  ClassTalent,
  ClassTalentSource,
} from '../../lib/classPage'

/**
 * Unpublished Hunter fixture.
 *
 * This is the proof that the class-neutral renderers work from `ClassDefinition`
 * alone: it carries its own branches, storage key, planner path, presets and pages,
 * and it is deliberately kept out of `PUBLISHED_CLASSES` so no Hunter URL ships.
 * Every string here is fixture copy, never a claim about a real Hunter dataset.
 */
export type HunterBranch = 'beastmastery' | 'marksmanship' | 'survival'

export const HUNTER_FIXTURE_BRANCHES = ['beastmastery', 'marksmanship', 'survival'] as const

export const HUNTER_FIXTURE_STORAGE_KEY = 'wow-forever-hunter-fixture-build'

export const HUNTER_FIXTURE_LEVEL_20_BUILD_ID = 'hunter-bm-leveling'
export const HUNTER_FIXTURE_AOE_BUILD_ID = 'hunter-mm-aoe'
export const HUNTER_FIXTURE_PVP_BUILD_IDS = ['hunter-mm-pvp', 'hunter-sv-pvp'] as const

const branchNames: Record<HunterBranch, string> = {
  beastmastery: 'Beast Mastery',
  marksmanship: 'Marksmanship',
  survival: 'Survival',
}

const branchTaglines: Record<HunterBranch, string> = {
  beastmastery: 'Fixture tagline for the pet-led branch.',
  marksmanship: 'Fixture tagline for the ranged weapon branch.',
  survival: 'Fixture tagline for the close-range branch.',
}

// The fixture tree is three rows tall, so its coordinates use their own percentages.
const columnX: Record<number, number> = { 1: 12.5, 2: 37.5, 3: 62.5, 4: 87.5 }
const rowY: Record<number, number> = { 1: 15, 2: 50, 3: 85 }

const fixtureSources: ClassTalentSource[] = [
  { label: 'Fixture client export', type: 'beta_client', url: 'https://example.test/hunter/client' },
  { label: 'Fixture crosscheck view', type: 'beta_client_crosscheck', url: 'https://example.test/hunter/crosscheck' },
]

interface TalentSeed {
  id: string
  branch: HunterBranch
  name: string
  description: string
  rankDescriptions: string[]
  row: number
  column: number
  maxRank: number
  requiredTreePoints: number
  prerequisite?: { talentId: string; requiredRank: number | null }[]
  changeStatus: ClassTalent<HunterBranch>['changeStatus']
}

const talentSeeds: TalentSeed[] = [
  {
    id: 'bm-1',
    branch: 'beastmastery',
    name: 'Fixture Tracking',
    description: 'Fixture description for a rank-one entry node.',
    rankDescriptions: ['Rank one fixture text.', 'Rank two fixture text.', 'Rank three fixture text.', 'Rank four fixture text.', 'Rank five fixture text.'],
    row: 1,
    column: 2,
    maxRank: 5,
    requiredTreePoints: 0,
    changeStatus: 'same',
  },
  {
    id: 'bm-2',
    branch: 'beastmastery',
    name: 'Fixture Guard',
    description: 'Fixture description for a gated second-tier node.',
    rankDescriptions: ['Rank one fixture text.', 'Rank two fixture text.', 'Rank three fixture text.', 'Rank four fixture text.', 'Rank five fixture text.'],
    row: 2,
    column: 1,
    maxRank: 5,
    requiredTreePoints: 5,
    prerequisite: [{ talentId: 'bm-1', requiredRank: 5 }],
    changeStatus: 'changed',
  },
  {
    id: 'bm-3',
    branch: 'beastmastery',
    name: 'Fixture Pack Leader',
    description: 'Fixture description for a capstone node.',
    rankDescriptions: ['Capstone fixture text.'],
    row: 3,
    column: 3,
    maxRank: 1,
    requiredTreePoints: 10,
    prerequisite: [{ talentId: 'bm-2', requiredRank: 5 }],
    changeStatus: 'new',
  },
  {
    id: 'mm-1',
    branch: 'marksmanship',
    name: 'Fixture Steady Aim',
    description: 'Fixture description for the marksmanship entry node.',
    rankDescriptions: ['Rank one fixture text.', 'Rank two fixture text.', 'Rank three fixture text.', 'Rank four fixture text.', 'Rank five fixture text.'],
    row: 1,
    column: 1,
    maxRank: 5,
    requiredTreePoints: 0,
    changeStatus: 'same',
  },
  {
    id: 'mm-2',
    branch: 'marksmanship',
    name: 'Fixture Piercing Shots',
    description: 'Fixture description for the marksmanship second-tier node.',
    rankDescriptions: ['Rank one fixture text.', 'Rank two fixture text.', 'Rank three fixture text.', 'Rank four fixture text.', 'Rank five fixture text.'],
    row: 2,
    column: 2,
    maxRank: 5,
    requiredTreePoints: 5,
    prerequisite: [{ talentId: 'mm-1', requiredRank: 5 }],
    changeStatus: 'new',
  },
  {
    id: 'mm-3',
    branch: 'marksmanship',
    name: 'Fixture Rapid Volley',
    description: 'Fixture description for the marksmanship capstone node.',
    rankDescriptions: ['Capstone fixture text.'],
    row: 3,
    column: 4,
    maxRank: 1,
    requiredTreePoints: 10,
    prerequisite: [{ talentId: 'mm-2', requiredRank: 5 }],
    changeStatus: 'same',
  },
  {
    id: 'sv-1',
    branch: 'survival',
    name: 'Fixture Savage Strikes',
    description: 'Fixture description for the survival entry node.',
    rankDescriptions: ['Rank one fixture text.', 'Rank two fixture text.', 'Rank three fixture text.', 'Rank four fixture text.', 'Rank five fixture text.'],
    row: 1,
    column: 3,
    maxRank: 5,
    requiredTreePoints: 0,
    changeStatus: 'unknown',
  },
  {
    id: 'sv-2',
    branch: 'survival',
    name: 'Fixture Trapper Instinct',
    description: 'Fixture description for the survival second-tier node.',
    rankDescriptions: ['Rank one fixture text.', 'Rank two fixture text.', 'Rank three fixture text.', 'Rank four fixture text.', 'Rank five fixture text.'],
    row: 2,
    column: 4,
    maxRank: 5,
    requiredTreePoints: 5,
    prerequisite: [{ talentId: 'sv-1', requiredRank: 5 }],
    changeStatus: 'same',
  },
  {
    id: 'sv-3',
    branch: 'survival',
    name: 'Fixture Carve',
    description: 'Fixture description for the survival capstone node.',
    rankDescriptions: ['Capstone fixture text.'],
    row: 3,
    column: 1,
    maxRank: 1,
    requiredTreePoints: 10,
    prerequisite: [{ talentId: 'sv-2', requiredRank: 5 }],
    changeStatus: 'changed',
  },
]

export const hunterFixtureTalents: ClassTalent<HunterBranch>[] = talentSeeds.map((seed) => ({
  id: seed.id,
  branch: seed.branch,
  maxRank: seed.maxRank,
  requiredTreePoints: seed.requiredTreePoints,
  prerequisite: seed.prerequisite,
  name: seed.name,
  description: seed.description,
  rankDescriptions: seed.rankDescriptions,
  row: seed.row,
  column: seed.column,
  x: columnX[seed.column],
  y: rowY[seed.row],
  iconName: `fixture-${seed.id}`,
  sourceClientBuild: '1.60.1.69876',
  verifiedThroughBuild: '1.60.1.69913',
  fieldEvidence: {
    name: 'client_verified',
    branch: 'client_verified',
    row: 'client_verified',
    column: 'client_verified',
    maxRank: 'client_verified',
    rankDescriptions: 'client_verified',
    sourceTalentId: 'client_datamined',
    changeStatus: 'client_verified',
  },
  verificationStatus: 'client_verified',
  prerequisiteRuleStatus: 'derived_assumption',
  changeStatus: seed.changeStatus,
  sources: fixtureSources,
}))

export const hunterFixtureBuilds: ClassBuild[] = [
  {
    id: HUNTER_FIXTURE_LEVEL_20_BUILD_ID,
    spec: 'beastmastery',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '11/0/0',
    title: 'Beast Mastery Hunter Leveling Build',
    shortTitle: 'Beast Mastery Leveling',
    role: 'Fixture ranged damage',
    playstyle: ['Fixture pet-led pulls', 'Fixture steady single-target damage'],
    strengths: ['Fixture pet durability', 'Fixture simple rotation'],
    keyTalentIds: ['bm-1', 'bm-2', 'bm-3'],
    order: ['bm-1', 'bm-2', 'bm-3'],
    build: { 'bm-1': 5, 'bm-2': 5, 'bm-3': 1 },
    evidence: 'community_verified',
    sources: [{ label: 'Fixture editorial preset', url: 'https://buildforgetools.com/hunter' }],
    verifiedThroughBuild: '1.60.1.69913',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    href: '/wow-forever-beast-mastery-hunter-build',
  },
  {
    id: 'hunter-sv-leveling',
    spec: 'survival',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Survival Hunter Leveling Build',
    shortTitle: 'Survival Leveling',
    role: 'Fixture close-range damage',
    playstyle: ['Fixture close-range pressure'],
    strengths: ['Fixture trap utility'],
    keyTalentIds: ['sv-1', 'sv-2', 'sv-3'],
    order: ['sv-1', 'sv-2', 'sv-3'],
    build: { 'sv-1': 5, 'sv-2': 5, 'sv-3': 1 },
    evidence: 'community_verified',
    sources: [{ label: 'Fixture editorial preset', url: 'https://buildforgetools.com/hunter' }],
    verifiedThroughBuild: '1.60.1.69913',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    href: '/wow-forever-survival-hunter-leveling-build',
  },
  {
    id: HUNTER_FIXTURE_AOE_BUILD_ID,
    spec: 'marksmanship',
    intent: 'aoe',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/11/0',
    title: 'Marksmanship Hunter AoE Build',
    shortTitle: 'Marksmanship AoE',
    role: 'Fixture area damage',
    playstyle: ['Fixture multi-target volleys'],
    strengths: ['Fixture ranged area pressure'],
    keyTalentIds: ['mm-1', 'mm-2', 'mm-3'],
    order: ['mm-1', 'mm-2', 'mm-3'],
    build: { 'mm-1': 5, 'mm-2': 5, 'mm-3': 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'Fixture editorial preset', url: 'https://buildforgetools.com/hunter' }],
    verifiedThroughBuild: '1.60.1.69913',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    href: '/wow-forever-marksmanship-hunter-aoe-build',
  },
  {
    id: 'hunter-mm-pvp',
    spec: 'marksmanship',
    intent: 'pvp',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/11/0',
    title: 'Marksmanship Hunter PvP Build',
    shortTitle: 'Marksmanship PvP',
    role: 'Fixture ranged PvP',
    playstyle: ['Fixture kiting pressure'],
    strengths: ['Fixture burst window'],
    keyTalentIds: ['mm-1', 'mm-2', 'mm-3'],
    order: ['mm-1', 'mm-2', 'mm-3'],
    build: { 'mm-1': 5, 'mm-2': 5, 'mm-3': 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'Fixture editorial preset' }],
    verifiedThroughBuild: '1.60.1.69913',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    href: '/wow-forever-hunter-pvp-build',
  },
  {
    id: 'hunter-sv-pvp',
    spec: 'survival',
    intent: 'pvp',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Survival Hunter PvP Build',
    shortTitle: 'Survival PvP',
    role: 'Fixture close-range PvP',
    playstyle: ['Fixture trap control'],
    strengths: ['Fixture sustained pressure'],
    keyTalentIds: ['sv-1', 'sv-2', 'sv-3'],
    order: ['sv-1', 'sv-2', 'sv-3'],
    build: { 'sv-1': 5, 'sv-2': 5, 'sv-3': 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'Fixture editorial preset' }],
    verifiedThroughBuild: '1.60.1.69913',
    createdAt: '2026-09-21',
    updatedAt: '2026-09-21',
    href: '/wow-forever-hunter-pvp-build',
  },
]

interface PageSeed {
  kind: ClassPageKind
  slug: string
  intent: string
  title: string
  h1: string
  description: string
  eyebrow: string
  spec?: HunterBranch
  primaryBuildId?: string
  relatedBuildIds?: string[]
  relatedPages?: { href: string; label: string }[]
  sections?: ClassPageSection[]
  faqs?: { question: string; answer: string }[]
  comparison?: ClassPageDefinition['comparison']
}

const defaultSections = (h1: string): ClassPageSection[] => [
  { heading: `${h1} overview`, paragraphs: [`Fixture planning copy for ${h1}.`] },
]

const defaultFaqs = (h1: string): { question: string; answer: string }[] => [
  { question: `How is ${h1} sourced?`, answer: 'Fixture data only, kept out of the published class registry.' },
]

const pageSeeds: PageSeed[] = [
  {
    kind: 'calculator',
    slug: 'hunter',
    intent: 'Hunter Talent Calculator',
    title: 'WoW Forever Hunter Talent Calculator',
    h1: 'WoW Forever Hunter Talent Calculator',
    description: 'Plan the three fixture Hunter trees at the current Beta level cap.',
    eyebrow: 'Fixture Beta Planner',
    relatedBuildIds: [HUNTER_FIXTURE_LEVEL_20_BUILD_ID, HUNTER_FIXTURE_AOE_BUILD_ID],
    relatedPages: [
      { href: '/wow-forever-hunter-builds', label: 'Hunter Builds' },
      { href: '/wow-forever-hunter-talents', label: 'Hunter Talents' },
    ],
    sections: [
      { heading: 'How the fixture calculator works', paragraphs: ['Spend points, inspect ranks, and share a fixture build link.'], bullets: ['Fixture bullet one', 'Fixture bullet two'] },
    ],
  },
  {
    kind: 'buildsHub',
    slug: 'wow-forever-hunter-builds',
    intent: 'Hunter Builds Hub',
    title: 'WoW Forever Hunter Builds | Talent Calculator',
    h1: 'WoW Forever Hunter Builds',
    description: 'Every fixture Hunter preset in one place.',
    eyebrow: 'Fixture Build Hub',
    relatedBuildIds: [HUNTER_FIXTURE_LEVEL_20_BUILD_ID],
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'talents',
    slug: 'wow-forever-hunter-talents',
    intent: 'Hunter Talent Trees',
    title: 'WoW Forever Hunter Talents & Talent Trees',
    h1: 'WoW Forever Hunter Talents & Talent Trees',
    description: 'Fixture catalog of every node with its change status.',
    eyebrow: 'Fixture Talent Catalog',
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-beast-mastery-hunter-build',
    intent: 'Beast Mastery Hunter Build',
    title: 'WoW Forever Beast Mastery Hunter Build',
    h1: 'WoW Forever Beast Mastery Hunter Build',
    description: 'Fixture current-cap Beast Mastery allocation.',
    eyebrow: 'Fixture Spec Build',
    spec: 'beastmastery',
    primaryBuildId: HUNTER_FIXTURE_LEVEL_20_BUILD_ID,
    relatedBuildIds: [HUNTER_FIXTURE_AOE_BUILD_ID],
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'leveling',
    slug: 'wow-forever-hunter-leveling-build',
    intent: 'Hunter Leveling',
    title: 'WoW Forever Hunter Leveling Build',
    h1: 'WoW Forever Hunter Leveling Build',
    description: 'Fixture leveling recommendation for the Hunter fixture.',
    eyebrow: 'Fixture Leveling',
    primaryBuildId: HUNTER_FIXTURE_LEVEL_20_BUILD_ID,
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'specLeveling',
    slug: 'wow-forever-survival-hunter-leveling-build',
    intent: 'Survival Hunter Leveling',
    title: 'WoW Forever Survival Hunter Leveling Build',
    h1: 'WoW Forever Survival Hunter Leveling Build',
    description: 'Fixture leveling route for the Survival fixture branch.',
    eyebrow: 'Fixture Spec Leveling',
    spec: 'survival',
    primaryBuildId: 'hunter-sv-leveling',
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'aoe',
    slug: 'wow-forever-marksmanship-hunter-aoe-build',
    intent: 'Marksmanship Hunter AoE',
    title: 'WoW Forever Marksmanship Hunter AoE Build',
    h1: 'WoW Forever Marksmanship Hunter AoE Build',
    description: 'Fixture area-damage allocation.',
    eyebrow: 'Fixture AoE',
    spec: 'marksmanship',
    primaryBuildId: HUNTER_FIXTURE_AOE_BUILD_ID,
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'pvp',
    slug: 'wow-forever-hunter-pvp-build',
    intent: 'Hunter PvP Hub',
    title: 'WoW Forever Hunter PvP Build',
    h1: 'WoW Forever Hunter PvP Build',
    description: 'Fixture PvP hub with one tab per spec that has a PvP preset.',
    eyebrow: 'Fixture PvP',
    relatedBuildIds: [...HUNTER_FIXTURE_PVP_BUILD_IDS],
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'dungeon',
    slug: 'wow-forever-hunter-dungeon-build',
    intent: 'Hunter Dungeon',
    title: 'WoW Forever Hunter Dungeon Build',
    h1: 'WoW Forever Hunter Dungeon Build',
    description: 'Fixture dungeon utility allocation.',
    eyebrow: 'Fixture Dungeon',
    primaryBuildId: HUNTER_FIXTURE_AOE_BUILD_ID,
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'levelCap',
    slug: 'wow-forever-hunter-level-20-build',
    intent: 'Hunter Current Beta Cap',
    title: 'WoW Forever Hunter Level 20 Build',
    h1: 'WoW Forever Hunter Level 20 Build',
    description: 'Fixture level-cap snapshot for the three branch presets.',
    eyebrow: 'Fixture Level Cap',
    relatedPages: [{ href: '/hunter', label: 'Hunter Calculator' }],
  },
  {
    kind: 'comparison',
    slug: 'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling',
    intent: 'Beast Mastery vs Marksmanship Leveling',
    title: 'Beast Mastery vs Marksmanship Hunter for Leveling in WoW Forever',
    h1: 'Beast Mastery vs Marksmanship Hunter for Leveling',
    description: 'Fixture comparison of the two Hunter fixture branches.',
    eyebrow: 'Fixture Comparison',
    sections: [
      { heading: 'How to read this fixture comparison', paragraphs: ['Fixture comparison copy without composite scores.'], bullets: ['Fixture comparison bullet'] },
    ],
    faqs: [
      { question: 'Which Hunter fixture branch should a new player pick?', answer: 'Fixture answer: either branch works for the fixture dataset.' },
      { question: 'Does this fixture page publish a Hunter URL?', answer: 'Fixture answer: no, the Hunter fixture stays out of the class registry.' },
    ],
    comparison: {
      columns: ['Playstyle', 'AoE', 'Safety', 'Key mechanics', 'Current Beta'],
      rows: [
        { label: 'Beast Mastery', values: ['Fixture pet-led pressure', 'Fixture low area damage', 'Fixture high durability', 'Fixture pet control', 'Fixture 11 points available'] },
        { label: 'Marksmanship', values: ['Fixture ranged burst', 'Fixture high area damage', 'Fixture medium durability', 'Fixture volley windows', 'Fixture 11 points planned'] },
      ],
    },
  },
]

const fixturePages: ClassPageDefinition[] = pageSeeds.map((seed) => ({
  kind: seed.kind,
  slug: seed.slug,
  intent: seed.intent,
  title: seed.title,
  h1: seed.h1,
  description: seed.description,
  eyebrow: seed.eyebrow,
  canonical: `https://buildforgetools.com/${seed.slug}`,
  robots: 'index, follow',
  updatedAt: '2026-09-21',
  spec: seed.spec,
  primaryBuildId: seed.primaryBuildId,
  relatedBuildIds: seed.relatedBuildIds ?? [],
  relatedPages: seed.relatedPages ?? [],
  sections: seed.sections ?? defaultSections(seed.h1),
  faqs: seed.faqs ?? defaultFaqs(seed.h1),
  comparison: seed.comparison,
}))

export const hunterClassFixture: ClassDefinition<HunterBranch> = {
  id: 'hunter',
  name: 'Hunter',
  plannerPath: '/hunter',
  branches: HUNTER_FIXTURE_BRANCHES,
  branchNames,
  branchTaglines,
  storageKey: HUNTER_FIXTURE_STORAGE_KEY,
  analyticsClass: 'hunter_fixture',
  dataVersion: 'hunter_fixture_2026_09_21',
  verifiedBuild: '1.60.1.69913',
  talentCount: hunterFixtureTalents.length,
  beta: { phaseLabel: 'Beta · Build 1.60.1.69913', levelCap: 20, pointsAtCap: 11 },
  plannerModes: [
    { level: 20, points: 11, label: 'Level 20' },
    { level: 30, points: 21, label: 'Level 30' },
    { level: 60, points: 51, label: 'Level 60' },
  ],
  talents: hunterFixtureTalents,
  plannerConfig: { branches: HUNTER_FIXTURE_BRANCHES, pointCap: 51 },
  builds: hunterFixtureBuilds,
  pages: fixturePages,
  recommendedBuildIds: [HUNTER_FIXTURE_LEVEL_20_BUILD_ID, HUNTER_FIXTURE_AOE_BUILD_ID],
  sources: fixtureSources,
}
