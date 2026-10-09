/**
 * Read-only production gate for the public pages we depend on most.
 * Run after the exact GitHub/Vercel deployment succeeds: npm run smoke:production
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DATA_VERSION, removedPaladinTalents, talents } from '../src/data/talents'
import { hunterClass } from '../src/data/classes/hunter'
import { warriorClass } from '../src/data/classes/warrior'
import type { ClassDefinition } from '../src/lib/classPage'
import { classBuildPlannerHref } from '../src/lib/archivedClassBuild'
import { protectionPlannerHref } from '../src/data/protectionCurrentRoute'
import { BETA_PATCH_REVIEW } from '../src/data/betaPatchReview'

const APEX = 'https://buildforgetools.com'
const WWW = 'https://www.buildforgetools.com'
const REQUIRED_PATHS = ['/paladin', '/wow-forever-paladin-talents', '/hunter', '/wow-forever-hunter-pvp-build', '/warrior', '/wow-forever-warrior-pvp-build', '/wow-forever-protection-paladin-leveling-build'] as const
const CURRENT_CLASSES = [hunterClass, warriorClass]
const PALADIN_BUILD = DATA_VERSION.replace('wow_forever_beta_', '')
const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string, options?: { contentType?: string }) => { window: { document: Document; close(): void } }
}

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>
export type SmokeReport = { sitemapCount: number; pagesChecked: number; apiChecks: number; deepLink?: string; deepLinks: string[]; issues: string[] }

function parseSitemap(xml: string): Map<string, string> {
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  try {
    if (dom.window.document.querySelector('parsererror')) throw new Error('Sitemap XML is invalid')
    const result = new Map<string, string>()
    for (const node of Array.from(dom.window.document.querySelectorAll('url > loc'))) {
      const raw = node.textContent?.trim() ?? ''
      const url = new URL(raw)
      if (url.origin !== APEX || url.search || url.hash) throw new Error(`Sitemap URL must use the apex host without query or fragment: ${raw}`)
      if (result.has(url.pathname)) throw new Error(`Duplicate sitemap path: ${url.pathname}`)
      result.set(url.pathname, url.href)
    }
    if (!result.size) throw new Error('Sitemap contains no URLs')
    return result
  } finally {
    dom.window.close()
  }
}

async function request(fetchImpl: Fetcher, url: string, issues: string[], label: string, init: RequestInit = {}): Promise<Response | undefined> {
  try {
    const headers = new Headers(init.headers)
    headers.set('User-Agent', 'BuildForgeTools-Post-Deploy-Smoke/1.0')
    headers.set('Cache-Control', 'no-cache')
    return await fetchImpl(url, {
      ...init,
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers,
    })
  } catch (error) {
    issues.push(`${label}: ${error instanceof Error ? error.message : String(error)}`)
    return undefined
  }
}

async function htmlDocument(fetchImpl: Fetcher, url: string, issues: string[], label: string): Promise<{ doc: Document; close: () => void } | undefined> {
  const response = await request(fetchImpl, url, issues, label)
  if (!response) return undefined
  if (response.status !== 200) {
    issues.push(`${label}: expected HTTP 200, got HTTP ${response.status}`)
    return undefined
  }
  if (!(response.headers.get('content-type') ?? '').toLowerCase().includes('text/html')) {
    issues.push(`${label}: expected text/html, got ${response.headers.get('content-type') ?? '(missing content-type)'}`)
    return undefined
  }
  const dom = new JSDOM(await response.text())
  return { doc: dom.window.document, close: () => dom.window.close() }
}

async function checkRedirect(fetchImpl: Fetcher, source: string, destination: string, label: string, issues: string[]): Promise<void> {
  const response = await request(fetchImpl, source, issues, label)
  if (!response) return
  const location = response.headers.get('location')
  const resolved = location ? new URL(location, source).href : '(no Location header)'
  if (![301, 308].includes(response.status) || resolved !== destination) {
    issues.push(`${label}: expected permanent 301/308 redirect to ${destination}, got HTTP ${response.status}${location ? ` → ${resolved}` : ''}`)
  }
}

function sameMembers(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && new Set(actual).size === expected.length
    && expected.every(id => actual.includes(id))
}

function checkMetadata(doc: Document, url: string, label: string, issues: string[]) {
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '(missing)'
  const og = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? '(missing)'
  if (canonical !== url) issues.push(`${label}: canonical expected ${url}, got ${canonical}`)
  if (og !== url) issues.push(`${label}: og:url expected ${url}, got ${og}`)
}

function checkPaladinIndex(doc: Document, issues: string[]) {
  const index = doc.querySelector('.guide-talent-index')
  const nodes = Array.from(index?.querySelectorAll('[data-talent-id]') ?? [])
  const currentIds = nodes.filter(node => !node.classList.contains('removed')).map(node => node.getAttribute('data-talent-id') ?? '')
  const removed = nodes.filter(node => node.classList.contains('removed'))
  const removedIds = removed.map(node => node.getAttribute('data-talent-id') ?? '')
  const labelsMatch = removedPaladinTalents.every(talent => {
    const node = removed.find(node => node.getAttribute('data-talent-id') === talent.id)
    return node?.textContent?.includes(talent.currentBetaAvailability === 'removed_official' ? 'Removed Sep 24' : 'Client-confirmed removal')
  })
  if (!index?.textContent?.includes(PALADIN_BUILD) || !sameMembers(currentIds, talents.map(talent => talent.id))
    || !sameMembers(removedIds, removedPaladinTalents.map(talent => talent.id)) || !labelsMatch) {
    issues.push('Paladin Talents: expected current dataset index with exact current and marked removed IDs')
  }
}

function localUrl(raw: string, base: string): URL | undefined {
  try { return new URL(raw, base) } catch { return undefined }
}

function checkProtectionRoute(doc: Document, issues: string[]) {
  const route = doc.querySelector('section[aria-label="Beta leveling snapshot"]')
  const copy = route?.textContent?.toLowerCase() ?? ''
  if (!['level 20', '11 points', '0/11/0', 'level 30', '0/21/0', 'editorial', 'complete calculator', PALADIN_BUILD.split('.').at(-1)!].every(part => copy.includes(part))) {
    issues.push('Protection Leveling: missing current editorial Level 20/30 route and current calculator structure')
  }
  const links = Array.from(route?.querySelectorAll('a[href]') ?? []).map(anchor => localUrl(anchor.getAttribute('href')!, APEX))
  for (const level of [20, 30] as const) {
    const expected = new URL(protectionPlannerHref(level), APEX)
    if (!links.some(url => url?.origin === APEX && url.pathname === expected.pathname
      && url.hash === expected.hash && url.searchParams.get('level') === String(level)
      && url.searchParams.get('id') === expected.searchParams.get('id'))) {
      issues.push(`Protection Leveling: missing exact Level ${level} calculator deep link`)
    }
  }
}

function checkCurrentCalculator(doc: Document, classDef: ClassDefinition, label: string, issues: string[]) {
  const calculator = doc.querySelector('#class-calculator')
  if (!calculator) issues.push(`${label}: missing prerendered #class-calculator target`)
  if (!doc.querySelector(`main[data-class="${classDef.id}"][data-intent-calculator="true"]`)) issues.push(`${label}: missing active calculator marker`)
  const names = Array.from(calculator?.querySelectorAll('.class-talent-main[aria-label]') ?? [])
    .map(node => (node.getAttribute('aria-label') ?? '').replace(/^Add rank to /, ''))
  if (!doc.body.textContent?.includes(classDef.verifiedBuild) || !sameMembers(names, classDef.talents.map(talent => talent.name))) {
    issues.push(`${label}: missing current reviewed ${classDef.name} dataset`)
  }
  const activeMode = calculator?.querySelector('.class-levels button.active')?.textContent ?? ''
  if (!/Level 30/.test(activeMode) || !/21\s*points/.test(activeMode)) issues.push(`${label}: missing default Level 30 / 21-point planning mode`)
}

async function checkClassDeepLink(fetchImpl: Fetcher, doc: Document, classDef: ClassDefinition, report: SmokeReport) {
  const page = classDef.pages.find(page => page.kind === 'pvp')
  const build = classDef.builds.find(build => build.id === page?.primaryBuildId)
  const expected = build ? new URL(classBuildPlannerHref(classDef, build), APEX) : undefined
  const href = Array.from(doc.querySelectorAll('a[href]')).map(anchor => localUrl(anchor.getAttribute('href')!, APEX)).find(url => expected && url?.origin === APEX
    && url.pathname === classDef.plannerPath && url.searchParams.get('level') === String(build!.level)
    && url.searchParams.get('dataset') === classDef.verifiedBuild && url.searchParams.get('build') === expected.searchParams.get('build')
    && !!url.searchParams.get('build') && url.hash === expected.hash)
  if (!href || build?.level !== 30 || build.points !== 21) {
    report.issues.push(`${classDef.name} PvP: missing reviewed Level 30 current-dataset calculator link`)
    return
  }
  const label = `${classDef.name} calculator deep link`
  const target = await htmlDocument(fetchImpl, `${href.origin}${href.pathname}${href.search}`, report.issues, label)
  if (target) {
    const issueCount = report.issues.length
    checkMetadata(target.doc, `${APEX}${classDef.plannerPath}`, label, report.issues)
    checkCurrentCalculator(target.doc, classDef, label, report.issues)
    if (report.issues.length === issueCount) {
      report.deepLinks.push(href.href)
      if (classDef.id === 'hunter') report.deepLink = href.href
    }
    target.close()
  }
}

/** This explanation query reads version metadata; it never saves or migrates a build. */
async function checkExplainApi(fetchImpl: Fetcher, report: SmokeReport) {
  const inputs = [
    { classId: 'paladin', currentDataVersion: DATA_VERSION, sourceDataVersion: DATA_VERSION, sourceUrl: BETA_PATCH_REVIEW.officialSource },
    ...CURRENT_CLASSES.flatMap(classDef => [classDef.dataVersion, classDef.historicalSnapshots![0].dataVersion].map(sourceDataVersion => ({
      classId: classDef.id, currentDataVersion: classDef.dataVersion, sourceDataVersion,
      sourceUrl: `https://wago.tools/db2/TraitNode/csv?build=${classDef.verifiedBuild}`,
    }))),
  ]
  for (const { sourceUrl, ...input } of inputs) {
    const label = `ForgePilot ${input.classId} ${input.sourceDataVersion === input.currentDataVersion ? 'current' : 'historical'} explanation`
    const response = await request(fetchImpl, `${APEX}/api/forge-pilot-explain`, report.issues, label, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: APEX }, body: JSON.stringify(input),
    })
    report.apiChecks++
    if (!response) continue
    if (response.status !== 200) { report.issues.push(`${label}: expected HTTP 200, got HTTP ${response.status}`); continue }
    if (!(response.headers.get('content-type') ?? '').includes('application/json')) { report.issues.push(`${label}: expected application/json`); continue }
    try {
      const body = await response.json() as Record<string, unknown>
      const expectedStatus = input.sourceDataVersion === input.currentDataVersion ? 'same_dataset' : 'needs_review'
      if (body.status !== expectedStatus || body.patchStatus !== 'structure_reviewed' || body.sourceUrl !== sourceUrl
        || typeof body.explanation !== 'string' || !body.explanation.trim() || !response.headers.get('cache-control')?.includes('no-store')) {
        report.issues.push(`${label}: incorrect reviewed-version response`)
      }
    } catch { report.issues.push(`${label}: invalid JSON response`) }
  }
}

