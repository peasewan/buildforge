import { describe, expect, it } from 'vitest'
import { BUILD_LANDING_PAGES } from '../data/buildLandingPages'
import { HUB_BUILD_HREFS, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TALENTS } from '../data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS, specHubHrefs } from '../data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../data/specTalentsPages'
import { pageForPath } from './routes'

const ORIGIN = 'https://buildforgetools.com'

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
})
