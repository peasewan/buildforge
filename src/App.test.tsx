import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App, { TalentTree } from './App'
import { encodeBuild } from './lib/build'
import { EXAMPLE_BUILDS, HOLY_HEALING_BUILD, type ExampleBuild } from './data/builds'
import { talents } from './data/talents'

beforeEach(() => { HTMLElement.prototype.scrollIntoView = vi.fn() })

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.history.replaceState({}, '', '/paladin')
})

describe('Paladin talent calculator page', () => {
  it('labels the interactive planner as a WoW Forever Paladin talent tree', () => {
    render(<App />)

    const primaryHeading = document.querySelector('.hero-copy h1')
    expect(primaryHeading?.textContent).toBe('WoW ForeverPaladin TalentCalculator')
    expect(screen.getByText('Build Paladin talent trees for Holy, Protection, and Retribution.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'WoW Forever Paladin Talent Tree' })).toBeTruthy()
  })

  it('labels curated builds as community examples instead of measured popularity', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 2, name: 'Community Build Examples' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 2, name: 'Popular Paladin Builds' })).toBeNull()
    expect(screen.getByRole('link', { name: /Holy Paladin Healing Build/ }).getAttribute('href')).toBe('/wow-forever-paladin-build')
    expect(screen.getByRole('link', { name: /Protection Paladin Shield Build/ }).getAttribute('href')).toBe('/wow-forever-protection-paladin-build')
    expect(screen.getByRole('link', { name: /Retribution Paladin Judgment Build/ }).getAttribute('href')).toBe('/wow-forever-retribution-paladin-build')
  })

  it('loads a current-cap Level 20 path directly into the calculator', () => {
    const gtag = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
    window.gtag = gtag
    render(<App />)

    const paths = screen.getByRole('region', { name: 'Current Beta Level 20 builds' })
    expect(paths.textContent).toContain('11/0/0')
    expect(paths.textContent).toContain('2/9/0')
    expect(paths.textContent).toContain('Archived')
    expect(paths.textContent).toContain('0/0/11')
    expect(screen.queryByRole('button', { name: 'Load Protection Level 20 build' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Load Holy Level 20 build' }))
    expect(screen.getByText('40 points remaining')).toBeTruthy()
    expect(gtag).toHaveBeenCalledWith('event', 'beta_path_load', { branch: 'holy', level: 20, allocation: '11/0/0' })
    expect(gtag).not.toHaveBeenCalledWith('event', 'beta_path_load', expect.objectContaining({ branch: 'protection' }))
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
      expect(screen.getByText('51 points remaining')).toBeTruthy()
      cleanup()

      history.replaceState({}, '', '/paladin')
      localStorage.setItem('wow-forever-paladin-build', 'improved_holy_strike.1')
      render(<App />)
      expect(screen.getByText(/saved build.*invalid/i)).toBeTruthy()
      expect(screen.getByText('51 points remaining')).toBeTruthy()
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
      const load = card.querySelector('button') as HTMLButtonElement
      expect(load.disabled).toBe(true)
      expect(load.textContent).toContain('Under review')
      expect(screen.getByText('51 points remaining')).toBeTruthy()
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
    expect(screen.getByText('Beta Week 1 · Level cap 20')).toBeTruthy()
    const status = screen.getByRole('region', { name: 'WoW Forever Beta data status' })
    expect(status.querySelector('a')?.getAttribute('href')).toBe('/wow-forever-paladin-beta-talent-changes')
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
    expect(screen.getByText('51 points remaining')).toBeTruthy()
  })

  it('starts blank when an explicit empty build id overrides saved points', () => {
    localStorage.setItem('wow-forever-paladin-build', encodeBuild(HOLY_HEALING_BUILD.build))
    window.history.replaceState({}, '', '/build?id=#calculator')
    render(<App />)

    expect(screen.queryByText('Saved build loaded')).toBeNull()
    expect(screen.getByText('51 points remaining')).toBeTruthy()
  })

  it('does not silently load a shared or saved allocation that skips talent tiers', () => {
    window.history.replaceState({}, '', '/build?id=holy_shock.1#calculator')
    render(<App />)
    expect(screen.getByText('51 points remaining')).toBeTruthy()
    expect(screen.getByText(/shared build.*invalid/i)).toBeTruthy()
    cleanup()

    window.history.replaceState({}, '', '/paladin')
    localStorage.setItem('wow-forever-paladin-build', 'holy_shock.1')
    render(<App />)
    expect(screen.getByText('51 points remaining')).toBeTruthy()
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
