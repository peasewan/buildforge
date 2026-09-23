import { describe, expect, it } from 'vitest'
import { discoveryClasses, discoveryGroups, DISCOVERY_PAGES } from './siteDiscovery'
import { pageForPath } from '../lib/routes'
import { PUBLISHED_CLASSES } from './classes'

describe('published discovery', () => {
  it('offers nine classes and four distinct intents without withheld links', () => {
    const classes = discoveryClasses()
    expect(classes).toHaveLength(9)
    for (const group of discoveryGroups()) {
      expect(group.classGroups.flatMap(c => c.links)).toEqual(group.links)
      expect(new Set(group.classGroups.map(c => c.id)).size).toBe(group.classGroups.length)
      expect(group.classGroups.every(c => c.links.length > 0)).toBe(true)
    }
    expect(discoveryGroups().map(g => g.id)).toEqual(['leveling', 'pvp', 'dungeon', 'planning-cap'])
    for (const link of [...classes.flatMap(c => c.links), ...discoveryGroups().flatMap(g => g.links)]) {
      expect(pageForPath(link.href).canonical).toBe(`https://buildforgetools.com${link.href}`)
    }
  })
  it('derives links from the publish gate when class requirements are missing', () => {
    const unavailable = { ...PUBLISHED_CLASSES[0], talents: [], builds: [] }
    const classes = discoveryClasses([unavailable])
    expect(classes.flatMap(c => c.links).some(l => l.href === unavailable.plannerPath)).toBe(false)
  })
  it('routes home and directories to distinct self-canonical metadata, including queries', () => {
    for (const page of DISCOVERY_PAGES) {
      expect(pageForPath(page.path, '?build=anything')).toMatchObject({ kind: 'discovery', canonical: `https://buildforgetools.com${page.path}`, title: page.title, robots: 'index, follow' })
    }
    expect(pageForPath('/').title).not.toBe(pageForPath('/paladin').title)
    expect(pageForPath('/build').robots).toBe('noindex, follow')
    expect(pageForPath('/warrior', '?build=x').robots).toBe('noindex, follow')
  })
})
