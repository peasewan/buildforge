import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import PaladinAllocationComparison from './PaladinAllocationComparison'
import { DATA_VERSION } from './data/talents'
import { RET_TWIST_REFERENCE } from './data/paladinRetReference'
import { track } from './lib/analytics'
vi.mock('./lib/analytics', () => ({ track: vi.fn() }))
afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks() })

it('pins A, compares live B, reopens A and restores A after returning', () => {
  const onLoad = vi.fn()
  const view = render(<PaladinAllocationComparison build={{ divine_intellect: 5 }} level={30} onLoad={onLoad} />)
  fireEvent.click(screen.getByRole('button', { name: 'Save current build as A' }))
  view.rerender(<PaladinAllocationComparison build={{ divine_intellect: 4, divine_strength: 1 }} level={30} onLoad={onLoad} />)
  const comparison = screen.getByRole('table', { name: 'Talent differences: A to B' })
  expect(within(comparison).getByText('Increases your total Intellect by 8%.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Restore A to Calculator' }))
  expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ build: { divine_intellect: 5 }, level: 30, dataset: DATA_VERSION }), 'saved_comparison')
  view.unmount()
  render(<PaladinAllocationComparison build={{ divine_intellect: 5 }} level={30} onLoad={onLoad} />)
  expect(screen.getByRole('link', { name: 'Open A in Calculator' }).getAttribute('href')).toContain('level=30')
  expect(screen.getByText('Both builds select the same talent ranks.')).toBeTruthy()
})

it('keeps live Beta and Level 60 references distinct and never claims completion when loading', () => {
  const onLoad = vi.fn()
  render(<PaladinAllocationComparison build={{ divine_intellect: 5 }} level={30} onLoad={onLoad} />)
  fireEvent.click(screen.getByRole('button', { name: 'Load 13/0/38 reference' }))
  expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ level: 60, build: expect.objectContaining({ twist_of_light: 1 }) }), 'community_reference')
  expect(screen.getByRole('link', { name: 'Mobalytics allocation source' }).getAttribute('href')).toContain('/retribution-paladin-guide')
  expect(vi.mocked(track).mock.calls.some(call => call[0] === 'build_complete')).toBe(false)
})

it('does not reuse a saved comparison from a different client dataset', () => {
  localStorage.setItem('buildforge-paladin-comparison-a-v1', JSON.stringify({ dataset: 'wow_forever_beta_1.60.1.69913', level: 30, build: { divine_intellect: 5 } }))
  render(<PaladinAllocationComparison build={{ divine_intellect: 5 }} level={30} onLoad={vi.fn()} />)
  expect(screen.queryByRole('link', { name: 'Open A in Calculator' })).toBeNull()
  expect(screen.getByText(/saved comparison needs review/i)).toBeTruthy()
})

it('preserves rejected A when loading a reference with a nonempty current draft', () => {
  const stale = JSON.stringify({ dataset: 'wow_forever_beta_1.60.1.69913', level: 30, build: { divine_intellect: 5 } })
  localStorage.setItem('buildforge-paladin-comparison-a-v1', stale)
  const onLoad = vi.fn()
  render(<PaladinAllocationComparison build={{ divine_intellect: 4 }} level={30} onLoad={onLoad} />)
  fireEvent.click(screen.getByRole('button', { name: 'Load 13/0/38 reference' }))
  expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ level: 60 }), 'community_reference')
  expect(localStorage.getItem('buildforge-paladin-comparison-a-v1')).toBe(stale)
})

it('does not re-label a reference whose reviewed dataset differs from the current tree', () => {
  const original = RET_TWIST_REFERENCE.dataset
  Object.defineProperty(RET_TWIST_REFERENCE, 'dataset', { value: 'wow_forever_beta_1.60.1.69913' })
  try {
    const onLoad = vi.fn()
    render(<PaladinAllocationComparison build={{}} level={30} onLoad={onLoad} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load 13/0/38 reference' }))
    expect(onLoad).not.toHaveBeenCalled()
    expect(screen.getByText(/reference needs a rule review/i)).toBeTruthy()
  } finally { Object.defineProperty(RET_TWIST_REFERENCE, 'dataset', { value: original }) }
})
