import { PUBLISHED_CLASSES } from './classes'
import { publishedClassPages } from '../lib/classStaticPages'
import type { ClassDefinition, ClassPageKind } from '../lib/classPage'

export const DISCOVERY_PAGES = [
  { id: 'home', path: '/', title: 'BuildForgeTools | WoW Forever & Emberville Build Planners', h1: 'Choose your game. Make your build.', description: 'Explore WoW Forever talent calculators, editorial build routes and source-linked talent data, or explore the Emberville planner preview and core mechanics references.' },
  { id: 'classes', path: '/wow-forever-classes', title: 'WoW Forever Classes & Talent Calculators | BuildForgeTools', h1: 'WoW Forever classes', description: 'Find published calculators, build routes, talent references and leveling pages for all nine WoW Forever classes.' },
  { id: 'builds', path: '/wow-forever-builds', title: 'WoW Forever Builds by Playstyle | BuildForgeTools', h1: 'WoW Forever builds', description: 'Browse published WoW Forever leveling, PvP, dungeon and planning-cap routes across classes. Compare editorial allocations and edit your own build.' },
] as const
export type DiscoveryId = typeof DISCOVERY_PAGES[number]['id']
export interface DiscoveryLink { href: string; label: string }
export interface DiscoveryClass { id: string; name: string; image?: string; branches: string[]; links: DiscoveryLink[] }
const tools: { kind: ClassPageKind; label: string }[] = [{ kind: 'calculator', label: 'Calculator' }, { kind: 'buildsHub', label: 'Builds' }, { kind: 'talents', label: 'Talents' }, { kind: 'leveling', label: 'Leveling' }]
// The legacy Paladin routes are intentionally adapted here, never migrated or rewritten.
const paladin: DiscoveryClass = { id: 'paladin', name: 'Paladin', image: '/images/hero/hero-paladin.webp', branches: ['Holy', 'Protection', 'Retribution'], links: [{ href: '/paladin', label: 'Calculator' }, { href: '/wow-forever-paladin-builds', label: 'Builds' }, { href: '/wow-forever-paladin-talents', label: 'Talents' }, { href: '/wow-forever-paladin-leveling-build', label: 'Leveling' }] }
export function discoveryClasses(classes: ClassDefinition[] = PUBLISHED_CLASSES): DiscoveryClass[] {
  const published = publishedClassPages(classes)
  return [paladin, ...classes.flatMap(def => {
    const pages = published.filter(p => p.classDef === def).map(p => p.page)
    const links = tools.flatMap(tool => { const p = pages.find(p => p.kind === tool.kind); return p ? [{ href: `/${p.slug}`, label: tool.label }] : [] })
    return links.length ? [{ id: def.id, name: def.name, image: def.ogImage, branches: def.branches.map(b => def.branchNames[b]), links }] : []
  })]
}
export const DISCOVERY_INTENTS: { id: string; label: string; description: string; kinds: ClassPageKind[]; paladin: DiscoveryLink[] }[] = [
  { id: 'leveling', label: 'Leveling', description: 'Follow a published route as you spend talent points.', kinds: ['leveling', 'specLeveling', 'aoe'], paladin: [{ href: '/wow-forever-paladin-leveling-build', label: 'Paladin leveling' }] },
  { id: 'pvp', label: 'PvP', description: 'Explore allocations and encounter preparation notes.', kinds: ['pvp', 'specPvp'], paladin: [{ href: '/wow-forever-paladin-pvp-build', label: 'Paladin PvP' }] },
  { id: 'dungeon', label: 'Dungeon & group roles', description: 'Find published dungeon, tanking and healing routes.', kinds: ['dungeon', 'specDungeon', 'tank', 'healing'], paladin: [{ href: '/wow-forever-protection-paladin-dungeon-build', label: 'Protection Paladin dungeon' }] },
  { id: 'planning-cap', label: 'Current planning cap', description: 'Inspect each dataset’s planning level and point budget. These are not live server-cap confirmations.', kinds: ['levelCap'], paladin: [] },
]
export function discoveryGroups(classes: ClassDefinition[] = PUBLISHED_CLASSES, includePaladin = true) {
  const pages = publishedClassPages(classes)
  return DISCOVERY_INTENTS.map(group => {
    const classGroups = [
      ...(includePaladin && group.paladin.length ? [{ id: 'paladin', name: 'Paladin', links: group.paladin }] : []),
      ...classes.flatMap(def => {
        const links = pages.filter(({ classDef, page }) => classDef === def && group.kinds.includes(page.kind)).map(({ page }) => ({ href: `/${page.slug}`, label: page.h1.replace('WoW Forever ', '') }))
        return links.length ? [{ id: def.id, name: def.name, links }] : []
      }),
    ]
    return { ...group, classGroups, links: classGroups.flatMap(c => c.links) }
  })
}
