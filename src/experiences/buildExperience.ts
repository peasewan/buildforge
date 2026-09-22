import { isLegalAllocation, publishedClassPages, type ClassBuild, type ClassDefinition } from '../lib/classPage'
import { canIncrementPlannerTalent, incrementPlannerTalent, plannerLockReason, type PlannerBuild } from '../lib/talentPlanner'

export interface BuildProgression {
  steps: Array<{ level: number; talentId: string; rank: number; allocation: PlannerBuild }>
  error?: string
  orderStatus: 'editorial' | 'derived'
}

/** A point at each level from 10 is a planning assumption, not a client-verified unlock schedule. */
export function progressionForBuild(classDef: ClassDefinition, build: ClassBuild): BuildProgression {
  const orderStatus = build.pointOrder === undefined ? 'derived' : 'editorial'
  const unavailable = (error: string): BuildProgression => ({ steps: [], error, orderStatus })
  const talents = new Map(classDef.talents.map((talent) => [talent.id, talent]))
  const targets = new Map<string, number>()
  let total = 0
  for (const [id, rank] of Object.entries(build.build)) {
    const talent = talents.get(id)
    if (!talent) return unavailable(`The target allocation contains an unknown talent: ${id}.`)
    if (!Number.isInteger(rank) || rank < 0 || rank > talent.maxRank) return unavailable(`The target rank for ${talent.name} is invalid.`)
    if (rank > 0) targets.set(id, rank)
    total += rank
  }
  if (!total) return unavailable('This build has no target talent points.')
  if (total !== build.points) return unavailable('The target allocation does not match the stated point total.')
  // Existing records use levelCap for either a level or a point budget. Honor both bounds.
  const pointCap = Math.min(build.levelCap, build.level - 9)
  if (!Number.isInteger(pointCap) || pointCap < 1 || total > pointCap) return unavailable('The target allocation exceeds the supported point budget.')
  const config = { ...classDef.plannerConfig, pointCap }
  if (!isLegalAllocation(build.build, classDef.talents, config, pointCap)) return unavailable('The target allocation cannot be spent under the current planner rules.')

  let sequence: string[]
  if (build.pointOrder !== undefined) {
    sequence = build.pointOrder
  } else {
    const seen = new Set<string>()
    sequence = []
    for (const id of build.order) {
      if (!talents.has(id)) return unavailable(`The talent order contains an unknown talent: ${id}.`)
      if (seen.has(id)) return unavailable(`The grouped talent order repeats ${talents.get(id)!.name}.`)
      seen.add(id)
      const rank = targets.get(id)
      if (!rank) return unavailable(`The talent order includes ${talents.get(id)!.name}, which is not in the target allocation.`)
      sequence.push(...Array<string>(rank).fill(id))
    }
  }
  if (sequence.length !== total) return unavailable('The talent order does not cover the exact target allocation.')

  let allocation: PlannerBuild = {}
  const steps: BuildProgression['steps'] = []
  for (const [index, id] of sequence.entries()) {
    const talent = talents.get(id)
    if (!talent) return unavailable(`The talent order contains an unknown talent: ${id}.`)
    if ((allocation[id] ?? 0) >= (targets.get(id) ?? 0)) return unavailable(`The talent order exceeds the target rank for ${talent.name}.`)
    if (!canIncrementPlannerTalent(allocation, talent, classDef.talents, config)) {
      const reason = plannerLockReason(allocation, talent, classDef.talents, config)
      const detail = reason?.type === 'prerequisite'
        ? `Requires rank ${reason.required} of ${talents.get(reason.talentId)?.name ?? reason.talentId}.`
        : reason?.type === 'branch-points'
          ? `Requires ${reason.required} points in this branch.`
          : 'The point or rank cap has been reached.'
      return unavailable(`The recorded order cannot spend ${talent.name} at level ${index + 10}. ${detail}`)
    }
    allocation = incrementPlannerTalent(allocation, talent, classDef.talents, config)
    steps.push({ level: index + 10, talentId: id, rank: allocation[id], allocation })
  }
  if ([...targets].some(([id, rank]) => allocation[id] !== rank)) return unavailable('The talent order does not reach the exact target allocation.')
  return { steps, orderStatus }
}

/** Dataset order makes comparisons stable even when allocation object keys are reordered. */
export function diffBuilds(classDef: ClassDefinition, left: ClassBuild, right: ClassBuild): Array<{ talentId: string; name: string; left: number; right: number }> {
  const names = new Map(classDef.talents.map((talent) => [talent.id, talent.name]))
  const unknownIds = [...new Set([...Object.keys(left.build), ...Object.keys(right.build)])].filter((id) => !names.has(id)).sort()
  return [...names.keys(), ...unknownIds].flatMap((talentId) => {
    const leftRank = left.build[talentId] ?? 0
    const rightRank = right.build[talentId] ?? 0
    return leftRank === rightRank ? [] : [{ talentId, name: names.get(talentId) ?? `Unknown talent (${talentId})`, left: leftRank, right: rightRank }]
  })
}

/** Editorial usage is a route lookup; it says nothing about player popularity. */
export function buildsUsingTalent(classDef: ClassDefinition, talentId: string): ClassBuild[] {
  if (!classDef.talents.some((talent) => talent.id === talentId)) return []
  const pages = publishedClassPages([classDef]).map(({ page }) => page)
  const paths = new Set(pages.map((page) => `/${page.slug}`))
  const linkedIds = new Set(pages.flatMap((page) => [...page.relatedBuildIds, ...(page.primaryBuildId ? [page.primaryBuildId] : [])]))
  return classDef.builds.filter((build) => (build.build[talentId] ?? 0) > 0 && paths.has(build.href) && linkedIds.has(build.id))
}
