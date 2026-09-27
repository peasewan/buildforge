import { describe, expect, it } from 'vitest'
import {
  diffEmbervilleDatasets,
  evaluateEmbervilleDraft,
  parseEmbervilleDataset,
  queryEmbervilleDataset,
  type EmbervilleDataset,
  type EmbervilleDraft,
  type SourcedFact,
} from './embervilleData'

const fact = <T>(value: T): SourcedFact<T> => ({ value, verificationStatus: 'official', sourceIds: ['manual'] })
const unknown = <T>(): SourcedFact<T> => ({ value: null, verificationStatus: null, sourceIds: [] })

function fixture(): EmbervilleDataset {
  return {
    schemaVersion: 1,
    dataVersion: 'fixture-1',
    phase: 'pre_early_access',
    reviewedAt: '2026-09-27',
    sources: [{ id: 'manual', label: 'Fixture official manual', url: 'https://example.com/manual', kind: 'official', locator: 'Skills and inheritance' }],
    mechanics: [{ id: 'inheritance', description: fact('Fixture: learned skills can be inherited.') }],
    classes: [
      { id: 'guardian', name: fact('Guardian'), description: unknown(), gameId: unknown() },
      { id: 'scout', name: fact('Scout'), description: fact('A fixture ranged class.'), gameId: fact('class-2') },
    ],
    weapons: [{ id: 'staff', name: fact('Staff'), description: fact('A fixture weapon.'), gameId: unknown() }],
    skills: [
      { id: 'spark', classId: 'scout', name: fact('Spark'), type: fact<'active' | 'passive'>('active'), effect: fact('Deals fixture lightning damage.'), inheritance: fact(true) },
      { id: 'focus', classId: 'guardian', name: fact('Focus'), type: fact<'active' | 'passive'>('passive'), effect: fact('Improves fixture concentration.'), inheritance: unknown() },
    ],
    rules: {
      activeSlots: fact(1), passiveSlots: fact(1), unlockLevel: fact(3),
      compatibility: [
        { baseClassId: 'guardian', skillId: 'spark', allowed: fact(true) },
        { baseClassId: 'guardian', skillId: 'focus', allowed: fact(true) },
      ],
    },
  }
}

const draft = (): EmbervilleDraft => ({ baseClassId: 'guardian', weaponId: 'staff', learnedClassIds: ['scout'], activeSkillIds: ['spark'], passiveSkillIds: ['focus'] })

