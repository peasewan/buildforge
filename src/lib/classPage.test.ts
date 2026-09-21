import { describe, expect, it } from 'vitest'
import {
  assertUniquePageIntents,
  classPlannerHref,
  pageFromPublishedClasses,
  sitemapLastmod,
  type ClassDefinition,
  type ClassPageDefinition,
} from './classPage'

const page = (overrides: Partial<ClassPageDefinition> & Pick<ClassPageDefinition, 'kind' | 'slug' | 'intent' | 'title' | 'h1' | 'canonical'>): ClassPageDefinition => ({
  description: 'd',
  eyebrow: 'e',
  robots: 'index, follow',
  updatedAt: '2026-09-21',
  relatedBuildIds: [],
  relatedPages: [],
  sections: [],
  faqs: [],
  ...overrides,
})

const pages = [
  page({ kind: 'calculator', slug: 'mage', intent: 'Talent Calculator', title: 'A', h1: 'HA', canonical: 'https://buildforgetools.com/mage' }),
  page({ kind: 'buildsHub', slug: 'wow-forever-mage-builds', intent: 'Builds Hub', title: 'B', h1: 'HB', canonical: 'https://buildforgetools.com/wow-forever-mage-builds' }),
]

const mageLike = {
  id: 'mage',
  plannerPath: '/mage',
  pages,
} as Pick<ClassDefinition, 'id' | 'plannerPath' | 'pages'> as ClassDefinition

describe('class page registry', () => {
  it('rejects duplicate intents, titles, h1s, or canonicals', () => {
    expect(() => assertUniquePageIntents([...pages, { ...pages[0], slug: 'dup' }])).toThrow(/intent/)
  })

  it('looks up published class pages and ignores unpublished paths', () => {
    expect(pageFromPublishedClasses('/wow-forever-mage-builds', [mageLike])?.kind).toBe('buildsHub')
    expect(pageFromPublishedClasses('/hunter', [mageLike])).toBeUndefined()
  })

  it('builds a planner share href from class path, encoded build, and level', () => {
    expect(classPlannerHref(mageLike, 'abc', 20)).toBe('/mage?build=abc&level=20')
  })

  it('uses each page updatedAt as sitemap lastmod', () => {
    expect(sitemapLastmod(pages[0])).toBe('2026-09-21')
    expect(sitemapLastmod({ ...pages[0], updatedAt: '2026-10-02' })).toBe('2026-10-02')
  })
})
