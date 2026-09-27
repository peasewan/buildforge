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
  beforeEach(() => { localStorage.clear(); window.gtag = vi.fn() })
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('renders a usable tool and clearly separates observed input from game facts', () => {
    const { container } = render(<GlimmerwickPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Songs of Glimmerwick Garden Planner' })).toBeTruthy()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('[data-surface="glimmerwick-garden"]')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Official Steam page and demo' })).toBeTruthy()
    expect(screen.getByText(/Growth times come from your observations/)).toBeTruthy()
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
    expect(within(screen.getByRole('table')).getByText('Day 8')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Remove My herb' }))
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('updates the planning day and shows when an estimate is ready', () => {
    render(<GlimmerwickPage />)
    addPlanting()
    fireEvent.change(screen.getByLabelText('Current garden day'), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update day' }))
    expect(screen.getByRole('table').textContent).toContain('Ready to check')
  })

  it('keeps the tool usable when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(<GlimmerwickPage />)
    addPlanting()
    expect(screen.getByRole('table').textContent).toContain('My herb')
    expect(screen.getByRole('status').textContent).toContain('Storage unavailable')
  })

  it('rejects invalid durations and day counts without changing the plan', () => {
    render(<GlimmerwickPage />)
    fireEvent.change(screen.getByLabelText('Crop name'), { target: { value: 'Herb' } })
    fireEvent.change(screen.getByLabelText('Observed growth days'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add planting' }))
    expect(screen.getByRole('alert').textContent).toContain('growth days 1–365')
    expect(screen.queryByRole('table')).toBeNull()
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
