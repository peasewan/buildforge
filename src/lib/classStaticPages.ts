import { PUBLISHED_CLASSES } from '../data/classes'
import { escapeHtml } from './html'
import {
  pageFromPublishedClasses,
  publishedClassPages as gatedClassPages,
  sitemapLastmod,
  type ClassDefinition,
  type ClassPageDefinition,
  type ClassPageKind,
} from './classPage'

/**
 * The single source for every artifact that has to know which class pages publish.
 *
 * The static shells, the Vite inputs, the Vercel rewrites, the prerender targets and the sitemap
 * rows all come from `publishedClassPages`, which reads the per-page requirement gate. Nothing here
 * names a class, a branch or a slug: satisfying a `publishRequirement` later adds a page to every
 * one of those artifacts at once, and a page whose requirement is unmet is absent from all of them.
 */

export interface PublishedClassPage {
  classDef: ClassDefinition
  page: ClassPageDefinition
}

export const CLASS_PAGE_SITEMAP_MARKERS = {
  start: '<!-- class-pages:generated -->',
  end: '<!-- /class-pages:generated -->',
} as const

/** Sitemap priorities by page kind, so the writer never sees a slug. */
const sitemapPriorities: Record<ClassPageKind, string> = {
  calculator: '1.0',
  buildsHub: '0.9',
  talents: '0.9',
  specBuild: '0.9',
  leveling: '0.8',
  specLeveling: '0.8',
  specTalents: '0.8',
  specPvp: '0.8',
  specDungeon: '0.8',
  aoe: '0.8',
  pvp: '0.8',
  dungeon: '0.8',
  levelCap: '0.8',
  comparison: '0.8',
  pet: '0.8',
  healing: '0.8',
  tank: '0.8',
  totem: '0.8',
}

/** Every page of every published class that meets its own `publishRequirements`. */
export function publishedClassPages(classes: ClassDefinition[] = PUBLISHED_CLASSES): PublishedClassPage[] {
  return gatedClassPages(classes)
}

/**
 * The one page each published class offers as its entry point: the catalogue its gate publishes.
 *
 * This is what the existing surfaces link to for discovery. A class whose catalogue is withheld
 * contributes no link at all, which is the point — the calculator is the link these surfaces would
 * rather carry, and it is exactly the page a withheld class cannot back.
 */
export function publishedClassCatalogues(classes: ClassDefinition[] = PUBLISHED_CLASSES): PublishedClassPage[] {
  return publishedClassPages(classes).filter(({ page }) => page.kind === 'talents')
}

/** The gated page a pathname resolves to, with the class that owns it. */
export function publishedClassPage(pathname: string, classes: ClassDefinition[] = PUBLISHED_CLASSES): PublishedClassPage | undefined {
  const page = pageFromPublishedClasses(pathname, classes)
  if (!page) return undefined
  // The page object is the one the registry holds, so identity is the ownership test.
  const classDef = classes.find((candidate) => candidate.pages.includes(page))
  return classDef ? { classDef, page } : undefined
}

export function classPagePath(page: ClassPageDefinition): string {
  return `/${page.slug}`
}

export function classPagePaths(classes: ClassDefinition[] = PUBLISHED_CLASSES): string[] {
  return publishedClassPages(classes).map(({ page }) => classPagePath(page))
}

/** Vite needs one HTML entry per shell, or the page never reaches `dist/`. */
export function classPageViteInputs(classes: ClassDefinition[] = PUBLISHED_CLASSES): { name: string; file: string }[] {
  return publishedClassPages(classes).map(({ classDef, page }) => ({ name: `${classDef.id}-${page.slug}`, file: `${page.slug}/index.html` }))
}

/**
 * `vite.config.ts` is its own TypeScript project, so it cannot import the class data to reach the
 * gate. It reads this generated manifest instead, and `scripts/sync-class-static-pages.ts`
 * regenerates it from the same `classPageViteInputs` the tests assert against — a stale manifest
 * fails the build before Vite reads it.
 */
export const CLASS_PAGE_MANIFEST_FILENAME = 'class-static-pages.json'

export function classPageManifestContent(classes: ClassDefinition[] = PUBLISHED_CLASSES): string {
  return `${JSON.stringify(classPageViteInputs(classes), null, 2)}\n`
}

/** Vercel serves the shell for the clean URL, exactly as the hand-written class routes do. */
export function classPageRewrites(classes: ClassDefinition[] = PUBLISHED_CLASSES): { source: string; destination: string }[] {
  return publishedClassPages(classes).map(({ page }) => ({ source: classPagePath(page), destination: `${classPagePath(page)}/index.html` }))
}

