import { existsSync, readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AppRoute from '../AppRoute'
import { pageForPath } from './routes'
import { transformAnalyticsHtml } from './analyticsBootstrap'

const pathname = '/songs-of-glimmerwick'
const canonical = 'https://buildforgetools.com/songs-of-glimmerwick'
const title = 'Songs of Glimmerwick Garden Planner | BuildForgeTools'
const description = 'Plan your Songs of Glimmerwick garden with your own crop timings. Track planting days, estimate harvests, save notes, and export your plan.'

const documentFor = (html: string) => new DOMParser().parseFromString(html, 'text/html')

describe('Glimmerwick garden tool publishing', () => {
  it.each([pathname, `${pathname}/`])('serves %s independently from the WoW calculator fallback', path => {
    expect(pageForPath(path, '?utm_source=search')).toMatchObject({
      kind: 'glimmerwick', title, description, canonical, robots: 'index, follow',
    })
  })

  it('ships a self-canonical static shell with the existing production-only analytics bootstrap', () => {
    const file = `${process.cwd()}/songs-of-glimmerwick/index.html`
    expect(existsSync(file), 'the tool must have an HTML entry').toBe(true)
    const template = readFileSync(file, 'utf8')
    const doc = documentFor(template)
    expect(doc.title).toBe(title)
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(description)
    expect(doc.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(title)
    expect(doc.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(description)
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical)
    expect(doc.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonical)
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow')
    expect(template).toContain('<!-- PAGES_PRERENDER -->')
    expect(transformAnalyticsHtml(template)).toContain('window.location.hostname')
  })

  it('exposes the clean URL in deployment routing and the canonical sitemap once', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    expect(config.rewrites).toContainEqual({ source: pathname, destination: '/songs-of-glimmerwick/index.html' })
    const sitemap = new DOMParser().parseFromString(readFileSync('public/sitemap.xml', 'utf8'), 'application/xml')
    const entries = [...sitemap.querySelectorAll('url')].filter(url => url.querySelector('loc')?.textContent === canonical)
    expect(entries).toHaveLength(1)
  })

  it('gives home visitors a garden tool without replacing existing game entrances', () => {
    const doc = documentFor(renderToStaticMarkup(<AppRoute pathname="/" />))
    const card = doc.querySelector('.sd-games .sd-glimmerwick')
    expect(card).not.toBeNull()
    expect(card!.querySelector('h2')?.textContent).toBe('Songs of Glimmerwick')
    expect(card!.querySelector(`a[href="${pathname}"]`)?.textContent).toContain('Open the garden planner')
    expect(doc.querySelector('.sd-wow a[href="/paladin"]')).not.toBeNull()
    expect(doc.querySelector('.sd-ember a[href="/emberville"]')).not.toBeNull()
  })

  it('prerenders the actual garden module with one H1 rather than a WoW tree', () => {
    const doc = documentFor(renderToStaticMarkup(<AppRoute pathname={pathname} />))
    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(doc.querySelector('h1')?.textContent).toBe('Songs of Glimmerwick Garden Planner')
    expect(doc.querySelector('[data-surface="glimmerwick-garden"]')).not.toBeNull()
    expect(doc.querySelector('[data-intent-calculator="true"]')).toBeNull()
  })
})
