import { describe, expect, it } from 'vitest'
import { BETA_SPEC_PATHS, betaSpecPlannerHref } from './betaSpecPaths'
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

  it('holds projections that used the removed talent for review instead of offering them as plans', () => {
    expect(BETA_SPEC_PATHS.holy.next.status).toBe('planned')
    expect(BETA_SPEC_PATHS.protection.next.status).toBe('under_review')
    expect(BETA_SPEC_PATHS.retribution.next.status).toBe('under_review')
    for (const path of Object.values(BETA_SPEC_PATHS)) {
      if (path.next.status === 'planned') expect(path.next.note).not.toContain('Improved Holy Strike')
    }
  })

})
