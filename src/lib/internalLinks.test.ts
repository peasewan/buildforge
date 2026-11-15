import { describe, expect, it } from 'vitest'
import { BUILD_LANDING_PAGES } from '../data/buildLandingPages'
import { PUBLISHED_CLASSES } from '../data/classes'
import { HUB_BUILD_HREFS, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TALENTS } from '../data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS, specHubHrefs } from '../data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../data/specTalentsPages'
import { publishedClassPages as gatedPages } from './classPage'
import { pageForPath } from './routes'
import { isRemovedPage, resolvePageHref } from './pageRetirement'

const ORIGIN = 'https://buildforgetools.com'

/**
 * The class pages the publish gate actually serves. Derived here rather than imported from the
 * route wiring, so this suite stays an independent second opinion on what publishes.
 */
const publishedClassPages = gatedPages(PUBLISHED_CLASSES)

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
  it('resolves declared navigation to its retained canonical or explicitly retired state', () => {
    for (const href of allDeclaredHrefs()) {
      // Same-page anchors are always valid; there is no route to resolve.
      if (href.startsWith('#')) continue

      const { pathname } = new URL(resolvePageHref(href), ORIGIN)

      if (isRemovedPage(href)) {
        expect(pageForPath(pathname).kind, `${href} must remain retired`).toBe('retired')
        continue
      }

      // /build is a noindex deep link that deliberately serves the planner.
      if (pathname === '/build') continue

      expect(pageForPath(pathname).canonical, `${href} does not resolve to its retained page`).toBe(`${ORIGIN}${pathname}`)
    }
  })

  it('keeps the href lists in sync with the data they summarise', () => {
    const declared = allDeclaredHrefs()

    for (const href of [...HUB_BUILD_HREFS, ...SPEC_BUILDS_HUBS.flatMap(specHubHrefs)]) {
      expect(declared, `${href} is listed as a hub href but declared nowhere`).toContain(href)
    }
  })

  it('resolves every retained link a published class page declares to its final canonical', () => {
    const hrefs = declaredClassHrefs()

    expect(hrefs.length).toBeGreaterThan(0)
    for (const { slug, href } of hrefs) {
      const { pathname } = new URL(resolvePageHref(href), ORIGIN)

      if (isRemovedPage(href)) {
        expect(pageForPath(pathname).kind, `${slug} declares retired ${href}`).toBe('retired')
        continue
      }

      expect(pageForPath(pathname).canonical, `${slug} links ${href}, which does not resolve to its retained page`).toBe(`${ORIGIN}${pathname}`)
    }
  })

  it('never resolves retained class navigation to a page the publish gate withholds', () => {
    const published = new Set(publishedClassPages.map(({ page }) => `/${page.slug}`))
    const withheld = new Set(
      PUBLISHED_CLASSES.flatMap((classDef) => classDef.pages.map((page) => `/${page.slug}`)).filter((path) => !published.has(path)),
    )

    expect(withheld.size).toBeGreaterThan(0)
    for (const { slug, href } of declaredClassHrefs()) {
      if (isRemovedPage(href)) continue
      const { pathname } = new URL(resolvePageHref(href), ORIGIN)

      expect(withheld.has(pathname), `${slug} links withheld ${pathname}`).toBe(false)
    }
  })
})
