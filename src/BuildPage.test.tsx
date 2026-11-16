import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BuildPage from './BuildPage'

afterEach(cleanup)

describe('Holy healing build page', () => {
  it('keeps the allocation status separate from the site footer', () => {
    render(<BuildPage buildId="holy-healing-31-20-0" />)

    const allocation = screen.getByLabelText('Build allocation')
    expect(allocation.querySelector('footer')).toBeNull()
    expect(allocation.textContent).toContain('51-point long-term reference')
  })

  it('targets the Holy Paladin build query without replacing the primary build heading', () => {
    render(<BuildPage buildId="holy-healing-31-20-0" />)

    const primaryHeading = document.querySelector('.build-hero-copy h1')
    expect(primaryHeading?.textContent).toBe('WoW ForeverPaladin Build')
    expect(screen.getByRole('heading', { level: 2, name: 'WoW Forever Holy Paladin Build (31/20/0)' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
  })

  it.each([
    ['protection-shield-20-31-0', 'WoW Forever Protection Paladin Build (20/31/0)', '20/31/0'],
    ['retribution-judgment-0-20-31', 'WoW Forever Retribution Paladin Build (0/20/31)', '0/20/31'],
  ])('renders the dedicated %s page', (buildId, heading, allocation) => {
    render(<BuildPage buildId={buildId} />)

    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy()
    expect(screen.getByLabelText('Build allocation').textContent).toContain(allocation)
  })

  it('adds a Protection talent overview and links back to the Protection hub', () => {
    render(<BuildPage buildId="protection-shield-20-31-0" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Protection Paladin Talent Overview' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Continue with Protection' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
  })

  it('connects the Protection build to its practical next steps', () => {
    render(<BuildPage buildId="protection-shield-20-31-0" />)

    const nextSteps = screen.getByRole('region', { name: 'Continue with Protection' })
    for (const href of [
      '#dungeon-tanking',
      '/wow-forever-protection-paladin-leveling-build',
      '/wow-forever-protection-paladin-talents',
      '/paladin#calculator',
    ]) {
      expect(nextSteps.querySelector(`a[href="${href}"]`)).toBeTruthy()
    }
    expect(nextSteps.textContent).toContain('editable Level 20 and Level 30')
  })

  it('keeps dungeon pull planning on the retained Protection build', () => {
    const { container } = render(<BuildPage buildId="protection-shield-20-31-0" />)

    const dungeon = screen.getByRole('region', { name: 'Dungeon tank planning' })
    expect(dungeon.id).toBe('dungeon-tanking')
    expect(within(dungeon).getAllByRole('listitem')).toHaveLength(3)
    expect(dungeon.textContent).toMatch(/51 points.*Level 30/)
    expect(dungeon.querySelector('a[href="/wow-forever-protection-paladin-leveling-build"]')).toBeTruthy()
    expect(container.querySelector('.protection-build-more a[href="/wow-forever-protection-paladin-dungeon-build"]')).toBeNull()
  })

  it('preserves the retired Ret hub navigation on its retained historical build', () => {
    render(<BuildPage buildId="retribution-judgment-0-20-31" />)

    const routes = screen.getByRole('region', { name: 'Retribution build routes' })
    for (const href of [
      '/wow-forever-paladin-leveling-build#ret-history',
      '/wow-forever-retribution-paladin-pvp-build',
      '/wow-forever-retribution-paladin-talents',
      '/paladin#calculator',
    ]) {
      expect(routes.querySelector(`a[href="${href}"]`)).toBeTruthy()
    }
    expect(routes.querySelector('a[href="/wow-forever-retribution-paladin-build"]')).toBeNull()
    expect(routes.textContent).toMatch(/0\/20\/31.*20\/0\/31/)
    expect(routes.textContent).toMatch(/Crusade.*absent.*70245/)
  })

  it('labels the full Protection allocation as a historical example', () => {
    render(<BuildPage buildId="protection-shield-20-31-0" />)

    expect(document.body.textContent).toContain('Historical community build example')
    expect(document.body.textContent).not.toContain('Popular Paladin Builds section')
  })

  it('shows the current Beta dataset on a ranked build page', () => {
    render(<BuildPage buildId="protection-shield-20-31-0" />)

    expect(screen.getByText('Beta build 1.60.1.70245')).toBeTruthy()
    expect(screen.getByText('70245 structure reviewed October 7, 2026')).toBeTruthy()
    expect(screen.getByText('14 talents with 32 changed rank strings since 69913 in that comparison')).toBeTruthy()
  })

  it.each(['holy-healing-31-20-0', 'protection-shield-20-31-0'] as const)(
    'keeps %s as a read-only historical reference and starts a blank current-cap plan', (buildId) => {
      render(<BuildPage buildId={buildId} />)
      expect(document.querySelector('.build-hero-copy a.button.primary')?.getAttribute('href')).toBe('/build?id=#calculator')
      expect(document.querySelector('.build-hero-copy')?.textContent).toMatch(/51-point.*historical.*Level 30/i)
      expect(document.querySelector('.build-inline-cta')?.textContent).toMatch(/blank.*70245.*21-point budget/i)
    },
  )

  it.each([
    ['holy-healing-31-20-0', "Light's Vigil", '31 talent points', 'Above level range', 'Level 40'],
    ['protection-shield-20-31-0', 'Improved Seal of Fury', '11 talent points', 'Within level range', 'Level 20'],
    ['retribution-judgment-0-20-31', 'Twist of Light', '31 talent points', 'Above level range', 'Level 40'],
  ])('shows the Beta level range from the imported tree on %s', (buildId, talentName, requiredPoints, status, minimumLevel) => {
    render(<BuildPage buildId={buildId} />)

    const availability = screen.getByRole('region', { name: 'Beta level-range check' })
    expect(availability.textContent).toContain('Level cap 30')
    expect(availability.textContent).toContain('Up to 21 points under the leveling assumption')
    expect(availability.textContent).toContain('reviewed 70245 client tree')
    expect(availability.textContent).toContain(talentName)
    expect(availability.textContent).toContain(requiredPoints)
    expect(availability.textContent).toContain(status)
    expect(availability.textContent).toContain(minimumLevel)
  })

  it.each([
    ['holy-healing-31-20-0', 'Holy Beta talent path', 'Dungeon healing', '5/5 Divine Intellect', 'divine_intellect.5'],
    ['retribution-judgment-0-20-31', 'Retribution Beta talent path', 'Solo leveling', '5/5 Benediction', 'benediction.5'],
  ])('adds an executable Level 20 starting route to %s', (buildId, heading, bestFor, firstStep, encodedTalent) => {
    render(<BuildPage buildId={buildId} />)

    const path = screen.getByRole('region', { name: 'Beta talent starting path' })
    expect(path.textContent).toContain(heading)
    expect(path.textContent).toContain('Level 20 · 11 points')
    expect(path.textContent).toContain('Community recommendation')
    expect(path.textContent).toContain(bestFor)
    expect(path.textContent).toContain(firstStep)
    expect(path.querySelector(`a[href*="${encodedTalent}"][href$="#calculator"]`)).toBeTruthy()
  })

  it('loads the new Protection Level 20 route without its removed predecessor', () => {
    render(<BuildPage buildId="protection-shield-20-31-0" />)

    const path = screen.getByRole('region', { name: 'Beta talent starting path' })
    expect(path.textContent).toContain('0/11/0')
    expect(path.textContent).toContain('0/21/0')
    expect(path.textContent).toContain('70170')
    expect(path.querySelector('a[href*="improved_holy_strike"]')).toBeNull()
    expect(path.querySelector('a[href*="redoubt.5"][href*="level=20"]')).toBeTruthy()
  })

  it.each([
    'holy-healing-31-20-0',
    'protection-shield-20-31-0',
    'retribution-judgment-0-20-31',
  ] as const)('labels the official fact precisely and carries the current page date on %s', (buildId) => {
    render(<BuildPage buildId={buildId} />)

    const path = screen.getByRole('region', { name: 'Beta talent starting path' })
    expect(path.querySelector('.beta-leveling-grid article:first-child > div > span')?.textContent).toBe('Level 20 starting route')
    expect(path.textContent).toContain('October Beta cap: Level 30')
    expect(document.querySelector('.build-hero-copy small')?.textContent).toBe(`Historical allocation reviewed ${buildId === 'retribution-judgment-0-20-31' ? 'September 29' : 'September 20'}, 2026 · Page updated October 5, 2026`)
  })

  it('links the reviewed community Level 30 allocation separately from the Level 20 starter', () => {
    render(<BuildPage buildId="retribution-judgment-0-20-31" />)

    const path = screen.getByRole('region', { name: 'Beta talent starting path' })
    expect(path.textContent).toContain('0/0/11')
    expect(path.textContent).toContain('October Beta level cap')
    expect(path.textContent).toContain('0/0/21')
    expect(screen.getByRole('link', { name: 'Load Level 30 Ret route' }).getAttribute('href')).toContain('&level=30#calculator')
    expect(path.textContent).not.toContain('2/0/19')
  })

  it.each(['retribution-judgment-0-20-31', 'retribution-leveling-20-0-31'] as const)('treats %s as a historical 69913 allocation with Crusade absent from the current tree', (buildId) => {
    render(<BuildPage buildId={buildId} />)

    expect(screen.getByRole('status').textContent).toMatch(/Crusade.*absent.*70245/i)
    expect(document.querySelector('.build-hero-copy a.button.primary')?.getAttribute('href')).toBe('/build?id=#calculator')
    expect(document.querySelector('a[href*="crusade.2"]')).toBeNull()
    expect(document.body.textContent).not.toContain('Selecting Open This Build loads all 51 points')
    expect(document.body.textContent).not.toContain('Opening the build takes the visitor directly to the interactive planner')
    expect(document.querySelector('.build-calc-anchor')?.textContent).toMatch(/Start a new Retribution/i)
    expect(document.querySelector('.build-calc-anchor')?.textContent).not.toMatch(/Customize this Retribution/i)
    expect(document.querySelector('.build-talents .section-heading p')?.textContent).toMatch(/historical.*ranks/i)
  })

  it('shows the community Level 10–30 timeline on the Retribution leveling page', () => {
    render(<BuildPage buildId="retribution-leveling-20-0-31" />)

    expect(screen.getByRole('heading', { level: 1, name: /WoW Forever\s*Retribution Paladin Leveling Build/ })).toBeTruthy()
    const snapshot = screen.getByRole('region', { name: 'Beta leveling snapshot' })
    expect(snapshot.textContent).toContain('Level 30 · 21 points')
    expect(snapshot.textContent).toContain('0/0/21')
    expect(snapshot.textContent).toContain('End of the reviewed Beta route')
    expect(snapshot.textContent).toContain('not an official or simulated best build')
    expect(snapshot.textContent).not.toContain('No reviewed allocation')
    expect(snapshot.textContent).toContain('Community recommendation')
  })
})
