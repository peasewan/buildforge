import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, it } from 'vitest'
import DandyLabCardsPage from './DandyLabCardsPage'
import { labCards } from './data/dandyLabCards'
import { planAmbrosia } from './lib/labAmbrosia'

afterEach(cleanup)

it('rounds remaining runs up using the selected cost, current balance and user yield', () => {
  expect(planAmbrosia(1500, '300', '250')).toEqual({ shortfall: 1200, runs: 5 })
  expect(planAmbrosia(500, '700', '')).toEqual({ shortfall: 0, runs: 0 })
  expect(planAmbrosia(500, '100', '')).toEqual({ shortfall: 400, runs: null })
  expect(planAmbrosia(500, '100', '0')).toEqual({ shortfall: 400, runs: null })
  expect(planAmbrosia(500, '-1', '10')).toEqual({ shortfall: null, runs: null })
  expect(planAmbrosia(500, '', '10')).toEqual({ shortfall: null, runs: null })
  expect(planAmbrosia(500, '0', '1.5')).toEqual({ shortfall: 500, runs: null })
})

it('renders the documented card data and sources in the initial HTML', () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<DandyLabCardsPage />), 'text/html')
  expect(doc.querySelectorAll('h1')).toHaveLength(1)
  expect(labCards.length).toBeGreaterThanOrEqual(3)
  expect(new Set(labCards.map(card => card.id)).size).toBe(labCards.length)
  for (const card of labCards) {
    expect(Number.isSafeInteger(card.cost) && card.cost > 0).toBe(true)
    expect(card.sources.length).toBeGreaterThan(0)
    expect(doc.querySelector('main')?.textContent).toContain(card.name)
  }
  expect(doc.querySelector('#lab-sources a[href^="https://"]')).toBeTruthy()
})

it('keeps selected cards in the budget when filters hide them and removes picks individually', () => {
  render(<DandyLabCardsPage />)
  const [first, second] = labCards
  fireEvent.click(screen.getByRole('checkbox', { name: `Add ${first.name} to budget` }))
  fireEvent.click(screen.getByRole('checkbox', { name: `Add ${second.name} to budget` }))
  const budget = screen.getByRole('region', { name: 'Ambrosia calculator' })
  const total = first.cost + second.cost
  fireEvent.change(screen.getByLabelText('Current Ambrosia'), { target: { value: '100' } })
  fireEvent.change(screen.getByLabelText('Ambrosia per run'), { target: { value: '200' } })
  expect(within(budget).getByLabelText('Selected cost').textContent).toBe(total.toLocaleString('en-US'))
  expect(within(budget).getByLabelText('Still needed').textContent).toBe((total - 100).toLocaleString('en-US'))
  expect(within(budget).getByLabelText('Estimated runs').textContent).toBe(String(Math.ceil((total - 100) / 200)))
  fireEvent.change(screen.getByLabelText('Search cards'), { target: { value: 'no_matching_card_97' } })
  expect(screen.queryByRole('checkbox', { name: `Add ${first.name} to budget` })).toBeNull()
  expect(within(budget).getByText(first.name)).toBeTruthy()
  fireEvent.click(within(budget).getByRole('button', { name: `Remove ${first.name}` }))
  expect(within(budget).getByLabelText('Selected cost').textContent).toBe(second.cost.toLocaleString('en-US'))
})
