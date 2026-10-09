import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { checkProductionDeployment } from './post-deploy-smoke'
import { DATA_VERSION, removedPaladinTalents, talents } from '../src/data/talents'
import { hunterClass } from '../src/data/classes/hunter'
import { warriorClass } from '../src/data/classes/warrior'
import { PUBLISHED_CLASSES } from '../src/data/classes'
import ClassIntentExperience from '../src/experiences/ClassIntentExperience'
import { classBuildPlannerHref } from '../src/lib/archivedClassBuild'
import { protectionPlannerHref } from '../src/data/protectionCurrentRoute'
import { renderBetaLevelingSnapshotPrerender } from '../src/lib/prerender'
import type { ClassDefinition } from '../src/lib/classPage'

const apex = 'https://buildforgetools.com'
const pvpPath = '/wow-forever-hunter-pvp-build'
const warriorPvpPath = '/wow-forever-warrior-pvp-build'
const protectionPath = '/wow-forever-protection-paladin-leveling-build'
const talentPath = '/wow-forever-paladin-talents'
const apiPath = '/api/forge-pilot-explain'
const currentPaladinBuild = DATA_VERSION.replace('wow_forever_beta_', '')
const protectionRoute = renderBetaLevelingSnapshotPrerender('protection-leveling')
const talentIndex = `<section class="guide-talent-index">Current structure ${currentPaladinBuild}${talents.map(talent => `<li data-talent-id="${talent.id}" class="guide-index-node"></li>`).join('')}${removedPaladinTalents.map(talent => `<li data-talent-id="${talent.id}" class="guide-index-node removed">${talent.currentBetaAvailability === 'removed_official' ? 'Removed Sep 24' : 'Client-confirmed removal'}</li>`).join('')}</section>`

const currentClasses = PUBLISHED_CLASSES.filter(classDef => classDef.dataReview?.current && classDef.dataReview.ready && classDef.verifiedBuild === '1.60.1.70291')
const newlyReviewedClasses = currentClasses.filter(classDef => !['hunter', 'warrior'].includes(classDef.id))
const pvpPage = (classDef: ClassDefinition) => classDef.pages.find(page => page.kind === 'pvp')!
const pvpBody = (classDef: ClassDefinition) => renderToStaticMarkup(createElement(ClassIntentExperience, { classDef, page: pvpPage(classDef) }))
const requiredPaths = ['/paladin', talentPath, protectionPath, ...currentClasses.flatMap(classDef => [classDef.plannerPath, `/${pvpPage(classDef).slug}`])]
const pvpHref = (classDef: ClassDefinition) => {
  const page = classDef.pages.find(page => page.kind === 'pvp')!
  const build = classDef.builds.find(build => build.id === page.primaryBuildId)!
  return classBuildPlannerHref(classDef, build)
}
const deepLink = pvpHref(hunterClass)
const warriorDeepLink = pvpHref(warriorClass)
const requestUrl = (href: string) => new URL(href, apex).href.split('#')[0]
const calculator = (classDef: ClassDefinition) => `<main data-class="${classDef.id}" data-intent-calculator="true"><p>Reviewed talent structure through ${classDef.verifiedBuild}</p><section id="class-calculator"><div class="class-levels"><button class="active">Level 30 <small>21 points</small></button><button>Level 20 <small>11 points</small></button></div>${classDef.talents.map(talent => `<button class="class-talent-main" aria-label="Add rank to ${talent.name}"></button>`).join('')}</section></main>`

function html(path: string, body = ''): string {
  return `<html><head><link rel="canonical" href="${apex}${path}"><meta property="og:url" content="${apex}${path}"></head><body>${body}</body></html>`
}
function htmlResponse(path: string, body = '') {
  return new Response(html(path, body), { status: 200, headers: { 'content-type': 'text/html' } })
}

