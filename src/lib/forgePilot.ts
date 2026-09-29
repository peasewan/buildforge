import {
  canIncrementPlannerTalent,
  incrementPlannerTalent,
  totalPlannerPoints,
  type PlannerBuild,
  type PlannerConfig,
  type PlannerTalent,
} from './talentPlanner'

export interface ForgePilotSavedBuild {
  schemaVersion: 1
  id: string
  name: string
  classId: string
  dataVersion: string
  originalCode: string
  level: number | null
  sourceUrl?: string
  savedAt: string
}

export interface ForgePilotCreateInput extends Omit<ForgePilotSavedBuild, 'schemaVersion' | 'originalCode' | 'level' | 'sourceUrl'> {
  shareInput: string
  level?: number | null
  sourceUrl?: string
}

export type ForgePilotCreateResult =
  | { ok: true; build: ForgePilotSavedBuild }
  | { ok: false; error: 'invalid_input' | 'unsupported_share_link' | 'empty_build_code' }

export type ForgePilotInspection =
  | { status: 'ready'; allocation: PlannerBuild; points: number }
  | { status: 'needs_review'; reason: 'dataset_changed' | 'removed_official' | 'reported_removed_under_review'; talentId?: string }
  | { status: 'invalid'; reason: 'class_mismatch' | 'malformed_code' | 'unknown_talent' | 'rank_out_of_range' | 'duplicate_talent' | 'illegal_allocation'; talentId?: string }

