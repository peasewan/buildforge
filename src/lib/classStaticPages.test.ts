import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../data/classes'
import { mageClass } from '../data/classes/mage'
import { hunterClassFixture } from '../data/fixtures/hunterClass.fixture'
import type { ClassDefinition, ClassPageDefinition } from './classPage'
import {
  CLASS_PAGE_MANIFEST_FILENAME,
  CLASS_PAGE_SITEMAP_MARKERS,
  classPageManifestContent,
  classPagePaths,
  classPageRewrites,
  classPageShellHtml,
  classPageSitemapBlock,
  classPageViteInputs,
  publishedClassPages,
} from './classStaticPages'
import { pageForPath } from './routes'

const ORIGIN = 'https://buildforgetools.com'

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const committedSitemap = read('public/sitemap.xml')
const committedVercel = JSON.parse(read('vercel.json')) as {
  redirects: { source: string }[]
  headers: { source: string; headers: { key: string; value: string }[] }[]
  rewrites: { source: string; destination: string }[]
}

const published = publishedClassPages()
const publishedSlugs = published.map(({ page }) => page.slug)
const withheldSlugs = mageClass.pages.map((page) => page.slug).filter((slug) => !publishedSlugs.includes(slug))

/** A second registry whose gate answers differently, so a literal Mage list cannot pass. */
const hunterWithAWithheldPage: ClassDefinition = {
  ...(hunterClassFixture as ClassDefinition),
  pages: [
    ...hunterClassFixture.pages,
    {
      ...(hunterClassFixture.pages[1] as ClassPageDefinition),
      kind: 'dungeon',
      slug: 'hunter-withheld-fixture-page',
      // No Hunter branch is named `fire`, so this requirement can never be satisfied: the page
      // stays defined and stays unpublished, exactly like the Mage fire pages.
      publishRequirements: ['legalBuild:fire'],
    },
  ],
}
const hunterSlugs = hunterWithAWithheldPage.pages.map((page) => page.slug).filter((slug) => slug !== 'hunter-withheld-fixture-page')

const committedSitemapBlock = committedSitemap.slice(
  committedSitemap.indexOf(`  ${CLASS_PAGE_SITEMAP_MARKERS.start}`),
  committedSitemap.indexOf(CLASS_PAGE_SITEMAP_MARKERS.end) + CLASS_PAGE_SITEMAP_MARKERS.end.length,
)

