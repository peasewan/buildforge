import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { PAGE_CONSOLIDATIONS, REMOVED_PAGE_PATHS } from '../data/pageConsolidations'
import { isRemovedPage, resolvePageHref } from './pageRetirement'
import { pageForPath } from './routes'

describe('reviewed retirement contracts', () => {
  it('removes 58 old publication shells while retaining real destination pages', () => {
    expect(Object.keys(PAGE_CONSOLIDATIONS)).toHaveLength(55)
    expect(REMOVED_PAGE_PATHS).toHaveLength(3)
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    expect(sitemap.match(/<loc>/g)).toHaveLength(87)
    expect(sitemap).toContain('<loc>https://buildforgetools.com/wow-forever-respec-cost-calculator</loc>')
    for (const path of [...Object.keys(PAGE_CONSOLIDATIONS), ...REMOVED_PAGE_PATHS]) {
      expect(existsSync(`.${path}/index.html`), path).toBe(false)
      expect(sitemap, path).not.toContain(`<loc>https://buildforgetools.com${path}</loc>`)
    }
    for (const [source, destination] of Object.entries(PAGE_CONSOLIDATIONS)) {
      expect(resolvePageHref(source)).toBe(destination)
      expect(PAGE_CONSOLIDATIONS[destination]).toBeUndefined()
      expect(existsSync(`.${destination}/index.html`), destination).toBe(true)
      expect(pageForPath(source).canonical).toBe(`https://buildforgetools.com${destination}`)
    }
  })
  it('returns deliberate gone metadata instead of the Paladin fallback for discontinued screens', () => {
    for (const path of REMOVED_PAGE_PATHS) {
      expect(isRemovedPage(path)).toBe(true)
      expect(pageForPath(path)).toMatchObject({ kind: 'retired', robots: 'noindex, follow' })
    }
  })
  it('keeps shared builds, source URLs and retained query strings intact', () => {
    expect(resolvePageHref('/build?id=unchanged&level=30#calculator')).toBe('/build?id=unchanged&level=30#calculator')
    expect(resolvePageHref('https://example.com/source#proof')).toBe('https://example.com/source#proof')
    expect(resolvePageHref('/wow-forever-mage-leveling-build?from=old')).toBe('/wow-forever-mage-builds?from=old')
  })
  it('serves permanent redirects and real 410 endpoints for clean and index aliases', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))
    for (const [path, destination] of Object.entries(PAGE_CONSOLIDATIONS)) for (const suffix of ['', '/index.html']) {
      const rule = vercel.redirects.find((r: {source:string}) => r.source === path+suffix)
      expect(rule, path+suffix).toBeTruthy()
      expect(rule.destination).toBe(destination)
      expect(rule.permanent === true || rule.statusCode === 301).toBe(true)
    }
    for (const path of REMOVED_PAGE_PATHS) for (const suffix of ['', '/index.html']) {
      expect(vercel.rewrites).toContainEqual({ source: path+suffix, destination: '/api/retired-page' })
      expect(vercel.redirects.some((r: {source:string}) => r.source === path+suffix)).toBe(false)
    }
  })
})
