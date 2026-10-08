import { describe, expect, it } from 'vitest'
import { classPagePaths, classPageRedirects } from './classStaticPages'
import { PUBLISHED_CLASSES } from '../data/classes'
import { readFileSync, existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ClassExperiencePage from '../experiences/ClassExperiencePage'
import { rogueClass } from '../data/classes/rogue'
import { isLegalAllocation, publishedClassPages } from './classPage'

const publishes = (def: typeof rogueClass, slug: string) => publishedClassPages([def]).some(({page}) => page.slug === slug)
describe('content publication contract', () => {
  it.each(['pvp', 'dungeon'] as const)('rejects empty %s task even when the dataset exists', kind => {
    const original = rogueClass.pages.find(p => p.kind === kind)!
    const page = { ...original, primaryBuildId: undefined, relatedBuildIds: [] }
    expect(publishes({ ...rogueClass, pages: [page] }, page.slug)).toBe(false)
  })
  it('rejects PvP using a ordinary specialization allocation record', () => {
    const page = rogueClass.pages.find(p => p.kind === 'pvp')!
    const spec = rogueClass.builds.find(b => b.intent === 'spec')!
    expect(publishes({...rogueClass, pages:[{...page, primaryBuildId:spec.id}]}, page.slug)).toBe(false)
  })
  it('rejects a declared point count different from actual ranks', () => {
    const page = rogueClass.pages.find(p => p.kind === 'specBuild')!
    const builds = rogueClass.builds.map(b => b.id === page.primaryBuildId ? {...b, points:21} : b)
    expect(publishes({...rogueClass, builds}, page.slug)).toBe(false)
  })
  it('rejects unsupported levels and negative, fractional or unknown ranks', () => {
    const route = rogueClass.builds[0]
    for (const rank of [-1, 0.5, NaN]) expect(isLegalAllocation({...route.build, unknown:rank}, rogueClass.talents, rogueClass.plannerConfig,11)).toBe(false)
    expect(isLegalAllocation({...route.build, unknown:0}, rogueClass.talents, rogueClass.plannerConfig,11)).toBe(false)
    const page = rogueClass.pages.find(p => p.primaryBuildId === route.id)!
    expect(publishes({...rogueClass, builds:rogueClass.builds.map(b => b.id === route.id ? {...b, level:30} : b)}, page.slug)).toBe(false)
  })
  it('rejects role pages without actual sourced conditions or with unresolved talent references', () => {
    const page = rogueClass.pages.find(p => p.kind === 'pvp')!
    expect(publishes({...rogueClass,pages:[{...page,roleDecision:undefined}]},page.slug)).toBe(false)
    if (!page.roleDecision) throw new Error('Fixture role task required')
    const roleDecision = {...page.roleDecision, options:page.roleDecision.options.map(o => ({...o,talentIds:['missing-talent']}))}
    expect(publishes({...rogueClass,pages:[{...page,roleDecision}]},page.slug)).toBe(false)
  })
})

describe('reviewed consolidation artifacts', () => {
  it('redirects twenty reviewed entry pages directly to working tasks, including static aliases', () => {
    const paths = new Set(classPagePaths())
    const redirects = classPageRedirects()
    expect(redirects).toHaveLength(40)
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    for (const redirect of redirects) {
      expect(paths.has(redirect.destination)).toBe(true)
      expect(paths.has(redirect.source)).toBe(false)
      expect(config.redirects).toContainEqual(redirect)
      expect(sitemap).not.toContain(`<loc>https://buildforgetools.com${redirect.source}</loc>`)
      expect(existsSync(`${redirect.source.slice(1)}/index.html`)).toBe(false)
    }
    expect(paths.has('/wow-forever-hunter-pet-build')).toBe(true)
    expect(config.redirects.some((r: {source:string}) => r.source === '/wow-forever-hunter-pet-build')).toBe(false)
    expect(paths.has('/wow-forever-warrior-pvp-build')).toBe(true)
  })
  it('keeps endpoint comparison and progression on both clicked leveling destinations', () => {
    for (const slug of ['wow-forever-holy-priest-leveling-build', 'wow-forever-demonology-warlock-leveling-build']) {
      const entry = publishedClassPages(PUBLISHED_CLASSES).find(({page}) => page.slug === slug)!
      const html = renderToStaticMarkup(createElement(ClassExperiencePage, {classDef:entry.classDef, page:entry.page}))
      expect(html).toContain('data-surface="build-workbench"')
      expect(html).toContain('data-surface="level-progression"')
    }
  })
  it('fails if a retirement destination is unpublished or forms a chain', () => {
    const page = rogueClass.pages.find(p => p.retiredTo)!
    expect(() => classPageRedirects([{...rogueClass,pages:rogueClass.pages.map(p => p === page ? {...p,retiredTo:'/missing'} : p)}])).toThrow('Invalid consolidation')
  })
})
