import type { ForgePilotSavedBuild } from './forgePilot'
import { isSavedBuild } from './forgePilotStorage.js'

export const CLOUD_BUILD_LIMIT = 20

const WOW_CLASSES = new Set([
  'paladin', 'warrior', 'mage', 'rogue', 'priest', 'druid', 'warlock', 'hunter', 'shaman',
])
const SAFE_ID = /^[A-Za-z0-9_-]{1,100}$/
const SAFE_USER_ID = /^[A-Za-z0-9_-]{1,128}$/
const TALENT_TOKEN = /^[a-zA-Z0-9_-]+\.[1-9]\d*$/

/** Cloud records retain the historical source version; this is schema validation, not build migration. */
export function parseCloudBuild(value: unknown): ForgePilotSavedBuild | null {
  if (!isSavedBuild(value) || !WOW_CLASSES.has(value.classId) || !SAFE_ID.test(value.id)) return null
  const allowedFields = new Set(['schemaVersion', 'id', 'name', 'classId', 'dataVersion', 'originalCode', 'level', 'sourceUrl', 'savedAt'])
  if (!Object.keys(value).every((key) => allowedFields.has(key))) return null
  const tokens = value.originalCode.split('~')
  if (!tokens.length || tokens.length > 100 || !tokens.every((token) => TALENT_TOKEN.test(token))) return null
  const talentIds = tokens.map((token) => token.slice(0, token.lastIndexOf('.')))
  if (new Set(talentIds).size !== talentIds.length) return null
  return value
}

export function cloudUserPrefix(userId: string): string | null {
  return SAFE_USER_ID.test(userId) ? `forge-pilot/${userId}/` : null
}

export function cloudBuildPath(userId: string, buildId: string): string | null {
  const prefix = cloudUserPrefix(userId)
  return prefix && SAFE_ID.test(buildId) ? `${prefix}${buildId}.json` : null
}

export function sameCloudBuild(left: ForgePilotSavedBuild, right: ForgePilotSavedBuild): boolean {
  return left.classId === right.classId
    && left.dataVersion === right.dataVersion
    && left.originalCode === right.originalCode
    && left.level === right.level
}

export function validCloudBuildName(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 120
}
