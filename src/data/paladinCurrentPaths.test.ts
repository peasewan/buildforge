import { describe, expect, it } from 'vitest'
import { BETA_SPEC_PATHS, betaSpecPlannerHref } from './betaSpecPaths'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { BETA_LEVELING_SNAPSHOTS, betaLevelingPlannerHref } from './levelingBeta'

describe('published current Paladin routes', () => {
  it('does not offer the removed Improved Holy Strike in a current route or its calculator deep link', () => {
    const routes = [...Object.values(BETA_SPEC_PATHS), ...Object.values(BETA_LEVELING_SNAPSHOTS)]
    expect(routes.every((route) => route.status === 'current' || route.status === 'archived')).toBe(true)
    for (const route of routes.filter((entry) => entry.status === 'current')) {
      expect(route.current.build.improved_holy_strike ?? 0, route.title).toBe(0)
    }

    expect(BETA_SPEC_PATHS.protection.status).toBe('archived')
    expect(BETA_LEVELING_SNAPSHOTS['protection-leveling'].status).toBe('archived')
    expect(betaSpecPlannerHref('protection')).toBe('/build?id=#calculator')
    expect(betaLevelingPlannerHref('protection-leveling')).toBe('/build?id=#calculator')
  })

  it('keeps Level 20 starter allocations separate from the official Level 30 cap', () => {
    expect(PALADIN_BETA_SNAPSHOT.phase.levelCap).toBe(30)
    expect(PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap).toBe(20)
    expect(PALADIN_BETA_SNAPSHOT.phase.officialSource).toContain('2360696/1')
    expect(BETA_SPEC_PATHS.holy.next.status).toBe('under_review')
    expect(BETA_SPEC_PATHS.protection.next.status).toBe('under_review')
    expect(BETA_SPEC_PATHS.retribution.next.status).toBe('under_review')
    for (const path of Object.values(BETA_SPEC_PATHS)) {
      expect(path.current.level).toBe(20)
      expect(path.current.points).toBe(11)
      expect(path.next.level).toBe(30)
      expect(path.next).not.toHaveProperty('allocation')
    }
    expect(betaSpecPlannerHref('holy')).toMatch(/&level=20#calculator$/)
    expect(betaSpecPlannerHref('retribution')).toMatch(/&level=20#calculator$/)
    expect(betaLevelingPlannerHref('leveling')).toMatch(/&level=20#calculator$/)
    expect(betaLevelingPlannerHref('retribution-leveling')).toMatch(/&level=20#calculator$/)
  })

})
