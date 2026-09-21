import { describe, expect, it } from 'vitest'
import { reconcileMageTalents, type MageSourceTalent } from './mageTalentReconcile'

const iceLance: MageSourceTalent = {
  name: 'Ice Lance',
  branch: 'frost',
  row: 5,
  column: 1,
  maxRank: 1,
  rankDescriptions: ['Deals 28 Frost damage to an enemy target.'],
}

const frostboltA: MageSourceTalent = {
  name: 'Improved Frostbolt',
  branch: 'frost',
  row: 1,
  column: 2,
  maxRank: 5,
  rankDescriptions: [
    'Reduces the casting time of your Frostbolt spell by 0.1 sec.',
    'Reduces the casting time of your Frostbolt spell by 0.2 sec.',
    'Reduces the casting time of your Frostbolt spell by 0.3 sec.',
    'Reduces the casting time of your Frostbolt spell by 0.4 sec.',
    'Reduces the casting time of your Frostbolt spell by 0.5 sec.',
  ],
  sourceTalentId: 38,
}

const frostboltB: MageSourceTalent = {
  name: 'Improved Frostbolt',
  branch: 'frost',
  row: 1,
  column: 2,
  maxRank: 5,
  rankDescriptions: frostboltA.rankDescriptions,
}

describe('mage talent field-level reconcile', () => {
  it('publishes a node when planner-legal fields match even if spellId is only on one source', () => {
    const result = reconcileMageTalents([frostboltA], [frostboltB])
    expect(result.published).toHaveLength(1)
    expect(result.published[0].sourceTalentId).toBe(38)
    expect(result.published[0].fieldEvidence.sourceTalentId).toBe('client_datamined')
    expect(result.published[0].fieldEvidence.row).toBe('client_verified')
    expect(result.published[0].verificationStatus).toBe('client_verified')
  })

  it('does not publish identity that exists on only one source', () => {
    expect(reconcileMageTalents([iceLance, frostboltA], [frostboltB]).published.map((talent) => talent.name)).toEqual(['Improved Frostbolt'])
    expect(reconcileMageTalents([iceLance], []).missingInB.map((talent) => talent.name)).toEqual(['Ice Lance'])
  })

  it('keeps the node and omits tooltips when rank text disagrees', () => {
    const result = reconcileMageTalents(
      [{ ...frostboltB, rankDescriptions: ['Forever text', '2', '3', '4', '5'] }],
      [{ ...frostboltB, rankDescriptions: ['Different text', '2', '3', '4', '5'] }],
    )
    expect(result.published).toHaveLength(1)
    expect(result.published[0].rankDescriptions).toBeUndefined()
    expect(result.published[0].fieldEvidence.rankDescriptions).toBe('unknown')
    expect(result.fieldConflicts[0]).toMatchObject({ name: 'Improved Frostbolt', field: 'rankDescriptions' })
  })

  it('does not publish when planner-legal coordinates disagree', () => {
    const result = reconcileMageTalents([frostboltA], [{ ...frostboltB, row: 2 }])
    expect(result.published).toHaveLength(0)
    expect(result.fieldConflicts.some((conflict) => conflict.field === 'row')).toBe(true)
  })
})
