import { describe, expect, it } from 'vitest'
import handler from './retired-page'

describe('retired resources', () => {
  it.each(['GET', 'HEAD'])('returns an actual gone response for %s, with no advertising or analytics', method => {
    let body: string | undefined
    const headers: Record<string, string> = {}
    const res = { statusCode: 200, setHeader: (name: string, value: string) => { headers[name] = value }, end: (value?: string) => { body = value } }
    handler({ method }, res)
    expect(res.statusCode).toBe(410)
    expect(headers['X-Robots-Tag']).toBe('noindex, follow')
    expect(body ?? '').not.toMatch(/<script|adsbygoogle|googletagmanager/)
    if (method === 'HEAD') expect(body).toBeUndefined()
  })
})
