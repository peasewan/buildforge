// @vitest-environment node
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import ledger from '../../docs/intent-page-rollout.json'
import { EXPERIENCE_PATHS, experienceEnabled } from './rollout'
import { calculatorLinkIssues, comparePageHtml, partitionAssetIssues } from '../../scripts/check-intent-rollout'

const sitemap = readFileSync(new URL('../../public/sitemap.xml', import.meta.url), 'utf8')
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
// Independent of the ledger's editable class/status fields: these paths are frozen by the scope amendment.
const protectedPaths = paths.filter((path) => path.includes('paladin'))

describe('intent rollout scope', () => {
  it('covers the complete 150-page sitemap exactly once', () => {
    expect(paths).toHaveLength(150)
    expect(new Set(ledger.pages.map((page) => page.path)).size).toBe(150)
    expect(ledger.pages.map((page) => page.path).sort()).toEqual([...paths].sort())
    expect(ledger.total).toBe(150)
    expect(ledger.activeTotal).toBe(128)
    expect(ledger.protectedTotal).toBe(22)
  })

  it('never enables one of the 22 protected Paladin paths, including slash variants', () => {
    expect(protectedPaths).toHaveLength(22)
    for (const path of protectedPaths) {
      expect(experienceEnabled(path), path).toBe(false)
      expect(experienceEnabled(`${path}/`), path).toBe(false)
      const entry = ledger.pages.find((page) => page.path === path)!
      expect(entry.status, path).toBe('protected')
      expect(entry.batch, path).toBeNull()
    }
    expect(experienceEnabled('/build')).toBe(false)
    expect(experienceEnabled('/')).toBe(false)
  })

  it('allows only explicit, unique, published non-Paladin paths with a maximum of 128', () => {
    expect(EXPERIENCE_PATHS.length).toBeLessThanOrEqual(128)
    expect(new Set(EXPERIENCE_PATHS).size).toBe(EXPERIENCE_PATHS.length)
    for (const path of EXPERIENCE_PATHS) {
      expect(paths, path).toContain(path)
      expect(path, path).not.toContain('paladin')
      expect(experienceEnabled(path), path).toBe(true)
      expect(experienceEnabled(`${path}/`), path).toBe(true)
    }
    for (const path of paths.filter((path) => !EXPERIENCE_PATHS.includes(path))) {
      expect(experienceEnabled(path), path).toBe(false)
    }
    expect(experienceEnabled('/wow-forever-unpublished-build')).toBe(false)
  })

  it('assigns every active page to a batch of at most seven without protected pages', () => {
    const batches = new Map<number, number>()
    for (const page of ledger.pages.filter((page) => !protectedPaths.includes(page.path))) {
      expect(page.status, page.path).not.toBe('protected')
      expect(Number.isInteger(page.batch), page.path).toBe(true)
      expect(page.batch!, page.path).toBeGreaterThan(0)
      batches.set(page.batch!, (batches.get(page.batch!) ?? 0) + 1)
    }
    expect([...batches.values()].reduce((sum, count) => sum + count, 0)).toBe(128)
    for (const count of batches.values()) expect(count).toBeLessThanOrEqual(7)
  })
})

