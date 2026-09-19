export type EmbervillePageId = 'planner' | 'builds' | 'classes' | 'inheritance'

export const EMBERVILLE_STATUS = {
  phase: 'Pre-Early Access',
  scope: 'Core mechanics only',
  updated: 'Sep 19, 2026',
  releaseDate: 'Oct 27, 2026',
} as const

export const EMBERVILLE_SOURCES = [
  { label: 'Official Steam page', href: 'https://store.steampowered.com/app/2295170/Emberville/' },
  { label: 'Official developer overview', href: 'https://www.cygnuscross.com/welcome-to-emberville' },
] as const

export const EMBERVILLE_MECHANICS = [
  'Equipment and skill systems',
  'Melee, magic, and ranged combat',
  'Combat class system',
  'Classes can be changed',
  'Active and passive skill inheritance',
] as const

export interface EmbervillePageRecord {
  id: EmbervillePageId
  slug: string
  title: string
  metaTitle: string
  description: string
  eyebrow: string
  heroImage: string
}

export const EMBERVILLE_PAGES: EmbervillePageRecord[] = [
  { id: 'planner', slug: 'emberville', title: 'Emberville Build Planner', metaTitle: 'Emberville Build Planner | BuildForgeTools', description: 'Plan an Emberville build direction around class, weapon, and skill inheritance systems using confirmed pre-Early Access information.', eyebrow: 'A world rebuilds in ash', heroImage: '/images/emberville/planner-hero.jpg' },
  { id: 'builds', slug: 'emberville-builds', title: 'Emberville Builds', metaTitle: 'Emberville Builds | Build Planner & Ideas', description: 'Explore confirmed Emberville build mechanics for melee, magic, ranged, and hybrid playstyles before Early Access.', eyebrow: 'BuildForgeTools', heroImage: '/images/emberville/builds-hero.jpg' },
  { id: 'classes', slug: 'emberville-classes', title: 'Emberville Classes', metaTitle: 'Emberville Classes | Confirmed Systems & Planning', description: 'Learn what is officially confirmed about Emberville classes, switching classes, weapons, and progression before Early Access.', eyebrow: 'Choose a foundation', heroImage: '/images/emberville/classes-hero.jpg' },
  { id: 'inheritance', slug: 'emberville-skill-inheritance', title: 'Emberville Skill Inheritance Guide', metaTitle: 'Emberville Skill Inheritance Guide | BuildForgeTools', description: 'Understand how confirmed active and passive skill inheritance can shape an Emberville build.', eyebrow: 'Different classes, brighter builds', heroImage: '/images/emberville/inheritance-hero.jpg' },
]

export function embervillePageById(id: EmbervillePageId): EmbervillePageRecord {
  return EMBERVILLE_PAGES.find((page) => page.id === id) ?? EMBERVILLE_PAGES[0]
}
