import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLISHED_CLASSES } from '../src/data/classes'
import { DISCOVERY_PAGES } from '../src/data/siteDiscovery'
import { TRUST_PAGES } from '../src/data/trustPages'
import { EMBERVILLE_PAGES } from '../src/data/emberville'
import { publishedClassPages } from '../src/lib/classStaticPages'
import type { ClassPageKind } from '../src/lib/classPage'
import { experienceEnabled } from '../src/experiences/rollout'
import baseline from '../docs/seo/paladin-frozen-baseline.json'
import vercel from '../vercel.json'
import { parseSitemap, validateSeo, type Requirement } from './seo/validate'

const project = fileURLToPath(new URL('../', import.meta.url))
const dist = resolve(project, 'dist')
const published = publishedClassPages()
const classPaths = published.map(({ page }) => `/${page.slug}`)
const selectors: Record<ClassPageKind, string> = {
  calculator: '[data-intent-calculator="true"]', buildsHub: '.ix-hub', talents: '.ix-reference', specTalents: '.ix-reference',
  specBuild: '.ix-workbench', leveling: '.ix-progression', specLeveling: '.ix-progression', aoe: '.ix-progression', comparison: '.ix-comparison', levelCap: '.ix-cap',
  pvp: '.rs-surface', specPvp: '.rs-surface', dungeon: '.rs-surface', specDungeon: '.rs-surface', tank: '.rs-surface', healing: '.rs-surface', pet: '.rs-surface', totem: '.rs-surface',
}
const surfaces: Record<ClassPageKind, string> = {
  calculator: '', buildsHub: 'build-discovery', talents: 'talent-reference', specTalents: 'talent-reference',
  specBuild: 'build-workbench', leveling: 'level-progression', specLeveling: 'level-progression', aoe: 'level-progression', comparison: 'route-comparison', levelCap: 'cap-snapshot',
  pvp: 'pvp-matchup', specPvp: 'pvp-matchup', dungeon: 'dungeon-pull', specDungeon: 'dungeon-pull', tank: 'tank-inventory', healing: 'healing-compare', pet: 'pet-support', totem: 'totem-coverage',
}
// Exact existing UI messages, scoped inside the page's intent wrapper. Missing data is not a license to fabricate an allocation.
const unavailable: Partial<Record<ClassPageKind, string[]>> = {
  comparison: ['Two reviewed build records are not yet available for comparison.'],
  specBuild: ['No reviewed allocation is available for this page.'],
}
const progression = ['A reviewed point-by-point route is not available yet.', 'This route needs a point-order review before step-by-step planning is available. The existing endpoint remains available below.']
const role = ['A role-specific legal allocation has not been published. Review the documented limitations below before choosing a supported route.']
for (const kind of ['leveling', 'specLeveling', 'aoe'] as const) unavailable[kind] = progression
for (const kind of ['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'] as const) unavailable[kind] = role
const requirements: Record<string, Requirement> = {}
for (const { classDef, page } of published) requirements[`/${page.slug}`] = {
  selector: selectors[page.kind], kind: page.kind === 'calculator' ? undefined : page.kind,
  intentShell: page.kind !== 'calculator' && experienceEnabled(`/${page.slug}`),
  surface: page.kind !== 'calculator' && experienceEnabled(`/${page.slug}`) ? surfaces[page.kind] : undefined,
  hub: `/${published.find(p => p.classDef === classDef && p.page.kind === 'buildsHub')!.page.slug}`,
  unavailableText: unavailable[page.kind],
}
for (const page of DISCOVERY_PAGES) requirements[page.path] = { selector: page.id === 'home' ? '.sd-games' : page.id === 'classes' ? '.sd-class-grid' : '.sd-build-groups' }
for (const page of [...TRUST_PAGES, ...EMBERVILLE_PAGES]) requirements[`/${page.slug}`] = { selector: `[data-intent-experience="/${page.slug}"]` }
const files = readdirSync(dist, { recursive: true, withFileTypes: true }).filter(f => f.isFile() && f.name.endsWith('.html'))
const pages: Record<string, string> = {}
for (const file of files) {
  const absolute = resolve(file.parentPath, file.name), local = relative(dist, absolute).replaceAll('\\', '/')
  const path = local === 'index.html' ? '/' : local.endsWith('/index.html') ? `/${local.slice(0, -11)}` : `/${local}`
  pages[path] = readFileSync(absolute, 'utf8')
}
const redirects = Object.fromEntries(vercel.redirects.filter(r => r.permanent && !('has' in r) && !r.source.includes(':')).map(r => [r.source, r.destination]))
const report = validateSeo({ origin: 'https://buildforgetools.com', pages, sitemap: parseSitemap(readFileSync(resolve(dist, 'sitemap.xml'), 'utf8')),
  expectedPaths: [...baseline.pages.map(p => p.path), ...classPaths, ...DISCOVERY_PAGES.map(p => p.path), ...TRUST_PAGES.map(p => `/${p.slug}`), ...EMBERVILLE_PAGES.map(p => `/${p.slug}`)],
  withheldPaths: PUBLISHED_CLASSES.flatMap(c => c.pages.map(p => `/${p.slug}`)).filter(p => !classPaths.includes(p)),
  redirects, aliases: { '/build': '/paladin' }, requirements, frozen: baseline.pages,
})
const output = resolve(dist, 'seo-report.json')
writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), baselineCommit: baseline.commit, ...report }, null, 2)}\n`)
for (const error of report.errors) console.error(error)
console.log(`${report.passed ? 'PASS' : 'FAIL'} SEO: ${report.indexablePages}/${report.expectedPages} indexable pages; ${report.sitemapPages} sitemap entries; ${report.frozenPages} frozen; ${report.errors.length} errors; ${report.warnings.length} advisory warnings. Report: ${output}`)
if (!report.passed) process.exitCode = 1
