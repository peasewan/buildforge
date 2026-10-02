import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BetaChangesPage from './BetaChangesPage'

afterEach(cleanup)

describe('Paladin Beta changes page', () => {
  it('publishes the current Beta phase and verified client summary', () => {
    render(<BetaChangesPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Beta Talent Changes' })).toBeTruthy()
    expect(screen.getByText('October 1 update — Level 30 cap')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'October 1 Beta — Level 30' })).toBeTruthy()
    expect(screen.getByText(/no Level 30 allocation is treated as reviewed yet/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Read Blizzard’s October 1 development notes' }).getAttribute('href')).toContain('2360696/1')
    expect(screen.getByText('52 talents · 21 new in WoW Forever')).toBeTruthy()
    expect(screen.getByText('Holy 9 · Protection 5 · Retribution 7')).toBeTruthy()
    expect(screen.getByText(/stable client node and spell IDs became available for 52 talents/)).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: '1.60.1.69893 → 1.60.1.69913' })).toBeTruthy()
    expect(screen.getByText(/No Paladin talent changes were detected in build 69913/)).toBeTruthy()
    expect(screen.getByText(/Rank 3:/)).toBeTruthy()
    expect(screen.getByLabelText('Data verification legend')).toBeTruthy()
    expect(screen.getByText('Last fully imported dataset')).toBeTruthy()
    expect(document.body.textContent).not.toContain('Calculator Dataset Verified')
  })

  it('breaks the archived Preview comparison into structural change types', () => {
    render(<BetaChangesPage />)

    expect(screen.getByRole('heading', { level: 2, name: 'Preview → Beta 1.60.1.69913' })).toBeTruthy()
    expect(screen.getByText(/Moved:/)).toBeTruthy()
    expect(screen.getByText(/Rank changed:/)).toBeTruthy()
    expect(screen.getByText(/Prerequisites changed:/)).toBeTruthy()
  })

  it('separates the October 1 official Paladin tuning from the imported 69913 tree', () => {
    render(<BetaChangesPage />)

    expect(screen.getByText(/Redoubt.*4\/8\/12\/16\/20%.*6\/12\/18\/24\/30%/)).toBeTruthy()
    expect(screen.getByText(/Holy Shield.*30%.*20%/)).toBeTruthy()
    expect(screen.getByText(/Champion of the Light.*20\/40\/60%.*33\/66\/100%/)).toBeTruthy()
    expect(screen.getByText(/Healing.*tooltip error.*not a live effect/i)).toBeTruthy()
    expect(screen.getByText(/69913 rank tooltips have not been updated from this announcement/i)).toBeTruthy()
  })
})
