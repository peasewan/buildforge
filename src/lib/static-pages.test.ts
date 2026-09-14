import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pageForPath } from './routes'

describe('crawlable page templates', () => {
  it('provides a prerender target for the Paladin calculator', () => {
    const template = readFileSync(`${process.cwd()}/paladin/index.html`, 'utf8')

    expect(template).toContain('<!-- PLANNER_PRERENDER -->')
  })

  it.each([
    ['/paladin', 'paladin/index.html'],
    ['/wow-forever-paladin-talents', 'wow-forever-paladin-talents/index.html'],
    ['/wow-forever-paladin-build', 'wow-forever-paladin-build/index.html'],
    ['/wow-forever-protection-paladin-build', 'wow-forever-protection-paladin-build/index.html'],
    ['/wow-forever-retribution-paladin-build', 'wow-forever-retribution-paladin-build/index.html'],
    ['/wow-forever-paladin-leveling-build', 'wow-forever-paladin-leveling-build/index.html'],
    ['/wow-forever-paladin-pvp-build', 'wow-forever-paladin-pvp-build/index.html'],
    ['/wow-forever-paladin-raid-build', 'wow-forever-paladin-raid-build/index.html'],
    ['/wow-forever-protection-paladin-dungeon-build', 'wow-forever-protection-paladin-dungeon-build/index.html'],
    ['/wow-forever-paladin-builds', 'wow-forever-paladin-builds/index.html'],
  ])('keeps static metadata aligned for %s', (pathname, filename) => {
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
})
