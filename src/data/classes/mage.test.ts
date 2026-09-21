import { describe, expect, it } from 'vitest'
import {
  assertUniquePageIntents,
  pageFromPublishedClasses,
  publishRequirementsFor,
  satisfiedRequirements,
  type ClassBuild,
  type ClassPageKind,
  type PublishRequirement,
} from '../../lib/classPage'
import {
  canIncrementPlannerTalent,
  incrementPlannerTalent,
  totalPlannerPoints,
  type PlannerBuild,
  type PlannerConfig,
} from '../../lib/talentPlanner'
import { MAGE_BRANCHES, mageTalents, type MageBranch } from '../mageTalents'
import { mageClass } from './mage'
import { PUBLISHED_CLASSES } from './index'

/**
 * The spec's fifteen rows, copied from
 * `docs/superpowers/specs/2026-09-21-mage-class-template-design.md` → "Public Mage URLs".
 * Titles and H1s are compared verbatim, so a reworded page fails here rather than shipping.
 */
const SPEC_PAGES: { slug: string; kind: ClassPageKind; intent: string; title: string; h1: string }[] = [
  { slug: 'mage', kind: 'calculator', intent: 'Talent Calculator', title: 'WoW Forever Mage Talent Calculator – Arcane, Fire & Frost', h1: 'WoW Forever Mage Talent Calculator' },
  { slug: 'wow-forever-mage-builds', kind: 'buildsHub', intent: 'Builds Hub', title: 'WoW Forever Mage Builds | Talent Calculator', h1: 'WoW Forever Mage Builds' },
  { slug: 'wow-forever-mage-talents', kind: 'talents', intent: 'Talent trees / changes', title: 'WoW Forever Mage Talents & Talent Trees', h1: 'WoW Forever Mage Talents & Talent Trees' },
  { slug: 'wow-forever-mage-leveling-build', kind: 'leveling', intent: 'Mage Leveling', title: 'WoW Forever Mage Leveling Build | Level 20 Beta', h1: 'WoW Forever Mage Leveling Build' },
  { slug: 'wow-forever-frost-mage-build', kind: 'specBuild', intent: 'Frost Build', title: 'WoW Forever Frost Mage Build | Level 20 Beta', h1: 'WoW Forever Frost Mage Build' },
  { slug: 'wow-forever-fire-mage-build', kind: 'specBuild', intent: 'Fire Build', title: 'WoW Forever Fire Mage Build | Level 20 Beta', h1: 'WoW Forever Fire Mage Build' },
  { slug: 'wow-forever-arcane-mage-build', kind: 'specBuild', intent: 'Arcane Build', title: 'WoW Forever Arcane Mage Build | Level 20 Beta', h1: 'WoW Forever Arcane Mage Build' },
  { slug: 'wow-forever-frost-mage-leveling-build', kind: 'specLeveling', intent: 'Frost Leveling', title: 'WoW Forever Frost Mage Leveling Build', h1: 'WoW Forever Frost Mage Leveling Build' },
  { slug: 'wow-forever-fire-mage-leveling-build', kind: 'specLeveling', intent: 'Fire Leveling', title: 'WoW Forever Fire Mage Leveling Build', h1: 'WoW Forever Fire Mage Leveling Build' },
  { slug: 'wow-forever-arcane-mage-leveling-build', kind: 'specLeveling', intent: 'Arcane Leveling', title: 'WoW Forever Arcane Mage Leveling Build', h1: 'WoW Forever Arcane Mage Leveling Build' },
  { slug: 'wow-forever-frost-mage-aoe-build', kind: 'aoe', intent: 'Frost AoE farming', title: 'WoW Forever Frost Mage AoE Build', h1: 'WoW Forever Frost Mage AoE Build' },
  { slug: 'wow-forever-mage-pvp-build', kind: 'pvp', intent: 'Mage PvP hub', title: 'WoW Forever Mage PvP Build', h1: 'WoW Forever Mage PvP Build' },
  { slug: 'wow-forever-mage-dungeon-build', kind: 'dungeon', intent: 'Dungeon', title: 'WoW Forever Mage Dungeon Build', h1: 'WoW Forever Mage Dungeon Build' },
  { slug: 'wow-forever-mage-level-20-build', kind: 'levelCap', intent: 'Current Beta cap', title: 'WoW Forever Mage Level 20 Build', h1: 'WoW Forever Mage Level 20 Build' },
  { slug: 'wow-forever-frost-vs-fire-mage-leveling', kind: 'comparison', intent: 'Frost vs Fire leveling', title: 'Frost vs Fire Mage for Leveling in WoW Forever', h1: 'Frost vs Fire Mage for Leveling in WoW Forever' },
]

