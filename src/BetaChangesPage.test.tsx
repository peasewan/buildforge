import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BetaChangesPage from './BetaChangesPage'

afterEach(cleanup)

describe('Paladin Beta changes page', () => {
  it('publishes the current Beta phase and verified client summary', () => {
    render(<BetaChangesPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Beta Talent Changes' })).toBeTruthy()
    expect(screen.getAllByText('Beta Week 1 — Level 20').length).toBeGreaterThan(0)
    expect(screen.getByText('52 talents · 21 new in WoW Forever')).toBeTruthy()
    expect(screen.getByText('Holy 9 · Protection 5 · Retribution 7')).toBeTruthy()
    expect(screen.getByText(/stable client node and spell IDs became available for 52 talents/)).toBeTruthy()
    expect(screen.getByText(/Rank 3:/)).toBeTruthy()
  })

  it('breaks the archived Preview comparison into structural change types', () => {
    render(<BetaChangesPage />)

    expect(screen.getByRole('heading', { level: 2, name: 'Preview → Beta 1.60.1.69893' })).toBeTruthy()
    expect(screen.getByText(/Moved:/)).toBeTruthy()
    expect(screen.getByText(/Rank changed:/)).toBeTruthy()
    expect(screen.getByText(/Prerequisites changed:/)).toBeTruthy()
  })
})
