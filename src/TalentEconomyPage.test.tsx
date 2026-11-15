import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import TalentEconomyPage from './TalentEconomyPage'
import { formatCopper } from './lib/talentEconomy'

afterEach(cleanup)

const change = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

describe('WoW Forever talent economy calculator', () => {
  it('compares the editable default fixed budget and shows break-even beyond the chosen horizon', () => {
    render(<TalentEconomyPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Respec & Dual Spec Cost Calculator' })).toBeTruthy()
    expect(screen.getByLabelText('Repeated resets total').textContent).toBe(formatCopper(400_000))
    expect(screen.getByLabelText('Unlock and switch fees total').textContent).toBe(formatCopper(500_000))
    expect(screen.getByLabelText('Break-even point').textContent).toContain('10 setup switches')
    expect(screen.getByText(/beyond your 8-switch plan/i)).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Cumulative cost after each priced switch' }).querySelectorAll('tbody tr')).toHaveLength(8)
  })

  it('recalculates both strategies when the reset quote and assumed switching fee change', () => {
    render(<TalentEconomyPage />)
    change('Next reset quote (gold)', '10')
    change('Switch fee after unlocking (gold)', '2')

    expect(screen.getByLabelText('Repeated resets total').textContent).toBe(formatCopper(800_000))
    expect(screen.getByLabelText('Unlock and switch fees total').textContent).toBe(formatCopper(660_000))
    expect(screen.getByLabelText('Projected saving with dual spec').textContent).toBe(formatCopper(140_000))
    expect(screen.getByLabelText('Break-even point').textContent).toContain('7 setup switches')
  })

  it('leaves unpriced sequence resets and savings unknown instead of extending a player report', () => {
    render(<TalentEconomyPage />)
    fireEvent.click(screen.getByRole('radio', { name: 'Sequence of quotes' }))

    expect(screen.getByText('Only 3 of 8 reset prices supplied.')).toBeTruthy()
    expect(screen.getByLabelText('Known reset subtotal').textContent).toBe(formatCopper(160_000))
    expect(screen.getByLabelText('Repeated resets total').textContent).toBe('Not fully priced')
    expect(screen.getByLabelText('Projected saving with dual spec').textContent).toBe('Not determined')
    expect(screen.getByLabelText('Break-even point').textContent).toBe('Not established from these quotes')
    expect(screen.getByRole('table', { name: 'Cumulative cost after each priced switch' }).querySelectorAll('tbody tr')).toHaveLength(3)
  })

  it('prices a complete supplied sequence without forcing the fixed-quote model', () => {
    render(<TalentEconomyPage />)
    fireEvent.click(screen.getByRole('radio', { name: 'Sequence of quotes' }))
    change('Planned setup switches', '3')

    expect(screen.getByLabelText('Repeated resets total').textContent).toBe(formatCopper(160_000))
    expect(screen.getByLabelText('Projected saving with dual spec').textContent).toBe(formatCopper(-340_000))
    expect(screen.queryByText(/Only 3 of 8 reset prices supplied/)).toBeNull()
  })

  it('keeps a planned but entirely unquoted sequence unknown rather than calling it a zero budget', () => {
    render(<TalentEconomyPage />)
    fireEvent.click(screen.getByRole('radio', { name: 'Sequence of quotes' }))
    change('Reset quotes in order (gold)', '')

    expect(screen.getByLabelText('Repeated resets total').textContent).toBe('Not fully priced')
    expect(screen.getByLabelText('Known reset subtotal').textContent).toBe(formatCopper(0))
    expect(screen.queryByText(/No paid resets planned/)).toBeNull()
    expect(screen.queryByRole('table', { name: 'Cumulative cost after each priced switch' })).toBeNull()
  })

  it('shows a genuine zero-switch plan separately from missing quotes', () => {
    render(<TalentEconomyPage />)
    change('Planned setup switches', '0')

    expect(screen.getByLabelText('Repeated resets total').textContent).toBe(formatCopper(0))
    expect(screen.getByLabelText('Unlock and switch fees total').textContent).toBe(formatCopper(500_000))
    expect(screen.getByText(/No paid resets planned/)).toBeTruthy()
  })

  it('marks a below-level-40 comparison as a future budget without hiding its assumptions', () => {
    render(<TalentEconomyPage />)
    change('Character level', '39')

    expect(screen.getByRole('note', { name: 'Dual spec eligibility' }).textContent).toMatch(/future budget.*Level 40/i)
    expect(screen.getByLabelText('Unlock and switch fees total').textContent).toBe(formatCopper(500_000))
  })

  it('hides numeric results while a required quote is invalid', () => {
    const { container } = render(<TalentEconomyPage />)
    change('Next reset quote (gold)', '')

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.queryByLabelText('Repeated resets total')).toBeNull()
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('rejects malformed quote sequences rather than silently dropping the bad quote', () => {
    render(<TalentEconomyPage />)
    fireEvent.click(screen.getByRole('radio', { name: 'Sequence of quotes' }))
    change('Reset quotes in order (gold)', '1, nope, 10')

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.queryByLabelText('Known reset subtotal')).toBeNull()
  })

  it('keeps source status, historical Beta limits and the calculator handoff visible', () => {
    render(<TalentEconomyPage />)
    const sources = screen.getByRole('region', { name: 'Sources and version limits' })
    expect(within(sources).getByText('Player report · November 11, 2026')).toBeTruthy()
    expect(within(sources).getByText('Derived assumption')).toBeTruthy()
    expect(within(sources).queryByText('Community verified')).toBeNull()
    expect(sources.textContent).toMatch(/historical Beta.*1 silver/i)
    expect(sources.textContent).toContain('Players were not prevented from resetting during the hour')
    expect(screen.getByRole('link', { name: /Choose a talent calculator/ }).getAttribute('href')).toBe('/wow-forever-classes')
    expect(screen.getByRole('heading', { level: 2, name: 'Talent reset cost questions' })).toBeTruthy()
  })
})
