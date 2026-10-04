import { describe, expect, it } from 'vitest'
import { checkProductionDeployment } from './post-deploy-smoke'

const apex = 'https://buildforgetools.com'
const pvpPath = '/wow-forever-hunter-pvp-build'
const protectionPath = '/wow-forever-protection-paladin-leveling-build'
const talentPath = '/wow-forever-paladin-talents'
const deepLink = '/hunter?build=hunter-1389.5&level=20#class-calculator'
const protectionRoute = '<section aria-label="Beta leveling snapshot">0/11/0 · 0/21/0 · 1.60.1.70170 · editorial<a href="/build?id=route&level=30#calculator">Load Level 30</a></section>'
const talentIndex = `<section class="guide-talent-index">${Array.from({ length: 52 }, (_, i) => `<div data-talent-id="talent-${i}"></div>`).join('')}</section>`

function html(path: string, body = ''): string {
  return `<html><head><link rel="canonical" href="${apex}${path}"><meta property="og:url" content="${apex}${path}"></head><body>${body}</body></html>`
}

function fixtures(overrides: Record<string, Response> = {}) {
  const sitemap = ['paladin', talentPath.slice(1), 'hunter', pvpPath.slice(1), protectionPath.slice(1)].map((path) => `<url><loc>${apex}/${path}</loc></url>`).join('')
  const responses: Record<string, Response> = {
    [`${apex}/sitemap.xml`]: new Response(`<urlset>${sitemap}</urlset>`, { status: 200, headers: { 'content-type': 'application/xml' } }),
    [`${apex}/`]: new Response(html('/'), { status: 200, headers: { 'content-type': 'text/html' } }),
    [`https://www.buildforgetools.com/`]: new Response(null, { status: 308, headers: { location: `${apex}/` } }),
    [`https://www.buildforgetools.com${pvpPath}`]: new Response(null, { status: 308, headers: { location: `${apex}${pvpPath}` } }),
    [`${apex}/paladin`]: new Response(html('/paladin'), { status: 200, headers: { 'content-type': 'text/html' } }),
    [`${apex}${talentPath}`]: new Response(html(talentPath, talentIndex), { status: 200, headers: { 'content-type': 'text/html' } }),
    [`${apex}${protectionPath}`]: new Response(html(protectionPath, protectionRoute), { status: 200, headers: { 'content-type': 'text/html' } }),
    [`${apex}/hunter`]: new Response(html('/hunter', '<section id="class-calculator" data-intent-calculator="true"></section>'), { status: 200, headers: { 'content-type': 'text/html' } }),
    [`${apex}${pvpPath}`]: new Response(html(pvpPath, `<a href="${deepLink}">Try these points</a>`), { status: 200, headers: { 'content-type': 'text/html' } }),
    [`${apex}/hunter?build=hunter-1389.5&level=20`]: new Response(html('/hunter', '<section id="class-calculator" data-intent-calculator="true"></section>'), { status: 200, headers: { 'content-type': 'text/html' } }),
    ...overrides,
  }
  const requested: string[] = []
  const fetchImpl = async (input: string | URL | Request): Promise<Response> => {
    const url = String(input)
    requested.push(url)
    const response = responses[url]
    if (!response) throw new Error(`Unexpected request: ${url}`)
    return response.clone()
  }
  return { fetchImpl, requested }
}

describe('post-deploy smoke gate', () => {
  it('checks the live sitemap targets, redirects, metadata and a real calculator deep link', async () => {
    const { fetchImpl, requested } = fixtures()
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toEqual([])
    expect(report.pagesChecked).toBe(5)
    expect(requested).toContain(`${apex}/hunter?build=hunter-1389.5&level=20`)
  })

  it('fails clearly when the sitemap omits a critical live page', async () => {
    const { fetchImpl } = fixtures({
      [`${apex}/sitemap.xml`]: new Response(`<urlset><url><loc>${apex}/hunter</loc></url></urlset>`, { status: 200 }),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain('Sitemap is missing required page: /paladin')
    expect(report.issues).toContain(`Sitemap is missing required page: ${pvpPath}`)
    expect(report.issues).toContain(`Sitemap is missing required page: ${protectionPath}`)
    expect(report.issues).toContain(`Sitemap is missing required page: ${talentPath}`)
  })

  it('reports a www homepage that still returns 200', async () => {
    const { fetchImpl } = fixtures({ 'https://www.buildforgetools.com/': new Response(html('/'), { status: 200 }) })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain('www homepage: expected permanent 301/308 redirect to https://buildforgetools.com/, got HTTP 200')
  })

  it('reports wrong canonical and a broken calculator target', async () => {
    const { fetchImpl } = fixtures({
      [`${apex}${pvpPath}`]: new Response(html('/wrong', `<a href="${deepLink}">Try these points</a>`), { status: 200, headers: { 'content-type': 'text/html' } }),
      [`${apex}/hunter?build=hunter-1389.5&level=20`]: new Response(html('/hunter'), { status: 200, headers: { 'content-type': 'text/html' } }),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain(`${pvpPath}: canonical expected ${apex}${pvpPath}, got ${apex}/wrong`)
    expect(report.issues).toContain('Calculator deep link: missing prerendered #class-calculator target')
  })

  it('reports wrong OG URL, an inner redirect miss and an absent build link', async () => {
    const pvpHtml = `<html><head><link rel="canonical" href="${apex}${pvpPath}"><meta property="og:url" content="https://www.buildforgetools.com${pvpPath}"></head><body></body></html>`
    const { fetchImpl } = fixtures({
      [`https://www.buildforgetools.com${pvpPath}`]: new Response(null, { status: 302, headers: { location: `${apex}${pvpPath}` } }),
      [`${apex}${pvpPath}`]: new Response(pvpHtml, { status: 200, headers: { 'content-type': 'text/html' } }),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain(`www inner page: expected permanent 301/308 redirect to ${apex}${pvpPath}, got HTTP 302 → ${apex}${pvpPath}`)
    expect(report.issues).toContain(`${pvpPath}: og:url expected ${apex}${pvpPath}, got https://www.buildforgetools.com${pvpPath}`)
    expect(report.issues).toContain('Hunter PvP: no build-loaded Hunter calculator link in rendered HTML')
  })

  it('cannot pass a deployment without the current Protection route', async () => {
    const { fetchImpl } = fixtures({
      [`${apex}${protectionPath}`]: new Response(html(protectionPath), { status: 200, headers: { 'content-type': 'text/html' } }),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain('Protection Leveling: missing current editorial Level 20/30 route and client evidence')
    expect(report.issues).toContain('Protection Leveling: missing Level 30 calculator deep link')
  })

  it('cannot pass a deployment without the Paladin talent index', async () => {
    const { fetchImpl } = fixtures({
      [`${apex}${talentPath}`]: new Response(html(talentPath), { status: 200, headers: { 'content-type': 'text/html' } }),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain('Paladin Talents: missing 52-node historical Beta index')
  })
})
