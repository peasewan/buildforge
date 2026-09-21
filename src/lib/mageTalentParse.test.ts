import { describe, expect, it } from 'vitest'
import { parseForeverDiffMage, parseTheWowDbMage } from './mageTalentParse'

const foreverDiff = `<script type="application/json" id="tc-tree">{"className":"Mage","tabs":[{"key":"frost","name":"Frost","talents":[{"id":37,"name":"Improved Frostbolt","tier":0,"column":1,"maxRank":5,"prereqs":[],"gate":{"spent":0},"ranks":["Reduces the casting time of your Frostbolt spell by 0.1 sec."]},{"id":130496,"name":"Ice Lance","tier":2,"column":2,"maxRank":1,"prereqs":[],"gate":{"spent":10},"ranks":["Deals 28 Frost damage."]}]}]}</script>`

const theWowDb = `<script id="forever-data" type="application/json">{"trees":[{"id":"frost","nodes":[{"id":"mage-frost-improved-frostbolt","name":"Improved Frostbolt","row":0,"col":1,"maxRanks":5,"iconName":"spell_frost_frostbolt02","ranks":{"1":"Reduces the casting time of your Frostbolt spell by 0.1 sec."},"sourceTalentId":37,"requires":[]}]}]}</script>`

describe('mage talent HTML parsers', () => {
  it('reads ForeverDiff calculator JSON with 1-based rows', () => {
    const talents = parseForeverDiffMage(foreverDiff)
    expect(talents).toHaveLength(2)
    expect(talents[0]).toMatchObject({ name: 'Improved Frostbolt', branch: 'frost', row: 1, column: 2, maxRank: 5, sourceTalentId: 37 })
    expect(talents[1].name).toBe('Ice Lance')
  })

  it('reads TheWoWDB forever-data JSON with 1-based rows', () => {
    const talents = parseTheWowDbMage(theWowDb)
    expect(talents).toEqual([expect.objectContaining({
      name: 'Improved Frostbolt', branch: 'frost', row: 1, column: 2, maxRank: 5, iconName: 'spell_frost_frostbolt02', sourceTalentId: 37,
    })])
  })
})
