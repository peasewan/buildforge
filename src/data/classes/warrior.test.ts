import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pageFromPublishedClasses, publishedClassPages, satisfiedRequirements, type ClassPageKind } from '../../lib/classPage'
import { renderClassPage } from '../../lib/prerender'
import { pageForPath } from '../../lib/routes'
import { warriorClass } from './warrior'
import { PUBLISHED_CLASSES } from './index'

const EXPECTED_PAGES: { slug: string; kind: ClassPageKind; title: string; h1: string }[] = [
  { slug: 'warrior', kind: 'calculator', title: 'WoW Forever Warrior Talent Calculator | Beta Build 69913', h1: 'WoW Forever Warrior Talent Calculator' },
  { slug: 'wow-forever-warrior-builds', kind: 'buildsHub', title: 'WoW Forever Warrior Builds & Talent Calculator | BuildForgeTools', h1: 'WoW Forever Warrior Builds' },
  { slug: 'wow-forever-warrior-leveling-build', kind: 'leveling', title: 'WoW Forever Warrior Leveling Build | Level 20 Beta', h1: 'WoW Forever Warrior Leveling Build' },
  { slug: 'wow-forever-arms-warrior-build', kind: 'specBuild', title: 'WoW Forever Arms Warrior Build | Level 20 Beta', h1: 'WoW Forever Arms Warrior Build' },
  { slug: 'wow-forever-fury-warrior-build', kind: 'specBuild', title: 'WoW Forever Fury Warrior Build | Level 20 Beta', h1: 'WoW Forever Fury Warrior Build' },
  { slug: 'wow-forever-protection-warrior-build', kind: 'specBuild', title: 'WoW Forever Protection Warrior Build | Level 20 Beta', h1: 'WoW Forever Protection Warrior Build' },
  { slug: 'wow-forever-warrior-talents', kind: 'talents', title: 'WoW Forever Warrior Talents & Talent Trees', h1: 'WoW Forever Warrior Talents & Talent Trees' },
  { slug: 'wow-forever-arms-warrior-leveling-build', kind: 'specLeveling', title: 'WoW Forever Arms Warrior Leveling Build', h1: 'WoW Forever Arms Warrior Leveling Build' },
  { slug: 'wow-forever-fury-warrior-leveling-build', kind: 'specLeveling', title: 'WoW Forever Fury Warrior Leveling Build', h1: 'WoW Forever Fury Warrior Leveling Build' },
  { slug: 'wow-forever-protection-warrior-leveling-build', kind: 'specLeveling', title: 'WoW Forever Protection Warrior Leveling Build', h1: 'WoW Forever Protection Warrior Leveling Build' },
  { slug: 'wow-forever-warrior-pvp-build', kind: 'pvp', title: 'WoW Forever Warrior PvP Builds', h1: 'WoW Forever Warrior PvP Builds' },
  { slug: 'wow-forever-arms-warrior-pvp-build', kind: 'specPvp', title: 'WoW Forever Arms Warrior PvP Build', h1: 'WoW Forever Arms Warrior PvP Build' },
  { slug: 'wow-forever-fury-warrior-pvp-build', kind: 'specPvp', title: 'WoW Forever Fury Warrior PvP Build', h1: 'WoW Forever Fury Warrior PvP Build' },
  { slug: 'wow-forever-protection-warrior-pvp-build', kind: 'specPvp', title: 'WoW Forever Protection Warrior PvP Build', h1: 'WoW Forever Protection Warrior PvP Build' },
  { slug: 'wow-forever-warrior-dungeon-build', kind: 'dungeon', title: 'WoW Forever Warrior Dungeon Builds', h1: 'WoW Forever Warrior Dungeon Builds' },
  { slug: 'wow-forever-protection-warrior-dungeon-build', kind: 'specDungeon', title: 'WoW Forever Protection Warrior Dungeon Build', h1: 'WoW Forever Protection Warrior Dungeon Build' },
  { slug: 'wow-forever-warrior-level-20-build', kind: 'levelCap', title: 'WoW Forever Warrior Level 20 Builds', h1: 'WoW Forever Warrior Level 20 Builds' },
  { slug: 'wow-forever-arms-vs-fury-warrior-leveling', kind: 'comparison', title: 'Arms vs Fury Warrior for Leveling in WoW Forever', h1: 'Arms vs Fury Warrior for Leveling in WoW Forever' },
  { slug: 'wow-forever-arms-warrior-talents', kind: 'specTalents', title: 'WoW Forever Arms Warrior Talents', h1: 'WoW Forever Arms Warrior Talents' },
  { slug: 'wow-forever-protection-warrior-talents', kind: 'specTalents', title: 'WoW Forever Protection Warrior Talents', h1: 'WoW Forever Protection Warrior Talents' },
]
const WITHHELD_PVP = 'wow-forever-protection-warrior-pvp-build'

