import { assertUniquePageIntents, type ClassBuild, type ClassDefinition, type ClassPageDefinition, type ClassPageKind, type ClassTalent } from '../../lib/classPage'
import { canIncrementPlannerTalent, incrementPlannerTalent, type PlannerBuild } from '../../lib/talentPlanner'
import type { ExpansionProfile, SpecProfile } from './profiles'
import { buildRoleDecision } from './roleDecisions'
import { allocationSignature } from '../../lib/classPage'
import { hasRemovedTalentInBuild } from '../../lib/archivedClassBuild'

interface Dataset {
  classId: string; build: string; branches: string[]; talents: unknown[]
  sources: unknown[]; ready: boolean; conflicts: string[]
}
const UPDATED = '2026-09-22'
const OFFICIAL_CAP_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696'
const NOTICE = `Blizzard's October 1 Beta development notes raised the playable level cap to 30. These 11-point Level 20 routes are starter snapshots, not reviewed Level 30 allocations. Client-table positions, rank caps and spell IDs were checked against build 1.60.1.69913; the readable tables may retain legacy layout. Five points per tier, full-rank prerequisites and the Level 20 point budget are planning assumptions, not proof of final live Beta rules. Missing rank text stays unknown. Official cap source: ${OFFICIAL_CAP_SOURCE}`