describe('built page freeze audit', () => {
  const html = '<html><head><title>Existing title</title><meta name="robots" content="index, follow"><link rel="canonical" href="https://buildforgetools.com/paladin"><script src="/assets/main-old.js"></script></head><body><div id="root"><h1>Existing heading</h1><a href="/paladin">Planner</a></div></body></html>'

  it('detects metadata and H1 regressions on every page', () => {
    expect(comparePageHtml(html.replace('Existing title', 'New title'), html, false)).toContain('title changed')
    expect(comparePageHtml(html.replace('Existing heading', 'New heading'), html, false)).toContain('H1 changed')
    expect(comparePageHtml(html.replace('index, follow', 'noindex, follow'), html, false)).toContain('robots changed')
    expect(comparePageHtml(html.replace('https://buildforgetools.com/paladin', 'https://buildforgetools.com/warrior'), html, false)).toContain('canonical changed')
  })

  it('detects exact protected markup and internal-link changes', () => {
    expect(comparePageHtml(html.replace('>Planner<', '>Changed copy<'), html, true)).toContain('frozen root markup changed')
    expect(comparePageHtml(html.replace('href="/paladin"', 'href="/warrior"'), html, true)).toContain('frozen links changed')
    expect(comparePageHtml(html.replace('<h1>', '<h1 class="different">'), html, true)).toContain('frozen root markup changed')
  })

  it('ignores outside-root bundle hashes and preload tags, while retaining exact root markup', () => {
    const updated = html.replace('main-old.js', 'main-new.js').replace('</head>', '<link rel="preload" as="image" href="/new.jpg"></head>')
    expect(comparePageHtml(updated, html, true)).toEqual([])
    expect(comparePageHtml(html.replace('</h1>', '</h1> '), html, true)).toContain('frozen root markup changed')
    expect(comparePageHtml(html.replace('>Planner<', '>New task<'), html, false, true)).toEqual([])
  })

  it('freezes non-Paladin markup and links until that exact page is enabled', () => {
    const changed = html.replace('>Planner<', '>New task<').replace('href="/paladin"', 'href="/warrior"')
    expect(comparePageHtml(changed, html, false, false)).toContain('frozen root markup changed')
    expect(comparePageHtml(changed, html, false, false)).toContain('frozen links changed')
    expect(comparePageHtml(changed, html, false, true)).toEqual([])
    expect(comparePageHtml(changed, html, true, true)).toContain('frozen root markup changed')
  })

  it('preserves an absent baseline robots tag without demanding protected-page changes', () => {
    const defaultIndexing = html.replace('<meta name="robots" content="index, follow">', '')
    expect(comparePageHtml(defaultIndexing, defaultIndexing, true)).toEqual([])
    expect(comparePageHtml(defaultIndexing, html, true)).toContain('robots changed')
  })
})

describe('audit CLI baseline safety', () => {
  it('rejects a missing explicit baseline before accessing build directories', () => {
    const script = fileURLToPath(new URL('../../scripts/check-intent-rollout.ts', import.meta.url))
    const result = spawnSync(process.execPath, ['--import', 'tsx', script, '--dist', '/missing-intent-test-build'], { encoding: 'utf8' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('--baseline is required')
  })
})

describe('calculator link audit', () => {
  const check = (href: string) => calculatorLinkIssues(new URL(href, 'https://buildforgetools.com'))

  it('accepts legal published allocations in supported calculator modes', () => {
    expect(check('/warrior?build=warrior-fury-cruelty.5&level=20')).toEqual([])
    expect(check('/warrior?level=20')).toEqual([])
  })

  it('rejects an empty shared build that would restore storage instead of an exact allocation', () => {
    expect(check('/warrior?build=&level=20')).toContain('empty calculator build would restore saved state')
    expect(check('/paladin?build=')).toContain('empty calculator build would restore saved state')
  })

  it('rejects silent decoder loss, locked talents and unsupported destinations or levels', () => {
    expect(check('/warrior?build=unknown.1&level=20')).toContain('calculator build does not round-trip exactly')
    expect(check('/warrior?build=warrior-fury-cruelty.99&level=20')).toContain('calculator build does not round-trip exactly')
    expect(check('/warrior?build=warrior-fury-piercing-howl.1&level=20')).toContain('calculator allocation violates talent prerequisites or budget')
    expect(check('/warrior?build=warrior-fury-cruelty.1&level=999')).toContain('unsupported calculator level')
    expect(check('/about?build=warrior-fury-cruelty.1')).toContain('calculator parameters target a non-calculator page')
  })
})

describe('baseline asset problems', () => {
  const existing = 'missing local asset: /favicon.jpg'
  const regression = 'missing local asset: /new-image.png'

  it('reports existing disabled-page gaps as warnings, while blocking new gaps and enabled or protected pages', () => {
    expect(partitionAssetIssues([existing, regression], [existing], false, false)).toEqual({ issues: [regression], warnings: [existing] })
    expect(partitionAssetIssues([existing], [existing], true, false)).toEqual({ issues: [existing], warnings: [] })
    expect(partitionAssetIssues([existing], [existing], false, true)).toEqual({ issues: [existing], warnings: [] })
  })
})
