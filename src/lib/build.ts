export type Branch = 'holy' | 'protection' | 'retribution'

export type Build = Record<string, number>

export interface TalentPrerequisite {
  talentId: string
  /** Null means the client confirms the link but not the required rank. */
  requiredRank: number | null
}

export interface TalentDefinition {
  id: string
  branch: Branch
  maxRank: number
  requiredTreePoints: number
  prerequisite?: TalentPrerequisite[]
}

export interface BuildUsageRecord {
  buildCode: string
  sessionId: string
  points: number
  branch: Branch
  selectedTalentIds: string[]
}

export type BuildUsageValidation =
  | { ok: true; data: BuildUsageRecord }
  | { ok: false; error: string }

export const BRANCHES: Branch[] = ['holy', 'protection', 'retribution']

export const MAX_TALENT_POINTS = 51

export type TalentLockReason =
  | { type: 'branch-points'; current: number; required: number }
  | { type: 'prerequisite'; talentId: string; current: number; required: number }
  | { type: 'point-cap' }

/**
 * The branch a build spends most of its points in. `seed` is returned on a tie, so
 * callers can keep the branch a reader is already looking at rather than flickering.
 */
export function dominantBranch(build: Build, talents: TalentDefinition[], seed: Branch): Branch {
  return BRANCHES.reduce(
    (best, candidate) => branchPoints(build, candidate, talents) > branchPoints(build, best, talents) ? candidate : best,
    seed,
  )
}

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
  return currentRank < talent.maxRank && getTalentLockReason(build, talent, talents) === null
}

export function getTalentLockReason(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): TalentLockReason | null {
  if (totalPoints(build) >= MAX_TALENT_POINTS) return { type: 'point-cap' }

  const currentBranchPoints = branchPoints(build, talent.branch, talents)
  if (currentBranchPoints < talent.requiredTreePoints) {
    return { type: 'branch-points', current: currentBranchPoints, required: talent.requiredTreePoints }
  }

  for (const requirement of talent.prerequisite ?? []) {
    const prerequisite = talents.find((candidate) => candidate.id === requirement.talentId)
    const requiredRank = requirement.requiredRank ?? prerequisite?.maxRank
    const currentRank = prerequisite ? (build[prerequisite.id] ?? 0) : 0
    if (!prerequisite || requiredRank === undefined || currentRank < requiredRank) {
      return {
        type: 'prerequisite',
        talentId: requirement.talentId,
        current: currentRank,
        required: requiredRank ?? 0,
      }
    }
  }

  return null
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
  if (branchPoints(build, talent.branch, talents) < talent.requiredTreePoints + build[talent.id]) {
    return false
  }
  if (!talent.prerequisite || talent.prerequisite.length === 0) return true
  return talent.prerequisite.every((requirement) => {
    const prerequisite = talents.find((candidate) => candidate.id === requirement.talentId)
    const requiredRank = requirement.requiredRank ?? prerequisite?.maxRank
    return Boolean(prerequisite && requiredRank !== undefined && (build[prerequisite.id] ?? 0) >= requiredRank)
  })
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

export function validateBuildUsage(input: unknown, talents: TalentDefinition[]): BuildUsageValidation {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Invalid build usage.' }
  const raw = input as Record<string, unknown>
  if (typeof raw.buildCode !== 'string' || raw.buildCode.length < 3 || raw.buildCode.length > 2_000) {
    return { ok: false, error: 'Invalid build code.' }
  }
  if (typeof raw.sessionId !== 'string' || !/^[a-zA-Z0-9_-]{16,64}$/.test(raw.sessionId)) {
    return { ok: false, error: 'Invalid session.' }
  }

  const decoded = decodeBuild(raw.buildCode, talents)
  const buildCode = encodeBuild(decoded)
  const points = totalPoints(decoded)
  if (!buildCode || buildCode !== raw.buildCode || points < 1 || points > MAX_TALENT_POINTS) {
    return { ok: false, error: 'Invalid build code.' }
  }

  let reconstructed: Build = {}
  let previousPoints = -1
  while (totalPoints(reconstructed) < points && totalPoints(reconstructed) !== previousPoints) {
    previousPoints = totalPoints(reconstructed)
    for (const talent of talents) {
      const targetRank = decoded[talent.id] ?? 0
      if ((reconstructed[talent.id] ?? 0) < targetRank && canIncrement(reconstructed, talent, talents)) {
        reconstructed = incrementTalent(reconstructed, talent, talents)
      }
    }
  }
  if (encodeBuild(reconstructed) !== buildCode) return { ok: false, error: 'Invalid build allocation.' }

  return {
    ok: true,
    data: {
      buildCode,
      sessionId: raw.sessionId,
      points,
      branch: dominantBranch(decoded, talents, 'holy'),
      selectedTalentIds: Object.keys(decoded).sort(),
    },
  }
}

export function buildUsageStoragePath(record: Pick<BuildUsageRecord, 'buildCode' | 'sessionId'>, createdAt: string): string {
  let hash = 2166136261
  for (const character of record.buildCode) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  const date = createdAt.slice(0, 10)
  return `build-usage/${date}/${record.sessionId}-${(hash >>> 0).toString(16).padStart(8, '0')}.json`
}
