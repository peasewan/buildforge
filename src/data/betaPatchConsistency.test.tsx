import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BetaDataStatus from '../BetaDataStatus'
import BetaChangesPage from '../BetaChangesPage'
import { renderBetaStatusPrerender } from '../lib/prerender'
import { BETA_LEVELING_SNAPSHOTS } from './levelingBeta'
import { BETA_SPEC_PATHS } from './betaSpecPaths'
import { archivedBetaTalents, historicalTalents, talentEvidenceLabel, talents } from './talents'

describe('Paladin current structure and preserved patch history', () => {
  it('preserves the 69913 archive and keeps both removals outside the current tree', () => {
    expect(archivedBetaTalents).toHaveLength(52)
    expect(talents).toHaveLength(50)
    for (const id of ['improved_holy_strike', 'crusade']) {
      expect(archivedBetaTalents.find(talent => talent.id === id)?.currentBetaAvailability).toBeUndefined()
      expect(talents.find(talent => talent.id === id)).toBeUndefined()
    }
    const strike = historicalTalents.find(talent => talent.id === 'improved_holy_strike')!
    const crusade = historicalTalents.find(talent => talent.id === 'crusade')!
    expect(strike.currentBetaAvailability).toBe('removed_official')
    expect(talentEvidenceLabel(strike)).toMatch(/removed.*September 24/i)
    expect(crusade.currentBetaAvailability).toBe('removed_client_verified')
    expect(talentEvidenceLabel(crusade)).toMatch(/client-confirmed removal in 70245/i)
    expect(crusade.sources.some(source => source.type === 'official' && /removed/i.test(source.label))).toBe(false)
  })

  it('shows the current diff while preserving the older zero-change comparison', () => {
    const html = renderToStaticMarkup(<BetaDataStatus />)
    expect(html).toContain('1.60.1.69913 → 1.60.1.70245')
    expect(html).toContain('14 talents with 32 changed rank strings')
    expect(html).toContain('2 removed')
    const prerender = renderBetaStatusPrerender()
    expect(prerender).toContain('1.60.1.69913 → 1.60.1.70245')
    expect(prerender).toContain('CC BY 4.0')
    const changes = renderToStaticMarkup(<BetaChangesPage />)
    expect(changes).toContain('1.60.1.69893 → 1.60.1.69913')
    expect(changes).toContain('No Paladin talent changes were detected in build 69913')
  })

  it('keeps official tuning separate from reviewed client structure and community rank text', () => {
    const html = renderToStaticMarkup(<BetaDataStatus />)
    expect(html).toContain('October 1 official tuning')
    for (const name of ['Redoubt', 'Holy Shield', 'Champion of the Light']) expect(html).toContain(name)
    expect(html).toContain('rank text remains community-verified')
    expect(html).toContain('2360696/1')
    expect(html).not.toContain('69913 tooltips may be stale')
  })

  it('keeps the reviewed Level 30 Retribution route consistent across entry points', () => {
    expect(BETA_LEVELING_SNAPSHOTS.leveling.current.build).toEqual(BETA_SPEC_PATHS.retribution.current.build)
    expect(BETA_LEVELING_SNAPSHOTS['retribution-leveling'].current.build).toEqual(BETA_SPEC_PATHS.retribution.current.build)
    expect(BETA_LEVELING_SNAPSHOTS.leveling.current.note).toContain('Seal of Command')
    expect(BETA_LEVELING_SNAPSHOTS.leveling.next.status).toBe('community_reviewed')
    expect(BETA_LEVELING_SNAPSHOTS['retribution-leveling'].next.status).toBe('community_reviewed')
  })
})