export function createExpansionClass(profile: ExpansionProfile, dataset: Dataset): ClassDefinition {
  const { id, name, specs } = profile
  const talents = dataset.talents as ClassTalent<string>[]
  const branches = specs.map((spec) => spec.id)
  if (dataset.classId !== id || dataset.branches.join() !== branches.join()) throw new Error(`Dataset identity mismatch: ${id}`)
  const plannerConfig = { branches, pointCap: 11 }
  const builds: ClassBuild[] = []
  const pages: ClassPageDefinition[] = []
  const href = (suffix: string) => `/wow-forever-${suffix}`
  const hub = href(`${id}-builds`)
  const catalog = href(`${id}-talents`)
  const levelPage = href(`${id}-leveling-build`)
  const getSpec = (spec: string) => {
    const found = specs.find((candidate) => candidate.id === spec)
    if (!found) throw new Error(`Unknown spec ${id}/${spec}`)
    return found
  }
  const makeBuild = (spec: SpecProfile, key: string, intent: string, buildHref: string, title: string): string => {
    let allocation: PlannerBuild = {}
    const order: string[] = []
    for (const [sourceId, rank] of spec.route) {
      const talent = talents.find((candidate) => candidate.sourceTalentId === sourceId)
      if (!talent) throw new Error(`Missing route node ${id}/${sourceId}`)
      for (let point = 0; point < rank; point++) {
        if (!canIncrementPlannerTalent(allocation, talent, talents, plannerConfig)) throw new Error(`Illegal route point ${id}/${sourceId}/${point + 1}`)
        allocation = incrementPlannerTalent(allocation, talent, talents, plannerConfig)
      }
      order.push(talent.id)
    }
    const points = Object.values(allocation).reduce((sum, rank) => sum + rank, 0)
    if (points !== 11) throw new Error(`${id}/${key}: expected eleven points`)
    const buildId = `${id}-${key}`
    builds.push({
      id: buildId, spec: spec.id, intent, level: 20, levelCap: 11, phase: 'Level 20 client-table preview', points,
      allocation: branches.map((branch) => talents.filter((talent) => talent.branch === branch).reduce((sum, talent) => sum + (allocation[talent.id] ?? 0), 0)).join('/'),
      title, shortTitle: `${spec.name} ${name}`, role: spec.role,
      playstyle: [spec.rationale, spec.test], strengths: [spec.role], keyTalentIds: order.slice(-2), order, build: allocation,
      evidence: 'derived_assumption', sources: [{ label: 'BuildForgeTools editorial Level 20 testing route', url: `https://buildforgetools.com${buildHref}` }, { label: 'Blizzard October 1 Beta development notes: Level 30 cap', url: OFFICIAL_CAP_SOURCE }],
      verifiedThroughBuild: dataset.build, createdAt: UPDATED, updatedAt: UPDATED, href: buildHref,
    })
    return buildId
  }
  const add = (input: {
    kind: ClassPageKind; suffix?: string; title: string; description: string; spec?: string; primaryBuildId?: string
    relatedBuildIds?: string[]; sections: ClassPageDefinition['sections']; comparison?: ClassPageDefinition['comparison']; updatedAt?: string; surfaceDescription?: string
  }) => {
    const slug = input.suffix ? `wow-forever-${input.suffix}` : id
    const h1 = `WoW Forever ${input.title}`
    pages.push({
      ...input, slug, intent: input.title, title: `${h1} | BuildForgeTools`, h1,
      description: input.description, eyebrow: 'Build 69913 · Client-table preview', canonical: `https://buildforgetools.com/${slug}`,
      robots: 'index, follow', ogImage: `/images/${id}/${id}-hero-v1.jpg`, updatedAt: input.updatedAt ?? UPDATED,
      relatedBuildIds: input.relatedBuildIds ?? [], relatedPages: [], faqs: [],
      publishRequirements: ['talentDataset', ...(input.kind === 'calculator' ? ['completeClassPlanner' as const] : []), ...(input.spec ? [`legalBuild:${input.spec}` as const] : [])],
    })
  }
  const specBuilds = Object.fromEntries(specs.map((spec) => [spec.id, makeBuild(spec, `${spec.id}-starter`, 'spec', href(`${spec.id}-${id}-build`), `${spec.name} ${name} Build (Level 20)`)]))
  const levelingBuilds = Object.fromEntries(specs.map((spec) => [spec.id, makeBuild(spec, `${spec.id}-leveling`, 'leveling', href(`${spec.id}-${id}-leveling-build`), `${spec.name} ${name} Leveling Build`)]))
  const pvpSpec = getSpec(profile.pvpSpec)
  const pvpBuild = makeBuild(pvpSpec, 'pvp', 'pvp', href(`${id}-pvp-build`), `${name} PvP Testing Build`)
  const defaultSpec = getSpec(profile.defaultSpec)
  const isArchived = (buildId: string) => {
    const build = builds.find((candidate) => candidate.id === buildId)
    return Boolean(build && hasRemovedTalentInBuild({ id, talents }, build))
  }
  const hunterHistoricalHub = id === 'hunter'
  const commonLinks = [
    { href: `/${id}`, label: `${name} Talent Calculator` },
    { href: hub, label: `${name} Builds` }, { href: catalog, label: `${name} Talent Trees` },
    { href: levelPage, label: `${name} Leveling` },
  ]
  add({ kind: 'calculator', title: `${name} Talent Calculator`, description: `Plan ${specs.map((spec) => spec.name).join(', ')} talents with ${talents.length} client-table nodes, editable Level 20 routes and shareable ${name} builds.`, sections: [{ heading: `Plan around ${profile.resource.toLowerCase()}`, paragraphs: [profile.intro, NOTICE] }] })
  add({ kind: 'buildsHub', suffix: `${id}-builds`, title: `${name} Builds`, description: hunterHistoricalHub ? 'Choose Hunter leveling, PvP and role-specific routes. Compare historical Level 20 allocations and use the blank calculator where old talents were removed.' : `Choose ${name} leveling, PvP and role-specific routes. Compare exact eleven-point allocations before editing the client-table planner.`, relatedBuildIds: [...Object.values(specBuilds), ...Object.values(levelingBuilds), pvpBuild], sections: [{ heading: `Choose the ${name} job before the points`, paragraphs: [profile.intro, 'The same early allocation can be reused for more than one testing situation. Reused routes are not independent performance recommendations; the page explains the conditions and trade-offs for that role.'] }, { heading: 'Use a repeatable comparison', paragraphs: [profile.resource + ' are part of the test conditions.', hunterHistoricalHub ? 'Read the historical ranks before testing. Hunter routes containing officially removed talents open a blank calculator rather than a prefilled build; unaffected routes remain editable.' : 'Load a starting route, change one choice and keep a link to both versions. These are editorial examples with client-derived structures, not official or most-played builds.'] }] })
  add({ kind: 'talents', suffix: `${id}-talents`, title: `${name} Talents & Talent Trees`, description: `Review ${talents.length} ${name} client-table talents, rank caps, positions and evidence limits for build 69913.`, sections: [{ heading: 'What has been checked', paragraphs: [NOTICE, 'The imported records preserve the Talent ID and each rank spell ID. Tooltips are client transcriptions with visible gaps; an unavailable rank is not replaced with another rank or an older tooltip.'] }, { heading: 'Why change status can be unknown', paragraphs: ['This class import has no reviewed baseline diff. An unknown change label means no claim is made about whether the talent is new, changed or unchanged from Classic. A current snapshot alone cannot establish that comparison.'] }] })
  add({ kind: 'leveling', suffix: `${id}-leveling-build`, title: `${name} Leveling Build`, description: isArchived(levelingBuilds[profile.defaultSpec]) ? `Review a historical Level 10–20 ${name} starter route, compare ${specs.map((s) => s.name).join(', ')} and plan a fresh route with current talents.` : `Follow an editable Level 10–20 ${name} starter route, compare ${specs.map((s) => s.name).join(', ')} and keep recovery in your leveling test.`, primaryBuildId: levelingBuilds[profile.defaultSpec], relatedBuildIds: Object.values(levelingBuilds), sections: [{ heading: `Start with ${defaultSpec.name}`, paragraphs: [profile.leveling, defaultSpec.leveling] }, { heading: 'Levels 10, 15 and 20', paragraphs: [isArchived(levelingBuilds[profile.defaultSpec]) ? 'The planner assumes one talent point per level from Level 10. The ordered allocation below is a historical client-table record; it includes a talent Blizzard later removed. Review the rank order, then open a blank calculator and verify the live tree before spending points.' : 'The planner assumes one talent point per level from Level 10. Read the ordered allocation below as a sequence: first five points, the next five, then the final Level 20 point. Reset and follow the order to compare the early milestones.', 'These eleven-point routes stop at the initial Level 20 planning budget. The Beta now allows Level 30, but no Level 30 or Level 60 performance recommendation is inferred from these routes.'] }] })
  for (const spec of specs) {
    const order = spec.route.map(([node, rank]) => `${talents.find((t) => t.sourceTalentId === node)!.name} ${rank}`).join(' → ')
    const archivedSpec = isArchived(specBuilds[spec.id])
    add({ kind: 'specBuild', suffix: `${spec.id}-${id}-build`, title: `${spec.name} ${name} Build`, description: archivedSpec ? `Review a historical Level 20 ${spec.name} ${name} route for ${spec.role.toLowerCase()}, with readable ranks and a blank calculator entry.` : `Explore a Level 20 ${spec.name} ${name} route for ${spec.role.toLowerCase()}, with talent order, trade-offs and a calculator link.`, spec: spec.id, primaryBuildId: specBuilds[spec.id], relatedBuildIds: [levelingBuilds[spec.id]], sections: [{ heading: `Why these ${spec.name} talents`, paragraphs: [spec.rationale, spec.tradeoff] }, { heading: 'Exact point order', paragraphs: [order, archivedSpec ? 'Read these historical ranks without loading the old allocation. An officially removed talent appears in this route; start a blank calculator and check the current Beta tree before spending points.' : 'Load the allocation to inspect each selected talent. The order and spend are editorial; readable client fields do not prove that the route is optimal.'] }, { heading: 'How to evaluate this route', paragraphs: [spec.test, spec.id === profile.dungeonSpec ? profile.dungeon : spec.leveling] }] })
    add({ kind: 'specLeveling', suffix: `${spec.id}-${id}-leveling-build`, title: `${spec.name} ${name} Leveling Build`, description: archivedSpec ? `Review a historical step-by-step ${spec.name} ${name} leveling allocation from Level 10 to 20; start a blank calculator for current talents.` : `Use a step-by-step ${spec.name} ${name} leveling allocation from Level 10 to 20, with a clear point budget and recovery considerations.`, spec: spec.id, primaryBuildId: levelingBuilds[spec.id], relatedBuildIds: [specBuilds[spec.id]], sections: [{ heading: `Leveling with ${spec.name}`, paragraphs: [spec.leveling, spec.tradeoff] }, { heading: 'Level 10–20 progression', paragraphs: [order, archivedSpec ? 'This imported point order is retained as a historical reference. Because it contains an officially removed talent, do not follow it as a current Beta instruction; open the calculator blank and verify the live tree.' : 'Follow the allocation in order rather than buying the endpoint first. The table-based planner checks the earlier investment before allowing deeper nodes.'] }, { heading: 'Before switching routes', paragraphs: [spec.test, archivedSpec ? 'Compare the read-only reference with a fresh route built from current talents. Keep equipment, target level and recovery conditions in your notes.' : 'Save the baseline link and change only the variable you want to compare. Keep equipment, target level and recovery conditions in your notes so a talent change is not credited for an unrelated improvement.'] }] })
  }
  add({ kind: 'pvp', suffix: `${id}-pvp-build`, title: `${name} PvP Build`, description: profile.pvpDescription ?? `Test a Level 20 ${name} PvP allocation around ${pvpSpec.name}, with positioning trade-offs and an editable calculator route.`, updatedAt: profile.pvpUpdatedAt, surfaceDescription: profile.pvpArticle ? profile.pvp : undefined, primaryBuildId: pvpBuild, relatedBuildIds: [pvpBuild, ...Object.values(specBuilds)], sections: [{ heading: `${pvpSpec.name} as a PvP starting point`, paragraphs: [profile.pvpArticle ?? profile.pvp, pvpSpec.tradeoff] }, { heading: 'What to record after the encounter', paragraphs: ['Record whether the setup gave you useful actions, an escape or a support opportunity. Opponent level, equipment and group size can invalidate a damage-only comparison.', 'This route reuses an early specialization allocation. No duel results or player usage statistics have been claimed.'] }] })
  add({ kind: 'levelCap', suffix: `${id}-level-20-build`, title: `${name} Level 20 Build`, description: `Compare all three eleven-point ${name} starter routes under the same Level 20 planning budget, with exact allocations and talent order.`, relatedBuildIds: Object.values(specBuilds), sections: [{ heading: 'The same budget, three choices', paragraphs: [hunterHistoricalHub ? `Compare ${specs.map((s) => s.name).join(', ')} historical Level 20 records at eleven points each. Routes with officially removed talents stay read-only; only unaffected routes can load into the calculator.` : `Compare ${specs.map((s) => s.name).join(', ')} without giving one route more points. Each example spends eleven points and can be opened in the calculator.`, NOTICE] }, { heading: 'What remains outside Level 20', paragraphs: ['A deep-tree talent cannot be made available merely by selecting a higher-level screenshot. These examples stop at eleven points; the current Level 30 cap does not validate a later allocation or progression unlock in this client-table preview.', profile.intro] }] })
  for (const extra of profile.extras) {
    const spec = getSpec(extra.spec)
    const comparison = extra.kind === 'comparison'
      ? { columns: profile.comparison.map((branch) => getSpec(branch).name), rows: [
        { label: 'Testing role', values: profile.comparison.map((branch) => getSpec(branch).role) },
        { label: 'Main trade-off', values: profile.comparison.map((branch) => getSpec(branch).tradeoff) },
        { label: 'What to measure', values: profile.comparison.map((branch) => getSpec(branch).test) },
      ] } : undefined
    const buildId = extra.kind === 'comparison' ? levelingBuilds[spec.id] : makeBuild(spec, extra.suffix, extra.kind === 'specPvp' ? 'pvp' : extra.kind, href(extra.suffix), `${extra.title} (Level 20)`)
    add({ kind: extra.kind, suffix: extra.suffix, title: extra.title, description: extra.lead, spec: extra.spec, primaryBuildId: buildId, relatedBuildIds: extra.kind === 'comparison' ? profile.comparison.map((branch) => levelingBuilds[branch]) : [specBuilds[spec.id], levelingBuilds[spec.id]], sections: extra.sections, comparison })
  }
  for (const page of pages) {
    page.relatedPages = [...commonLinks, ...pages.filter((candidate) => candidate.kind === 'specBuild' || (candidate.spec && candidate.spec === page.spec) || candidate.kind === 'comparison').map((candidate) => ({ href: `/${candidate.slug}`, label: candidate.h1.replace('WoW Forever ', '') }))].filter((link, index, all) => link.href !== `/${page.slug}` && all.findIndex((candidate) => candidate.href === link.href) === index)
  }
  const hubPage = pages.find((page) => page.kind === 'buildsHub')!
  hubPage.relatedPages = pages.filter((page) => page !== hubPage).map((page) => ({ href: `/${page.slug}`, label: page.h1.replace('WoW Forever ', '') }))
  if (id === 'hunter') {
    const pvpHref = '/wow-forever-hunter-pvp-build'
    const pvpPage = pages.find((page) => page.kind === 'pvp')!
    pvpPage.updatedAt = '2026-10-02'
    pvpPage.relatedPages.push({ href: '/wow-forever-hunter-pet-build', label: 'Hunter Pet Build' })
    for (const page of pages.filter((candidate) => candidate.kind === 'leveling' || candidate.kind === 'comparison' || candidate.kind === 'pet')) {
      page.updatedAt = '2026-09-28'
      page.relatedPages.push({ href: pvpHref, label: 'Hunter PvP Build' })
    }
    for (const page of pages.filter((candidate) => [
      'wow-forever-hunter-builds',
      'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling',
      'wow-forever-hunter-pet-build',
    ].includes(candidate.slug))) page.updatedAt = '2026-10-01'
    pages.find((candidate) => candidate.slug === 'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling')!.updatedAt = '2026-10-02'
  }
  // Reviewed against GSC final 2026-09-11..2026-10-06. Same endpoint + same
  // progression now live together; keep clicked leveling entries where applicable.
  const consolidations = new Map<string, string>()
  for (const spec of specs) {
    const endpoint = pages.find(page => page.kind === 'specBuild' && page.spec === spec.id)!
    const progression = pages.find(page => page.kind === 'specLeveling' && page.spec === spec.id)!
    const keepProgression = (id === 'priest' && spec.id === 'holy') || (id === 'warlock' && spec.id === 'demonology')
    const destination = keepProgression ? progression : endpoint
    const source = keepProgression ? endpoint : progression
    const a = builds.find(build => build.id === source.primaryBuildId)!
    const b = builds.find(build => build.id === destination.primaryBuildId)!
    if (allocationSignature(a.build) !== allocationSignature(b.build)) throw new Error(`Consolidation requires reviewed identical route: ${source.slug}`)
    consolidations.set(`/${source.slug}`, `/${destination.slug}`)
  }
  const extrasToMerge: Record<string, [string, string]> = {
    rogue: ['subtlety-rogue-pvp-build', 'rogue-pvp-build'],
    priest: ['priest-healing-build', 'holy-priest-dungeon-build'],
  }
  const extra = extrasToMerge[id]
  if (extra) consolidations.set(href(extra[0]), href(extra[1]))
  for (const [sourcePath, destinationPath] of consolidations) {
    const source = pages.find(page => `/${page.slug}` === sourcePath)!
    const destination = pages.find(page => `/${page.slug}` === destinationPath)!
    source.retiredTo = destinationPath
    const paragraphs = new Set(destination.sections.flatMap(section => section.paragraphs))
    for (const section of source.sections) {
      const added = section.paragraphs.filter(paragraph => !paragraphs.has(paragraph))
      if (added.length) destination.sections.push({...section, paragraphs:added})
      added.forEach(paragraph => paragraphs.add(paragraph))
    }
  }
  pages.find(page => page.kind === 'buildsHub')!.relatedBuildIds = Object.values(specBuilds)
  const resolveHref = (value: string) => consolidations.get(value) ?? value
  for (const build of builds) build.href = resolveHref(build.href)
  for (const page of pages) {
    page.relatedPages = page.relatedPages.map(link => ({...link, href:resolveHref(link.href)}))
      .filter((link, index, all) => link.href !== resolveHref(`/${page.slug}`) && all.findIndex(candidate => candidate.href === link.href) === index)
    if (!page.retiredTo) {
      page.roleDecision = buildRoleDecision(profile, page, talents, builds)
      page.updatedAt = '2026-10-09'
    }
  }

  assertUniquePageIntents(pages)
  return {
    contentPolicy: 'intent_tasks_v1',
    id, name, plannerPath: `/${id}`, ogImage: `/images/${id}/${id}-hero-v1.jpg`, branches,
    branchIcons: Object.fromEntries(branches.map((branch) => [branch, talents.find((t) => t.branch === branch && t.icon)?.icon])),
    branchNames: Object.fromEntries(specs.map((spec) => [spec.id, spec.name])), branchTaglines: Object.fromEntries(specs.map((spec) => [spec.id, spec.role])),
    storageKey: `buildforge-${id}-69913-v1`, analyticsClass: id, dataVersion: `WoW Forever Beta ${dataset.build}`, verifiedBuild: dataset.build,
    talentCount: talents.length, beta: { phaseLabel: 'Client-table preview · Level 20', levelCap: 20, pointsAtCap: 11 },
    plannerModes: [{ level: 20, points: 11, label: 'Level 20 preview' }], talents, plannerConfig, builds, pages,
    recommendedBuildIds: [specBuilds[profile.defaultSpec], ...Object.values(specBuilds).filter((buildId) => buildId !== specBuilds[profile.defaultSpec])],
    sources: dataset.sources as ClassDefinition['sources'], dataReview: { ready: dataset.ready && dataset.conflicts.length === 0, notice: NOTICE },
  }
}
