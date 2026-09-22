import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../data/classes'
import { warriorClass } from '../data/classes/warrior'
import { WARRIOR_LEVEL_20_BUILDS } from '../data/warriorBuilds'
import { classPlannerHref, publishedClassPages, type ClassBuild, type ClassDefinition } from '../lib/classPage'
import { canIncrementPlannerTalent, decodePlannerBuild, encodePlannerBuild, totalPlannerPoints } from '../lib/talentPlanner'
import { buildsUsingTalent, diffBuilds, progressionForBuild } from './buildExperience'

const fixture: ClassDefinition = {
  ...warriorClass,
  talents: [
    { ...warriorClass.talents[0], id: 'root', name: 'Root', branch: 'arms', maxRank: 5, requiredTreePoints: 0, prerequisite: [] },
    { ...warriorClass.talents[0], id: 'guard', name: 'Guard', branch: 'arms', maxRank: 5, requiredTreePoints: 0, prerequisite: [] },
    { ...warriorClass.talents[0], id: 'crown', name: 'Crown', branch: 'arms', maxRank: 1, requiredTreePoints: 5, prerequisite: [{ talentId: 'root', requiredRank: 5 }] },
  ],
}
const build: ClassBuild = {
  ...warriorClass.builds[0], build: { root: 5, guard: 5, crown: 1 }, order: ['root', 'guard', 'crown'], pointOrder: undefined,
}

describe('build progression', () => {
  it('derives honest grouped prefixes at levels 10, 15 and 20 without mutating the source', () => {
    const before = JSON.stringify(build)
    const result = progressionForBuild(fixture, build)
    expect(result.error).toBeUndefined()
    expect(result.orderStatus).toBe('derived')
    expect(result.steps[0]).toEqual({ level: 10, talentId: 'root', rank: 1, allocation: { root: 1 } })
    expect(result.steps[5]).toEqual({ level: 15, talentId: 'guard', rank: 1, allocation: { root: 5, guard: 1 } })
    expect(result.steps[10]).toEqual({ level: 20, talentId: 'crown', rank: 1, allocation: { root: 5, guard: 5, crown: 1 } })
    expect(result.steps).toHaveLength(11)
    expect(JSON.stringify(build)).toBe(before)
    result.steps[10].allocation.root = 0
    expect(result.steps[0].allocation.root).toBe(1)
    expect(build.build.root).toBe(5)
  })

  it('preserves interleaved editorial ranks instead of grouping or sorting them', () => {
    const pointOrder = ['root', 'guard', 'root', 'guard', 'root', 'guard', 'root', 'guard', 'root', 'crown', 'guard']
    const result = progressionForBuild(fixture, { ...build, pointOrder })
    expect(result.error).toBeUndefined()
    expect(result.orderStatus).toBe('editorial')
    expect(result.steps.map((step) => step.talentId)).toEqual(pointOrder)
    expect(result.steps[9].allocation).toEqual({ root: 5, guard: 4, crown: 1 })
  })

  it.each([
    ['unknown target', { build: { root: 5, missing: 5, crown: 1 } }],
    ['unknown order entry', { order: ['root', 'missing', 'guard', 'crown'] }],
    ['missing target in order', { order: ['root', 'guard'] }],
    ['duplicated grouped entry', { order: ['root', 'root', 'guard', 'crown'] }],
    ['unmet prerequisite prefix', { order: ['guard', 'crown', 'root'] }],
    ['unmet tier prefix', { order: ['crown', 'root', 'guard'] }],
    ['rank overflow', { build: { root: 6, guard: 4, crown: 1 } }],
    ['fractional rank', { build: { root: 4.5, guard: 5.5, crown: 1 } }],
    ['negative rank', { build: { root: -1, guard: 5, crown: 1 } }],
    ['empty target', { build: {}, points: 0, order: [] }],
    ['mismatched declared points', { points: 10 }],
    ['target over point cap', { levelCap: 10 }],
    ['target over level budget', { build: { root: 5, guard: 5, crown: 1, extra: 1 }, points: 12 }],
    ['incomplete editorial sequence', { pointOrder: ['root'] }],
    ['editorial sequence over target', { pointOrder: ['root', 'root', 'root', 'root', 'root', 'root', 'guard', 'guard', 'guard', 'guard', 'crown'] }],
    ['illegal editorial prefix', { pointOrder: ['crown', 'root', 'root', 'root', 'root', 'root', 'guard', 'guard', 'guard', 'guard', 'guard'] }],
  ] satisfies Array<[string, Partial<ClassBuild>]>)('rejects %s without returning a misleading partial route', (_label, changes) => {
    const result = progressionForBuild(fixture, { ...build, ...changes })
    expect(result.error).toBeTruthy()
    expect(result.steps).toEqual([])
  })

  it('does not spend a twelfth point at level 20 even when levelCap uses character-level units', () => {
    const expanded: ClassDefinition = { ...fixture, talents: [...fixture.talents, { ...fixture.talents[0], id: 'extra' }] }
    const result = progressionForBuild(expanded, { ...build, build: { ...build.build, extra: 1 }, order: [...build.order, 'extra'], points: 12 })
    expect(result.error).toBeTruthy()
    expect(result.steps).toEqual([])
  })

  it('retains the original Warrior point sequences for every published variant', () => {
    for (const variant of warriorClass.builds) {
      const preset = WARRIOR_LEVEL_20_BUILDS.find((candidate) => candidate.branch === variant.spec)!
      const result = progressionForBuild(warriorClass, variant)
      expect(result.orderStatus).toBe('editorial')
      expect(result.steps.map((step) => step.talentId)).toEqual(preset.order)
    }
  })

  it.each(PUBLISHED_CLASSES.map((classDef) => [classDef.id, classDef] as const))('validates every published %s build and round-trips every prefix through calculator links', (_id, classDef) => {
    const paths = new Set(publishedClassPages([classDef]).map(({ page }) => `/${page.slug}`))
    const publishedBuilds = classDef.builds.filter((candidate) => paths.has(candidate.href))
    expect(publishedBuilds.length).toBeGreaterThan(0)
    for (const candidate of publishedBuilds) {
      const result = progressionForBuild(classDef, candidate)
      expect(result.error, candidate.id).toBeUndefined()
      expect(result.steps.at(-1)?.allocation, candidate.id).toEqual(candidate.build)
      expect(result.steps).toHaveLength(candidate.points)
      let previous = {}
      for (const step of result.steps) {
        const talent = classDef.talents.find((entry) => entry.id === step.talentId)!
        expect(canIncrementPlannerTalent(previous, talent, classDef.talents, { ...classDef.plannerConfig, pointCap: candidate.level - 9 })).toBe(true)
        expect(totalPlannerPoints(step.allocation)).toBe(step.level - 9)
        const href = classPlannerHref(classDef, encodePlannerBuild(step.allocation), candidate.level)
        const params = new URL(href, 'https://buildforgetools.com').searchParams
        expect(decodePlannerBuild(params.get('build')!, classDef.talents)).toEqual(step.allocation)
        expect(params.get('level')).toBe(String(candidate.level))
        previous = step.allocation
      }
    }
  })
})

