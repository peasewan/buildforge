import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PaladinBuildDecisions from './PaladinBuildDecisions'

afterEach(cleanup)

describe('Level 30 Paladin build decisions', () => {
  it.each(['holy', 'protection', 'retribution'] as const)('explains the %s point budget and the scope of client review', (branch) => {
    render(<PaladinBuildDecisions branch={branch} />)

    const section = document.querySelector('#beta-build-decisions')!
    expect(section.textContent).toMatch(/Level 30.*21 standard points/i)
    expect(section.textContent).toMatch(/Legacy: Talented.*up to 26/i)
    expect(section.textContent).toMatch(/full.*50-node.*70245.*tree/i)
    expect(section.textContent).toMatch(/70170.*selected Protection.*route nodes/i)
    expect(section.querySelector('a[href="https://news.blizzard.com/en-us/article/24307383/get-to-know-the-world-of-warcraft-forever-legacy-system"]')).toBeTruthy()
  })

  it('keeps Holy Shield out of Level 30 and frames Bulwark versus Reckoning as a point decision', () => {
    render(<PaladinBuildDecisions branch="protection" />)

    expect(screen.getByRole('heading', { name: /Holy Shield at Level 30/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Bulwark or Reckoning/i })).toBeTruthy()
    const holyShield = screen.getByRole('heading', { name: /Holy Shield at Level 30/i }).closest('article')!
    expect(holyShield.textContent).toMatch(/31 Protection points/i)
    expect(holyShield.textContent).toMatch(/26-point.*Talented/i)
    const choice = screen.getByRole('heading', { name: /Bulwark or Reckoning/i }).closest('article')!
    expect(choice.textContent).toMatch(/21st point/i)
    expect(choice.textContent).toMatch(/shield-only.*not verified/i)
  })

  it.each([
    ['holy', /Where do my remaining Holy points go/i, /21\/0\/0/i],
    ['retribution', /Where do my remaining Ret points go/i, /0\/0\/21/i],
  ] as const)('answers the remaining point question for %s without presenting a measured winner', (branch, heading, allocation) => {
    render(<PaladinBuildDecisions branch={branch} />)

    const answer = screen.getByRole('heading', { name: heading }).closest('article')!
    expect(answer.textContent).toMatch(allocation)
    expect(answer.textContent).toMatch(/editorial/i)
    expect(answer.textContent).toMatch(/not.*measured/i)
  })
})


describe('Protection weapon and threat evidence', () => {
  it('separates the dated official threat fix from the weapon-speed community question', () => {
    render(<PaladinBuildDecisions branch="protection" />)
    const official = screen.getByRole('region', { name: 'October 8 Protection gameplay changes' })
    expect(official.textContent).toMatch(/Mana restoration.*no longer generates threat/i)
    expect(official.textContent).toMatch(/1\.5 seconds/i)
    expect(official.querySelector('a[href$="/2360696/5"]')).toBeTruthy()
    const comparison = screen.getByRole('table', { name: 'Protection weapon-speed comparison checklist' })
    expect(comparison.textContent).toMatch(/Faster weapon/)
    expect(comparison.textContent).toMatch(/Slower weapon/)
    expect(screen.getByRole('link', { name: 'Read the October 10 player discussion' }).getAttribute('href')).toContain('/2378322')
    expect(document.querySelector('#beta-build-decisions')?.textContent).toMatch(/not a verified best-weapon recommendation/i)
  })
  it.each(['holy', 'retribution'] as const)('does not add Protection-only advice to %s', branch => {
    render(<PaladinBuildDecisions branch={branch} />)
    expect(screen.queryByRole('region', { name: 'October 8 Protection gameplay changes' })).toBeNull()
    expect(screen.queryByRole('table', { name: 'Protection weapon-speed comparison checklist' })).toBeNull()
  })
})
