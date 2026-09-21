import { describe, expect, it } from 'vitest'
import { incrementPlannerTalent, totalPlannerPoints, type PlannerBuild } from '../lib/talentPlanner'
import { WARRIOR_PLANNER_CONFIG, warriorTalents } from './warriorTalents'
import { WARRIOR_LEVEL_20_BUILDS } from './warriorBuilds'

describe('Warrior Level 20 starter builds', () => {
  it('publishes one legal 11-point route per specialization', () => {
    expect(WARRIOR_LEVEL_20_BUILDS).toHaveLength(3)

    for (const preset of WARRIOR_LEVEL_20_BUILDS) {
      let build: PlannerBuild = {}
      for (const step of preset.order) {
        const talent = warriorTalents.find((candidate) => candidate.id === step)
        expect(talent, step).toBeDefined()
        build = incrementPlannerTalent(build, talent!, warriorTalents, WARRIOR_PLANNER_CONFIG)
      }
      expect(totalPlannerPoints(build)).toBe(11)
      expect(build).toEqual(preset.build)
    }
  })

  it('uses 11/0/0, 0/11/0, and 0/0/11 allocations', () => {
    expect(WARRIOR_LEVEL_20_BUILDS.map((preset) => preset.allocation)).toEqual(['11/0/0', '0/11/0', '0/0/11'])
  })
})