/** Checks listed sitemap pages, then queries the read-only version-explanation endpoint. */
export async function checkProductionDeployment(fetchImpl: Fetcher = fetch): Promise<SmokeReport> {
  const issues: string[] = []
  const report: SmokeReport = { sitemapCount: 0, pagesChecked: 0, apiChecks: 0, deepLinks: [], issues }
  const sitemapResponse = await request(fetchImpl, `${APEX}/sitemap.xml`, issues, 'Sitemap')
  if (!sitemapResponse) return report
  if (sitemapResponse.status !== 200) { issues.push(`Sitemap: expected HTTP 200, got HTTP ${sitemapResponse.status}`); return report }
  let sitemap: Map<string, string>
  try { sitemap = parseSitemap(await sitemapResponse.text()) }
  catch (error) { issues.push(`Sitemap: ${error instanceof Error ? error.message : String(error)}`); return report }
  report.sitemapCount = sitemap.size
  for (const path of REQUIRED_PATHS) if (!sitemap.has(path)) issues.push(`Sitemap is missing required page: ${path}`)

  const homepage = await htmlDocument(fetchImpl, `${APEX}/`, issues, 'Apex homepage')
  homepage?.close()
  await checkRedirect(fetchImpl, `${WWW}/`, `${APEX}/`, 'www homepage', issues)
  const innerPath = sitemap.get('/wow-forever-hunter-pvp-build')
  if (innerPath) await checkRedirect(fetchImpl, `${WWW}${new URL(innerPath).pathname}`, innerPath, 'www inner page', issues)

  for (const path of REQUIRED_PATHS) {
    const url = sitemap.get(path)
    if (!url) continue
    const page = await htmlDocument(fetchImpl, url, issues, path)
    if (!page) continue
    report.pagesChecked++
    checkMetadata(page.doc, url, path, issues)
    if (path === '/paladin' && (!page.doc.querySelector('#calculator') || !page.doc.body.textContent?.includes(PALADIN_BUILD))) issues.push('Paladin calculator: missing current reviewed dataset')
    if (path === '/wow-forever-paladin-talents') checkPaladinIndex(page.doc, issues)
    if (path === '/wow-forever-protection-paladin-leveling-build') checkProtectionRoute(page.doc, issues)
    const calculator = CURRENT_CLASSES.find(classDef => classDef.plannerPath === path)
    if (calculator) checkCurrentCalculator(page.doc, calculator, path, issues)
    const pvp = CURRENT_CLASSES.find(classDef => classDef.pages.some(candidate => candidate.kind === 'pvp' && `/${candidate.slug}` === path))
    if (pvp) await checkClassDeepLink(fetchImpl, page.doc, pvp, report)
    page.close()
  }
  await checkExplainApi(fetchImpl, report)
  return report
}

async function main() {
  const report = await checkProductionDeployment()
  for (const issue of report.issues) console.error(`FAIL: ${issue}`)
  console.log(`${report.issues.length ? 'FAIL' : 'PASS'}: post-deploy smoke checked ${report.pagesChecked} critical pages from ${report.sitemapCount} sitemap URLs${report.deepLinks.length ? `; ${report.deepLinks.length} calculator deep links resolved` : ''}; ${report.apiChecks} version-explanation API checks`)
  if (report.issues.length) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(`FAIL: post-deploy smoke: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
