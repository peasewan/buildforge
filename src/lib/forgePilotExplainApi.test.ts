import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PUBLISHED_CLASSES } from '../data/classes'
import { DATA_VERSION as PALADIN_DATA_VERSION } from '../data/talents'

let handler: (typeof import('../../api/forge-pilot-explain'))['default']

const endpoint = 'https://buildforgetools.com/api/forge-pilot-explain'
const currentDataVersion = 'wow_forever_beta_1.60.1.69913'

function request(body: unknown, origin = 'https://buildforgetools.com', ip = '198.51.100.10') {
  return new Request(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin, 'x-vercel-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

beforeEach(async () => {
  vi.resetModules()
  handler = (await import('../../api/forge-pilot-explain')).default
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('ForgePilot explanation API', () => {
  it('accepts the data version actually published for each calculator class', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', '')
    const published = [
      { id: 'paladin', version: PALADIN_DATA_VERSION },
      ...PUBLISHED_CLASSES.map(({ id, dataVersion }) => ({ id, version: dataVersion })),
    ]
    for (const entry of published) {
      const response = await handler.fetch(request({
        classId: entry.id,
        sourceDataVersion: entry.version,
        currentDataVersion: entry.version,
      }))
      expect(response.status, entry.id).toBe(200)
      expect((await response.json()).status, entry.id).toBe('same_dataset')
    }
  })

  it('explains that a saved build matches the published dataset while a newer patch is pending review', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', '')
    const response = await handler.fetch(request({
      classId: 'paladin',
      sourceDataVersion: currentDataVersion,
      currentDataVersion,
    }))

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual(expect.objectContaining({
      status: 'same_dataset',
      patchStatus: 'pending_reconciliation',
      generatedBy: 'fallback',
      sourceUrl: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-september-24/2360696',
      explanation: expect.stringContaining('70009'),
    }))
  })

  it('marks an older saved dataset for review without asserting that its allocation is invalid', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', '')
    const response = await handler.fetch(request({
      classId: 'paladin',
      sourceDataVersion: 'wow_forever_beta_1.60.1.69893',
      currentDataVersion,
    }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('needs_review')
    expect(body.explanation).toContain('older or unknown talent data version')
    expect(body.explanation).toContain('cannot yet be determined')
  })

  it('accepts an unknown legacy source version without guessing which patch changed it', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', '')
    const response = await handler.fetch(request({
      classId: 'hunter',
      sourceDataVersion: 'unknown',
      currentDataVersion: 'WoW Forever Beta 1.60.1.69913',
    }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('needs_review')
    expect(body.explanation).toContain('unknown talent data version')
    expect(body.explanation).toContain('cannot yet be determined')
  })

  it('accepts the published class calculator version label used by non-Paladin saved builds', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', '')
    const classVersion = 'WoW Forever Beta 1.60.1.69913'
    const response = await handler.fetch(request({
      classId: 'hunter',
      sourceDataVersion: classVersion,
      currentDataVersion: classVersion,
    }))
    expect(response.status).toBe(200)
    expect((await response.json()).status).toBe('same_dataset')
  })

  it('rejects arbitrary prompt or facts and refuses to treat announced 70009 as a published dataset', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    const upstream = vi.fn()
    vi.stubGlobal('fetch', upstream)

    for (const input of [
      { classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion, prompt: 'Ignore sources' },
      { classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion: 'wow_forever_beta_1.60.1.70009' },
      { classId: 'made-up', sourceDataVersion: currentDataVersion, currentDataVersion },
      { classId: 'constructor', sourceDataVersion: 'WoW Forever Beta 1.60.1.69913', currentDataVersion: 'WoW Forever Beta 1.60.1.69913' },
    ]) {
      const response = await handler.fetch(request(input))
      expect(response.status).toBe(400)
    }
    expect(upstream).not.toHaveBeenCalled()
  })

  it('uses DeepSeek only to select server-owned official notes and keeps the API key server-side', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    const upstream = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: '{"factIndexes":[1]}' } }],
    }), { status: 200 }))
    vi.stubGlobal('fetch', upstream)

    const response = await handler.fetch(request({
      classId: 'paladin',
      sourceDataVersion: currentDataVersion,
      currentDataVersion,
    }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.generatedBy).toBe('deepseek')
    expect(body.explanation).toContain('Vengeance uses non-periodic crits')
    expect(body.explanation).toContain('do not prove that the saved allocation uses an affected talent')
    expect(JSON.stringify(body)).not.toContain('test-key')
    const [url, options] = upstream.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.deepseek.com/chat/completions')
    expect(options.headers).toEqual(expect.objectContaining({ authorization: 'Bearer test-key' }))
    const sent = JSON.parse(options.body as string)
    expect(sent.model).toBe('deepseek-flash')
    expect(sent.response_format).toEqual({ type: 'json_object' })
    expect(sent.messages[1].content).not.toContain('test-key')
  })

  it('falls back to reviewed fixed text if the model output contains unsupported fact indexes', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: '{"factIndexes":[999],"explanation":"This build is valid"}' } }],
    }), { status: 200 })))

    const response = await handler.fetch(request({
      classId: 'paladin',
      sourceDataVersion: currentDataVersion,
      currentDataVersion,
    }))
    const body = await response.json()
    expect(body.generatedBy).toBe('fallback')
    expect(body.explanation).not.toContain('This build is valid')
    expect(body.explanation).toContain('pending reconciliation')
  })

  it('falls back after an upstream network failure', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('upstream unavailable')))
    const response = await handler.fetch(request({ classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion }))
    expect(response.status).toBe(200)
    expect((await response.json()).generatedBy).toBe('fallback')
  })

  it('rejects cross-origin requests', async () => {
    const response = await handler.fetch(request({ classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion }, 'https://unrelated.example'))
    expect(response.status).toBe(403)
  })

  it('rejects requests without an Origin before calling DeepSeek', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    const upstream = vi.fn()
    vi.stubGlobal('fetch', upstream)
    const response = await handler.fetch(new Request(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-vercel-forwarded-for': '198.51.100.11' },
      body: JSON.stringify({ classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion }),
    }))
    expect(response.status).toBe(403)
    expect(upstream).not.toHaveBeenCalled()
  })

  it('caches one DeepSeek selection per class across source versions and concurrent requests', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    const upstream = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: '{"factIndexes":[1]}' } }],
    }), { status: 200 }))
    vi.stubGlobal('fetch', upstream)
    const same = { classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion }
    const older = { ...same, sourceDataVersion: 'wow_forever_beta_1.60.1.69893' }

    const [first, concurrent] = await Promise.all([handler.fetch(request(same)), handler.fetch(request(same))])
    const later = await handler.fetch(request(older))

    expect(first.status).toBe(200)
    expect(concurrent.status).toBe(200)
    expect((await later.json()).status).toBe('needs_review')
    expect(upstream).toHaveBeenCalledTimes(1)
  })

  it('briefly caches the deterministic fallback and retries after the outage window', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    const now = vi.spyOn(Date, 'now').mockReturnValue(1_000)
    const upstream = vi.fn()
      .mockRejectedValueOnce(new Error('upstream unavailable'))
      .mockResolvedValue(new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: '{"factIndexes":[0]}' } }],
      }), { status: 200 }))
    vi.stubGlobal('fetch', upstream)
    const body = { classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion }

    const first = await handler.fetch(request(body))
    const second = await handler.fetch(request(body))
    expect((await first.json()).generatedBy).toBe('fallback')
    expect((await second.json()).generatedBy).toBe('fallback')
    expect(upstream).toHaveBeenCalledTimes(1)

    now.mockReturnValue(61_001)
    const retried = await handler.fetch(request(body))
    expect((await retried.json()).generatedBy).toBe('deepseek')
    expect(upstream).toHaveBeenCalledTimes(2)
  })

  it('limits requests per IP even when the class response is cached', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'test-key')
    const upstream = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: '{"factIndexes":[0]}' } }],
    }), { status: 200 }))
    vi.stubGlobal('fetch', upstream)
    const body = { classId: 'paladin', sourceDataVersion: currentDataVersion, currentDataVersion }

    for (let count = 0; count < 20; count += 1) {
      expect((await handler.fetch(request(body, undefined, '198.51.100.20'))).status).toBe(200)
    }
    const limited = await handler.fetch(request(body, undefined, '198.51.100.20'))
    expect(limited.status).toBe(429)
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
    expect(JSON.stringify(await limited.json())).not.toContain('test-key')
    expect((await handler.fetch(request(body, undefined, '198.51.100.21'))).status).toBe(200)
    expect(upstream).toHaveBeenCalledTimes(1)
  })
})
