import { describe, expect, it } from 'vitest'
import { assertMagePublishable, type MagePublishableTalent } from './mageTalentPublish'

const talent = (overrides: Partial<MagePublishableTalent> & { id: string }): MagePublishableTalent => ({
  name: overrides.id,
  branch: 'fire',
  maxRank: 1,
  ...overrides,
})

describe('mage production JSON publish guards', () => {
  it('accepts a dataset whose ids are unique, prerequisites resolve, and ranks match', () => {
    expect(() => assertMagePublishable([
      talent({ id: 'mage-fire-ignite', name: 'Ignite', maxRank: 5, rankDescriptions: ['1', '2', '3', '4', '5'] }),
      talent({ id: 'mage-fire-hot-streak', name: 'Hot Streak', prerequisiteName: 'Ignite' }),
    ])).not.toThrow()
  })

  it('fails loudly on duplicate ids, naming the offending id', () => {
    expect(() => assertMagePublishable([
      talent({ id: 'mage-fire-ignite', name: 'Ignite' }),
      talent({ id: 'mage-fire-ignite', name: 'Ignite (renamed)' }),
    ])).toThrow(/duplicate id.*mage-fire-ignite/i)
  })

  it('fails loudly when a prerequisite target was dropped from the published set, naming the node', () => {
    // Arcane Blast survives ForeverDiff only, so reconcile drops it. Improved Channeling
    // must not silently become prerequisite-free ("not_applicable" would be a falsehood).
    expect(() => assertMagePublishable([
      talent({ id: 'mage-arcane-improved-channeling', name: 'Improved Channeling', branch: 'arcane', prerequisiteName: 'Arcane Blast' }),
    ])).toThrow(/Improved Channeling.*Arcane Blast/s)
  })

  it('fails loudly when published rank descriptions do not cover maxRank, naming the node', () => {
    expect(() => assertMagePublishable([
      talent({ id: 'mage-fire-ignite', name: 'Ignite', maxRank: 5, rankDescriptions: ['1', '2'] }),
    ])).toThrow(/Ignite.*rankDescriptions.*5/s)
  })
})
