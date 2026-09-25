import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AppRoute from './AppRoute'
import { DISCOVERY_PAGES } from './data/siteDiscovery'
import { PUBLISHED_CLASSES } from './data/classes'
import { pageForPath } from './lib/routes'

describe('discovery rendering and artifacts', () => {
  it('links directly to the Paladin calculator and builds from the first WoW card', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<AppRoute pathname="/" />), 'text/html')
    const wowCard = doc.querySelector('.sd-games .sd-wow')
    expect(wowCard).not.toBeNull()
    const featured = wowCard!.querySelector('nav[aria-label="Featured Paladin tools"]')
    expect(featured).not.toBeNull()
    expect(featured!.querySelector('a[href="/paladin"]')?.textContent).toContain('WoW Forever Paladin Talent Calculator')
    expect(featured!.querySelector('a[href="/wow-forever-paladin-builds"]')?.textContent).toContain('Paladin Builds')
    expect(featured!.compareDocumentPosition(wowCard!.querySelector('.sd-primary')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
  it('places a contextual Paladin builds hub link before the playstyle directory', () => {
    const doc = new DOMParser().parseFromString(renderToStaticMarkup(<AppRoute pathname="/wow-forever-builds" />), 'text/html')
    const featured = doc.querySelector('.sd-paladin-hub a[href="/wow-forever-paladin-builds"]')
    const intentNav = doc.querySelector('.sd-intent-nav')
    expect(featured?.textContent).toContain('Paladin Builds')
    expect(featured?.compareDocumentPosition(intentNav!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
  it('dates the edited discovery pages while retaining the classes date', () => {
    const sitemap = new DOMParser().parseFromString(readFileSync('public/sitemap.xml', 'utf8'), 'application/xml')
    const date = (path: string) => [...sitemap.querySelectorAll('url')].find(url => url.querySelector('loc')?.textContent === `https://buildforgetools.com${path}`)?.querySelector('lastmod')?.textContent
    expect(date('/')).toBe('2026-09-25')
    expect(date('/wow-forever-builds')).toBe('2026-09-25')
    expect(date('/wow-forever-classes')).toBe('2026-09-23')
  })
  it.each(DISCOVERY_PAGES)('serves $path with matching shell and browser metadata', page => {
    const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}/index.html`
    const shell = new DOMParser().parseFromString(readFileSync(file, 'utf8'), 'text/html')
    expect(shell.title).toBe(page.title)
    expect(shell.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description)
    expect(shell.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(pageForPath(page.path).canonical)
    const html = renderToStaticMarkup(<AppRoute pathname={page.path} />)
    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(doc.querySelector('h1')?.textContent).toBe(page.h1)
    for (const link of doc.querySelectorAll('a[href^="#"]')) expect(doc.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull()
  })
  it('removes only the root redirect and ships both directory rewrites', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    expect(config.redirects.some((r: { source: string }) => r.source === '/')).toBe(false)
    for (const page of DISCOVERY_PAGES.filter(p => p.path !== '/')) expect(config.rewrites).toContainEqual({ source: page.path, destination: `${page.path}/index.html` })
  })
  it.each(PUBLISHED_CLASSES)('groups $name before search and exposes site discovery on all class routes', def => {
    const hub = def.pages.find(p => p.kind === 'buildsHub')!
    const html = renderToStaticMarkup(<AppRoute pathname={`/${hub.slug}`} />)
    expect(html.indexOf('Choose a specialization')).toBeLessThan(html.indexOf('Find a route'))
    expect(html.indexOf('Choose a playstyle')).toBeLessThan(html.indexOf('Find a route'))
    for (const p of def.pages) {
      if (pageForPath(`/${p.slug}`).classId !== def.id) continue
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<AppRoute pathname={`/${p.slug}`} />), 'text/html')
      expect(doc.querySelector('a[href="/wow-forever-classes"]')).not.toBeNull()
      expect(doc.querySelector('a[href="/wow-forever-builds"]')).not.toBeNull()
    }
  })
})
