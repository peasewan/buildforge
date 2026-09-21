import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../data/classes'
import { mageClass } from '../data/classes/mage'
import { publishRequirementsFor, satisfiedRequirements } from './classPage'
import { pageForPath } from './routes'

/**
 * What a withheld Mage path actually returns. `pageForPath` ends on the Paladin planner, so a
 * withheld Mage slug is not "unmatched" — it serves the Paladin calculator, canonical and all.
 * Pinning the whole definition is the point: `/mage` is withheld precisely because a Mage link
 * there would land on the Paladin planner.
 */
const paladinPlannerFallback = {
  kind: 'planner',
  title: 'WoW Forever Paladin Talent Calculator | Beta Build 69913',
  description: 'Use the WoW Forever Paladin Talent Calculator to explore the WoW Forever Paladin talent tree, plan all 51 points, and share Holy, Protection, or Retribution builds.',
  canonical: 'https://buildforgetools.com/paladin',
  robots: 'index, follow',
}

describe('public page routing', () => {
  it.each([
    ['/warrior', 'warrior-planner', 'WoW Forever Warrior Talent Calculator | Beta Build 69913'],
    ['/wow-forever-warrior-builds', 'warrior-hub', 'WoW Forever Warrior Builds & Talent Calculator | BuildForgeTools'],
    ['/wow-forever-warrior-leveling-build', 'warrior-build', 'WoW Forever Warrior Leveling Build | Level 20 Beta'],
    ['/wow-forever-arms-warrior-build', 'warrior-build', 'WoW Forever Arms Warrior Build | Level 20 Beta'],
    ['/wow-forever-fury-warrior-build', 'warrior-build', 'WoW Forever Fury Warrior Build | Level 20 Beta'],
    ['/wow-forever-protection-warrior-build', 'warrior-build', 'WoW Forever Protection Warrior Build | Level 20 Beta'],
  ])('serves %s as an indexable Warrior page', (pathname, kind, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind, title, canonical: `https://buildforgetools.com${pathname}`, robots: 'index, follow' })
  })

  it.each([
    ['/emberville', 'planner', 'Emberville Build Planner | BuildForgeTools'],
    ['/emberville-builds', 'builds', 'Emberville Builds | Build Planner & Ideas'],
    ['/emberville-classes', 'classes', 'Emberville Classes | Confirmed Systems & Planning'],
    ['/emberville-skill-inheritance', 'inheritance', 'Emberville Skill Inheritance Guide | BuildForgeTools'],
  ])('serves %s as an indexable Emberville page', (pathname, embervillePageId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'emberville', embervillePageId, title, canonical: `https://buildforgetools.com${pathname}`, robots: 'index, follow' })
  })
  it('serves the calculator for the canonical tool path and shared builds', () => {
    expect(pageForPath('/paladin')).toMatchObject({
      kind: 'planner',
      title: 'WoW Forever Paladin Talent Calculator | Beta Build 69913',
      description: expect.stringContaining('WoW Forever Paladin talent tree'),
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
      description: 'Explore every WoW Forever Paladin talent path for Holy, Protection, and Retribution, then open the talent calculator to create a 51-point build.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-talents',
      robots: 'index, follow',
    })
  })

  it('serves the Holy healing build as its own indexable page', () => {
    expect(pageForPath('/wow-forever-paladin-build/')).toEqual({
      kind: 'build-guide',
      buildId: 'holy-healing-31-20-0',
      title: 'WoW Forever Paladin Build – Holy Healing 31/20/0 | BuildForgeTools',
      description: 'Open a community WoW Forever Holy Paladin build with a 31/20/0 healing talent allocation, then edit and share it in the BuildForge planner.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-build',
      robots: 'index, follow',
    })
  })

  it.each([
    ['/wow-forever-protection-paladin-build/', 'protection-shield-20-31-0', 'WoW Forever Protection Paladin Build | BuildForgeTools'],
    ['/wow-forever-retribution-paladin-build/', 'retribution-judgment-0-20-31', 'WoW Forever Retribution Paladin Build | BuildForgeTools'],
    ['/wow-forever-retribution-paladin-leveling-build/', 'retribution-leveling-20-0-31', 'WoW Forever Retribution Paladin Leveling Build | BuildForgeTools'],
  ])('serves %s as an indexable example build', (pathname, buildId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'build-guide', buildId, title })
  })

  it.each([
    ['/wow-forever-paladin-leveling-build/', 'leveling', 'WoW Forever Paladin Leveling Build | BuildForgeTools'],
    ['/wow-forever-paladin-pvp-build/', 'pvp', 'WoW Forever Paladin PvP Build | BuildForgeTools'],
    ['/wow-forever-paladin-raid-build/', 'raid', 'WoW Forever Paladin Raid Build | BuildForgeTools'],
    ['/wow-forever-protection-paladin-dungeon-build/', 'protection-dungeon', 'WoW Forever Protection Paladin Dungeon Tank Build | BuildForgeTools'],
    ['/wow-forever-protection-paladin-leveling-build/', 'protection-leveling', 'WoW Forever Protection Paladin Leveling Build | BuildForgeTools'],
    ['/wow-forever-retribution-paladin-pvp-build/', 'retribution-pvp', 'WoW Forever Retribution Paladin PvP Build | BuildForgeTools'],
    ['/wow-forever-holy-paladin-pvp-build/', 'holy-pvp', 'WoW Forever Holy Paladin PvP Build | BuildForgeTools'],
  ])('serves %s through the reusable landing template', (pathname, landingPageId, title) => {
    expect(pageForPath(pathname)).toMatchObject({ kind: 'build-landing', landingPageId, title })
  })

  it('serves the Beta changes page as an indexable tracker', () => {
    expect(pageForPath('/wow-forever-paladin-beta-talent-changes/')).toEqual({
      kind: 'beta-changes',
      title: 'WoW Forever Paladin Beta Talent Changes | BuildForgeTools',
      description: 'Track every WoW Forever Paladin talent change discovered in the Beta, including exact build-to-build diffs and an archived demo comparison.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-beta-talent-changes',
      robots: 'index, follow',
    })
  })

  it('serves the Paladin abilities spellbook as an indexable data page', () => {
    expect(pageForPath('/wow-forever-paladin-abilities/')).toEqual({
      kind: 'spellbook',
      title: 'WoW Forever Paladin Abilities & Spellbook | BuildForgeTools',
      description: 'Browse 45 WoW Forever Paladin abilities, skills, and spells by specialization and trainer level, with Beta client build provenance and change labels.',
      canonical: 'https://buildforgetools.com/wow-forever-paladin-abilities',
      robots: 'index, follow',
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

  it('serves the Retribution hub as its own specialization page', () => {
    expect(pageForPath('/wow-forever-retribution-paladin-builds/')).toMatchObject({
      kind: 'spec-hub',
      spec: 'retribution',
      title: 'WoW Forever Retribution Paladin Builds | Damage Talent Planner',
      canonical: 'https://buildforgetools.com/wow-forever-retribution-paladin-builds',
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
    ['/wow-forever-mage-talents', 'WoW Forever Mage Talents & Talent Trees'],
    ['/wow-forever-mage-leveling-build', 'WoW Forever Mage Leveling Build | Level 20 Beta'],
    ['/wow-forever-frost-mage-build', 'WoW Forever Frost Mage Build | Level 20 Beta'],
    ['/wow-forever-frost-mage-leveling-build', 'WoW Forever Frost Mage Leveling Build'],
    ['/wow-forever-frost-mage-aoe-build', 'WoW Forever Frost Mage AoE Build'],
    ['/wow-forever-arcane-mage-build', 'WoW Forever Arcane Mage Build | Level 20 Beta'],
    ['/wow-forever-arcane-mage-leveling-build', 'WoW Forever Arcane Mage Leveling Build'],
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

  it.each([
    ['/mage', 'mage'],
    ['/wow-forever-mage-builds', 'wow-forever-mage-builds'],
    ['/wow-forever-mage-level-20-build', 'wow-forever-mage-level-20-build'],
    ['/wow-forever-fire-mage-build', 'wow-forever-fire-mage-build'],
    ['/wow-forever-fire-mage-leveling-build', 'wow-forever-fire-mage-leveling-build'],
    ['/wow-forever-mage-pvp-build', 'wow-forever-mage-pvp-build'],
    ['/wow-forever-frost-vs-fire-mage-leveling', 'wow-forever-frost-vs-fire-mage-leveling'],
  ])('withholds %s and falls through to the Paladin planner', (pathname, slug) => {
    // The definition exists in the class package — the path is withheld by the requirement gate,
    // not by the page being absent. `/mage` in particular must never resolve to a Mage calculator,
    // because the CTA that would link it has to point somewhere real.
    expect(mageClass.pages.some((page) => page.slug === slug)).toBe(true)
    expect(pageForPath(pathname)).toEqual(paladinPlannerFallback)
  })

  it('serves every page the publish gate publishes, and nothing the gate withholds', () => {
    const satisfied = satisfiedRequirements(mageClass)
    const isPublished = (page: (typeof mageClass.pages)[number]) =>
      publishRequirementsFor(page).every((requirement) => satisfied.has(requirement))
    const pages = mageClass.pages.map((page) => ({ page, published: isPublished(page) }))

    expect(pages.filter((entry) => entry.published)).toHaveLength(8)
    expect(pages.filter((entry) => !entry.published)).toHaveLength(7)
    for (const { page, published } of pages) {
      const served = pageForPath(`/${page.slug}`)
      if (published) {
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
    for (const pathname of ['/hunter', '/wow-forever-hunter-builds', '/wow-forever-mage-talents-extra']) {
      expect(pageForPath(pathname)).toEqual(paladinPlannerFallback)
    }
    for (const classDef of PUBLISHED_CLASSES) {
      expect(classDef.id).toBe('mage')
    }
  })
})
