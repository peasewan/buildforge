import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import SpecTalentsPage from './SpecTalentsPage'
import { SPEC_TALENTS_PAGES } from './data/specTalentsPages'
import { branchNames } from './data/talents'

afterEach(cleanup)

describe('specialization talent guide', () => {
  it.each(SPEC_TALENTS_PAGES.map((page) => [page.spec, page.title, page.allocation.value] as const))(
    'renders the %s guide from its own configuration',
    (spec, title, allocation) => {
      render(<SpecTalentsPage spec={spec} />)

      expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
      expect(screen.getByLabelText(`${branchNames[spec]} talent tree`)).toBeTruthy()
      expect(screen.getByText(allocation)).toBeTruthy()
    },
  )

  it('shows the tree for the specialization it was asked for, not another', () => {
    render(<SpecTalentsPage spec="retribution" />)

    expect(screen.getByLabelText('Retribution talent tree')).toBeTruthy()
    expect(screen.queryByLabelText('Protection talent tree')).toBeNull()
    expect(screen.queryByLabelText('Holy talent tree')).toBeNull()
  })

  it('links each guide to the hub its configuration names', () => {
    for (const page of SPEC_TALENTS_PAGES) {
      cleanup()
      render(<SpecTalentsPage spec={page.spec} />)

      expect(document.querySelector(`a[href="${page.hub.href}"]`)).toBeTruthy()
    }
  })

  it('shows the reviewed Beta version on specialization talent pages', () => {
    render(<SpecTalentsPage spec="holy" />)

    expect(screen.getByText('Beta build 1.60.1.69893')).toBeTruthy()
    expect(screen.getByText('Updated September 18, 2026')).toBeTruthy()
    expect(screen.getByText('3 tooltip updates since 69876')).toBeTruthy()
    expect(screen.getByText('Example Beta allocation')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Holy Paladin Talents Beta Talent Tree' })).toBeTruthy()
  })
})
