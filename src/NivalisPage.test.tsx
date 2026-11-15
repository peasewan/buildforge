import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NivalisPage from './NivalisPage'
import AppRoute from './AppRoute'
import { pageForPath } from './lib/routes'
import { readFileSync } from 'node:fs'
import { track } from './lib/analytics'
vi.mock('./lib/analytics', () => ({ track: vi.fn() }))
beforeEach(() => { localStorage.clear(); vi.clearAllMocks() })
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
function fillScenario() {
  fireEvent.change(screen.getByLabelText('Business name'), { target: { value: 'Private test business' } })
  for (const [label, value] of [['Selling price per unit', '12'], ['Variable cost per unit', '5'], ['Units sold per period', '40'], ['Fixed costs per period', '100'], ['Operating hours per period', '4'], ['Initial investment', '500']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
  fireEvent.click(screen.getByRole('button', { name: 'Calculate profit' }))
}
describe('Nivalis retirement and preserved local planning helper', () => {
  it('serves honest retired metadata and a removal screen instead of the unpublished profit helper', () => {
    expect(pageForPath('/nivalis-nights-profit-calculator/')).toMatchObject({ kind: 'retired', canonical: 'https://buildforgetools.com/nivalis-nights-profit-calculator', robots: 'noindex, follow' })
    render(<AppRoute pathname="/nivalis-nights-profit-calculator" />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('This page has been retired')
    expect(screen.queryByLabelText('Business name')).toBeNull()
    expect(screen.getByRole('link', { name: 'Browse current tools' }).getAttribute('href')).toBe('/')
  })
  it('calculates a player-observed business, restores it and keeps names out of analytics', () => {
    const view = render(<NivalisPage />)
    fillScenario()
    expect(screen.getByTestId('net-profit').textContent).toBe('180.00')
    expect(screen.getByTestId('break-even').textContent).toBe('15 units')
    expect(JSON.stringify(vi.mocked(track).mock.calls)).not.toContain('Private test business')
    view.unmount()
    render(<NivalisPage />)
    expect((screen.getByLabelText('Selling price per unit') as HTMLInputElement).value).toBe('12')
    expect(screen.getByTestId('net-profit').textContent).toBe('180.00')
  })
  it('compares two periods without claiming a best in-game business', () => {
    render(<NivalisPage />)
    fillScenario()
    fireEvent.click(screen.getByRole('tab', { name: 'Business B' }))
    fillScenario()
    fireEvent.change(screen.getByLabelText('Units sold per period'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calculate profit' }))
    expect(screen.getByTestId('profit-difference').textContent).toContain('140.00')
    expect(screen.getByRole('table', { name: 'Business scenario comparison' })).toBeTruthy()
  })
  it('rejects missing inputs and fractional sales rather than showing false results', () => {
    render(<NivalisPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Calculate profit' }))
    expect(screen.getByRole('alert').textContent).toContain('Enter')
    fillScenario()
    fireEvent.change(screen.getByLabelText('Units sold per period'), { target: { value: '1.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calculate profit' }))
    expect(screen.getByRole('alert').textContent).toContain('whole')
  })
  it('keeps calculations usable when browser storage is denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(<NivalisPage />)
    fillScenario()
    expect(screen.getByTestId('net-profit').textContent).toBe('180.00')
    expect(screen.getByRole('status').textContent).toContain('Storage unavailable')
  })
  it('hides stale results when inputs change until the user recalculates', () => {
    render(<NivalisPage />)
    fillScenario()
    fireEvent.change(screen.getByLabelText('Selling price per unit'), { target: { value: '20' } })
    expect(screen.queryByTestId('net-profit')).toBeNull()
    expect(screen.getByText('Recalculate your changes')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Calculate profit' }))
    expect(screen.getByTestId('net-profit').textContent).toBe('500.00')
  })
  it('exports a local CSV and clears saved scenarios', () => {
    const create = vi.fn(() => 'blob:test'); const revoke = vi.fn()
    vi.stubGlobal('URL', class extends URL { static createObjectURL = create; static revokeObjectURL = revoke })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<NivalisPage />)
    fillScenario()
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(create).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:test')
    fireEvent.click(screen.getByRole('button', { name: 'Reset both businesses' }))
    expect(screen.queryByTestId('net-profit')).toBeNull()
    expect(JSON.parse(localStorage.getItem('nivalis-profit-plan')!).scenarios).toEqual([])
  })
  it('routes deployment requests to the 410 handler and removes public discovery and sitemap entries', () => {
    const page = pageForPath('/nivalis-nights-profit-calculator', '?utm_source=search')
    expect(page).toMatchObject({ kind: 'retired', robots: 'noindex, follow' })
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    for (const source of ['/nivalis-nights-profit-calculator', '/nivalis-nights-profit-calculator/index.html']) {
      expect(config.rewrites).toContainEqual({ source, destination: '/api/retired-page' })
      expect(config.redirects.some((redirect: { source: string }) => redirect.source === source)).toBe(false)
    }
    const sitemap = new DOMParser().parseFromString(readFileSync('public/sitemap.xml', 'utf8'), 'application/xml')
    expect([...sitemap.querySelectorAll('loc')].map(loc => loc.textContent)).not.toContain(page.canonical)
    const view = render(<AppRoute pathname="/" />)
    expect(view.container.querySelector('a[href="/nivalis-nights-profit-calculator"]')).toBeNull()
  })
})
