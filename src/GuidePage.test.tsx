import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import GuidePage from './GuidePage'

afterEach(cleanup)

describe('Paladin talents guide', () => {
  it('preserves the title that serves existing talent and build queries', () => {
    render(<GuidePage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Talent Guide & Build Planner' })).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-builds"]')).toBeTruthy()
    expect(screen.getByText('Beta build 1.60.1.70245')).toBeTruthy()
    expect(screen.getByText('14 talents with 32 changed rank strings since 69913 in that comparison')).toBeTruthy()
  })

  it('shows the imported talent tree as a browsable, versioned index', () => {
    render(<GuidePage />)

    expect(screen.getByRole('heading', { level: 2, name: 'Paladin talent tree index' })).toBeTruthy()
    expect(document.querySelectorAll('[data-talent-id]')).toHaveLength(52)
    for (const spec of ['Holy', 'Protection', 'Retribution']) {
      expect(screen.getByRole('heading', { level: 3, name: `${spec} talent tree` })).toBeTruthy()
      expect(document.querySelector(`a[href="/wow-forever-${spec.toLowerCase()}-paladin-talents"]`)).toBeTruthy()
    }
    expect(document.querySelector('[data-talent-id="redoubt"]')?.textContent).toContain('5 ranks')
    expect(document.querySelector('[data-talent-id="improved_holy_strike"]')?.textContent).toContain('Removed Sep 24')
    expect(document.querySelector('[data-talent-id="crusade"]')?.textContent).toContain('Client-confirmed removal')
    expect(document.querySelector('[data-talent-id="holy_shield"]')?.textContent).toContain('Oct 1 tuning')
    expect(screen.getByText(/Rows requiring 25 or 30 points in one tree are beyond the current 21-point budget/)).toBeTruthy()
    expect(document.querySelector('a[href="/wow-forever-paladin-beta-talent-changes"]')).toBeTruthy()
  })
})
