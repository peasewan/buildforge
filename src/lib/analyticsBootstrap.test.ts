import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { track } from './analytics'
import { analyticsBootstrapSource, isProductionAnalyticsHost, transformAnalyticsHtml } from './analyticsBootstrap'

afterEach(() => vi.unstubAllGlobals())

function executeBootstrap(hostname: string) {
  const insertedScripts: { async: boolean; src: string }[] = []
  const dataLayer: unknown[] = []
  const pageWindow: {
    location: { hostname: string; pathname: string }
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  } = { location: { hostname, pathname: '/paladin' } }
  const document = {
    createElement: vi.fn(() => ({ async: false, src: '' })),
    head: { appendChild: vi.fn((script: { async: boolean; src: string }) => insertedScripts.push(script)) },
  }
  runInNewContext(analyticsBootstrapSource(), { window: pageWindow, document, Date })
  if (pageWindow.dataLayer) dataLayer.push(...pageWindow.dataLayer)
  return { pageWindow, dataLayer, insertedScripts, document }
}

describe('production-only Google Analytics', () => {
  it.each([
    ['buildforgetools.com', true],
    ['www.buildforgetools.com', true],
    ['localhost', false],
    ['127.0.0.1', false],
    ['preview-buildforge.vercel.app', false],
    ['buildforgetools.com.evil.test', false],
  ])('allows exact hostname %s: %s', (hostname, expected) => {
    expect(isProductionAnalyticsHost(hostname)).toBe(expected)
  })

  it.each(['localhost', '127.0.0.1', 'preview-buildforge.vercel.app', 'buildforgetools.com.evil.test'])(
    'does not configure or load Google on %s', (hostname) => {
      const result = executeBootstrap(hostname)
      expect(result.pageWindow.gtag).toBeUndefined()
      expect(result.pageWindow.dataLayer).toBeUndefined()
      expect(result.document.createElement).not.toHaveBeenCalled()
      expect(result.insertedScripts).toEqual([])
    },
  )

  it.each(['buildforgetools.com', 'www.buildforgetools.com'])('configures and loads once on %s', (hostname) => {
    const result = executeBootstrap(hostname)
    expect(result.dataLayer).toHaveLength(2)
    expect(Array.from(result.dataLayer[0] as IArguments)[0]).toBe('js')
    expect(Array.from(result.dataLayer[1] as IArguments)).toEqual([
      'config', 'G-DDT58001FZ', { page_path: '/paladin' },
    ])
    expect(result.insertedScripts).toEqual([{
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-DDT58001FZ',
    }])
  })

  it('replaces the old tag without changing page metadata or root markup', () => {
    const html = readFileSync(resolve(import.meta.dirname, '../../paladin/index.html'), 'utf8')
    const transformed = transformAnalyticsHtml(html)
    expect(transformed).toContain(`<script>${analyticsBootstrapSource()}</script>`)
    expect(transformed).not.toContain('<script async src="https://www.googletagmanager.com/')
    expect(transformed).toContain('<link rel="canonical" href="https://buildforgetools.com/paladin" />')
    expect(transformed).toContain('<div id="root"><!-- PLANNER_PRERENDER --></div>')
    expect(() => transformAnalyticsHtml('<html><head></head></html>')).toThrow('Expected one Google tag')
  })

  it('replaces the compact tag in generated class shells', () => {
    const html = readFileSync(resolve(import.meta.dirname, '../../warrior/index.html'), 'utf8')
    const transformed = transformAnalyticsHtml(html)
    expect(transformed).toContain(`<script>${analyticsBootstrapSource()}</script>`)
    expect(transformed).not.toContain('<script async src="https://www.googletagmanager.com/')
    expect(transformed).toContain('<div id="root"><!-- PAGES_PRERENDER --></div>')
  })

  it.each(['localhost', '127.0.0.1', 'preview-buildforge.vercel.app'])(
    'drops events on %s even if a gtag stub exists', (hostname) => {
      const gtag = vi.fn()
      vi.stubGlobal('window', { location: { hostname }, gtag })
      track('talent_click', { rank: 1 })
      expect(gtag).not.toHaveBeenCalled()
    },
  )

  it('sends events on the production host when gtag is available', () => {
    const gtag = vi.fn()
    vi.stubGlobal('window', { location: { hostname: 'buildforgetools.com' }, gtag })
    track('talent_click', { rank: 1 })
    expect(gtag).toHaveBeenCalledWith('event', 'talent_click', { rank: 1 })
  })
})
