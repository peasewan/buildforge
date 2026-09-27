import { describe, expect, it } from 'vitest'
import { restoreEmbervilleDraft } from './embervilleDraft'

const available = { dataVersion: 'preview-v2', classes: [{ id: 'knight' }], weapons: [{ id: 'sword' }], skills: [{ id: 'strike', type: 'active' }, { id: 'guard', type: 'passive' }] }

describe('Emberville local draft migration', () => {
  it('restores known selections and notes while clearing stale or wrong-type IDs', () => {
    const result = restoreEmbervilleDraft(JSON.stringify({ dataVersion: 'preview-v1', style: 'magic', experiment: 'skill-inheritance', baseClassId: 'removed', weaponId: 'sword', learnedClassIds: ['knight', 'removed', 'knight'], activeSkillIds: ['strike', 'guard'], passiveSkillIds: ['guard'], notes: 'a'.repeat(600) }), 'old', available)
    expect(result.draft.baseClassId).toBeNull()
    expect(result.draft.weaponId).toBe('sword')
    expect(result.draft.learnedClassIds).toEqual(['knight'])
    expect(result.draft.activeSkillIds).toEqual(['strike'])
    expect(result.draft.passiveSkillIds).toEqual(['guard'])
    expect(result.draft.notes).toHaveLength(500)
    expect(result.draft.style).toBe('magic')
    expect(result.notice).toMatch(/rechecked/i)
  })
  it('ignores corrupt or wrong-shaped JSON and preserves old notes', () => {
    for (const value of ['{broken', 'null', '[]', '123', '{"notes":123}']) {
      const result = restoreEmbervilleDraft(value, 'legacy', available)
      expect(result.draft.notes).toBe('legacy')
      expect(result.draft.baseClassId).toBeNull()
      expect(result.draft.style).toBe('melee')
    }
  })
  it('retains the current saved draft without an upgrade notice', () => {
    const result = restoreEmbervilleDraft(JSON.stringify({ dataVersion: 'preview-v2', style: 'ranged', experiment: 'weapon-combos', baseClassId: 'knight', notes: 'idea' }), 'legacy', available)
    expect(result.draft.baseClassId).toBe('knight')
    expect(result.draft.notes).toBe('idea')
    expect(result.notice).toBe('')
  })
})
