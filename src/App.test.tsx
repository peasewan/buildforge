import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { encodeBuild } from './lib/build'
import { HOLY_HEALING_BUILD } from './data/builds'

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

  it('marks the available first-tier Retribution talents as starting choices', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: /Retribution/ }))

    expect(screen.getAllByText('Start here')).toHaveLength(2)
  })

  it('shows the current Beta build status and changelog summary', () => {
    render(<App />)

    expect(screen.getByText('Beta build 1.60.1.69913')).toBeTruthy()
    expect(screen.getByText('Updated September 20, 2026')).toBeTruthy()
    expect(screen.getByText('0 tooltip updates since 69893')).toBeTruthy()
    expect(screen.getByText('Beta Week 1 · Level cap 20')).toBeTruthy()
    const status = screen.getByRole('region', { name: 'WoW Forever Beta data status' })
    expect(status.querySelector('a')?.getAttribute('href')).toBe('/wow-forever-paladin-beta-talent-changes')
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
