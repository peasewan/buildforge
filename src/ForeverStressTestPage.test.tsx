import { cleanup, render, screen, within } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import ForeverStressTestPage from './ForeverStressTestPage'

afterEach(cleanup)

describe('WoW Forever stress-test guide', () => {
  it('leads with a dated, unconfirmed launcher report and one page heading', () => {
    render(<ForeverStressTestPage />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WoW Forever Stress Test')
    expect(screen.getByText('October 19 reported in Battle.net; exact hours and access unconfirmed.')).toBeTruthy()
    expect(document.querySelector('time[datetime="2026-10-15"]')?.textContent).toBe('October 15, 2026')
  })

  it('keeps reported availability separate from confirmed hours and eligibility', () => {
    render(<ForeverStressTestPage />)

    const table = screen.getByRole('table', { name: /Stress-test status/i })
    expect(within(table).getByRole('row', { name: /Date.*October 19, 2026.*launcher report/i })).toBeTruthy()
    expect(within(table).getByRole('row', { name: /Hours and time zone.*Unconfirmed/i })).toBeTruthy()
    expect(within(table).getByRole('row', { name: /Who can log in.*Unconfirmed/i })).toBeTruthy()
    expect(within(table).getByRole('row', { name: /Level cap and content.*Unconfirmed/i })).toBeTruthy()
    expect(screen.getByText(/has not confirmed that this specific listing is the promised Server Slam/i)).toBeTruthy()
    expect(screen.getByText(/A visible download does not confirm permission to log in/i)).toBeTruthy()
  })

  it('lets readers inspect the official announcement and original launcher report', () => {
    render(<ForeverStressTestPage />)

    expect(screen.getByRole('link', { name: /Blizzard: The World of Warcraft: Forever Beta Now Live/i }).getAttribute('href')).toBe('https://news.blizzard.com/en-us/article/24304160/the-world-of-warcraft-forever-beta-now-live')
    expect(screen.getByRole('link', { name: /Wowhead: stress-test launcher report/i }).getAttribute('href')).toBe('https://www.wowhead.com/forever/news/wow-forever-stress-test-available-on-october-19th-new-option-on-battle-net-383402')
    expect(screen.getByText(/Wowhead reports a separate.*WoW: Forever.*Stress Test.*entry/i)).toBeTruthy()
    expect(screen.getByText(/Closed-beta invitations and eligible bundle access do not establish access to this stress-test listing/i)).toBeTruthy()
  })

  it('offers preparation tools without treating the closed-beta cap as a stress-test rule', () => {
    render(<ForeverStressTestPage />)

    const preparation = screen.getByRole('region', { name: 'Prepare a class plan' })
    expect(within(preparation).getByRole('link', { name: /Choose a class/i }).getAttribute('href')).toBe('/wow-forever-class-picker')
    expect(within(preparation).getByRole('link', { name: /Paladin calculator/i }).getAttribute('href')).toBe('/paladin#calculator')
    expect(within(preparation).getByRole('link', { name: /Warrior calculator/i }).getAttribute('href')).toBe('/warrior#class-calculator')
    expect(within(preparation).getByText(/Level 30.*closed beta.*not a confirmed stress-test cap/i)).toBeTruthy()
  })

  it('renders useful server HTML without an invented event time or countdown', () => {
    const html = renderToString(<ForeverStressTestPage />)

    expect(html).toContain('WoW Forever Stress Test')
    expect(html).toContain('No start time or time zone is confirmed, so there is no reliable countdown or local-time conversion.')
    expect(html).not.toContain('"@type":"Event"')
    expect(html).not.toMatch(/role="timer"|data-countdown|startDate|free for everyone|no subscription required|no beta key required/i)
  })
})
