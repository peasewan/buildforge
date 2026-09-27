import type { EmbervilleDraft } from './embervilleData'

export const EMBERVILLE_DRAFT_KEY = 'emberville-build-draft-v1'
export const EMBERVILLE_NOTES_KEY = 'emberville-build-notes'
export const COMBAT_DIRECTIONS = ['melee', 'magic', 'ranged', 'hybrid'] as const
export const PLANNING_EXPERIMENTS = ['class-switching', 'weapon-combos', 'skill-inheritance'] as const

export interface EmbervilleWorkspace extends EmbervilleDraft {
  dataVersion: string
  style: string
  experiment: string
  notes: string
}
interface AvailableRecords {
  dataVersion: string
  classes: { id: string }[]
  weapons: { id: string }[]
  skills: { id: string; type: 'active' | 'passive' | null }[]
}
export function emptyEmbervilleDraft(dataVersion: string): EmbervilleWorkspace {
  return { dataVersion, style: 'melee', experiment: 'class-switching', notes: '', baseClassId: null, weaponId: null, learnedClassIds: [], activeSkillIds: [], passiveSkillIds: [] }
}

/** A local draft is an intention, never proof that a combination is legal in game. */
export function restoreEmbervilleDraft(raw: string | null, legacyNotes: string | null, available: AvailableRecords): { draft: EmbervilleWorkspace; notice: string } {
  const draft = emptyEmbervilleDraft(available.dataVersion)
  draft.notes = (legacyNotes ?? '').slice(0, 500)
  if (!raw) return { draft, notice: '' }
  let saved: Record<string, unknown>
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { draft, notice: '' }
    saved = value as Record<string, unknown>
  } catch { return { draft, notice: '' } }
  let cleared = false
  function known(value: unknown, records: { id: string }[]): string | null {
    if (typeof value !== 'string') return null
    if (records.some(record => record.id === value)) return value
    cleared = true
    return null
  }
  function list(value: unknown, records: { id: string }[]): string[] {
    if (!Array.isArray(value)) return []
    return [...new Set(value.map(item => known(item, records)).filter((id): id is string => id !== null))]
  }
  if (typeof saved.notes === 'string') draft.notes = saved.notes.slice(0, 500)
  if (typeof saved.style === 'string' && COMBAT_DIRECTIONS.some(id => id === saved.style)) draft.style = saved.style
  if (typeof saved.experiment === 'string' && PLANNING_EXPERIMENTS.some(id => id === saved.experiment)) draft.experiment = saved.experiment
  draft.baseClassId = known(saved.baseClassId, available.classes)
  draft.weaponId = known(saved.weaponId, available.weapons)
  draft.learnedClassIds = list(saved.learnedClassIds, available.classes)
  draft.activeSkillIds = list(saved.activeSkillIds, available.skills.filter(skill => skill.type === 'active'))
  draft.passiveSkillIds = list(saved.passiveSkillIds, available.skills.filter(skill => skill.type === 'passive'))
  const earlierVersion = typeof saved.dataVersion === 'string' && saved.dataVersion !== available.dataVersion
  return { draft, notice: earlierVersion || cleared ? 'Your saved choices were rechecked against the current data. Unavailable records were cleared; your notes were retained.' : '' }
}
