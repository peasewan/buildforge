import { describe, expect, it } from 'vitest'
import { BETA_SPEC_PATHS, betaSpecPlannerHref } from './betaSpecPaths'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { BETA_LEVELING_SNAPSHOTS, betaLevelingPlannerHref } from './levelingBeta'
import { BRANCHES, totalPoints } from '../lib/build'
import { isValidPlannerBuild } from '../lib/talentPlanner'
import { talents } from './talents'

describe('published current Paladin routes', () => {
  it('does not offer the removed Improved Holy Strike in a current route or its calculator deep link', () => {
    const routes = [...Object.values(BETA_SPEC_PATHS), ...Object.values(BETA_LEVELING_SNAPSHOTS)]
    expect(routes.every((route) => route.status === 'current' || route.status === 'archived')).toBe(true)
    for (const route of routes.filter((entry) => entry.status === 'current')) {
      expect(route.current.build.improved_holy_strike ?? 0, route.title).toBe(0)
    }

    const protection = BETA_SPEC_PATHS.protection
    const leveling = BETA_LEVELING_SNAPSHOTS['protection-leveling']
    expect(protection.status).toBe('current')
    expect(leveling.status).toBe('current')
    expect(protection.current.build).toEqual(leveling.current.build)
    expect(protection.current.build).toEqual({ toughness: 5, redoubt: 5, precision: 1 })
    expect(totalPoints(protection.current.build)).toBe(11)
    expect(isValidPlannerBuild(protection.current.build, talents, { branches: BRANCHES, pointCap: 11 })).toBe(true)
    expect(betaSpecPlannerHref('protection')).toMatch(/&level=20#calculator$/)
    expect(betaLevelingPlannerHref('protection-leveling')).toMatch(/&level=20#calculator$/)
    expect(leveling.next).toMatchObject({
      level: 30,
      points: 21,
      status: 'editorial_reviewed',
      allocation: '0/21/0',
      build: { toughness: 5, redoubt: 5, precision: 3, anticipation: 5, improved_righteous_fury: 3 },
    })
    expect(isValidPlannerBuild(leveling.next.build!, talents, { branches: BRANCHES, pointCap: 21 })).toBe(true)
  })

  it('keeps Level 20 starter allocations separate from the official Level 30 cap', () => {
    expect(PALADIN_BETA_SNAPSHOT.phase.levelCap).toBe(30)
    expect(PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap).toBe(20)
    expect(PALADIN_BETA_SNAPSHOT.phase.officialSource).toContain('2360696/1')
    expect(BETA_SPEC_PATHS.holy.next.status).toBe('under_review')
    expect(BETA_SPEC_PATHS.protection.next.status).toBe('editorial_reviewed')
    expect(BETA_SPEC_PATHS.retribution.next.status).toBe('community_reviewed')
    for (const path of Object.values(BETA_SPEC_PATHS)) {
      expect(path.current.level).toBe(20)
      expect(path.current.points).toBe(11)
      expect(path.next.level).toBe(30)
      if (path.branch === 'holy') expect(path.next).not.toHaveProperty('allocation')
    }
    expect(betaSpecPlannerHref('holy')).toMatch(/&level=20#calculator$/)
    expect(betaSpecPlannerHref('retribution')).toMatch(/&level=20#calculator$/)
    expect(betaLevelingPlannerHref('leveling')).toMatch(/&level=30#calculator$/)
    expect(betaLevelingPlannerHref('retribution-leveling')).toMatch(/&level=30#calculator$/)
  })

})
