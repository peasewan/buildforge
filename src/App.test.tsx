import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App, { TalentTree } from './App'
import { encodeBuild } from './lib/build'
import { EXAMPLE_BUILDS, HOLY_HEALING_BUILD, type ExampleBuild } from './data/builds'
import { talents } from './data/talents'
import { createForgePilotSavedBuild } from './lib/forgePilot'

beforeEach(() => { HTMLElement.prototype.scrollIntoView = vi.fn() })

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.history.replaceState({}, '', '/paladin')
})

describe('Paladin talent calculator page', () => {
  it('saves a named ForgePilot build without replacing the editable calculator draft', () => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Load Holy Level 20 build' }))
    const draftBefore = localStorage.getItem('wow-forever-paladin-build')

    fireEvent.click(screen.getByRole('button', { name: 'Save to ForgePilot' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Build name' }), { target: { value: 'My Holy route' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save this build' }))

    expect(screen.getByText('My Holy route')).toBeTruthy()
    expect(localStorage.getItem('wow-forever-paladin-build')).toBe(draftBefore)
    expect(localStorage.getItem('buildforge-forge-pilot-saved-builds-v1')).toContain('My Holy route')
    expect(localStorage.getItem('buildforge-forge-pilot-saved-builds-v1')).toContain('"level":20')
  })

  it('reopens a Level 20 ForgePilot build with its level intact', () => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
    const first = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Load Holy Level 20 build' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save to ForgePilot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save this build' }))
    const reopen = screen.getByRole('link', { name: 'Reopen in Calculator' })
    expect(reopen.getAttribute('href')).toContain('level=20')

    first.unmount()
    window.history.replaceState({}, '', reopen.getAttribute('href') ?? '/paladin')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Save to ForgePilot' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save this build' }))
    const saved = JSON.parse(localStorage.getItem('buildforge-forge-pilot-saved-builds-v1') ?? '[]') as Array<{ level: number | null }>
    expect(saved).toHaveLength(1)
    expect(saved[0].level).toBe(20)
  })

  it('keeps a versionless imported Paladin link in review instead of treating it as current data', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Save to ForgePilot' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Build name' }), { target: { value: 'Old Holy link' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Import a BuildForge link' }), { target: { value: `/build?id=${encodeBuild(HOLY_HEALING_BUILD.build)}#calculator` } })
    fireEvent.click(screen.getByRole('button', { name: 'Import link for review' }))

    expect(screen.getByText('Old Holy link')).toBeTruthy()
    expect(screen.getByText('Version needs review before reopening')).toBeTruthy()
    expect(localStorage.getItem('buildforge-forge-pilot-saved-builds-v1')).toContain('"dataVersion":"unknown"')
    expect(screen.queryByRole('link', { name: 'Reopen in Calculator' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Open original link for review' }).getAttribute('href')).toContain('/build?id=')
  })

  it('labels a saved allocation with an officially removed talent as historical', () => {
    const created = createForgePilotSavedBuild({
      id: 'historical', name: 'Old strike path', classId: 'paladin',
      dataVersion: 'wow_forever_beta_1.60.1.69913', shareInput: 'improved_holy_strike.1',
      savedAt: '2026-09-29T00:00:00.000Z',
    })
    if (!created.ok) throw new Error(created.error)
    localStorage.setItem('buildforge-forge-pilot-saved-builds-v1', JSON.stringify([created.build]))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Save to ForgePilot' }))

    expect(screen.getByText(/a talent was officially removed/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Official patch notes' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Reopen in Calculator' })).toBeNull()
  })

  it('labels the interactive planner as a WoW Forever Paladin talent tree', () => {
    render(<App />)

    const primaryHeading = document.querySelector('.hero-copy h1')
    expect(primaryHeading?.textContent).toBe('WoW ForeverPaladin TalentCalculator')
    expect(screen.getByText('Build Paladin talent trees for Holy, Protection, and Retribution.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'WoW Forever Paladin Talent Tree' })).toBeTruthy()
    expect(document.querySelector('.summary-card')?.textContent).toMatch(/21-point Level 30 budget is not enforced/i)
  })

  it('labels curated builds as community examples instead of measured popularity', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: 'Community Build Examples' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 2, name: 'Popular Paladin Builds' })).toBeNull()
    expect(screen.getByRole('link', { name: /Holy Paladin Healing Build/ }).getAttribute('href')).toBe('/wow-forever-paladin-build')
    expect(screen.getByRole('link', { name: /Protection Paladin Shield Build/ }).getAttribute('href')).toBe('/wow-forever-protection-paladin-build')
    expect(screen.getByRole('link', { name: /Retribution Paladin Judgment Build/ }).getAttribute('href')).toBe('/wow-forever-retribution-paladin-build')
  })

  it('keeps all 51-point example cards as historical reading links instead of loading them into the live planner', () => {
    render(<App />)
    const cards = document.querySelectorAll('.example-build-card')
    expect(cards).toHaveLength(EXAMPLE_BUILDS.length)
    for (const card of cards) {
      expect(card.textContent).toMatch(/historical 51-point/i)
      expect(card.querySelector('button')).toBeNull()
      expect(card.querySelector<HTMLAnchorElement>('a[href^="/wow-forever-"]')?.getAttribute('href')).toBeTruthy()
    }
  })

  it('loads a Level 20 starting path without presenting it as a complete Level 30 build', () => {
    const gtag = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
    window.gtag = gtag
    render(<App />)

    const paths = screen.getByRole('region', { name: 'Level 20 Beta starting builds' })
    expect(paths.textContent).toContain('No Level 30 route has been verified yet')
    expect(paths.textContent).toContain('11/0/0')
    expect(paths.textContent).toContain('2/9/0')
    expect(paths.textContent).toContain('Archived')
    expect(paths.textContent).toContain('0/0/11')
    expect(screen.queryByRole('button', { name: 'Load Protection Level 20 build' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Load Holy Level 20 build' }))
    expect(screen.getByText('40 reference points remaining')).toBeTruthy()
    expect(gtag).toHaveBeenCalledWith('event', 'beta_path_load', { branch: 'holy', level: 20, allocation: '11/0/0' })
    expect(gtag).not.toHaveBeenCalledWith('event', 'beta_path_load', expect.objectContaining({ branch: 'protection' }))
  })

  it('keeps the Level 20 starter context in its copied URL and analytics', async () => {
    const oldClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const writeText = vi.fn().mockResolvedValue(undefined)
    const gtag = vi.fn()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    window.gtag = gtag
    try {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: 'Load Holy Level 20 build' }))
      fireEvent.click(screen.getByRole('button', { name: 'Copy Build Link' }))
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
      expect(String(writeText.mock.calls[0]?.[0])).toMatch(/\/build\?id=.+&level=20#calculator$/)
      expect(gtag).toHaveBeenCalledWith('event', 'build_copy', expect.objectContaining({ level: 20, point_cap: 11, points: 11 }))
    } finally {
      if (oldClipboard) Object.defineProperty(navigator, 'clipboard', oldClipboard)
      else Reflect.deleteProperty(navigator, 'clipboard')
      window.gtag = undefined
    }
  })

  it('links the four content-focused build pages', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: 'Explore Paladin Builds' })).toBeTruthy()
    for (const href of [
      '/wow-forever-paladin-leveling-build',
      '/wow-forever-paladin-pvp-build',
      '/wow-forever-paladin-raid-build',
      '/wow-forever-protection-paladin-dungeon-build',
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy()
    }
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
  })

  it('shows Beta-client evidence for officially announced talents', () => {
    render(<App />)

    expect(screen.getByText("Light's Vigil")).toBeTruthy()
    expect(screen.getAllByText('Verified from Beta client data').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Client verified').length).toBeGreaterThan(0)
    const source = screen.getAllByRole('link', { name: 'Blizzard WoW Forever Deep Dive' })[0]
    expect(source.getAttribute('href')).toContain('worldofwarcraft.blizzard.com')
  })

  it('links published builds from each talent detail', () => {
    render(<App />)

    const holyDetail = document.querySelector('#tip-light_s_vigil')
    expect(holyDetail?.textContent).toContain('Builds using this talent')
    expect(holyDetail?.querySelector('a[href="/wow-forever-paladin-build"]')?.textContent).toContain('Holy Paladin Healing Build')

    fireEvent.click(screen.getByRole('tab', { name: /Retribution/ }))
    const retributionDetail = document.querySelector('#tip-twist_of_light')
    expect(retributionDetail?.querySelectorAll('.talent-builds a')).toHaveLength(2)
    expect(retributionDetail?.querySelector('a[href="/wow-forever-retribution-paladin-build"]')).toBeTruthy()
    expect(retributionDetail?.querySelector('a[href="/wow-forever-retribution-paladin-leveling-build"]')).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: /Protection/ }))
    const protectionDetail = document.querySelector('#tip-improved_seal_of_fury')
    expect(protectionDetail?.textContent).toContain('No published example yet')
  })

  it('explains a locked Retribution talent when it is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /Retribution/ }))

    fireEvent.click(screen.getByRole('button', { name: /Sacred Arbiter/ }))

    expect(screen.getByRole('status').textContent).toContain('Requires 15 points in Retribution (0/15)')
    expect(screen.getAllByText('15 pts').length).toBeGreaterThan(0)
  })

  it('keeps an officially removed talent visible but blocks adding it with an explanation', () => {
    const retired = talents.find(talent => talent.id === 'improved_holy_strike')!
    const previous = retired.currentBetaAvailability
    retired.currentBetaAvailability = 'removed_official'
    const add = vi.fn()
    try {
      render(<TalentTree branch="holy" build={{}} onAdd={add} />)
      fireEvent.click(screen.getByRole('button', { name: /Improved Holy Strike/ }))
      expect(add).not.toHaveBeenCalled()
      expect(screen.getByRole('status').textContent).toMatch(/removed.*September 24/i)
    } finally {
      retired.currentBetaAvailability = previous
    }
  })

  it('keeps Crusade visible as a 69913 record but withholds it pending 70009 identity review', () => {
    const add = vi.fn()
    render(<TalentTree branch="retribution" build={{}} onAdd={add} />)
    fireEvent.click(screen.getByRole('button', { name: /Crusade/ }))
    expect(add).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toMatch(/70009.*under review/i)
    expect(screen.getAllByText('Needs review').length).toBeGreaterThan(0)
  })

  it('marks October 1 Paladin tooltip changes as older client text', () => {
    render(<TalentTree branch="protection" build={{}} readOnly />)
    const redoubt = document.getElementById('tip-redoubt')
    const holyShield = document.getElementById('tip-holy_shield')
    expect(redoubt?.textContent).toMatch(/4\/8\/12\/16\/20%.*older 69913/i)
    expect(holyShield?.textContent).toMatch(/30%.*older 69913/i)
    expect(redoubt?.querySelector('a[href*="forums.blizzard.com"]')).toBeTruthy()
  })

  it('keeps multiple official references for the same talent without duplicate React keys', () => {
    const talent = talents.find(candidate => candidate.id === 'improved_holy_strike')!
    const previous = talent.sources
    const official = previous.find(source => source.type === 'official')!
    talent.sources = [...previous, { ...official, label: 'Later official patch', url: 'https://example.test/patch' }]
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<TalentTree branch="holy" build={{}} readOnly />)
      expect(screen.getByRole('link', { name: 'Later official patch' })).toBeTruthy()
      expect(errors.mock.calls.flat().join(' ')).not.toMatch(/same key/i)
    } finally {
      talent.sources = previous
      errors.mockRestore()
    }
  })

  it('refuses retired talent ranks from both shared URLs and browser storage', () => {
    const retired = talents.find(talent => talent.id === 'improved_holy_strike')!
    const previous = retired.currentBetaAvailability
    retired.currentBetaAvailability = 'removed_official'
    try {
      history.replaceState({}, '', '/build?id=improved_holy_strike.1#calculator')
      render(<App />)
      expect(screen.getByText(/shared build.*invalid/i)).toBeTruthy()
      expect(screen.getByText('51 reference points remaining')).toBeTruthy()
      cleanup()

      history.replaceState({}, '', '/paladin')
      localStorage.setItem('wow-forever-paladin-build', 'improved_holy_strike.1')
      render(<App />)
      expect(screen.getByText(/saved build.*invalid/i)).toBeTruthy()
      expect(screen.getByText('51 reference points remaining')).toBeTruthy()
    } finally {
      retired.currentBetaAvailability = previous
    }
  })

  it('leaves a Ret example under review visible without offering it as a current preset', () => {
    const example = EXAMPLE_BUILDS.find(candidate => candidate.id === 'retribution-judgment-0-20-31') as ExampleBuild & { reviewStatus?: 'under_review' }
    const previous = example.reviewStatus
    example.reviewStatus = 'under_review'
    try {
      render(<App />)
      const card = screen.getByRole('link', { name: 'Retribution Paladin Judgment Build' }).closest('.example-build-card')!
      expect(card.querySelector('button')).toBeNull()
      expect(card.textContent).toContain('Historical 51-point reference')
      expect(screen.getByText('51 reference points remaining')).toBeTruthy()
      fireEvent.click(screen.getByRole('tab', { name: /Retribution/ }))
      expect(document.querySelector('#tip-crusade .talent-builds')?.textContent).toContain('Under review')
    } finally {
      example.reviewStatus = previous
    }
  })

  it('marks the available first-tier Retribution talents as starting choices', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /Retribution/ }))

    expect(screen.getAllByText('Start here')).toHaveLength(2)
  })

  it('shows the current Beta build status and changelog summary', () => {
    render(<App />)

    expect(screen.getByText('Beta build 1.60.1.69913')).toBeTruthy()
    expect(screen.getByText('69913 snapshot reviewed September 20, 2026')).toBeTruthy()
    expect(screen.getByText('0 tooltip updates since 69893 in that comparison')).toBeTruthy()
    expect(screen.getByText(/October 1 Beta update · Official level cap 30/)).toBeTruthy()
    const status = screen.getByRole('region', { name: 'WoW Forever Beta data status' })
    expect(status.textContent).toContain('Level 20 routes are 11-point starting snapshots')
    expect(status.querySelector('a[href*="2360696"]')).toBeTruthy()
    expect(status.querySelector('a[href="/wow-forever-paladin-beta-talent-changes"]')).toBeTruthy()
  })

  it('describes 69913 as an imported snapshot rather than the fully current Beta dataset', () => {
    render(<App />)
    const explanation = document.querySelector('.seo-copy')?.textContent ?? ''
    expect(explanation).toContain('imported client snapshot')
    expect(explanation).toContain('September 24')
    expect(explanation).not.toContain('The current tree uses')
    expect(explanation).not.toContain('reflects the current Beta client')
  })

  it('opens the actual calculator before the popular build cards', () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Open Talent Calculator' }))

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    const calculator = container.querySelector('#calculator')
    const popularBuilds = container.querySelector('.popular-builds')
    expect(calculator?.compareDocumentPosition(popularBuilds as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('offers a fresh start when a saved build is restored', () => {
    localStorage.setItem('wow-forever-paladin-build', encodeBuild(HOLY_HEALING_BUILD.build))
    render(<App />)

    expect(screen.getByText('Saved build loaded')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Start New Build' }))
    expect(screen.queryByText('Saved build loaded')).toBeNull()
    expect(screen.getByText('51 reference points remaining')).toBeTruthy()
  })

  it('starts blank when an explicit empty build id overrides saved points', () => {
    localStorage.setItem('wow-forever-paladin-build', encodeBuild(HOLY_HEALING_BUILD.build))
    window.history.replaceState({}, '', '/build?id=#calculator')
    render(<App />)

    expect(screen.queryByText('Saved build loaded')).toBeNull()
    expect(screen.getByText('51 reference points remaining')).toBeTruthy()
  })

  it('does not silently load a shared or saved allocation that skips talent tiers', () => {
    window.history.replaceState({}, '', '/build?id=holy_shock.1#calculator')
    render(<App />)
    expect(screen.getByText('51 reference points remaining')).toBeTruthy()
    expect(screen.getByText(/shared build.*invalid/i)).toBeTruthy()
    cleanup()

    window.history.replaceState({}, '', '/paladin')
    localStorage.setItem('wow-forever-paladin-build', 'holy_shock.1')
    render(<App />)
    expect(screen.getByText('51 reference points remaining')).toBeTruthy()
    expect(screen.getByText(/saved build.*invalid/i)).toBeTruthy()
  })

  it('keeps edits to a shared Paladin build after refreshing the URL', () => {
    window.history.replaceState({}, '', `/build?id=${encodeBuild(HOLY_HEALING_BUILD.build)}#calculator`)
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /Protection/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove one rank from Anticipation' }))
    expect(new URLSearchParams(location.search).get('id')).toContain('anticipation.4')
    cleanup()
    localStorage.clear()
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /Protection/ }))
    expect(screen.getByRole('button', { name: /^Anticipation, rank 4 of/ })).toBeTruthy()
  })

  it('honors calculator deep links from other pages', () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    window.history.replaceState({}, '', '/paladin#calculator')

    render(<App />)

    expect(scrollIntoView).toHaveBeenCalledTimes(1)
  })

  it('links the site trust pages from the footer', () => {
    render(<App />)

    expect(document.querySelector('footer a[href="/about"]')).toBeTruthy()
    expect(document.querySelector('footer a[href="/contact"]')).toBeTruthy()
    expect(document.querySelector('footer a[href="/privacy"]')).toBeTruthy()
  })
})
