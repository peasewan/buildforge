import { readFileSync } from 'node:fs'
import { pageForPath } from '../lib/routes'
import { DISCOVERY_PAGES } from './siteDiscovery'
import { describe, expect, it } from 'vitest'
import { EMBERVILLE_EDITORIAL, EMBERVILLE_MECHANICS, EMBERVILLE_PAGES, EMBERVILLE_SOURCES, EMBERVILLE_STATUS } from './emberville'

describe('Emberville verified preview data', () => {
  it('publishes the notebook and the two sourced system guides', () => {
    expect(EMBERVILLE_STATUS.releaseDate).toBe('Oct 27, 2026')
    expect(EMBERVILLE_PAGES.map((page) => page.slug)).toEqual(['emberville', 'emberville-classes', 'emberville-skill-inheritance'])
    expect(EMBERVILLE_SOURCES.map((source) => source.href)).toContain('https://store.steampowered.com/app/2295170/Emberville/')
    expect(EMBERVILLE_MECHANICS).toContain('Active and passive skill inheritance')
  })

  it('does not ship invented gameplay entities', () => {
    const content = JSON.stringify({ EMBERVILLE_PAGES, EMBERVILLE_MECHANICS, EMBERVILLE_EDITORIAL })
    for (const claim of ['Swordsman', 'Longsword', 'best build', '3 slots', 'mastery threshold']) expect(content).not.toContain(claim)
  })

  it('gives every page distinct editorial sections', () => {
    const headings = Object.values(EMBERVILLE_EDITORIAL).flatMap((sections) => sections.map((section) => section.heading))
    expect(new Set(headings).size).toBe(headings.length)
    for (const sections of Object.values(EMBERVILLE_EDITORIAL)) expect(sections.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps build-direction guidance on the planner', () => {
    const headings = EMBERVILLE_EDITORIAL.planner.map((section) => section.heading)
    expect(headings).toContain('Choose a build direction before choosing details')
    expect(headings).toContain('Turn a direction into questions to test')
  })
})


it('keeps notebook metadata, browser routing and the static shell aligned on the existing URL', () => {
  const page = EMBERVILLE_PAGES.find(page => page.id === 'planner')!
  expect(page.title).toBe('Emberville Preview Notebook')
  expect(page.metaTitle).toBe('Emberville Preview Notebook & Confirmed Mechanics | BuildForgeTools')
  expect(page.description).toContain('private notes')
  expect(page.description).toContain('cannot validate game builds or inheritance compatibility')
  const route = pageForPath('/emberville')
  expect(route).toMatchObject({ kind: 'emberville', embervillePageId: 'planner', title: page.metaTitle, description: page.description, canonical: 'https://buildforgetools.com/emberville', robots: 'index, follow' })
  const shell = new DOMParser().parseFromString(readFileSync('emberville/index.html', 'utf8'), 'text/html')
  expect(shell.title).toBe(page.metaTitle)
  expect(shell.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description)
  expect(shell.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(page.metaTitle)
  expect(shell.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(route.canonical)
  const schema = JSON.parse(shell.querySelector('script[type="application/ld+json"]')!.textContent!)
  expect(schema).toMatchObject({ '@type': 'WebApplication', name: page.metaTitle, description: page.description, url: route.canonical })
})

it('describes the Emberville home entry as a preview notebook while retaining the WoW tools', () => {
  const home = DISCOVERY_PAGES.find(page => page.id === 'home')!
  expect(home.title).toBe('BuildForgeTools | WoW Forever Tools & Emberville Preview Notebook')
  expect(home.description).toContain('Emberville preview notebook')
  expect(home.description).toContain('WoW Forever talent calculators')
  const shell = new DOMParser().parseFromString(readFileSync('index.html', 'utf8'), 'text/html')
  expect(shell.title).toBe(home.title)
  expect(shell.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(home.title)
  expect(shell.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(home.description)
})
