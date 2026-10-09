import { describe, expect, it } from 'vitest'
import { reconcileCurrentClassClient, validateCurrentClassCandidate } from './currentClassClientReconcile'

const tables = {
  SkillLineXTraitTree: 'ID,SkillLineID,TraitTreeID,Variant\n1,26,1117,0\n',
  TraitTree: 'ID\n1117\n',
  TraitNode: 'ID,TraitTreeID,PosX,PosY,Type,Flags,TraitSubTreeID\n101,1117,1020,2130,0,0,0\n102,1117,1620,2130,0,0,0\n103,1117,5020,2730,0,0,0\n',
  TraitNodeXTraitNodeEntry: 'ID,TraitNodeID,TraitNodeEntryID,_Index\n1,101,201,0\n2,102,202,0\n3,103,203,0\n',
  TraitNodeEntry: 'ID,TraitDefinitionID,MaxRanks,NodeEntryType,TraitSubTreeID\n201,301,1,0,0\n202,302,2,0,0\n203,303,1,0,0\n',
  TraitDefinition: 'OverrideName_lang,OverrideSubtext_lang,OverrideDescription_lang,ID,SpellID,OverrideIcon,OverridesSpellID,VisibleSpellID\n,,,301,1001,0,0,0\n,,,302,1002,0,0,0\n,,,303,1003,0,0,0\n',
  SpellName: 'ID,Name_lang\n1001,Alpha\n1002,Beta\n1003,New Gamma\n',
  Spell: 'ID,NameSubtext_lang,Description_lang,AuraDescription_lang\n1001,,Alpha raw,\n1002,,Beta raw,\n1003,,Gamma raw,\n',
  TraitEdge: 'ID,VisualStyle,LeftTraitNodeID,RightTraitNodeID,Type\n1,1,101,102,2\n',
}
const baseline = {
  classId: 'warrior', clientBuild: '1.60.1.69913', branches: ['arms', 'fury', 'protection'],
  talents: [
    { id: 'stable-alpha', name: 'Alpha', branch: 'arms', row: 1, column: 1, maxRank: 1, requiredTreePoints: 0, nodeId: 9, spellId: 1001, prerequisite: [], rankDescriptions: ['Alpha old'], sourceTalentId: 41 },
    { id: 'stable-beta', name: 'Beta', branch: 'arms', row: 1, column: 2, maxRank: 2, requiredTreePoints: 0, nodeId: 102, spellId: 1002, prerequisite: [], rankDescriptions: ['Beta1 old', 'Beta2 old'], sourceTalentId: 42 },
    { id: 'removed', name: 'Removed', branch: 'fury', row: 2, column: 1, maxRank: 1, requiredTreePoints: 5, nodeId: 103, spellId: 9900, prerequisite: [], rankDescriptions: ['Removed old'] },
  ],
}
const resolved = {
  license: 'CC-BY-4.0', attribution: 'Data from talentsforever.com', talents: { Warrior: {
    source: 'WoW Forever beta client, build 1.60.1.70291.', trees: [
      { name: 'Arms', talents: [
        { name: 'Alpha', row: 1, col: 1, max: 1, desc: ['Alpha current'], complete: true, confirmed: [1], icon: 'ability_alpha' },
        { name: 'Beta', row: 1, col: 2, max: 2, desc: ['Beta rank1', 'Beta rank2'], complete: true, confirmed: [1, 2], icon: 'ability_beta', req: 'Alpha' },
      ] },
      { name: 'Fury', talents: [{ name: 'New Gamma', row: 2, col: 1, max: 1, desc: ['Gamma current'], complete: true, confirmed: [1], icon: 'ability_gamma' }] },
      { name: 'Protection', talents: [] },
    ],
  } },
}
const input = () => ({ classId: 'warrior' as const, build: '1.60.1.70291', tables: structuredClone(tables), baseline: structuredClone(baseline), resolved: structuredClone(resolved) })

