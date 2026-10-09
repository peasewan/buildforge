import { describe, expect, it } from 'vitest'
import { incrementPlannerTalent, totalPlannerPoints, type PlannerBuild } from '../lib/talentPlanner'
import { WARRIOR_PLANNER_CONFIG, warriorTalents } from './warriorTalents'
import { WARRIOR_LEVEL_20_BUILDS, WARRIOR_LEVEL_30_BUILDS, WARRIOR_PVP_LEVEL_30_BUILDS } from './warriorBuilds'

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

// Replaying the exact sequence catches an illegal tier jump or an allocation that
// silently drops a new talent; the endpoint must spend the actual Level 30 budget.

describe('Warrior Level 30 current builds', () => {
  it('replays three complete 21-point routes against the current tree', () => {
    expect(WARRIOR_LEVEL_30_BUILDS).toHaveLength(3)
    for (const preset of [...WARRIOR_LEVEL_30_BUILDS, ...WARRIOR_PVP_LEVEL_30_BUILDS]) {
      let build: PlannerBuild = {}
      for (const step of preset.order) {
        const talent = warriorTalents.find((candidate) => candidate.id === step)
        expect(talent, step).toBeDefined()
        const next = incrementPlannerTalent(build, talent!, warriorTalents, { ...WARRIOR_PLANNER_CONFIG, pointCap: 21 })
        expect(totalPlannerPoints(next), step).toBe(totalPlannerPoints(build) + 1)
        build = next
      }
      expect(totalPlannerPoints(build)).toBe(21)
      expect(build).toEqual(preset.build)
    }
    expect(WARRIOR_LEVEL_30_BUILDS.map((preset) => preset.allocation)).toEqual(['21/0/0', '0/21/0', '0/0/21'])
    expect(WARRIOR_PVP_LEVEL_30_BUILDS).toHaveLength(2)
    for (const preset of WARRIOR_PVP_LEVEL_30_BUILDS) {
      expect(preset.build).not.toEqual(WARRIOR_LEVEL_30_BUILDS.find((route) => route.branch === preset.branch)?.build)
    }
  })
})