function localUrl(input: string): URL | null {
  let parsed: URL
  try {
    parsed = new URL(input, 'https://buildforgetools.com')
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' || !['buildforgetools.com', 'www.buildforgetools.com'].includes(parsed.hostname)) return null
  return parsed
}

function codeParameter(classId: string, pathname: string): 'id' | 'build' | null {
  if (classId === 'paladin') return pathname === '/build' ? 'id' : null
  if (pathname === `/${classId}`) return 'build'
  return null
}

function parsedLevel(url: URL): number | null | undefined {
  const text = url.searchParams.get('level')
  if (text === null) return null
  if (!/^[1-9]\d*$/.test(text)) return undefined
  const value = Number(text)
  return Number.isInteger(value) && value <= 60 ? value : undefined
}

export function createForgePilotSavedBuild(input: ForgePilotCreateInput): ForgePilotCreateResult {
  if (![input.id, input.name, input.classId, input.dataVersion, input.savedAt].every((value) => typeof value === 'string' && value.trim()) || typeof input.shareInput !== 'string') {
    return { ok: false, error: 'invalid_input' }
  }
  if (input.level !== undefined && input.level !== null && (!Number.isInteger(input.level) || input.level < 1 || input.level > 60)) {
    return { ok: false, error: 'invalid_input' }
  }
  const shareInput = input.shareInput.trim()
  const isLink = shareInput.startsWith('/') || /^https?:\/\//i.test(shareInput)
  const shareUrl = isLink ? localUrl(shareInput) : null
  if (isLink && !shareUrl) return { ok: false, error: 'unsupported_share_link' }
  const shareParameter = shareUrl && codeParameter(input.classId, shareUrl.pathname)
  if (shareUrl && !shareParameter) return { ok: false, error: 'unsupported_share_link' }
  const code = shareUrl && shareParameter ? shareUrl.searchParams.get(shareParameter) : shareInput
  if (!code) return { ok: false, error: 'empty_build_code' }
  if (code.length > 2_000) return { ok: false, error: 'invalid_input' }
  const urlLevel = shareUrl ? parsedLevel(shareUrl) : null
  if (urlLevel === undefined || (input.level != null && urlLevel != null && input.level !== urlLevel)) {
    return { ok: false, error: 'invalid_input' }
  }
  const level = input.level ?? urlLevel

  const sourceUrl = input.sourceUrl ? localUrl(input.sourceUrl) : shareUrl
  if (input.sourceUrl && !sourceUrl) return { ok: false, error: 'unsupported_share_link' }
  let relativeSource: string | undefined
  if (sourceUrl) {
    const parameter = codeParameter(input.classId, sourceUrl.pathname)
    if (!parameter) return { ok: false, error: 'unsupported_share_link' }
    const existingCode = sourceUrl.searchParams.get(parameter)
    if (existingCode && existingCode !== code) return { ok: false, error: 'invalid_input' }
    if (!existingCode) sourceUrl.searchParams.set(parameter, code)
    const sourceLevel = parsedLevel(sourceUrl)
    if (sourceLevel === undefined || (sourceLevel !== null && level !== null && sourceLevel !== level)) {
      return { ok: false, error: 'invalid_input' }
    }
    if (level !== null && sourceLevel === null && parameter === 'build') sourceUrl.searchParams.set('level', String(level))
    relativeSource = `${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`
  }
  return {
    ok: true,
    build: {
      schemaVersion: 1,
      id: input.id,
      name: input.name,
      classId: input.classId,
      dataVersion: input.dataVersion,
      originalCode: code,
      level,
      ...(relativeSource ? { sourceUrl: relativeSource } : {}),
      savedAt: input.savedAt,
    },
  }
}

/** Never reinterpret an older code using the current tree. The user must review it first. */
export function inspectForgePilotSavedBuild<B extends string>(
  saved: ForgePilotSavedBuild,
  current: { classId: string; dataVersion: string; talents: PlannerTalent<B>[]; config: PlannerConfig<B> },
): ForgePilotInspection {
  if (saved.classId !== current.classId) return { status: 'invalid', reason: 'class_mismatch' }
  if (saved.dataVersion !== current.dataVersion) return { status: 'needs_review', reason: 'dataset_changed' }

  const byId = new Map(current.talents.map((talent) => [talent.id, talent]))
  const target: PlannerBuild = {}
  let unavailable: { reason: 'removed_official' | 'reported_removed_under_review'; talentId: string } | null = null
  for (const token of saved.originalCode.split('~')) {
    const separator = token.lastIndexOf('.')
    if (separator < 1 || separator === token.length - 1) return { status: 'invalid', reason: 'malformed_code' }
    const id = token.slice(0, separator)
    const rankText = token.slice(separator + 1)
    if (!/^[1-9]\d*$/.test(rankText)) return { status: 'invalid', reason: 'malformed_code' }
    if (Object.hasOwn(target, id)) return { status: 'invalid', reason: 'duplicate_talent', talentId: id }
    const talent = byId.get(id)
    if (!talent) return { status: 'invalid', reason: 'unknown_talent', talentId: id }
    const rank = Number(rankText)
    if (!Number.isSafeInteger(rank) || rank > talent.maxRank) return { status: 'invalid', reason: 'rank_out_of_range', talentId: id }
    if (!unavailable && (talent.currentBetaAvailability === 'removed_official' || talent.currentBetaAvailability === 'reported_removed_under_review')) {
      unavailable = { reason: talent.currentBetaAvailability, talentId: id }
    }
    target[id] = rank
  }

  if (unavailable) return { status: 'needs_review', ...unavailable }

  const points = totalPlannerPoints(target)
  if (points < 1 || points > current.config.pointCap) return { status: 'invalid', reason: 'illegal_allocation' }

  // Reconstruct point by point so a syntactically valid code cannot bypass tier
  // gates, prerequisites, or the class point cap.
  let legal: PlannerBuild = {}
  let changed = true
  while (totalPlannerPoints(legal) < points && changed) {
    changed = false
    for (const talent of current.talents) {
      if ((legal[talent.id] ?? 0) < (target[talent.id] ?? 0) && canIncrementPlannerTalent(legal, talent, current.talents, current.config)) {
        legal = incrementPlannerTalent(legal, talent, current.talents, current.config)
        changed = true
      }
    }
  }
  if (totalPlannerPoints(legal) !== points) return { status: 'invalid', reason: 'illegal_allocation' }
  return { status: 'ready', allocation: legal, points }
}