/** The plan's Global Constraints: exactly these eight URLs publish. */
const PUBLISHED_SLUGS = [
  'wow-forever-mage-talents',
  'wow-forever-frost-mage-build',
  'wow-forever-frost-mage-leveling-build',
  'wow-forever-frost-mage-aoe-build',
  'wow-forever-arcane-mage-build',
  'wow-forever-arcane-mage-leveling-build',
  'wow-forever-mage-leveling-build',
  'wow-forever-mage-dungeon-build',
]

/** The plan's Global Constraints: these seven URLs stay unpublished, for the stated reason. */
const WITHHELD: Record<string, PublishRequirement> = {
  mage: 'completeClassPlanner',
  'wow-forever-mage-builds': 'completeClassPlanner',
  'wow-forever-mage-level-20-build': 'completeClassPlanner',
  'wow-forever-fire-mage-build': 'legalBuild:fire',
  'wow-forever-fire-mage-leveling-build': 'legalBuild:fire',
  'wow-forever-mage-pvp-build': 'legalBuild:fire',
  'wow-forever-frost-vs-fire-mage-leveling': 'legalBuild:fire',
}

/** R15: the gate reads `classDef.beta`, so builds must be authored in lockstep with it. */
const capConfig: PlannerConfig<MageBranch> = { branches: MAGE_BRANCHES, pointCap: mageClass.beta.pointsAtCap }

const buildById = (id: string | undefined): ClassBuild | undefined => (id ? mageClass.builds.find((build) => build.id === id) : undefined)

const fireTalentIds = new Set(mageTalents.filter((talent) => talent.branch === 'fire').map((talent) => talent.id))

const meetsAllRequirements = (slug: string): boolean => {
  const page = mageClass.pages.find((candidate) => candidate.slug === slug)
  if (!page) return false
  const satisfied = satisfiedRequirements(mageClass)
  return publishRequirementsFor(page).every((requirement) => satisfied.has(requirement))
}

/** Replays `order` through the planner to the ranks `build` claims, exactly as a player would. */
function replayOrder(build: ClassBuild): { plan: PlannerBuild; stuck: string | undefined } {
  let plan: PlannerBuild = {}
  for (const talentId of build.order) {
    const talent = mageTalents.find((candidate) => candidate.id === talentId)
    if (!talent) return { plan, stuck: talentId }
    const target = build.build[talentId] ?? 0
    while ((plan[talentId] ?? 0) < target) {
      if (!canIncrementPlannerTalent(plan, talent, mageTalents, capConfig)) return { plan, stuck: talentId }
      plan = incrementPlannerTalent(plan, talent, mageTalents, capConfig)
    }
  }
  return { plan, stuck: undefined }
}