describe('current class client import publication boundary', () => {
  it('joins the full client tree and preserves stable identity without migrating reused raw nodes', () => {
    const { candidate, diff } = reconcileCurrentClassClient(input())
    expect(candidate.talents).toHaveLength(3)
    expect(candidate.talents[0]).toMatchObject({ id: 'stable-alpha', nodeId: 101, spellId: 1001, sourceTalentId: 41, row: 1, column: 1 })
    expect(candidate.talents[1]).toMatchObject({ id: 'stable-beta', rankDescriptions: ['Beta rank1', 'Beta rank2'], prerequisite: ['stable-alpha'], rankTextVerification: 'community_verified' })
    expect(candidate.talents[2]).toMatchObject({ id: 'warrior-fury-new-gamma', nodeId: 103, spellId: 1003 })
    expect(candidate.talents[2].sourceTalentId).toBeUndefined()
    expect(candidate.talents[2].spellIds).toBeUndefined()
    expect(candidate.talents[2].fieldEvidence.requiredTreePoints).toBe('derived_assumption')
    expect(diff.added.map(talent => talent.id)).toEqual(['warrior-fury-new-gamma'])
    expect(diff.removed.map(talent => talent.id)).toEqual(['removed'])
    expect(validateCurrentClassCandidate(candidate, input().tables)).toEqual([])
  })
  it('accepts nonzero membership ordering when a client node still has exactly one entry', () => {
    const ordered = input(); ordered.tables.TraitNodeXTraitNodeEntry = ordered.tables.TraitNodeXTraitNodeEntry.replaceAll(',0\n', ',100\n')
    expect(reconcileCurrentClassClient(ordered).candidate.talents).toHaveLength(3)
  })
  it('rejects a client/export tree cell or name disagreement', () => {
    const bad = input(); bad.resolved.talents.Warrior.trees[0].talents[0].name = 'Other'
    expect(() => reconcileCurrentClassClient(bad)).toThrow(/name mismatch/i)
  })
  it('rejects unresolved client variables even when a source marks the rank complete', () => {
    const unresolved = input(); unresolved.resolved.talents.Warrior.trees[0].talents[0].desc = ['Increases damage by $s1.']
    expect(() => reconcileCurrentClassClient(unresolved)).toThrow(/incomplete resolved ranks/i)
  })
  it('rejects partial resolved ranks and unsupported source builds', () => {
    const bad = input(); bad.resolved.talents.Warrior.trees[0].talents[1].desc.pop()
    expect(() => reconcileCurrentClassClient(bad)).toThrow(/incomplete resolved ranks/i)
    const stale = input(); stale.resolved.talents.Warrior.source = 'WoW Forever beta client, build 1.60.1.69913.'
    expect(() => reconcileCurrentClassClient(stale)).toThrow(/source build mismatch/i)
  })
  it('rejects source exports whose prerequisite disagrees with the raw client edge', () => {
    const bad = input(); bad.resolved.talents.Warrior.trees[0].talents[1].req = 'Other'
    expect(() => reconcileCurrentClassClient(bad)).toThrow(/prerequisite mismatch/i)
  })
  it('rejects malformed or ambiguous client membership and positions', () => {
    const duplicate = input(); duplicate.tables.SkillLineXTraitTree += '2,26,1118,0\n'
    expect(() => reconcileCurrentClassClient(duplicate)).toThrow(/map uniquely/i)
    const offGrid = input(); offGrid.tables.TraitNode = offGrid.tables.TraitNode.replace('1020,2130', '1045,2130')
    expect(() => reconcileCurrentClassClient(offGrid)).toThrow(/grid position/i)
  })
  it('independently rejects a saved candidate with missing nodes, rank gaps or altered client structure', () => {
    const { candidate } = reconcileCurrentClassClient(input())
    const missing = structuredClone(candidate); missing.talents.pop()
    expect(validateCurrentClassCandidate(missing, input().tables)).toEqual(expect.arrayContaining([expect.stringMatching(/missing client node 103/i)]))
    const changed = structuredClone(candidate); changed.talents[1].row = 3; changed.talents[1].rankDescriptions = ['']
    expect(validateCurrentClassCandidate(changed, input().tables)).toEqual(expect.arrayContaining([expect.stringMatching(/client structure mismatch/i), expect.stringMatching(/incomplete rank/i)]))
  })
  it('requires explicit reviewed identity evidence when a named talent changes its canonical spell', () => {
    const changed = input(); changed.baseline.talents[0].spellId = 9901
    expect(() => reconcileCurrentClassClient(changed)).toThrow(/identity spell requires review/i)
    const result = reconcileCurrentClassClient({ ...changed, reviewedIdentityMappings: [{ currentName: 'Alpha', currentBranch: 'arms', previousId: 'stable-alpha', expectedSpellId: 1001, expectedPreviousSpellId: 9901 }] })
    expect(result.candidate.talents[0]).toMatchObject({ id: 'stable-alpha', spellId: 1001 })
  })
  it('quarantines only explicitly reviewed off-grid records and discloses raw versus active counts', () => {
    const hidden = input()
    hidden.tables.TraitNode += '104,1117,99999,2130,0,0,0\n'
    hidden.tables.TraitNodeXTraitNodeEntry += '4,104,204,100\n'
    hidden.tables.TraitNodeEntry += '204,304,1,0,0\n'
    hidden.tables.TraitDefinition += ',,,304,1004,0,0,0\n'
    hidden.tables.SpellName += '1004,Obsolete Alpha\n'
    hidden.tables.Spell += '1004,,Obsolete raw,\n'
    expect(() => reconcileCurrentClassClient(hidden)).toThrow(/grid position/i)
    const quarantine = [{ nodeId: 104, name: 'Obsolete Alpha', spellId: 1004, posX: 99999, posY: 2130, replacementNodeId: 101, reason: 'Reviewed off-grid remnant; active replacement independently source-checked.', sourceUrl: 'https://talentsforever.com/data.json' }]
    const { candidate } = reconcileCurrentClassClient({ ...hidden, reviewedQuarantines: quarantine })
    expect(candidate.rawClientNodeCount).toBe(4)
    expect(candidate.talents).toHaveLength(3)
    expect(candidate.quarantinedClientNodes).toEqual(quarantine)
    expect(validateCurrentClassCandidate(candidate, hidden.tables, quarantine)).toEqual([])
    expect(validateCurrentClassCandidate(candidate, hidden.tables)).toEqual(expect.arrayContaining([expect.stringMatching(/unapproved quarantine/i)]))
    const unreviewed = structuredClone(quarantine); unreviewed[0].spellId = 9900
    expect(() => reconcileCurrentClassClient({ ...hidden, reviewedQuarantines: unreviewed })).toThrow(/quarantine identity mismatch/i)
  })
  it('does not infer a valid graph from a cyclic client edge without an exact reviewed exclusion', () => {
    const cyclic = input(); cyclic.tables.TraitEdge += '2,1,102,101,2\n'
    expect(() => reconcileCurrentClassClient(cyclic)).toThrow(/prerequisite mismatch/i)
    const edges = [{ edgeId: 2, leftNodeId: 102, rightNodeId: 101, reason: 'Exact reverse-cycle remnant conflicts with independently reviewed visible tree.', sourceUrl: 'https://talentsforever.com/data.json' }]
    const { candidate } = reconcileCurrentClassClient({ ...cyclic, reviewedEdgeQuarantines: edges })
    expect(candidate.talents[0].fieldEvidence.prerequisiteLink).toBe('community_verified')
    expect(candidate.quarantinedClientEdges).toEqual(edges)
    expect(validateCurrentClassCandidate(candidate, cyclic.tables, [], edges)).toEqual([])
    expect(validateCurrentClassCandidate(candidate, cyclic.tables)).toEqual(expect.arrayContaining([expect.stringMatching(/unapproved edge/i)]))
    const changed = structuredClone(edges); changed[0].leftNodeId = 9900
    expect(() => reconcileCurrentClassClient({ ...cyclic, reviewedEdgeQuarantines: changed })).toThrow(/edge quarantine identity/i)
  })
  it('retains an explicitly reviewed moved talent instead of binding by reused node IDs', () => {
    const moved = input(); moved.baseline.talents[0].branch = 'protection'
    const { candidate, diff } = reconcileCurrentClassClient({ ...moved, reviewedIdentityMappings: [{ currentName: 'Alpha', currentBranch: 'arms', previousId: 'stable-alpha', expectedSpellId: 1001 }] })
    expect(candidate.talents[0].id).toBe('stable-alpha')
    expect(diff.moved).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'stable-alpha' })]))
  })
})