describe('Emberville evidence schema', () => {
  it('preserves known evidence and unknown facts without filling game IDs', () => {
    const data = parseEmbervilleDataset(fixture())
    expect(data.classes[0].gameId).toEqual({ value: null, verificationStatus: null, sourceIds: [] })
    expect(data.skills[0].effect.sourceIds).toEqual(['manual'])
  })

  it.each([
    ['unsourced known fact', (data: EmbervilleDataset) => { data.classes[0].name.sourceIds = [] }, /classes\[0\]\.name.*source/i],
    ['missing verification', (data: EmbervilleDataset) => { data.classes[0].name.verificationStatus = null }, /classes\[0\]\.name.*verification/i],
    ['unknown with claimed verification', (data: EmbervilleDataset) => { data.classes[0].gameId.verificationStatus = 'official' }, /classes\[0\]\.gameId.*unknown/i],
    ['dangling evidence', (data: EmbervilleDataset) => { data.skills[0].effect.sourceIds = ['missing'] }, /skills\[0\]\.effect.*missing/i],
    ['duplicate identity', (data: EmbervilleDataset) => { data.classes.push(data.classes[0]) }, /duplicate.*guardian/i],
    ['dangling skill class', (data: EmbervilleDataset) => { data.skills[0].classId = 'missing' }, /skills\[0\].*class.*missing/i],
    ['dangling compatibility class', (data: EmbervilleDataset) => { data.rules.compatibility[0].baseClassId = 'missing' }, /compatibility\[0\].*class.*missing/i],
    ['dangling compatibility skill', (data: EmbervilleDataset) => { data.rules.compatibility[0].skillId = 'missing' }, /compatibility\[0\].*skill.*missing/i],
    ['duplicate compatibility', (data: EmbervilleDataset) => { data.rules.compatibility.push(data.rules.compatibility[0]) }, /compatibility.*duplicate/i],
    ['fractional slot limit', (data: EmbervilleDataset) => { data.rules.activeSlots.value = 1.5 }, /activeSlots.*integer/i],
    ['negative slot limit', (data: EmbervilleDataset) => { data.rules.passiveSlots.value = -1 }, /passiveSlots.*integer/i],
    ['invalid reviewed date', (data: EmbervilleDataset) => { data.reviewedAt = '2026-02-30' }, /reviewedAt.*date/i],
    ['invented verification status', (data: EmbervilleDataset) => { Object.assign(data.classes[0].name, { verificationStatus: 'verified' }) }, /verificationStatus/i],
    ['official claim with only community evidence', (data: EmbervilleDataset) => { data.sources[0].kind = 'creator_capture' }, /official.*source/i],
  ])('rejects %s with a useful location', (_label, mutate, error) => {
    const data = fixture()
    mutate(data)
    expect(() => parseEmbervilleDataset(data)).toThrow(error)
  })

  it('rejects unknown fields and missing required collections', () => {
    expect(() => parseEmbervilleDataset({ ...fixture(), inheritedSlotDefault: 4 })).toThrow(/inheritedSlotDefault/)
    const withoutMechanics = { ...fixture() }
    Reflect.deleteProperty(withoutMechanics, 'mechanics')
    expect(() => parseEmbervilleDataset(withoutMechanics)).toThrow(/mechanics/)
  })

  it.each(['client_datamined', 'client_verified'] as const)('requires a client export to claim %s', status => {
    const data = fixture()
    data.skills[0].effect.verificationStatus = status
    expect(() => parseEmbervilleDataset(data)).toThrow(/skills\[0\]\.effect.*client.*export/i)

    data.sources.push({ id: 'press', label: 'Hands-on preview', url: 'https://example.com/preview', kind: 'community_research' })
    data.skills[0].effect.sourceIds = ['press']
    expect(() => parseEmbervilleDataset(data)).toThrow(/skills\[0\]\.effect.*client.*export/i)
  })

  it.each(['client_datamined', 'client_verified'] as const)('accepts %s with a field-specific client export', status => {
    const data = fixture()
    data.sources.push({ id: 'client', label: 'Reviewed client export', url: 'https://example.com/client-export.json', kind: 'client_export' })
    data.skills[0].effect = { value: 'Client-exported fixture effect.', verificationStatus: status, sourceIds: ['client'] }
    expect(parseEmbervilleDataset(data).skills[0].effect).toEqual({ value: 'Client-exported fixture effect.', verificationStatus: status, sourceIds: ['client'] })
  })
})

describe('Emberville query and version diff', () => {
  it('queries names, effects and stable IDs while leaving unknowns empty', () => {
    expect(queryEmbervilleDataset(fixture(), ' LIGHTNING ').skills.map(({ id }) => id)).toEqual(['spark'])
    expect(queryEmbervilleDataset(fixture(), 'class-2').classes.map(({ id }) => id)).toEqual(['scout'])
    expect(queryEmbervilleDataset(fixture(), '').weapons.map(({ id }) => id)).toEqual(['staff'])
    expect(queryEmbervilleDataset(fixture(), 'null')).toEqual({ classes: [], weapons: [], skills: [] })
  })

  it('reports added, removed, changed facts, evidence and rules without mutating versions', () => {
    const before = fixture()
    const after = fixture()
    after.dataVersion = 'fixture-2'
    after.classes[0].name.note = 'New review locator'
    after.sources[0].locator = 'Revised skills table'
    after.skills.splice(1, 1)
    after.rules.compatibility.splice(1, 1)
    after.weapons.push({ id: 'bow', name: fact('Bow'), description: unknown(), gameId: unknown() })
    after.rules.activeSlots = fact(2)
    after.rules.compatibility[0].allowed = fact(false)
    after.mechanics[0].description.note = 'Reviewed again'
    const diff = diffEmbervilleDatasets(before, after)
    expect(diff.beforeVersion).toBe('fixture-1')
    expect(diff.afterVersion).toBe('fixture-2')
    expect(diff.classes.changed[0]).toMatchObject({ id: 'guardian', changedFields: ['name'], before: { name: { value: 'Guardian' } }, after: { name: { note: 'New review locator' } } })
    expect(diff.sources.changed[0].changedFields).toEqual(['locator'])
    expect(diff.skills.removed.map(({ id }) => id)).toEqual(['focus'])
    expect(diff.weapons.added.map(({ id }) => id)).toEqual(['bow'])
    expect(diff.rules.facts).toEqual([{ field: 'activeSlots', before: fact(1), after: fact(2) }])
    expect(diff.rules.compatibility.changed[0]).toMatchObject({ id: 'guardian:spark', changedFields: ['allowed'], after: { allowed: { value: false } } })
    expect(diff.rules.compatibility.removed[0].skillId).toBe('focus')
    expect(diff.mechanics.changed[0].changedFields).toEqual(['description'])
    expect(before.classes[0].name.note).toBeUndefined()
  })

  it('ignores record reordering when no record or fact changed', () => {
    const before = fixture()
    const after = fixture()
    after.classes.reverse()
    after.rules.compatibility.reverse()
    expect(diffEmbervilleDatasets(before, after).classes).toEqual({ added: [], removed: [], changed: [] })
    expect(diffEmbervilleDatasets(before, after).rules.compatibility).toEqual({ added: [], removed: [], changed: [] })
  })
})

