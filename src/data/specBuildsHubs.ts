import type { BuildCardIcon } from '../BuildCard'
import type { Branch } from '../lib/build'

export interface SpecHubBuildType {
  /** Stable analytics key. Never derive this from `eyebrow` — the eyebrow is copy and will change. */
  id: string
  eyebrow: string
  title: string
  description: string
  href: string
  icon: BuildCardIcon
}

export interface SpecBuildsHubConfig {
  spec: Branch
  slug: string
  title: string
  metaTitle: string
  description: string
  intro: string
  featured: { title: string; description: string; href: string; role: string; playstyle: string }
  buildTypes: SpecHubBuildType[]
  talents: { label: string; href: string }[]
  related: { label: string; href: string }[]
}

/**
 * Only specializations with enough of their own pages get a hub. Holy has two
 * spec-specific pages and its healing build lives at a class-wide slug, so it
 * links those directly instead of through a near-empty hub.
 */
export const SPEC_BUILDS_HUBS: SpecBuildsHubConfig[] = [
  {
    spec: 'protection',
    slug: 'wow-forever-protection-paladin-builds',
    title: 'WoW Forever Protection Paladin Builds',
    metaTitle: 'WoW Forever Protection Paladin Builds | Tank Talent Planner',
    description: 'Explore WoW Forever Protection Paladin tank builds, leveling paths, dungeon setups, and talents in the BuildForgeTools planner.',
    intro: 'Explore Protection Paladin tank builds, leveling paths, and talent setups for WoW Forever.',
    featured: {
      title: 'Protection Paladin Dungeon Tank Build',
      description: 'A complete community preview setup for players exploring a defensive Protection path.',
      href: '/wow-forever-protection-paladin-dungeon-build',
      role: 'Dungeon Tank',
      playstyle: 'Defensive / Utility',
    },
    buildTypes: [
      { id: 'dungeon-tank', eyebrow: 'Dungeon Tank', title: 'Protection Paladin Dungeon Tank Build', description: 'Designed for group content and defensive play.', href: '/wow-forever-protection-paladin-dungeon-build', icon: 'protection' },
      { id: 'leveling-tank', eyebrow: 'Leveling Tank', title: 'Protection Paladin Leveling Build', description: 'Start with a safer solo progression path and adapt it in the planner.', href: '/wow-forever-protection-paladin-leveling-build', icon: 'leveling' },
      // The id is an opaque analytics key and deliberately no longer matches the label:
      // retitling the card must not start a new GA4 series.
      { id: 'pvp-protection', eyebrow: 'PvP', title: 'Paladin PvP Builds', description: 'Compare the class-wide PvP routes. No Protection-specific PvP build has been published yet.', href: '/wow-forever-paladin-pvp-build', icon: 'pvp' },
    ],
    talents: [{ label: 'Explore Protection Paladin talents', href: '/wow-forever-protection-paladin-talents' }],
    related: [
      { label: 'Protection Shield Build 20/31/0', href: '/wow-forever-protection-paladin-build' },
      { label: 'Holy Paladin Build', href: '/wow-forever-paladin-build' },
      { label: 'Retribution Paladin Build', href: '/wow-forever-retribution-paladin-build' },
      { label: 'Paladin Leveling Build', href: '/wow-forever-paladin-leveling-build' },
      { label: 'Paladin Talent Calculator', href: '/paladin#calculator' },
    ],
  },
  {
    spec: 'retribution',
    slug: 'wow-forever-retribution-paladin-builds',
    title: 'WoW Forever Retribution Paladin Builds',
    metaTitle: 'WoW Forever Retribution Paladin Builds | Damage Talent Planner',
    description: 'Explore WoW Forever Retribution Paladin damage builds for leveling, PvP, and group content, then plan the talents in the BuildForgeTools planner.',
    intro: 'Explore Retribution Paladin damage builds, leveling routes, and PvP setups for WoW Forever.',
    featured: {
      title: 'Retribution Paladin Build 0/20/31',
      description: 'The community preview allocation every Retribution route on this site starts from.',
      href: '/wow-forever-retribution-paladin-build',
      role: 'Melee Damage',
      playstyle: 'Offensive / Support',
    },
    buildTypes: [
      { id: 'damage-build', eyebrow: 'Damage Build', title: 'Retribution Paladin Build 0/20/31', description: 'The complete offensive allocation with 20 Protection points for survivability.', href: '/wow-forever-retribution-paladin-build', icon: 'retribution' },
      { id: 'leveling', eyebrow: 'Leveling', title: 'Retribution Paladin Leveling Build', description: 'A damage-focused solo route with early Holy support for questing.', href: '/wow-forever-retribution-paladin-leveling-build', icon: 'leveling' },
      { id: 'pvp', eyebrow: 'PvP', title: 'Retribution Paladin PvP Build', description: 'A burst-oriented setup built around short damage windows and utility.', href: '/wow-forever-retribution-paladin-pvp-build', icon: 'pvp' },
    ],
    talents: [{ label: 'Explore Retribution Paladin talents', href: '/wow-forever-retribution-paladin-talents' }],
    related: [
      { label: 'Retribution Paladin Build 0/20/31', href: '/wow-forever-retribution-paladin-build' },
      { label: 'Retribution Leveling Build', href: '/wow-forever-retribution-paladin-leveling-build' },
      { label: 'Retribution PvP Build', href: '/wow-forever-retribution-paladin-pvp-build' },
      { label: 'Paladin Talent Calculator', href: '/paladin#calculator' },
    ],
  },
]

export function specBuildsHubBySpec(spec: Branch) {
  return SPEC_BUILDS_HUBS.find((hub) => hub.spec === spec) ?? SPEC_BUILDS_HUBS[0]
}

export function specHubHrefs(hub: SpecBuildsHubConfig) {
  return [...hub.buildTypes.map((build) => build.href), ...hub.related.map((link) => link.href), ...hub.talents.map((link) => link.href), hub.featured.href]
}
