import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import GlimmerwickWellPage from './GlimmerwickWellPage'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('Glimmerwick garden well ledger', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('keeps estimates separate from game-verified prices and cites the well evidence', () => {
    render(<GlimmerwickWellPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Songs of Glimmerwick Garden Well Sell Planner' })).toBeTruthy()
    expect(screen.getByText(/No item prices are prefilled/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Demo inventory observation/ })).toBeTruthy()
  })

  it('subtracts items kept and saves only a local ledger', () => {
    const view = render(<GlimmerwickWellPage />)
    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'My herb' } })
    fireEvent.change(screen.getByLabelText('Owned'), { target: { value: '7' } })
    fireEvent.change(screen.getByLabelText('Keep'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Unit price seen in game'), { target: { value: '12.50' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    const table = screen.getByRole('table', { name: 'Your well plan' })
    expect(within(table).getByText('My herb')).toBeTruthy()
    expect(within(table).getByText('4')).toBeTruthy()
    expect(within(table).getByText('50.00')).toBeTruthy()
    expect(localStorage.getItem('glimmerwick-well-ledger')).toContain('My herb')
    view.unmount()
    render(<GlimmerwickWellPage />)
    expect(screen.getByRole('table', { name: 'Your well plan' }).textContent).toContain('50.00')
  })

  it('does not let a keep count exceed owned stock', () => {
    render(<GlimmerwickWellPage />)
    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Herb' } })
    fireEvent.change(screen.getByLabelText('Owned'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Keep'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))
    expect(screen.getByRole('alert').textContent).toContain('cannot exceed')
    expect(screen.queryByRole('table', { name: 'Your well plan' })).toBeNull()
  })
})


it('updates the reserved quantity without deleting a saved item and rejects an oversell', () => {
  localStorage.setItem('glimmerwick-well-ledger', JSON.stringify([{ id: 'herb', name: 'Basil', owned: 7, keep: 3, unitPrice: 12.5 }]))
  const view = render(<GlimmerwickWellPage />)
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Keep Basil' }), { target: { value: '5' } })
  expect(screen.getByRole('table', { name: 'Your well plan' }).textContent).toContain('25.00')
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Keep Basil' }), { target: { value: '' } })
  expect((screen.getByRole('spinbutton', { name: 'Keep Basil' }) as HTMLInputElement).value).toBe('')
  expect(JSON.parse(localStorage.getItem('glimmerwick-well-ledger')!)[0].keep).toBe(5)
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Keep Basil' }), { target: { value: '8' } })
  expect(screen.getByRole('alert').textContent).toContain('cannot exceed')
  expect(JSON.parse(localStorage.getItem('glimmerwick-well-ledger')!)[0].keep).toBe(5)
  view.unmount()
  render(<GlimmerwickWellPage />)
  expect((screen.getByRole('spinbutton', { name: 'Keep Basil' }) as HTMLInputElement).value).toBe('5')
})

it('keeps missing tools and unsellable items separate from estimated proceeds', () => {
  render(<GlimmerwickWellPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Missing watering can' }))
  const answer = screen.getByRole('region', { name: 'Garden well help result' })
  expect(within(answer).getAllByText(/Kavita/).length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Item will not sell' }))
  expect(within(answer).getByText(/mountain bees/i)).toBeTruthy()
  expect(within(answer).queryByText(/Kavita/)).toBeNull()
  expect(screen.queryByRole('table', { name: 'Your well plan' })).toBeNull()
})
