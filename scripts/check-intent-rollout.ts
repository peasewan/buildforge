/**
 * Audit a visual-prerendered build against the preserved pre-rollout dist.
 * npx tsx scripts/check-intent-rollout.ts --baseline /path/to/baseline/dist --dist dist --output /tmp/intent-audit.json
 * This is a static release gate; browser interaction/overflow review remains separate.
 */
import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ledger from '../docs/intent-page-rollout.json'
import { EXPERIENCE_PATHS } from '../src/experiences/rollout'
import { PUBLISHED_CLASSES } from '../src/data/classes'
import { talents as paladinTalents } from '../src/data/talents'
import { pageForPath } from '../src/lib/routes'
import { canIncrementPlannerTalent, decodePlannerBuild, encodePlannerBuild, totalPlannerPoints, type PlannerBuild } from '../src/lib/talentPlanner'

// jsdom is already a dev dependency. Keep this small typed boundary without adding @types/jsdom.
const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string, options?: { includeNodeLocations?: boolean; contentType?: string }) => {
    window: { document: Document; close(): void }
    nodeLocation(node: Node): { startOffset: number; endOffset: number } | null
  }
}
const ORIGIN = 'https://buildforgetools.com'
const project = fileURLToPath(new URL('../', import.meta.url))
const normalize = (path: string) => path.replace(/\/+$/, '') || '/'
const isProtected = (path: string) => path.includes('paladin')

interface PageSnapshot {
  title: string[]
  H1: string[]
  canonical: string[]
  robots: string[]
  root: string | null
  links: string[]
  ids: string[]
  assets: string[]
  intentKinds: string[]
  calculator: boolean
  legacyPaths: string[]
}

function snapshot(html: string): PageSnapshot {
  const dom = new JSDOM(html, { includeNodeLocations: true })
  const doc = dom.window.document
  const elements = (selector: string) => Array.from(doc.querySelectorAll(selector))
  const attrs = (selector: string, attr: string) => elements(selector).map((el) => el.getAttribute(attr) ?? '')
  const root = doc.getElementById('root')
  const location = root && dom.nodeLocation(root)
  const result: PageSnapshot = {
    title: elements('title').map((el) => el.textContent ?? ''),
    H1: elements('h1').map((el) => el.textContent ?? ''),
    canonical: attrs('link[rel="canonical"]', 'href'),
    robots: attrs('meta[name="robots"]', 'content'),
    // Compare original bytes, not a browser's normalized serialization.
    root: location ? html.slice(location.startOffset, location.endOffset) : null,
    links: attrs('a[href], area[href]', 'href'),
    ids: [...attrs('[id]', 'id'), ...attrs('a[name]', 'name')],
    assets: [
      ...attrs('[src]', 'src'),
      ...attrs('link[rel="stylesheet"], link[rel="icon"], link[rel="preload"], link[rel="modulepreload"]', 'href'),
      ...attrs('[poster]', 'poster'),
      ...attrs('[srcset]', 'srcset').flatMap((value) => value.split(',').map((part) => part.trim().split(/\s+/)[0])),
      ...attrs('[style]', 'style').flatMap(cssUrls),
    ].filter(Boolean),
    intentKinds: attrs('[data-experience-kind]', 'data-experience-kind'),
    calculator: Boolean(doc.querySelector('[data-intent-calculator="true"]')),
    legacyPaths: attrs('[data-intent-experience]', 'data-intent-experience'),
  }
  dom.window.close()
  return result
}

function compareSnapshots(current: PageSnapshot, baseline: PageSnapshot, frozenPage: boolean): string[] {
  const issues: string[] = []
  for (const field of ['title', 'H1', 'canonical', 'robots'] as const) {
    if (JSON.stringify(current[field]) !== JSON.stringify(baseline[field])) issues.push(`${field} changed`)
    // No robots tag means default indexing; preserving its absence is part of the freeze.
    if (field !== 'robots' && (current[field].length !== 1 || !current[field][0])) issues.push(`expected one nonempty ${field}`)
  }
  if (!current.root) issues.push('missing rendered root')
  if (frozenPage) {
    if (!baseline.root) issues.push('baseline missing rendered root')
    if (current.root !== baseline.root) issues.push('frozen root markup changed')
    if (JSON.stringify(current.links) !== JSON.stringify(baseline.links)) issues.push('frozen links changed')
  }
  return issues
}

