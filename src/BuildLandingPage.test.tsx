import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BuildLandingPage from './BuildLandingPage'
import { HOLY_HEALING_BUILD } from './data/builds'
import { encodeBuild } from './lib/build'

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
    expect(snapshot.textContent).toContain('Build 1.60.1.69913')
    expect(snapshot.querySelector('a[href^="/build?id="]')).toBeTruthy()
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

    expect(document.querySelector('a[href="/wow-forever-retribution-paladin-pvp-build"]')).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-holy-paladin-pvp-build"]')).toBeTruthy()
  })
})
