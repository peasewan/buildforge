import { describe, expect, it } from 'vitest'
import { BRANCHES, decodeBuild, totalPoints } from '../lib/build'
import { incrementPlannerTalent } from '../lib/talentPlanner'
import { talents } from './talents'
import { createPointSteps, HOLY_SHOCK_POINT_STEPS, PALADIN_COMPARISON_ROUTES, PROTECTION_POINT_STEPS, pointStepHref, snapshotGate } from './paladinDecisionTools'
import { PROTECTION_LEVEL_20, PROTECTION_LEVEL_30 } from './protectionCurrentRoute'
import { PALADIN_IMPACT_CHANGES, routesUsingTalent } from './paladinBuildImpact'

describe('replayable Paladin routes', () => {
  for (const [name, steps] of [...PALADIN_COMPARISON_ROUTES.map(route => [route.id, route.steps] as const), ['protection', PROTECTION_POINT_STEPS] as const]) {
    it(`${name}: each point is legal at its own level and survives URL encoding`, () => {
      let previous = {}
      expect(steps).toHaveLength(21)
      for (const step of steps) {
        const talent = talents.find(item => item.id === step.talentId)!
        expect(incrementPlannerTalent(previous, talent, talents, { branches: BRANCHES, pointCap: step.level - 9 })).toEqual(step.build)
        expect(totalPoints(step.build)).toBe(step.level - 9)
        expect(step.build.improved_holy_strike).toBeUndefined()
        expect(step.build.crusade).toBeUndefined()
        const url = new URL(pointStepHref(step), 'https://buildforgetools.com')
        expect(decodeBuild(url.searchParams.get('id')!, talents)).toEqual(step.build)
        expect(url.searchParams.get('level')).toBe(String(step.level))
        previous = step.build
      }
    })
  }
  it('rejects an impossible capstone route instead of generating a misleading share', () => {
    expect(() => createPointSteps([['twist_of_light', 1]])).toThrow('Illegal route step')
    expect(() => createPointSteps([['improved_holy_strike', 1]])).toThrow()
    expect(() => createPointSteps([['benediction', 6]])).toThrow()
  })
  it('keeps published Protection endpoints and unlocks Holy Shock only at 30', () => {
    expect(PROTECTION_POINT_STEPS[10].build).toEqual(PROTECTION_LEVEL_20)
    expect(PROTECTION_POINT_STEPS[20].build).toEqual(PROTECTION_LEVEL_30)
    expect(HOLY_SHOCK_POINT_STEPS[19].build.holy_shock).toBeUndefined()
    expect(HOLY_SHOCK_POINT_STEPS[20].build.holy_shock).toBe(1)
    expect(snapshotGate('twist_of_light')).toMatchObject({ points: 31, minimumLevel: 40, withinLevel30Budget: false })
  })
  it('derives patch membership from allocations and does not claim popularity', () => {
    expect(routesUsingTalent('redoubt').some(route => route.id === 'prot-30')).toBe(true)
    expect(routesUsingTalent('redoubt').some(route => route.id === 'ret-30')).toBe(false)
    expect(routesUsingTalent('twist_of_light').every(route => route.historical)).toBe(true)
    for (const change of PALADIN_IMPACT_CHANGES) {
      expect(routesUsingTalent(change.id).length).toBeGreaterThan(0)
      for (const route of routesUsingTalent(change.id)) expect(route.build[change.id]).toBeGreaterThan(0)
    }
  })
})
