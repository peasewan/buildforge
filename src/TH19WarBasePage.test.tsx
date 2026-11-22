import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import TH19WarBasePage from './TH19WarBasePage'

afterEach(cleanup)

it('keeps official copy links and their source previews in the initial HTML', () => {
  const document = new DOMParser().parseFromString(renderToStaticMarkup(<TH19WarBasePage />), 'text/html')
  const cards = [...document.querySelectorAll('#war-layouts article')]
  expect(cards.length).toBeGreaterThanOrEqual(3)
  const ids = cards.map(card => {
    const importLink = [...card.querySelectorAll('a')].find(link => link.textContent?.includes('Open in Clash of Clans'))
    expect(importLink).toBeDefined()
    const url = new URL(importLink!.href)
    expect(url.origin).toBe('https://link.clashofclans.com')
    expect(url.searchParams.get('action')).toBe('OpenLayout')
    expect(url.searchParams.get('id')).toMatch(/^TH19:WB:[A-Za-z0-9_-]+$/)
    expect([...card.querySelectorAll('a')].some(link => link.textContent?.includes('Preview at source'))).toBe(true)
    return url.searchParams.get('id')
  })
  expect(new Set(ids).size).toBe(cards.length)
})

it('filters the war layouts by their published focus and resets the visible list', () => {
  render(<TH19WarBasePage />)
  const layouts = screen.getByRole('region', { name: 'TH19 war layouts' })
  const initial = within(layouts).getAllByRole('article').length
  fireEvent.change(screen.getByLabelText('Defense goal'), { target: { value: 'anti-two' } })
  const filtered = within(layouts).getAllByRole('article')
  expect(filtered.length).toBeLessThan(initial)
  for (const card of filtered) expect(within(card).getByText('Anti 2-star', { exact: true })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Defense goal'), { target: { value: 'all' } })
  expect(within(layouts).getAllByRole('article')).toHaveLength(initial)
})

it('checks Archer Hall and Wizard Hall unlocks independently', () => {
  render(<TH19WarBasePage />)
  const archer = screen.getByRole('region', { name: 'Archer Hall' })
  const wizard = screen.getByRole('region', { name: 'Wizard Hall' })
  expect(within(archer).getByText('Requires level 15')).toBeTruthy()
  fireEvent.click(screen.getByLabelText('My Archer is level 15'))
  expect(within(archer).getByText('Unlocked')).toBeTruthy()
  expect(within(wizard).getByText('Requires level 15')).toBeTruthy()
})
