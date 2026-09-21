import { describe, expect, it, vi } from 'vitest'
import * as analytics from './analytics'

describe('shared-build usage reporting', () => {
  it('posts the build only after a successful share action', async () => {
    const reportSharedBuild = (analytics as unknown as {
      reportSharedBuild: (
        buildCode: string,
        dependencies: { fetch: typeof fetch; storage: Storage; randomUUID: () => string },
      ) => Promise<boolean>
    }).reportSharedBuild
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }))
    const storage = new Map<string, string>()
    const sessionStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
    } as Storage

    expect(typeof reportSharedBuild).toBe('function')
    await expect(reportSharedBuild('focus.2~root.5', {
      fetch: request,
      storage: sessionStorage,
      randomUUID: () => '7fd4f59b-74bf-46c5-95ec-b46f7f578a11',
    })).resolves.toBe(true)
    expect(request).toHaveBeenCalledWith('/api/build-usage', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        buildCode: 'focus.2~root.5',
        sessionId: '7fd4f59b-74bf-46c5-95ec-b46f7f578a11',
      }),
    }))
  })

  it('reuses the anonymous session id and treats network failures as non-blocking', async () => {
    const request = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockRejectedValueOnce(new Error('offline'))
    const storage = new Map<string, string>()
    const sessionStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
    } as Storage
    const randomUUID = vi.fn(() => '7fd4f59b-74bf-46c5-95ec-b46f7f578a11')
    const dependencies = { fetch: request, storage: sessionStorage, randomUUID }

    await expect(analytics.reportSharedBuild('focus.2~root.5', dependencies)).resolves.toBe(true)
    await expect(analytics.reportSharedBuild('focus.2~root.5', dependencies)).resolves.toBe(false)
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })
})
