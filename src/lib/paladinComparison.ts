import { DATA_VERSION, talents } from '../data/talents'
import { BRANCHES, encodeBuild, type Build } from './build'
import { isValidPlannerBuild } from './talentPlanner'

export interface PaladinSnapshot { build: Build; level: number; dataset: string }

export function createPaladinSnapshot(build: Build, level: number): PaladinSnapshot | null {
  if (!Number.isInteger(level) || (level !== 60 && (level < 10 || level > 30))) return null
  const cap = level === 60 ? 51 : level - 9
  if (!isValidPlannerBuild(build, talents, { branches: BRANCHES, pointCap: cap })) return null
  return { build: { ...build }, level, dataset: DATA_VERSION }
}

export function parsePaladinSnapshot(value: unknown): PaladinSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  if (raw.dataset !== DATA_VERSION || typeof raw.level !== 'number' || !raw.build || typeof raw.build !== 'object') return null
  return createPaladinSnapshot(raw.build as Build, raw.level)
}

export function paladinSnapshotHref(snapshot: PaladinSnapshot): string {
  return `/build?id=${encodeBuild(snapshot.build)}&level=${snapshot.level}&dataset=${snapshot.dataset}#calculator`
}

export function comparePaladinAllocations(a: PaladinSnapshot, b: PaladinSnapshot) {
  return talents.filter(talent => (a.build[talent.id] ?? 0) !== (b.build[talent.id] ?? 0)).map(talent => {
    const aRank = a.build[talent.id] ?? 0
    const bRank = b.build[talent.id] ?? 0
    const effect = (rank: number) => rank === 0 ? 'Not selected' : talent.rankDescriptions?.[rank - 1] ?? 'Exact rank effect not verified'
    return { talent, aRank, bRank, delta: bRank - aRank, aEffect: effect(aRank), bEffect: effect(bRank) }
  })
}
