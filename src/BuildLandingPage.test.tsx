import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useState } from 'react'
import { TalentTree } from './App'
import BuildLandingPage from './BuildLandingPage'
import { incrementTalent, validateBuildUsage } from './lib/build'
import { talents } from './data/talents'

afterEach(cleanup)

describe('Build landing page template', () => {
  it('keeps the calculator talent nodes editable', () => {
    function EditableTree() {
      const [build, setBuild] = useState({})
      return <TalentTree branch="holy" build={build} onAdd={(talent) => setBuild((current) => incrementTalent(current, talent, talents))} />
    }
    render(<EditableTree />)
    fireEvent.click(screen.getByRole('button', { name: /Divine Intellect, rank 0 of 5/ }))
    expect(screen.getByRole('button', { name: /Divine Intellect, rank 1 of 5/ })).toBeTruthy()
  })

  it.each(['protection-dungeon', 'protection-leveling', 'protection-pvp', 'retribution-pvp'] as const)(
    'shows a read-only tree with a visible edit action before the nodes on %s', (pageId) => {
      render(<BuildLandingPage pageId={pageId} />)

      const preview = document.querySelector('.landing-talent-preview')!
      expect(preview.textContent).toMatch(/read-only preview/i)
      expect(within(preview as HTMLElement).queryAllByRole('button')).toHaveLength(0)
      const edit = within(preview as HTMLElement).getAllByRole('link', { name: /start a new build/i })[0]
      expect(edit.getAttribute('href')).toBe('/build?id=#calculator')
      expect(edit.compareDocumentPosition(preview.querySelector('.landing-tree-card')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    },
  )

  it('renders the Leveling content from configuration', () => {
    render(<BuildLandingPage pageId="leveling" />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Leveling Build' })).toBeTruthy()
    expect(screen.getByText('New Players')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Recommended Leveling Path' })).toBeTruthy()
    expect(screen.getByText(/October 1 Beta update · Official level cap 30/)).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
    const snapshot = screen.getByRole('region', { name: 'Beta leveling snapshot' })
    expect(snapshot.textContent).toContain('Level 30 · 21 points')
    expect(snapshot.textContent).toContain('0/0/21')
    expect(snapshot.textContent).toContain('imported 69913 tree rules')
    expect(snapshot.textContent).toContain('Community recommendation')
  })

  it('shows the Protection level 20 and level 30 paths on the existing leveling page', () => {
    render(<BuildLandingPage pageId="protection-leveling" />)

    const snapshot = screen.getByRole('region', { name: 'Beta leveling snapshot' })
    expect(snapshot.textContent).toContain('2/9/0')
    expect(snapshot.textContent).not.toContain('2/19/0')
    expect(snapshot.textContent).toContain('No reviewed allocation')
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
    for (const link of screen.getAllByRole('link', { name: /Start a new build/ })) {
      expect(link.getAttribute('href')).toBe('/build?id=#calculator')
    }
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
  })

  it('embeds the build each page declares instead of always the Protection tree', () => {
    render(<BuildLandingPage pageId="retribution-pvp" />)

    expect(screen.getByLabelText('Retribution talent tree')).toBeTruthy()
    expect(screen.queryByLabelText('Protection talent tree')).toBeNull()
  })

  it('does not load the unreconciled Crusade allocation from Retribution PvP', () => {
    render(<BuildLandingPage pageId="retribution-pvp" />)

    expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe('/build?id=#calculator')
    for (const link of screen.getAllByRole('link', { name: /Start a new build/i })) {
      expect(link.getAttribute('href')).toBe('/build?id=#calculator')
    }
    expect(document.querySelector('.landing-talent-preview')?.textContent).toMatch(/historical.*Crusade.*under review/i)
    expect(document.querySelector('a[href*="crusade.2"]')).toBeNull()
    expect(document.body.textContent).not.toContain('The 0/20/31 community build allocation below is the starting point')
    expect(document.body.textContent).not.toContain('Use the preview when you want a concrete build to edit rather than an empty tree')
  })

  it('does not promise the raid page can load the under-review Retribution allocation', () => {
    render(<BuildLandingPage pageId="raid" />)

    expect(document.body.textContent).toMatch(/Retribution.*historical.*Crusade.*under review/i)
    expect(document.body.textContent).not.toContain('Each one opens the exact 51-point setup')
  })

  it('does not auto-load an over-cap Holy reference into a current Beta planner', () => {
    render(<BuildLandingPage pageId="holy-pvp" />)

    const expected = '/build?id=#calculator'

    expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe(expected)
    for (const link of screen.getAllByRole('link', { name: /Open Talent Calculator/i })) {
      expect(link.getAttribute('href')).toBe(expected)
    }
    expect(document.querySelector('.landing-hero')?.textContent).toMatch(/historical.*51-point.*Level 30/i)
  })

  it.each(['protection-dungeon', 'protection-pvp', 'holy-pvp'] as const)(
    'describes the %s 51-point tree as a historical reference instead of a current starter', (pageId) => {
      render(<BuildLandingPage pageId={pageId} />)
      expect(document.querySelector('.landing-hero')?.textContent).toMatch(/historical 51-point.*Level 30/i)
      expect(document.querySelector('.landing-summary-card')?.textContent).toContain('Historical 51-point reference')
      expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe('/build?id=#calculator')
      expect(document.body.textContent).not.toMatch(/reviewed starting allocation|complete calculator preset|open the preset/i)
    },
  )

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
    expect(screen.getByRole('heading', { name: /choose a pvp role at level 30/i })).toBeTruthy()
    expect(document.body.textContent).toContain('Level 20 starting snapshots')
    expect(document.body.textContent).toContain('51-point examples are historical')
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

  it('starts a blank current-cap plan from the historical Protection PvP page', () => {
    render(<BuildLandingPage pageId="protection-pvp" />)

    expect(screen.getByText('Protection Beta Talent Tree')).toBeTruthy()
    for (const selector of ['.guide-nav .button.primary', '.landing-hero .button.primary', '.landing-final-cta .button.primary']) {
      expect(document.querySelector<HTMLAnchorElement>(selector)?.getAttribute('href')).toBe('/build?id=#calculator')
    }
  })
})
