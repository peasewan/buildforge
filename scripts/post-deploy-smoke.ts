/**
 * Read-only production gate for the public pages we depend on most.
 * Run after the exact GitHub/Vercel deployment succeeds: npm run smoke:production
 */
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const APEX = 'https://buildforgetools.com'
const WWW = 'https://www.buildforgetools.com'
const REQUIRED_PATHS = ['/paladin', '/hunter', '/wow-forever-hunter-pvp-build', '/wow-forever-protection-paladin-leveling-build'] as const
const PROTECTION_ARCHIVE_NOTICE = 'Archived September 24, 2026: Blizzard removed Improved Holy Strike from the Beta talent tree.'
const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string, options?: { contentType?: string }) => { window: { document: Document; close(): void } }
}

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>
export type SmokeReport = { sitemapCount: number; pagesChecked: number; deepLink?: string; issues: string[] }

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

async function request(fetchImpl: Fetcher, url: string, issues: string[], label: string): Promise<Response | undefined> {
  try {
    return await fetchImpl(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'BuildForgeTools-Post-Deploy-Smoke/1.0', 'Cache-Control': 'no-cache' },
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

/** Fetches the deployed sitemap first, then validates only URLs it actually lists. */
export async function checkProductionDeployment(fetchImpl: Fetcher = fetch): Promise<SmokeReport> {
  const issues: string[] = []
  const report: SmokeReport = { sitemapCount: 0, pagesChecked: 0, issues }
  const sitemapResponse = await request(fetchImpl, `${APEX}/sitemap.xml`, issues, 'Sitemap')
  if (!sitemapResponse) return report
  if (sitemapResponse.status !== 200) {
    issues.push(`Sitemap: expected HTTP 200, got HTTP ${sitemapResponse.status}`)
    return report
  }
  let sitemap: Map<string, string>
  try {
    sitemap = parseSitemap(await sitemapResponse.text())
  } catch (error) {
    issues.push(`Sitemap: ${error instanceof Error ? error.message : String(error)}`)
    return report
  }
  report.sitemapCount = sitemap.size
  for (const path of REQUIRED_PATHS) if (!sitemap.has(path)) issues.push(`Sitemap is missing required page: ${path}`)

  const homepage = await htmlDocument(fetchImpl, `${APEX}/`, issues, 'Apex homepage')
  homepage?.close()
  await checkRedirect(fetchImpl, `${WWW}/`, `${APEX}/`, 'www homepage', issues)
  const innerPath = sitemap.get('/wow-forever-hunter-pvp-build')
  if (innerPath) await checkRedirect(fetchImpl, `${WWW}${new URL(innerPath).pathname}`, innerPath, 'www inner page', issues)

  let pvpDocument: Document | undefined
  let closePvp: (() => void) | undefined
  for (const path of REQUIRED_PATHS) {
    const url = sitemap.get(path)
    if (!url) continue
    const page = await htmlDocument(fetchImpl, url, issues, path)
    if (!page) continue
    report.pagesChecked++
    const canonical = page.doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '(missing)'
    const og = page.doc.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? '(missing)'
    if (canonical !== url) issues.push(`${path}: canonical expected ${url}, got ${canonical}`)
    if (og !== url) issues.push(`${path}: og:url expected ${url}, got ${og}`)
    if (path === '/wow-forever-protection-paladin-leveling-build') {
      const notice = page.doc.querySelector('section[aria-label="Beta leveling snapshot"]')?.textContent ?? ''
      if (!notice.includes(PROTECTION_ARCHIVE_NOTICE)) issues.push('Protection Leveling: missing current archived-route notice for removed Improved Holy Strike')
    }
    if (path === '/wow-forever-hunter-pvp-build') {
      pvpDocument = page.doc
      closePvp = page.close
    } else page.close()
  }

  if (pvpDocument && sitemap.has('/hunter')) {
    const href = Array.from(pvpDocument.querySelectorAll('a[href]'))
      .map((anchor) => anchor.getAttribute('href'))
      .filter((value): value is string => !!value)
      .map((value) => new URL(value, `${APEX}/wow-forever-hunter-pvp-build`))
      .find((url) => url.origin === APEX && url.pathname === '/hunter' && url.searchParams.has('build'))
    if (!href) issues.push('Hunter PvP: no build-loaded Hunter calculator link in rendered HTML')
    else {
      report.deepLink = href.href
      const target = await htmlDocument(fetchImpl, `${href.origin}${href.pathname}${href.search}`, issues, 'Calculator deep link')
      if (target) {
        if (!target.doc.querySelector('#class-calculator')) issues.push('Calculator deep link: missing prerendered #class-calculator target')
        if (!target.doc.querySelector('[data-intent-calculator="true"]')) issues.push('Calculator deep link: missing active calculator marker')
        target.close()
      }
    }
  }
  closePvp?.()
  return report
}

async function main() {
  const report = await checkProductionDeployment()
  for (const issue of report.issues) console.error(`FAIL: ${issue}`)
  console.log(`${report.issues.length ? 'FAIL' : 'PASS'}: post-deploy smoke checked ${report.pagesChecked} critical pages from ${report.sitemapCount} sitemap URLs${report.deepLink ? '; calculator deep link resolved' : ''}`)
  if (report.issues.length) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(`FAIL: post-deploy smoke: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  })
}
