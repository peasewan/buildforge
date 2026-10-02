import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HUB_BUILD_HREFS } from '../data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS, specHubHrefs } from '../data/specBuildsHubs'
import { BUILD_LANDING_PAGES } from '../data/buildLandingPages'
import { TRUST_PAGES } from '../data/trustPages'
import { renderBetaAvailabilityPrerender, renderBetaLevelingSnapshotPrerender, renderBetaSpecPathPrerender, renderClassPage, renderEmbervillePrerender, renderHubPrerender, renderLandingPrerender, renderSpecHubPrerender, renderSpellbookPrerender, renderTrustPrerender } from './prerender'
import { EMBERVILLE_EDITORIAL, EMBERVILLE_PAGES } from '../data/emberville'
import { paladinSpellbook } from '../data/paladinSpellbook'
import { mageClass } from '../data/classes/mage'
import { warriorClass } from '../data/classes/warrior'
import { hunterClass } from '../data/classes/hunter'
import { PUBLISHED_CLASSES } from '../data/classes'
import { officialTalentNotice } from '../data/officialOctoberChanges'
import { hunterClassFixture } from '../data/fixtures/hunterClass.fixture'
import { publishRequirementsFor, publishedClassPages, satisfiedRequirements, type ClassPageDefinition } from './classPage'
import { MAGE_BRANCHES } from '../data/mageTalents'
import { escapeHtml } from './html'
import { betaLevelingPlannerHref } from '../data/levelingBeta'

const publishedMagePages = (() => {
  const satisfied = satisfiedRequirements(mageClass)
  return mageClass.pages.filter((page) => publishRequirementsFor(page).every((requirement) => satisfied.has(requirement)))
})()

const withheldMageSlugs = mageClass.pages.filter((page) => !publishedMagePages.includes(page)).map((page) => `/${page.slug}`)

const classPageHtml = (page: ClassPageDefinition) => renderClassPage(mageClass, page)

const classPrerendered = () => [
  ...publishedMagePages.map((page) => [page.slug, classPageHtml(page)] as const),
]

/** Every `a/b/c` allocation this HTML prints, as branch points in `MAGE_BRANCHES` order. */
const allocationTriples = (html: string) => (html.replace(/<[^>]*>/g, ' ').match(/\b\d+\/\d+\/\d+\b/g) ?? []).map((triple) => triple.split('/').map(Number))

const redirections = (() => {
  const config = JSON.parse(readFileSync(`${process.cwd()}/vercel.json`, 'utf8')) as {
    redirects?: { source: string }[]
  }
  return (config.redirects ?? []).map((redirect) => redirect.source)
})()

const allPrerendered = () => [
  ['paladin-builds hub', renderHubPrerender()],
  ...SPEC_BUILDS_HUBS.map((hub) => [`${hub.spec} builds hub`, renderSpecHubPrerender(hub.spec)] as const),
  ...BUILD_LANDING_PAGES.map((page) => [page.slug, renderLandingPrerender(page.id)] as const),
  ...TRUST_PAGES.map((page) => [page.slug, renderTrustPrerender(page.id)] as const),
] as const

