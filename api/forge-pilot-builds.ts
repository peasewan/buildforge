import { createClerkClient } from '@clerk/backend'
import { cloudUserPrefix, parseCloudBuild, validCloudBuildName } from '../src/lib/forgePilotCloud.js'
import { CloudStoreError, deleteCloudBuild, listCloudBuilds, renameCloudBuild, saveCloudBuild } from '../src/lib/forgePilotCloudStore.js'

const responseHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
}
const BODY_LIMIT_BYTES = 8_000
const AUTHORIZED_PARTIES = ['https://buildforgetools.com', 'https://www.buildforgetools.com', 'http://localhost:5173', 'http://127.0.0.1:5173']

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders })
}

function allowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  return origin === 'https://buildforgetools.com'
    || origin === 'https://www.buildforgetools.com'
    || (origin !== null && /^http:\/\/(?:localhost|127\.0\.0\.1):\d{1,5}$/.test(origin))
}

async function boundedJson(request: Request): Promise<{ ok: true; data: unknown } | { ok: false; status: 400 | 413 }> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > BODY_LIMIT_BYTES) return { ok: false, status: 413 }
  if (!request.body) return { ok: false, status: 400 }
  const reader = request.body.getReader()
  const parts: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > BODY_LIMIT_BYTES) {
        await reader.cancel()
        return { ok: false, status: 413 }
      }
      parts.push(value)
    }
    const raw = new Uint8Array(total)
    let position = 0
    for (const part of parts) { raw.set(part, position); position += part.byteLength }
    return { ok: true, data: JSON.parse(new TextDecoder().decode(raw)) as unknown }
  } catch {
    return { ok: false, status: 400 }
  }
}

function errorResponse(error: unknown) {
  if (error instanceof CloudStoreError) {
    if (error.code === 'limit_reached') return json({ error: 'Cloud save limit reached.' }, 409)
    if (error.code === 'conflict') return json({ error: 'Build ID conflicts with an existing record.' }, 409)
    if (error.code === 'not_found') return json({ error: 'Build not found.' }, 404)
    if (error.code === 'invalid_id') return json({ error: 'Invalid Build record.' }, 400)
  }
  return json({ error: 'Cloud saves are temporarily unavailable.' }, 503)
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405)
    if (request.method !== 'GET' && !allowedOrigin(request)) return json({ error: 'Origin not allowed.' }, 403)
    if ((request.method === 'POST' || request.method === 'PATCH') && request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
      return json({ error: 'JSON content type required.' }, 415)
    }

    const authorization = request.headers.get('authorization')
    if (!authorization || !/^Bearer [A-Za-z0-9._-]{1,4096}$/.test(authorization)) return json({ error: 'Sign in required.' }, 401)
    const secretKey = process.env.CLERK_SECRET_KEY
    const publishableKey = process.env.CLERK_PUBLISHABLE_KEY
      || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      || process.env.VITE_CLERK_PUBLISHABLE_KEY
    if (!secretKey || !publishableKey) return json({ error: 'Account sync is unavailable.' }, 503)

    let userId: string | null = null
    try {
      const client = createClerkClient({ secretKey, publishableKey })
      const state = await client.authenticateRequest(request, { acceptsToken: 'session_token', authorizedParties: AUTHORIZED_PARTIES })
      if (state.isAuthenticated) userId = state.toAuth().userId
    } catch {
      return json({ error: 'Account sync is unavailable.' }, 503)
    }
    if (!userId || !cloudUserPrefix(userId)) return json({ error: 'Sign in required.' }, 401)
    // A session may switch while a client request is in flight. This header is
    // only a consistency check; Clerk's verified userId remains the authority.
    const expectedUserId = request.headers.get('x-forge-pilot-user')
    if (expectedUserId && expectedUserId !== userId) return json({ error: 'Account changed. Retry the request.' }, 409)

    try {
      if (request.method === 'GET') return json({ builds: await listCloudBuilds(userId) }, 200)
      if (request.method === 'DELETE') {
        const id = new URL(request.url).searchParams.get('id')
        if (!id) return json({ error: 'Build ID required.' }, 400)
        await deleteCloudBuild(userId, id)
        return json({ ok: true }, 200)
      }

      const input = await boundedJson(request)
      if (!input.ok) return json({ error: input.status === 413 ? 'Request is too large.' : 'Invalid JSON.' }, input.status)
      if (!input.data || typeof input.data !== 'object' || Array.isArray(input.data)) return json({ error: 'Invalid request.' }, 400)
      const payload = input.data as Record<string, unknown>
      if (request.method === 'POST') {
        if (Object.keys(payload).length !== 1 || !Object.hasOwn(payload, 'build')) return json({ error: 'Invalid request.' }, 400)
        const build = parseCloudBuild(payload.build)
        if (!build) return json({ error: 'Invalid Build record.' }, 400)
        const saved = await saveCloudBuild(userId, build)
        return json({ build: saved.build }, saved.created ? 201 : 200)
      }
      if (Object.keys(payload).sort().join(',') !== 'id,name' || typeof payload.id !== 'string' || !validCloudBuildName(payload.name)) {
        return json({ error: 'Invalid rename request.' }, 400)
      }
      return json({ build: await renameCloudBuild(userId, payload.id, payload.name) }, 200)
    } catch (error) {
      return errorResponse(error)
    }
  },
}