describe('generated class-page artifacts', () => {
  it('publishes the eight pages the gate publishes and withholds the other seven', () => {
    expect(published).toHaveLength(8)
    expect(withheldSlugs).toHaveLength(7)
    expect(classPagePaths()).toEqual(publishedSlugs.map((slug) => `/${slug}`))
    for (const slug of withheldSlugs) expect(classPagePaths()).not.toContain(`/${slug}`)
  })

  it('answers from whatever registry it is given, never from a hand-written slug list', () => {
    // The same generators, a different class: the output follows the gate, not a Mage literal.
    expect(classPagePaths([hunterWithAWithheldPage])).toEqual(hunterSlugs.map((slug) => `/${slug}`))
    expect(classPagePaths([hunterWithAWithheldPage])).not.toContain('/hunter-withheld-fixture-page')
    expect(classPagePaths()).not.toContain('/hunter')

    expect(classPageViteInputs([hunterWithAWithheldPage]).map((input) => input.file)).toContain('hunter/index.html')
    expect(classPageRewrites([hunterWithAWithheldPage])).toContainEqual({ source: '/hunter', destination: '/hunter/index.html' })
    expect(classPageSitemapBlock([hunterWithAWithheldPage])).toContain(`${ORIGIN}/hunter`)
    expect(classPageSitemapBlock([hunterWithAWithheldPage])).not.toContain('hunter-withheld-fixture-page')
    expect(classPagePaths([{ ...hunterWithAWithheldPage, pages: [] }])).toEqual([])
  })

  it('feeds Vite exactly one input per published class page', () => {
    const inputs = classPageViteInputs()

    expect(inputs.map((input) => input.file).sort()).toEqual(publishedSlugs.map((slug) => `${slug}/index.html`).sort())
    expect(new Set(inputs.map((input) => input.name)).size).toBe(inputs.length)
    for (const slug of withheldSlugs) expect(inputs.some((input) => input.file.startsWith(`${slug}/`))).toBe(false)
  })

  it('hands Vite the same gated input list through a generated manifest', () => {
    // vite.config.ts is its own TypeScript project and cannot import the class data, so the list
    // reaches it as a generated file — which must still be the gate's answer, not anyone's list.
    expect(read(CLASS_PAGE_MANIFEST_FILENAME)).toBe(classPageManifestContent())
    expect(JSON.parse(read(CLASS_PAGE_MANIFEST_FILENAME))).toEqual(classPageViteInputs())

    const source = read('vite.config.ts')
    expect(source).toContain(CLASS_PAGE_MANIFEST_FILENAME)
    expect(source).not.toMatch(/wow-forever-[a-z-]*mage/)
  })

  it('names no class page slug in the wiring modules', () => {
    for (const file of ['src/lib/classStaticPages.ts', 'src/lib/routes.ts', 'scripts/prerender-pages.ts', 'scripts/sync-class-static-pages.ts', 'src/main.tsx', 'src/ClassDocumentPage.tsx', 'src/lib/prerender.ts']) {
      expect(read(file), file).not.toMatch(/wow-forever-[a-z-]*mage/)
    }
    // The generated artifacts are the gate's answer, so a hand-edit has to show up somewhere.
    expect(read(CLASS_PAGE_MANIFEST_FILENAME)).not.toMatch(/fire|pvp|level-20|frost-vs-fire/)
  })

  it.each(published.map(({ page }) => [page.slug, page] as const))('generates %s/index.html from the page record', (slug, page) => {
    const file = join(process.cwd(), slug, 'index.html')

    expect(existsSync(file), `${slug}/index.html is missing`).toBe(true)
    expect(readFileSync(file, 'utf8')).toBe(classPageShellHtml(page))
  })

  it('leaves no shell for a withheld page', () => {
    for (const slug of withheldSlugs) expect(existsSync(join(process.cwd(), slug)), `${slug}/ must not ship`).toBe(false)
    expect(existsSync(join(process.cwd(), 'wow-forever-fire-mage-build/index.html'))).toBe(false)
  })

  it.each(published.map(({ page }) => [page.slug, page] as const))('keeps %s metadata aligned with its route', (slug, page) => {
    const document = new DOMParser().parseFromString(classPageShellHtml(page), 'text/html')
    const route = pageForPath(`/${slug}`)

    expect(document.title).toBe(page.title)
    expect(route.title).toBe(page.title)
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(page.canonical)
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(page.canonical)
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow')
    expect(readFileSync(join(process.cwd(), slug, 'index.html'), 'utf8')).toContain('<!-- PAGES_PRERENDER -->')
  })

  it('writes one sitemap row per published page, dated by the page itself', () => {
    expect(committedSitemapBlock).toBe(classPageSitemapBlock())
    const locs = [...committedSitemapBlock.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])

    expect(locs.sort()).toEqual(published.map(({ page }) => page.canonical).sort())
    for (const { page } of published) {
      const row = committedSitemapBlock.split('<url>').find((candidate) => candidate.includes(`<loc>${page.canonical}</loc>`))!

      expect(row, page.slug).toContain(`<lastmod>${page.updatedAt}</lastmod>`)
    }
  })

  it('takes lastmod from the page record rather than a date baked into the writer', () => {
    // Every Mage page currently shares one review date, so only a page carrying a different
    // `updatedAt` can tell a derived lastmod from a hardcoded one.
    const redated: ClassDefinition = {
      ...(hunterClassFixture as ClassDefinition),
      pages: hunterClassFixture.pages.map((page) => ({ ...page, updatedAt: '2027-01-02' })),
    }
    const block = classPageSitemapBlock([redated])

    expect(block.match(/<lastmod>2027-01-02<\/lastmod>/g)).toHaveLength(hunterClassFixture.pages.length)
    expect(block).not.toContain('<lastmod>2026-09-22</lastmod>')
  })

  it('keeps every withheld path out of the sitemap', () => {
    for (const slug of withheldSlugs) expect(committedSitemap, slug).not.toContain(`/${slug}<`)
  })

  it('rewrites one path per published page and leaves the existing deployment config alone', () => {
    expect(classPageRewrites()).toEqual(publishedSlugs.map((slug) => ({ source: `/${slug}`, destination: `/${slug}/index.html` })))
    for (const rewrite of classPageRewrites()) expect(committedVercel.rewrites, rewrite.source).toContainEqual(rewrite)
    for (const slug of withheldSlugs) expect(committedVercel.rewrites.some((rewrite) => rewrite.source === `/${slug}`)).toBe(false)

    for (const source of ['/warrior', '/paladin', '/build', '/emberville', '/wow-forever-paladin-talents', '/wow-forever-warrior-builds']) {
      expect(committedVercel.rewrites.map((rewrite) => rewrite.source)).toContain(source)
    }
    expect(committedVercel.redirects.map((redirect) => redirect.source)).toEqual([
      '/:path*',
      '/wow-forever-paladin-beta',
      '/',
      '/wow-forever-holy-paladin-build',
    ])
    expect(committedVercel.headers).toContainEqual({
      source: '/build',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
    })
  })

  it('only ever generates paths that a published class declares', () => {
    const declared = new Set(PUBLISHED_CLASSES.flatMap((classDef) => classDef.pages.map((page) => page.slug)))

    for (const path of classPagePaths()) expect(declared.has(path.slice(1)), path).toBe(true)
  })
})
