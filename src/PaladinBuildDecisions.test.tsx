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
    expect(section.textContent).toMatch(/69913.*full.*tree/i)
    expect(section.textContent).toMatch(/70170.*selected Protection.*nodes/i)
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
