import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { paladinSpellbook } from './paladinSpellbook'
import { PALADIN_LEVELING_STEPS } from './paladinLevelingProgression'

export const PALADIN_CHECKLIST_CAP = PALADIN_BETA_SNAPSHOT.phase.levelCap
export const PALADIN_CHECKLIST_SNAPSHOT = paladinSpellbook.clientBuild
export const PALADIN_CHECKLIST_SOURCE = paladinSpellbook.entries[0].sources[0]

export const PALADIN_FIRST_UNLOCKS = paladinSpellbook.entries
  .filter((entry) => entry.learnedAt <= PALADIN_CHECKLIST_CAP)
  .sort((a, b) => a.learnedAt - b.learnedAt || a.name.localeCompare(b.name))

const validIds = new Set([...PALADIN_FIRST_UNLOCKS.map((entry) => entry.id), ...PALADIN_LEVELING_STEPS.map((step) => `talent:${step.level}`)])

export function savedPaladinUnlocks(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
}

export function paladinUnlocksAtLevel(level: number) {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.min(PALADIN_CHECKLIST_CAP, Math.trunc(level))) : 1
  const available = PALADIN_FIRST_UNLOCKS.filter((entry) => entry.learnedAt <= safeLevel)
  const nextLevel = PALADIN_FIRST_UNLOCKS.find((entry) => entry.learnedAt > safeLevel)?.learnedAt
  return {
    level: safeLevel,
    available,
    next: nextLevel === undefined ? [] : PALADIN_FIRST_UNLOCKS.filter((entry) => entry.learnedAt === nextLevel),
    talentSteps: PALADIN_LEVELING_STEPS.filter((step) => step.level <= safeLevel),
  }
}
