import { encodeBuild, totalPoints, type Build } from './build'

const STORAGE_KEY = 'buildforge-completed-builds'

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function claimBuildCompletion(
  previousBuild: Build,
  nextBuild: Build,
  completedBuilds: Set<string>,
): boolean {
  if (totalPoints(previousBuild) >= 51 || totalPoints(nextBuild) !== 51) return false

  const buildCode = encodeBuild(nextBuild)
  if (completedBuilds.has(buildCode)) return false

  completedBuilds.add(buildCode)
  return true
}

export function loadClaimedBuildCompletions(
  storage: SessionStorageLike | undefined = typeof window === 'undefined' ? undefined : window.sessionStorage,
): Set<string> {
  if (!storage) return new Set()
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

export function saveClaimedBuildCompletions(
  completedBuilds: Set<string>,
  storage: SessionStorageLike | undefined = typeof window === 'undefined' ? undefined : window.sessionStorage,
): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify([...completedBuilds]))
  } catch {
    // In-memory deduplication still works when session storage is unavailable.
  }
}
