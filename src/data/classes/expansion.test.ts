import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from './index'
import { isLegalAllocation, publishedClassPages, assertUniquePageIntents, classPlannerHref } from '../../lib/classPage'
import { decodePlannerBuild, encodePlannerBuild, canIncrementPlannerTalent, incrementPlannerTalent, type PlannerBuild } from '../../lib/talentPlanner'
import { importClientClass, parseClientCsv } from '../../lib/clientClassImport'
import { renderClassPage } from '../../lib/prerender'

const ids = ['rogue', 'priest', 'druid', 'warlock', 'hunter', 'shaman']
const classes = PUBLISHED_CLASSES.filter((c) => ids.includes(c.id))
const dir = 'data/sources/six-classes/1.60.1.69913'
const csv = (name: string) => parseClientCsv(readFileSync(`${dir}/${name}.csv`, 'utf8'))
const masks: Record<string, number> = { rogue: 8, priest: 16, druid: 1024, warlock: 256, hunter: 4, shaman: 64 }

describe('six-class release', () => {
  it('has ninety distinct pages and six independently sourced datasets', () => {
    expect(classes).toHaveLength(6)
    const pages = classes.flatMap((c) => c.pages)
    expect(pages).toHaveLength(90)
    expect(new Set(pages.map((p) => p.description)).size).toBe(90)
    assertUniquePageIntents(pages)
    expect(publishedClassPages(classes)).toHaveLength(90)
  })
  for (const c of classes) {
    it(`${c.name}: reproduces the checked-in dataset from archived primary and cross-check records`, () => {
      const imported = importClientClass({ classId: c.id, classMask: masks[c.id], build: c.verifiedBuild, talents: csv('Talent'), tabs: csv('TalentTab'), spells: csv('SpellName'), crosscheck: JSON.parse(readFileSync(`${dir}/${c.id}-db.json`, 'utf8')) })
      expect(imported.ready).toBe(true)
      expect(imported.talents).toEqual(c.talents)
      expect(c.talentCount).toBe(c.talents.length)
      for (const talent of c.talents) {
        expect(talent.spellIds).toHaveLength(talent.maxRank)
        expect(talent.nodeId).toBe(talent.sourceTalentId)
        expect(talent.fieldEvidence.requiredTreePoints).toBe('derived_assumption')
        expect(talent.rankDescriptions).toHaveLength(talent.maxRank)
      }
    })
    it(`${c.name}: every route replays in its published order and survives a share round trip`, () => {
      for (const build of c.builds) {
        let allocation: PlannerBuild = {}
        for (const id of build.order) {
          const talent = c.talents.find((candidate) => candidate.id === id)!
          for (let point = 0; point < build.build[id]; point++) {
            expect(canIncrementPlannerTalent(allocation, talent, c.talents, c.plannerConfig), `${build.id}/${id}`).toBe(true)
            allocation = incrementPlannerTalent(allocation, talent, c.talents, c.plannerConfig)
          }
        }
        expect(allocation).toEqual(build.build)
        expect(Object.values(allocation).reduce((a, b) => a + b, 0)).toBe(11)
        expect(build.levelCap).toBe(11)
        expect(isLegalAllocation(build.build, c.talents, c.plannerConfig, 11)).toBe(true)
        expect(decodePlannerBuild(encodePlannerBuild(allocation), c.talents)).toEqual(allocation)
        expect(classPlannerHref(c, encodePlannerBuild(allocation), 20)).toContain(`${c.plannerPath}?build=`)
      }
    })
    it(`${c.name}: published pages contain actual builds/catalogue content, sources and working local assets`, () => {
      const slugs = new Set(c.pages.map((page) => `/${page.slug}`))
      expect(existsSync(`public${c.ogImage}`)).toBe(true)
      for (const talent of c.talents) if (talent.icon) expect(existsSync(`public${talent.icon}`), talent.icon).toBe(true)
      for (const page of c.pages) {
        const html = renderClassPage(c, page)
        expect(html).toContain('<h1>')
        expect(html).toContain('planning assumptions')
        expect(html).toContain('https://wago.tools/db2/Talent')
        expect(html).toContain(c.plannerPath)
        for (const link of page.relatedPages) expect(slugs.has(link.href), link.href).toBe(true)
        if (page.primaryBuildId) {
          const build = c.builds.find((b) => b.id === page.primaryBuildId)!
          for (const id of Object.keys(build.build)) expect(html).toContain(c.talents.find((t) => t.id === id)!.name.replaceAll('&', '&amp;'))
        }
      }
    })
  }
  it('fails closed if an import is not ready or a page points to a broken allocation', () => {
    const c = classes[0]
    expect(publishedClassPages([{ ...c, dataReview: { ready: false, notice: 'Conflict' } }])).toEqual([])
    const target = c.pages.find((p) => p.primaryBuildId)!
    const broken = { ...c, builds: c.builds.map((b) => b.id === target.primaryBuildId ? { ...b, build: { 'not-a-talent': 11 } } : b) }
    expect(publishedClassPages([broken]).some((entry) => entry.page.slug === target.slug)).toBe(false)
  })
})
