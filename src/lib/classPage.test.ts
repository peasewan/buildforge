import { describe, expect, it } from 'vitest'
import {
  assertUniquePageIntents,
  classPlannerHref,
  legalBuildRequirement,
  pageFromPublishedClasses,
  publishRequirementsFor,
  satisfiedRequirements,
  sitemapLastmod,
  type ClassBuild,
  type ClassDefinition,
  type ClassPageDefinition,
  type ClassTalent,
  type ClassTalentSource,
} from './classPage'
import { totalPlannerPoints, type PlannerBuild } from './talentPlanner'

type FixtureBranch = 'alpha' | 'beta' | 'gamma'

const FIXTURE_BRANCHES = ['alpha', 'beta', 'gamma'] as const

// Every fixture talent carries both source types, which is what "published, dual-source
// verified" means for `talentDataset`. Nothing here reads the Mage dataset: the gate has to
// work from any `ClassDefinition`.
const dualSources: ClassTalentSource[] = [
  { label: 'Fixture client export', type: 'beta_client', url: 'https://example.test/fixture/client' },
  { label: 'Fixture crosscheck view', type: 'beta_client_crosscheck', url: 'https://example.test/fixture/crosscheck' },
]
const primaryOnlySources: ClassTalentSource[] = [dualSources[0]]

const talent = (
  id: string,
  branch: FixtureBranch,
  requiredTreePoints: number,
  options: { maxRank?: number; prerequisite?: { talentId: string; requiredRank: number | null }[]; sources?: ClassTalentSource[] } = {},
): ClassTalent<FixtureBranch> => ({
  id,
  branch,
  name: `Fixture ${id}`,
  row: requiredTreePoints === 0 ? 1 : 2,
  column: 1,
  x: 10,
  y: 20,
  maxRank: options.maxRank ?? 5,
  requiredTreePoints,
  prerequisite: options.prerequisite,
  prerequisiteRuleStatus: options.prerequisite ? 'derived_assumption' : 'not_applicable',
  sourceClientBuild: '1.60.1.69913',
  verifiedThroughBuild: '1.60.1.69913',
  fieldEvidence: {},
  verificationStatus: 'client_verified',
  changeStatus: 'same',
  sources: options.sources ?? dualSources,
})

// A tree every branch can be started from: each branch has a rank-1 entry node and a gated
// second-tier node behind it.
const fullTree: ClassTalent<FixtureBranch>[] = [
  talent('alpha-1', 'alpha', 0),
  talent('alpha-2', 'alpha', 5, { prerequisite: [{ talentId: 'alpha-1', requiredRank: null }] }),
  talent('beta-1', 'beta', 0),
  talent('beta-2', 'beta', 5, { prerequisite: [{ talentId: 'beta-1', requiredRank: null }] }),
  talent('gamma-1', 'gamma', 0),
  talent('gamma-2', 'gamma', 5, { prerequisite: [{ talentId: 'gamma-1', requiredRank: null }] }),
]

// The Mage fire case in fixture form: every gamma node sits behind a tree-point gate, so the
// branch has no allocatable entry point (`requiredTreePoints === 0`) and no allocation can exist.
const entrylessGammaTree: ClassTalent<FixtureBranch>[] = [
  ...fullTree.filter((node) => node.branch !== 'gamma'),
  talent('gamma-1', 'gamma', 5),
  talent('gamma-2', 'gamma', 10, { prerequisite: [{ talentId: 'gamma-1', requiredRank: null }] }),
]

const build = (id: string, spec: FixtureBranch, allocation: PlannerBuild, level = 20): ClassBuild => ({
  id,
  spec,
  intent: 'leveling',
  level,
  levelCap: 20,
  phase: 'Fixture Beta',
  points: totalPlannerPoints(allocation),
  allocation: Object.values(allocation).join('/'),
  title: `Fixture ${id}`,
  shortTitle: id,
  role: 'Fixture role',
  playstyle: [],
  strengths: [],
  keyTalentIds: Object.keys(allocation),
  order: Object.keys(allocation),
  build: allocation,
  evidence: 'community_verified',
  sources: [{ label: 'Fixture editorial preset' }],
  verifiedThroughBuild: '1.60.1.69913',
  createdAt: '2026-09-21',
  updatedAt: '2026-09-21',
  href: `/${id}`,
})

// Spends 10 of the 11 points a level-20 cap grants, and is spendable node by node.
const ALPHA_ALLOCATION: PlannerBuild = { 'alpha-1': 5, 'alpha-2': 5 }
const GAMMA_ALLOCATION: PlannerBuild = { 'gamma-1': 5, 'gamma-2': 5 }

