import { describe, expect, it } from 'vitest'
import { parseForeverDiffMage, parseTheWowDbMage } from './mageTalentParse'

const foreverDiff = `<script type="application/json" id="tc-tree">{"className":"Mage","tabs":[{"key":"frost","name":"Frost","talents":[{"id":37,"name":"Improved Frostbolt","tier":0,"column":1,"maxRank":5,"prereqs":[],"gate":{"spent":0},"ranks":["Reduces the casting time of your Frostbolt spell by 0.1 sec."]},{"id":130496,"name":"Ice Lance","tier":2,"column":2,"maxRank":1,"prereqs":[],"gate":{"spent":10},"ranks":["Deals 28 Frost damage."]}]}]}</script>`

const theWowDb = `<script id="forever-data" type="application/json">{"trees":[{"id":"frost","nodes":[{"id":"mage-frost-improved-frostbolt","name":"Improved Frostbolt","row":0,"col":1,"maxRanks":5,"iconName":"spell_frost_frostbolt02","ranks":{"1":"Reduces the casting time of your Frostbolt spell by 0.1 sec."},"sourceTalentId":37,"requires":[]}]}]}</script>`

const foreverDiffStatuses = `<script type="application/json" id="tc-tree">{"className":"Mage","tabs":[{"key":"fire","name":"Fire","talents":[{"id":1,"name":"Ignite","tier":1,"column":0,"maxRank":5,"status":"unchanged","ranks":["Ignite text."]},{"id":2,"name":"Hot Streak","tier":4,"column":1,"maxRank":3,"status":"added"},{"id":3,"name":"Blast Wave","tier":6,"column":2,"maxRank":1,"status":"changed"},{"id":4,"name":"No Status Field","tier":0,"column":3,"maxRank":1},{"id":5,"name":"Unrecognised Status","tier":0,"column":3,"maxRank":1,"status":"reworked"}]}]}</script>`

const theWowDbChanges = `<script id="forever-data" type="application/json">{"trees":[{"id":"fire","nodes":[{"id":"a","name":"Ignite","row":1,"col":0,"maxRanks":5,"change":{"kind":"changed","notes":["Tooltip differs from vanilla at rank 1."]}},{"id":"b","name":"Renamed Node","row":2,"col":0,"maxRanks":1,"change":{"kind":"renamed","notes":["Renamed from Incinerate."]}},{"id":"c","name":"Same Node","row":3,"col":0,"maxRanks":1,"change":{"kind":"unchanged","notes":[]}},{"id":"d","name":"No Change Field","row":4,"col":0,"maxRanks":1}]}]}</script>`

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

  it('maps the ForeverDiff status field onto the shared changeStatus vocabulary', () => {
    const talents = parseForeverDiffMage(foreverDiffStatuses)
    expect(talents.map((talent) => talent.changeStatus)).toEqual([
      'same',
      'new',
      'changed',
      undefined,
      undefined,
    ])
  })

  it('maps the TheWoWDB change.kind field onto the shared changeStatus vocabulary', () => {
    const talents = parseTheWowDbMage(theWowDbChanges)
    expect(talents.map((talent) => talent.changeStatus)).toEqual([
      'changed',
      'changed',
      'same',
      undefined,
    ])
  })
})
