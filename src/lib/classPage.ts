import type { EvidenceStatus } from '../data/verification'
import type { PlannerBuild, PlannerConfig, PlannerTalent } from './talentPlanner'

export type PlannerLevel = 20 | 30 | 60

export type ClassPageKind =
  | 'calculator'
  | 'buildsHub'
  | 'talents'
  | 'specBuild'
  | 'leveling'
  | 'specLeveling'
  | 'aoe'
  | 'pvp'
  | 'dungeon'
  | 'levelCap'
  | 'comparison'

export type FieldEvidenceKey =
  | 'name'
  | 'branch'
  | 'row'
  | 'column'
  | 'maxRank'
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
  updatedAt: string
  spec?: string
  primaryBuildId?: string
  relatedBuildIds: string[]
  relatedPages: { href: string; label: string }[]
  sections: ClassPageSection[]
  faqs: { question: string; answer: string }[]
  comparison?: { columns: string[]; rows: { label: string; values: string[] }[] }
}

export interface ClassDefinition<B extends string = string> {
  id: string
  name: string
  plannerPath: string
  branches: readonly B[]
  branchNames: Record<B, string>
  branchTaglines: Record<B, string>
  storageKey: string
  analyticsClass: string
  dataVersion: string
  verifiedBuild: string
  talentCount: number
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

export function pageFromPublishedClasses(pathname: string, classes: ClassDefinition[]): ClassPageDefinition | undefined {
  const slug = pathname.replace(/^\/+|\/+$/g, '')
  for (const classDef of classes) {
    const match = classDef.pages.find((page) => page.slug === slug)
    if (match) return match
  }
  return undefined
}

export function classPlannerHref(classDef: Pick<ClassDefinition, 'plannerPath'>, buildCode: string, level: PlannerLevel): string {
  const params = new URLSearchParams({ build: buildCode, level: String(level) })
  return `${classDef.plannerPath}?${params.toString()}`
}

export function sitemapLastmod(page: Pick<ClassPageDefinition, 'updatedAt'>): string {
  return page.updatedAt
}