const alphaBuild = build('fixture-alpha-leveling', 'alpha', ALPHA_ALLOCATION)
const gammaBuild = build('fixture-gamma-leveling', 'gamma', GAMMA_ALLOCATION)

const page = (overrides: Partial<ClassPageDefinition> & Pick<ClassPageDefinition, 'kind' | 'slug' | 'intent' | 'title' | 'h1' | 'canonical'>): ClassPageDefinition => ({
  description: 'd',
  eyebrow: 'e',
  robots: 'index, follow',
  updatedAt: '2026-09-21',
  relatedBuildIds: [],
  relatedPages: [],
  sections: [],
  faqs: [],
  ...overrides,
})

const pages = [
  page({ kind: 'calculator', slug: 'mage', intent: 'Talent Calculator', title: 'A', h1: 'HA', canonical: 'https://buildforgetools.com/mage' }),
  page({ kind: 'buildsHub', slug: 'wow-forever-mage-builds', intent: 'Builds Hub', title: 'B', h1: 'HB', canonical: 'https://buildforgetools.com/wow-forever-mage-builds' }),
]

const fixtureClass = (overrides: Partial<ClassDefinition<FixtureBranch>> = {}): ClassDefinition<FixtureBranch> => ({
  id: 'fixture',
  name: 'Fixture',
  plannerPath: '/fixture',
  branches: FIXTURE_BRANCHES,
  branchNames: { alpha: 'Alpha', beta: 'Beta', gamma: 'Gamma' },
  branchTaglines: { alpha: 'Tagline alpha.', beta: 'Tagline beta.', gamma: 'Tagline gamma.' },
  storageKey: 'wow-forever-fixture-build',
  analyticsClass: 'fixture',
  dataVersion: 'fixture_1.60.1.69913',
  verifiedBuild: '1.60.1.69913',
  talentCount: fullTree.length,
  beta: { phaseLabel: 'Fixture Beta', levelCap: 20, pointsAtCap: 11 },
  plannerModes: [
    { level: 20, points: 11, label: 'Level 20' },
    { level: 30, points: 21, label: 'Level 30' },
    { level: 60, points: 51, label: 'Level 60' },
  ],
  talents: fullTree,
  plannerConfig: { branches: FIXTURE_BRANCHES, pointCap: 51 },
  builds: [alphaBuild],
  pages,
  recommendedBuildIds: [alphaBuild.id],
  sources: dualSources,
  ...overrides,
})

const mageLike = fixtureClass()

describe('class page registry', () => {
  it('rejects duplicate intents, titles, h1s, or canonicals', () => {
    expect(() => assertUniquePageIntents([...pages, { ...pages[0], slug: 'dup' }])).toThrow(/intent/)
  })

  it('looks up published class pages and ignores unpublished paths', () => {
    expect(pageFromPublishedClasses('/wow-forever-mage-builds', [mageLike])?.kind).toBe('buildsHub')
    expect(pageFromPublishedClasses('/hunter', [mageLike])).toBeUndefined()
  })

  it('builds a planner share href from class path, encoded build, and level', () => {
    expect(classPlannerHref(mageLike, 'abc', 20)).toBe('/fixture?build=abc&level=20')
  })

  it('uses each page updatedAt as sitemap lastmod', () => {
    expect(sitemapLastmod(pages[0])).toBe('2026-09-21')
    expect(sitemapLastmod({ ...pages[0], updatedAt: '2026-10-02' })).toBe('2026-10-02')
  })
})

