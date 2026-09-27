import { encodeBuild, totalPoints, type Build } from './build'

const STORAGE_KEY = 'buildforge-completed-builds'

export interface CompletionContext {
  classId: string
  level: number
  pointCap: number
}

const PALADIN_CONTEXT: CompletionContext = { classId: 'paladin', level: 60, pointCap: 51 }

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function claimBuildCompletion(
  previousBuild: Build,
  nextBuild: Build,
  completedBuilds: Set<string>,
  context: CompletionContext = PALADIN_CONTEXT,
): boolean {
  if (context.pointCap <= 0 || totalPoints(previousBuild) >= context.pointCap || totalPoints(nextBuild) !== context.pointCap) return false

  const buildCode = encodeBuild(nextBuild)
  const key = `${context.classId}:${context.level}:${context.pointCap}:${buildCode}`
  // Previously published Paladin sessions stored bare build codes; respect those claims.
  const legacyPaladin = context.classId === 'paladin' && context.level === 60 && context.pointCap === 51
  if (completedBuilds.has(key) || (legacyPaladin && completedBuilds.has(buildCode))) return false

  completedBuilds.add(key)
  return true
}

export function loadClaimedBuildCompletions(
  storage?: SessionStorageLike,
): Set<string> {
  try {
    const session = storage ?? (typeof window === 'undefined' ? undefined : window.sessionStorage)
    if (!session) return new Set()
    const value: unknown = JSON.parse(session.getItem(STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

export function saveClaimedBuildCompletions(
  completedBuilds: Set<string>,
  storage?: SessionStorageLike,
): void {
  try {
    const session = storage ?? (typeof window === 'undefined' ? undefined : window.sessionStorage)
    session?.setItem(STORAGE_KEY, JSON.stringify([...completedBuilds]))
  } catch {
    // In-memory deduplication still works when session storage is unavailable.
  }
}
