import { put } from '@vercel/blob'
import { createRequire } from 'node:module'
import { buildUsageStoragePath, validateBuildUsage, type Branch, type TalentDefinition } from '../src/lib/build.js'

interface RawTalentDefinition {
  id: string
  branch: Branch
  maxRank: number
  requiredTreePoints: number
  prerequisite: string[]
}

const require = createRequire(import.meta.url)
const betaTalentData = require('../src/data/paladin-beta-1.60.1.69913.json') as { talents: RawTalentDefinition[] }
const talents: TalentDefinition[] = betaTalentData.talents.map((talent) => ({
  id: talent.id,
  branch: talent.branch,
  maxRank: talent.maxRank,
  requiredTreePoints: talent.requiredTreePoints,
  prerequisite: talent.prerequisite.length
    ? talent.prerequisite.map((talentId) => ({ talentId, requiredRank: null }))
    : undefined,
}))

const responseHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders })
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  return origin === 'https://buildforgetools.com'
    || origin === 'https://www.buildforgetools.com'
    || origin.startsWith('http://localhost:')
    || origin.startsWith('http://127.0.0.1:')
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
    if (!allowedOrigin(request)) return json({ error: 'Origin not allowed.' }, 403)

    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > 2_500) return json({ error: 'Request is too large.' }, 413)

    let input: unknown
    try {
      input = await request.json()
    } catch {
      return json({ error: 'Invalid JSON.' }, 400)
    }

    const result = validateBuildUsage(input, talents)
    if (!result.ok) return json({ error: result.error }, 400)

    const createdAt = new Date().toISOString()
    const pathname = buildUsageStoragePath(result.data, createdAt)
    try {
      await put(pathname, JSON.stringify({
        schemaVersion: 1,
        event: 'build_shared',
        createdAt,
        ...result.data,
      }), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      })
    } catch {
      return json({ error: 'Build usage could not be saved.' }, 503)
    }

    return json({ ok: true }, 201)
  },
}
