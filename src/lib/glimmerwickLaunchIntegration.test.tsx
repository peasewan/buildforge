import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AppRoute from '../AppRoute'
import { GLIMMERWICK_LAUNCH_PAGES } from '../data/glimmerwickLaunchPages'
import { pageForPath } from './routes'

const documentFor = (html: string) => new DOMParser().parseFromString(html, 'text/html')
afterEach(() => { cleanup(); localStorage.clear(); history.replaceState({}, '', '/') })

describe('Glimmerwick launch pages', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
  const sitemap = documentFor(readFileSync('public/sitemap.xml', 'utf8'))

  it.each(GLIMMERWICK_LAUNCH_PAGES.filter(page => page.id === 'garden-well'))('$path retains its live static shell, route, and sitemap entry', page => {
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

  it.each(GLIMMERWICK_LAUNCH_PAGES.filter(page => page.id !== 'garden-well'))('$path consolidates into the main garden page without another indexed entry', page => {
    expect(pageForPath(page.path)).toMatchObject({ kind: 'glimmerwick', canonical: 'https://buildforgetools.com/songs-of-glimmerwick', robots: 'index, follow' })
    expect(pageForPath(`${page.path}/`)).toEqual(pageForPath('/songs-of-glimmerwick'))
    const redirect = config.redirects.find((entry: { source: string }) => entry.source === page.path)
    expect(redirect?.destination).toBe('/songs-of-glimmerwick')
    expect(redirect?.permanent || [301, 308].includes(redirect?.statusCode)).toBe(true)
    expect(config.rewrites.some((entry: { source: string }) => entry.source === page.path)).toBe(false)
    expect([...sitemap.querySelectorAll('loc')].map(loc => loc.textContent)).not.toContain(`https://buildforgetools.com${page.path}`)
  })

  it('links embedded helpers and the retained Garden Well from home and the garden planner', () => {
    const home = documentFor(renderToStaticMarkup(<AppRoute pathname="/" />))
    const garden = documentFor(renderToStaticMarkup(<AppRoute pathname="/songs-of-glimmerwick" />))
    for (const page of GLIMMERWICK_LAUNCH_PAGES) {
      const homeHref = page.id === 'garden-well' ? page.path : `/songs-of-glimmerwick#${page.id}`
      const gardenHref = page.id === 'garden-well' ? page.path : `#${page.id}`
      expect(home.querySelector(`.sd-glimmerwick a[href="${homeHref}"]`)).not.toBeNull()
      expect(garden.querySelector(`.gw-launch-links a[href="${gardenHref}"]`)).not.toBeNull()
      if (page.id !== 'garden-well') expect(garden.getElementById(page.id)).not.toBeNull()
    }
  })

  it('opens each original helper inside the public main route with only one page shell', () => {
    history.replaceState({}, '', '/songs-of-glimmerwick')
    const view = render(<AppRoute pathname="/songs-of-glimmerwick" />)
    fireEvent.click(screen.getByText('First Days Checklist', { selector: 'summary' }))
    expect(view.container.querySelector('[data-surface="glimmerwick-first-days"]')).not.toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Collected Flute' }))
    expect(screen.getByText('1 of 5 supplies ready')).toBeTruthy()
    fireEvent.click(screen.getByText('Spellcasting Basics', { selector: 'summary' }))
    expect(view.container.querySelector('[data-surface="glimmerwick-spellcasting"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'No practice version' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Collected Flute' })).toBeNull()
    expect(view.container.querySelectorAll('h1')).toHaveLength(1)
    expect(view.container.querySelectorAll('main')).toHaveLength(1)
    expect(view.container.querySelectorAll('footer')).toHaveLength(1)
  })
})
