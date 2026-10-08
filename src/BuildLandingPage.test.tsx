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

  it.each(['protection-dungeon', 'protection-pvp', 'retribution-pvp'] as const)(
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
    expect(snapshot.textContent).toContain('reviewed 70245 structure')
    expect(snapshot.textContent).toContain('Community recommendation')
  })

  it('lets a Paladin player track first-unlock reminders without claiming current trainer ranks', () => {
    window.localStorage.clear()
    render(<BuildLandingPage pageId="leveling" />)

    const checklist = screen.getByRole('region', { name: 'Paladin 1–30 checklist' })
    expect(checklist.textContent).toContain('69893 snapshot')
    expect(checklist.textContent).toContain('Current Beta trainer data needs review')
    const holyLight = within(checklist).getByRole('checkbox', { name: /Holy Light/i }) as HTMLInputElement
    fireEvent.click(holyLight)
    expect(holyLight.checked).toBe(true)
    expect(window.localStorage.getItem('buildforge:paladin-leveling-checklist:69893')).toContain('holy_light')
    const firstTalent = within(checklist).getByRole('checkbox', { name: /Level 10: Benediction 1/i }) as HTMLInputElement
    fireEvent.click(firstTalent)
    expect(firstTalent.checked).toBe(true)
    expect(window.localStorage.getItem('buildforge:paladin-leveling-checklist:69893')).toContain('talent:10')
    fireEvent.change(within(checklist).getByLabelText('Your checklist level'), { target: { value: '20' } })
    expect(within(checklist).getByText('Consecration')).toBeTruthy()
    expect(checklist.textContent).not.toMatch(/rank 2 available/i)
  })

  it('reviews the actual Level 30 leveling allocation instead of a different preset', () => {
    render(<BuildLandingPage pageId="leveling" />)
    const review = screen.getByRole('complementary', { name: 'Official change review' })
    expect(review.textContent).toContain('Retribution Level 30 leveling route')
    expect(review.textContent).toContain('Vengeance')
    expect(review.textContent).toContain('Sacred Arbiter')
  })

  it('keeps each PvP route change review attached to its own selected talents', () => {
    render(<BuildLandingPage pageId="pvp" />)
    const reviews = screen.getAllByRole('complementary', { name: 'Official change review' })
    expect(reviews).toHaveLength(2)
    expect(reviews[0].textContent).toContain('Retribution Level 20 starting route')
    expect(reviews[1].textContent).toContain('Holy Level 20 starting route')
    expect(reviews[0].textContent).not.toContain('Holy Power')
  })

  it('shows the Protection level 20 and level 30 paths on the existing leveling page', () => {
    render(<BuildLandingPage pageId="protection-leveling" />)

    const snapshot = screen.getByRole('region', { name: 'Beta leveling snapshot' })
    expect(snapshot.textContent).toContain('0/11/0')
    expect(snapshot.textContent).toContain('0/21/0')
    expect(snapshot.textContent).toContain('70170')
    expect(snapshot.textContent).toContain('without Legacy: Talented')
    expect(snapshot.querySelector('a[href*="improved_holy_strike"]')).toBeNull()
    expect(snapshot.querySelector('a[href*="redoubt.5"][href*="level=20"]')).toBeTruthy()
    expect(snapshot.querySelector('a[href*="redoubt.5"][href*="level=30"]')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toContain('level=20')
  })

  it('presents the node-checked Protection route with an editable calculator CTA', () => {
    render(<BuildLandingPage pageId="protection-leveling" />)

    const hero = document.querySelector('.landing-hero')!
    expect(hero.textContent).toMatch(/editorial Level 20 Protection route/i)
    expect(hero.textContent).toMatch(/Status\s*Editorial route/i)
    expect(screen.getByRole('heading', { level: 2, name: 'Level 10–30 Protection Point Order' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Load Level 20 Protection Route/i }).getAttribute('href')).toContain('level=20')
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

  it('does not load the historical Crusade allocation from Retribution PvP', () => {
    render(<BuildLandingPage pageId="retribution-pvp" />)

    expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe('/build?id=#calculator')
    for (const link of screen.getAllByRole('link', { name: /Start a new build/i })) {
      expect(link.getAttribute('href')).toBe('/build?id=#calculator')
    }
    expect(document.querySelector('.landing-talent-preview')?.textContent).toMatch(/historical.*Crusade.*absent.*70245/i)
    expect(document.querySelector('a[href*="crusade.2"]')).toBeNull()
    expect(document.body.textContent).not.toContain('The 0/20/31 community build allocation below is the starting point')
    expect(document.body.textContent).not.toContain('Use the preview when you want a concrete build to edit rather than an empty tree')
  })

  it('does not promise the raid page can load the historical Retribution allocation', () => {
    render(<BuildLandingPage pageId="raid" />)

    expect(document.body.textContent).toMatch(/Retribution.*historical.*Crusade.*absent.*70245/i)
    expect(document.body.textContent).not.toContain('Each one opens the exact 51-point setup')
  })

  it('does not auto-load an over-cap Holy reference into a current Beta planner', () => {
    render(<BuildLandingPage pageId="holy-pvp" />)

    const expected = '/build?id=&level=30&spec=holy#calculator'

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
      expect(screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')).toBe(pageId === 'holy-pvp' ? '/build?id=&level=30&spec=holy#calculator' : '/build?id=#calculator')
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
