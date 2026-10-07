import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import GlimmerwickSpellcastingPage from './GlimmerwickSpellcastingPage'

afterEach(cleanup)

describe('Songs of Glimmerwick spellcasting help', () => {
  it('answers the star requirement with source-linked, version-scoped evidence', () => {
    const { container } = render(<GlimmerwickSpellcastingPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Songs of Glimmerwick Spellcasting Guide' })).toBeTruthy()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.getByText(/you do not need stars to cast spells/i)).toBeTruthy()
    expect(screen.getAllByText(/Demo 0\.466/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Developer update 0\.466/i }).getAttribute('href')).toBe('https://store.steampowered.com/news/app/1706510/view/515239886340494123')
    expect(screen.getByRole('link', { name: /Developer update 0\.484/i }).getAttribute('href')).toBe('https://store.steampowered.com/news/app/1706510/view/711152269082494267')
  })

  it('switches between a direct-casting route and an optional practice route', () => {
    render(<GlimmerwickSpellcastingPage />)
    const cast = screen.getByRole('button', { name: 'Just cast' })
    const practice = screen.getByRole('button', { name: 'Practice first' })
    const panel = screen.getByRole('region', { name: 'Your spellcasting route' })
    expect(cast.getAttribute('aria-pressed')).toBe('true')
    expect(within(panel).getByRole('heading', { name: 'Cast without chasing stars' })).toBeTruthy()
    fireEvent.click(practice)
    expect(practice.getAttribute('aria-pressed')).toBe('true')
    expect(cast.getAttribute('aria-pressed')).toBe('false')
    expect(within(panel).getByText(/practice rooms in the music classroom/i)).toBeTruthy()
    expect(within(panel).getByText(/extra help in the music minigame options/i)).toBeTruthy()
    fireEvent.click(cast)
    expect(within(panel).getByRole('heading', { name: 'Cast without chasing stars' })).toBeTruthy()
  })

  it('keeps the page distinct from a fabricated song database and links related tools', () => {
    const { container } = render(<GlimmerwickSpellcastingPage />)
    expect(container.querySelector('[data-surface="glimmerwick-spellcasting"]')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Garden Planner/i }).some(link => link.getAttribute('href') === '/songs-of-glimmerwick')).toBe(true)
    expect(screen.getAllByRole('link', { name: /First Days/i }).some(link => link.getAttribute('href') === '/songs-of-glimmerwick-first-days')).toBe(true)
    expect(screen.getByText(/not a complete song catalog/i)).toBeTruthy()
  })
})


it('routes short-song and score problems to different version-scoped advice', () => {
  render(<GlimmerwickSpellcastingPage />)
  fireEvent.click(screen.getByRole('button', { name: 'No practice version' }))
  let answer = screen.getByRole('region', { name: 'Spellcasting help result' })
  expect(within(answer).getByText(/Alchemical Resonance/)).toBeTruthy()
  expect(within(answer).getByRole('link', { name: /Developer update 1.03/ }).getAttribute('href')).toBe('https://steamcommunity.com/games/1706510/announcements/detail/680763661892976649')
  fireEvent.click(screen.getByRole('button', { name: 'I cannot earn stars' }))
  answer = screen.getByRole('region', { name: 'Spellcasting help result' })
  expect(within(answer).queryByText(/Alchemical Resonance/)).toBeNull()
  expect(within(answer).getByRole('link', { name: /Demo update 0.466/ })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Something else' }))
  expect(within(answer).getByText(/not enough verified information/i)).toBeTruthy()
})
