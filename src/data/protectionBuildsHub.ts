import type { BuildCardIcon } from '../BuildCard'

export interface ProtectionBuildType {
  /** Stable analytics key. Never derive this from `eyebrow` — the eyebrow is copy and will change. */
  id: string
  eyebrow: string
  title: string
  description: string
  href: string
  icon: BuildCardIcon
}

export const PROTECTION_HUB_TITLE = 'WoW Forever Protection Paladin Builds'

export const PROTECTION_HUB_INTRO = 'Explore Protection Paladin tank builds, leveling paths, and talent setups for WoW Forever.'

export const PROTECTION_HUB_BUILD_TYPES: ProtectionBuildType[] = [
  {
    id: 'dungeon-tank',
    eyebrow: 'Dungeon Tank',
    title: 'Protection Paladin Dungeon Tank Build',
    description: 'Designed for group content and defensive play.',
    href: '/wow-forever-protection-paladin-dungeon-build',
    icon: 'protection',
  },
  {
    id: 'leveling-tank',
    eyebrow: 'Leveling Tank',
    title: 'Protection Paladin Leveling Build',
    description: 'Start with a safer solo progression path and adapt it in the planner.',
    href: '/wow-forever-protection-paladin-leveling-build',
    icon: 'leveling',
  },
  {
    // The id is an opaque analytics key and deliberately no longer matches the label:
    // retitling the card must not start a new GA4 series.
    id: 'pvp-protection',
    eyebrow: 'PvP',
    title: 'Paladin PvP Builds',
    description: 'Compare the class-wide PvP routes. No Protection-specific PvP build has been published yet.',
    href: '/wow-forever-paladin-pvp-build',
    icon: 'pvp',
  },
]

export const PROTECTION_HUB_TALENTS: { label: string; href: string }[] = [
  { label: 'Explore Protection Paladin talents', href: '/wow-forever-protection-paladin-talents' },
]

export const PROTECTION_HUB_RELATED: { label: string; href: string }[] = [
  { label: 'Protection Shield Build 20/31/0', href: '/wow-forever-protection-paladin-build' },
  { label: 'Holy Paladin Build', href: '/wow-forever-paladin-build' },
  { label: 'Retribution Paladin Build', href: '/wow-forever-retribution-paladin-build' },
  { label: 'Paladin Leveling Build', href: '/wow-forever-paladin-leveling-build' },
  { label: 'Paladin Talent Calculator', href: '/paladin#calculator' },
]

export const PROTECTION_HUB_HREFS = [
  ...PROTECTION_HUB_BUILD_TYPES.map((build) => build.href),
  ...PROTECTION_HUB_RELATED.map((link) => link.href),
  ...PROTECTION_HUB_TALENTS.map((link) => link.href),
]
