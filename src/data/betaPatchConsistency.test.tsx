import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BetaDataStatus from '../BetaDataStatus'
import BetaChangesPage from '../BetaChangesPage'
import { renderBetaStatusPrerender } from '../lib/prerender'
import { BETA_LEVELING_SNAPSHOTS } from './levelingBeta'
import { BETA_SPEC_PATHS } from './betaSpecPaths'
import { betaTalents, talentEvidenceLabel, talents } from './talents'

describe('Paladin snapshot and September 24 patch truth', () => {
  it('keeps the 69913 import intact but identifies the officially removed talent in the current planner', () => {
    const historical = betaTalents.find((talent) => talent.id === 'improved_holy_strike')
    const planner = talents.find((talent) => talent.id === 'improved_holy_strike')

    expect(historical).toBeDefined()
    expect(historical?.currentBetaAvailability).toBeUndefined()
    expect(planner?.currentBetaAvailability).toBe('removed_official')
    expect(talentEvidenceLabel(planner!)).toMatch(/removed.*September 24/i)
    const crusade = talents.find((talent) => talent.id === 'crusade')
    expect(betaTalents.find((talent) => talent.id === 'crusade')?.currentBetaAvailability).toBeUndefined()
    expect(crusade?.currentBetaAvailability).toBe('reported_removed_under_review')
    expect(talentEvidenceLabel(crusade!)).toMatch(/70009.*under review/i)
  })

  it('labels the zero-change count as only the 69893-to-69913 snapshot comparison', () => {
    const html = renderToStaticMarkup(<BetaDataStatus />)

    expect(html).toContain('Imported client snapshot')
    expect(html).toContain('1.60.1.69893 → 1.60.1.69913')
    expect(html).toContain('September 24')
    expect(html).not.toContain('Current talent dataset')
    const prerender = renderBetaStatusPrerender()
    expect(prerender).toContain('1.60.1.69893 → 1.60.1.69913')
    expect(prerender).not.toContain('latest client diff')
    const changes = renderToStaticMarkup(<BetaChangesPage />)
    expect(changes).not.toContain('Current Beta Baseline')
    expect(changes).toContain('Imported 69913 snapshot')
  })

  it('shows one consistent Level 20 Retribution route in leveling and spec entry points', () => {
    expect(BETA_LEVELING_SNAPSHOTS.leveling.current.build).toEqual(BETA_SPEC_PATHS.retribution.current.build)
    expect(BETA_LEVELING_SNAPSHOTS['retribution-leveling'].current.build).toEqual(BETA_SPEC_PATHS.retribution.current.build)
    expect(BETA_LEVELING_SNAPSHOTS.leveling.current.note).toContain('Seal of Command')
    expect(BETA_LEVELING_SNAPSHOTS.leveling.next.status).toBe('under_review')
    expect(BETA_LEVELING_SNAPSHOTS['retribution-leveling'].next.status).toBe('under_review')
  })
})