describe('Mage ClassDefinition — pages', () => {
  it('defines the fifteen spec pages with the exact slugs, kinds, intents, titles and H1s', () => {
    expect(mageClass.pages).toHaveLength(15)
    expect(mageClass.pages.map((page) => page.slug).sort()).toEqual(SPEC_PAGES.map((page) => page.slug).sort())
    for (const expected of SPEC_PAGES) {
      const page = mageClass.pages.find((candidate) => candidate.slug === expected.slug)
      expect(page, `missing page definition for ${expected.slug}`).toBeDefined()
      expect(page?.kind).toBe(expected.kind)
      expect(page?.intent).toBe(expected.intent)
      expect(page?.title).toBe(expected.title)
      expect(page?.h1).toBe(expected.h1)
    }
  })

  it('keeps intent, title, h1 and canonical unique across all fifteen pages', () => {
    expect(() => assertUniquePageIntents(mageClass.pages)).not.toThrow()
    for (const key of ['intent', 'title', 'h1', 'canonical'] as const) {
      expect(new Set(mageClass.pages.map((page) => page[key])).size, `duplicate ${key}`).toBe(15)
    }
  })

  it('self-canonicalises every page and gives each one its own description', () => {
    for (const page of mageClass.pages) {
      expect(page.canonical).toBe(`https://buildforgetools.com/${page.slug}`)
      expect(page.robots).toBe('index, follow')
      expect(page.description.length).toBeGreaterThan(0)
      expect(page.sections.length).toBeGreaterThan(0)
    }
    expect(new Set(mageClass.pages.map((page) => page.description)).size).toBe(15)
  })

  it('declares no composite score anywhere in page copy', () => {
    for (const page of mageClass.pages) {
      const copy = [
        page.description,
        ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])]),
        ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
        ...(page.comparison?.rows.flatMap((row) => [row.label, ...row.values]) ?? []),
      ].join(' ')
      expect(copy, `composite score language on ${page.slug}`).not.toMatch(/\b(?:score|scored|scoring|rating|tier|ranked)\b/i)
      expect(copy, `out-of-ten language on ${page.slug}`).not.toMatch(/\d\s*\/\s*10\b/)
    }
    expect(mageClass.builds.length).toBeGreaterThan(0)
    for (const build of mageClass.builds) {
      const copy = [build.title, build.shortTitle, build.role, ...build.playstyle, ...build.strengths].join(' ')
      expect(copy, `composite score language on ${build.id}`).not.toMatch(/\b(?:score|scored|scoring|rating|tier|ranked)\b/i)
      expect(copy, `out-of-ten language on ${build.id}`).not.toMatch(/\d\s*\/\s*10\b/)
    }
  })

  it('links every relatedPages href to a slug this class defines', () => {
    const slugs = new Set(mageClass.pages.map((page) => page.slug))
    for (const page of mageClass.pages) {
      for (const related of page.relatedPages) {
        expect(related.href.startsWith('/'), `${page.slug} → ${related.href} must be root-relative`).toBe(true)
        expect(slugs.has(related.href.slice(1)), `${page.slug} → ${related.href} is not a Mage page`).toBe(true)
        expect(related.label.length).toBeGreaterThan(0)
      }
    }
  })

  it('links published pages only to pages that publish alongside them', () => {
    for (const slug of PUBLISHED_SLUGS) {
      const page = mageClass.pages.find((candidate) => candidate.slug === slug)
      for (const related of page?.relatedPages ?? []) {
        expect(pageFromPublishedClasses(related.href, PUBLISHED_CLASSES), `${slug} → ${related.href}`).toBeDefined()
      }
    }
  })
})

