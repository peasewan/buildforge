import { describe, expect, it } from 'vitest'
import { paladinLevelingStep, PALADIN_LEVELING_STEPS, paladinLevelingHref } from './paladinLevelingProgression'
import { talents } from './talents'
import { BRANCHES, totalPoints } from '../lib/build'
import { decodeValidatedPlannerBuild, incrementPlannerTalent } from '../lib/talentPlanner'

describe('sourced Paladin level 10–30 progression', () => {
  it('replays every rank legally and shares each exact point budget', () => {
    let previous = {}
    expect(PALADIN_LEVELING_STEPS).toHaveLength(21)
    for (const step of PALADIN_LEVELING_STEPS) {
      const talent = talents.find(t => t.id === step.talentId)!
      const config = { branches: BRANCHES, pointCap: step.level - 9 }
      const next = incrementPlannerTalent(previous, talent, talents, config)
      expect(next).not.toBe(previous)
      expect(step.build).toEqual(next)
      expect(totalPoints(step.build)).toBe(step.level - 9)
      const params = new URL(paladinLevelingHref(step.level), 'https://buildforgetools.com').searchParams
      expect(params.get('level')).toBe(String(step.level))
      expect(decodeValidatedPlannerBuild(params.get('id')!, talents, config)).toEqual(step.build)
      previous = next
    }
  })
  it('spends the last point in Vengeance after Sanctified Judgement, without Crusade', () => {
    expect(paladinLevelingStep(30)?.build).toEqual({ benediction:5, conviction:5, pursuit_of_justice:2, seal_of_command:1, sanctified_judgement:3, sacred_arbiter:1, vindication:3, vengeance:1 })
    expect(paladinLevelingStep(20)?.talentId).toBe('pursuit_of_justice')
    expect(paladinLevelingStep(30)?.talentId).toBe('vengeance')
  })
  it.each([9,31,20.5,NaN,Infinity])('does not invent a step for %s', level => {
    expect(paladinLevelingStep(level)).toBeUndefined()
    expect(() => paladinLevelingHref(level)).toThrow()
  })
})
