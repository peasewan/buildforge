import { describe, expect, it } from 'vitest'
import { parseClientCsv, reconcilePaladinClient, validatePaladinCandidate } from './paladinClientReconcile'

const oldTalent = (id: string, name: string, nodeId: number, spellId: number, column: number) => ({
  id, name, branch: 'holy', maxRank: 1, row: 0, column,
  requiredTreePoints: 0, prerequisite: [] as string[],
  rankDescriptions: [`Old ${name}`], description: `Old ${name}`,
  changeType: 'new', iconName: 'spell_holy', complete: true,
  confirmedRanks: [1], nodeId, spellId,
})

const baseline = {
  sourceVersion: 'wow_forever_beta_1.60.1.69913', clientBuild: '1.60.1.69913',
  talents: [
    oldTalent('alpha', 'Alpha', 100, 1000, 0),
    oldTalent('beta', 'Beta', 101, 1001, 1),
    oldTalent('removed', 'Removed', 102, 1002, 2),
  ],
}

const tables = {
  SkillLineXTraitTree: 'ID,SkillLineID,TraitTreeID,Variant\n1,184,1100,0\n',
  TraitNode: 'ID,TraitTreeID,PosX,PosY,Type,Flags,TraitSubTreeID\n100,1100,1020,2130,0,0,0\n101,1100,1620,2130,0,0,0\n',
  TraitNodeXTraitNodeEntry: 'ID,TraitNodeID,TraitNodeEntryID,_Index\n1,100,200,0\n2,101,201,0\n',
  TraitNodeEntry: 'ID,TraitDefinitionID,MaxRanks,NodeEntryType,TraitSubTreeID\n200,300,1,0,0\n201,301,1,0,0\n',
  TraitDefinition: 'OverrideName_lang,OverrideSubtext_lang,OverrideDescription_lang,ID,SpellID,OverrideIcon,OverridesSpellID,VisibleSpellID\n,,,300,1000,0,0,0\n,,,301,1001,0,0,0\n',
  SpellName: 'ID,Name_lang\n1000,Alpha\n1001,Beta\n',
  Spell: 'ID,NameSubtext_lang,Description_lang,AuraDescription_lang\n1000,,Old Alpha,\n1001,,New Beta,\n',
  TraitEdge: 'ID,VisualStyle,LeftTraitNodeID,RightTraitNodeID,Type\n1,1,100,101,2\n',
}

const resolved = {
  license: 'CC-BY-4.0',
  attribution: 'Data from talentsforever.com (https://talentsforever.com)',
  talents: {
    Paladin: {
      source: 'Talent trees and every rank\'s text from the WoW Forever beta client, build 1.60.1.70170.',
      trees: [{ name: 'Holy', talents: [
        { name: 'Alpha', max: 1, row: 1, col: 1, desc: ['Old Alpha'], complete: true, confirmed: [1] },
        { name: 'Beta', max: 1, row: 1, col: 2, desc: ['New Beta'], complete: true, confirmed: [1] },
      ] }],
    },
  },
}

