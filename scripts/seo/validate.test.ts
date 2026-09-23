import { describe, expect, it } from 'vitest'
import { fingerprint, validateSeo, type SeoInput } from './validate'
const origin = 'https://buildforgetools.com'
const html = (path: string, links: string) => `<html><head><title>Title ${path}</title><meta name="description" content="Description ${path}"><link rel="canonical" href="${origin}${path}"></head><body><div id="root"><h1>Heading ${path}</h1><p id="details">Distinct content ${path}</p>${links}</div></body></html>`
function fixture(): SeoInput {
  return { origin, pages: { '/': html('/', '<a href="/guide#details">Guide</a>'), '/guide': html('/guide', '<a href="/">Home</a>') }, sitemap: [{ url: `${origin}/`, lastmod: '2026-09-23' }, { url: `${origin}/guide`, lastmod: '2026-09-23' }], expectedPaths: ['/', '/guide'], withheldPaths: ['/withheld'], redirects: {}, aliases: {}, requirements: {}, frozen: [] }
}
const errors = (input: SeoInput) => validateSeo(input).errors.join('\n')
describe('rendered SEO release gate', () => {
  it('accepts a linked, indexable inventory', () => expect(errors(fixture())).toBe(''))
  it.each([
    ['missing canonical', /<link[^>]+>/, '', 'canonical'],
    ['empty title', /<title>.*?<\/title>/, '<title></title>', 'title'],
    ['empty H1', /<h1>.*?<\/h1>/, '<h1> </h1>', 'h1'],
    ['missing description', /<meta[^>]+>/, '', 'description'],
    ['noindex leak', /<head>/, '<head><meta name="robots" content="noindex, follow">', 'noindex'],
    ['broken route', /href="\/guide#details"/, 'href="/missing"', 'broken link'],
    ['broken anchor', /#details/, '#missing', 'broken anchor'],
  ])('rejects %s', (_label, pattern, replacement, message) => {
    const input = fixture(); input.pages['/'] = input.pages['/'].replace(pattern as RegExp, replacement as string)
    expect(errors(input)).toContain(message)
  })
  it.each(['canonical', 'title', 'h1', 'description'])('rejects duplicate %s', field => {
    const input = fixture()
    const patterns: Record<string, RegExp> = { canonical: /<link[^>]+>/, title: /<title>.*?<\/title>/, h1: /<h1>.*?<\/h1>/, description: /<meta[^>]+>/ }
    input.pages['/guide'] = input.pages['/guide'].replace(patterns[field], input.pages['/'].match(patterns[field])![0])
    expect(errors(input)).toContain(`duplicate ${field}`)
  })
  it('rejects missing sitemap and missing rendered destinations', () => {
    const input = fixture(); input.sitemap.pop(); expect(errors(input)).toContain('missing sitemap')
    delete input.pages['/guide']; expect(errors(input)).toContain('missing rendered')
  })
  it('rejects noindex linked targets and does not count self links as inbound', () => {
    const input = fixture(); input.pages['/guide'] = input.pages['/guide'].replace('<head>', '<head><meta name="robots" content="noindex">')
    expect(errors(input)).toContain('noindex target')
    const orphan = fixture(); orphan.pages['/'] = html('/', '<a href="/">Self</a>'); expect(errors(orphan)).toContain('orphan: /guide')
  })
  it('rejects withheld artifacts even when absent from sitemap', () => {
    const input = fixture(); input.pages['/withheld'] = html('/withheld', ''); expect(errors(input)).toContain('withheld artifact')
  })
  it('resolves permanent redirects, validates their anchors, and supports explicit noindex aliases', () => {
    const input = fixture(); input.redirects['/old'] = '/guide'; input.aliases['/build'] = '/guide'
    input.pages['/'] = html('/', '<a href="/old#details">Guide</a><a href="/build?build=x">Share</a>'); expect(errors(input)).toBe('')
    input.pages['/'] += '<a href="/old#missing">Broken</a>'; expect(errors(input)).toContain('broken anchor')
  })
  it('checks primary modules and class hub links', () => {
    const input = fixture(); input.requirements['/guide'] = { selector: '.ix-progression', hub: '/hub' }
    expect(errors(input)).toContain('primary module'); expect(errors(input)).toContain('class hub')
  })
  it('requires the current intent shell on migrated class pages', () => {
    const input = fixture()
    input.requirements['/guide'] = { selector: '.ix-progression', kind: 'specLeveling', intentShell: true }
    input.pages['/guide'] = input.pages['/guide'].replace('<h1>Heading /guide</h1>', '<main class="class-page intent-page" data-intent-page="specLeveling"><h1>Heading /guide</h1><section data-experience-kind="specLeveling"><div class="ix-progression">Planner</div></section></main>')
    expect(errors(input)).toBe('')
    input.pages['/guide'] = input.pages['/guide'].replace('class="class-page intent-page"', 'class="class-page class-document"')
    expect(errors(input)).toContain('missing intent shell')
    input.pages['/guide'] = input.pages['/guide'].replace('class="class-page class-document"', 'class="class-page intent-page class-document"')
    expect(errors(input)).toContain('legacy class-document shell')
    input.pages['/guide'] = input.pages['/guide'].replace('data-experience-kind="specLeveling"', 'data-experience-kind="leveling"')
    expect(errors(input)).toContain('intent wrapper')
  })
  it('compares frozen markup, links, head SEO and lastmod', () => {
    const input = fixture(); input.frozen = [{ path: '/guide', ...fingerprint(input.pages['/guide'], '2026-09-23') }]
    expect(errors(input)).toBe('')
    input.pages['/guide'] = input.pages['/guide'].replace('Distinct content', 'Changed content').replace('</head>', '<meta property="og:title" content="changed"></head>')
    input.sitemap[1].lastmod = '2026-09-24'
    expect(errors(input)).toContain('rootSha256'); expect(errors(input)).toContain('headSeoSha256'); expect(errors(input)).toContain('lastmod')
  })
  it('rejects duplicate sitemap rows and unexpected indexable artifacts', () => {
    const input = fixture(); input.sitemap.push(input.sitemap[0])
    expect(errors(input)).toContain('duplicate sitemap')
    input.pages['/unexpected'] = html('/unexpected', '')
    expect(errors(input)).toContain('unpublished indexable artifact')
  })
  it('allows unavailable messaging only within the matching intent wrapper', () => {
    const input = fixture(); input.requirements['/guide'] = { selector: '.ix-role', kind: 'pvp', unavailableText: ['No reviewed allocation.'] }
    input.pages['/guide'] += '<div data-experience-kind="pvp"><p>No reviewed allocation.</p></div>'
    expect(errors(input)).toBe('')
    input.pages['/guide'] = input.pages['/guide'].replace('data-experience-kind="pvp"', 'data-experience-kind="leveling"')
    expect(errors(input)).toContain('primary module')
  })
  it('checks frozen link order and every metadata field', () => {
    for (const [before, after, field] of [['href="/"', 'href="/#details"', 'linksSha256'], ['Title /guide', 'New title', 'title'], ['Heading /guide', 'New heading', 'h1'], ['Description /guide', 'New description', 'description']]) {
      const input = fixture(); input.frozen = [{ path: '/guide', ...fingerprint(input.pages['/guide'], '2026-09-23') }]
      input.pages['/guide'] = input.pages['/guide'].replace(before, after)
      expect(errors(input)).toContain(`frozen ${field} changed`)
    }
  })
  it('limits the legacy H1 exception to the exact frozen pair and baseline value', () => {
    const input = fixture(), paths = ['/wow-forever-retribution-paladin-build', '/wow-forever-retribution-paladin-leveling-build']
    input.pages['/'] += paths.map(p => `<a href="${p}">Paladin</a>`).join('')
    for (const path of paths) {
      input.pages[path] = html(path, '<a href="/">Home</a>').replace(`<h1>Heading ${path}</h1>`, '<h1>Frozen heading</h1>')
      input.expectedPaths.push(path); input.sitemap.push({ url: `${origin}${path}`, lastmod: '2026-09-23' })
      input.frozen.push({ path, ...fingerprint(input.pages[path], '2026-09-23') })
    }
    expect(errors(input)).toBe(''); expect(validateSeo(input).warnings.join(' ')).toContain('frozen legacy duplicate h1')
    input.pages['/guide'] = input.pages['/guide'].replace('<h1>Heading /guide</h1>', '<h1>Frozen heading</h1>')
    expect(errors(input)).toContain('duplicate h1')
  })
  it('ignores navigation in similarity reports and never turns similarity into a failure', () => {
    const input = fixture(), words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ')
    for (const path of input.expectedPaths) input.pages[path] += `<nav>${words}</nav>`
    expect(validateSeo(input).similarities).toHaveLength(0)
    for (const path of input.expectedPaths) input.pages[path] = input.pages[path].replace('</div>', `<p>${words}</p></div>`)
    expect(validateSeo(input).similarities).toHaveLength(1)
    expect(errors(input)).toBe('')
  })

  it.each([
    ['robots', 'none'], ['googlebot', 'noindex'], ['ROBOTS', 'noindex'], ['GoogleBot', 'NoIndex, follow'],
  ])('rejects effective noindex for %s=%s', (name, content) => {
    const input = fixture()
    input.pages['/guide'] = input.pages['/guide'].replace('<head>', `<head><meta name="${name}" content="${content}">`)
    const result = errors(input)
    expect(result).toContain('noindex sitemap leak: /guide')
    expect(result).toContain('noindex target /guide#details')
    expect(result).toContain('orphan: /guide')
    expect(result).toContain('orphan: /')
  })
  it('rejects a disconnected cycle even though both pages have inbound links', () => {
    const input = fixture()
    for (const [path, target] of [['/island-a', '/island-b'], ['/island-b', '/island-a']]) {
      input.pages[path] = html(path, `<a href="${target}">Other island page</a>`)
      input.expectedPaths.push(path); input.sitemap.push({ url: `${origin}${path}`, lastmod: '2026-09-23' })
    }
    const result = errors(input)
    expect(result).toContain('unreachable from /: /island-a')
    expect(result).toContain('unreachable from /: /island-b')
    expect(result).not.toContain('orphan: /island')
    input.pages['/'] += '<a href="/island-a">Island</a>'
    expect(errors(input)).toBe('')
  })
  it('does not use parameter links to connect an otherwise disconnected cycle', () => {
    const input = fixture()
    input.pages['/'] = html('/', '<a href="/guide?build=x">Share</a><a href="/">Home</a>')
    expect(errors(input)).toContain('unreachable from /: /guide')
  })

})
