import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GlimmerwickPage from './GlimmerwickPage'

function addPlanting() {
  fireEvent.change(screen.getByLabelText('Crop name'), { target: { value: 'My herb' } })
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '6' } })
  fireEvent.change(screen.getByLabelText('Planting day'), { target: { value: '3' } })
  fireEvent.change(screen.getByLabelText('Observed growth days'), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Try a watering song' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add planting' }))
}

describe('Glimmerwick garden tool', () => {
  beforeEach(() => { localStorage.clear(); window.gtag = vi.fn(); history.replaceState({}, '', '/songs-of-glimmerwick') })
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('renders a usable tool and clearly separates observed input from game facts', () => {
    const { container } = render(<GlimmerwickPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Songs of Glimmerwick Garden Planner' })).toBeTruthy()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('[data-surface="glimmerwick-garden"]')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Official Steam page' })).toBeTruthy()
    expect(screen.getByText(/Growth times come from your observations/)).toBeTruthy()
  })

  it('keeps the checklist and spellcasting helpers usable on the garden page without duplicate page shells', () => {
    const { container } = render(<GlimmerwickPage />)
    addPlanting()
    fireEvent.click(screen.getByText('First Days Checklist', { selector: 'summary' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Collected Robe' }))
    expect(screen.getByText('1 of 5 supplies ready')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Into Indie Games walkthrough' })).toBeTruthy()
    expect(screen.getByText(/not an official item database/)).toBeTruthy()

    fireEvent.click(screen.getByText('Spellcasting Basics', { selector: 'summary' }))
    expect(screen.queryByRole('checkbox', { name: 'Collected Robe' })).toBeNull()
    expect(container.querySelectorAll('#spellcasting-help')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'I cannot earn stars' }))
    const result = screen.getByRole('region', { name: 'Spellcasting help result' })
    expect(within(result).getByText(/Demo evidence, not a fresh test/)).toBeTruthy()
    expect(within(result).getByRole('link', { name: /Demo update 0.466/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Practice first' }))
    expect(within(screen.getByRole('region', { name: 'Your spellcasting route' })).getByText(/practice rooms in the music classroom/)).toBeTruthy()

    fireEvent.click(screen.getByText('First Days Checklist', { selector: 'summary' }))
    expect((screen.getByRole('checkbox', { name: 'Collected Robe' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.queryByRole('region', { name: 'Spellcasting help result' })).toBeNull()
    expect(screen.getByRole('table', { name: 'Your harvest schedule' }).textContent).toContain('My herb')
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('footer')).toHaveLength(1)
    expect(container.querySelectorAll('.gw-header, .gs-header')).toHaveLength(1)
    const hrefs = [...container.querySelectorAll('a[href]')].map(link => link.getAttribute('href'))
    expect(hrefs.some(href => href?.startsWith('/songs-of-glimmerwick-first-days'))).toBe(false)
    expect(hrefs.some(href => href?.startsWith('/songs-of-glimmerwick-spellcasting'))).toBe(false)
    expect(hrefs).toContain('/songs-of-glimmerwick-garden-well')
  })

  it('opens the matching helper for direct anchors and subsequent hash navigation', () => {
    history.replaceState({}, '', '/songs-of-glimmerwick#spellcasting')
    render(<GlimmerwickPage />)
    expect(screen.getByRole('button', { name: 'No practice version' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Collected Flute' })).toBeNull()
    history.replaceState({}, '', '/songs-of-glimmerwick#first-days')
    fireEvent(window, new HashChangeEvent('hashchange'))
    expect(screen.getByRole('checkbox', { name: 'Collected Flute' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'No practice version' })).toBeNull()
  })

  it('adds, persists, edits and removes a planting without sending its text to analytics', () => {
    const view = render(<GlimmerwickPage />)
    addPlanting()
    const table = screen.getByRole('table', { name: 'Your harvest schedule' })
    expect(within(table).getByText('My herb')).toBeTruthy()
    expect(within(table).getByText('Day 7')).toBeTruthy()
    expect(localStorage.getItem('glimmerwick-garden-plan')).toContain('My herb')
    expect(JSON.stringify((window.gtag as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('My herb')
    view.unmount()
    render(<GlimmerwickPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit My herb' }))
    fireEvent.change(screen.getByLabelText('Observed growth days'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(within(screen.getByRole('table', { name: 'Your harvest schedule' })).getByText('Day 8')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove My herb' }))
    expect(screen.queryByRole('table', { name: 'Your harvest schedule' })).toBeNull()
  })

  it('starts Basil from reviewed footage without filling unverified growth values', () => {
    render(<GlimmerwickPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Use Basil' }))
    expect((screen.getByLabelText('Crop name') as HTMLInputElement).value).toBe('Basil')
    expect((screen.getByLabelText('Observed growth days') as HTMLInputElement).value).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Add planting' }))
    const table = screen.getByRole('table', { name: 'Your harvest schedule' })
    expect(within(table).getByText('Basil')).toBeTruthy()
    expect(table.textContent).toContain('Growth unknown')
    expect(table.textContent).not.toContain('Ready to check')
    expect(JSON.parse(localStorage.getItem('glimmerwick-garden-plan')!).plantings[0].growthDays).toBeNull()
    expect(screen.getByRole('link', { name: 'Basil footage · 1:48' }).getAttribute('href')).toBe('https://www.youtube.com/watch?v=dm_9ViL_soU&t=108s')
  })

  it('reflects the live release and offers launch-observed crops without invented numbers', () => {
    render(<GlimmerwickPage />)
    expect(screen.getByText('Released Sep 30, 2026')).toBeTruthy()
    const table = screen.getByRole('table', { name: 'Songs of Glimmerwick crop evidence' })
    expect(within(table).getByText('Marjoram')).toBeTruthy()
    expect(within(table).getByText('Cranberries')).toBeTruthy()
    expect(within(table).getAllByText('Not verified')).toHaveLength(12)
    fireEvent.click(screen.getByRole('button', { name: 'Use Marjoram' }))
    expect((screen.getByLabelText('Crop name') as HTMLInputElement).value).toBe('Marjoram')
    expect((screen.getByLabelText('Observed growth days') as HTMLInputElement).value).toBe('')
  })

  it('records a personal harvest observation without claiming an official growth time', () => {
    const view = render(<GlimmerwickPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Use Basil' }))
    fireEvent.change(screen.getByLabelText('Planting day'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add planting' }))
    fireEvent.click(screen.getByRole('button', { name: 'Record harvest for Basil' }))
    expect(screen.getByRole('alert').textContent).toContain('harvest day')
    fireEvent.change(screen.getByLabelText('Current garden day'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update day' }))
    fireEvent.click(screen.getByRole('button', { name: 'Record harvest for Basil' }))
    const observation = JSON.parse(localStorage.getItem('glimmerwick-garden-plan')!).plantings[0]
    expect(observation).toMatchObject({ crop: 'Basil', plantedDay: 3, growthDays: 4, harvestedDay: 7 })
    expect(screen.getByRole('table', { name: 'Your harvest schedule' }).textContent).toContain('Observed · Day 7')
    expect(screen.getByRole('table', { name: 'Your harvest schedule' }).textContent).toContain('4 elapsed days')
    expect(JSON.stringify((window.gtag as ReturnType<typeof vi.fn>).mock.calls)).not.toContain('Basil')
    view.unmount()
    render(<GlimmerwickPage />)
    expect(screen.getByRole('table', { name: 'Your harvest schedule' }).textContent).toContain('Observed · Day 7')
  })

  it('clears a different crop duration when choosing the reviewed Basil name', () => {
    render(<GlimmerwickPage />)
    fireEvent.change(screen.getByLabelText('Crop name'), { target: { value: 'Other crop' } })
    fireEvent.change(screen.getByLabelText('Observed growth days'), { target: { value: '9' } })
    fireEvent.click(screen.getByRole('button', { name: 'Use Basil' }))
    expect((screen.getByLabelText('Observed growth days') as HTMLInputElement).value).toBe('')
  })

  it('updates the planning day and shows when an estimate is ready', () => {
    render(<GlimmerwickPage />)
    addPlanting()
    fireEvent.change(screen.getByLabelText('Current garden day'), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update day' }))
    expect(screen.getByRole('table', { name: 'Your harvest schedule' }).textContent).toContain('Ready to check')
  })

  it('keeps the tool usable when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(<GlimmerwickPage />)
    addPlanting()
    expect(screen.getByRole('table', { name: 'Your harvest schedule' }).textContent).toContain('My herb')
    expect(screen.getByRole('status').textContent).toContain('Storage unavailable')
  })

  it('rejects invalid durations and day counts without changing the plan', () => {
    render(<GlimmerwickPage />)
    fireEvent.change(screen.getByLabelText('Crop name'), { target: { value: 'Herb' } })
    fireEvent.change(screen.getByLabelText('Observed growth days'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add planting' }))
    expect(screen.getByRole('alert').textContent).toContain('growth days 1–365')
    expect(screen.queryByRole('table', { name: 'Your harvest schedule' })).toBeNull()
    fireEvent.change(screen.getByLabelText('Current garden day'), { target: { value: '1.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update day' }))
    expect(screen.getAllByRole('alert').some(element => element.textContent?.includes('whole-number day'))).toBe(true)
    expect(localStorage.getItem('glimmerwick-garden-plan')).toBeNull()
  })

  it('exports a local CSV file and records only the row count', () => {
    const createUrl = vi.fn(() => 'blob:garden-plan')
    const revokeUrl = vi.fn()
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL
    URL.createObjectURL = createUrl
    URL.revokeObjectURL = revokeUrl
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function(this: HTMLAnchorElement) {
      expect(this.download).toBe('glimmerwick-garden-plan.csv')
      expect(this.href).toBe('blob:garden-plan')
    })
    try {
      render(<GlimmerwickPage />)
      expect((screen.getByRole('button', { name: 'Export CSV' }) as HTMLButtonElement).disabled).toBe(true)
      addPlanting()
      fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
      expect(click).toHaveBeenCalledOnce()
      expect(createUrl.mock.calls[0][0]).toBeInstanceOf(Blob)
      expect(revokeUrl).toHaveBeenCalledWith('blob:garden-plan')
      expect(window.gtag).toHaveBeenCalledWith('event', 'glimmerwick_plan_export', { planting_count: 1 })
    } finally {
      URL.createObjectURL = originalCreate
      URL.revokeObjectURL = originalRevoke
    }
  })
})
