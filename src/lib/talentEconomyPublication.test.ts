import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pageForPath } from './routes'

const path = '/wow-forever-respec-cost-calculator'
describe('Talent Economy publication', () => {
  it('serves one dedicated canonical tool for respec, reset and dual-spec budgeting', () => {
    expect(pageForPath(path)).toMatchObject({
      kind: 'talent-economy',
      title: 'WoW Forever Respec & Dual Spec Cost Calculator | BuildForgeTools',
      canonical: `https://buildforgetools.com${path}`,
      robots: 'index, follow',
    })
  })
  it('publishes matching static metadata, a Vite entry and a dedicated rewrite', () => {
    const html = readFileSync(`.${path}/index.html`, 'utf8')
    const document = new DOMParser().parseFromString(html, 'text/html')
    const route = pageForPath(path)
    expect(document.title).toBe(route.title)
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(route.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(route.canonical)
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(route.canonical)
    expect(html).toContain('<!-- PAGES_PRERENDER -->')
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    expect(config.rewrites).toContainEqual({source:path,destination:`${path}/index.html`})
    expect(readFileSync('vite.config.ts','utf8')).toContain("'wow-forever-respec-cost-calculator/index.html'")
    const sitemap = readFileSync('public/sitemap.xml','utf8')
    expect(sitemap.split(`<loc>${route.canonical}</loc>`)).toHaveLength(2)
  })
})
