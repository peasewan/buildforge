import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createForgePilotSavedBuild, type ForgePilotSavedBuild } from './forgePilot'

const { authenticateRequest, createClerkClient, blobs, list, get, put, del } = vi.hoisted(() => {
  const blobs = new Map<string, string>()
  return {
    authenticateRequest: vi.fn(),
    createClerkClient: vi.fn(),
    blobs,
    list: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  }
})

vi.mock('@clerk/backend', () => ({ createClerkClient }))
vi.mock('@vercel/blob', () => ({ list, get, put, del }))

import handler from '../../api/forge-pilot-builds'

function saved(id: string, code = 'divine_intellect.5'): ForgePilotSavedBuild {
  const result = createForgePilotSavedBuild({
    id, name: `Build ${id}`, classId: 'paladin', dataVersion: 'wow_forever_beta_1.60.1.69913',
    shareInput: code, savedAt: '2026-09-29T00:00:00.000Z',
  })
  if (!result.ok) throw new Error(result.error)
  return result.build
}

function request(method: string, payload?: unknown, token = 'user_one', path = '/api/forge-pilot-builds', origin = 'https://buildforgetools.com') {
  return new Request(`https://buildforgetools.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(method !== 'GET' ? { origin, 'content-type': 'application/json' } : {}),
    },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  })
}

describe('ForgePilot cloud Build API', () => {
  beforeEach(() => {
    blobs.clear()
    vi.clearAllMocks()
    process.env.CLERK_SECRET_KEY = 'sk_test_placeholder'
    process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder'
    createClerkClient.mockReturnValue({ authenticateRequest })
    authenticateRequest.mockImplementation(async (incoming: Request) => {
      const token = incoming.headers.get('authorization')?.slice(7)
      return token && token !== 'invalid'
        ? { isAuthenticated: true, toAuth: () => ({ userId: token }) }
        : { isAuthenticated: false, toAuth: () => ({ userId: null }) }
    })
    list.mockImplementation(async ({ prefix, limit, cursor }: { prefix: string; limit: number; cursor?: string }) => {
      const matching = [...blobs.keys()].filter((path) => path.startsWith(prefix))
      const offset = cursor ? Number(cursor) : 0
      const page = matching.slice(offset, offset + limit)
      const nextOffset = offset + page.length
      return {
        blobs: page.map((pathname) => ({ pathname, size: blobs.get(pathname)!.length })),
        hasMore: nextOffset < matching.length,
        cursor: nextOffset < matching.length ? String(nextOffset) : undefined,
      }
    })
    get.mockImplementation(async (pathname: string) => {
      const value = blobs.get(pathname)
      return value === undefined ? null : {
        statusCode: 200,
        stream: new Response(value).body,
        blob: { pathname, size: value.length },
      }
    })
    put.mockImplementation(async (pathname: string, value: string) => { blobs.set(pathname, value); return { pathname } })
    del.mockImplementation(async (pathname: string) => { blobs.delete(pathname) })
  })

  it('requires a bearer session and never reads cloud records unauthenticated', async () => {
    const noBearer = new Request('https://buildforgetools.com/api/forge-pilot-builds')
    expect((await handler.fetch(noBearer)).status).toBe(401)
    expect((await handler.fetch(request('GET', undefined, 'invalid'))).status).toBe(401)
    expect(list).not.toHaveBeenCalled()
  })

  it('rejects an account-scoped save if the session changed before the request arrived', async () => {
    const response = await handler.fetch(new Request('https://buildforgetools.com/api/forge-pilot-builds', {
      method: 'POST',
      headers: {
        authorization: 'Bearer user_two', origin: 'https://buildforgetools.com',
        'content-type': 'application/json', 'x-forge-pilot-user': 'user_one',
      },
      body: JSON.stringify({ build: saved('old-account-build') }),
    }))
    expect(response.status).toBe(409)
    expect(put).not.toHaveBeenCalled()
  })

  it('verifies bearer tokens as site-authorized Clerk user sessions', async () => {
    await handler.fetch(request('GET'))
    expect(authenticateRequest).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining({
      acceptsToken: 'session_token',
      authorizedParties: expect.arrayContaining(['https://buildforgetools.com', 'https://www.buildforgetools.com']),
    }))
  })

  it('accepts the Vercel Marketplace Clerk publishable-key environment name', async () => {
    delete process.env.CLERK_PUBLISHABLE_KEY
    delete process.env.VITE_CLERK_PUBLISHABLE_KEY
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_marketplace'
    const response = await handler.fetch(request('GET'))
    expect(response.status).toBe(200)
    expect(createClerkClient).toHaveBeenCalledWith(expect.objectContaining({ publishableKey: 'pk_test_marketplace' }))
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  })

  it('requires JSON content type for POST and PATCH mutations', async () => {
    for (const method of ['POST', 'PATCH']) {
      const response = await handler.fetch(new Request('https://buildforgetools.com/api/forge-pilot-builds', {
        method,
        headers: { authorization: 'Bearer user_one', origin: 'https://buildforgetools.com', 'content-type': 'text/plain' },
        body: JSON.stringify(method === 'POST' ? { build: saved('plain') } : { id: 'plain', name: 'Plain' }),
      }))
      expect(response.status).toBe(415)
    }
    expect(put).not.toHaveBeenCalled()
  })

  it('stores and lists only the authenticated account’s private records', async () => {
    const record = saved('first')
    const created = await handler.fetch(request('POST', { build: record }))
    expect(created.status).toBe(201)
    expect(await created.json()).toEqual({ build: record })
    expect(put).toHaveBeenCalledWith('forge-pilot/user_one/first.json', JSON.stringify(record), expect.objectContaining({ access: 'private', addRandomSuffix: false }))

    const one = await handler.fetch(request('GET'))
    expect(await one.json()).toEqual({ builds: [record] })
    expect(one.headers.get('cache-control')).toBe('no-store')
    const other = await handler.fetch(request('GET', undefined, 'user_two'))
    expect(await other.json()).toEqual({ builds: [] })
  })

  it('deduplicates import by class/version/code/level without deleting local data', async () => {
    const first = saved('first')
    const second = { ...saved('second'), name: 'Updated name' }
    await handler.fetch(request('POST', { build: first }))
    const response = await handler.fetch(request('POST', { build: second }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ build: first })
    expect(blobs.size).toBe(1)
  })

  it('does not overwrite a cloud rename when local import is retried', async () => {
    const local = saved('local')
    await handler.fetch(request('POST', { build: local }))
    await handler.fetch(request('PATCH', { id: 'local', name: 'My cloud name' }))

    const retry = await handler.fetch(request('POST', { build: local }))
    expect(retry.status).toBe(200)
    expect(await retry.json()).toEqual({ build: { ...local, name: 'My cloud name' } })
    expect((await handler.fetch(request('GET'))).status).toBe(200)
    expect(JSON.parse(blobs.get('forge-pilot/user_one/local.json') ?? '{}').name).toBe('My cloud name')
  })

  it('rejects malformed classes and origin, and enforces 20 records', async () => {
    expect((await handler.fetch(request('POST', { build: { ...saved('bad'), classId: 'emberville' } }))).status).toBe(400)
    expect((await handler.fetch(request('POST', { build: saved('bad') }, 'user_one', '/api/forge-pilot-builds', 'https://evil.example'))).status).toBe(403)
    for (let index = 0; index < 20; index++) {
      blobs.set(`forge-pilot/user_one/id-${index}.json`, JSON.stringify(saved(`id-${index}`, `talent_${index}.1`)))
    }
    expect((await handler.fetch(request('POST', { build: saved('extra', 'extra_talent.1') }))).status).toBe(409)
    expect(blobs.size).toBe(20)
  })

  it('keeps an over-limit account readable and deletable after concurrent writes', async () => {
    for (let index = 0; index < 23; index++) {
      blobs.set(`forge-pilot/user_one/id-${index}.json`, JSON.stringify(saved(`id-${index}`, `talent_${index}.1`)))
    }
    const listed = await handler.fetch(request('GET'))
    expect(listed.status).toBe(200)
    expect((await listed.json() as { builds: ForgePilotSavedBuild[] }).builds).toHaveLength(23)
    expect(list).toHaveBeenCalledTimes(2)

    expect((await handler.fetch(request('POST', { build: saved('extra', 'extra_talent.1') }))).status).toBe(409)
    expect(blobs.size).toBe(23)
    expect((await handler.fetch(request('DELETE', undefined, 'user_one', '/api/forge-pilot-builds?id=id-22'))).status).toBe(200)
    const remaining = await handler.fetch(request('GET'))
    expect(remaining.status).toBe(200)
    expect((await remaining.json() as { builds: ForgePilotSavedBuild[] }).builds).toHaveLength(22)
  })

  it('renames and removes a build only inside the caller’s account', async () => {
    blobs.set('forge-pilot/user_two/shared.json', JSON.stringify(saved('shared')))
    const missingRename = await handler.fetch(request('PATCH', { id: 'shared', name: 'Other' }))
    expect(missingRename.status).toBe(404)
    await handler.fetch(request('DELETE', undefined, 'user_one', '/api/forge-pilot-builds?id=shared'))
    expect(blobs.has('forge-pilot/user_two/shared.json')).toBe(true)

    await handler.fetch(request('POST', { build: saved('own') }))
    const renamed = await handler.fetch(request('PATCH', { id: 'own', name: 'New name' }))
    expect(renamed.status).toBe(200)
    expect(await renamed.json()).toEqual({ build: { ...saved('own'), name: 'New name' } })
    const removed = await handler.fetch(request('DELETE', undefined, 'user_one', '/api/forge-pilot-builds?id=own'))
    expect(await removed.json()).toEqual({ ok: true })
    expect(blobs.has('forge-pilot/user_one/own.json')).toBe(false)
  })

  it('rejects oversize request bodies even when Content-Length is absent', async () => {
    const body = JSON.stringify({ build: { ...saved('huge'), name: 'x'.repeat(20_000) } })
    const oversized = new Request('https://buildforgetools.com/api/forge-pilot-builds', {
      method: 'POST', headers: { authorization: 'Bearer user_one', origin: 'https://buildforgetools.com', 'content-type': 'application/json' }, body,
    })
    oversized.headers.delete('content-length')
    expect((await handler.fetch(oversized)).status).toBe(413)
    expect(put).not.toHaveBeenCalled()
  })
})
