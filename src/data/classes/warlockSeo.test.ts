import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from './index'
import { warlockClass } from './warlock'
import { classPageShellHtml, classPageSitemapBlock, withClassPageSitemapBlock } from '../../lib/classStaticPages'
import { renderClassPage } from '../../lib/prerender'

const slug = 'wow-forever-warlock-pvp-build'
const page = warlockClass.pages.find((candidate) => candidate.slug === slug)!
const route = 'Improved Corruption 5/5 → Improved Life Tap 2/2 → Soul Siphon 3/3 → Amplify Curse 1/1'

describe('Warlock PvP SEO pilot', () => {
  it('keeps the existing search-facing identity and gives the public page a specific preview', () => {
    expect(page.title).toBe('WoW Forever Warlock PvP Build | BuildForgeTools')
    expect(page.h1).toBe('WoW Forever Warlock PvP Build')
    expect(page.canonical).toBe(`https://buildforgetools.com/${slug}`)
    expect(page.slug).toBe(slug)
    expect(page.description).toMatch(/^WoW Forever Warlock PvP build: 11-point Affliction route/)
    expect(page.description).toContain('Client-table preview')
    expect(page.description.length).toBeLessThanOrEqual(160)

    const html = renderClassPage(warlockClass, page)
    expect(page.surfaceDescription).toContain(route)
    expect(page.surfaceDescription).toContain('editorial client-table preview')
    expect(html).not.toContain(route)
    expect(html).toContain('Client-table preview')
    expect(html).toContain('a PvP check needs to include the opponent')
    expect(html).toContain('opponent level and equipment')
    expect(html).toContain('pet repositioning')
    expect(page.surfaceDescription).toContain('disengage or survive')
    expect(html).toContain('href="/warlock?build=')

    const shell = readFileSync(`${process.cwd()}/${slug}/index.html`, 'utf8')
    expect(shell).toBe(classPageShellHtml(warlockClass, page))
    const document = new DOMParser().parseFromString(shell, 'text/html')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(page.canonical)
  })

  it('confines the new editorial section and release date to this URL', () => {
    const pages = PUBLISHED_CLASSES.flatMap((classDef) => classDef.pages)
    const withPilotCopy = pages.filter((candidate) => candidate.sections.some((section) =>
      section.paragraphs.some((paragraph) => paragraph.includes('For comparable PvP encounters'))))
    expect(withPilotCopy.map((candidate) => candidate.slug)).toEqual([slug])
    expect(page.updatedAt).toBe('2026-09-25')

    const sitemap = readFileSync(`${process.cwd()}/public/sitemap.xml`, 'utf8')
    expect(withClassPageSitemapBlock(sitemap)).toBe(sitemap)
    const changedRows = [...classPageSitemapBlock().matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>2026-09-25<\/lastmod>/g)]
      .map((match) => match[1])
    expect(changedRows).toEqual([page.canonical])
  })
})