describe('Mage ClassDefinition — the eight/seven split', () => {
  it('satisfies exactly talentDataset, level20Builds and the arcane and frost legal builds', () => {
    expect([...satisfiedRequirements(mageClass)].sort()).toEqual(['legalBuild:arcane', 'legalBuild:frost', 'level20Builds', 'talentDataset'])
  })

  it('publishes exactly the eight Global Constraint URLs and withholds the other seven', () => {
    const published = mageClass.pages.filter((page) => meetsAllRequirements(page.slug)).map((page) => page.slug)
    const withheld = mageClass.pages.filter((page) => !meetsAllRequirements(page.slug)).map((page) => page.slug)

    expect(published.sort()).toEqual([...PUBLISHED_SLUGS].sort())
    expect(withheld.sort()).toEqual(Object.keys(WITHHELD).sort())
    expect(published).toHaveLength(8)
    expect(withheld).toHaveLength(7)
    expect(published.length + withheld.length).toBe(15)
  })

  it('withholds each of the seven for the one requirement the Global Constraints name', () => {
    const satisfied = satisfiedRequirements(mageClass)
    for (const [slug, unmet] of Object.entries(WITHHELD)) {
      const page = mageClass.pages.find((candidate) => candidate.slug === slug)
      expect(page, `missing definition for withheld ${slug}`).toBeDefined()
      const requirements = publishRequirementsFor(page!)
      expect(requirements, `${slug} must declare ${unmet}`).toContain(unmet)
      expect(satisfied.has(unmet), `${unmet} must be unmet for ${slug}`).toBe(false)
      // Every other declared requirement is met, so the named one is the only reason it is withheld.
      for (const requirement of requirements) {
        if (requirement !== unmet) expect(satisfied.has(requirement), `${slug} also misses ${requirement}`).toBe(true)
      }
    }
  })

  it('serves the eight slugs through the requirement-gated lookup and none of the seven', () => {
    for (const slug of PUBLISHED_SLUGS) {
      expect(pageFromPublishedClasses(slug, PUBLISHED_CLASSES)?.slug, `${slug} should resolve`).toBe(slug)
      expect(pageFromPublishedClasses(`/${slug}`, PUBLISHED_CLASSES)?.slug, `/${slug} should resolve`).toBe(slug)
    }
    for (const slug of Object.keys(WITHHELD)) {
      expect(pageFromPublishedClasses(slug, PUBLISHED_CLASSES), `${slug} should stay unpublished`).toBeUndefined()
    }
  })

  it('registers the class in the published registry and nothing else', () => {
    expect(PUBLISHED_CLASSES).toContain(mageClass)
    expect(PUBLISHED_CLASSES).toHaveLength(1)
  })
})

