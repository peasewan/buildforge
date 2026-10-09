import { createHash } from 'node:crypto'
import { renderToStaticMarkup } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import OfficialBuildChangeSummary from './OfficialBuildChangeSummary'

afterEach(cleanup)

it('lists selected changed talents with official source and historical data version', () => {
  render(<OfficialBuildChangeSummary className="paladin" buildVersion="1.60.1.69913" selectedTalents={[{ name: 'Redoubt', rank: 5 }]} />)
  expect(screen.getByText(/client 1\.60\.1\.69913/)).toBeTruthy()
  expect(screen.getByText(/Redoubt · 5 selected/)).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Source' }).getAttribute('href')).toContain('updated-october-1')
})

it('does not treat an empty tracked match as current verification', () => {
  render(<OfficialBuildChangeSummary className="paladin" buildVersion="1.60.1.69913" selectedTalents={[{ name: 'Divine Strength', rank: 5 }]} />)
  expect(screen.getByText(/No matching tracked announcement/)).toBeTruthy()
  expect(screen.getByText(/does not mean the build or talents are verified current/)).toBeTruthy()
})

it('flags the official two-handed tuning in a selected Retribution example', () => {
  render(<OfficialBuildChangeSummary className="paladin" buildVersion="1.60.1.69913" contextLabel="Historical Retribution" selectedTalents={[{ name: 'Two-Handed Weapon Specialization', rank: 3 }]} />)
  expect(screen.getByText(/damage increase reduced to 2\/4\/6%/i)).toBeTruthy()
  expect(screen.getByText(/allocation is a community or editorial example/i)).toBeTruthy()
})


it.each([
  ['hunter', 'Deflection', 'Survival Deflection now grants 1/2/3/4/5% Parry.'],
  ['warrior', 'Improved Slam', 'reduce Slam’s cooldown by 1.5/3 seconds'],
] as const)('uses reviewed current evidence for selected %s %s without the old tooltip qualification', (className, name, change) => {
  const view = render(<OfficialBuildChangeSummary className={className} buildVersion="1.60.1.70291" selectedTalents={[{ name, rank: 2 }]} />)
  expect(view.container.textContent).toContain('reviewed through 1.60.1.70291')
  expect(view.container.textContent).toContain('community evidence')
  expect(view.container.textContent).toContain('derived planning assumptions')
  expect(view.container.textContent).toContain(change)
  expect(view.container.textContent).not.toContain('69913 tooltip')
  expect(view.container.textContent).not.toContain('older 69913 client tooltip')
  expect(view.container.textContent).not.toContain('full newer-client tree remains unreconciled')
  expect(screen.getByRole('link', { name: 'Source' }).getAttribute('href')).toContain('blizzard.com')
  expect(screen.getByRole('link', { name: 'Reviewed client records' }).getAttribute('href')).toBe('https://wago.tools/db2/TraitNode/csv?build=1.60.1.70291')
})

it.each(['1.60.1.69913', '1.60.1.70300'])('retains historical or unreviewed qualifications for a Hunter build from %s', buildVersion => {
  const view = render(<OfficialBuildChangeSummary className="hunter" buildVersion={buildVersion} selectedTalents={[{ name: 'Deflection', rank: 5 }]} />)
  expect(view.container.textContent).toContain('This 69913 tooltip may show the older values.')
  expect(view.container.textContent).toContain('full newer-client tree remains unreconciled')
  expect(screen.getByRole('link', { name: 'Source' }).getAttribute('href')).toContain('updated-october-1')
  expect(screen.queryByRole('link', { name: 'Reviewed client records' })).toBeNull()
})

it('preserves the frozen historical Paladin summary markup', () => {
  const html = renderToStaticMarkup(<OfficialBuildChangeSummary className="paladin" buildVersion="1.60.1.69913" selectedTalents={[{ name: 'Redoubt', rank: 5 }]} />)
  expect(createHash('sha256').update(html).digest('hex')).toBe('614256b243444cb0e639d29060c7f0bc38f4e87d06d7fd2f9ba7ac60e1783779')
})