function fixtures(overrides: Record<string, Response> = {}) {
  const sitemap = requiredPaths.map(path => `<url><loc>${apex}${path}</loc></url>`).join('')
  const responses: Record<string, Response> = {
    [`${apex}/sitemap.xml`]: new Response(`<urlset>${sitemap}</urlset>`, { status: 200, headers: { 'content-type': 'application/xml' } }),
    [`${apex}/`]: htmlResponse('/'),
    [`https://www.buildforgetools.com/`]: new Response(null, { status: 308, headers: { location: `${apex}/` } }),
    [`https://www.buildforgetools.com${pvpPath}`]: new Response(null, { status: 308, headers: { location: `${apex}${pvpPath}` } }),
    [`${apex}/paladin`]: htmlResponse('/paladin', `<p>Current structure ${currentPaladinBuild}</p><section id="calculator"></section>`),
    [`${apex}${talentPath}`]: htmlResponse(talentPath, talentIndex),
    [`${apex}${protectionPath}`]: htmlResponse(protectionPath, protectionRoute),
    ...Object.fromEntries(currentClasses.flatMap(classDef => {
      const path = `/${pvpPage(classDef).slug}`
      return [
        [`${apex}${classDef.plannerPath}`, htmlResponse(classDef.plannerPath, calculator(classDef))],
        [`${apex}${path}`, htmlResponse(path, pvpBody(classDef))],
        [requestUrl(pvpHref(classDef)), htmlResponse(classDef.plannerPath, calculator(classDef))],
      ]
    })),
    ...overrides,
  }
  const requested: string[] = []
  const apiInputs: Array<{ classId: string; currentDataVersion: string; sourceDataVersion: string }> = []
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = String(input)
    requested.push(url)
    if (responses[url]) return responses[url].clone()
    if (url === `${apex}${apiPath}`) {
      expect(init?.method).toBe('POST')
      expect(new Headers(init?.headers).get('origin')).toBe(apex)
      expect(new Headers(init?.headers).get('x-buildforge-explanation-mode')).toBe('metadata-only')
      const body = JSON.parse(String(init?.body))
      apiInputs.push(body)
      const current = body.classId === 'paladin' ? DATA_VERSION : currentClasses.find(classDef => classDef.id === body.classId)?.dataVersion
      if (!current || body.currentDataVersion !== current) return new Response('{}', { status: 400 })
      return new Response(JSON.stringify({
        status: body.sourceDataVersion === current ? 'same_dataset' : 'needs_review',
        patchStatus: 'structure_reviewed',
        generatedBy: 'fallback',
        explanation: 'Client structure and community rank text are separate; planning rules are derived.',
        sourceUrl: body.classId === 'paladin' ? 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-september-24/2360696' : `https://wago.tools/db2/TraitNode/csv?build=${currentClasses.find(classDef => classDef.id === body.classId)!.verifiedBuild}`,
      }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
    }
    throw new Error(`Unexpected request: ${url}`)
  }
  return { fetchImpl, requested, apiInputs }
}

describe('post-deploy smoke gate', () => {
  it('checks all seven current classes, redirects, metadata, legal deep links and metadata-only API explanations', async () => {
    const { fetchImpl, requested, apiInputs } = fixtures()
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toEqual([])
    expect(currentClasses.map(classDef => classDef.id).sort()).toEqual(['druid', 'hunter', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'])
    expect(report.pagesChecked).toBe(17)
    expect(report.sitemapCount).toBe(17)
    expect(report.deepLinks).toEqual(currentClasses.map(classDef => new URL(pvpHref(classDef), apex).href))
    for (const classDef of currentClasses) expect(requested).toContain(requestUrl(pvpHref(classDef)))
    expect(requested).toContain(requestUrl(deepLink))
    expect(requested).toContain(requestUrl(warriorDeepLink))
    expect(apiInputs).toEqual(expect.arrayContaining([
      { classId: 'paladin', currentDataVersion: DATA_VERSION, sourceDataVersion: DATA_VERSION },
      ...currentClasses.flatMap(classDef => [
        { classId: classDef.id, currentDataVersion: classDef.dataVersion, sourceDataVersion: classDef.dataVersion },
        { classId: classDef.id, currentDataVersion: classDef.dataVersion, sourceDataVersion: classDef.historicalSnapshots![0].dataVersion },
      ]),
    ]))
    expect(apiInputs).toHaveLength(15)
    expect(report.apiChecks).toBe(15)
  })

  it('fails clearly when the sitemap omits a critical live page', async () => {
    const { fetchImpl } = fixtures({ [`${apex}/sitemap.xml`]: new Response(`<urlset><url><loc>${apex}/hunter</loc></url></urlset>`, { status: 200 }) })
    const report = await checkProductionDeployment(fetchImpl)
    for (const path of requiredPaths.filter(path => path !== '/hunter')) expect(report.issues).toContain(`Sitemap is missing required page: ${path}`)
  })

  it('reports a www homepage that still returns 200', async () => {
    const { fetchImpl } = fixtures({ 'https://www.buildforgetools.com/': htmlResponse('/') })
    expect((await checkProductionDeployment(fetchImpl)).issues).toContain('www homepage: expected permanent 301/308 redirect to https://buildforgetools.com/, got HTTP 200')
  })

  it('reports wrong canonical and a broken Hunter calculator target', async () => {
    const { fetchImpl } = fixtures({
      [`${apex}${pvpPath}`]: htmlResponse('/wrong', pvpBody(hunterClass)),
      [requestUrl(deepLink)]: htmlResponse('/hunter'),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain(`${pvpPath}: canonical expected ${apex}${pvpPath}, got ${apex}/wrong`)
    expect(report.issues).toContain('Hunter calculator deep link: missing prerendered #class-calculator target')
    expect(report.deepLinks).toEqual(currentClasses.filter(classDef => classDef.id !== 'hunter').map(classDef => new URL(pvpHref(classDef), apex).href))
  })

  it('reports wrong OG URL, an inner redirect miss and an absent current build link', async () => {
    const pvpHtml = `<html><head><link rel="canonical" href="${apex}${pvpPath}"><meta property="og:url" content="https://www.buildforgetools.com${pvpPath}"></head><body></body></html>`
    const { fetchImpl } = fixtures({
      [`https://www.buildforgetools.com${pvpPath}`]: new Response(null, { status: 302, headers: { location: `${apex}${pvpPath}` } }),
      [`${apex}${pvpPath}`]: new Response(pvpHtml, { status: 200, headers: { 'content-type': 'text/html' } }),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain(`www inner page: expected permanent 301/308 redirect to ${apex}${pvpPath}, got HTTP 302 → ${apex}${pvpPath}`)
    expect(report.issues).toContain(`${pvpPath}: og:url expected ${apex}${pvpPath}, got https://www.buildforgetools.com${pvpPath}`)
    expect(report.issues).toContain('Hunter PvP: missing reviewed Level 30 current-dataset calculator link')
  })

  it('rejects missing or historical-only Protection snapshots and a partial Level 30 link', async () => {
    for (const body of ['', protectionRoute.replaceAll('70245', '69913'), protectionRoute.replace(protectionPlannerHref(30).replaceAll('&', '&amp;'), '/build?id=redoubt.5&amp;level=30#calculator')]) {
      const { fetchImpl } = fixtures({ [`${apex}${protectionPath}`]: htmlResponse(protectionPath, body) })
      const report = await checkProductionDeployment(fetchImpl)
      expect(report.issues.some(issue => issue.startsWith('Protection Leveling:')), body).toBe(true)
    }
  })

  it('requires exact current Paladin membership and two explicitly marked historical removals, not just 52 rows', async () => {
    const allCurrent = talentIndex.replaceAll('guide-index-node removed', 'guide-index-node')
    const duplicateCurrent = talentIndex.replace(`data-talent-id="${talents[0].id}"`, `data-talent-id="${talents[1].id}"`)
    for (const body of ['', allCurrent, duplicateCurrent, talentIndex.replace(currentPaladinBuild, '1.60.1.69913')]) {
      const { fetchImpl } = fixtures({ [`${apex}${talentPath}`]: htmlResponse(talentPath, body) })
      expect((await checkProductionDeployment(fetchImpl)).issues).toContain('Paladin Talents: expected current dataset index with exact current and marked removed IDs')
    }
  })

  it('rejects Warrior metadata errors, stale structure, and non-current PvP links', async () => {
    const { fetchImpl } = fixtures({
      [`${apex}/warrior`]: htmlResponse('/wrong', calculator(warriorClass).replaceAll(warriorClass.verifiedBuild, '1.60.1.69913')),
      [`${apex}${warriorPvpPath}`]: htmlResponse(warriorPvpPath, '<a href="/warrior?build=warrior-arms-rend.1&amp;level=20#class-calculator">Old route</a>'),
    })
    const report = await checkProductionDeployment(fetchImpl)
    expect(report.issues).toContain(`/warrior: canonical expected ${apex}/warrior, got ${apex}/wrong`)
    expect(report.issues).toContain('/warrior: missing current reviewed Warrior dataset')
    expect(report.issues).toContain('Warrior PvP: missing reviewed Level 30 current-dataset calculator link')
  })

  it.each(newlyReviewedClasses)('$name: rejects missing or stale calculator datasets', async classDef => {
    for (const body of ['', calculator(classDef).replaceAll(classDef.verifiedBuild, '1.60.1.69913')]) {
      const { fetchImpl } = fixtures({ [`${apex}${classDef.plannerPath}`]: htmlResponse(classDef.plannerPath, body) })
      expect((await checkProductionDeployment(fetchImpl)).issues).toContain(`${classDef.plannerPath}: missing current reviewed ${classDef.name} dataset`)
    }
  })

  it.each(newlyReviewedClasses)('$name: rejects absent exact selected-rank text and stale effect versions', async classDef => {
    const page = pvpPage(classDef)
    const build = classDef.builds.find(build => build.id === page.primaryBuildId)!
    const selectedId = page.roleDecision?.options[0].talentIds[0] ?? Object.keys(build.build)[0]
    const talent = classDef.talents.find(talent => talent.id === selectedId)!
    const effect = talent.rankDescriptions![build.build[selectedId] - 1]
    const body = pvpBody(classDef)
    const escapedEffect = renderToStaticMarkup(createElement('p', {}, effect)).slice(3, -4)
    for (const invalid of [body.replaceAll(escapedEffect, 'Unsupported effect'), body.replaceAll(`Client build ${classDef.verifiedBuild}`, 'Client build 1.60.1.69913')]) {
      expect(invalid).not.toBe(body)
      const { fetchImpl } = fixtures({ [`${apex}/${page.slug}`]: htmlResponse(`/${page.slug}`, invalid) })
      expect((await checkProductionDeployment(fetchImpl)).issues).toContain(`${classDef.name} PvP: missing reviewed selected-rank effects for client ${classDef.verifiedBuild}`)
    }
  })

  it.each(newlyReviewedClasses)('$name: rejects historical, unversioned and partial current PvP links', async classDef => {
    const path = `/${pvpPage(classDef).slug}`
    const expected = new URL(pvpHref(classDef), apex)
    const historical = new URL(expected); historical.searchParams.set('dataset', '1.60.1.69913')
    const versionless = new URL(expected); versionless.searchParams.delete('dataset')
    const partial = new URL(expected); partial.searchParams.set('build', `${classDef.talents.find(talent => talent.requiredTreePoints === 0)!.id}.1`)
    for (const url of [historical, versionless, partial]) {
      const { fetchImpl } = fixtures({ [`${apex}${path}`]: htmlResponse(path, `<a href="${url}">Incomplete route</a>`) })
      expect((await checkProductionDeployment(fetchImpl)).issues).toContain(`${classDef.name} PvP: missing reviewed Level 30 current-dataset calculator link`)
    }
  })

  it('rejects an API response that used DeepSeek during the metadata-only smoke query', async () => {
    const { fetchImpl } = fixtures({ [`${apex}${apiPath}`]: new Response(JSON.stringify({ status: 'same_dataset', patchStatus: 'structure_reviewed', explanation: 'Reviewed', sourceUrl: 'https://wago.tools/db2/TraitNode/csv?build=1.60.1.70291', generatedBy: 'deepseek' }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }) })
    expect((await checkProductionDeployment(fetchImpl)).issues).toContain('ForgePilot hunter current explanation: incorrect reviewed-version response')
  })

  it('reports failed or incorrect API responses without accepting HTTP errors', async () => {
    for (const response of [
      new Response('{}', { status: 500, headers: { 'content-type': 'application/json' } }),
      new Response(JSON.stringify({ status: 'same_dataset', patchStatus: 'pending_reconciliation' }), { status: 200, headers: { 'content-type': 'application/json' } }),
      new Response('<html>Error</html>', { status: 200, headers: { 'content-type': 'text/html' } }),
    ]) {
      const { fetchImpl } = fixtures({ [`${apex}${apiPath}`]: response })
      expect((await checkProductionDeployment(fetchImpl)).issues.some(issue => issue.startsWith('ForgePilot '))).toBe(true)
    }
  })
})
