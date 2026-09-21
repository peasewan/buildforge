import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SpellbookPage from './SpellbookPage'

afterEach(() => {
  cleanup()
  delete window.gtag
})

describe('Paladin abilities spellbook page', () => {
  it('publishes the complete versioned spellbook and its evidence boundary', () => {
    render(<SpellbookPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Abilities & Spellbook' })).toBeTruthy()
    expect(screen.getByText('45 abilities')).toBeTruthy()
    expect(screen.getAllByText('Beta client 1.60.1.69893').length).toBeGreaterThan(0)
    expect(screen.getByText(/This spellbook snapshot remains versioned separately from the 69913 talent tree/)).toBeTruthy()
    expect(screen.getByText('Seal of Fury')).toBeTruthy()
    expect(screen.getAllByText('New in Forever').length).toBeGreaterThan(0)
    expect(screen.getByText('Consecration')).toBeTruthy()
    expect(screen.getAllByText('Former talent').length).toBeGreaterThan(0)
  })

  it('filters by specialization, current level cap, and search text', () => {
    render(<SpellbookPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Protection' }))
    expect(screen.getByText('Seal of Fury')).toBeTruthy()
    expect(screen.queryByText('Holy Light')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Level 20 cap' }))
    expect(screen.getByText('Blessing of Kings')).toBeTruthy()
    expect(screen.queryByText('Hammer of the Righteous')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'All specializations' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search Paladin abilities' }), { target: { value: 'Holy Strike' } })
    expect(screen.getByText('Holy Strike')).toBeTruthy()
    expect(screen.queryByText('Seal of Fury')).toBeNull()
  })

  it('records bounded filter analytics', () => {
    const gtag = vi.fn()
    window.gtag = gtag
    render(<SpellbookPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Retribution' }))
    fireEvent.click(screen.getByRole('button', { name: 'Level 20 cap' }))

    expect(gtag).toHaveBeenCalledWith('event', 'spellbook_filter', { category: 'retribution', level_cap: 'all' })
    expect(gtag).toHaveBeenCalledWith('event', 'spellbook_filter', { category: 'retribution', level_cap: '20' })
  })
})
