import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../data/classes'
import { mageClass } from '../data/classes/mage'
import { publishRequirementsFor, satisfiedRequirements } from './classPage'
import { pageForPath } from './routes'

/**
 * What a withheld Mage path actually returns. `pageForPath` ends on the Paladin planner, so a
 * withheld Mage slug is not "unmatched" — it serves the Paladin calculator, canonical and all.
 * Pinning the whole definition makes an unsupported Mage slug distinguishable from a published
 * Mage page or one of the explicitly consolidated entries.
 */
const paladinPlannerFallback = {
  kind: 'planner',
  title: 'WoW Forever Paladin Talent Calculator | Beta Build 70245',
  description: 'Explore the reviewed 70245 Paladin talent tree with separately sourced community rank text. Plan a 21-point Level 30 build, review removals, and share your route.',
  canonical: 'https://buildforgetools.com/paladin',
  robots: 'index, follow',
}

describe('public page routing', () => {
  it('uses one canonical URL for the Dandy’s World Lab Cards tool and its aliases', () => {
    const path = '/roblox/dandys-world/lab-cards'
    const page = pageForPath(path)
    expect(page).toMatchObject({
      kind: 'dandy-lab-cards',
      title: "Dandy's World Lab Cards & Ambrosia Calculator | BuildForgeTools",
      canonical: `https://buildforgetools.com${path}`,
      robots: 'index, follow',
    })
    expect(pageForPath(`${path}/`)).toEqual(page)
    expect(pageForPath(`${path}/index.html`)).toEqual(page)
  })

  it('marks the obsolete stress-test page noindex without changing calculator metadata', () => {
    expect(pageForPath('/wow-forever-stress-test/')).toMatchObject({ kind: 'retired', canonical: 'https://buildforgetools.com/wow-forever-stress-test', robots: 'noindex, follow' })
    expect(pageForPath('/paladin')).toEqual(paladinPlannerFallback)
  })
  it.each([
    ['/warrior', 'class-calculator', 'WoW Forever Warrior Talent Calculator | Beta Build 70291'],
    ['/wow-forever-warrior-builds', 'class-document', 'WoW Forever Warrior Builds & Talent Calculator | BuildForgeTools'],
    ['/wow-forever-fury-warrior-leveling-build', 'class-document', 'WoW Forever Fury Warrior Leveling Build'],
  ])('serves %s as an indexable Warrior page', (pathname, kind, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind, title, canonical: `https://buildforgetools.com${pathname}`, robots: 'index, follow' })
  })

  it.each([
    ['/emberville', 'planner', 'Emberville Preview Notebook & Confirmed Mechanics | BuildForgeTools'],
    ['/emberville-classes', 'classes', 'Emberville Classes | Confirmed Systems & Planning'],
  ])('serves %s as an indexable Emberville page', (pathname, embervillePageId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'emberville', embervillePageId, title, canonical: `https://buildforgetools.com${pathname}`, robots: 'index, follow' })
  })
  it('serves the calculator for the canonical tool path and shared builds', () => {
    expect(pageForPath('/paladin')).toMatchObject({
      kind: 'planner',
      title: 'WoW Forever Paladin Talent Calculator | Beta Build 70245',
      description: expect.stringContaining('70245 Paladin talent tree'),
      canonical: 'https://buildforgetools.com/paladin',
    })
    expect(pageForPath('/build')).toMatchObject({
      kind: 'planner',
      canonical: 'https://buildforgetools.com/paladin',
      robots: 'noindex, follow',
    })
    expect(pageForPath('/paladin').robots).toBe('index, follow')
  })

  it('serves the guide with its own canonical metadata', () => {
    expect(pageForPath('/wow-forever-paladin-talents/')).toEqual({
      kind: 'guide',
      title: 'WoW Forever Paladin Talent Guide & Build Planner | BuildForgeTools',
      description: 'Explore 50 Paladin talents in the reviewed 70245 tree and two historical removals. Plan a Level 30 route or inspect archived 51-point references.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
      robots: 'index, follow',
    })
  })

  it('serves the Holy healing build as its own indexable page', () => {
    expect(pageForPath('/wow-forever-paladin-build/')).toEqual({
      kind: 'build-guide',
      buildId: 'holy-healing-31-20-0',
      title: 'WoW Forever Paladin Build – Holy Healing 31/20/0 | BuildForgeTools',
      description: 'Inspect a historical 31/20/0 Holy Paladin healing reference, then start a new build for the dated October Level 30 Beta cap.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
      robots: 'index, follow',
    })
  })

  it.each([
    ['/wow-forever-protection-paladin-build/', 'protection-shield-20-31-0', 'WoW Forever Protection Paladin Build | BuildForgeTools'],
    ['/wow-forever-retribution-paladin-build/', 'retribution-judgment-0-20-31', 'WoW Forever Retribution Paladin Build | BuildForgeTools'],
  ])('serves %s as an indexable example build', (pathname, buildId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'build-guide', buildId, title })
  })

  it('resolves the duplicate Ret leveling entry to the retained class leveling tool', () => {
    expect(pageForPath('/wow-forever-retribution-paladin-leveling-build/')).toEqual(pageForPath('/wow-forever-paladin-leveling-build'))
  })

  it.each([
    ['/wow-forever-paladin-leveling-build/', 'leveling', 'WoW Forever Paladin Leveling Build | BuildForgeTools'],
    ['/wow-forever-paladin-pvp-build/', 'pvp', 'WoW Forever Paladin PvP Build | BuildForgeTools'],
    ['/wow-forever-paladin-raid-build/', 'raid', 'WoW Forever Paladin Raid Build | BuildForgeTools'],
    ['/wow-forever-protection-paladin-pvp-build/', 'protection-pvp', 'WoW Forever Protection Paladin PvP Build | BuildForgeTools'],
    ['/wow-forever-protection-paladin-leveling-build/', 'protection-leveling', 'WoW Forever Protection Paladin Leveling Build | BuildForgeTools'],
    ['/wow-forever-retribution-paladin-pvp-build/', 'retribution-pvp', 'WoW Forever Retribution Paladin PvP Build | BuildForgeTools'],
    ['/wow-forever-holy-paladin-pvp-build/', 'holy-pvp', 'WoW Forever Holy Paladin PvP Build | BuildForgeTools'],
  ])('serves %s through the reusable landing template', (pathname, landingPageId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'build-landing', landingPageId, title })
  })

  it('describes the current-cap Protection routes without claiming official recommendations', () => {
    const page = pageForPath('/wow-forever-protection-paladin-leveling-build/')
    expect(page?.description).toMatch(/11-point Level 20 and 21-point Level 30 Beta routes/i)
    expect(page?.description).not.toMatch(/official|best build/i)
  })

  it('serves the Beta changes page as an indexable tracker', () => {
    expect(pageForPath('/wow-forever-paladin-beta-talent-changes/')).toEqual({
      kind: 'beta-changes',
      title: 'WoW Forever Paladin Beta Talent Changes | BuildForgeTools',
      description: 'Review the 69913 to 70245 Paladin diff, two removals and 32 changed rank strings. Separate client structure, community rank text and official tuning.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-beta-talent-changes',
      robots: 'index, follow',
    })
  })

  it('marks the incomplete public Paladin spellbook as retired rather than indexing its fixture', () => {
    expect(pageForPath('/wow-forever-paladin-abilities/')).toMatchObject({
      kind: 'retired',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-abilities',
      robots: 'noindex, follow',
    })
  })

  it('serves the Paladin builds topic hub with independent metadata', () => {
    expect(pageForPath('/wow-forever-paladin-builds/')).toEqual({
      kind: 'build-hub',
      title: 'WoW Forever Paladin Builds & Talent Calculator | BuildForgeTools',
      description: 'Explore WoW Forever Paladin builds for Holy, Protection, and Retribution. Plan talents, customize builds, and share your setup with BuildForgeTools.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-builds',
      robots: 'index, follow',
    })
  })

  it('serves the Protection hub with independent metadata', () => {
    expect(pageForPath('/wow-forever-protection-paladin-builds/')).toMatchObject({
      kind: 'spec-hub',
      spec: 'protection',
      title: 'WoW Forever Protection Paladin Builds | Tank Talent Planner',
      canonical: 'https://buildforgetools.com/wow-forever-protection-paladin-builds',
      robots: 'index, follow',
    })
  })

  it('resolves the consolidated Retribution hub to the retained build page metadata', () => {
    expect(pageForPath('/wow-forever-retribution-paladin-builds/')).toMatchObject({
      kind: 'build-guide',
      buildId: 'retribution-judgment-0-20-31',
      title: 'WoW Forever Retribution Paladin Build | BuildForgeTools',
      canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-build',
      robots: 'index, follow',
    })
  })

  it.each([
    ['/wow-forever-holy-paladin-talents/', 'holy', 'WoW Forever Holy Paladin Talents | Talent Tree'],
    ['/wow-forever-protection-paladin-talents/', 'protection', 'WoW Forever Protection Paladin Talents | Talent Tree'],
    ['/wow-forever-retribution-paladin-talents/', 'retribution', 'WoW Forever Retribution Paladin Talents | Talent Tree'],
  ])('serves %s as its specialization talent guide', (pathname, spec, title) => {
    expect(pageForPath(pathname)).toMatchObject({
      kind: 'spec-talents',
      spec,
      title,
      canonical: `https://buildforgetools.com${pathname.replace(/\/$/, '')}`,
      robots: 'index, follow',
    })
  })

  it.each([
    ['/about/', 'about', 'About BuildForgeTools | Game Build Planners & Data'],
    ['/contact/', 'contact', 'Contact BuildForgeTools | Feedback & Corrections'],
    ['/privacy/', 'privacy', 'Privacy Policy | BuildForgeTools'],
  ])('serves %s as an indexable trust page', (pathname, trustPageId, title) => {
    expect(pageForPath(pathname)).toMatchObject({
      kind: 'trust',
      trustPageId,
      title,
      canonical: `https://buildforgetools.com${pathname.replace(/\/$/, '')}`,
      robots: 'index, follow',
    })
  })
})

