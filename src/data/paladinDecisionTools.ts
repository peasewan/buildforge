import { BRANCHES, encodeBuild, type Build } from '../lib/build'
import { incrementPlannerTalent } from '../lib/talentPlanner'
import { talents } from './talents'
import { PALADIN_LEVELING_STEPS } from './paladinLevelingProgression'

export const PALADIN_COMPARATOR_PATH = '/wow-forever-paladin-build-comparator'
export type PointStep = { level: number; talentId: string; name: string; rank: number; build: Build }

/** Replay through the actual planner; do not silently repair an impossible route. */
export function createPointSteps(sequence: ReadonlyArray<readonly [string, number]>): PointStep[] {
  let build: Build = {}
  const steps: PointStep[] = []
  for (const [id, count] of sequence) {
    const talent = talents.find(item => item.id === id)
    if (!talent || !Number.isInteger(count) || count < 1) throw new Error(`Invalid route talent: ${id}`)
    for (let rank = 0; rank < count; rank++) {
      const next = incrementPlannerTalent(build, talent, talents, { branches: BRANCHES, pointCap: 21 })
      if (next === build) throw new Error(`Illegal route step: ${id}`)
      build = next
      steps.push({ level: steps.length + 10, talentId: id, name: talent.name, rank: build[id], build: { ...build } })
    }
  }
  return steps
}

export const PROTECTION_POINT_STEPS = createPointSteps([
  ['toughness', 5], ['redoubt', 5], ['precision', 3], ['anticipation', 5], ['improved_righteous_fury', 3],
])
// Preserve the existing editorial allocation; replay it against current structural rules, without claiming performance.
export const HOLY_SHOCK_POINT_STEPS = createPointSteps([
  ['divine_intellect', 5], ['healing_light', 3], ['spiritual_focus', 2], ['reverence', 3],
  ['purifying_power', 2], ['divine_favor', 1], ['illumination', 4], ['holy_shock', 1],
])

export function pointStepHref(step: PointStep): string {
  return `/build?id=${encodeBuild(step.build)}&level=${step.level}#calculator`
}
export function snapshotGate(id: string) {
  const talent = talents.find(item => item.id === id)
  if (!talent) throw new Error(`Unknown talent: ${id}`)
  const points = talent.requiredTreePoints + 1
  return { talent, points, minimumLevel: points + 9, withinLevel30Budget: points <= 21 }
}
export const PALADIN_COMPARISON_ROUTES = [
  {
    id: 'traditional-ret', label: 'Traditional Ret', allocation: '0/0/21',
    steps: PALADIN_LEVELING_STEPS, core: ['seal_of_command', 'sacred_arbiter', 'vengeance'],
    style: 'Melee-first planning with Seal of Command. This route does not allocate Twist of Light.',
    weapon: 'Start by comparing your actual two-handed weapon options; no weapon DPS ranking is implied.',
    stats: 'Compare weapon damage and your measured attack performance. No Strength-to-DPS coefficient is assumed.',
    evidence: 'Community allocation reviewed October 4 and replayed against reviewed 70245 structure. Rank text remains community evidence; performance is unverified.',
  },
  {
    id: 'shockadin', label: 'Holy Shock example', allocation: '21/0/0',
    steps: HOLY_SHOCK_POINT_STEPS, core: ['divine_favor', 'illumination', 'holy_shock'],
    style: 'An editorial Holy route for comparing access to Holy Shock and healing support. It is not a tested Shockadin damage build.',
    weapon: 'Record the spell and melee gear you actually own before comparing results; this tool does not prescribe a best weapon.',
    stats: 'Intellect and mana use matter to this comparison. The October 1 Champion of the Light change is not a universal Intellect conversion.',
    evidence: 'Existing editorial example constructed October 5 in the 69913 tree and replayed against reviewed 70245 structure. Rank text remains community evidence; performance is unverified.',
  },
] as const
