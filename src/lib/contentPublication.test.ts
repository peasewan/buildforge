import { PAGE_CONSOLIDATIONS } from '../data/pageConsolidations'
import { consolidatedClassTasks } from './classConsolidations'
import { classBuildPlannerHref } from './archivedClassBuild'
import { decodeValidatedPlannerBuild } from './talentPlanner'
import { describe, expect, it } from 'vitest'
import { classPagePaths, classPageRedirects } from './classStaticPages'
import { PUBLISHED_CLASSES } from '../data/classes'
import { readFileSync, existsSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ClassExperiencePage from '../experiences/ClassExperiencePage'
import { rogueClass } from '../data/classes/rogue'
import { contentTaskIssues, isLegalAllocation, publishedClassPages, validClassBuild } from './classPage'

// Task validation must still run for records now served inside a retained hub.
const publishes = (def: typeof rogueClass, slug: string) => publishedClassPages([{
  ...def, pages: def.pages.map(page => page.slug === slug ? { ...page, retiredTo: undefined } : page),
}]).some(({page}) => page.slug === slug)
describe('content publication contract', () => {
  it.each(['pvp', 'dungeon'] as const)('rejects empty %s task even when the dataset exists', kind => {
    const original = rogueClass.pages.find(p => p.kind === kind)!
    expect(publishes(rogueClass, original.slug)).toBe(true)
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
    expect(publishes(rogueClass, page.slug)).toBe(true)
    const builds = rogueClass.builds.map(b => b.id === page.primaryBuildId ? {...b, points:b.points + 1} : b)
    expect(publishes({...rogueClass, builds}, page.slug)).toBe(false)
  })
  it('rejects unsupported levels and negative, fractional or unknown ranks', () => {
    const route = rogueClass.builds[0]
    for (const rank of [-1, 0.5, NaN]) expect(isLegalAllocation({...route.build, unknown:rank}, rogueClass.talents, rogueClass.plannerConfig,11)).toBe(false)
    expect(isLegalAllocation({...route.build, unknown:0}, rogueClass.talents, rogueClass.plannerConfig,11)).toBe(false)
    const page = rogueClass.pages.find(p => p.primaryBuildId === route.id)!
    expect(publishes({...rogueClass, builds:rogueClass.builds.map(b => b.id === route.id ? {...b, level:b.level + 1} : b)}, page.slug)).toBe(false)
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
  it('redirects seventy-one reviewed class entry pages directly to working tasks, including static aliases', () => {
    const paths = new Set(classPagePaths())
    const redirects = classPageRedirects()
    expect(redirects).toHaveLength(142)
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    for (const redirect of redirects) {
      expect(paths.has(redirect.destination)).toBe(true)
      expect(redirects.some(candidate => candidate.source === redirect.destination)).toBe(false)
      expect(paths.has(redirect.source)).toBe(false)
      expect(config.redirects).toContainEqual(redirect)
      expect(sitemap).not.toContain(`<loc>https://buildforgetools.com${redirect.source}</loc>`)
      expect(existsSync(`${redirect.source.slice(1)}/index.html`)).toBe(false)
    }
    expect(paths.has('/wow-forever-hunter-pet-build')).toBe(true)
    expect(config.redirects.some((r: {source:string}) => r.source === '/wow-forever-hunter-pet-build')).toBe(false)
    expect(paths.has('/wow-forever-warrior-pvp-build')).toBe(true)
  })
  it('keeps every approved source task and allocation accessible at its retained calculator or hub', () => {
    const paths = new Set(classPagePaths())
    const manifest = JSON.parse(readFileSync('class-static-pages.json', 'utf8')) as { file: string }[]
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
    const sitemap = readFileSync('public/sitemap.xml', 'utf8')
    const frameworkConsolidations = Object.entries(PAGE_CONSOLIDATIONS).filter(([source]) =>
      PUBLISHED_CLASSES.some(def => def.pages.some(page => `/${page.slug}` === source)))
    expect(frameworkConsolidations).toHaveLength(50)
    for (const [source, target] of frameworkConsolidations) {
      const def = PUBLISHED_CLASSES.find(candidate => candidate.pages.some(page => `/${page.slug}` === source))!
      const page = def.pages.find(candidate => `/${candidate.slug}` === source)!
      const destination = def.pages.find(candidate => `/${candidate.slug}` === target)!
      expect(page.retiredTo, source).toBe(target)
      expect(destination.retiredTo, source).toBeUndefined()
      expect(paths.has(target), source).toBe(true)
      expect(paths.has(source), source).toBe(false)
      expect(manifest.some(entry => entry.file === `${page.slug}/index.html`), source).toBe(false)
      expect(existsSync(`${page.slug}/index.html`), source).toBe(false)
      expect(config.rewrites.some((rewrite: { source: string }) => rewrite.source === source), source).toBe(false)
      expect(sitemap, source).not.toContain(`<loc>https://buildforgetools.com${source}</loc>`)
      expect(consolidatedClassTasks(def, destination), source).toContain(page)
      expect(contentTaskIssues(def, page), source).toEqual([])
      for (const id of new Set([page.primaryBuildId, ...page.relatedBuildIds].filter(Boolean))) {
        const build = def.builds.find(candidate => candidate.id === id)!
        expect(build, `${source}/${id}`).toBeDefined()
        expect(validClassBuild(def, build), `${source}/${id}`).toBe(true)
        expect(paths.has(build.href), `${source}/${id}`).toBe(true)
        const url = new URL(classBuildPlannerHref(def, build), 'https://buildforgetools.com')
        const allocation = decodeValidatedPlannerBuild(url.searchParams.get('build')!, def.talents, { ...def.plannerConfig, pointCap: build.level - 9 })
        expect(allocation, `${source}/${id}`).toEqual(build.build)
      }
    }
  })
  it('keeps exact reviewed rank evidence on newly consolidated current role tasks', () => {
    const roleKinds = new Set(['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'])
    const pages = PUBLISHED_CLASSES.flatMap(def => def.pages
      .filter(page => Object.hasOwn(PAGE_CONSOLIDATIONS, `/${page.slug}`) && roleKinds.has(page.kind))
      .map(page => ({ def, page })))
    expect(pages).toHaveLength(5)
    for (const { def, page } of pages) {
      expect(contentTaskIssues(def, page), page.slug).toEqual([])
      const primary = def.builds.find(build => build.id === page.primaryBuildId)!
      for (const option of page.roleDecision!.options) {
        for (const id of option.talentIds) {
          const talent = def.talents.find(candidate => candidate.id === id)!
          expect(option.explanation, `${page.slug}/${id}`).toContain(talent.rankDescriptions![primary.build[id] - 1])
        }
      }
    }
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
