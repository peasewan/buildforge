import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BuildPage from './BuildPage'

afterEach(cleanup)

describe('Holy healing build page', () => {
  it('keeps the allocation status separate from the site footer', () => {
    render(<BuildPage buildId="holy-healing-31-20-0" />)

    const allocation = screen.getByLabelText('Build allocation')
    expect(allocation.querySelector('footer')).toBeNull()
    expect(allocation.textContent).toContain('51 of 51 points allocated')
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
    expect(screen.getByRole('heading', { level: 2, name: 'Explore More Protection Builds' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-protection-paladin-builds"]')).toBeTruthy()
  })
})
