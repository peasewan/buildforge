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

  it('labels the Ret 69913 preview as historical while Crusade identity is unresolved', () => {
    render(<SpecTalentsPage spec="retribution" />)

    const preview = screen.getByRole('region', { name: 'Retribution talent preview' })
    expect(preview.textContent).toMatch(/historical.*Crusade.*under review/i)
    expect(preview.querySelector('a[href="/build?id=#calculator"]')).toBeTruthy()
    expect(document.body.textContent).not.toContain('current structure and rank tooltips')
    expect(screen.getAllByRole('link', { name: /Start a new build/i })).toHaveLength(2)
    expect(document.querySelectorAll('a[href="/build?id=#calculator"]').length).toBeGreaterThanOrEqual(3)
    expect(screen.queryByRole('link', { name: /Build this setup/i })).toBeNull()
    expect(preview.textContent).toMatch(/read-only preview/i)
    expect(preview.querySelectorAll('button')).toHaveLength(0)
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

    expect(screen.getByText('Beta build 1.60.1.69913')).toBeTruthy()
    expect(screen.getByText('69913 snapshot reviewed September 20, 2026')).toBeTruthy()
    expect(screen.getByText('0 tooltip updates since 69893 in that comparison')).toBeTruthy()
    expect(screen.getByText('Example Beta allocation')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Holy Paladin Talents Beta Talent Tree' })).toBeTruthy()
  })
})
