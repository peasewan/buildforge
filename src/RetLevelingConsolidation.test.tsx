import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AppRoute from './AppRoute'
import { pageForPath } from './lib/routes'
import { resolvePageHref } from './lib/pageRetirement'
import { renderLandingPrerender } from './lib/prerender'

afterEach(cleanup)

describe('Ret leveling consolidation', () => {
  it('opens the retained leveling tool from the old route without duplicating its timeline', () => {
    render(<AppRoute pathname="/wow-forever-retribution-paladin-leveling-build" />)

    expect(screen.getByRole('heading', { level: 1, name: 'WoW Forever Paladin Leveling Build' })).toBeTruthy()
    expect(screen.getAllByRole('slider', { name: 'Paladin progression level' })).toHaveLength(1)
    expect(pageForPath('/wow-forever-retribution-paladin-leveling-build')).toMatchObject({
      kind: 'build-landing', landingPageId: 'leveling',
      title: 'WoW Forever Paladin Leveling Build | BuildForgeTools',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-leveling-build',
    })
  })

  it('keeps historical selected ranks and removed-node evidence on the retained page', () => {
    render(<AppRoute pathname="/wow-forever-paladin-leveling-build" />)

    const history = screen.getByRole('region', { name: 'Historical Retribution leveling reference' })
    expect(history.textContent).toContain('20/0/31')
    expect(history.textContent).toContain('69913')
    expect(history.textContent).toMatch(/Crusade.*absent.*70245/)
    const ranks = within(history).getByRole('table', { name: 'Historical 20/0/31 selected talents' })
    expect(within(ranks).getByRole('row', { name: 'Retribution Crusade 2/2' })).toBeTruthy()
    expect(within(ranks).getByRole('row', { name: 'Retribution Twist of Light 1/1' })).toBeTruthy()
    expect(within(ranks).getAllByRole('row')).toHaveLength(20)
    expect(history.querySelector('a[href*="crusade.2"]')).toBeNull()
    for (const id of ['talent-allocation', 'build-overview', 'retribution-talents', 'holy-support', 'edit-and-share', 'beta-build-decisions']) {
      expect(document.getElementById(id), id).toBeTruthy()
    }
  })

  it('retains archive and FAQ anchors in the legacy prerender surface too', () => {
    const page = new DOMParser().parseFromString(renderLandingPrerender('leveling'), 'text/html')
    expect(page.querySelectorAll('.leveling-timeline')).toHaveLength(1)
    for (const id of ['ret-history', 'talent-allocation', 'build-overview', 'retribution-talents', 'holy-support', 'edit-and-share', 'beta-build-decisions']) {
      expect(page.getElementById(id), id).toBeTruthy()
    }
  })

  it('preserves old route queries and section anchors while leaving shared game builds unchanged', () => {
    expect(resolvePageHref('/wow-forever-retribution-paladin-leveling-build?from=saved#talent-allocation'))
      .toBe('/wow-forever-paladin-leveling-build?from=saved#talent-allocation')
    expect(resolvePageHref('/wow-forever-retribution-paladin-leveling-build/index.html#holy-support'))
      .toBe('/wow-forever-paladin-leveling-build#holy-support')
    const share = '/build?id=crusade.2&dataset=wow_forever_beta_1.60.1.69913#calculator'
    expect(resolvePageHref(share)).toBe(share)
  })
})
