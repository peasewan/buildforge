import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { RET_TWIST_REFERENCE } from './data/paladinRetReference'
import { DATA_VERSION } from './data/talents'
import { createPaladinSnapshot, paladinSnapshotHref } from './lib/paladinComparison'
import { encodeBuild } from './lib/build'
import { track } from './lib/analytics'
vi.mock('./lib/analytics', () => ({ track: vi.fn(), reportSharedBuild: vi.fn() }))
beforeEach(() => { HTMLElement.prototype.scrollIntoView = vi.fn() })
afterEach(() => { cleanup(); localStorage.clear(); window.history.replaceState({}, '', '/paladin'); vi.clearAllMocks() })

it('loads the full reference explicitly, blocks a 52nd point and preserves edits after sharing', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  try {
    const view = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Load 13/0/38 reference' }))
    expect((screen.getByRole('combobox', { name: 'Planning level' }) as HTMLSelectElement).value).toBe('60')
    expect(document.querySelector('.points-orb strong')?.textContent).toBe('51')
    fireEvent.click(screen.getByRole('button', { name: 'Deflection, rank 2 of 5' }))
    expect(document.querySelector('.points-orb strong')?.textContent).toBe('51')
    expect(vi.mocked(track).mock.calls.some(call => call[0] === 'build_complete')).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Build Link' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    const share = new URL(writeText.mock.calls[0][0])
    expect(share.searchParams.get('level')).toBe('60')
    expect(share.searchParams.get('dataset')).toBe(DATA_VERSION)
    view.unmount()
    window.history.replaceState({}, '', `${share.pathname}${share.search}${share.hash}`)
    render(<App />)
    expect(document.querySelector('.points-orb strong')?.textContent).toBe('51')
    expect(localStorage.getItem('wow-forever-paladin-build')).toBe(encodeBuild(RET_TWIST_REFERENCE.build))
    fireEvent.click(screen.getByRole('button', { name: 'Remove one rank from Deflection' }))
    expect(document.querySelector('.points-orb strong')?.textContent).toBe('50')
    expect(new URLSearchParams(window.location.search).get('id')).toContain('deflection.1')
  } finally {
    if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor)
    else Reflect.deleteProperty(navigator, 'clipboard')
  }
})

it('rejects a full reference forced into a 21-point URL without partial import', () => {
  const full = createPaladinSnapshot(RET_TWIST_REFERENCE.build, 60)!
  window.history.replaceState({}, '', paladinSnapshotHref(full).replace('level=60', 'level=30'))
  render(<App />)
  expect(document.querySelector('.points-orb strong')?.textContent).toBe('0')
  expect(screen.getByText(/shared build exceeds the requested level/i)).toBeTruthy()
})

it('rejects a versioned share from a different dataset before treating it as current', () => {
  window.history.replaceState({}, '', '/build?id=divine_intellect.5&level=30&dataset=unreviewed-build#calculator')
  render(<App />)
  expect(document.querySelector('.points-orb strong')?.textContent).toBe('0')
  expect(screen.getByText(/different talent dataset/i)).toBeTruthy()
})

it('requires an explicit new current build before references can replace a historical draft', () => {
  localStorage.setItem('wow-forever-paladin-build', 'improved_holy_strike.1')
  render(<App />)
  expect(screen.getByRole('region', { name: 'Historical Paladin allocation' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Load 13/0/38 reference' })).toBeNull()
  expect(localStorage.getItem('wow-forever-paladin-build')).toBe('improved_holy_strike.1')
  fireEvent.click(screen.getByRole('button', { name: 'Start a new current build' }))
  expect(screen.getByRole('button', { name: 'Load 13/0/38 reference' })).toBeTruthy()
})

it('keeps current edits after a rejected dataset link, including level changes and reload', () => {
  localStorage.setItem('wow-forever-paladin-build', 'divine_strength.2')
  window.history.replaceState({}, '', '/build?id=divine_intellect.5&level=30&dataset=unreviewed-build#calculator')
  const view = render(<App />)
  expect(localStorage.getItem('wow-forever-paladin-build')).toBe('divine_strength.2')
  fireEvent.click(screen.getByRole('button', { name: 'Divine Intellect, rank 0 of 5' }))
  fireEvent.change(screen.getByRole('combobox', { name: 'Planning level' }), { target: { value: '30' } })
  const params = new URLSearchParams(window.location.search)
  expect(params.get('dataset')).toBe(DATA_VERSION)
  expect(params.get('level')).toBe('30')
  view.unmount()
  render(<App />)
  expect(document.querySelector('.points-orb strong')?.textContent).toBe('1')
})
