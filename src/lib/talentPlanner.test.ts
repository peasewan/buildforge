import { describe, expect, it } from 'vitest'
import {
  canIncrementPlannerTalent,
  decodePlannerBuild,
  decrementPlannerTalent,
  dominantPlannerBranch,
  encodePlannerBuild,
  incrementPlannerTalent,
  plannerLockReason,
  totalPlannerPoints,
  type PlannerConfig,
  type PlannerTalent,
} from './talentPlanner'

type TestBranch = 'left' | 'right'
const config: PlannerConfig<TestBranch> = { branches: ['left', 'right'], pointCap: 11 }
const talents: PlannerTalent<TestBranch>[] = [
  { id: 'root', branch: 'left', maxRank: 5, requiredTreePoints: 0 },
  { id: 'focus', branch: 'left', maxRank: 3, requiredTreePoints: 5 },
  { id: 'crown', branch: 'left', maxRank: 1, requiredTreePoints: 8, prerequisite: [{ talentId: 'focus', requiredRank: null }] },
  { id: 'guard', branch: 'right', maxRank: 5, requiredTreePoints: 0 },
]

describe('class-neutral talent planner', () => {
  it('enforces the configured tree tiers and point cap', () => {
    expect(plannerLockReason({}, talents[1], talents, config)).toEqual({ type: 'branch-points', current: 0, required: 5 })
    expect(canIncrementPlannerTalent({ root: 5 }, talents[1], talents, config)).toBe(true)
    expect(incrementPlannerTalent({ root: 5, focus: 3, crown: 1, guard: 2 }, talents[3], talents, config)).toEqual({ root: 5, focus: 3, crown: 1, guard: 2 })
  })

  it('clears descendants after removing a required rank', () => {
    expect(decrementPlannerTalent({ root: 5, focus: 3, crown: 1 }, talents[1], talents)).toEqual({ root: 5, focus: 2 })
  })

  it('round-trips known ranks and reports the dominant configured branch', () => {
    const build = { root: 5, focus: 2, guard: 1 }
    const code = encodePlannerBuild(build)
    expect(code).toBe('focus.2~guard.1~root.5')
    expect(decodePlannerBuild(code, talents)).toEqual(build)
    expect(totalPlannerPoints(build)).toBe(8)
    expect(dominantPlannerBranch(build, talents, config.branches, 'right')).toBe('left')
  })
})
