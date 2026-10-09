import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pageFromPublishedClasses, publishedClassPages, satisfiedRequirements, type ClassPageKind } from '../../lib/classPage'
import { classPageRedirects } from '../../lib/classStaticPages'
import { recoverHistoricalClassBuild } from '../../lib/classBuildRecovery'
import { decodeValidatedPlannerBuild, encodePlannerBuild } from '../../lib/talentPlanner'
import { progressionForBuild } from '../../experiences/buildExperience'
import { renderClassPage } from '../../lib/prerender'
import { pageForPath } from '../../lib/routes'
import { warriorClass } from './warrior'
import { PUBLISHED_CLASSES } from './index'

const EXPECTED_PAGES: { slug: string; kind: ClassPageKind; title: string; h1: string }[] = [
  { slug: 'warrior', kind: 'calculator', title: 'WoW Forever Warrior Talent Calculator | Beta Build 70291', h1: 'WoW Forever Warrior Talent Calculator' },
  { slug: 'wow-forever-warrior-builds', kind: 'buildsHub', title: 'WoW Forever Warrior Builds & Talent Calculator | BuildForgeTools', h1: 'WoW Forever Warrior Builds' },
  { slug: 'wow-forever-warrior-leveling-build', kind: 'leveling', title: 'WoW Forever Warrior Leveling Build | Level 30 Beta', h1: 'WoW Forever Warrior Leveling Build' },
  { slug: 'wow-forever-arms-warrior-build', kind: 'specBuild', title: 'WoW Forever Arms Warrior Build | Level 30 Beta', h1: 'WoW Forever Arms Warrior Build' },
  { slug: 'wow-forever-fury-warrior-build', kind: 'specBuild', title: 'WoW Forever Fury Warrior Build | Level 30 Beta', h1: 'WoW Forever Fury Warrior Build' },
  { slug: 'wow-forever-protection-warrior-build', kind: 'specBuild', title: 'WoW Forever Protection Warrior Build | Level 30 Beta', h1: 'WoW Forever Protection Warrior Build' },
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
const RETIRED_DUNGEON = 'wow-forever-warrior-dungeon-build'
const withheldSlugs = new Set([WITHHELD_PVP, RETIRED_DUNGEON])

describe('Warrior ClassDefinition', () => {
  it('keeps the exact 69913 tree accessible for historical saved builds', () => {
    const snapshot = warriorClass.historicalSnapshots?.find((item) => item.dataVersion === 'wow_forever_beta_1.60.1.69913')
    expect(snapshot?.clientBuild).toBe('1.60.1.69913')
    expect(snapshot?.storageKey).toBe('wow-forever-warrior-build')
    expect(warriorClass.storageKey).toBe('buildforge-warrior-70291-v1')
    expect(snapshot?.talents).toHaveLength(53)
    expect(snapshot?.talents.find((talent) => talent.id === 'warrior-fury-boundless-rage')).toBeDefined()
    expect(warriorClass.talents.find((talent) => talent.id === 'warrior-fury-boundless-rage')).toBeUndefined()
    const oldAllocation = { 'warrior-fury-cruelty': 5, 'warrior-fury-unbridled-wrath': 5, 'warrior-fury-boundless-rage': 1 }
    const code = encodePlannerBuild(oldAllocation)
    expect(decodeValidatedPlannerBuild(code, warriorClass.talents, { ...warriorClass.plannerConfig, pointCap: 11 })).toBeNull()
    const recovered = recoverHistoricalClassBuild(warriorClass, code, 20)
    expect(recovered?.build).toEqual(oldAllocation)
    expect(recovered?.code).toBe(code)
    expect(recovered?.talents.find((talent) => talent.id === 'warrior-fury-boundless-rage')?.name).toBe('Boundless Rage')
  })

  it('defines 20 Warrior records but publishes only the 18 with a distinct supported task', () => {
    expect(warriorClass.pages).toHaveLength(20)
    expect(warriorClass.pages.map((page) => page.slug).sort()).toEqual(EXPECTED_PAGES.map((page) => page.slug).sort())
    expect(publishedClassPages([warriorClass]).map(({ page }) => page.slug).sort()).toEqual(EXPECTED_PAGES.filter((page) => !withheldSlugs.has(page.slug)).map((page) => page.slug).sort())
    for (const expected of EXPECTED_PAGES) {
      const page = warriorClass.pages.find((candidate) => candidate.slug === expected.slug)
      expect(page, expected.slug).toMatchObject(expected)
      expect(page?.canonical).toBe(`https://buildforgetools.com/${expected.slug}`)
      expect(pageFromPublishedClasses(expected.slug, [warriorClass])).toBe(withheldSlugs.has(expected.slug) ? undefined : page)
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

  it('publishes executable Level 30 routes and preserves the distinct Level 20 snapshot page', () => {
    expect(warriorClass.beta).toMatchObject({ levelCap: 30, pointsAtCap: 21 })
    expect(warriorClass.verifiedBuild).toBe('1.60.1.70291')
    const current = warriorClass.builds.filter((build) => build.level === 30)
    const snapshots = warriorClass.builds.filter((build) => build.level === 20)
    expect(current).toHaveLength(9)
    expect(snapshots).toHaveLength(3)
    for (const build of current) {
      expect(build).toMatchObject({ level: 30, levelCap: 21, points: 21, verifiedThroughBuild: '1.60.1.70291' })
      expect(progressionForBuild(warriorClass, build).steps).toHaveLength(21)
      expect(progressionForBuild(warriorClass, build).error).toBeUndefined()
    }
    for (const build of snapshots) {
      expect(build).toMatchObject({ level: 20, levelCap: 11, points: 11 })
      expect(progressionForBuild(warriorClass, build).steps).toHaveLength(11)
    }
    const snapshotPage = pageFromPublishedClasses('/wow-forever-warrior-level-20-build', [warriorClass])!
    expect(snapshotPage.relatedBuildIds).toHaveLength(3)
    expect(snapshotPage.relatedBuildIds.every((id) => snapshots.some((build) => build.id === id))).toBe(true)
    expect(publishedClassPages([warriorClass])).toHaveLength(18)
  })

  it('compares real current Arms and Fury routes using their selected talent differences', () => {
    const page = warriorClass.pages.find((candidate) => candidate.slug === 'wow-forever-arms-vs-fury-warrior-leveling')!
    const text = [page.description, ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs]), ...page.faqs.map((faq) => faq.answer), ...page.comparison!.rows.flatMap((row) => [row.label, ...row.values])].join(' ')
    expect(page.updatedAt).toBe('2026-10-09')
    expect(page.comparison!.rows.length).toBeGreaterThanOrEqual(6)
    expect(text).toMatch(/Choose Arms/i)
    expect(text).toMatch(/Choose Fury/i)
    expect(text).toMatch(/Furious Precision/)
    expect(text).toMatch(/21.point|21\/0\/0/)
    expect(text).not.toMatch(/no.*reviewed.*Level 30.*allocation|not imported into the 69913|awaits review/i)
    expect(renderClassPage(warriorClass, page)).toContain('Furious Precision')
  })

  it('publishes the Warrior PvP hub with its legal PvP primary route', () => {
    const page = warriorClass.pages.find((candidate) => candidate.slug === 'wow-forever-warrior-pvp-build')!
    const primary = warriorClass.builds.find((build) => build.id === page.primaryBuildId)

    expect(primary).toMatchObject({ id: 'warrior-arms-pvp', intent: 'pvp', spec: 'arms' })
    expect(pageFromPublishedClasses('/wow-forever-warrior-pvp-build', [warriorClass])).toBe(page)
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

  it('consolidates Warrior dungeon choices into the Protection page and redirects the retired hub', () => {
    const retired = warriorClass.pages.find((page) => page.slug === RETIRED_DUNGEON)!
    const destination = warriorClass.pages.find((page) => page.slug === 'wow-forever-protection-warrior-dungeon-build')!
    const destinationText = destination.sections.flatMap((section) => [section.heading, ...section.paragraphs]).join(' ')
    expect(retired.primaryBuildId).toBeUndefined()
    expect(pageFromPublishedClasses(`/${RETIRED_DUNGEON}`, [warriorClass])).toBeUndefined()
    expect(destination.primaryBuildId).toBe('warrior-protection-dungeon')
    expect(destinationText).toMatch(/Protection.*tank/i)
    expect(destinationText).toMatch(/Arms.*Fury.*damage/i)
    expect(destination.relatedPages).toEqual(expect.arrayContaining([
      { href: '/wow-forever-arms-warrior-build', label: expect.stringContaining('Arms') },
      { href: '/wow-forever-fury-warrior-build', label: expect.stringContaining('Fury') },
    ]))
    expect(existsSync(join(process.cwd(), RETIRED_DUNGEON))).toBe(false)
    expect(classPageRedirects([warriorClass])).toEqual([
      { source: '/wow-forever-warrior-dungeon-build', destination: '/wow-forever-protection-warrior-dungeon-build', permanent: true },
      { source: '/wow-forever-warrior-dungeon-build/index.html', destination: '/wow-forever-protection-warrior-dungeon-build', permanent: true },
    ])
    const config = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as { redirects: { source: string; destination: string; statusCode?: number; permanent?: boolean }[] }
    const redirect = config.redirects.find(({ source }) => source === `/${RETIRED_DUNGEON}`)
    expect(redirect?.destination).toBe('/wow-forever-protection-warrior-dungeon-build')
    expect(redirect?.statusCode === 301 || redirect?.permanent === true).toBe(true)
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
        if (!withheldSlugs.has(page.slug)) expect(publishedSlugs.has(related.href.slice(1)), `${page.slug} -> withheld ${related.href}`).toBe(true)
      }
    }
  })

  it('registers Warrior next to Mage in the generic class registry', () => {
    expect(PUBLISHED_CLASSES.map((classDef) => classDef.id)).toEqual(expect.arrayContaining(['mage', 'warrior']))
  })

  it('routes every Warrior URL through the generic class renderer', () => {
    for (const expected of EXPECTED_PAGES.filter((page) => !withheldSlugs.has(page.slug))) {
      const route = pageForPath(`/${expected.slug}`)
      expect(route.kind, expected.slug).toBe(expected.kind === 'calculator' ? 'class-calculator' : 'class-document')
      expect(route.title).toBe(expected.title)
    }
  })

  it('renders spec talent catalogues with only the requested Warrior branch', () => {
    const armsPage = warriorClass.pages.find((page) => page.slug === 'wow-forever-arms-warrior-talents')!
    const html = renderClassPage(warriorClass, armsPage)
    const document = new DOMParser().parseFromString(html, 'text/html')
    const armsCatalogue = document.querySelector('[data-class-catalogue="arms"]')
    const armsTalent = warriorClass.talents.find((talent) => talent.branch === 'arms')!
    const furyTalent = warriorClass.talents.find((talent) => talent.branch === 'fury')!
    const protectionTalent = warriorClass.talents.find((talent) => talent.branch === 'protection')!

    expect(armsCatalogue).not.toBeNull()
    expect(document.querySelectorAll('[data-class-catalogue]')).toHaveLength(1)
    expect(armsCatalogue?.textContent).toContain(armsTalent.name)
    expect(armsCatalogue?.textContent).not.toContain(furyTalent.name)
    expect(armsCatalogue?.textContent).not.toContain(protectionTalent.name)
    expect(html).toContain('Warrior official changes')
  })
})
