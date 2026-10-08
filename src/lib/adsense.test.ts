import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Plugin, UserConfigFnObject } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import viteConfig from '../../vite.config'

afterEach(() => vi.unstubAllEnvs())

async function adTags(path: string, environment: string) {
  vi.stubEnv('VERCEL_ENV', environment)
  const config = (viteConfig as UserConfigFnObject)({ command: 'build', mode: 'production' })
  const plugin = config.plugins!.find(candidate => candidate && typeof candidate === 'object' && 'name' in candidate && candidate.name === 'adsense-site-verification') as Plugin
  const hook = plugin.transformIndexHtml!
  const transform = typeof hook === 'function' ? hook : hook.handler
  return transform('', { path, filename: `${process.cwd()}${path}` })
}

describe('AdSense page eligibility', () => {
  it('redirects the retired builds guide instead of building an advertising-capable page', () => {
    const config = (viteConfig as UserConfigFnObject)({ command: 'build', mode: 'production' })
    const inputs = config.build?.rollupOptions?.input
    expect(Object.values(inputs as Record<string, string>).some(path => path.endsWith('/emberville-builds/index.html'))).toBe(false)
    expect(existsSync('emberville-builds/index.html')).toBe(false)
    const routing = JSON.parse(readFileSync('vercel.json', 'utf8'))
    expect(routing.redirects).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: '/emberville-builds', destination: '/emberville' }),
    ]))
    expect(routing.rewrites.some((rule: { source: string }) => rule.source === '/emberville-builds')).toBe(false)
  })

  it.each(['/emberville', '/emberville/', '/emberville/index.html'])(
    'does not inject advertising into incomplete preview notebook %s', async path => {
      expect(await adTags(path, 'production')).toEqual([])
    },
  )

  it.each(['/privacy', '/privacy/', '/privacy/index.html'])(
    'keeps consent policy %s readable without ad or CMP scripts', async path => {
      expect(await adTags(path, 'production')).toEqual([])
    },
  )

  it.each(['/', '/paladin/index.html', '/emberville-classes/index.html', '/emberville-skill-inheritance/index.html'])(
    'retains production site verification and ad eligibility for %s', async path => {
      expect(await adTags(path, 'production')).toEqual([{
        tag: 'script',
        attrs: {
          async: true,
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4279730688530289',
          crossorigin: 'anonymous',
        },
        injectTo: 'head',
      }])
    },
  )

  it.each(['/', '/paladin/index.html', '/emberville-classes/index.html', '/emberville-skill-inheritance/index.html'])(
    'never injects AdSense into preview deployment %s', async path => {
      expect(await adTags(path, 'preview')).toEqual([])
    },
  )
})
