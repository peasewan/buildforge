import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GlimmerwickFirstDaysPage from './GlimmerwickFirstDaysPage'

describe('Glimmerwick first-days checklist', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('gives new players five specific enrollment items, their shops, and a garden-planner link', () => {
    const { container } = render(<GlimmerwickFirstDaysPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Songs of Glimmerwick First Days Checklist' })).toBeTruthy()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    for (const item of ['Flute', 'Robe', 'Cauldron', 'Potion Starter Set', 'Skill Trinket']) {
      expect(screen.getByRole('checkbox', { name: `Collected ${item}` })).toBeTruthy()
    }
    expect(screen.getAllByText('Newt’s Eye Potion Supply')).toHaveLength(2)
    expect(screen.getByText('Swish & Stitch Clothier')).toBeTruthy()
    expect(screen.getByText('Practical Practice')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Open Garden Planner/ }).getAttribute('href')).toBe('/songs-of-glimmerwick')
    expect(screen.getByRole('link', { name: 'Into Indie Games walkthrough' }).getAttribute('href')).toBe('https://intoindiegames.com/walkthroughs/songs-of-glimmerwick-prologue-walkthrough/')
    expect(container.textContent).not.toContain('Drop Basil Seeds into the well')
  })

  it('tracks enrollment progress and restores it after a reload', () => {
    const view = render(<GlimmerwickFirstDaysPage />)
    expect(screen.getByText('0 of 5 supplies ready')).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Collected Robe' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Collected Potion Starter Set' }))
    expect(screen.getByText('2 of 5 supplies ready')).toBeTruthy()
    view.unmount()
    render(<GlimmerwickFirstDaysPage />)
    expect((screen.getByRole('checkbox', { name: 'Collected Robe' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Collected Potion Starter Set' }) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Clear checklist' }))
    expect(screen.getByText('0 of 5 supplies ready')).toBeTruthy()
  })

  it('keeps later steps independent of the supply count', () => {
    render(<GlimmerwickFirstDaysPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Done Meet Dean Clary' }))
    expect(screen.getByText('0 of 5 supplies ready')).toBeTruthy()
    expect((screen.getByRole('checkbox', { name: 'Done Meet Dean Clary' }) as HTMLInputElement).checked).toBe(true)
  })

  it('remains usable when stored data is malformed or browser storage is blocked', () => {
    localStorage.setItem('glimmerwick-first-days-v1', '{broken')
    const first = render(<GlimmerwickFirstDaysPage />)
    expect(screen.getByText('0 of 5 supplies ready')).toBeTruthy()
    first.unmount()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(<GlimmerwickFirstDaysPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Collected Flute' }))
    expect(screen.getByText('1 of 5 supplies ready')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toContain('not saved')
  })
})
