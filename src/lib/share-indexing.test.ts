import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('shared build indexing policy', () => {
  it('sends a crawler-level noindex header for /build URLs', () => {
    const config = JSON.parse(readFileSync(`${process.cwd()}/vercel.json`, 'utf8'))
    const buildHeaders = config.headers.find((rule: { source: string }) => rule.source === '/build')

    expect(buildHeaders).toBeTruthy()
    expect(buildHeaders.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex, follow' })
  })
})
