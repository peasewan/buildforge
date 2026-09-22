import type { EvidenceStatus } from '../data/verification'
import { canIncrementPlannerTalent, incrementPlannerTalent } from './talentPlanner'
import type { PlannerBuild, PlannerConfig, PlannerTalent } from './talentPlanner'

export type PlannerLevel = 20 | 30 | 60

export type ClassPageKind =
  | 'calculator'
  | 'buildsHub'
  | 'talents'
  | 'specBuild'
  | 'leveling'
  | 'specLeveling'
  | 'specTalents'
  | 'specPvp'
  | 'specDungeon'
  | 'aoe'
  | 'pvp'
  | 'dungeon'
  | 'levelCap'
  | 'comparison'
  | 'pet'
  | 'healing'
  | 'tank'
  | 'totem'

export type FieldEvidenceKey =
  | 'name'
  | 'branch'
  | 'row'
  | 'column'
  | 'maxRank'
  | 'requiredTreePoints'
  | 'rankDescriptions'
  | 'sourceTalentId'
  | 'prerequisiteLink'
  | 'iconName'
  | 'changeStatus'

export interface ClassTalentSource {
  label: string
  type: 'beta_client' | 'beta_client_crosscheck'
  url: string
}

export interface ClassTalent<B extends string> extends PlannerTalent<B> {
  name: string
  description?: string
  rankDescriptions?: string[]
  row: number
  column: number
  x: number
  y: number
  iconName?: string
  icon?: string
  sourceClientBuild: string
  verifiedThroughBuild: string
  sourceTalentId?: number
  nodeId?: number
  spellId?: number
  spellIds?: number[]
  dataNotes?: string[]
  fieldEvidence: Partial<Record<FieldEvidenceKey, EvidenceStatus | 'unknown'>>
  verificationStatus: EvidenceStatus
  prerequisiteRuleStatus: 'derived_assumption' | 'not_applicable'
  changeStatus: 'new' | 'changed' | 'same' | 'unknown'
  sources: ClassTalentSource[]
}

export interface ClassBuildSource {
  label: string
  url?: string
}

export interface ClassBuild {
  id: string
  spec: string
  intent: string
  level: PlannerLevel
  levelCap: number
  phase: string
  points: number
  allocation: string
  title: string
  shortTitle: string
  role: string
  playstyle: string[]
  strengths: string[]
  keyTalentIds: string[]
  order: string[]
  build: PlannerBuild
  evidence: 'community_verified' | 'derived_assumption'
  sources: ClassBuildSource[]
  verifiedThroughBuild: string
  createdAt: string
  updatedAt: string
  href: string
}

export interface ClassPageSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface ClassPageDefinition {
  kind: ClassPageKind
  slug: string
  intent: string
  title: string
  h1: string
  description: string
  eyebrow: string
  canonical: string
  robots: 'index, follow'
  /** Social card art for this page, overriding the class default when the page has its own. */
  ogImage?: string
  updatedAt: string
  spec?: string
  primaryBuildId?: string
  relatedBuildIds: string[]
  relatedPages: { href: string; label: string }[]
  sections: ClassPageSection[]
  faqs: { question: string; answer: string }[]
  comparison?: { columns: string[]; rows: { label: string; values: string[] }[] }
  /**
   * What this page needs before it may publish. Absent means `['talentDataset']`, so a page that
   * only lists or explains talents needs no declaration. See `satisfiedRequirements`.
   */
  publishRequirements?: PublishRequirement[]
}

/**
 * A page publishes only when the data it depends on exists. The gate is per page, not per class:
 * one branch that cannot produce a legal tree withholds the pages promising a build in that branch
 * and leaves the rest of the class shipped.
 */
export type PublishRequirement =
  /** The class has published, dual-source verified talents, so a catalogue has something to list. */
  | 'talentDataset'
  /** Every branch has an allocatable entry point (`requiredTreePoints === 0`). */
  | 'completeClassPlanner'
  /** The class has a legal build at the current level cap. */
  | 'level20Builds'
  /** The named branch has a legal build at the current level cap. */
  | `legalBuild:${string}`

export const legalBuildRequirement = (branch: string): PublishRequirement => `legalBuild:${branch}`