describe('published talent data', () => {
  it('satisfies legalBuild for the branch a legal build exists in, and withholds the others', () => {
    const satisfied = satisfiedRequirements(fixtureClass())

    expect(satisfied.has(legalBuildRequirement('alpha'))).toBe(true)
    expect(satisfied.has('legalBuild:beta')).toBe(false)
    expect(satisfied.has('legalBuild:gamma')).toBe(false)
  })

  it('withholds legalBuild for a branch whose authored build the dataset cannot allocate', () => {
    // The Mage fire shape: the build definition exists, but every node in the branch is gated
    // behind tree points and no node has `requiredTreePoints === 0`, so nothing can be spent.
    const blocked = fixtureClass({ talents: entrylessGammaTree, builds: [alphaBuild, gammaBuild] })
    expect(blocked.builds.some((entry) => entry.spec === 'gamma')).toBe(true)
    expect(satisfiedRequirements(blocked).has('legalBuild:gamma')).toBe(false)
    expect(satisfiedRequirements(blocked).has('legalBuild:alpha')).toBe(true)

    // Making the branch allocatable satisfies the same build definition: no re-authoring.
    const unblocked = fixtureClass({ talents: fullTree, builds: [alphaBuild, gammaBuild] })
    expect(satisfiedRequirements(unblocked).has('legalBuild:gamma')).toBe(true)
  })

  it('withholds legalBuild for a build the current cap cannot pay for or that names unknown nodes', () => {
    const overspent = fixtureClass({ builds: [build('fixture-alpha-overspent', 'alpha', { 'alpha-1': 5, 'alpha-2': 5, 'alpha-3': 5 })] })
    expect(satisfiedRequirements(overspent).has('legalBuild:alpha')).toBe(false)

    const unknown = fixtureClass({ builds: [build('fixture-alpha-unknown', 'alpha', { 'not-a-node': 5 })] })
    expect(satisfiedRequirements(unknown).has('legalBuild:alpha')).toBe(false)
  })

  it('satisfies completeClassPlanner only when every branch has an allocatable entry point', () => {
    expect(satisfiedRequirements(fixtureClass()).has('completeClassPlanner')).toBe(true)
    expect(satisfiedRequirements(fixtureClass({ talents: entrylessGammaTree })).has('completeClassPlanner')).toBe(false)
  })

  it('satisfies level20Builds only with a legal build at the current cap', () => {
    expect(satisfiedRequirements(fixtureClass()).has('level20Builds')).toBe(true)
    expect(satisfiedRequirements(fixtureClass({ talents: entrylessGammaTree, builds: [alphaBuild, gammaBuild] })).has('level20Builds')).toBe(true)
    // A build authored for a cap the class is not shipping is not a current-cap build.
    expect(satisfiedRequirements(fixtureClass({ builds: [build('fixture-alpha-level-60', 'alpha', ALPHA_ALLOCATION, 60)] })).has('level20Builds')).toBe(false)
  })
})

describe('requirement-gated page lookup', () => {
  const gated = page({
    kind: 'specBuild',
    slug: 'wow-forever-gamma-fixture-build',
    intent: 'Gamma Build',
    title: 'G',
    h1: 'HG',
    canonical: 'https://buildforgetools.com/wow-forever-gamma-fixture-build',
    publishRequirements: ['legalBuild:gamma'],
  })

  it('does not return a page whose requirement is unmet, even though its definition exists', () => {
    const withheld = fixtureClass({ pages: [gated, ...pages] })

    expect(withheld.pages.some((entry) => entry.slug === gated.slug)).toBe(true)
    expect(pageFromPublishedClasses(`/${gated.slug}`, [withheld])).toBeUndefined()
    // The same class still serves the pages it can back.
    expect(pageFromPublishedClasses('/wow-forever-mage-builds', [withheld])?.kind).toBe('buildsHub')
  })

  it('publishes a withheld page once the requirement is satisfied, with no new authoring', () => {
    const later = fixtureClass({ builds: [alphaBuild, gammaBuild], pages: [gated, ...pages] })
    expect(pageFromPublishedClasses(`/${gated.slug}`, [later])?.kind).toBe('specBuild')
  })

  it('treats a page with no publishRequirements as needing talentDataset', () => {
    expect(publishRequirementsFor(pages[1])).toEqual(['talentDataset'])

    expect(pageFromPublishedClasses('/wow-forever-mage-builds', [mageLike])).toBeDefined()
    // No published talents at all: the catalogue page has nothing to list.
    expect(pageFromPublishedClasses('/wow-forever-mage-builds', [fixtureClass({ talents: [] })])).toBeUndefined()
    // Single-source-only nodes are not dual-source verified, so they do not satisfy talentDataset.
    const singleSource = fixtureClass({ talents: fullTree.map((node) => ({ ...node, sources: primaryOnlySources })) })
    expect(pageFromPublishedClasses('/wow-forever-mage-builds', [singleSource])).toBeUndefined()
  })

  it('gates a page on every requirement it declares, not just one', () => {
    const doublyGated = { ...gated, slug: 'doubly-gated', publishRequirements: ['talentDataset', 'legalBuild:gamma'] as const }
    expect(pageFromPublishedClasses('/doubly-gated', [fixtureClass({ pages: [doublyGated as ClassPageDefinition] })])).toBeUndefined()
  })
})
