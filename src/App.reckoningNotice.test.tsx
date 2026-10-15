import { cleanup, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TalentTree } from './App'
import { OCTOBER_8_GAMEPLAY_SOURCE } from './data/october8Gameplay'
import { talents } from './data/talents'

afterEach(cleanup)

describe('Reckoning official gameplay notice', () => {
  it.each([0, 1, 5])('separates the official note from preserved text at selected rank %i', rank => {
    render(<TalentTree branch="protection" build={rank ? { reckoning: rank } : {}} onAdd={vi.fn()} />)
    const tooltip = document.getElementById('tip-reckoning')!
    const notice = within(tooltip).getByText(/Official gameplay note · October 8, 2026/)
    expect(notice.textContent).toContain('Reckoning can trigger at most once every 1.5 seconds.')
    expect(notice.textContent).toContain('separate from the preserved rank text')
    expect(within(notice).getByRole('link', { name: OCTOBER_8_GAMEPLAY_SOURCE.label }).getAttribute('href'))
      .toBe(OCTOBER_8_GAMEPLAY_SOURCE.url)

    const reckoning = talents.find(talent => talent.id === 'reckoning')!
    const rankText = within(tooltip).getByText(reckoning.rankDescriptions![Math.max(1, rank) - 1], { exact: true })
    expect(rankText).not.toBe(notice)
    expect(rankText.textContent).not.toContain('1.5 seconds')
    expect(within(tooltip).getByRole('link', { name: /Talents Forever/ }).getAttribute('href'))
      .toBe('https://talentsforever.com/data.json')
  })

  it('adds the gameplay notice only to current Reckoning', () => {
    const current = render(<>
      <TalentTree branch="holy" build={{}} onAdd={vi.fn()} />
      <TalentTree branch="protection" build={{}} onAdd={vi.fn()} />
      <TalentTree branch="retribution" build={{}} onAdd={vi.fn()} />
    </>)
    const notices = current.container.querySelectorAll('.talent-october-notice')
    expect(notices).toHaveLength(1)
    expect(notices[0].closest('.talent-tip')?.id).toBe('tip-reckoning')

    current.unmount()
    render(<TalentTree branch="protection" build={{ reckoning: 1 }} readOnly />)
    expect(document.getElementById('tip-reckoning')?.textContent).not.toContain('Official gameplay note')
  })
})
