import { readFileSync } from 'node:fs'
import { parseSitemap } from '../../scripts/seo/validate'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { pageForPath } from './routes'
import AppRoute from '../AppRoute'
import { INVOKYR_PAGES } from '../data/invokyr'
import config from '../../vercel.json'

describe('Invokyr publishing', () => {
  for (const page of INVOKYR_PAGES) it(`publishes ${page.path} with discoverable static content`, () => {
    expect(pageForPath(page.path)).toMatchObject({ kind: 'invokyr', title: page.title, canonical: `https://buildforgetools.com${page.path}`, robots: 'index, follow' })
    const doc = new DOMParser().parseFromString(readFileSync(`${process.cwd()}${page.path}/index.html`, 'utf8'), 'text/html')
    expect(doc.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(`https://buildforgetools.com${page.path}`)
    const rendered = new DOMParser().parseFromString(renderToStaticMarkup(<AppRoute pathname={page.path}/>), 'text/html')
    expect(rendered.querySelectorAll('h1')).toHaveLength(1)
    expect(rendered.querySelector('h1')?.textContent).toBe(page.h1)
    expect(config.rewrites).toContainEqual({ source: page.path, destination: `${page.path}/index.html` })
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain(`<loc>https://buildforgetools.com${page.path}</loc>`)
    expect(rendered.querySelector('a[href="/privacy"]')).toBeTruthy()
  })
  it('links from the homepage and does not publish empty lookup routes', () => {
    const home = renderToStaticMarkup(<AppRoute pathname="/"/>)
    expect(home).toContain('href="/invokyr"')
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    expect(sitemap).not.toContain('/invokyr-dice')
    expect(sitemap).not.toContain('/invokyr-monsters')
  })
  it('publishes the ending answer on the companion and retires the thin ending route', () => {
    const rendered = new DOMParser().parseFromString(renderToStaticMarkup(<AppRoute pathname="/invokyr"/>), 'text/html')
    expect(rendered.querySelector('[data-surface="invokyr-ending"]')?.textContent).toContain('Carry the board game into the end room')
    expect(rendered.querySelector('a[href="/invokyr-how-to-win"]')).toBeNull()
    expect(config.redirects).toContainEqual({ source: '/invokyr-how-to-win', destination: '/invokyr', statusCode: 301 })
    expect(config.rewrites.some(rule => rule.source === '/invokyr-how-to-win')).toBe(false)
    expect(readFileSync('public/sitemap.xml', 'utf8')).not.toContain('<loc>https://buildforgetools.com/invokyr-how-to-win</loc>')
    expect(parseSitemap(readFileSync('public/sitemap.xml', 'utf8')).find((row) => row.url === 'https://buildforgetools.com/invokyr')?.lastmod).toBe('2026-10-08')
  })
})
