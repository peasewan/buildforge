import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BuildLandingPage from './BuildLandingPage'

afterEach(cleanup)

describe('Build landing page template', () => {
  it('renders the Leveling content from configuration', () => {
    render(<BuildLandingPage pageId="leveling" />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Leveling Build' })).toBeTruthy()
    expect(screen.getByText('New Players')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Recommended Leveling Path' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
  })

  it('reuses the Protection talent tree on the dungeon page', () => {
    render(<BuildLandingPage pageId="protection-dungeon" />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Protection Paladin Dungeon Tank Build' })).toBeTruthy()
    expect(screen.getByLabelText('Protection talent tree')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Edit this build/ }).getAttribute('href')).toMatch(/^\/build\?id=/)
  })
})
