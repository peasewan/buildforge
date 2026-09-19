import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HUB_BUILD_HREFS } from '../data/paladinBuildsHub'
import { SPEC_BUILDS_HUBS, specHubHrefs } from '../data/specBuildsHubs'
import { BUILD_LANDING_PAGES } from '../data/buildLandingPages'
import { TRUST_PAGES } from '../data/trustPages'
import { renderBetaAvailabilityPrerender, renderEmbervillePrerender, renderHubPrerender, renderLandingPrerender, renderSpecHubPrerender, renderTrustPrerender } from './prerender'
import { EMBERVILLE_EDITORIAL, EMBERVILLE_PAGES } from '../data/emberville'

const redirections = (() => {
  const config = JSON.parse(readFileSync(`${process.cwd()}/vercel.json`, 'utf8')) as {
    redirects?: { source: string }[]
  }
  return (config.redirects ?? []).map((redirect) => redirect.source)
})()

const allPrerendered = () => [
  ['paladin-builds hub', renderHubPrerender()],
  ...SPEC_BUILDS_HUBS.map((hub) => [`${hub.spec} builds hub`, renderSpecHubPrerender(hub.spec)] as const),
  ...BUILD_LANDING_PAGES.map((page) => [page.slug, renderLandingPrerender(page.id)] as const),
  ...TRUST_PAGES.map((page) => [page.slug, renderTrustPrerender(page.id)] as const),
] as const

describe('prerender generation', () => {
  it.each(EMBERVILLE_PAGES.map((page) => [page.id, page.title] as const))('gives the %s Emberville page substantial unique crawlable copy', (pageId, title) => {
    const html = renderEmbervillePrerender(pageId)
    const words = html.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9'-]+/g)?.length ?? 0
    expect(html.match(/<h1>.*?<\/h1>/g)).toHaveLength(1)
    expect(html).toContain(`<h1>${title}</h1>`)
    for (const section of EMBERVILLE_EDITORIAL[pageId]) expect(html).toContain(`<h2>${section.heading}</h2>`)
    expect(words).toBeGreaterThanOrEqual(220)
  })
  it.each([
    ['holy', "Light's Vigil", 'Not available', '31 talent points'],
    ['protection', 'Improved Seal of Fury', 'Available', '11 talent points'],
    ['retribution', 'Twist of Light', 'Not available', '31 talent points'],
  ] as const)('prerenders current Beta availability for %s', (branch, talent, status, points) => {
    const html = renderBetaAvailabilityPrerender(branch)

    expect(html).toContain('Level cap 20')
    expect(html).toContain('11 talent points available')
    expect(html).toContain(talent)
    expect(html).toContain(status)
    expect(html).toContain(points)
  })

  it('links every build the hub data declares', () => {
    const html = renderHubPrerender()

    for (const href of HUB_BUILD_HREFS) expect(html).toContain(`href="${href}"`)
  })

  it.each(SPEC_BUILDS_HUBS.map((hub) => [hub.spec, hub] as const))('links every build the %s hub data declares', (_spec, hub) => {
    const html = renderSpecHubPrerender(hub.spec)

    for (const href of specHubHrefs(hub)) expect(html).toContain(`href="${href}"`)
  })

  it('carries the landing page title as its only h1', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const headings = renderLandingPrerender(page.id).match(/<h1>.*?<\/h1>/g) ?? []

      expect(headings).toHaveLength(1)
      expect(headings[0]).toContain(page.title)
    }
  })

  it('never links a url the deployment redirects', () => {
    for (const [label, html] of allPrerendered()) {
      for (const source of redirections) expect(html, `${label} links redirected ${source}`).not.toContain(`href="${source}"`)
    }
  })

  it('links each spec talent page the hub already points readers at', () => {
    for (const hub of SPEC_BUILDS_HUBS) {
      for (const item of hub.talents) expect(renderSpecHubPrerender(hub.spec)).toContain(`href="${item.href}"`)
    }
  })

  it('carries every link its configuration declares', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const html = renderLandingPrerender(page.id)
      const declared = page.sections.flatMap((section) => {
        if (section.kind === 'related') return section.items.map((item) => item.href)
        if (section.kind === 'cards') return section.items.flatMap((item) => (item.href ? [item.href] : []))
        return []
      })

      for (const href of declared) expect(html, `${page.slug} does not link ${href}`).toContain(`href="${href}"`)
    }
  })

  it('never nests a list inside a paragraph', () => {
    for (const [label, html] of allPrerendered()) {
      expect(html, label).not.toMatch(/<p>\s*<ul>/)
    }
  })

  it('prerenders every trust-page section and footer link', () => {
    for (const page of TRUST_PAGES) {
      const html = renderTrustPrerender(page.id)

      expect(html).toContain(`<h1>${page.title}</h1>`)
      for (const section of page.sections) expect(html).toContain(`<h2>${section.heading}</h2>`)
      expect(html).toContain('href="/privacy"')
    }
  })

  it('makes the privacy and contact pages crawlable from every generated landing page', () => {
    for (const [label, html] of allPrerendered()) {
      expect(html, label).toContain('href="/privacy"')
      expect(html, label).toContain('href="/contact"')
    }
  })

  it.each(['leveling', 'pvp', 'raid', 'retribution-pvp', 'holy-pvp'] as const)(
    'gives the %s landing page at least 450 crawlable words',
    (pageId) => {
      const text = renderLandingPrerender(pageId).replace(/<[^>]+>/g, ' ')
      const words = text.match(/[A-Za-z0-9'-]+/g)?.length ?? 0

      expect(words).toBeGreaterThanOrEqual(450)
    },
  )
})