export interface ClassDefinition<B extends string = string> {
  id: string
  name: string
  plannerPath: string
  /**
   * Social card art for the class, used by every page that does not declare its own. Left unset
   * when the class has no art: a shell emits `og:image` only for an asset that exists.
   */
  ogImage?: string
  branches: readonly B[]
  /** Compact local artwork for branch tabs, build cards and document-page summaries. */
  branchIcons?: Partial<Record<B, string>>
  branchNames: Record<B, string>
  branchTaglines: Record<B, string>
  storageKey: string
  analyticsClass: string
  dataVersion: string
  verifiedBuild: string
  talentCount: number
  dataReview?: { ready: boolean; notice: string }
  beta: { phaseLabel: string; levelCap: number; pointsAtCap: number }
  plannerModes: { level: PlannerLevel; points: number; label: string }[]
  talents: ClassTalent<B>[]
  plannerConfig: PlannerConfig<B>
  builds: ClassBuild[]
  pages: ClassPageDefinition[]
  recommendedBuildIds: string[]
  sources: ClassTalentSource[]
}

const uniqueOrThrow = (pages: ClassPageDefinition[], key: keyof Pick<ClassPageDefinition, 'intent' | 'title' | 'h1' | 'canonical'>) => {
  const seen = new Set<string>()
  for (const page of pages) {
    const value = page[key]
    if (seen.has(value)) throw new Error(`duplicate class page ${key}: ${value}`)
    seen.add(value)
  }
}

export function assertUniquePageIntents(pages: ClassPageDefinition[]): void {
  uniqueOrThrow(pages, 'intent')
  uniqueOrThrow(pages, 'title')
  uniqueOrThrow(pages, 'h1')
  uniqueOrThrow(pages, 'canonical')
}

// Every published node carries both a primary client view and an independent cross-check view.
// Identity-only-on-one-source nodes never reach a ClassDefinition, so a dataset with no node
// stated by both sources has nothing a catalogue could honestly list.
const isDualSourceVerified = <B extends string>(talent: ClassTalent<B>): boolean => {
  const types = new Set(talent.sources.map((source) => source.type))
  return types.has('beta_client') && types.has('beta_client_crosscheck')
}

/**
 * Is this allocation something a player could actually spend?
 *
 * Replays the allocation through the planner's own allocation rules, which is what makes a branch
 * with no entry point impossible rather than merely unwritten: a node gated behind tree points
 * cannot be the first point spent, so no ordering exists and no build can promise one. Every id
 * has to resolve against the class dataset, every rank has to fit `maxRank`, prerequisites have to
 * be met at the rank the plan claims, and the whole allocation has to fit the current cap's budget.
 */
export function isLegalAllocation<B extends string>(build: PlannerBuild, talents: ClassTalent<B>[], config: PlannerConfig<B>, pointsAtCap: number): boolean {
  const byId = new Map(talents.map((talent) => [talent.id, talent]))
  const wanted = new Map<string, number>()
  for (const [id, rank] of Object.entries(build)) {
    if (!Number.isInteger(rank) || rank <= 0) continue
    const talent = byId.get(id)
    if (!talent || rank > talent.maxRank) return false
    wanted.set(id, rank)
  }
  // A page promising a build has to promise a build: an allocation that spends nothing is not one.
  if (wanted.size === 0) return false

  const budget: PlannerConfig<B> = { branches: config.branches, pointCap: pointsAtCap }
  let allocation: PlannerBuild = {}
  const outstanding = new Set(wanted.keys())
  while (outstanding.size > 0) {
    let progressed = false
    for (const id of outstanding) {
      const talent = byId.get(id)
      if (!talent) return false
      const target = wanted.get(id) ?? 0
      if ((allocation[id] ?? 0) >= target) {
        outstanding.delete(id)
        progressed = true
        continue
      }
      if (!canIncrementPlannerTalent(allocation, talent, talents, budget)) continue
      allocation = incrementPlannerTalent(allocation, talent, talents, budget)
      progressed = true
      if ((allocation[id] ?? 0) >= target) outstanding.delete(id)
    }
    if (!progressed) return false
  }
  return true
}

/** A build the class ships for the cap it is currently on, with a spendable allocation. */
function hasLegalBuildAtCap<B extends string>(classDef: ClassDefinition<B>, branch?: B): boolean {
  return classDef.builds.some((build) =>
    build.level === classDef.beta.levelCap
    && (branch === undefined || build.spec === branch)
    && isLegalAllocation(build.build, classDef.talents, classDef.plannerConfig, classDef.beta.pointsAtCap)
  )
}

/**
 * The branches that cannot be started: no published node in them has `requiredTreePoints === 0`.
 *
 * The planner's own first-point rule, stated once so the publish gate and the renderer cannot
 * disagree about which branches are allocatable. It is derived from the dataset, never from a list
 * of branch names: a class whose *arcane* tree lost its entry node gets the same answer as one
 * whose fire tree did, with no code change.
 */
