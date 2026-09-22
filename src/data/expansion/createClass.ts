import { assertUniquePageIntents, type ClassBuild, type ClassDefinition, type ClassPageDefinition, type ClassPageKind, type ClassTalent } from '../../lib/classPage'
import { canIncrementPlannerTalent, incrementPlannerTalent, type PlannerBuild } from '../../lib/talentPlanner'
import type { ExpansionProfile, SpecProfile } from './profiles'

interface Dataset {
  classId: string; build: string; branches: string[]; talents: unknown[]
  sources: unknown[]; ready: boolean; conflicts: string[]
}
const UPDATED = '2026-09-22'
const NOTICE = 'Client-table preview: positions, rank caps and spell IDs are checked against build 1.60.1.69913. These readable tables may retain legacy layout. Five points per tier, full-rank prerequisites and the 11-point Level 20 budget are planning assumptions, not proof of final live Beta rules. Missing rank text stays unknown.'

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
      evidence: 'derived_assumption', sources: [{ label: 'BuildForgeTools editorial testing route', url: `https://buildforgetools.com${buildHref}` }],
      verifiedThroughBuild: dataset.build, createdAt: UPDATED, updatedAt: UPDATED, href: buildHref,
    })
    return buildId
  }
  const add = (input: {
    kind: ClassPageKind; suffix?: string; title: string; description: string; spec?: string; primaryBuildId?: string
    relatedBuildIds?: string[]; sections: ClassPageDefinition['sections']; comparison?: ClassPageDefinition['comparison']
  }) => {
    const slug = input.suffix ? `wow-forever-${input.suffix}` : id
    const h1 = `WoW Forever ${input.title}`
    pages.push({
      ...input, slug, intent: input.title, title: `${h1} | BuildForgeTools`, h1,
      description: input.description, eyebrow: 'Build 69913 · Client-table preview', canonical: `https://buildforgetools.com/${slug}`,
      robots: 'index, follow', ogImage: `/images/${id}/${id}-hero-v1.jpg`, updatedAt: UPDATED,
      relatedBuildIds: input.relatedBuildIds ?? [], relatedPages: [], faqs: [],
      publishRequirements: ['talentDataset', ...(input.kind === 'calculator' ? ['completeClassPlanner' as const] : []), ...(input.spec ? [`legalBuild:${input.spec}` as const] : [])],
    })
  }
  const specBuilds = Object.fromEntries(specs.map((spec) => [spec.id, makeBuild(spec, `${spec.id}-starter`, 'spec', href(`${spec.id}-${id}-build`), `${spec.name} ${name} Build (Level 20)`)]))
  const levelingBuilds = Object.fromEntries(specs.map((spec) => [spec.id, makeBuild(spec, `${spec.id}-leveling`, 'leveling', href(`${spec.id}-${id}-leveling-build`), `${spec.name} ${name} Leveling Build`)]))
  const pvpSpec = getSpec(profile.pvpSpec)
  const pvpBuild = makeBuild(pvpSpec, 'pvp', 'pvp', href(`${id}-pvp-build`), `${name} PvP Testing Build`)
  const defaultSpec = getSpec(profile.defaultSpec)
  const commonLinks = [
    { href: `/${id}`, label: `${name} Talent Calculator` },
    { href: hub, label: `${name} Builds` }, { href: catalog, label: `${name} Talent Trees` },
    { href: levelPage, label: `${name} Leveling` },
  ]
  add({ kind: 'calculator', title: `${name} Talent Calculator`, description: `Plan ${specs.map((spec) => spec.name).join(', ')} talents with ${talents.length} client-table nodes, editable Level 20 routes and shareable ${name} builds.`, sections: [{ heading: `Plan around ${profile.resource.toLowerCase()}`, paragraphs: [profile.intro, NOTICE] }] })
  add({ kind: 'buildsHub', suffix: `${id}-builds`, title: `${name} Builds`, description: `Choose ${name} leveling, PvP and role-specific routes. Compare exact eleven-point allocations before editing the client-table planner.`, relatedBuildIds: [...Object.values(specBuilds), ...Object.values(levelingBuilds), pvpBuild], sections: [{ heading: `Choose the ${name} job before the points`, paragraphs: [profile.intro, 'The same early allocation can be reused for more than one testing situation. Reused routes are not independent performance recommendations; the page explains the conditions and trade-offs for that role.'] }, { heading: 'Use a repeatable comparison', paragraphs: [profile.resource + ' are part of the test conditions.', 'Load a starting route, change one choice and keep a link to both versions. These are editorial examples with client-derived structures, not official or most-played builds.'] }] })
  add({ kind: 'talents', suffix: `${id}-talents`, title: `${name} Talents & Talent Trees`, description: `Review ${talents.length} ${name} client-table talents, rank caps, positions and evidence limits for build 69913.`, sections: [{ heading: 'What has been checked', paragraphs: [NOTICE, 'The imported records preserve the Talent ID and each rank spell ID. Tooltips are client transcriptions with visible gaps; an unavailable rank is not replaced with another rank or an older tooltip.'] }, { heading: 'Why change status can be unknown', paragraphs: ['This class import has no reviewed baseline diff. An unknown change label means no claim is made about whether the talent is new, changed or unchanged from Classic. A current snapshot alone cannot establish that comparison.'] }] })
  add({ kind: 'leveling', suffix: `${id}-leveling-build`, title: `${name} Leveling Build`, description: `Follow an editable Level 10–20 ${name} route, compare ${specs.map((s) => s.name).join(', ')} and keep recovery in your leveling test.`, primaryBuildId: levelingBuilds[profile.defaultSpec], relatedBuildIds: Object.values(levelingBuilds), sections: [{ heading: `Start with ${defaultSpec.name}`, paragraphs: [profile.leveling, defaultSpec.leveling] }, { heading: 'Levels 10, 15 and 20', paragraphs: ['The planner assumes one talent point per level from Level 10. Read the ordered allocation below as a sequence: first five points, the next five, then the final Level 20 point. Reset and follow the order to compare the early milestones.', 'These eleven-point routes stop at the current planning budget. No Level 30 or Level 60 performance recommendation is inferred from them.'] }] })
  for (const spec of specs) {
    const order = spec.route.map(([node, rank]) => `${talents.find((t) => t.sourceTalentId === node)!.name} ${rank}`).join(' → ')
    add({ kind: 'specBuild', suffix: `${spec.id}-${id}-build`, title: `${spec.name} ${name} Build`, description: `Explore a Level 20 ${spec.name} ${name} route for ${spec.role.toLowerCase()}, with talent order, trade-offs and a calculator link.`, spec: spec.id, primaryBuildId: specBuilds[spec.id], relatedBuildIds: [levelingBuilds[spec.id]], sections: [{ heading: `Why these ${spec.name} talents`, paragraphs: [spec.rationale, spec.tradeoff] }, { heading: 'Exact point order', paragraphs: [order, 'Load the allocation to inspect each selected talent. The order and spend are editorial; readable client fields do not prove that the route is optimal.'] }, { heading: 'How to evaluate this route', paragraphs: [spec.test, spec.id === profile.dungeonSpec ? profile.dungeon : spec.leveling] }] })
    add({ kind: 'specLeveling', suffix: `${spec.id}-${id}-leveling-build`, title: `${spec.name} ${name} Leveling Build`, description: `Use a step-by-step ${spec.name} ${name} leveling allocation from Level 10 to 20, with a clear point budget and recovery considerations.`, spec: spec.id, primaryBuildId: levelingBuilds[spec.id], relatedBuildIds: [specBuilds[spec.id]], sections: [{ heading: `Leveling with ${spec.name}`, paragraphs: [spec.leveling, spec.tradeoff] }, { heading: 'Level 10–20 progression', paragraphs: [order, 'Follow the allocation in order rather than buying the endpoint first. The table-based planner checks the earlier investment before allowing deeper nodes.'] }, { heading: 'Before switching routes', paragraphs: [spec.test, 'Save the baseline link and change only the variable you want to compare. Keep equipment, target level and recovery conditions in your notes so a talent change is not credited for an unrelated improvement.'] }] })
  }
  add({ kind: 'pvp', suffix: `${id}-pvp-build`, title: `${name} PvP Build`, description: `Test a Level 20 ${name} PvP allocation around ${pvpSpec.name}, with positioning trade-offs and an editable calculator route.`, primaryBuildId: pvpBuild, relatedBuildIds: [pvpBuild, ...Object.values(specBuilds)], sections: [{ heading: `${pvpSpec.name} as a PvP starting point`, paragraphs: [profile.pvp, pvpSpec.tradeoff] }, { heading: 'What to record after the encounter', paragraphs: ['Record whether the setup gave you useful actions, an escape or a support opportunity. Opponent level, equipment and group size can invalidate a damage-only comparison.', 'This route reuses an early specialization allocation. No duel results or player usage statistics have been claimed.'] }] })
  add({ kind: 'levelCap', suffix: `${id}-level-20-build`, title: `${name} Level 20 Build`, description: `Compare all three eleven-point ${name} routes under the same Level 20 planning budget, with exact allocations and talent order.`, relatedBuildIds: Object.values(specBuilds), sections: [{ heading: 'The same budget, three choices', paragraphs: [`Compare ${specs.map((s) => s.name).join(', ')} without giving one route more points. Each example spends eleven points and can be opened in the calculator.`, NOTICE] }, { heading: 'What remains outside Level 20', paragraphs: ['A deep-tree talent cannot be made available merely by selecting a higher-level screenshot. These examples stop at eleven points; no later cap or progression unlock is implied.', profile.intro] }] })
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
  if (pages.length !== 15) throw new Error(`${id}: expected 15 page definitions`)
  assertUniquePageIntents(pages)
  return {
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
