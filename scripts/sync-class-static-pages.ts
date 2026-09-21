import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PUBLISHED_CLASSES } from '../src/data/classes'
import {
  CLASS_PAGE_MANIFEST_FILENAME,
  CLASS_PAGE_SITEMAP_MARKERS,
  classPageManifestContent,
  classPageRewrites,
  classPageShellHtml,
  classPageSitemapBlock,
  publishedClassPages,
  withClassPageSitemapBlock,
  type PublishedClassPage,
} from '../src/lib/classStaticPages'

/**
 * Writes the artifacts that have to exist before the site can serve a class page: one static shell
 * per published page, the Vercel rewrites that point the clean URL at that shell, and the sitemap
 * rows. All three come from the per-page publish gate, so publishing is a data change: satisfy a
 * `publishRequirement` and rerun this script.
 *
 * `--check` reports drift instead of writing, which is what the build runs — a build must not edit
 * the deployment config it was already read from, but it should refuse to ship stale artifacts.
 */

const root = join(import.meta.dirname, '..')
const vercelPath = join(root, 'vercel.json')
const sitemapPath = join(root, 'public/sitemap.xml')
const manifestPath = join(root, CLASS_PAGE_MANIFEST_FILENAME)
const shellPath = (slug: string) => join(root, slug, 'index.html')

interface Rewrite {
  source: string
  destination: string
}

/** Every rewrite that points at a class page shell, published or not, so stale rows are removed. */
const classRewriteSources = new Set(
  PUBLISHED_CLASSES.flatMap((classDef) => classDef.pages.map((page) => `/${page.slug}`)),
)

const readVercel = async () => readFile(vercelPath, 'utf8')

const parseRewrites = (config: string): Rewrite[] => (JSON.parse(config) as { rewrites: Rewrite[] }).rewrites

/**
 * Replaces the class-page rewrites in place, keeping every hand-written entry — and the rest of the
 * file — byte for byte. A whole-file `JSON.stringify` would reformat the redirects and headers too.
 */
function withClassPageRewrites(config: string, rewrites: Rewrite[]): string {
  const opening = config.indexOf('"rewrites": [')
  if (opening === -1) throw new Error('vercel.json has no rewrites array.')
  const closing = config.indexOf('\n  ]', opening) !== -1 ? config.indexOf('\n  ]', opening) : config.indexOf(']', opening)
  if (closing === -1) throw new Error('vercel.json has no rewrites array terminator.')

  const kept = parseRewrites(config.slice(0, closing) + '\n  ]\n}').filter((rewrite) => !classRewriteSources.has(rewrite.source))
  const rows = [...kept, ...rewrites].map((rewrite, index, all) => `    { "source": ${JSON.stringify(rewrite.source)}, "destination": ${JSON.stringify(rewrite.destination)} }${index === all.length - 1 ? '' : ','}`)
  const body = `"rewrites": [\n${rows.join('\n')}\n  ]`

  return `${config.slice(0, opening)}${body}${config.slice(closing + '\n  ]'.length)}`
}

const expectedShell = (entry: PublishedClassPage) => classPageShellHtml(entry.classDef, entry.page)

/** Everything the generator would change, as human-readable lines. Empty means in sync. */
async function drift(): Promise<string[]> {
  const published = publishedClassPages()
  const publishedSlugs = new Set(published.map(({ page }) => page.slug))
  const problems: string[] = []

  for (const entry of published) {
    const file = shellPath(entry.page.slug)
    if (!existsSync(file)) problems.push(`missing shell ${entry.page.slug}/index.html`)
    else if ((await readFile(file, 'utf8')) !== expectedShell(entry)) problems.push(`stale shell ${entry.page.slug}/index.html`)
  }
  for (const classDef of PUBLISHED_CLASSES) {
    for (const page of classDef.pages) {
      if (!publishedSlugs.has(page.slug) && existsSync(join(root, page.slug))) problems.push(`withheld page ${page.slug}/ is still on disk`)
    }
  }

  const sitemap = await readFile(sitemapPath, 'utf8')
  if (withClassPageSitemapBlock(sitemap) !== sitemap) problems.push('stale class page rows in public/sitemap.xml')

  const config = await readVercel()
  if (withClassPageRewrites(config, classPageRewrites()) !== config) problems.push('stale class page rewrites in vercel.json')

  if (!existsSync(manifestPath)) problems.push(`missing ${CLASS_PAGE_MANIFEST_FILENAME}`)
  else if ((await readFile(manifestPath, 'utf8')) !== classPageManifestContent()) problems.push(`stale ${CLASS_PAGE_MANIFEST_FILENAME}`)

  return problems
}

async function write(): Promise<void> {
  const published = publishedClassPages()
  const publishedSlugs = new Set(published.map(({ page }) => page.slug))

  for (const entry of published) {
    await mkdir(join(root, entry.page.slug), { recursive: true })
    await writeFile(shellPath(entry.page.slug), expectedShell(entry))
    console.log(`Wrote ${entry.page.slug}/index.html.`)
  }

  for (const classDef of PUBLISHED_CLASSES) {
    for (const page of classDef.pages) {
      // A page that stopped publishing must stop shipping: the shell is the URL.
      if (!publishedSlugs.has(page.slug) && existsSync(join(root, page.slug))) {
        await rm(join(root, page.slug), { recursive: true })
        console.log(`Removed withheld ${page.slug}/.`)
      }
    }
  }

  await writeFile(sitemapPath, withClassPageSitemapBlock(await readFile(sitemapPath, 'utf8'), classPageSitemapBlock()))
  console.log(`Updated the ${CLASS_PAGE_SITEMAP_MARKERS.start} block in public/sitemap.xml.`)

  await writeFile(vercelPath, withClassPageRewrites(await readVercel(), classPageRewrites()))
  console.log('Updated the class page rewrites in vercel.json.')

  await writeFile(manifestPath, classPageManifestContent())
  console.log(`Wrote ${CLASS_PAGE_MANIFEST_FILENAME} for vite.config.ts.`)
}

const problems = await drift()
if (process.argv.includes('--check')) {
  if (problems.length > 0) {
    console.error(`Class page artifacts are out of date (${problems.length}):\n${problems.map((problem) => `  - ${problem}`).join('\n')}\nRun \`npm run classes:sync\`.`)
    process.exit(1)
  }
  console.log('Class page artifacts match the publish gate.')
} else {
  await write()
  console.log(problems.length > 0 ? `Regenerated ${problems.length} out-of-date artifact(s).` : 'Class page artifacts already matched the publish gate.')
}
