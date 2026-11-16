import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BUILD_LANDING_PAGES } from '../data/buildLandingPages'
import { SPEC_BUILDS_HUBS } from '../data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../data/specTalentsPages'
import { TRUST_PAGES } from '../data/trustPages'
import { pageForPath } from './routes'
import { EMBERVILLE_PAGES } from '../data/emberville'
import { isRetiredPage, resolvePageHref } from './pageRetirement'

const manualConsolidations = [
  ['/wow-forever-retribution-paladin-leveling-build', '/wow-forever-paladin-leveling-build'],
  ['/emberville-skill-inheritance', '/emberville'],
  ['/wow-forever-protection-paladin-dungeon-build', '/wow-forever-protection-paladin-build'],
  ['/wow-forever-retribution-paladin-builds', '/wow-forever-retribution-paladin-build'],
  ['/songs-of-glimmerwick-first-days', '/songs-of-glimmerwick'],
  ['/songs-of-glimmerwick-spellcasting', '/songs-of-glimmerwick'],
] as const

describe('crawlable page templates', () => {
  it('provides a prerender target for the Paladin calculator', () => {
    const template = readFileSync(`${process.cwd()}/paladin/index.html`, 'utf8')

    expect(template).toContain('<!-- PLANNER_PRERENDER -->')
  })

  it.each([
    ...EMBERVILLE_PAGES.map((page) => [`${page.slug}/index.html`] as const),
    ...BUILD_LANDING_PAGES.map((page) => [`${page.slug}/index.html`] as const),
    ...SPEC_TALENTS_PAGES.map((page) => [`${page.slug}/index.html`] as const),
    ...SPEC_BUILDS_HUBS.map((hub) => [`${hub.slug}/index.html`] as const),
    ...TRUST_PAGES.map((page) => [`${page.slug}/index.html`] as const),
    ['wow-forever-paladin-builds/index.html'],
  ].filter(([filename]) => !isRetiredPage(`/${filename.replace(/\/index\.html$/, '')}`)))('generates %s at build time instead of hand-writing its body', (filename) => {
    const template = readFileSync(`${process.cwd()}/${filename}`, 'utf8')

    expect(template).toContain('<!-- PAGES_PRERENDER -->')
  })

  const metadataTargets = [
    ...EMBERVILLE_PAGES.map((page) => [`/${page.slug}`, `${page.slug}/index.html`] as const),
    ['/paladin', 'paladin/index.html'],
    ['/wow-forever-paladin-talents', 'wow-forever-paladin-talents/index.html'],
    ['/wow-forever-paladin-builds', 'wow-forever-paladin-builds/index.html'],
    ['/wow-forever-paladin-build', 'wow-forever-paladin-build/index.html'],
    ['/wow-forever-protection-paladin-build', 'wow-forever-protection-paladin-build/index.html'],
    ['/wow-forever-retribution-paladin-build', 'wow-forever-retribution-paladin-build/index.html'],
    ['/wow-forever-retribution-paladin-leveling-build', 'wow-forever-retribution-paladin-leveling-build/index.html'],
    ...BUILD_LANDING_PAGES.map((page) => [`/${page.slug}`, `${page.slug}/index.html`]),
    ...SPEC_TALENTS_PAGES.map((page) => [`/${page.slug}`, `${page.slug}/index.html`]),
    ...SPEC_BUILDS_HUBS.map((hub) => [`/${hub.slug}`, `${hub.slug}/index.html`]),
    ...TRUST_PAGES.map((page) => [`/${page.slug}`, `${page.slug}/index.html`]),
  ] as const

  it.each(metadataTargets.filter(([pathname]) => !isRetiredPage(pathname)))('keeps static metadata aligned for %s', (pathname, filename) => {
    const template = readFileSync(`${process.cwd()}/${filename}`, 'utf8')
    const document = new DOMParser().parseFromString(template, 'text/html')
    const page = pageForPath(pathname)

    expect(document.title).toBe(page.title)
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description)
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(page.title)
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(page.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(page.canonical)
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(page.canonical)
  })

  it.each(manualConsolidations)('retires the %s shell and serves its declared target metadata', (source, destination) => {
    const config = JSON.parse(readFileSync(`${process.cwd()}/vercel.json`, 'utf8')) as {
      redirects: { source: string; destination: string; statusCode?: number; permanent?: boolean }[]
    }
    expect(resolvePageHref(source)).toBe(destination)
    expect(existsSync(`${process.cwd()}${source}/index.html`)).toBe(false)
    for (const alias of [source, `${source}/index.html`]) {
      expect(config.redirects.find(redirect => redirect.source === alias)).toMatchObject({ source: alias, destination, statusCode: 301 })
    }

    const targetFilename = `${process.cwd()}${destination}/index.html`
    expect(existsSync(targetFilename)).toBe(true)
    const document = new DOMParser().parseFromString(readFileSync(targetFilename, 'utf8'), 'text/html')
    const target = pageForPath(destination)
    expect(pageForPath(source)).toEqual(target)
    expect(document.title).toBe(target.title)
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(target.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`https://buildforgetools.com${destination}`)
  })
})