/**
 * Vercel consumes and may normalize `vercel.json` before the project's build command runs. The
 * committed config is still covered by the artifact tests and by local sync checks, but the cloud
 * build must not assume Vercel leaves its own routing source file byte-identical in the sandbox.
 */
export function shouldVerifyVercelRewrites(env: Record<string, string | undefined>): boolean {
  return env.VERCEL !== '1'
}

export function classPageSitemapBlock(classes: ClassDefinition[] = PUBLISHED_CLASSES): string {
  const rows = publishedClassPages(classes).map(({ page }) => [
    '  <url>',
    `    <loc>${escapeHtml(page.canonical)}</loc>`,
    `    <lastmod>${sitemapLastmod(page)}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    `    <priority>${sitemapPriorities[page.kind]}</priority>`,
    '  </url>',
  ].join('\n'))

  return [`  ${CLASS_PAGE_SITEMAP_MARKERS.start}`, ...rows, `  ${CLASS_PAGE_SITEMAP_MARKERS.end}`].join('\n')
}

/** Replaces the generated block in place, so the hand-written rows above it stay byte-identical. */
export function withClassPageSitemapBlock(sitemap: string, block = classPageSitemapBlock()): string {
  const { start, end } = CLASS_PAGE_SITEMAP_MARKERS
  const startIndex = sitemap.indexOf(start)
  const endIndex = sitemap.indexOf(end)
  if (startIndex !== -1 && endIndex > startIndex) {
    // The block carries its own indentation, so the marker line's is replaced rather than kept.
    const lineStart = sitemap.lastIndexOf('\n', startIndex) + 1
    return `${sitemap.slice(0, lineStart)}${block}${sitemap.slice(endIndex + end.length)}`
  }
  const closing = sitemap.lastIndexOf('</urlset>')
  if (closing === -1) throw new Error('sitemap.xml has no </urlset> to insert the class pages before.')
  return `${sitemap.slice(0, closing)}${block}\n${sitemap.slice(closing)}`
}

/** The site chrome colour, matching `index.html` and the Paladin shells. */
export const SITE_THEME_COLOR = '#090b10'
const SITE_ORIGIN = 'https://buildforgetools.com'

/** The social card this page shares, if the class ships one: page art first, class art second. */
export function classPageOgImage(classDef: Pick<ClassDefinition, 'ogImage'>, page: Pick<ClassPageDefinition, 'ogImage'>): string | undefined {
  return page.ogImage ?? classDef.ogImage
}

/** The shell the browser loads: metadata from the page record, body filled by the prerenderer. */
export function classPageShellHtml<B extends string>(classDef: ClassDefinition<B>, page: ClassPageDefinition): string {
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const canonical = escapeHtml(page.canonical)
  const ogImage = classPageOgImage(classDef, page)
  // No image is invented: a class without art gets no tag, rather than a card that 404s or shows
  // another class's art.
  const ogImageTag = ogImage ? `<meta property="og:image" content="${escapeHtml(new URL(ogImage, SITE_ORIGIN).toString())}"/>` : ''
  const classUrl = new URL(classDef.plannerPath, SITE_ORIGIN).toString()
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'BuildForgeTools', item: SITE_ORIGIN },
    { '@type': 'ListItem', position: 2, name: page.kind === 'calculator' ? page.h1 : classDef.name, item: classUrl },
    ...(page.kind === 'calculator' ? [] : [{ '@type': 'ListItem', position: 3, name: page.h1, item: page.canonical }]),
  ]
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        url: page.canonical,
        description: page.description,
        isPartOf: { '@type': 'WebSite', name: 'BuildForgeTools', url: SITE_ORIGIN },
      },
      { '@type': 'BreadcrumbList', itemListElement: breadcrumbItems },
    ],
  })

  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DDT58001FZ"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-DDT58001FZ',{page_path:window.location.pathname});</script>
<meta name="theme-color" content="${SITE_THEME_COLOR}"/><meta name="robots" content="${page.robots}"/><meta name="description" content="${description}"/><link rel="canonical" href="${canonical}"/><link rel="icon" type="image/png" href="/favicon.png"/>
<meta property="og:title" content="${title}"/><meta property="og:site_name" content="BuildForgeTools"/><meta property="og:description" content="${description}"/>${ogImageTag}<meta property="og:url" content="${canonical}"/><meta property="og:type" content="article"/>
<script type="application/ld+json">${structuredData}</script><title>${title}</title></head><body><div id="root"><!-- PAGES_PRERENDER --></div><script type="module" src="/src/main.tsx"></script></body></html>`
}
