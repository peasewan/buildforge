import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AppRoute from '../AppRoute'
import { GLIMMERWICK_LAUNCH_PAGES } from '../data/glimmerwickLaunchPages'
import { pageForPath } from './routes'

const documentFor = (html: string) => new DOMParser().parseFromString(html, 'text/html')

describe('Glimmerwick launch pages', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
  const sitemap = documentFor(readFileSync('public/sitemap.xml', 'utf8'))

  it.each(GLIMMERWICK_LAUNCH_PAGES)('$path has a unique static shell, route, and sitemap entry', page => {
    const canonical = `https://buildforgetools.com${page.path}`
    expect(pageForPath(page.path)).toMatchObject({
      kind: 'glimmerwick-launch', title: page.title, description: page.description,
      canonical, robots: 'index, follow', glimmerwickLaunchPageId: page.id,
    })
    expect(pageForPath(`${page.path}/`).canonical).toBe(canonical)

    const shell = documentFor(readFileSync(`${process.cwd()}${page.path}/index.html`, 'utf8'))
    expect(shell.title).toBe(page.title)
    expect(shell.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description)
    expect(shell.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow')
    expect(shell.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical)
    expect(shell.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonical)
    expect(config.rewrites).toContainEqual({ source: page.path, destination: `${page.path}/index.html` })
    expect([...sitemap.querySelectorAll('loc')].filter(loc => loc.textContent === canonical)).toHaveLength(1)

    const rendered = documentFor(renderToStaticMarkup(<AppRoute pathname={page.path} />))
    expect(rendered.querySelectorAll('h1')).toHaveLength(1)
    expect(rendered.querySelector(`[data-surface="${page.surface}"]`)).not.toBeNull()
    expect(rendered.querySelector('a[href="/songs-of-glimmerwick"]')).not.toBeNull()
    expect(rendered.querySelector('.feedback-trigger-inline')).not.toBeNull()
  })

  it('links all launch pages from the home page and garden planner', () => {
    const home = documentFor(renderToStaticMarkup(<AppRoute pathname="/" />))
    const garden = documentFor(renderToStaticMarkup(<AppRoute pathname="/songs-of-glimmerwick" />))
    for (const page of GLIMMERWICK_LAUNCH_PAGES) {
      expect(home.querySelector(`.sd-glimmerwick a[href="${page.path}"]`)).not.toBeNull()
      expect(garden.querySelector(`.gw-launch-links a[href="${page.path}"]`)).not.toBeNull()
    }
  })
})
