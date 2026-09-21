import {
  canIncrementPlannerTalent,
  decodePlannerBuild,
  decrementPlannerTalent,
  dominantPlannerBranch,
  encodePlannerBuild,
  incrementPlannerTalent,
  plannerBranchPoints,
  plannerLockReason,
  totalPlannerPoints,
  type PlannerBuild,
  type PlannerLockReason,
  type PlannerPrerequisite,
  type PlannerTalent,
} from './talentPlanner'

export type Branch = 'holy' | 'protection' | 'retribution'

export type Build = PlannerBuild

export type TalentPrerequisite = PlannerPrerequisite

export type TalentDefinition = PlannerTalent<Branch>

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

export type TalentLockReason = PlannerLockReason

/**
 * The branch a build spends most of its points in. `seed` is returned on a tie, so
 * callers can keep the branch a reader is already looking at rather than flickering.
 */
export function dominantBranch(build: Build, talents: TalentDefinition[], seed: Branch): Branch {
  return dominantPlannerBranch(build, talents, BRANCHES, seed)
}

export function totalPoints(build: Build): number {
  return totalPlannerPoints(build)
}

export function branchPoints(
  build: Build,
  branch: Branch,
  talents: TalentDefinition[],
): number {
  return plannerBranchPoints(build, branch, talents)
}

export function canIncrement(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): boolean {
  return canIncrementPlannerTalent(build, talent, talents, { branches: BRANCHES, pointCap: MAX_TALENT_POINTS })
}

export function getTalentLockReason(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): TalentLockReason | null {
  return plannerLockReason(build, talent, talents, { branches: BRANCHES, pointCap: MAX_TALENT_POINTS })
}

export function incrementTalent(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): Build {
  return incrementPlannerTalent(build, talent, talents, { branches: BRANCHES, pointCap: MAX_TALENT_POINTS })
}

export function decrementTalent(
  build: Build,
  talent: TalentDefinition,
  talents: TalentDefinition[],
): Build {
  return decrementPlannerTalent(build, talent, talents)
}

export function encodeBuild(build: Build): string {
  return encodePlannerBuild(build)
}

export function decodeBuild(code: string, talents: TalentDefinition[]): Build {
  return decodePlannerBuild(code, talents)
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