export function unallocatableBranches<B extends string>(classDef: Pick<ClassDefinition<B>, 'branches' | 'talents'>): Set<B> {
  const entryPointBranches = new Set<B>()
  for (const talent of classDef.talents) {
    if (talent.requiredTreePoints === 0) entryPointBranches.add(talent.branch)
  }
  return new Set(classDef.branches.filter((branch) => !entryPointBranches.has(branch)))
}

/**
 * The requirements this class's data actually meets, derived from the class definition alone so
 * the same helper serves every class. Publishing is then a subset question — satisfying a
 * requirement is what publishes its pages, never an edited list of slugs.
 */
export function satisfiedRequirements<B extends string>(classDef: ClassDefinition<B>): Set<PublishRequirement> {
  const satisfied = new Set<PublishRequirement>()

  if (classDef.talents.some(isDualSourceVerified)) satisfied.add('talentDataset')

  // The calculator draws all branches at once, so every branch needs a node that can be allocated
  // first (`requiredTreePoints === 0`). One branch without one breaks the whole planner.
  if (classDef.dataReview?.ready !== false && classDef.branches.length > 0 && unallocatableBranches(classDef).size === 0) satisfied.add('completeClassPlanner')

  if (hasLegalBuildAtCap(classDef)) satisfied.add('level20Builds')
  for (const branch of classDef.branches) {
    if (hasLegalBuildAtCap(classDef, branch)) satisfied.add(legalBuildRequirement(branch))
  }

  return satisfied
}

/** A page with no declared requirements depends on the talent dataset, the floor every page needs. */
export function publishRequirementsFor(page: Pick<ClassPageDefinition, 'publishRequirements'>): PublishRequirement[] {
  return page.publishRequirements ?? ['talentDataset']
}

const requirementsMet = (page: Pick<ClassPageDefinition, 'publishRequirements'>, satisfied: Set<PublishRequirement>): boolean =>
  publishRequirementsFor(page).every((requirement) => satisfied.has(requirement))

export function pageFromPublishedClasses(pathname: string, classes: ClassDefinition[]): ClassPageDefinition | undefined {
  const slug = pathname.replace(/^\/+|\/+$/g, '')
  for (const classDef of classes) {
    // A class that does not define the slug is skipped before anything is evaluated, and a page
    // whose requirements are unmet is skipped as if it were not defined at all.
    if (!classDef.pages.some((page) => page.slug === slug)) continue
    const satisfied = satisfiedRequirements(classDef)
    const match = classDef.pages.find((page) => page.slug === slug && requirementsMet(page, satisfied) && pageBuildsValid(classDef, page))
    if (match) return match
  }
  return undefined
}

/**
 * Every page of the given classes whose declared requirements its own class satisfies.
 *
 * `pageFromPublishedClasses` answers "does this one path publish?"; this answers "what does the
 * registry publish in total?", which is what the static shells, Vite inputs, deployment rewrites,
 * prerender targets and sitemap rows iterate. Both read the same `requirementsMet`, so a page
 * cannot be served by one and generated by the other, and neither can be extended by editing a
 * slug list: satisfying a requirement publishes its pages with no new authoring.
 */
export function publishedClassPages<B extends string>(classes: ClassDefinition<B>[]): { classDef: ClassDefinition<B>; page: ClassPageDefinition }[] {
  return classes.flatMap((classDef) => {
    const satisfied = satisfiedRequirements(classDef)
    return classDef.pages.filter((page) => requirementsMet(page, satisfied) && pageBuildsValid(classDef, page)).map((page) => ({ classDef, page }))
  })
}

export function classPlannerHref(classDef: Pick<ClassDefinition, 'plannerPath'>, buildCode: string, level: PlannerLevel): string {
  const params = new URLSearchParams({ build: buildCode, level: String(level) })
  return `${classDef.plannerPath}?${params.toString()}`
}

export function sitemapLastmod(page: Pick<ClassPageDefinition, 'updatedAt'>): string {
  return page.updatedAt
}

function pageBuildsValid<B extends string>(classDef: ClassDefinition<B>, page: ClassPageDefinition): boolean {
  if (classDef.dataReview?.ready === false) return false
  const ids = [...page.relatedBuildIds, ...(page.primaryBuildId ? [page.primaryBuildId] : [])]
  return ids.every((id) => {
    const build = classDef.builds.find((candidate) => candidate.id === id)
    return !!build && isLegalAllocation(build.build, classDef.talents, classDef.plannerConfig, build.points)
  })
}
