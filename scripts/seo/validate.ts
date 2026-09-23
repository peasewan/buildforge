/** Pure rendered-artifact validation: no filesystem, clock, network or production dependencies. */
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string, options?: { contentType?: string }) => { window: { document: Document; close(): void } }
}
export interface FrozenPage { path: string; title: string; h1: string; description: string; canonical: string; robots: string | null; lastmod: string; rootSha256: string; linksSha256: string; headSeoSha256: string }
export interface Requirement { selector: string; hub?: string; kind?: string; intentShell?: boolean; surface?: string; unavailableText?: string[] }
export interface SeoInput {
  origin: string; pages: Record<string, string>; sitemap: { url: string; lastmod: string }[]
  expectedPaths: string[]; withheldPaths: string[]; redirects: Record<string, string>; aliases: Record<string, string>
  requirements: Record<string, Requirement>; frozen: FrozenPage[]
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const normalize = (path: string) => path.replace(/\/+$/, '') || '/'
const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
function inspect(html: string) {
  const dom = new JSDOM(html), d = dom.window.document
  const all = (s: string) => [...d.querySelectorAll(s)]
  const attrs = (s: string, a: string) => all(s).map(n => n.getAttribute(a) ?? '')
  const titles = all('head title').map(n => n.textContent ?? '')
  const h1s = all('h1').map(n => n.textContent ?? '')
  const descriptions = attrs('head meta[name="description"]', 'content')
  const canonicals = attrs('head link[rel="canonical"]', 'href')
  const robots = attrs('head meta[name="robots"]', 'content')
  // Effective indexing directives are case-insensitive; keep raw fingerprint fields unchanged.
  const effectiveRobots = all('head meta[name]').filter(n => ['robots', 'googlebot'].includes((n.getAttribute('name') ?? '').trim().toLowerCase())).map(n => n.getAttribute('content') ?? '')
  const links = attrs('a[href],area[href]', 'href')
  const root = d.querySelector('#root')
  const fields = { title: titles[0] ?? '', h1: h1s[0] ?? '', description: descriptions[0] ?? '', canonical: canonicals[0] ?? '', robots: robots[0] ?? null,
    rootSha256: hash(root?.innerHTML ?? ''), linksSha256: hash(JSON.stringify(links)),
    headSeoSha256: hash(JSON.stringify(all('head title,head meta,head link[rel="canonical"],head script[type="application/ld+json"]').map(n => n.outerHTML))) }
  const content = (d.querySelector('main') ?? root ?? d.body).cloneNode(true) as Element
  content.querySelectorAll('nav,footer,header,script,style,[role="navigation"]').forEach(n => n.remove())
  const words = clean(content.textContent ?? '').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
  const shingles = new Set(words.slice(0, -4).map((_, i) => words.slice(i, i + 5).join(' ')))
  return { dom, d, fields, titles, h1s, descriptions, canonicals, links, noindex: effectiveRobots.some(r => r.toLowerCase().split(/[\s,]+/).some(token => token === 'noindex' || token === 'none')), rendered: Boolean(root?.textContent?.trim()), ids: [...attrs('[id]', 'id'), ...attrs('a[name]', 'name')], shingles }
}
export function fingerprint(html: string, lastmod: string): Omit<FrozenPage, 'path'> {
  const page = inspect(html); const result = { ...page.fields, lastmod }; page.dom.window.close(); return result
}
export function parseSitemap(xml: string) {
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  const rows = [...dom.window.document.querySelectorAll('url')].map(n => ({ url: n.querySelector('loc')?.textContent ?? '', lastmod: n.querySelector('lastmod')?.textContent ?? '' }))
  dom.window.close(); return rows
}
export function validateSeo(input: SeoInput) {
  const errors: string[] = [], warnings: string[] = []
  const pages = new Map(Object.entries(input.pages).map(([path, html]) => [path, inspect(html)]))
  const sitemap = new Map<string, string>()
  for (const row of input.sitemap) {
    try {
      const url = new URL(row.url)
      if (url.origin !== input.origin || url.search || url.hash || normalize(url.pathname) !== url.pathname) errors.push(`invalid sitemap URL: ${row.url}`)
      if (sitemap.has(url.pathname)) errors.push(`duplicate sitemap URL: ${row.url}`)
      sitemap.set(url.pathname, row.lastmod)
    } catch { errors.push(`invalid sitemap URL: ${row.url}`) }
  }
  const expected = new Set(input.expectedPaths)
  for (const path of expected) {
    if (!pages.has(path)) errors.push(`missing rendered page: ${path}`)
    if (!sitemap.has(path)) errors.push(`missing sitemap entry: ${path}`)
  }
  for (const path of sitemap.keys()) {
    if (!expected.has(path)) errors.push(`unpublished sitemap entry: ${path}`)
    if (!pages.has(path)) errors.push(`missing rendered sitemap target: ${path}`)
    if (pages.get(path)?.noindex) errors.push(`noindex sitemap leak: ${path}`)
  }
  for (const path of input.withheldPaths) if (pages.has(path) || sitemap.has(path)) errors.push(`withheld artifact: ${path}`)
  const resolvePath = (path: string) => {
    const seen = new Set<string>(); let result = normalize(path)
    while (input.redirects[result]) {
      if (seen.has(result)) return undefined
      seen.add(result)
      const next = new URL(input.redirects[result], input.origin)
      if (next.origin !== input.origin) return undefined
      result = normalize(next.pathname)
    }
    return result
  }
  const inbound = new Set<string>()
  const discoveryEdges = new Map<string, Set<string>>()
  const duplicates = { canonical: new Map<string, string[]>(), title: new Map<string, string[]>(), h1: new Map<string, string[]>(), description: new Map<string, string[]>() }
  for (const [path, page] of pages) {
    if (!page.noindex) {
      if (!sitemap.has(path)) errors.push(`missing sitemap entry for indexable HTML: ${path}`)
      if (!expected.has(path)) errors.push(`unpublished indexable artifact: ${path}`)
      if (!page.rendered) errors.push(`missing rendered root content: ${path}`)
      for (const [key, values] of Object.entries({ canonical: page.canonicals, title: page.titles, h1: page.h1s, description: page.descriptions })) {
        if (values.length !== 1 || !clean(values[0] ?? '')) errors.push(`${path}: expected one nonempty ${key}`)
        const field = key as keyof typeof duplicates, value = clean(values[0] ?? '')
        if (value) duplicates[field].set(value, [...(duplicates[field].get(value) ?? []), path])
      }
      if (page.fields.canonical !== `${input.origin}${path}`) errors.push(`${path}: canonical must equal sitemap URL`)
    }
    const requirement = input.requirements[path]
    if (requirement) {
      if (requirement.intentShell) {
        const shell = page.d.querySelectorAll(`main.class-page.intent-page[data-intent-page="${requirement.kind}"]`)
        if (shell.length !== 1) errors.push(`${path}: missing intent shell for ${requirement.kind}`)
        if (page.d.querySelector('.class-document')) errors.push(`${path}: legacy class-document shell in intent artifact`)
        if (shell.length === 1 && shell[0].querySelectorAll(`[data-experience-kind="${requirement.kind}"]`).length !== 1) errors.push(`${path}: missing or duplicated intent wrapper for ${requirement.kind}`)
      }
      const wrapper = requirement.kind ? page.d.querySelector(`[data-experience-kind="${requirement.kind}"]`) : page.d
      const unavailable = requirement.unavailableText?.some(text => [...(wrapper?.querySelectorAll('p') ?? [])].some(n => clean(n.textContent ?? '') === text))
      if (!wrapper?.querySelector(requirement.selector) && !unavailable) errors.push(`${path}: missing primary module ${requirement.selector}`)
      if (requirement.surface && !unavailable && !wrapper?.querySelector(`[data-surface="${requirement.surface}"]`)) errors.push(`${path}: missing intent surface ${requirement.surface}`)
      if (unavailable) warnings.push(`${path}: explicit unavailable UI preserved`)
      if (requirement.hub && !page.links.some(href => { try { const u = new URL(href, `${input.origin}${path}`); return u.origin === input.origin && normalize(u.pathname) === requirement.hub && !u.search } catch { return false } })) errors.push(`${path}: missing class hub link ${requirement.hub}`)
    }
    for (const href of page.links) {
      try {
        const url = new URL(href, `${input.origin}${path}`)
        if (url.origin !== input.origin) continue
        const resolved = resolvePath(url.pathname)
        const alias = resolved && input.aliases[resolved]
        const targetPath = alias ?? resolved
        const target = targetPath && pages.get(targetPath)
        if (!target) { errors.push(`${path}: broken link ${href}`); continue }
        if (url.hash && !target.ids.includes(decodeURIComponent(url.hash.slice(1)))) errors.push(`${path}: broken anchor ${href}`)
        if (!alias && !url.search && target.noindex) errors.push(`${path}: noindex target ${href}`)
        if (!page.noindex && !target.noindex && !alias && !url.search && targetPath !== path) {
          inbound.add(targetPath)
          if (!discoveryEdges.has(path)) discoveryEdges.set(path, new Set())
          discoveryEdges.get(path)!.add(targetPath)
        }
      } catch { errors.push(`${path}: malformed link ${href}`) }
    }
  }
  const legacyPair = ['/wow-forever-retribution-paladin-build', '/wow-forever-retribution-paladin-leveling-build'].sort()
  for (const [field, values] of Object.entries(duplicates)) for (const [value, paths] of values) if (paths.length > 1) {
    const known = field === 'h1' && JSON.stringify([...paths].sort()) === JSON.stringify(legacyPair) && paths.every(p => input.frozen.find(f => f.path === p)?.h1 === value)
    ;(known ? warnings : errors).push(`${known ? 'frozen legacy ' : ''}duplicate ${field}: ${paths.join(', ')}`)
  }
  for (const path of expected) if (!inbound.has(path)) errors.push(`orphan: ${path}`)
  if (expected.has('/')) {
    const reachable = new Set<string>(), queue = ['/']
    for (let index = 0; index < queue.length; index++) {
      const path = queue[index]
      if (reachable.has(path)) continue
      reachable.add(path)
      queue.push(...(discoveryEdges.get(path) ?? []))
    }
    for (const path of expected) if (!reachable.has(path)) errors.push(`unreachable from /: ${path}`)
  }
  for (const frozen of input.frozen) {
    const page = pages.get(frozen.path)
    if (!page) { errors.push(`missing frozen page: ${frozen.path}`); continue }
    const actual = { ...page.fields, lastmod: sitemap.get(frozen.path) }
    for (const key of Object.keys(actual) as (keyof typeof actual)[]) if (actual[key] !== frozen[key]) errors.push(`${frozen.path}: frozen ${key} changed`)
  }
  const similarities: { left: string; right: string; jaccard: number }[] = []
  const entries = [...pages].filter(([, page]) => !page.noindex && page.shingles.size >= 20)
  for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
    const [left, a] = entries[i], [right, b] = entries[j]
    const overlap = [...a.shingles].filter(s => b.shingles.has(s)).length
    const jaccard = overlap / (a.shingles.size + b.shingles.size - overlap)
    if (jaccard >= 0.65) similarities.push({ left, right, jaccard: Math.round(jaccard * 1000) / 1000 })
  }
  similarities.sort((a, b) => b.jaccard - a.jaccard)
  if (similarities.length) warnings.push(`${similarities.length} content pairs exceed advisory 0.65 shingle overlap; editorial comparison only, not a Google quality score`)
  const report = { passed: errors.length === 0, renderedPages: pages.size, indexablePages: [...pages.values()].filter(p => !p.noindex).length, sitemapPages: sitemap.size, expectedPages: expected.size, frozenPages: input.frozen.length, errors: [...new Set(errors)], warnings, similarities: similarities.slice(0, 30) }
  pages.forEach(p => p.dom.window.close())
  return report
}