describe('prerender generation', () => {
  it('marks every published class static page as an older Level 20 snapshot beneath the live Level 30 cap', () => {
    const pages = publishedClassPages(PUBLISHED_CLASSES)
    expect(pages.length).toBeGreaterThan(100)
    for (const { classDef, page } of pages) {
      const html = renderClassPage(classDef, page)
      expect(html, page.slug).toContain('live Beta cap is Level 30')
      expect(html, page.slug).toContain('older 1.60.1.69913 talent tree')
      expect(html, page.slug).toContain('Level 20 routes are 11-point starting snapshots')
      expect(html, page.slug).toContain('2360696/1')
      expect(html, page.slug).toContain(`${classDef.name} official changes`)
    }
  })

  it('includes the October 2 Warrior follow-up in the crawlable Warrior page', () => {
    const page = warriorClass.pages.find((entry) => entry.kind === 'calculator')!
    const html = renderClassPage(warriorClass, page)
    expect(html).toContain('October 2 Warrior follow-up')
    expect(html).toContain('warrior-updates-in-todays-beta-build/2369360')
    expect(html).toContain('100% extra Rage')
  })

  it.each([
    ['warrior', 'Toughness', 'removed'],
    ['warrior', 'Improved Cleave', 'removed'],
    ['mage', 'Improved Scorch', 'changed'],
    ['hunter', 'Aimed Shot', 'removed'],
    ['hunter', 'Thick Hide', 'removed'],
  ] as const)('marks old %s %s as officially %s in static calculator and catalog records', (classId, name, status) => {
    const classDef = PUBLISHED_CLASSES.find((candidate) => candidate.id === classId)!
    const talent = classDef.talents.find((candidate) => candidate.name === name)!
    expect(talent, `${classId} ${name} must remain as a historical record`).toBeTruthy()
    for (const kind of ['calculator', 'talents'] as const) {
      const page = classDef.pages.find((candidate) => candidate.kind === kind)!
      const html = renderClassPage(classDef, page)
      const item = html.match(new RegExp(`<li data-class-talent="${talent.id}"[^>]*>.*?<\\/li>`, 's'))?.[0]
      expect(item, `${kind} must include ${name}`).toBeTruthy()
      expect(item).toContain(`data-official-status="${status}"`)
      expect(item).toContain('69913 historical record')
      expect(item).toContain(officialTalentNotice(classId, name)?.source)
      expect(item).not.toContain('Client verified')
    }
  })

  it('does not tell crawlers a blank Paladin calculator link loads the historical talent preview', () => {
    const html = renderLandingPrerender('retribution-pvp')
    expect(html).toContain('Open a blank Paladin Talent Calculator')
    expect(html).not.toContain('to inspect the same allocation')
  })

  it('prerenders all 53 Warrior talent records and the build cluster through the generic renderer', () => {
    const calculator = warriorClass.pages.find((page) => page.kind === 'calculator')!
    const planner = renderClassPage(warriorClass, calculator)
    expect(planner.match(/data-class-talent/g)).toHaveLength(53)
    expect(planner).toContain('<h1>WoW Forever Warrior Talent Calculator</h1>')
    const hub = warriorClass.pages.find((page) => page.kind === 'buildsHub')!
    expect(renderClassPage(warriorClass, hub)).toContain('WoW Forever Warrior Builds')
    for (const page of warriorClass.pages.filter((candidate) => candidate.primaryBuildId)) {
      const html = renderClassPage(warriorClass, page)
      expect(html).toContain('Community / Editorial Build')
      expect(html).toContain('href="/warrior?build=')
    }
  })

  it('keeps removed-talent Hunter routes as indexed historical records without prefilled calculator CTAs', () => {
    const ids = [
      'hunter-beast-mastery-starter',
      'hunter-marksmanship-starter',
      'hunter-beast-mastery-leveling',
      'hunter-marksmanship-leveling',
      'hunter-hunter-pet-build',
      'hunter-hunter-dungeon-build',
    ]
    for (const id of ids) {
      const build = hunterClass.builds.find((candidate) => candidate.id === id)!
      const route = hunterClass.pages.find((candidate) => candidate.slug === build.href.slice(1))!
      const html = renderClassPage(hunterClass, route)
      expect(html, route.slug).toContain(build.allocation)
      expect(html, route.slug).toContain('historical route includes an officially removed talent')
      expect(html, route.slug).toContain('href="/hunter?build=#class-calculator"')
      expect(html, route.slug).not.toMatch(/href="\/hunter\?build=[^"#]/)
    }
  })
  it('prerenders every versioned Paladin spellbook entry for crawlers', () => {
    const html = renderSpellbookPrerender()

    expect(html).toContain('<h1>WoW Forever Paladin Abilities &amp; Spellbook</h1>')
    expect(html).toContain('Beta client 1.60.1.69893')
    expect(html.match(/data-spellbook-entry/g)).toHaveLength(45)
    for (const entry of paladinSpellbook.entries) expect(html).toContain(entry.name)
    expect(html).toContain('href="/paladin#calculator"')
    expect(html).toContain('href="/wow-forever-paladin-beta-talent-changes"')
    expect(html).toContain('https://wowhandbook.com/spellbook/paladin/')
  })
  it.each(EMBERVILLE_PAGES.map((page) => [page.id, page.title] as const))('gives the %s Emberville page substantial unique crawlable copy', (pageId, title) => {
    const html = renderEmbervillePrerender(pageId)
    const words = html.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9'-]+/g)?.length ?? 0
    expect(html.match(/<h1>.*?<\/h1>/g)).toHaveLength(1)
    expect(html).toContain(`<h1>${title}</h1>`)
    for (const section of EMBERVILLE_EDITORIAL[pageId]) expect(html).toContain(`<h2>${section.heading}</h2>`)
    expect(words).toBeGreaterThanOrEqual(220)
  })
  it.each([
    ['holy', "Light's Vigil", 'Above level range', '31 talent points'],
    ['protection', 'Improved Seal of Fury', 'Within level range', '11 talent points'],
    ['retribution', 'Twist of Light', 'Above level range', '31 talent points'],
  ] as const)('prerenders current Beta availability for %s', (branch, talent, status, points) => {
    const html = renderBetaAvailabilityPrerender(branch)

    expect(html).toContain('Official level cap 30')
    expect(html).toContain('21 points under the one-point-per-level planning assumption')
    expect(html).toContain('current talent availability is not confirmed')
    expect(html).toContain(talent)
    expect(html).toContain(status)
    expect(html).toContain(points)
  })

  it.each([
    ['leveling', '0/0/11'],
    ['retribution-leveling', '0/0/11'],
  ] as const)('prerenders the %s beta leveling snapshot', (pageId, current) => {
    const html = renderBetaLevelingSnapshotPrerender(pageId)

    expect(html).toContain('Level 20 starting route')
    expect(html).toContain('Level 20')
    expect(html).toContain(current)
    expect(html).toContain('Official Level 30 cap · Route pending review')
    expect(html).toContain('No reviewed allocation')
    expect(html).not.toContain('0/0/21')
    expect(html).toContain('1.60.1.69913')
    expect(html).toContain('not a verified build')
  })

  it('prerenders the old Protection leveling path as archived without its stale build deep link', () => {
    const html = renderBetaLevelingSnapshotPrerender('protection-leveling')
    expect(html).toContain('Archived Level 20 route')
    expect(html).toContain('2/9/0')
    expect(html).toContain('Official Level 30 cap · Route pending review')
    expect(html).toContain('href="/build?id=#calculator"')
    expect(html).not.toMatch(/href="\/build\?id=[^#"]/)
  })

  it.each([
    ['holy', '11/0/0', '5/5 Divine Intellect'],
    ['retribution', '0/0/11', '1/1 Seal of Command'],
  ] as const)('prerenders the executable %s Beta talent path', (branch, current, milestone) => {
    const html = renderBetaSpecPathPrerender(branch)

    expect(html).toContain('Beta talent starting path')
    expect(html).toContain('Level 20 starting route')
    expect(html).toContain('Level 20 · 11 points')
    expect(html).toContain(current)
    expect(html).toContain('Official Level 30 cap · Route pending review')
    expect(html).toContain('No reviewed allocation')
    expect(html).not.toMatch(/21\/0\/0|2\/0\/19/)
    expect(html).toContain(milestone)
    expect(html).toContain('#calculator')
    expect(html).toContain('Community recommendation')
  })

  it('prerenders the archived Protection route with a blank calculator link', () => {
    const html = renderBetaSpecPathPrerender('protection')
    expect(html).toContain('Archived Beta talent path')
    expect(html).toContain('2/9/0')
    expect(html).toContain('Improved Holy Strike')
    expect(html).toContain('href="/build?id=#calculator"')
    expect(html).not.toMatch(/href="\/build\?id=[^#"]/)
  })

  it('links every build the hub data declares', () => {
    const html = renderHubPrerender()

    for (const href of HUB_BUILD_HREFS) expect(html).toContain(`href="${href}"`)
  })

  it('links the versioned Paladin spellbook from the crawlable hub', () => {
    expect(renderHubPrerender()).toContain('href="/wow-forever-paladin-abilities"')
  })

  it.each(SPEC_BUILDS_HUBS.map((hub) => [hub.spec, hub] as const))('links every build the %s hub data declares', (_spec, hub) => {
    const html = renderSpecHubPrerender(hub.spec)

    for (const href of specHubHrefs(hub)) expect(html).toContain(`href="${href}"`)
  })

  it('renders the archived Protection Beta route without the old deep link for crawlers', () => {
    const html = renderSpecHubPrerender('protection')
    expect(html).toContain('Level 20')
    expect(html).toContain('2/9/0')
    expect(html).toContain('Archived')
    expect(html).toContain(`href="${betaLevelingPlannerHref('protection-leveling')}"`)
    expect(html).not.toMatch(/href="\/build\?id=[^#"]/)
    expect(html).toContain('href="/wow-forever-protection-paladin-leveling-build"')
    expect(renderSpecHubPrerender('retribution')).not.toContain('2/9/0')
  })

  it('carries the landing page title as its only h1', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const headings = renderLandingPrerender(page.id).match(/<h1>.*?<\/h1>/g) ?? []

      expect(headings).toHaveLength(1)
      expect(headings[0]).toContain(page.title)
    }
  })

  it('never links a url the deployment redirects', () => {
    for (const [label, html] of allPrerendered()) {
      for (const source of redirections) expect(html, `${label} links redirected ${source}`).not.toContain(`href="${source}"`)
    }
  })

  it('links each spec talent page the hub already points readers at', () => {
    for (const hub of SPEC_BUILDS_HUBS) {
      for (const item of hub.talents) expect(renderSpecHubPrerender(hub.spec)).toContain(`href="${item.href}"`)
    }
  })

  it('carries every link its configuration declares', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const html = renderLandingPrerender(page.id)
      const declared = page.sections.flatMap((section) => {
        if (section.kind === 'related') return section.items.map((item) => item.href)
        if (section.kind === 'cards') return section.items.flatMap((item) => (item.href ? [item.href] : []))
        return []
      })

      for (const href of declared) expect(html, `${page.slug} does not link ${href}`).toContain(`href="${href}"`)
    }
  })

  it('never nests a list inside a paragraph', () => {
    for (const [label, html] of allPrerendered()) {
      expect(html, label).not.toMatch(/<p>\s*<ul>/)
    }
  })

  it('prerenders every trust-page section and footer link', () => {
    for (const page of TRUST_PAGES) {
      const html = renderTrustPrerender(page.id)

      expect(html).toContain(`<h1>${page.title}</h1>`)
      for (const section of page.sections) expect(html).toContain(`<h2>${section.heading}</h2>`)
      expect(html).toContain('href="/privacy"')
    }
  })

  it('makes the privacy and contact pages crawlable from every generated landing page', () => {
    for (const [label, html] of allPrerendered()) {
      expect(html, label).toContain('href="/privacy"')
      expect(html, label).toContain('href="/contact"')
    }
  })

  it.each(['leveling', 'pvp', 'raid', 'retribution-pvp', 'holy-pvp'] as const)(
    'gives the %s landing page at least 450 crawlable words',
    (pageId) => {
      const text = renderLandingPrerender(pageId).replace(/<[^>]+>/g, ' ')
      const words = text.match(/[A-Za-z0-9'-]+/g)?.length ?? 0

      expect(words).toBeGreaterThanOrEqual(450)
    },
  )
})

