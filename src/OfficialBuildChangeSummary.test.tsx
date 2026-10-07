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
