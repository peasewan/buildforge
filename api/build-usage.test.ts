import { beforeEach, describe, expect, it, vi } from 'vitest'
import { encodeBuild } from '../src/lib/build'
import { HOLY_HEALING_BUILD } from '../src/data/builds'

const { put } = vi.hoisted(() => ({ put: vi.fn() }))
vi.mock('@vercel/blob', () => ({ put }))

import handler from './build-usage'

describe('build usage API', () => {
  beforeEach(() => {
    put.mockReset()
    put.mockResolvedValue({})
  })

  it('stores one private aggregate-safe record at a deduplicated pathname', async () => {
    const response = await handler.fetch(new Request('https://buildforgetools.com/api/build-usage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://buildforgetools.com',
      },
      body: JSON.stringify({
        buildCode: encodeBuild(HOLY_HEALING_BUILD.build),
        sessionId: '7fd4f59b-74bf-46c5-95ec-b46f7f578a11',
      }),
    }))

    expect(response.status).toBe(201)
    expect(put).toHaveBeenCalledTimes(1)
    const [pathname, rawBody, options] = put.mock.calls[0]
    expect(pathname).toMatch(/^build-usage\/\d{4}-\d{2}-\d{2}\/7fd4f59b-74bf-46c5-95ec-b46f7f578a11-[a-f0-9]{8}\.json$/)
    expect(JSON.parse(rawBody)).toEqual(expect.objectContaining({
      schemaVersion: 1,
      event: 'build_shared',
      points: 51,
      branch: 'holy',
    }))
    expect(options).toEqual(expect.objectContaining({
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
    }))
  })

  it('rejects invalid allocations before storage', async () => {
    const response = await handler.fetch(new Request('https://buildforgetools.com/api/build-usage', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://buildforgetools.com' },
      body: JSON.stringify({
        buildCode: 'holy_shock.1',
        sessionId: '7fd4f59b-74bf-46c5-95ec-b46f7f578a11',
      }),
    }))

    expect(response.status).toBe(400)
    expect(put).not.toHaveBeenCalled()
  })
})
