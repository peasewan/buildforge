import type { BuildCardIcon } from '../BuildCard'

export interface ProtectionBuildType {
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
    eyebrow: 'Dungeon Tank',
    title: 'Protection Paladin Dungeon Tank Build',
    description: 'Designed for group content and defensive play.',
    href: '/wow-forever-protection-paladin-dungeon-build',
    icon: 'protection',
  },
  {
    eyebrow: 'Leveling Tank',
    title: 'Protection Paladin Leveling Build',
    description: 'Start with a safer solo progression path and adapt it in the planner.',
    href: '/wow-forever-paladin-leveling-build',
    icon: 'leveling',
  },
  {
    eyebrow: 'PvP Protection',
    title: 'Protection Paladin PvP Build',
    description: 'Explore utility-focused setups for player combat.',
    href: '/wow-forever-paladin-pvp-build',
    icon: 'pvp',
  },
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
]
