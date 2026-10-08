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

  it('labels the Ret 69913 preview as historical with Crusade client-confirmed absent', () => {
    render(<SpecTalentsPage spec="retribution" />)

    const preview = screen.getByRole('region', { name: 'Retribution talent preview' })
    expect(preview.textContent).toMatch(/historical.*Crusade.*absent.*70245/i)
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

  it('keeps the imported client version distinct from live-cap builds', () => {
    render(<SpecTalentsPage spec="holy" />)

    expect(screen.getByText('Beta build 1.60.1.70245')).toBeTruthy()
    expect(screen.getByText('70245 structure reviewed October 7, 2026')).toBeTruthy()
    expect(screen.getByText('14 talents with 32 changed rank strings since 69913 in that comparison')).toBeTruthy()
    expect(screen.getByText('Historical 51-point reference')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Holy Paladin Talents Beta Talent Tree' })).toBeTruthy()
  })

  it.each(SPEC_TALENTS_PAGES.map((page) => [page.spec, page.allocation.value] as const))(
    'does not offer the %s 51-point reference as a current Beta preset',
    (spec, allocation) => {
      render(<SpecTalentsPage spec={spec} />)

      expect(screen.getByText('Historical 51-point reference')).toBeTruthy()
      expect(screen.getByText(allocation)).toBeTruthy()
      expect(document.body.textContent).toMatch(/live Beta cap is Level 30/i)
      expect(screen.queryByRole('link', { name: /Build this setup/i })).toBeNull()
      expect(document.querySelectorAll('a[href="/build?id=#calculator"]').length).toBeGreaterThanOrEqual(3)
    },
  )
})