describe('Paladin client reconciliation', () => {
  it('parses client CSV descriptions with embedded commas and line breaks', () => {
    expect(parseClientCsv('ID,Description_lang\n1,"Line one, here\nline two"\n')).toEqual([
      { ID: '1', Description_lang: 'Line one, here\nline two' },
    ])
  })

  it('joins all current client nodes and reports removal, tooltip and arrow changes', () => {
    const result = reconcilePaladinClient({ baseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: tables })
    expect(result.candidate.talents).toHaveLength(2)
    expect(result.candidate.talents[1]).toMatchObject({
      id: 'beta', nodeId: 101, spellId: 1001, prerequisite: ['alpha'],
      rankDescriptions: ['New Beta'], description: 'New Beta',
      rankTextVerification: 'community_verified',
    })
    expect(result.candidate.resolvedRankSourceBuild).toBe('1.60.1.70170')
    expect(result.candidate.resolvedRankLicenseUrl).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(result.candidate.resolvedRankAdaptationNotice).toMatch(/adapted/i)
    expect(result.candidate.license).toMatch(/CC-BY-4.0/)
    expect(result.diff.summary).toEqual({
      added: 0, removed: 1, moved: 0, rank_changed: 0,
      tooltip_changed: 1, prerequisite_changed: 1, unchanged: 1,
    })
    expect(result.diff.removed).toEqual([{ id: 'removed', name: 'Removed', nodeId: 102 }])
    expect(result.diff.tooltip_changed[0].ranks).toEqual([
      { rank: 1, before: 'Old Beta', after: 'New Beta' },
    ])
  })

  it('replaces archived root verification metadata with evidence for the candidate build', () => {
    const staleBaseline = {
      ...baseline,
      basedOnBuild: '1.60.1.69893',
      verificationSummary: 'No changes were detected in 1.60.1.69913.',
      verificationSources: [{ label: '69913-only review', url: 'https://example.com/69913' }],
    }
    const { candidate } = reconcilePaladinClient({
      baseline: staleBaseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: tables,
    })
    expect(candidate.basedOnBuild).toBe('1.60.1.69913')
    expect(candidate.verificationSummary).toEqual(expect.stringContaining('1 removed'))
    expect(candidate.verificationSummary).toEqual(expect.stringContaining('1 talent with rank-description changes'))
    expect(candidate.verificationSources).toEqual(expect.arrayContaining([
      expect.objectContaining({ url: 'https://wago.tools/db2/TraitNode/csv?build=1.60.1.70245' }),
      expect.objectContaining({ url: 'https://talentsforever.com/data.json' }),
    ]))
    expect(JSON.stringify(candidate.verificationSources)).not.toContain('69913-only')
    expect(JSON.stringify(candidate)).not.toContain('1.60.1.69893')
  })

  it('rejects missing or unconfirmed rank text', () => {
    const bad = structuredClone(resolved)
    bad.talents.Paladin.trees[0].talents[1].confirmed = []
    expect(() => reconcilePaladinClient({ baseline, build: '1.60.1.70245', tables, resolved: bad, resolvedClientTables: tables }))
      .toThrow(/confirmed ranks/i)
  })

  it('rejects a resolved export that disagrees with the client spell identity', () => {
    const bad = structuredClone(resolved)
    bad.talents.Paladin.trees[0].talents[1].name = 'Other'
    expect(() => reconcilePaladinClient({ baseline, build: '1.60.1.70245', tables, resolved: bad, resolvedClientTables: tables }))
      .toThrow(/name mismatch/i)
  })

  it('blocks resolved rank text when the source client tables differ from the target build', () => {
    const source = { ...tables, Spell: tables.Spell.replace('New Beta', 'Older Beta') }
    expect(() => reconcilePaladinClient({
      baseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: source,
    })).toThrow(/client tables differ/i)
  })

  it('keeps stable archive order when client table rows arrive in a different order', () => {
    const reversed = {
      ...tables,
      TraitNode: 'ID,TraitTreeID,PosX,PosY,Type,Flags,TraitSubTreeID\n101,1100,1620,2130,0,0,0\n100,1100,1020,2130,0,0,0\n',
    }
    const { candidate } = reconcilePaladinClient({
      baseline, build: '1.60.1.70245', tables: reversed, resolved, resolvedClientTables: reversed,
    })
    expect(candidate.talents.map((talent) => talent.id)).toEqual(['alpha', 'beta'])
  })

  it('rejects a hand-edited candidate with duplicate grid cells or missing rank text', () => {
    const { candidate } = reconcilePaladinClient({
      baseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: tables,
    })
    expect(validatePaladinCandidate(candidate, [100, 101])).toEqual([])
    const edited = structuredClone(candidate)
    edited.talents[1].column = 0
    edited.talents[1].rankDescriptions = []
    expect(validatePaladinCandidate(edited, [100, 101])).toEqual(expect.arrayContaining([
      expect.stringMatching(/duplicate grid/i),
      expect.stringMatching(/rank descriptions/i),
    ]))
  })

  it('rejects a saved candidate that omits an active client node', () => {
    const { candidate } = reconcilePaladinClient({
      baseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: tables,
    })
    const edited = structuredClone(candidate)
    edited.talents.pop()
    expect(validatePaladinCandidate(edited, [100, 101])).toEqual(expect.arrayContaining([
      expect.stringMatching(/missing client node 101/i),
    ]))
  })

  it('rejects a candidate without visible-attribution metadata', () => {
    const { candidate } = reconcilePaladinClient({
      baseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: tables,
    })
    const edited = structuredClone(candidate)
    edited.resolvedRankLicenseUrl = undefined
    edited.resolvedRankAdaptationNotice = undefined
    expect(validatePaladinCandidate(edited, [100, 101])).toEqual(expect.arrayContaining([
      expect.stringMatching(/license url/i),
      expect.stringMatching(/adaptation notice/i),
    ]))
  })

  it('rejects stale root verification claims and source links', () => {
    const { candidate } = reconcilePaladinClient({
      baseline, build: '1.60.1.70245', tables, resolved, resolvedClientTables: tables,
    })
    const edited = structuredClone(candidate)
    edited.verificationSummary = 'No talent changes in 1.60.1.69913.'
    edited.verificationSources = [{ label: '69913 review', url: 'https://example.com/69913' }]
    expect(validatePaladinCandidate(edited, [100, 101])).toEqual(expect.arrayContaining([
      expect.stringMatching(/candidate verification summary/i),
      expect.stringMatching(/candidate verification sources/i),
    ]))
  })
})
