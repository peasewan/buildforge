import { BRANCHES, encodeBuild, type Build } from '../lib/build'
import { incrementPlannerTalent } from '../lib/talentPlanner'
import { talents } from './talents'

export const PALADIN_LEVELING_SOURCE = {
  label: 'Mobalytics — Paladin Leveling Guide (Level 1–30)',
  href: 'https://mobalytics.gg/wow-forever/classes/paladin-leveling-guide',
  updated: '2026-10-03', reviewed: '2026-10-04',
  verification: 'derived_assumption' as const,
}
// A community-recommended allocation, not a replacement client dataset. Preserve
// the guide's mobility-first order; the existing Level 20 Seal-first route is separate.
const sequence: Array<[string, number]> = [
  ['benediction',5], ['conviction',5], ['pursuit_of_justice',2],
  ['seal_of_command',1], ['sanctified_judgement',2], ['sacred_arbiter',1],
  ['sanctified_judgement',1], ['vindication',3], ['vengeance',1],
]
export interface PaladinLevelingStep { level: number; talentId: string; name: string; rank: number; build: Build }
function createSteps(): PaladinLevelingStep[] {
  let build: Build = {}
  const steps: PaladinLevelingStep[] = []
  for (const [id,count] of sequence) {
    const talent = talents.find(t => t.id === id)
    if (!talent) throw new Error(`Missing leveling talent: ${id}`)
    for (let i=0; i<count; i++) {
      const next = incrementPlannerTalent(build,talent,talents,{branches:BRANCHES,pointCap:21})
      if (next === build) throw new Error(`Illegal leveling step: ${id}`)
      build = next
      steps.push({level:10+steps.length,talentId:id,name:talent.name,rank:build[id],build:{...build}})
    }
  }
  return steps
}
export const PALADIN_LEVELING_STEPS = createSteps()
export function paladinLevelingStep(level: number) { return PALADIN_LEVELING_STEPS.find(step => step.level === level) }
export function paladinLevelingHref(level: number): string {
  const step = paladinLevelingStep(level)
  if (!step) throw new Error('No reviewed route for this level')
  return `/build?id=${encodeBuild(step.build)}&level=${level}#calculator`
}
