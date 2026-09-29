import type { ForgePilotSavedBuild } from './forgePilot'

export const FORGE_PILOT_STORAGE_KEY = 'buildforge-forge-pilot-saved-builds-v1'
export const FORGE_PILOT_MAX_SAVED_BUILDS = 20

export interface ForgePilotStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type ForgePilotCollectionResult =
  | { ok: true; builds: ForgePilotSavedBuild[] }
  | { ok: false; error: 'storage_unavailable' | 'corrupt_storage' | 'invalid_record' | 'limit_reached' }

function validSourceUrl(value: unknown, classId: string, originalCode: string): boolean {
  if (value === undefined) return true
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return false
  try {
    const parsed = new URL(value, 'https://buildforgetools.com')
    if (parsed.origin !== 'https://buildforgetools.com') return false
    const parameter = classId === 'paladin' && parsed.pathname === '/build' ? 'id'
      : parsed.pathname === `/${classId}` ? 'build' : null
    return parameter !== null && parsed.searchParams.get(parameter) === originalCode
  } catch {
    return false
  }
}

function isSavedBuild(value: unknown): value is ForgePilotSavedBuild {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return record.schemaVersion === 1
    && typeof record.id === 'string' && record.id.length > 0 && record.id.length <= 100
    && typeof record.name === 'string' && record.name.trim().length > 0 && record.name.length <= 120
    && typeof record.classId === 'string' && /^[a-z][a-z0-9-]{0,40}$/.test(record.classId)
    && typeof record.dataVersion === 'string' && record.dataVersion.length > 0 && record.dataVersion.length <= 100
    && typeof record.originalCode === 'string' && record.originalCode.length > 0 && record.originalCode.length <= 2_000
    && (record.level === null || (typeof record.level === 'number' && Number.isInteger(record.level) && record.level >= 1 && record.level <= 60))
    && validSourceUrl(record.sourceUrl, String(record.classId), String(record.originalCode))
    && typeof record.savedAt === 'string' && !Number.isNaN(Date.parse(record.savedAt))
}

export function readForgePilotSavedBuilds(storage: ForgePilotStorage): ForgePilotCollectionResult {
  let raw: string | null
  try {
    raw = storage.getItem(FORGE_PILOT_STORAGE_KEY)
  } catch {
    return { ok: false, error: 'storage_unavailable' }
  }
  if (raw === null) return { ok: true, builds: [] }
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'corrupt_storage' }
  }
  if (!Array.isArray(value) || value.length > FORGE_PILOT_MAX_SAVED_BUILDS || !value.every(isSavedBuild)) {
    return { ok: false, error: 'corrupt_storage' }
  }
  const ids = new Set(value.map((build) => build.id))
  if (ids.size !== value.length) return { ok: false, error: 'corrupt_storage' }
  return { ok: true, builds: value }
}

function writeCollection(storage: ForgePilotStorage, builds: ForgePilotSavedBuild[]): ForgePilotCollectionResult {
  try {
    storage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify(builds))
    return { ok: true, builds }
  } catch {
    return { ok: false, error: 'storage_unavailable' }
  }
}

export function upsertForgePilotSavedBuild(storage: ForgePilotStorage, build: ForgePilotSavedBuild): ForgePilotCollectionResult {
  if (!isSavedBuild(build)) return { ok: false, error: 'invalid_record' }
  const current = readForgePilotSavedBuilds(storage)
  if (!current.ok) return current
  const identity = (candidate: ForgePilotSavedBuild) =>
    candidate.classId === build.classId && candidate.dataVersion === build.dataVersion
    && candidate.originalCode === build.originalCode && candidate.level === build.level
  const existing = current.builds.find((candidate) => identity(candidate) || candidate.id === build.id)
  const replacement = existing && identity(existing) ? { ...build, id: existing.id } : build
  const next = [replacement, ...current.builds.filter((candidate) => candidate.id !== build.id && !identity(candidate))]
  if (next.length > FORGE_PILOT_MAX_SAVED_BUILDS) return { ok: false, error: 'limit_reached' }
  return writeCollection(storage, next)
}

export function removeForgePilotSavedBuild(storage: ForgePilotStorage, id: string): ForgePilotCollectionResult {
  const current = readForgePilotSavedBuilds(storage)
  if (!current.ok) return current
  return writeCollection(storage, current.builds.filter((candidate) => candidate.id !== id))
}
