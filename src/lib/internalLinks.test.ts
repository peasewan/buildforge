import { describe, expect, it } from 'vitest'
import { BUILD_LANDING_PAGES } from '../data/buildLandingPages'
import { PUBLISHED_CLASSES } from '../data/classes'
import { HUB_BUILD_HREFS, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TALENTS } from '../data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS, specHubHrefs } from '../data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../data/specTalentsPages'
import { publishRequirementsFor, satisfiedRequirements } from './classPage'
import { pageForPath } from './routes'

const ORIGIN = 'https://buildforgetools.com'

/**
 * The class pages the publish gate actually serves. Derived here rather than imported from the
 * route wiring, so this suite stays an independent second opinion on what publishes.
 */
const publishedClassPages = PUBLISHED_CLASSES.flatMap((classDef) => {
  const satisfied = satisfiedRequirements(classDef)
  return classDef.pages
    .filter((page) => publishRequirementsFor(page).every((requirement) => satisfied.has(requirement)))
    .map((page) => ({ classDef, page }))
})

/** Every path a published class page declares a link to, wherever the href sits in the record. */
const declaredClassHrefs = () =>
  publishedClassPages.flatMap(({ classDef, page }) => {
    const hrefs = [...collectHrefs(page)]
    for (const build of classDef.builds) {
      if (build.id === page.primaryBuildId || page.relatedBuildIds.includes(build.id)) hrefs.push(build.href)
    }
    return hrefs.map((href) => ({ slug: page.slug, href }))
  })

/** Every `href` anywhere in the given data, at any depth. */
function collectHrefs(value: unknown, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectHrefs(item, found)
  } else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (key === 'href' && typeof nested === 'string') found.add(nested)
      else collectHrefs(nested, found)
    }
  }
  return found
}

const allDeclaredHrefs = () => collectHrefs([
  BUILD_LANDING_PAGES,
  HUB_PLAYSTYLE_SECTIONS,
  HUB_SPECIALIZATIONS,
  HUB_TALENTS,
  SPEC_BUILDS_HUBS,
  SPEC_TALENTS_PAGES,
])

describe('internal link integrity', () => {
  it('resolves every declared internal href to its own page', () => {
    for (const href of allDeclaredHrefs()) {
      // Same-page anchors are always valid; there is no route to resolve.
      if (href.startsWith('#')) continue

      const { pathname } = new URL(href, ORIGIN)

      // /build is a noindex deep link that deliberately serves the planner.
      if (pathname === '/build') continue

      expect(pageForPath(pathname).canonical, `${href} does not resolve to a page of its own`).toBe(`${ORIGIN}${pathname}`)
    }
  })

  it('keeps the href lists in sync with the data they summarise', () => {
    const declared = allDeclaredHrefs()

    for (const href of [...HUB_BUILD_HREFS, ...SPEC_BUILDS_HUBS.flatMap(specHubHrefs)]) {
      expect(declared, `${href} is listed as a hub href but declared nowhere`).toContain(href)
    }
  })

  it('resolves every link a published class page declares to its own canonical', () => {
    const hrefs = declaredClassHrefs()

    expect(hrefs.length).toBeGreaterThan(0)
    for (const { slug, href } of hrefs) {
      const { pathname } = new URL(href, ORIGIN)

      expect(pageForPath(pathname).canonical, `${slug} links ${href}, which does not resolve to its own page`).toBe(`${ORIGIN}${pathname}`)
    }
  })

  it('never links a class page the publish gate withholds', () => {
    const published = new Set(publishedClassPages.map(({ page }) => `/${page.slug}`))
    const withheld = new Set(
      PUBLISHED_CLASSES.flatMap((classDef) => classDef.pages.map((page) => `/${page.slug}`)).filter((path) => !published.has(path)),
    )

    expect(withheld.size).toBe(7)
    for (const { slug, href } of declaredClassHrefs()) {
      const { pathname } = new URL(href, ORIGIN)

      expect(withheld.has(pathname), `${slug} links withheld ${pathname}`).toBe(false)
    }
  })
})