describe('Warrior ClassDefinition', () => {
  it('defines 20 Warrior routes but publishes only the 19 with a primary value', () => {
    expect(warriorClass.pages).toHaveLength(20)
    expect(warriorClass.pages.map((page) => page.slug).sort()).toEqual(EXPECTED_PAGES.map((page) => page.slug).sort())
    expect(publishedClassPages([warriorClass]).map(({ page }) => page.slug).sort()).toEqual(EXPECTED_PAGES.filter((page) => page.slug !== WITHHELD_PVP).map((page) => page.slug).sort())
    for (const expected of EXPECTED_PAGES) {
      const page = warriorClass.pages.find((candidate) => candidate.slug === expected.slug)
      expect(page, expected.slug).toMatchObject(expected)
      expect(page?.canonical).toBe(`https://buildforgetools.com/${expected.slug}`)
      expect(pageFromPublishedClasses(expected.slug, [warriorClass])).toBe(expected.slug === WITHHELD_PVP ? undefined : page)
    }
  })

  it('gives every Warrior route local hero artwork and each branch a local icon', () => {
    const classWithIcons = warriorClass as typeof warriorClass & { branchIcons: Record<string, string> }
    const artwork = new Set(warriorClass.pages.map((page) => page.ogImage ?? warriorClass.ogImage))

    expect(artwork.size).toBe(4)
    expect([...artwork].every(Boolean)).toBe(true)
    expect(Object.keys(classWithIcons.branchIcons).sort()).toEqual(['arms', 'fury', 'protection'])
    for (const asset of [...artwork, ...Object.values(classWithIcons.branchIcons)]) {
      expect(existsSync(join(process.cwd(), 'public', asset!.replace(/^\//, ''))), asset).toBe(true)
    }
  })

  it('satisfies the planner and all three legal-build gates from actual Warrior data', () => {
    expect([...satisfiedRequirements(warriorClass)].sort()).toEqual([
      'completeClassPlanner',
      'legalBuild:arms',
      'legalBuild:fury',
      'legalBuild:protection',
      'level20Builds',
      'talentDataset',
    ])
  })

  it('withholds unfinished Protection PvP and redirects its old URL to the supported PvP hub', () => {
    const page = warriorClass.pages.find((candidate) => candidate.slug === WITHHELD_PVP)
    expect(page?.publishRequirements).toEqual(['talentDataset'])
    expect(page?.primaryBuildId).toBeUndefined()
    expect(warriorClass.builds.some((build) => build.intent === 'pvp' && build.spec === 'protection')).toBe(false)
    expect(page?.sections.flatMap((section) => section.paragraphs).join(' ')).toMatch(/pending verification/i)
    expect(pageFromPublishedClasses(`/${WITHHELD_PVP}`, [warriorClass])).toBeUndefined()
    expect(existsSync(join(process.cwd(), WITHHELD_PVP))).toBe(false)
    const config = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as { redirects: { source: string; destination: string; permanent: boolean }[] }
    expect(config.redirects).toContainEqual({ source: `/${WITHHELD_PVP}`, destination: '/wow-forever-warrior-pvp-build', permanent: true })
  })

  it('keeps every page record unique and every internal page link inside the published Warrior cluster', () => {
    const slugs = new Set(warriorClass.pages.map((page) => page.slug))
    for (const key of ['intent', 'title', 'h1', 'canonical'] as const) {
      expect(new Set(warriorClass.pages.map((page) => page[key])).size, key).toBe(20)
    }
    const publishedSlugs = new Set(publishedClassPages([warriorClass]).map(({ page }) => page.slug))
    for (const page of warriorClass.pages) {
      expect(page.description.length, page.slug).toBeGreaterThan(0)
      expect(page.sections.length, page.slug).toBeGreaterThan(0)
      for (const related of page.relatedPages) {
        expect(slugs.has(related.href.slice(1)), `${page.slug} -> ${related.href}`).toBe(true)
        if (page.slug !== WITHHELD_PVP) expect(publishedSlugs.has(related.href.slice(1)), `${page.slug} -> withheld ${related.href}`).toBe(true)
      }
    }
  })

  it('registers Warrior next to Mage in the generic class registry', () => {
    expect(PUBLISHED_CLASSES.map((classDef) => classDef.id)).toEqual(expect.arrayContaining(['mage', 'warrior']))
  })

  it('routes every Warrior URL through the generic class renderer', () => {
    for (const expected of EXPECTED_PAGES.filter((page) => page.slug !== WITHHELD_PVP)) {
      const route = pageForPath(`/${expected.slug}`)
      expect(route.kind, expected.slug).toBe(expected.kind === 'calculator' ? 'class-calculator' : 'class-document')
      expect(route.title).toBe(expected.title)
    }
  })

  it('renders spec talent catalogues with only the requested Warrior branch', () => {
    const armsPage = warriorClass.pages.find((page) => page.slug === 'wow-forever-arms-warrior-talents')!
    const html = renderClassPage(warriorClass, armsPage)
    const armsTalent = warriorClass.talents.find((talent) => talent.branch === 'arms')!
    const furyTalent = warriorClass.talents.find((talent) => talent.branch === 'fury')!
    const protectionTalent = warriorClass.talents.find((talent) => talent.branch === 'protection')!

    expect(html).toContain(armsTalent.name)
    expect(html).not.toContain(furyTalent.name)
    expect(html).not.toContain(protectionTalent.name)
  })
})
