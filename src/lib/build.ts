export type Branch = 'holy' | 'protection' | 'retribution'

export type Build = Record<string, number>

export interface TalentDefinition {
  id: string
  branch: Branch
  tier: number
  maxRank: number
  requires?: string
}

export const MAX_TALENT_POINTS = 51
export const POINTS_PER_TIER = 5

export function totalPoints(build: Build): number {
  return Object.values(build).reduce((sum, rank) => sum + Math.max(0, rank), 0)
}

export function branchPoints(
  build: Build,
  branch: Branch,
  talents: TalentDefinition[],
): number {
  return talents
    .filter((talent) => talent.branch === branch)
    .reduce((sum, talent) => sum + (build[talent.id] ?? 0), 0)
}

export function canIncrement(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): boolean {
  const currentRank = build[talent.id] ?? 0
  if (currentRank >= talent.maxRank || totalPoints(build) >= MAX_TALENT_POINTS) return false

  if (branchPoints(build, talent.branch, talents) < talent.tier * POINTS_PER_TIER) return false

  if (talent.requires) {
    const prerequisite = talents.find((candidate) => candidate.id === talent.requires)
    if (!prerequisite || (build[prerequisite.id] ?? 0) < prerequisite.maxRank) return false
  }

  return true
}

export function incrementTalent(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): Build {
  if (!canIncrement(build, talent, talents)) return build
  return { ...build, [talent.id]: (build[talent.id] ?? 0) + 1 }
}

function remainsValid(build: Build, talent: TalentDefinition, talents: TalentDefinition[]): boolean {
  if (!(build[talent.id] > 0)) return true
  if (branchPoints(build, talent.branch, talents) < talent.tier * POINTS_PER_TIER + build[talent.id]) {
    return false
  }
  if (!talent.requires) return true
  const prerequisite = talents.find((candidate) => candidate.id === talent.requires)
  return Boolean(prerequisite && (build[prerequisite.id] ?? 0) >= prerequisite.maxRank)
}

export function decrementTalent(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): Build {
  const rank = build[talent.id] ?? 0
  if (rank <= 0) return build

  const next: Build = { ...build }
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

export function encodeBuild(build: Build): string {
  return Object.entries(build)
    .filter(([, rank]) => Number.isInteger(rank) && rank > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, rank]) => `${id}.${rank}`)
    .join('~')
}

export function decodeBuild(code: string, talents: TalentDefinition[]): Build {
  const byId = new Map(talents.map((talent) => [talent.id, talent]))
  const build: Build = {}

  for (const token of code.split('~')) {
    const separator = token.lastIndexOf('.')
    if (separator < 1) continue
    const id = token.slice(0, separator)
    const requestedRank = Number(token.slice(separator + 1))
    const talent = byId.get(id)
    if (!talent || !Number.isInteger(requestedRank) || requestedRank <= 0) continue
    build[id] = Math.min(requestedRank, talent.maxRank)
  }
  return build
}
