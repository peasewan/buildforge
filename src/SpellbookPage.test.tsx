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
    expect(screen.getByText(/This spellbook snapshot remains versioned separately from the reviewed 70245 talent tree/)).toBeTruthy()
    expect(screen.getByText('30 spell groups')).toBeTruthy()
    expect(screen.getByText(/Blizzard raised the Beta cap to Level 30 on October 1/)).toBeTruthy()
    expect(screen.getByText('Seal of Fury')).toBeTruthy()
    expect(screen.getAllByText('New in Forever').length).toBeGreaterThan(0)
    expect(screen.getByText('Consecration')).toBeTruthy()
    expect(screen.getAllByText('Former talent').length).toBeGreaterThan(0)
  })

  it('filters the imported spellbook by historical Level 20 and current-cap Level 30 ranges', () => {
    render(<SpellbookPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Protection' }))
    expect(screen.getByText('Seal of Fury')).toBeTruthy()
    expect(screen.queryByText('Holy Light')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Level 20 snapshot' }))
    expect(screen.getByText('Blessing of Kings')).toBeTruthy()
    expect(screen.queryByText('Hammer of the Righteous')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Level 30 range' }))
    expect(screen.getByText('Seal of Justice')).toBeTruthy()
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
    fireEvent.click(screen.getByRole('button', { name: 'Level 30 range' }))

    expect(gtag).toHaveBeenCalledWith('event', 'spellbook_filter', { category: 'retribution', level_cap: 'all' })
    expect(gtag).toHaveBeenCalledWith('event', 'spellbook_filter', { category: 'retribution', level_cap: '30' })
  })
})
