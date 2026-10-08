import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import InvokyrPage from './InvokyrPage'
import InvokyrLookup from './InvokyrLookup'
import { INVOKYR_EVIDENCE } from './data/invokyr'
import { track } from './lib/analytics'
vi.mock('./lib/analytics', () => ({ track: vi.fn() }))
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); localStorage.clear(); vi.restoreAllMocks(); vi.clearAllMocks() })
describe('Invokyr companion', () => {
  it('answers the Demo ending question on the main page while restoring the selected step', () => {
    window.history.replaceState(null, '', '/invokyr#step=folded')
    render(<InvokyrPage pageId="home" />)
    expect(screen.getByText(/Carry the board game into the end room/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Board folded up' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(/folded board alone/)).toBeTruthy()
    expect(screen.getByText(/not independently verified/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Ludogram developer reply/ })).toBeTruthy()
  })
  it('restores party links, checks limits and handles clipboard failure honestly', async () => {
    window.history.replaceState(null, '', '/invokyr-multiplayer#version=demo&players=5&issue=join')
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    render(<InvokyrPage pageId="multiplayer" />)
    expect(screen.getByText('5 players exceed the Demo limit')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Early Access' }))
    expect(screen.getByText(/5 players fit the announced/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Copy result link' }))
    await waitFor(() => expect(screen.getByLabelText('Share link')).toBeTruthy())
    expect(vi.mocked(track).mock.calls.filter(([e]) => e === 'invokyr_share')).toHaveLength(0)
  })
  it('clears a stale fallback after inputs change', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    render(<InvokyrPage pageId="multiplayer" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy result link' }))
    await waitFor(() => expect(screen.getByLabelText('Share link')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Early Access' }))
    expect(screen.queryByLabelText('Share link')).toBeNull()
  })
  it('restores same-page shared navigation for both tools', () => {
    const view = render(<InvokyrPage pageId="multiplayer" />)
    act(() => { window.history.replaceState(null, '', '/invokyr-multiplayer#version=demo&players=5&issue=join'); window.dispatchEvent(new HashChangeEvent('hashchange')) })
    expect(screen.getByText('5 players exceed the Demo limit')).toBeTruthy()
    view.unmount()
    render(<InvokyrPage pageId="home" />)
    act(() => { window.history.replaceState(null, '', '/invokyr#step=trigger'); window.dispatchEvent(new PopStateEvent('popstate')) })
    expect(screen.getByRole('button', { name: 'Ending did not trigger' }).getAttribute('aria-pressed')).toBe('true')
  })
  it('shares an ending step on the consolidated URL without the spoiler flag', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const view = render(<InvokyrPage pageId="home" />)
    fireEvent.click(screen.getByRole('button', { name: 'Ending did not trigger' }))
    const ending = view.container.querySelector('[data-surface="invokyr-ending"]')!
    fireEvent.click(within(ending as HTMLElement).getByRole('button', { name: 'Copy result link' }))
    await waitFor(() => expect(within(ending as HTMLElement).getByText('Link copied.')).toBeTruthy())
    expect(writeText.mock.calls[0][0]).toBe('https://buildforgetools.com/invokyr#step=trigger')
  })
  it('preserves shared state when skipping to content', () => {
    window.history.replaceState(null, '', '/invokyr-multiplayer#version=demo&players=5&issue=join')
    render(<InvokyrPage pageId="multiplayer" />)
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }))
    expect(document.activeElement?.id).toBe('iv-main')
    expect(window.location.hash).toContain('players=5')
    expect(screen.getByText('5 players exceed the Demo limit')).toBeTruthy()
  })
  it('copies success only after clipboard resolves', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<InvokyrPage pageId="multiplayer" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy result link' }))
    await waitFor(() => expect(screen.getByText('Link copied.')).toBeTruthy())
    expect(writeText.mock.calls[0][0]).toContain('/invokyr-multiplayer#version=demo')
  })
  it('filters future reviewed records and favorites survive reload', () => {
    const entries = [{ id: 'fixture-only', name: 'Fixture die', kind: 'dice' as const, description: 'Test fixture; never published.', evidence: INVOKYR_EVIDENCE.demo }]
    const view = render(<InvokyrLookup entries={entries} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save Fixture die' }))
    view.unmount()
    render(<InvokyrLookup entries={entries} />)
    fireEvent.click(screen.getByLabelText('Saved only'))
    expect(screen.getByRole('button', { name: 'Unsave Fixture die' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search records'), { target: { value: 'no match' } })
    expect(screen.getByText('No matching reviewed records.')).toBeTruthy()
  })
})