describe('published class pages', () => {
  it.each([
    ['/wow-forever-mage-builds', 'WoW Forever Mage Builds | Talent Calculator'],
    ['/wow-forever-mage-talents', 'WoW Forever Mage Talents & Talent Trees'],
    ['/wow-forever-frost-mage-build', 'WoW Forever Frost Mage Build | Level 20 Beta'],
    ['/wow-forever-frost-mage-aoe-build', 'WoW Forever Frost Mage AoE Build'],
    ['/wow-forever-mage-dungeon-build', 'WoW Forever Mage Dungeon Build'],
  ])('serves %s as the Mage class page the gate publishes', (pathname, title) => {
    const expected = {
      kind: 'class-document',
      classId: 'mage',
      classPageSlug: pathname.slice(1),
      title,
      canonical: `https://buildforgetools.com${pathname}`,
      robots: 'index, follow',
    }

    expect(pageForPath(pathname)).toMatchObject(expected)
    // The shells are served with a trailing slash by the host, so the metadata must not depend on it.
    expect(pageForPath(`${pathname}/`)).toEqual(pageForPath(pathname))
  })

  it('serves /mage as the published Mage calculator', () => {
    expect(pageForPath('/mage')).toMatchObject({
      kind: 'class-calculator',
      classId: 'mage',
      classPageSlug: 'mage',
      title: 'WoW Forever Mage Talent Calculator – Arcane, Fire & Frost',
      canonical: 'https://buildforgetools.com/mage',
      robots: 'index, follow',
    })
  })

  it.each([
    ['/wow-forever-fire-mage-build', 'wow-forever-fire-mage-build'],
    ['/wow-forever-fire-mage-leveling-build', 'wow-forever-fire-mage-leveling-build'],
    ['/wow-forever-mage-pvp-build', 'wow-forever-mage-pvp-build'],
    ['/wow-forever-frost-vs-fire-mage-leveling', 'wow-forever-frost-vs-fire-mage-leveling'],
  ])('withholds %s and falls through to the Paladin planner', (pathname, slug) => {
    // The definition exists in the class package — the path is withheld by the requirement gate,
    // not by the page being absent. A published CTA must not send players to this fallback.
    expect(mageClass.pages.some((page) => page.slug === slug)).toBe(true)
    expect(pageForPath(pathname)).toEqual(paladinPlannerFallback)
  })

  it('serves every page the publish gate publishes, and nothing the gate withholds', () => {
    const satisfied = satisfiedRequirements(mageClass)
    const isPublished = (page: (typeof mageClass.pages)[number]) =>
      !page.retiredTo && publishRequirementsFor(page).every((requirement) => satisfied.has(requirement))
    const pages = mageClass.pages.map((page) => ({ page, published: isPublished(page) }))

    expect(pages.filter((entry) => entry.published)).toHaveLength(6)
    expect(pages.filter((entry) => entry.page.retiredTo)).toHaveLength(5)
    expect(pages.filter((entry) => !entry.published && !entry.page.retiredTo)).toHaveLength(4)
    for (const { page, published } of pages) {
      const served = pageForPath(`/${page.slug}`)
      if (page.retiredTo) {
        expect(served, page.slug).toMatchObject({ classId: 'mage', canonical: `https://buildforgetools.com${page.retiredTo}`, robots: 'index, follow' })
        expect(served, page.slug).toEqual(pageForPath(page.retiredTo))
      } else if (published) {
        expect(served, page.slug).toMatchObject({
          kind: page.kind === 'calculator' ? 'class-calculator' : 'class-document',
          classId: 'mage',
          classPageSlug: page.slug,
          title: page.title,
          canonical: page.canonical,
        })
      } else {
        expect(served, page.slug).toEqual(paladinPlannerFallback)
      }
    }
  })

  it('never returns a class page for a path no published class declares', () => {
    for (const pathname of ['/death-knight', '/wow-forever-death-knight-builds', '/wow-forever-mage-talents-extra']) {
      expect(pageForPath(pathname)).toEqual(paladinPlannerFallback)
    }
    expect(PUBLISHED_CLASSES.map((classDef) => classDef.id).sort()).toEqual(['druid', 'hunter', 'mage', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'])
  })
})

describe('shared class builds', () => {
  for (const classDef of PUBLISHED_CLASSES) {
    it(`${classDef.id}: marks allocated URLs noindex while retaining an indexable clean calculator`, () => {
      expect(pageForPath(classDef.plannerPath).robots).toBe('index, follow')
      const shared = pageForPath(classDef.plannerPath, '?build=example&level=20')
      expect(shared.robots).toBe('noindex, follow')
      expect(shared.canonical).toBe(`https://buildforgetools.com${classDef.plannerPath}`)
      expect(pageForPath(classDef.plannerPath, '?utm_source=test').robots).toBe('index, follow')
    })
  }
})