describe('conservative Emberville draft evaluation', () => {
  it('confirms a complete sourced draft and implicitly treats the base class as learned', () => {
    expect(evaluateEmbervilleDraft(fixture(), draft())).toEqual({ status: 'confirmed', messages: [expect.stringMatching(/recorded inheritance evidence.*character level.*class\/weapon.*not checked/i)] })
  })

  it('requires verification for an empty setup and unknown numeric limits', () => {
    const data = fixture()
    const empty = { baseClassId: null, weaponId: null, learnedClassIds: [], activeSkillIds: [], passiveSkillIds: [] }
    expect(evaluateEmbervilleDraft(data, empty).status).toBe('needs_verification')
    data.rules.activeSlots = unknown()
    expect(evaluateEmbervilleDraft(data, draft())).toMatchObject({ status: 'needs_verification', messages: expect.arrayContaining([expect.stringMatching(/active.*slot.*unknown/i)]) })
  })

  it.each([
    ['missing compatibility', (data: EmbervilleDataset) => { data.rules.compatibility = [] }, /compatibility.*unknown/i],
    ['unknown inheritance', (data: EmbervilleDataset) => { data.skills[0].inheritance = unknown() }, /inheritance.*unknown/i],
    ['unknown skill type', (data: EmbervilleDataset) => { data.skills[0].type = unknown() }, /type.*unknown/i],
    ['unknown effect', (data: EmbervilleDataset) => { data.skills[0].effect = unknown() }, /effect.*unknown/i],
    ['assumed limit', (data: EmbervilleDataset) => { data.rules.passiveSlots.verificationStatus = 'derived_assumption' }, /passive.*assumption/i],
  ])('does not confirm %s', (_label, mutate, message) => {
    const data = fixture()
    mutate(data)
    expect(evaluateEmbervilleDraft(data, draft())).toMatchObject({ status: 'needs_verification', messages: expect.arrayContaining([expect.stringMatching(message)]) })
  })

  it.each([
    ['explicit incompatibility', (data: EmbervilleDataset) => { data.rules.compatibility[0].allowed = fact(false) }, /incompatible/i],
    ['non-inheritable skill', (data: EmbervilleDataset) => { data.skills[0].inheritance = fact(false) }, /cannot.*inherit/i],
    ['source class not learned', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.learnedClassIds = [] }, /scout.*learned/i],
    ['unknown class', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.baseClassId = 'missing' }, /unknown.*class.*missing/i],
    ['unknown weapon', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.weaponId = 'missing' }, /unknown.*weapon.*missing/i],
    ['unknown skill', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.activeSkillIds = ['missing'] }, /unknown.*skill.*missing/i],
    ['unknown learned class', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.learnedClassIds.push('missing') }, /unknown.*learned.*class.*missing/i],
    ['duplicate skill', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.activeSkillIds.push('spark') }, /duplicate.*spark/i],
    ['duplicate learned class', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.learnedClassIds.push('scout') }, /duplicate.*scout/i],
    ['skill type mismatch', (_data: EmbervilleDataset, selection: EmbervilleDraft) => { selection.passiveSkillIds = ['spark'] }, /spark.*active.*passive/i],
    ['known slot overflow', (data: EmbervilleDataset) => { data.rules.activeSlots = fact(0) }, /active.*slot.*limit/i],
  ])('blocks %s', (_label, mutate, message) => {
    const data = fixture()
    const selection = draft()
    mutate(data, selection)
    expect(evaluateEmbervilleDraft(data, selection)).toMatchObject({ status: 'blocked', messages: expect.arrayContaining([expect.stringMatching(message)]) })
  })
})
