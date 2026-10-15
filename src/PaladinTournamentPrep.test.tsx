import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PaladinTournamentPrep from './PaladinTournamentPrep'
import { DATA_VERSION, talents } from './data/talents'
import { validateBuildUsage } from './lib/build'

afterEach(cleanup)

describe('Forever Open preparation', () => {
  it('keeps registration, organizer scope and the standard-budget limitation explicit', () => {
    render(<PaladinTournamentPrep />)
    expect(screen.getByText(/Registration closed October 2/)).toBeTruthy()
    expect(screen.getByText(/does not calculate Legacy bonuses or certify tournament eligibility/)).toBeTruthy()
    expect(screen.getByText(/Quest and dungeon reward items above item level 45/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /complete qualifier and finals rules/ }).getAttribute('href')).toBe('https://raider.io/events/the-forever-open/qualifiers-finals-format-and-rules')
  })

  it('opens legal, versioned Level 30 allocations rather than a historical 51-point build', () => {
    render(<PaladinTournamentPrep />)
    const links = screen.getAllByRole<HTMLAnchorElement>('link', { name: /Edit .* at Level 30/ })
    expect(links).toHaveLength(2)
    for (const link of links) {
      const url = new URL(link.href)
      expect(url.searchParams.get('level')).toBe('30')
      expect(url.searchParams.get('dataset')).toBe(DATA_VERSION)
      const result = validateBuildUsage({ buildCode: url.searchParams.get('id'), sessionId: 'tournament-route-regression' }, talents)
      expect(result.ok && result.data.points).toBe(21)
    }
  })
})
