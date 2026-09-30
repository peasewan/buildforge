import { afterEach, describe, expect, it, vi } from 'vitest'
import { createForgePilotSavedBuild } from './forgePilot'
import { createForgePilotCloudClient } from './forgePilotCloudClient'

const savedResult = createForgePilotSavedBuild({
  id: 'local-one', name: 'My build', classId: 'paladin',
  dataVersion: 'wow_forever_beta_1.60.1.69913', shareInput: 'divine_intellect.1',
  savedAt: '2026-09-29T00:00:00.000Z',
})
if (!savedResult.ok) throw new Error('Fixture did not create a build')
const saved = savedResult.build

afterEach(() => vi.unstubAllGlobals())

describe('ForgePilot cloud client', () => {
  it('never sends an unauthenticated request when the session has no token', async () => {
    const fetcher = vi.fn()
    const client = createForgePilotCloudClient(async () => null, fetcher)

    await expect(client.list()).rejects.toThrow('Sign in to use cloud saves.')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('uses the current session token for cloud CRUD and sends only the requested build', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ builds: [saved] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ build: saved }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ build: { ...saved, name: 'Renamed' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    const client = createForgePilotCloudClient(async () => 'session-token', fetcher)

    expect(await client.list()).toEqual([saved])
    expect(await client.save(saved)).toEqual(saved)
    expect(await client.rename(saved.id, 'Renamed')).toEqual({ ...saved, name: 'Renamed' })
    await expect(client.remove(saved.id)).resolves.toBeUndefined()
    expect(fetcher).toHaveBeenCalledTimes(4)
    const [listUrl, listOptions] = fetcher.mock.calls[0]
    expect(listUrl).toBe('/api/forge-pilot-builds')
    expect(listOptions.headers.Authorization).toBe('Bearer session-token')
    const [saveUrl, saveOptions] = fetcher.mock.calls[1]
    expect(saveUrl).toBe('/api/forge-pilot-builds')
    expect(saveOptions.method).toBe('POST')
    expect(JSON.parse(saveOptions.body)).toEqual({ build: saved })
    const [, renameOptions] = fetcher.mock.calls[2]
    expect(renameOptions.method).toBe('PATCH')
    expect(JSON.parse(renameOptions.body)).toEqual({ id: saved.id, name: 'Renamed' })
    const [removeUrl, removeOptions] = fetcher.mock.calls[3]
    expect(removeUrl).toBe(`/api/forge-pilot-builds?id=${encodeURIComponent(saved.id)}`)
    expect(removeOptions.method).toBe('DELETE')
  })

  it('tags requests with the account that initiated them', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ builds: [] }), { status: 200 }))
    const client = createForgePilotCloudClient(async () => 'session-token', fetcher, 'user_one')
    await client.list()
    expect(fetcher.mock.calls[0][1].headers['X-ForgePilot-User']).toBe('user_one')
  })

  it('rejects a failed response without treating local data as synced', async () => {
    const client = createForgePilotCloudClient(async () => 'session-token',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'storage_unavailable' }), { status: 503 })))

    await expect(client.save(saved)).rejects.toThrow('Cloud saves are unavailable. Your local builds are still here.')
  })

  it('explains the cloud cap so a player can remove a record and retry', async () => {
    const client = createForgePilotCloudClient(async () => 'session-token',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Cloud save limit reached.' }), { status: 409 })))

    await expect(client.save(saved)).rejects.toThrow('Your account has 20 saved builds. Remove one before saving another.')
  })

  it('lets a player list and remove records if concurrent writes exceeded the nominal cap', async () => {
    const records = Array.from({ length: 21 }, (_, index) => ({ ...saved, id: `build-${index}` }))
    const client = createForgePilotCloudClient(async () => 'session-token',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ builds: records }), { status: 200 })))

    expect(await client.list()).toHaveLength(21)
  })
})
