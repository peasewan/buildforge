import { describe, expect, it } from 'vitest'
import { hunterClassFixture } from '../data/fixtures/hunterClass.fixture'
import { applyClassConsolidations, consolidatedClassTasks } from './classConsolidations'
import { publishedClassPages, validClassBuild } from './classPage'

const hub = '/wow-forever-hunter-builds'
const endpoint = '/wow-forever-beast-mastery-hunter-build'
const leveling = '/wow-forever-hunter-leveling-build'
const fixture = () => structuredClone(hunterClassFixture)

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

describe('class consolidation', () => {
  it('retires a task without changing its allocation, evidence, metadata or source record', () => {
    const input = fixture()
    input.builds[0].href = endpoint
    input.pages.find(page => page.slug === 'hunter')!.relatedPages = [
      { href: endpoint, label: 'Beast Mastery' },
      { href: `${endpoint}?level=20#selected-ranks`, label: 'Selected ranks' },
    ]
    const before = JSON.stringify(input)
    deepFreeze(input)

    const result = applyClassConsolidations(input, { [endpoint]: hub })
    const source = result.pages.find(page => `/${page.slug}` === endpoint)!
    const original = input.pages.find(page => `/${page.slug}` === endpoint)!
    expect(source.retiredTo).toBe(hub)
    expect(source).toEqual({ ...original, retiredTo: hub })
    expect(result.pages.find(page => page.slug === 'hunter')!.relatedPages).toEqual([
      { href: hub, label: 'Beast Mastery' },
      { href: `${hub}?level=20#selected-ranks`, label: 'Selected ranks' },
    ])
    expect(result.builds[0]).toEqual({ ...input.builds[0], href: hub })
    expect(result.builds[0].build).toEqual({ 'bm-1': 5, 'bm-2': 5, 'bm-3': 1 })
    expect(result.builds.every(build => validClassBuild(result, build))).toBe(true)
    expect(result.talents).toBe(input.talents)
    expect(result.sources).toBe(input.sources)
    expect(result.dataVersion).toBe(input.dataVersion)
    expect(result.recommendedBuildIds).toBe(input.recommendedBuildIds)
    expect(JSON.stringify(input)).toBe(before)
    expect(publishedClassPages([result]).some(({ page }) => `/${page.slug}` === endpoint)).toBe(false)
  })

  it('flattens an older retirement when its destination is consolidated again', () => {
    const input = fixture()
    input.pages.find(page => `/${page.slug}` === leveling)!.retiredTo = endpoint
    input.builds[0].href = leveling
    input.pages.find(page => `/${page.slug}` === hub)!.relatedPages = [
      { href: leveling, label: 'Old leveling' },
      { href: endpoint, label: 'Old endpoint' },
      { href: '/hunter', label: 'Calculator' },
    ]
    const result = applyClassConsolidations(input, { [endpoint]: hub })
    expect(result.pages.find(page => `/${page.slug}` === leveling)!.retiredTo).toBe(hub)
    expect(result.pages.find(page => `/${page.slug}` === endpoint)!.retiredTo).toBe(hub)
    expect(result.builds[0].href).toBe(hub)
    expect(result.pages.find(page => `/${page.slug}` === hub)!.relatedPages).toEqual([
      { href: '/hunter', label: 'Calculator' },
    ])
  })

  it.each([
    ['self redirect', { [endpoint]: endpoint }],
    ['cycle', { [endpoint]: leveling, [leveling]: endpoint }],
    ['dangling destination', { [endpoint]: '/missing' }],
  ])('rejects a %s', (_label, map) => {
    expect(() => applyClassConsolidations(fixture(), map)).toThrow(/consolidation/i)
  })

  it('rejects a destination that exists but cannot publish', () => {
    const input = fixture()
    input.pages.find(page => `/${page.slug}` === hub)!.publishRequirements = ['legalBuild:unreviewed']
    expect(() => applyClassConsolidations(input, { [endpoint]: hub })).toThrow(/publish/i)
  })

  it('does not apply another class or a non-framework retirement', () => {
    const input = fixture()
    const result = applyClassConsolidations(input, { '/wow-forever-paladin-raid-build': '/paladin' })
    expect(result).toEqual(input)
  })

  it('exposes original retired tasks to their retained page without recursive hub/calculator tasks', () => {
    const input = fixture()
    const result = applyClassConsolidations(input, { [endpoint]: hub, '/hunter': hub })
    const retained = result.pages.find(page => `/${page.slug}` === hub)!
    const tasks = consolidatedClassTasks(result, retained)
    expect(tasks.map(page => page.slug)).toEqual(['wow-forever-beast-mastery-hunter-build'])
    expect(tasks[0]).toBe(result.pages.find(page => `/${page.slug}` === endpoint))
    expect(tasks[0].primaryBuildId).toBe('hunter-bm-leveling')
    expect(tasks[0].sections).toEqual(input.pages.find(page => `/${page.slug}` === endpoint)!.sections)
    expect(consolidatedClassTasks(result, result.pages.find(page => page.kind === 'talents')!)).toEqual([])
  })
})