describe('class page prerender', () => {
  it('prerenders one class page per published page, and only published ones', () => {
    expect(publishedMagePages).toHaveLength(11)
    expect(withheldMageSlugs).toHaveLength(4)

    for (const page of mageClass.pages) {
      // Every definition renders — the gate decides what ships, not the renderer.
      expect(classPageHtml(page), page.slug).toContain(`<h1>${escapeHtml(page.h1)}</h1>`)
    }
  })

  it.each(publishedMagePages.map((page) => [page.slug, page] as const))(
    'gives %s its own H1, description, sections and FAQs',
    (_slug, page) => {
      const html = classPageHtml(page)

      expect(html.match(/<h1>.*?<\/h1>/g)).toHaveLength(1)
      expect(html).toContain(escapeHtml(page.description))
      expect(html).toContain(escapeHtml(page.eyebrow))
      for (const section of page.sections) expect(html).toContain(`<h2>${escapeHtml(section.heading)}</h2>`)
      for (const faq of page.faqs) {
        expect(html).toContain(escapeHtml(faq.question))
        expect(html).toContain(escapeHtml(faq.answer))
      }
      expect(html).toContain('href="/about"')
      expect(html).toContain('href="/privacy"')
    },
  )

  it('lists every published talent name in the calculator prerender', () => {
    const calculator = mageClass.pages.find((page) => page.kind === 'calculator')!
    const html = renderClassPage(mageClass, calculator)

    for (const talent of mageClass.talents) expect(html, `${talent.id} is missing`).toContain(talent.name)
    for (const branch of MAGE_BRANCHES) expect(html).toContain(mageClass.branchNames[branch])
    expect(html.match(/data-class-talent=/g)).toHaveLength(mageClass.talents.length)
  })

  it('carries each published build page allocation and its selected talents', () => {
    const withPrimary = publishedMagePages.filter((page) => page.primaryBuildId)

    expect(withPrimary.length).toBeGreaterThan(0)
    for (const page of withPrimary) {
      const build = mageClass.builds.find((candidate) => candidate.id === page.primaryBuildId)!
      const html = classPageHtml(page)

      expect(html, `${page.slug} omits its allocation`).toContain(build.allocation)
      expect(html).toContain(`${build.points} / ${build.levelCap} points`)
      for (const talentId of Object.keys(build.build)) {
        const talent = mageClass.talents.find((candidate) => candidate.id === talentId)!
        expect(html, `${page.slug} omits ${talent.name}`).toContain(talent.name)
      }
    }
  })

  it('never prints an unreviewed fire preset allocation', () => {
    const fireSlot = MAGE_BRANCHES.indexOf('fire')

    expect(fireSlot).toBe(1)
    for (const [label, html] of classPrerendered()) {
      for (const triple of allocationTriples(html)) {
        expect(triple[fireSlot], `${label} prints ${triple.join('/')}`).toBe(0)
      }
    }
  })

  it('never links a page the gate withholds', () => {
    for (const [label, html] of classPrerendered()) {
      for (const withheld of withheldMageSlugs) {
        expect(html, `${label} links withheld ${withheld}`).not.toContain(`href="${withheld}"`)
      }
    }
  })

  it('links every published document back to the now-available class calculator', () => {
    const satisfied = satisfiedRequirements(mageClass)

    expect(satisfied.has('completeClassPlanner')).toBe(true)
    for (const [label, html] of classPrerendered()) {
      expect(html, `${label} omits ${mageClass.plannerPath}`).toContain(`href="${mageClass.plannerPath}`)
    }
  })

  it('adds one Mage discovery link to the existing surfaces without dropping a link', () => {
    for (const [label, html] of [['paladin hub', renderHubPrerender()], ['paladin landing', renderLandingPrerender('leveling')], ['trust page', renderTrustPrerender('about')]] as const) {
      expect(html, label).toContain('href="/wow-forever-mage-talents"')
      for (const href of ['/paladin', '/wow-forever-paladin-builds', '/about', '/contact', '/privacy']) {
        expect(html, `${label} dropped ${href}`).toContain(`href="${href}"`)
      }
      // Global discovery remains the talent catalogue; class pages provide the calculator CTA.
      expect(html, label).not.toContain('href="/mage"')
    }
  })

  it('keeps the calculator links for a class that satisfies completeClassPlanner', () => {
    // The same renderer and the same rule: the gate decides. The Hunter fixture's planner is
    // published, so its pages must keep exactly the links the withheld Mage pages dropped.
    expect(satisfiedRequirements(hunterClassFixture).has('completeClassPlanner')).toBe(true)
    const page = hunterClassFixture.pages.find((candidate) => candidate.kind === 'specBuild')!
    const html = renderClassPage(hunterClassFixture, page)

    expect(html).toContain(`href="${hunterClassFixture.plannerPath}?build=`)
    expect(html).toMatch(/Inspect Level 20 snapshot in Calculator/i)
  })
})
