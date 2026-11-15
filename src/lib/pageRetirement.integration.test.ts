import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import retiredPage from '../../api/retired-page'
import { PAGE_CONSOLIDATIONS, REMOVED_PAGE_PATHS } from '../data/pageConsolidations'
import { classPageRedirects } from './classStaticPages'
import { resolvePageHref } from './pageRetirement'
import { pageForPath } from './routes'

const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  redirects: { source: string; destination: string; permanent?: boolean; statusCode?: number }[]
  rewrites: { source: string; destination: string }[]
}
const sitemapPaths = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname)
const manifest = JSON.parse(readFileSync('class-static-pages.json', 'utf8')) as { file: string }[]

describe('explicit public page retirement', () => {
  it.each(Object.entries(PAGE_CONSOLIDATIONS))('%s points directly at the retained metadata and deployment target', (source, destination) => {
    expect(PAGE_CONSOLIDATIONS[destination]).toBeUndefined()
    expect(REMOVED_PAGE_PATHS).not.toContain(destination)
    expect(pageForPath(destination)).toMatchObject({ canonical: `https://buildforgetools.com${destination}`, robots: 'index, follow' })
    for (const variant of [source, `${source}/`, `${source}/index.html`]) {
      expect(pageForPath(variant), variant).toEqual(pageForPath(destination))
    }
    for (const variant of [source, `${source}/index.html`]) {
      const redirect = config.redirects.find(candidate => candidate.source === variant)
      expect(redirect?.destination, variant).toBe(destination)
      expect(redirect?.permanent || [301, 308].includes(redirect?.statusCode ?? 0), variant).toBe(true)
      expect(config.rewrites.some(rewrite => rewrite.source === variant), variant).toBe(false)
    }
    expect(sitemapPaths).not.toContain(source)
    expect(sitemapPaths).toContain(destination)
  })

  it.each(REMOVED_PAGE_PATHS)('%s returns retired metadata and uses the honest removal endpoint', path => {
    expect(pageForPath(`${path}/`)).toMatchObject({ kind: 'retired', canonical: `https://buildforgetools.com${path}`, robots: 'noindex, follow' })
    expect(sitemapPaths).not.toContain(path)
    for (const source of [path, `${path}/index.html`]) {
      expect(config.rewrites).toContainEqual({ source, destination: '/api/retired-page' })
      expect(config.redirects.some(redirect => redirect.source === source)).toBe(false)
    }
  })

  it('omits all consolidated class entry shells while retaining their published destinations', () => {
    for (const redirect of classPageRedirects().filter(candidate => !candidate.source.endsWith('/index.html'))) {
      expect(manifest.some(entry => entry.file === `${redirect.source.slice(1)}/index.html`), redirect.source).toBe(false)
      expect(sitemapPaths, redirect.source).not.toContain(redirect.source)
      expect(sitemapPaths, redirect.source).toContain(redirect.destination)
    }
  })

  it.each(['GET', 'HEAD'])('serves a noindex 410 for %s requests without redirecting', method => {
    const headers: Record<string, string> = {}
    let body: string | undefined
    const response = { statusCode: 200, setHeader(name: string, value: string) { headers[name] = value }, end(value?: string) { body = value } }
    retiredPage({ method }, response)
    expect(response.statusCode).toBe(410)
    expect(headers['X-Robots-Tag']).toBe('noindex, follow')
    expect(headers.Location).toBeUndefined()
    if (method === 'HEAD') expect(body).toBeUndefined()
    else {
      expect(body).toContain('<h1>This page has been retired</h1>')
      expect(body).toContain('href="/"')
      expect(body).not.toContain('adsbygoogle')
    }
  })

  it.each([
    '/build?id=divine_strength.5&level=20&dataset=wow_forever_beta_1.60.1.70245#calculator',
    '/warrior?build=warrior-fury-cruelty.5&level=20&dataset=1.60.1.70291#tree-fury',
    '/hunter?build=&level=30&dataset=1.60.1.70291#class-calculator',
  ])('preserves the active share URL %s verbatim', href => {
    expect(resolvePageHref(href)).toBe(href)
  })
})
