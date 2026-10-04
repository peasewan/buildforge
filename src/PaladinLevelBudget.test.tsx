import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'
import { paladinLevelingHref } from './data/paladinLevelingProgression'
beforeEach(()=>{HTMLElement.prototype.scrollIntoView=vi.fn();localStorage.clear();sessionStorage.clear()})
afterEach(()=>{cleanup();window.history.replaceState({},'', '/');vi.restoreAllMocks()})
it('enforces a Level 30 link budget and preserves it through copying and local restore', async () => {
  window.history.replaceState({},'',paladinLevelingHref(30))
  const writeText=vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator,'clipboard',{value:{writeText},configurable:true})
  render(<App/>)
  expect(screen.getByLabelText('Planning level').getAttribute('value') ?? (screen.getByLabelText('Planning level') as HTMLSelectElement).value).toBe('30')
  expect(document.querySelector('.points-orb')?.textContent).toContain('/ 21')
  fireEvent.click(screen.getByRole('button',{name:/Vengeance, rank 1 of 3/}))
  expect(screen.queryByRole('button',{name:/Vengeance, rank 2 of 3/})).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:'Copy Build Link'}))
  await waitFor(()=>expect(writeText).toHaveBeenCalledWith(expect.stringContaining('&level=30#calculator')))
  cleanup();window.history.replaceState({},'', '/paladin');render(<App/>)
  expect((screen.getByLabelText('Planning level') as HTMLSelectElement).value).toBe('30')
})
it('rejects an over-budget shared route instead of silently switching to 51 points', () => {
  window.history.replaceState({},'',paladinLevelingHref(30).replace('level=30','level=20'))
  render(<App/>)
  expect(document.querySelector('.points-orb strong')?.textContent).toBe('0')
  expect(screen.getByText(/exceeds the requested level/i)).toBeTruthy()
})
it('allows growing from a low-level snapshot by explicitly raising the budget', () => {
  window.history.replaceState({},'',paladinLevelingHref(20))
  render(<App/>)
  fireEvent.change(screen.getByLabelText('Planning level'),{target:{value:'30'}})
  expect(document.querySelector('.points-orb')?.textContent).toContain('/ 21')
  fireEvent.click(screen.getByRole('button',{name:/Pursuit of Justice, rank 1 of 2/}))
  expect(screen.getByRole('button',{name:/Pursuit of Justice, rank 2 of 2/})).toBeTruthy()
})
it('counts a manual level-30 completion once, never a loaded preset', () => {
  const gtag=vi.fn();window.gtag=gtag
  window.history.replaceState({},'',paladinLevelingHref(29).replace('level=29','level=30'))
  render(<App/>)
  expect(gtag.mock.calls.filter(call=>call[1]==='build_complete')).toHaveLength(0)
  fireEvent.click(screen.getByRole('button',{name:/Vengeance, rank 0 of 3/}))
  expect(gtag.mock.calls.filter(call=>call[1]==='build_complete')).toHaveLength(1)
  expect(gtag).toHaveBeenCalledWith('event','build_complete',expect.objectContaining({level:30,point_cap:21,points:21}))
  fireEvent.click(screen.getByRole('button',{name:'Remove one rank from Vengeance'}))
  fireEvent.click(screen.getByRole('button',{name:/Vengeance, rank 0 of 3/}))
  expect(gtag.mock.calls.filter(call=>call[1]==='build_complete')).toHaveLength(1)
})
