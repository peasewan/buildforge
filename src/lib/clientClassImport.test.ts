import { describe, expect, it } from 'vitest'
import { parseClientCsv, importClientClass } from './clientClassImport'

const row = { ID: '1', TabID: '11', TierID: '0', ColumnIndex: '1', SpellRank_0: '99', SpellRank_1: '100' }
const input = {
  classId: 'test', classMask: 8, build: '1.60.1.69913',
  talents: [row], tabs: [{ ID: '11', ClassMask: '8', OrderIndex: '0', Name_lang: 'Combat' }],
  spells: [{ ID: '99', Name_lang: 'Current Name' }],
  crosscheck: { trees: [{ id: 'combat', nodes: [{ sourceTalentId: 1, name: 'Current Name', row: 0, col: 1, maxRanks: 2, spellIds: [99, 100], ranks: { '2': 'Rank two only.' } }] }] },
}

describe('primary client class import', () => {
  it('reads quoted CSV without splitting commas inside names', () => {
    expect(parseClientCsv('ID,Name\r\n1,"A, B"\r\n2,"He said ""yes"""\r\n')).toEqual([{ ID: '1', Name: 'A, B' }, { ID: '2', Name: 'He said "yes"' }])
  })
  it('preserves stable identity and sparse rank text without shifting rank two to rank one', () => {
    const result = importClientClass(input)
    expect(result.talents[0]).toMatchObject({ sourceTalentId: 1, nodeId: 1, spellId: 99, spellIds: [99, 100], row: 1, column: 2, maxRank: 2, rankDescriptions: ['', 'Rank two only.'] })
    expect(result.ready).toBe(true)
  })
  it('rejects a primary/crosscheck coordinate conflict instead of silently shipping it', () => {
    const changed = { ...input, talents: [{ ...row, ColumnIndex: '3' }] }
    expect(importClientClass(changed).ready).toBe(false)
    expect(importClientClass(changed).conflicts[0]).toContain('position')
  })
  it('keeps an unreadable client name explicitly separate from the legacy label', () => {
    const result = importClientClass({ ...input, spells: [] })
    expect(result.talents[0].fieldEvidence.name).toBe('unknown')
    expect(result.talents[0].dataNotes.join(' ')).toContain('reference label')
  })
  it('does not turn unresolved spell variables into displayable rank effects', () => {
    const crosscheck = { trees: [{ id: 'combat', nodes: [{ ...input.crosscheck.trees[0].nodes[0], ranks: { '1': 'Increases damage by $s1%.' } }] }] }
    expect(importClientClass({ ...input, crosscheck }).talents[0].rankDescriptions).toEqual(['', ''])
  })
})
