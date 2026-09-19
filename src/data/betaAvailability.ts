import type { Branch } from '../lib/build'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { talents } from './talents'

const featuredTalentByBranch: Record<Branch, string> = {
  holy: 'light_s_vigil',
  protection: 'improved_seal_of_fury',
  retribution: 'twist_of_light',
}

export function betaAvailabilityFor(branch: Branch) {
  const talent = talents.find((candidate) => candidate.id === featuredTalentByBranch[branch])
  if (!talent) throw new Error(`Missing featured ${branch} talent.`)

  const levelCap = PALADIN_BETA_SNAPSHOT.phase.levelCap
  const availablePoints = Math.max(0, levelCap - 9)
  const requiredPoints = talent.requiredTreePoints + 1

  return {
    talent,
    levelCap,
    availablePoints,
    requiredPoints,
    minimumLevel: requiredPoints + 9,
    available: availablePoints >= requiredPoints,
  }
}
