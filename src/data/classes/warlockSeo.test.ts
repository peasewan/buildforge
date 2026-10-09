import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from './index'
import { warlockClass } from './warlock'
import { classPageShellHtml, classPageSitemapBlock, withClassPageSitemapBlock } from '../../lib/classStaticPages'
import { renderClassPage } from '../../lib/prerender'

const slug = 'wow-forever-warlock-pvp-build'
const page = warlockClass.pages.find((candidate) => candidate.slug === slug)!
const route = warlockClass.builds.find(build => build.id === page.primaryBuildId)!

describe('Warlock PvP SEO pilot', () => {
  it('keeps the existing search-facing identity and gives the public page a specific preview', () => {
    expect(page.title).toBe('WoW Forever Warlock PvP Build | BuildForgeTools')
    expect(page.h1).toBe('WoW Forever Warlock PvP Build')
    expect(page.canonical).toBe(`https://buildforgetools.com/${slug}`)
    expect(page.slug).toBe(slug)
    expect(page.description).toMatch(/^WoW Forever Warlock PvP build/)
    expect(page.description).toContain('Level 20 starter')
    expect(page.description).toContain('Level 30 Beta')
    expect(page.description.length).toBeLessThanOrEqual(160)

    const html = renderClassPage(warlockClass, page)
    expect(route.level).toBe(30)
    expect(route.points).toBe(21)
    expect(page.surfaceDescription).toContain('current Level 30 Beta')
    expect(warlockClass.verifiedBuild).toBe('1.60.1.70291')
    for (const [id, rank] of Object.entries(route.build)) {
      const talent = warlockClass.talents.find(talent => talent.id === id)!
      expect(talent.rankDescriptions?.[rank - 1]).toBeTruthy()
      expect(talent.verifiedThroughBuild).toBe(warlockClass.verifiedBuild)
    }
    expect(html).toContain('Level 30 Beta')
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

  it('keeps the October 2 pilot editorial copy unique after the October 9 role remediation', () => {
    const pages = PUBLISHED_CLASSES.flatMap((classDef) => classDef.pages)
    const withPilotCopy = pages.filter((candidate) => candidate.sections.some((section) =>
      section.paragraphs.some((paragraph) => paragraph.includes('For comparable PvP encounters'))))
    expect(withPilotCopy.map((candidate) => candidate.slug)).toEqual([slug])
    const rolePages = warlockClass.pages.filter((candidate) => candidate.roleDecision)
    expect(rolePages.map((candidate) => candidate.slug)).toEqual([
      slug, 'wow-forever-warlock-pet-build', 'wow-forever-warlock-dungeon-build',
    ])
    expect(rolePages.every((candidate) => candidate.updatedAt === '2026-10-09')).toBe(true)

    const sitemap = readFileSync(`${process.cwd()}/public/sitemap.xml`, 'utf8')
    expect(withClassPageSitemapBlock(sitemap)).toBe(sitemap)
    const document = new DOMParser().parseFromString(`<urlset>${classPageSitemapBlock()}</urlset>`, 'application/xml')
    for (const rolePage of rolePages) {
      const row = [...document.querySelectorAll('url')]
        .find((candidate) => candidate.querySelector('loc')?.textContent === rolePage.canonical)
      expect(row?.querySelector('lastmod')?.textContent, rolePage.slug).toBe('2026-10-09')
    }
  })
})
