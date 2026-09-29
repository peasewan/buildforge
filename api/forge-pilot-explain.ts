import { BETA_PATCH_REVIEW } from '../src/data/betaPatchReview.js'
import { isIP } from 'node:net'

// The published class imports currently share this reviewed client baseline. Keep this
// serverless route lightweight; a test checks the value against every published class.
const CURRENT_DATA_VERSION = 'wow_forever_beta_1.60.1.69913'
const CLASS_DATA_VERSION = 'WoW Forever Beta 1.60.1.69913'
const KNOWN_SOURCE_VERSIONS = new Set([
  CURRENT_DATA_VERSION,
  CLASS_DATA_VERSION,
  'wow_forever_beta_1.60.1.69893',
  'wow_forever_beta_1.60.1.69876',
  'unknown',
])
const responseHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

// Best-effort protection within one warm Vercel function instance. Instances do
// not share memory, so these limits are not a global quota or durable cache.
const RATE_WINDOW_MS = 10 * 60 * 1_000
const RATE_WINDOW_REQUESTS = 20
const MAX_CLIENT_WINDOWS = 512
const FACT_CACHE_MS = 24 * 60 * 60 * 1_000
const FALLBACK_CACHE_MS = 60 * 1_000
const requestWindows = new Map<string, { startedAt: number; count: number }>()
const factCache = new Map<keyof typeof BETA_PATCH_REVIEW.notes, { selection: number[] | null; expiresAt: number }>()
const pendingFacts = new Map<keyof typeof BETA_PATCH_REVIEW.notes, Promise<number[] | null>>()

interface ExplainInput {
  classId: keyof typeof BETA_PATCH_REVIEW.notes
  sourceDataVersion: string
  currentDataVersion: string
}

function json(body: Record<string, unknown>, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...responseHeaders, ...extraHeaders } })
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  return origin === 'https://buildforgetools.com'
    || origin === 'https://www.buildforgetools.com'
    || /^http:\/\/(?:localhost|127\.0\.0\.1):\d{1,5}$/.test(origin)
}

function clientIp(request: Request): string {
  // Vercel supplies and overwrites x-vercel-forwarded-for / x-forwarded-for.
  // Never store the raw header: it might be missing or malformed outside Vercel.
  const forwarded = request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first && isIP(first) ? first : 'unknown'
}

function rateLimitRetrySeconds(ip: string, now: number): number | null {
  let window = requestWindows.get(ip)
  if (!window || now < window.startedAt || now - window.startedAt >= RATE_WINDOW_MS) {
    if (!window && requestWindows.size >= MAX_CLIENT_WINDOWS) {
      for (const [key, candidate] of requestWindows) {
        if (now - candidate.startedAt >= RATE_WINDOW_MS) requestWindows.delete(key)
      }
      if (requestWindows.size >= MAX_CLIENT_WINDOWS) requestWindows.delete(requestWindows.keys().next().value!)
    }
    window = { startedAt: now, count: 0 }
    requestWindows.set(ip, window)
  }
  if (window.count >= RATE_WINDOW_REQUESTS) {
    return Math.max(1, Math.ceil((window.startedAt + RATE_WINDOW_MS - now) / 1_000))
  }
  window.count += 1
  return null
}

function parseInput(raw: unknown): ExplainInput | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const input = raw as Record<string, unknown>
  if (Object.keys(input).sort().join(',') !== 'classId,currentDataVersion,sourceDataVersion') return null
  if (typeof input.classId !== 'string' || !Object.hasOwn(BETA_PATCH_REVIEW.notes, input.classId)) return null
  const publishedVersion = ['paladin', 'mage', 'warrior'].includes(input.classId)
    ? CURRENT_DATA_VERSION
    : CLASS_DATA_VERSION
  if (input.currentDataVersion !== publishedVersion) return null
  if (typeof input.sourceDataVersion !== 'string' || !KNOWN_SOURCE_VERSIONS.has(input.sourceDataVersion)) return null
  if (input.classId !== 'paladin' && input.sourceDataVersion !== input.currentDataVersion && input.sourceDataVersion !== 'unknown') return null
  return input as unknown as ExplainInput
}

