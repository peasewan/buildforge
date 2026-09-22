/**
 * Read-only custom-domain smoke check after deployment; does not replace browser review.
 * npx tsx scripts/check-intent-production.ts --batch 1 --output /tmp/intent-production-b01.json
 * npx tsx scripts/check-intent-production.ts --all --assets --output /tmp/intent-production-final.json
 * --origin accepts only the production domain or a loopback server for local verification.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import ledger from '../docs/intent-page-rollout.json'
import { EXPERIENCE_PATHS } from '../src/experiences/rollout'
import { comparePageHtml } from './check-intent-rollout'

const ORIGIN = 'https://buildforgetools.com'
const project = fileURLToPath(new URL('../', import.meta.url))
const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string, options?: { contentType?: string }) => {
    window: { document: Document; close(): void }
  }
}

type PageContext = { path: string; kind: string; enabled: boolean; protected: boolean }
type FetchResult = { status: number; body: string; attempts: number; contentType: string; error?: string }

export function checkProductionPage(html: string, candidate: string, page: PageContext, baseline?: string): { issues: string[]; assets: string[] } {
  // Every deployed page must match the candidate exactly, including enabled-page root and links.
  // The original pre-rollout baseline remains a separate freeze comparison below.
  const issues = comparePageHtml(html, candidate, false, false)
  if (baseline !== undefined) issues.push(...comparePageHtml(html, baseline, page.protected, page.enabled).map((issue) => `baseline: ${issue}`))
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const root = doc.querySelector('#root[data-rendered="visual"]')
  if (!root?.querySelector('h1') || !root.textContent?.trim()) issues.push('missing visual prerender root')
  const kinds = Array.from(doc.querySelectorAll('[data-experience-kind]')).map((node) => node.getAttribute('data-experience-kind'))
  const calculator = Boolean(doc.querySelector('[data-intent-calculator="true"]'))
  const legacy = Array.from(doc.querySelectorAll('[data-intent-experience]')).map((node) => node.getAttribute('data-intent-experience'))
  if (page.enabled) {
    const relevant = page.kind === 'calculator' ? calculator
      : ['trust', 'emberville'].includes(page.kind) ? legacy.includes(page.path)
      : kinds.includes(page.kind)
    if (!relevant) issues.push('missing relevant enabled intent marker')
    if (page.protected) issues.push('protected page must never be enabled')
  } else if (kinds.length || calculator || legacy.length) issues.push('disabled page contains an enabled intent marker')
  const assets = new Set<string>()
  for (const node of Array.from(doc.querySelectorAll('head script[src], head link[rel="stylesheet"], head link[rel="icon"], head link[rel="preload"], head link[rel="modulepreload"], img[src]'))) {
    const raw = node.getAttribute('src') ?? node.getAttribute('href')
    if (!raw) continue
    const url = new URL(raw, `${ORIGIN}${page.path}`)
    // Never request analytics, external images, third-party scripts or non-HTTP URLs.
    if (url.origin === ORIGIN) assets.add(`${url.pathname}${url.search}`)
  }
  dom.window.close()
  return { issues: [...new Set(issues)], assets: [...assets] }
}

export async function fetchWithRetry(url: string, method: 'GET' | 'HEAD' = 'GET', options: { attempts?: number; timeoutMs?: number; retryDelayMs?: number } = {}): Promise<FetchResult> {
  const attempts = options.attempts ?? 3
  let last: FetchResult = { status: 0, body: '', attempts: 0, contentType: '' }
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        method, redirect: 'manual', signal: AbortSignal.timeout(options.timeoutMs ?? 12_000),
        headers: {
          'User-Agent': 'BuildForgeTools-Deployment-Smoke/1.0', 'Cache-Control': 'no-cache',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
      const body = method === 'GET' ? await response.text() : ''
      last = { status: response.status, body, attempts: attempt, contentType: response.headers.get('content-type') ?? '' }
      // A redirect or permanent error must remain visible; only temporary/network errors retry.
      if (response.status !== 429 && response.status < 500) return last
    } catch (error) {
      last = { status: 0, body: '', attempts: attempt, contentType: '', error: error instanceof Error ? error.message : String(error) }
    }
    if (attempt < attempts) await delay((options.retryDelayMs ?? 500) * attempt)
  }
  return last
}

function sitemapEntries(xml: string): Map<string, string> {
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  const entries = new Map<string, string>()
  for (const node of Array.from(dom.window.document.querySelectorAll('url'))) {
    const url = new URL(node.querySelector('loc')?.textContent ?? '')
    if (url.origin !== ORIGIN || url.search || url.hash) throw new Error(`Unexpected sitemap URL: ${url.href}`)
    if (entries.has(url.pathname)) throw new Error(`Duplicate sitemap URL: ${url.pathname}`)
    entries.set(url.pathname, node.querySelector('lastmod')?.textContent ?? '')
  }
  dom.window.close()
  return entries
}

type PageReport = PageContext & { status: number; attempts: number; checks: string[]; issues: string[]; assetsChecked: number }

async function run() {
  const args = process.argv.slice(2)
  const options = new Map<string, string>()
  const flags = new Set<string>()
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    if (['--all', '--assets'].includes(argument)) flags.add(argument)
    else if (['--batch', '--output', '--baseline', '--dist', '--origin'].includes(argument) && args[index + 1] && !args[index + 1].startsWith('--')) options.set(argument, args[++index])
    else throw new Error('Usage: tsx scripts/check-intent-production.ts (--batch N | --all) [--assets] [--output report.json] [--baseline preserved-dist] [--dist dist]')
  }
  const batch = options.has('--batch') ? Number(options.get('--batch')) : undefined
  if (flags.has('--all') === (batch !== undefined) || (batch !== undefined && (!Number.isInteger(batch) || batch < 1))) throw new Error('Choose exactly one of --batch N or --all')
  const baselineDir = resolve(options.get('--baseline') ?? '/tmp/buildforge-intent-baseline-8ea3d82')
  const candidateDir = resolve(options.get('--dist') ?? resolve(project, 'dist'))
  if (baselineDir === candidateDir) throw new Error('Candidate and preserved baseline directories must differ')
  const origin = new URL(options.get('--origin') ?? ORIGIN)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)
  if (origin.origin !== ORIGIN && !(local && ['http:', 'https:'].includes(origin.protocol))) throw new Error('Use the canonical custom domain; --origin overrides are restricted to loopback test servers')
  if (origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('--origin must be a bare origin without credentials, path, query or fragment')
  const selected = ledger.pages.filter((page) => flags.has('--all') || page.batch === batch)
  if (!selected.length || (!flags.has('--all') && selected.length > 7)) throw new Error('Batch must contain one to seven ledger paths')
  const enabled = new Set(EXPERIENCE_PATHS)
  if (batch !== undefined && selected.some((page) => !enabled.has(page.path) || page.path.includes('paladin'))) throw new Error('Batch must be enabled locally and must not contain protected Paladin pages')
  const output = options.get('--output') ? resolve(options.get('--output')!) : undefined
  if (output && (output === baselineDir || output.startsWith(`${baselineDir}${sep}`) || output === candidateDir || output.startsWith(`${candidateDir}${sep}`))) throw new Error('Report output must not overwrite candidate or baseline build files')
  // Validate local inputs before any network access.
  const baselineSitemap = sitemapEntries(readFileSync(resolve(baselineDir, 'sitemap.xml'), 'utf8'))
  const candidateSitemap = sitemapEntries(readFileSync(resolve(candidateDir, 'sitemap.xml'), 'utf8'))
  const candidateHtml = new Map(selected.map((page) => [page.path, readFileSync(resolve(candidateDir, `.${page.path}`, 'index.html'), 'utf8')]))
  const baselineHtml = new Map(selected.filter((page) => page.path.includes('paladin') || !enabled.has(page.path)).map((page) => [page.path, readFileSync(resolve(baselineDir, `.${page.path}`, 'index.html'), 'utf8')]))
  const issues: string[] = []
  const pathsEqual = (left: Iterable<string>, right: Iterable<string>) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
  if (baselineSitemap.size !== 150 || !pathsEqual(baselineSitemap.keys(), candidateSitemap.keys()) || !pathsEqual(baselineSitemap.keys(), ledger.pages.map((page) => page.path))) throw new Error('Local baseline, candidate and ledger must contain the same 150 sitemap paths')
  const sitemapResponse = await fetchWithRetry(`${origin.origin}/sitemap.xml`)
  if (sitemapResponse.status !== 200) issues.push(`Sitemap returned ${sitemapResponse.status}${sitemapResponse.error ? `: ${sitemapResponse.error}` : ''}`)
  else {
    try {
      const production = sitemapEntries(sitemapResponse.body)
      if (production.size !== 150 || !pathsEqual(production.keys(), baselineSitemap.keys())) issues.push('Production sitemap does not preserve the exact 150 baseline URLs')
      const protectedPaths = [...baselineSitemap.keys()].filter((path) => path.includes('paladin'))
      if (protectedPaths.length !== 22) issues.push('Expected exactly 22 protected Paladin sitemap paths')
      for (const [path, lastmod] of candidateSitemap) {
        if (production.get(path) !== lastmod) issues.push(`Candidate sitemap lastmod mismatch: ${path}`)
      }
      for (const [path, lastmod] of baselineSitemap) {
        if ((path.includes('paladin') || !enabled.has(path)) && production.get(path) !== lastmod) issues.push(`Frozen sitemap lastmod changed: ${path}`)
      }
    } catch (error) { issues.push(`Sitemap: ${error instanceof Error ? error.message : String(error)}`) }
  }
  const assets = new Map<string, Promise<FetchResult>>()
  const pages: PageReport[] = new Array(selected.length)
  let cursor = 0
  const worker = async () => {
    while (cursor < selected.length) {
      const index = cursor++
      const entry = selected[index]
      const page: PageReport = { path: entry.path, kind: entry.kind, enabled: enabled.has(entry.path), protected: entry.path.includes('paladin'), status: 0, attempts: 0, checks: [], issues: [], assetsChecked: 0 }
      pages[index] = page
      try {
        const response = await fetchWithRetry(`${origin.origin}${page.path}`)
        page.status = response.status
        page.attempts = response.attempts
        if (response.status !== 200) {
          page.issues.push(`Expected HTTP 200, received ${response.status}${response.error ? `: ${response.error}` : ''}`)
          continue
        }
        if (!response.contentType.toLowerCase().includes('text/html')) page.issues.push(`Expected HTML content type, received ${response.contentType || '(none)'}`)
        const inspected = checkProductionPage(response.body, candidateHtml.get(page.path)!, page, baselineHtml.get(page.path))
        page.issues.push(...inspected.issues)
        page.checks.push('HTTP 200', 'candidate title/H1/canonical/robots', 'exact candidate root and links', 'one H1', 'visual prerender root', 'appropriate intent marker')
        if (baselineHtml.has(page.path)) page.checks.push('exact baseline frozen root and links')
        if (flags.has('--assets')) {
          for (const asset of inspected.assets) {
            if (!assets.has(asset)) assets.set(asset, fetchWithRetry(`${origin.origin}${asset}`, 'HEAD'))
            const result = await assets.get(asset)!
            page.assetsChecked++
            if (result.status !== 200) page.issues.push(`Asset HEAD ${result.status}: ${asset}${result.error ? ` (${result.error})` : ''}`)
          }
          page.checks.push('same-origin head and image asset HEAD requests')
        }
      } catch (error) { page.issues.push(error instanceof Error ? error.message : String(error)) }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, selected.length) }, worker))
  const report = {
    generatedAt: new Date().toISOString(), origin: origin.origin, mode: flags.has('--all') ? 'all' : `batch-${batch}`,
    baselineDir, candidateDir, passed: issues.length === 0 && pages.every((page) => page.issues.length === 0),
    scope: { html: selected.map((page) => page.path), sitemap: 'all 150 URLs', assets: flags.has('--assets') ? 'same-origin head and image references on selected pages; CSS dependencies checked by the local rollout audit' : 'not requested' },
    sitemap: {
      status: sitemapResponse.status, attempts: sitemapResponse.attempts,
      candidateLastmodPages: candidateSitemap.size,
      frozenBaselineLastmodPages: [...baselineSitemap.keys()].filter((path) => path.includes('paladin') || !enabled.has(path)).length,
      checks: ['exact 150 baseline URLs', 'all 150 candidate lastmod values', 'original baseline lastmod for every disabled or protected page'],
    },
    checkedPages: pages.length, checkedProtectedPages: pages.filter((page) => page.protected).length, uniqueAssetsChecked: assets.size,
    issues, pages,
  }
  if (output) {
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  }
  for (const issue of issues) console.error(issue)
  for (const page of pages.filter((page) => page.issues.length)) console.error(`${page.path}:\n  ${page.issues.join('\n  ')}`)
  console.log(`${report.passed ? 'PASS' : 'FAIL'}: ${report.mode}; ${pages.length} pages; ${report.checkedProtectedPages} protected; ${pages.filter((page) => page.issues.length).length} pages with issues${output ? `; report ${output}` : ''}`)
  if (!report.passed) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
