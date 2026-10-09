import { describe, expect, it } from 'vitest'
import { DUNGEONS, buildCatalogue, dungeonMatches, milestonesForDungeon, nextTalentAtLevel, pickSpecs, snapshotAtLevel } from './planningTools'
import { PUBLISHED_CLASSES } from './classes'
import { pageForPath } from '../lib/routes'
import { totalPlannerPoints } from '../lib/talentPlanner'
import { PROTECTION_ROUTE_EVIDENCE } from './protectionCurrentRoute'

describe('evidence-bounded planning tools', () => {
  it('keeps unreviewed future dungeons locked', () => {
    expect(DUNGEONS.map(d => [d.id, d.minLevel, d.maxLevel])).toEqual([['ruins-of-lordaeron',15,20],['hall-of-thanes',13,18],['excavation-site',26,31]])
    expect(dungeonMatches('excavation-site','tank','all',25)).toEqual([])
    expect(dungeonMatches('hall-of-thanes','tank','all',20)).toEqual([])
  })
  it('returns in-range planning milestones only for supported dungeons', () => {
    expect(milestonesForDungeon('ruins-of-lordaeron')).toEqual([15, 18, 20])
    expect(milestonesForDungeon('hall-of-thanes')).toEqual([13, 16, 18])
    expect(milestonesForDungeon('excavation-site')).toEqual([])
    expect(milestonesForDungeon('unknown')).toEqual([])
  })
  it('finds the next level-specific talent without crossing the current cap', () => {
    const route = dungeonMatches('ruins-of-lordaeron', 'tank', 'warrior', 15)[0]
    expect(route).toBeDefined()
    const next = nextTalentAtLevel(route, 15)
    expect(next?.level).toBe(16)
    expect(totalPlannerPoints(next!.allocation)).toBe(7)
    expect(nextTalentAtLevel(route, 19)?.level).toBe(20)
    expect(nextTalentAtLevel(route, 20)).toBeUndefined()
    expect(nextTalentAtLevel(route, 20.5)).toBeUndefined()
  })
  it('offers only published, replayable routes, including the reviewed Protection starter', () => {
    const catalogue = buildCatalogue()
    expect(catalogue.length).toBeGreaterThan(20)
    const protection = catalogue.find(b => b.id === 'paladin-protection')
    expect(protection?.role).toBe('tank')
    expect(protection?.version).toBe(PROTECTION_ROUTE_EVIDENCE.reviewedClientBuild)
    expect(protection?.removedTalentNames).toEqual([])
    for (const route of catalogue) {
      expect(pageForPath(route.href).canonical).toBe(`https://buildforgetools.com${route.href}`)
      expect(route.steps.length).toBe(11)
      expect(totalPlannerPoints(snapshotAtLevel(route,13)!.allocation)).toBe(4)
      expect(snapshotAtLevel(route,9)).toBeUndefined()
      expect(snapshotAtLevel(route,21)).toBeUndefined()
    }
    expect(buildCatalogue(PUBLISHED_CLASSES.map(c => ({...c, builds:[]})), false)).toEqual([])
  })
  it('keeps current Hunter routes editable and routes Warrior PvP through the updated tree', () => {
    const routes = buildCatalogue()
    const beastMastery = routes.find(route => route.id === 'hunter-beast-mastery-starter')!
    const marksmanship = routes.find(route => route.id === 'hunter-marksmanship-starter')!
    const survival = routes.find(route => route.id === 'hunter-survival-starter')!

    expect(beastMastery.removedTalentNames).toEqual([])
    expect(marksmanship.removedTalentNames).toEqual([])
    expect(beastMastery.calculatorHref(snapshotAtLevel(beastMastery, 15)!.allocation)).toMatch(/^\/hunter\?build=.+&level=20&dataset=1\.60\.1\.70291#class-calculator$/)
    expect(marksmanship.calculatorHref(snapshotAtLevel(marksmanship, 20)!.allocation)).toMatch(/^\/hunter\?build=.+&level=20&dataset=1\.60\.1\.70291#class-calculator$/)
    expect(pickSpecs({activity:'pvp',role:'damage',style:'melee'}).some(result => result.route.classId === 'warrior')).toBe(true)
    expect(survival.removedTalentNames).toEqual([])
    expect(survival.calculatorHref(snapshotAtLevel(survival, 20)!.allocation)).toMatch(/^\/hunter\?build=.+#class-calculator$/)
  })
  it('keeps the Level 20 mode when opening a Paladin starting route from a planning tool', () => {
    const holy = buildCatalogue().find(route => route.id === 'paladin-holy')!
    expect(holy.calculatorHref(snapshotAtLevel(holy, 20)!.allocation)).toMatch(/&level=20#calculator$/)
  })
  it('filters dungeon roles without suggesting damage routes for healing', () => {
    const results = dungeonMatches('ruins-of-lordaeron','heal','all',17)
    expect(results.length).toBeGreaterThan(1)
    expect(results.every(r => r.role === 'heal')).toBe(true)
    expect(results.every(r => totalPlannerPoints(snapshotAtLevel(r,17)!.allocation) === 8)).toBe(true)
    expect(dungeonMatches('hall-of-thanes','tank','warrior',13).map(r => r.classId)).toEqual(['warrior'])
  })
  it('matches explicit preferences rather than invented best-class rankings', () => {
    const preferences = {activity:'dungeon' as const, role:'heal' as const, style:'any' as const}
    const results = pickSpecs(preferences)
    expect(results.length).toBeGreaterThan(1)
    expect(results.every(r => r.route.role === 'heal' && r.reasons.length >= 2)).toBe(true)
    expect(pickSpecs({...preferences, style:'melee'})).toEqual([])
    expect(pickSpecs(preferences)).toEqual(results)
  })
})