function baselineExplanation(input: ExplainInput) {
  const className = input.classId[0].toUpperCase() + input.classId.slice(1)
  const currentBuild = input.currentDataVersion.split('.').at(-1)
  const announcedBuild = BETA_PATCH_REVIEW.clientBuild.split('.').at(-1)
  const versionStatement = input.sourceDataVersion === input.currentDataVersion
    ? `This saved ${className} build uses the same ${currentBuild} talent dataset as the currently published calculator.`
    : `This saved ${className} build has an older or unknown talent data version, so it needs review against the currently published ${currentBuild} dataset.`
  return `${versionStatement} A matching data version does not establish whether a build is usable in game. The ${announcedBuild} client talent dataset is pending reconciliation; this saved build's impact from that patch cannot yet be determined.`
}

async function selectReviewedFacts(input: ExplainInput, key: string): Promise<number[] | null> {
  const facts = BETA_PATCH_REVIEW.notes[input.classId]
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-flash',
        thinking: { type: 'disabled' },
        stream: false,
        max_tokens: 80,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return only a JSON object of the form {"factIndexes":[0]}. Choose at most two zero-based indexes from the supplied reviewed official notes. Do not write prose, assess build validity, or add facts.' },
          { role: 'user', content: JSON.stringify({ classId: input.classId, officialNotes: facts }) },
        ],
      }),
      signal: AbortSignal.timeout(6_000),
    })
    if (!response.ok) return null
    const payload = await response.json() as { choices?: Array<{ finish_reason?: unknown; message?: { content?: unknown } }> }
    const choice = payload.choices?.[0]
    if (choice?.finish_reason !== 'stop' || typeof choice.message?.content !== 'string' || choice.message.content.length > 500) return null
    const selected = JSON.parse(choice.message.content) as { factIndexes?: unknown }
    if (!Array.isArray(selected.factIndexes) || selected.factIndexes.length < 1 || selected.factIndexes.length > 2) return null
    if (!selected.factIndexes.every((value) => Number.isInteger(value) && value >= 0 && value < facts.length)) return null
    if (new Set(selected.factIndexes).size !== selected.factIndexes.length) return null
    return selected.factIndexes as number[]
  } catch {
    return null
  }
}

async function cachedReviewedFacts(input: ExplainInput, key: string): Promise<number[] | null> {
  const cached = factCache.get(input.classId)
  if (cached && cached.expiresAt > Date.now()) return cached.selection
  if (cached) factCache.delete(input.classId)
  const pending = pendingFacts.get(input.classId)
  if (pending) return pending
  const selection = selectReviewedFacts(input, key).then((value) => {
    factCache.set(input.classId, {
      selection: value,
      expiresAt: Date.now() + (value ? FACT_CACHE_MS : FALLBACK_CACHE_MS),
    })
    return value
  }).finally(() => pendingFacts.delete(input.classId))
  pendingFacts.set(input.classId, selection)
  return selection
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
    if (!allowedOrigin(request)) return json({ error: 'Origin not allowed.' }, 403)
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON required.' }, 415)
    if (Number(request.headers.get('content-length') ?? 0) > 1_000) return json({ error: 'Request is too large.' }, 413)
    const retryAfter = rateLimitRetrySeconds(clientIp(request), Date.now())
    if (retryAfter !== null) return json({ error: 'Too many explanation requests. Try again later.' }, 429, { 'retry-after': String(retryAfter) })

    let raw: string
    try {
      raw = await request.text()
    } catch {
      return json({ error: 'Invalid request.' }, 400)
    }
    if (raw.length > 1_000) return json({ error: 'Request is too large.' }, 413)

    let decoded: unknown
    try {
      decoded = JSON.parse(raw)
    } catch {
      return json({ error: 'Invalid JSON.' }, 400)
    }
    const input = parseInput(decoded)
    if (!input) return json({ error: 'Unsupported explanation request.' }, 400)

    const base = baselineExplanation(input)
    const key = process.env.DEEPSEEK_API_KEY
    const selected = key ? await cachedReviewedFacts(input, key) : null
    const note = selected?.length
      ? ` Reviewed official ${input.classId} notes mention: ${selected.map((index) => BETA_PATCH_REVIEW.notes[input.classId][index]).join(' ')} These class-level notes do not prove that the saved allocation uses an affected talent.`
      : ''

    return json({
      status: input.sourceDataVersion === input.currentDataVersion ? 'same_dataset' : 'needs_review',
      patchStatus: BETA_PATCH_REVIEW.datasetStatus,
      explanation: base + note,
      sourceUrl: BETA_PATCH_REVIEW.officialSource,
      generatedBy: selected ? 'deepseek' : 'fallback',
    }, 200)
  },
}