describe('exact build differences', () => {
  it('returns no changes for identical allocations with distinct editorial purposes', () => {
    expect(diffBuilds(fixture, build, { ...build, id: 'another', role: 'PvP' })).toEqual([])
  })

  it('compares missing ranks as zero and keeps deterministic talent identity and names', () => {
    const left = { ...build, build: { crown: 1, root: 5 } }
    const right = { ...build, build: { guard: 5, root: 4 } }
    expect(diffBuilds(fixture, left, right)).toEqual([
      { talentId: 'root', name: 'Root', left: 5, right: 4 },
      { talentId: 'guard', name: 'Guard', left: 0, right: 5 },
      { talentId: 'crown', name: 'Crown', left: 1, right: 0 },
    ])
  })
})

describe('editorial talent usage', () => {
  it('includes only linked published routes and returns none for an unknown talent', () => {
    const root = 'warrior-arms-improved-rend'
    const unlinked = { ...warriorClass.builds[0], id: 'unlinked', href: '/missing-route' }
    const unavailable = { ...warriorClass.builds[0], id: 'unavailable', href: '/unavailable-route' }
    const page = { ...warriorClass.pages[0], slug: 'unavailable-route', primaryBuildId: unavailable.id, publishRequirements: ['legalBuild:missing' as const] }
    const classDef: ClassDefinition = { ...warriorClass, builds: [...warriorClass.builds, unlinked, unavailable], pages: [...warriorClass.pages, page] }
    const matches = buildsUsingTalent(classDef, root)
    expect(matches.map((candidate) => candidate.id)).toEqual(['warrior-arms-build', 'warrior-arms-leveling', 'warrior-arms-pvp'])
    expect(buildsUsingTalent(classDef, 'missing')).toEqual([])
  })
})
