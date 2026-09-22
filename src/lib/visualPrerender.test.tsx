// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import AppRoute from '../AppRoute'
import { publishedClassPages } from './classStaticPages'

describe('visual first paint without JavaScript', () => {
  it('renders every published class route with its real hero and navigation', () => {
    for (const { classDef, page } of publishedClassPages()) {
      const html = renderToString(<AppRoute pathname={`/${page.slug}`} />)
      expect(html, page.slug).toContain('class-hero')
      expect(html, page.slug).toContain(page.ogImage ?? classDef.ogImage)
      expect(html, page.slug).toContain('<footer')
      expect((html.match(/<h1[ >]/g) ?? []).length, page.slug).toBe(1)
      expect(html, page.slug).not.toContain('class-prerender')
    }
  })
  it.each(['/paladin', '/wow-forever-paladin-build', '/wow-forever-paladin-leveling-build', '/emberville'])('renders %s without a browser or storage', (pathname) => {
    const html = renderToString(<AppRoute pathname={pathname} />)
    expect(html).toContain('<h1')
    expect(html).toContain('hero')
    expect(html).not.toContain('-prerender')
  })
})
