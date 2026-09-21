export type PlannerBuild = Record<string, number>

export interface PlannerPrerequisite {
  talentId: string
  requiredRank: number | null
}

export interface PlannerTalent<B extends string> {
  id: string
  branch: B
  maxRank: number
  requiredTreePoints: number
  prerequisite?: PlannerPrerequisite[]
}

export interface PlannerConfig<B extends string> {
  branches: readonly B[]
  pointCap: number
}

export type PlannerLockReason =
  | { type: 'branch-points'; current: number; required: number }
  | { type: 'prerequisite'; talentId: string; current: number; required: number }
  | { type: 'point-cap' }

export function totalPlannerPoints(build: PlannerBuild): number {
  return Object.values(build).reduce((sum, rank) => sum + Math.max(0, rank), 0)
}

export function plannerBranchPoints<B extends string>(build: PlannerBuild, branch: B, talents: PlannerTalent<B>[]): number {
  return talents.filter((talent) => talent.branch === branch).reduce((sum, talent) => sum + (build[talent.id] ?? 0), 0)
}

export function dominantPlannerBranch<B extends string>(build: PlannerBuild, talents: PlannerTalent<B>[], branches: readonly B[], seed: B): B {
  return branches.reduce((best, candidate) => plannerBranchPoints(build, candidate, talents) > plannerBranchPoints(build, best, talents) ? candidate : best, seed)
}

export function plannerLockReason<B extends string>(build: PlannerBuild, talent: PlannerTalent<B>, talents: PlannerTalent<B>[], config: PlannerConfig<B>): PlannerLockReason | null {
  if (totalPlannerPoints(build) >= config.pointCap) return { type: 'point-cap' }
  const current = plannerBranchPoints(build, talent.branch, talents)
  if (current < talent.requiredTreePoints) return { type: 'branch-points', current, required: talent.requiredTreePoints }
  for (const requirement of talent.prerequisite ?? []) {
    const prerequisite = talents.find((candidate) => candidate.id === requirement.talentId)
    const required = requirement.requiredRank ?? prerequisite?.maxRank
    const currentRank = prerequisite ? (build[prerequisite.id] ?? 0) : 0
    if (!prerequisite || required === undefined || currentRank < required) {
      return { type: 'prerequisite', talentId: requirement.talentId, current: currentRank, required: required ?? 0 }
    }
  }
  return null
}

export function canIncrementPlannerTalent<B extends string>(build: PlannerBuild, talent: PlannerTalent<B>, talents: PlannerTalent<B>[], config: PlannerConfig<B>): boolean {
  return (build[talent.id] ?? 0) < talent.maxRank && plannerLockReason(build, talent, talents, config) === null
}

export function incrementPlannerTalent<B extends string>(build: PlannerBuild, talent: PlannerTalent<B>, talents: PlannerTalent<B>[], config: PlannerConfig<B>): PlannerBuild {
  if (!canIncrementPlannerTalent(build, talent, talents, config)) return build
  return { ...build, [talent.id]: (build[talent.id] ?? 0) + 1 }
}

function remainsValid<B extends string>(build: PlannerBuild, talent: PlannerTalent<B>, talents: PlannerTalent<B>[]): boolean {
  const rank = build[talent.id] ?? 0
  if (rank <= 0) return true
  if (plannerBranchPoints(build, talent.branch, talents) < talent.requiredTreePoints + rank) return false
  return (talent.prerequisite ?? []).every((requirement) => {
    const prerequisite = talents.find((candidate) => candidate.id === requirement.talentId)
    const required = requirement.requiredRank ?? prerequisite?.maxRank
    return Boolean(prerequisite && required !== undefined && (build[prerequisite.id] ?? 0) >= required)
  })
}

export function decrementPlannerTalent<B extends string>(build: PlannerBuild, talent: PlannerTalent<B>, talents: PlannerTalent<B>[]): PlannerBuild {
  const rank = build[talent.id] ?? 0
  if (rank <= 0) return build
  const next: PlannerBuild = { ...build }
  if (rank === 1) delete next[talent.id]
  else next[talent.id] = rank - 1
  let changed = true
  while (changed) {
    changed = false
    for (const candidate of talents) {
      if ((next[candidate.id] ?? 0) > 0 && !remainsValid(next, candidate, talents)) {
        delete next[candidate.id]
        changed = true
      }
    }
  }
  return next
}

export function encodePlannerBuild(build: PlannerBuild): string {
  return Object.entries(build).filter(([, rank]) => Number.isInteger(rank) && rank > 0).sort(([left], [right]) => left.localeCompare(right)).map(([id, rank]) => `${id}.${rank}`).join('~')
}

export function decodePlannerBuild<B extends string>(code: string, talents: PlannerTalent<B>[]): PlannerBuild {
  const byId = new Map(talents.map((talent) => [talent.id, talent]))
  const build: PlannerBuild = {}
  for (const token of code.split('~')) {
    const separator = token.lastIndexOf('.')
    if (separator < 1) continue
    const talent = byId.get(token.slice(0, separator))
    const requestedRank = Number(token.slice(separator + 1))
    if (!talent || !Number.isInteger(requestedRank) || requestedRank <= 0) continue
    build[talent.id] = Math.min(requestedRank, talent.maxRank)
  }
  return build
}