describe('Mage ClassDefinition — builds', () => {
  it('publishes the whole talent dataset and the class identity', () => {
    expect(mageClass.id).toBe('mage')
    expect(mageClass.plannerPath).toBe('/mage')
    expect(mageClass.talents).toBe(mageTalents)
    expect(mageClass.talentCount).toBe(mageTalents.length)
    expect(mageClass.storageKey).toBe('wow-forever-mage-build')
    expect(mageClass.branches).toEqual(MAGE_BRANCHES)
  })

  it('locks every build to the current Beta cap (R15)', () => {
    expect(mageClass.beta).toEqual({ phaseLabel: 'Beta · Build 1.60.1.69913', levelCap: 20, pointsAtCap: 11 })
    expect(mageClass.builds.length).toBeGreaterThan(0)
    for (const build of mageClass.builds) {
      expect(build.level, `${build.id} level must equal beta.levelCap`).toBe(mageClass.beta.levelCap)
      expect(build.levelCap, `${build.id} levelCap`).toBe(mageClass.beta.levelCap)
      expect(build.points, `${build.id} must spend the full current-cap budget`).toBe(mageClass.beta.pointsAtCap)
      expect(totalPlannerPoints(build.build), `${build.id} allocation total`).toBe(mageClass.beta.pointsAtCap)
      expect(build.verifiedThroughBuild).toBe(mageClass.verifiedBuild)
      expect(['community_verified', 'derived_assumption']).toContain(build.evidence)
    }
  })

  it('derives each build’s allocation string from the build it renders', () => {
    // `allocation` is rendered next to the tree (`{allocation} · {n} / {levelCap} points`), so a
    // wrong branch split would show a claim the tree does not make.
    const branchOf = (talentId: string) => mageTalents.find((talent) => talent.id === talentId)?.branch
    expect(mageClass.builds).toHaveLength(9)
    for (const build of mageClass.builds) {
      const perBranch = mageClass.branches.map((branch) =>
        Object.entries(build.build).reduce((sum, [talentId, rank]) => (branchOf(talentId) === branch ? sum + rank : sum), 0))
      expect(perBranch.reduce((sum, points) => sum + points, 0), `${build.id} allocation names an unknown talent`).toBe(totalPlannerPoints(build.build))
      expect(build.allocation, `${build.id} allocation disagrees with its own tree`).toBe(perBranch.join('/'))
    }
  })

  it('reconstructs every build by replaying its order through the planner', () => {
    for (const build of mageClass.builds) {
      const { plan, stuck } = replayOrder(build)
      expect(stuck, `${build.id} cannot be spent in the order it publishes`).toBeUndefined()
      expect(plan, `${build.id} order must reproduce its allocation`).toEqual(build.build)
      expect([...build.order].sort(), `${build.id} order must list every allocated talent once`).toEqual(Object.keys(build.build).sort())
      expect(new Set(build.order).size, `${build.id} order repeats a talent`).toBe(build.order.length)
      for (const talentId of build.keyTalentIds) expect(build.build[talentId], `${build.id} key talent ${talentId} is not allocated`).toBeGreaterThan(0)
    }
  })

  it('never allocates a fire talent and never authors a fire build', () => {
    expect(fireTalentIds.size).toBeGreaterThan(0)
    for (const build of mageClass.builds) {
      expect(build.spec, `${build.id} must not claim the fire branch`).not.toBe('fire')
      for (const talentId of [...Object.keys(build.build), ...build.order, ...build.keyTalentIds]) {
        expect(fireTalentIds.has(talentId), `${build.id} allocates fire talent ${talentId}`).toBe(false)
      }
    }
    for (const page of mageClass.pages) {
      for (const id of [page.primaryBuildId, ...page.relatedBuildIds]) {
        if (!id) continue
        const build = buildById(id)
        expect(build, `${page.slug} references unknown build ${id}`).toBeDefined()
        expect(build?.spec, `${page.slug} presents a fire build`).not.toBe('fire')
      }
    }
  })

  it('keeps the frost AoE allocation distinct from the frost spec build', () => {
    const aoe = buildById('mage-frost-aoe')
    const spec = buildById('mage-frost-build')
    expect(aoe, 'missing the frost AoE build').toBeDefined()
    expect(spec, 'missing the frost spec build').toBeDefined()
    expect(aoe?.spec).toBe('frost')
    expect(aoe?.build).not.toEqual(spec?.build)
    expect(aoe?.order).not.toEqual(spec?.order)
  })

  it('backs the two class-level pages with frosted builds and the leveling page with a leveling build', () => {
    for (const slug of ['wow-forever-mage-leveling-build', 'wow-forever-mage-dungeon-build']) {
      const page = mageClass.pages.find((candidate) => candidate.slug === slug)
      expect(page?.spec, `${slug} is class-level and must be frost-backed`).toBe('frost')
      expect(buildById(page?.primaryBuildId)?.spec, `${slug} primary build`).toBe('frost')
    }
    const leveling = mageClass.pages.find((page) => page.slug === 'wow-forever-mage-leveling-build')
    const primary = buildById(leveling?.primaryBuildId)
    expect(primary?.intent).toBe('leveling')
    expect(primary?.spec).toBe('frost')
    expect(mageClass.recommendedBuildIds).toContain(primary?.id)
  })

  it('resolves every recommended and related build id', () => {
    expect(mageClass.recommendedBuildIds.length).toBeGreaterThan(0)
    for (const id of mageClass.recommendedBuildIds) {
      expect(buildById(id), `recommended build ${id}`).toBeDefined()
    }
    for (const build of mageClass.builds) {
      expect(build.href.startsWith('/'), `${build.id} href`).toBe(true)
      expect(build.title.length).toBeGreaterThan(0)
      expect(build.shortTitle.length).toBeGreaterThan(0)
      expect(build.allocation).toMatch(/^\d+\/\d+\/\d+$/)
    }
  })
})
