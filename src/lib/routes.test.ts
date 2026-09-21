import { describe, expect, it } from 'vitest'
import { pageForPath } from './routes'

describe('public page routing', () => {
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