export function comparePageHtml(current: string, baseline: string, protectedPage: boolean, enabled = false): string[] {
  return compareSnapshots(snapshot(current), snapshot(baseline), protectedPage || !enabled)
}

export function partitionAssetIssues(current: string[], baseline: string[], enabled: boolean, protectedPage: boolean) {
  const previous = new Set(baseline)
  const warning = (issue: string) => !enabled && !protectedPage && previous.has(issue)
  return { issues: current.filter((issue) => !warning(issue)), warnings: current.filter(warning) }
}

function cssUrls(css: string): string[] {
  return [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((match) => match[1].trim())
}

function sitemap(directory: string): Map<string, string> {
  const xml = readFileSync(resolve(directory, 'sitemap.xml'), 'utf8')
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  const result = new Map<string, string>()
  for (const node of Array.from(dom.window.document.querySelectorAll('url'))) {
    const url = new URL(node.querySelector('loc')?.textContent ?? '')
    if (url.origin !== ORIGIN || url.search || url.hash) throw new Error(`Unexpected sitemap URL: ${url.href}`)
    if (result.has(url.pathname)) throw new Error(`Duplicate sitemap URL: ${url.pathname}`)
    result.set(url.pathname, node.querySelector('lastmod')?.textContent ?? '')
  }
  dom.window.close()
  return result
}

export function calculatorLinkIssues(url: URL): string[] {
  if (!url.searchParams.has('build') && !url.searchParams.has('level')) return []
  const path = normalize(url.pathname)
  const classDef = PUBLISHED_CLASSES.find((candidate) => candidate.plannerPath === path)
  const paladin = path === '/paladin' || path === '/build' || path === '/'
  if (!classDef && !paladin) return ['calculator parameters target a non-calculator page']
  const issues: string[] = []
  const level = url.searchParams.get('level')
  const mode = classDef?.plannerModes.find((candidate) => candidate.level === Number(level))
  if (level !== null && (!classDef || !mode)) issues.push('unsupported calculator level')
  const cap = mode?.points ?? classDef?.plannerModes[0]?.points ?? 51
  const talents = classDef?.talents ?? paladinTalents
  const branches = classDef?.branches ?? ['holy', 'protection', 'retribution']
  const code = url.searchParams.get('build')
  if (code !== null) {
    // Both calculators restore local storage when the build parameter is falsy.
    if (code === '') issues.push('empty calculator build would restore saved state')
    const decoded = decodePlannerBuild(code, talents)
    if (encodePlannerBuild(decoded) !== code) issues.push('calculator build does not round-trip exactly')
    if (totalPlannerPoints(decoded) > cap) issues.push('calculator allocation exceeds selected point budget')
    const reconstructed: PlannerBuild = {}
    let progressed = true
    while (progressed) {
      progressed = false
      for (const talent of talents) {
        if ((reconstructed[talent.id] ?? 0) < (decoded[talent.id] ?? 0)
          && canIncrementPlannerTalent(reconstructed, talent, talents, { branches, pointCap: cap })) {
          reconstructed[talent.id] = (reconstructed[talent.id] ?? 0) + 1
          progressed = true
        }
      }
    }
    if (encodePlannerBuild(reconstructed) !== encodePlannerBuild(decoded)) issues.push('calculator allocation violates talent prerequisites or budget')
    if (classDef && pageForPath(path, url.search).robots !== 'noindex, follow') issues.push('shared calculator URL is not noindex')
  }
  return issues
}

interface PageReport {
  path: string
  enabled: boolean
  protected: boolean
  frozen: boolean
  checks: string[]
  issues: string[]
  warnings: string[]
  linksChecked: number
  assetsChecked: number
}

function run() {
  const args = process.argv.slice(2)
  const options = new Map<string, string>()
  for (let index = 0; index < args.length; index += 2) {
    if (!['--baseline', '--dist', '--output'].includes(args[index]) || !args[index + 1] || args[index + 1].startsWith('--')) {
      throw new Error('Usage: tsx scripts/check-intent-rollout.ts --baseline /baseline/dist [--dist dist] [--output report.json]')
    }
    options.set(args[index], args[index + 1])
  }
  const baselineArgument = options.get('--baseline')
  if (!baselineArgument) throw new Error('--baseline is required: pass the preserved pre-rollout dist directory explicitly')
  const baselineDir = resolve(baselineArgument)
  const currentDir = resolve(options.get('--dist') ?? resolve(project, 'dist'))
  if (baselineDir === currentDir) throw new Error('Baseline and candidate dist must be different directories')
  for (const [label, directory] of [['Baseline', baselineDir], ['Candidate', currentDir]]) {
    if (!existsSync(directory) || !statSync(directory).isDirectory()) throw new Error(`${label} dist directory does not exist: ${directory}`)
  }
  const baseline = sitemap(baselineDir)
  const current = sitemap(currentDir)
  const issues: string[] = []
  const sameSet = (left: Iterable<string>, right: Iterable<string>) => JSON.stringify([...left].sort()) === JSON.stringify([...right].sort())
  if (baseline.size !== 150 || current.size !== 150 || !sameSet(baseline.keys(), current.keys())) issues.push('Sitemap must preserve the exact 150 baseline paths')
  const ledgerPaths = ledger.pages.map((page) => page.path)
  if (new Set(ledgerPaths).size !== 150 || !sameSet(ledgerPaths, current.keys())) issues.push('Ledger must cover every sitemap path exactly once')
  const enabled = new Set(EXPERIENCE_PATHS)
  if (enabled.size !== EXPERIENCE_PATHS.length || enabled.size > 128) issues.push('Enabled allowlist must contain at most 128 unique paths')
  const protectedPaths = [...baseline.keys()].filter(isProtected)
  if (protectedPaths.length !== 22) issues.push('Expected exactly 22 protected Paladin paths')
  for (const path of enabled) {
    if (!current.has(path) || isProtected(path)) issues.push(`Forbidden enabled path: ${path}`)
  }
  for (const page of ledger.pages) {
    if (isProtected(page.path) && (page.status !== 'protected' || page.batch !== null)) issues.push(`Protected ledger status/batch changed: ${page.path}`)
  }
  const pages: PageReport[] = []
  const snapshots = new Map<string, PageSnapshot>()
  const load = (path: string): PageSnapshot => {
    // /build is an established noindex rewrite to the protected Paladin calculator.
    const normalized = path === '/build' ? '/paladin' : normalize(path)
    if (!snapshots.has(normalized)) snapshots.set(normalized, snapshot(readFileSync(resolve(currentDir, `.${normalized}`, 'index.html'), 'utf8')))
    return snapshots.get(normalized)!
  }
  const assetCache = new Map<string, string[]>()
  const assetIssues = (raw: string, base: string, directory: string): string[] => {
    const url = new URL(raw, base)
    if (url.origin !== ORIGIN) return []
    const key = `${directory}:${url.href}`
    if (assetCache.has(key)) return assetCache.get(key)!
    const failures: string[] = []
    assetCache.set(key, failures)
    const file = resolve(directory, `.${decodeURIComponent(url.pathname)}`)
    if (!file.startsWith(`${directory}${sep}`) || !existsSync(file) || !statSync(file).isFile()) failures.push(`missing local asset: ${url.pathname}`)
    else if (url.pathname.endsWith('.css')) for (const nested of cssUrls(readFileSync(file, 'utf8'))) failures.push(...assetIssues(nested, url.href, directory))
    return failures
  }
  for (const path of current.keys()) {
    const page: PageReport = { path, enabled: enabled.has(path), protected: isProtected(path), frozen: isProtected(path) || !enabled.has(path), checks: [], issues: [], warnings: [], linksChecked: 0, assetsChecked: 0 }
    pages.push(page)
    try {
      const now = load(path)
      const before = snapshot(readFileSync(resolve(baselineDir, `.${path}`, 'index.html'), 'utf8'))
      page.issues.push(...compareSnapshots(now, before, page.frozen))
      page.checks.push('baseline title/H1/canonical/robots')
      if (page.frozen) {
        if (current.get(path) !== baseline.get(path)) page.issues.push('frozen sitemap lastmod changed')
        page.checks.push('exact frozen root markup', 'frozen links', 'frozen sitemap lastmod')
      }
      const entry = ledger.pages.find((candidate) => candidate.path === path)
      const hasMarker = now.intentKinds.length > 0 || now.calculator || now.legacyPaths.length > 0
      if (page.enabled) {
        const appropriate = entry?.kind === 'calculator' ? now.calculator
          : entry?.kind === 'trust' || entry?.kind === 'emberville' ? now.legacyPaths.includes(path)
          : now.intentKinds.includes(entry?.kind ?? '')
        if (!appropriate) page.issues.push(`missing relevant intent marker for ${entry?.kind ?? 'unknown kind'}`)
        page.checks.push('relevant enabled intent marker')
      } else if (hasMarker) page.issues.push('disabled page contains an enabled intent marker')
      for (const href of now.links) {
        const url = new URL(href, `${ORIGIN}${path}`)
        if (url.origin !== ORIGIN) continue
        page.linksChecked++
        const destination = normalize(url.pathname)
        const supported = destination === '/' || destination === '/build' || current.has(destination)
        if (!supported) {
          page.issues.push(`unsupported local route: ${href}`)
          continue
        }
        const target = load(destination)
        if (url.hash && !target.ids.includes(decodeURIComponent(url.hash.slice(1)))) page.issues.push(`missing local anchor: ${href}`)
        page.issues.push(...calculatorLinkIssues(url).map((problem) => `${problem}: ${href}`))
      }
      const currentAssetIssues: string[] = []
      for (const asset of now.assets) {
        page.assetsChecked++
        currentAssetIssues.push(...assetIssues(asset, `${ORIGIN}${path}`, currentDir))
      }
      const baselineAssetIssues = before.assets.flatMap((asset) => assetIssues(asset, `${ORIGIN}${path}`, baselineDir))
      const assets = partitionAssetIssues(currentAssetIssues, baselineAssetIssues, page.enabled, page.protected)
      page.issues.push(...assets.issues)
      page.warnings.push(...new Set(assets.warnings))
      page.checks.push('local routes and anchors', 'calculator parameters and allocations', 'local assets including CSS URLs')
    } catch (error) { page.issues.push(error instanceof Error ? error.message : String(error)) }
    page.issues = [...new Set(page.issues)]
  }
  const report = {
    generatedAt: new Date().toISOString(), baselineDir, currentDir,
    sitemapPaths: current.size, enabledPages: enabled.size, protectedPages: protectedPaths.length,
    frozenPages: pages.filter((page) => page.frozen).length,
    passed: issues.length === 0 && pages.every((page) => page.issues.length === 0), issues, pages,
  }
  const output = options.get('--output')
  if (output) {
    const file = resolve(output)
    if (file === baselineDir || file.startsWith(`${baselineDir}${sep}`)) throw new Error('Refusing to write an audit report inside the protected baseline dist')
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`)
  }
  for (const issue of issues) console.error(issue)
  for (const page of pages.filter((page) => page.issues.length)) console.error(`${page.path}:\n  ${page.issues.join('\n  ')}`)
  for (const page of pages.filter((page) => page.warnings.length)) console.warn(`${page.path} (unchanged disabled-page baseline warnings):\n  ${page.warnings.join('\n  ')}`)
  console.log(`${report.passed ? 'PASS' : 'FAIL'}: ${current.size} sitemap pages; ${enabled.size} enabled; ${protectedPaths.length} protected; ${pages.filter((page) => page.issues.length).length} pages with issues; ${pages.filter((page) => page.warnings.length).length} pages with baseline warnings${output ? `; report ${resolve(output)}` : ''}`)
  if (!report.passed) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run() } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
