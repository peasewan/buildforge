import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BuildLandingPage from './BuildLandingPage'
import { HOLY_HEALING_BUILD } from './data/builds'
import { encodeBuild, validateBuildUsage } from './lib/build'
import { talents } from './data/talents'

afterEach(cleanup)

describe('Build landing page template', () => {
  it('renders the Leveling content from configuration', () => {
    render(<BuildLandingPage pageId="leveling" />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Leveling Build' })).toBeTruthy()
    expect(screen.getByText('New Players')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Recommended Leveling Path' })).toBeTruthy()
    expect(screen.getByText('Beta Week 1 · Level cap 20')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
    const snapshot = screen.getByRole('region', { name: 'Beta leveling snapshot' })
    expect(snapshot.textContent).toContain('Current Beta cap')
    expect(snapshot.textContent).toContain('Level 20 · 11 points')
    expect(snapshot.textContent).toContain('Level 30 plan')
    expect(snapshot.textContent).toContain('0/0/21')
    expect(snapshot.textContent).toContain('Client verified')
    expect(snapshot.textContent).toContain('Community recommendation')
  })

  it('shows the Protection level 20 and level 30 paths on the existing leveling page', () => {
    render(<BuildLandingPage pageId="protection-leveling" />)

    const snapshot = screen.getByRole('region', { name: 'Beta leveling snapshot' })
    expect(snapshot.textContent).toContain('2/9/0')
    expect(snapshot.textContent).toContain('2/19/0')
    expect(snapshot.textContent).toContain('Archived')
    expect(snapshot.textContent).toContain('Improved Holy Strike')
    expect(snapshot.querySelector('a[href*="improved_holy_strike"]')).toBeNull()
    expect(snapshot.querySelector('a[href="/build?id=#calculator"]')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe('/build?id=#calculator')
  })

  it('presents the retired Protection route as history and starts a blank replacement plan', () => {
    render(<BuildLandingPage pageId="protection-leveling" />)

    const hero = document.querySelector('.landing-hero')!
    expect(hero.textContent).toMatch(/archived/i)
    expect(hero.textContent).toMatch(/no replacement/i)
    expect(hero.textContent).toMatch(/Status\s*Archived/i)
    expect(screen.getByRole('heading', { level: 2, name: 'What to Do After the Route Was Archived' })).toBeTruthy()
    for (const link of screen.getAllByRole('link', { name: /start a blank calculator/i })) {
      expect(link.getAttribute('href')).toBe('/build?id=#calculator')
    }
  })

  it('reuses the Protection talent tree on the dungeon page', () => {
    render(<BuildLandingPage pageId="protection-dungeon" />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Protection Paladin Dungeon Tank Build' })).toBeTruthy()
    expect(screen.getByLabelText('Protection talent tree')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Edit this build/ }).getAttribute('href')).toMatch(/^\/build\?id=/)
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
  })

  it('embeds the build each page declares instead of always the Protection tree', () => {
    render(<BuildLandingPage pageId="retribution-pvp" />)

    expect(screen.getByLabelText('Retribution talent tree')).toBeTruthy()
    expect(screen.queryByLabelText('Protection talent tree')).toBeNull()
  })

  it('deep-links a page to the allocation its copy tells readers to start from', () => {
    render(<BuildLandingPage pageId="holy-pvp" />)

    const expected = `/build?id=${encodeBuild(HOLY_HEALING_BUILD.build)}#calculator`

    expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe(expected)
    for (const link of screen.getAllByRole('link', { name: /Open Talent Calculator/i })) {
      expect(link.getAttribute('href')).toBe(expected)
    }
  })

  it('offers no talent tree link on a page that renders no tree', () => {
    render(<BuildLandingPage pageId="holy-pvp" />)

    expect(screen.queryByRole('link', { name: /View Talent Tree/i })).toBeNull()
  })

  it('still offers the talent tree link wherever a tree is rendered', () => {
    render(<BuildLandingPage pageId="retribution-pvp" />)

    expect(screen.getByRole('link', { name: /View Talent Tree/i }).getAttribute('href')).toBe('#build-content')
  })

  it('sends the PvP variant cards to their dedicated pages', () => {
    render(<BuildLandingPage pageId="pvp" />)

    expect(document.querySelector('a[href="/wow-forever-protection-paladin-pvp-build"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-retribution-paladin-pvp-build"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-holy-paladin-pvp-build"]')).toBeTruthy()
  })

  it('takes Paladin PvP entry points to the available Level 20 routes before opening a calculator', () => {
    render(<BuildLandingPage pageId="pvp" />)

    const routes = document.getElementById('pvp-starting-routes')
    expect(routes).toBeTruthy()
    for (const selector of ['.guide-nav .button.primary', '.landing-hero .button.primary', '.landing-final-cta .button.primary']) {
      expect(document.querySelector<HTMLAnchorElement>(selector)?.getAttribute('href')).toBe('#pvp-starting-routes')
    }
    const routeLinks = within(routes!).getAllByRole<HTMLAnchorElement>('link', { name: /Load (Holy|Retribution) route/ })
    expect(routeLinks).toHaveLength(2)
    for (const link of routeLinks) {
      const href = new URL(link.href)
      expect(href.pathname).toBe('/build')
      expect(href.hash).toBe('#calculator')
      const result = validateBuildUsage({ buildCode: href.searchParams.get('id'), sessionId: 'pvp-route-check-2026' }, talents)
      expect(result.ok && result.data.points).toBe(11)
    }
  })

  it('loads the protection reference build from the Protection PvP page', () => {
    render(<BuildLandingPage pageId="protection-pvp" />)

    expect(screen.getByText('Protection Beta Talent Tree')).toBeTruthy()
    for (const link of screen.getAllByRole('link', { name: /Open Talent Calculator/i })) {
      expect(link.getAttribute('href')).toMatch(/^\/build\?id=.+#calculator$/)
    }
  })
})
