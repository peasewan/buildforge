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
  editorialSections: { heading: string; paragraphs: string[] }[]
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
      description: 'A complete community build example for players exploring a defensive Protection path.',
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
    editorialSections: [
      {
        heading: 'How to Use These Protection Paladin Builds',
        paragraphs: [
          'The complete Protection example on BuildForgeTools uses a 20/31/0 allocation: 31 points establish the defensive Protection core and 20 supporting points come from Holy. The full build page lists every selected rank and loads the same allocation into the calculator. Use that page when you want an exact setup rather than a general description of tank play.',
          'The dungeon and leveling pages approach the same current example allocation from different situations. The dungeon page explains the jobs a group tank must plan around, while the leveling page describes how a durable route can develop before all 51 points are available. They are not presented as separate, proven best-in-slot talent trees. The talent fields come from Beta client build 1.60.1.69913; the build recommendations still require player testing.',
        ],
      },
      {
        heading: 'Protection Priorities for a Tank Planner',
        paragraphs: [
          'Start by deciding what the build must do. A dungeon tank needs a dependable defensive base, a way to keep enemy attention, and enough utility to respond when a pull changes. In the planner, check the talents that support those jobs before spending points simply to reach a deeper row. The point counter and prerequisite locks show whether the route is legal, but they cannot decide whether a talent fits a particular party or encounter.',
          'The current example reaches Holy Shield as the Protection endpoint and uses Holy support for the remaining allocation. Because beta behavior can differ from inherited Classic behavior, names such as Toughness, Anticipation, Redoubt, and Holy Shield are useful landmarks rather than proof that every number is unchanged. Open the dedicated Protection talents page to inspect the displayed tree, then verify important effects against the current game client before treating the result as final.',
        ],
      },
      {
        heading: 'Dungeon Tank and Leveling Tradeoffs',
        paragraphs: [
          'A leveling route values consistency across many ordinary fights. Extra durability can reduce recovery time and make an unexpected additional enemy less punishing. A dungeon route gives more weight to party protection, threat behavior, and the tools used during difficult pulls. The same underlying talent can matter for different reasons, so the recommended reading order changes even when the eventual 20/31/0 allocation is shared.',
          'Use the leveling page when planning how the character grows, the dungeon page when reviewing the role in group content, and the complete Shield build when you need every rank at once. If testing shows that a different supporting branch or rank order works better, change it in the calculator and copy the new build URL. Shared links preserve the exact selection without turning one community build example into a universal recommendation.',
        ],
      },
      {
        heading: 'Protection Data Status',
        paragraphs: [
          'BuildForgeTools separates confirmed information, community-supported information, and details that still need review. Beta client records may confirm a talent or ability name without confirming its tree coordinate, point cost, prerequisite, or final tooltip. New records enter the beta comparison process first, and the public tree changes only after the fields needed by the planner can be reviewed together.',
          'Protection currently has the strongest set of complete example pages on the site, but “complete build” describes the 51-point allocation rather than a performance ranking. Check the Beta tracker for the current client build and use the Feedback button when an in-game value conflicts with the planner.',
        ],
      },
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
      description: 'The community build allocation every Retribution route on this site starts from.',
      href: '/wow-forever-retribution-paladin-build',
      role: 'Melee Damage',
      playstyle: 'Offensive / Support',
    },
    buildTypes: [
      { id: 'damage-build', eyebrow: 'Damage Build', title: 'Retribution Paladin Build 0/20/31', description: 'The complete offensive allocation with 20 Protection points for survivability.', href: '/wow-forever-retribution-paladin-build', icon: 'retribution' },
      { id: 'leveling', eyebrow: 'Leveling', title: 'Retribution Paladin Leveling Build', description: 'A damage-focused solo route with early Holy support for questing.', href: '/wow-forever-retribution-paladin-leveling-build', icon: 'leveling' },
      { id: 'pvp', eyebrow: 'PvP', title: 'Retribution Paladin PvP Build', description: 'A burst-oriented setup built around short damage windows and utility.', href: '/wow-forever-retribution-paladin-pvp-build', icon: 'pvp' },
    ],
    editorialSections: [
      {
        heading: 'Compare the Retribution Paladin Routes',
        paragraphs: [
          'BuildForgeTools currently provides two complete 51-point Retribution examples. The 0/20/31 Judgment build commits 31 points to Retribution and uses 20 Protection points for defensive support. The 20/0/31 leveling example reaches the same deep Retribution path but places its supporting points in Holy. Their individual pages list every selected rank, explain the purpose of the allocation, and open that exact setup in the calculator.',
          'The Retribution PvP page is different. It describes planning goals for burst windows, utility, and survival, but it is not yet labeled as a fully verified PvP allocation. Use it to frame a custom setup rather than assuming that a general PvP direction has the same evidence as the published 0/20/31 and 20/0/31 examples.',
        ],
      },
      {
        heading: 'Choosing Between 0/20/31 and 20/0/31',
        paragraphs: [
          'Choose the supporting branch by the problem you want the remaining 20 points to solve. The Protection-supported example is organized around a sturdier offensive build for group play. The Holy-supported leveling example emphasizes a solo progression route that can keep familiar Retribution damage talents while adding support from a different tree. Neither label makes the allocation optimal for every player, encounter, or stage of beta testing.',
          'Open both full build pages and compare the selected-talent columns instead of comparing only their three-number summaries. A 31-point Retribution core can look similar at a glance while the supporting branch changes how the character handles recovery, durability, and utility. The calculator lets you remove ranks, test a hybrid, and copy a distinct URL without overwriting either published example.',
        ],
      },
      {
        heading: 'Planning the Retribution Talent Core',
        paragraphs: [
          'A useful Retribution plan begins with the role of the build: solo leveling, general damage, or PvP pressure. Spend toward the talents that serve that role, then check whether prerequisite ranks and tree-point thresholds leave enough room for the supporting branch. Familiar landmarks such as Benediction, Conviction, Seal of Command, Vengeance, and Repentance help readers follow the path, while Forever-specific or changed talents require stronger source notes.',
          'The interface enforces the current Beta dataset’s rank limits and unlocking rules. That prevents an internally invalid shared build, but it does not prove that the selected allocation performs best. Treat the selected ranks as a planning model and test the build before using it as a competitive recommendation.',
        ],
      },
      {
        heading: 'Retribution Data Status',
        paragraphs: [
          'Retribution mixes recognizable inherited talents with WoW Forever additions and revisions. The calculator reads the current rank count, position, prerequisite, and effect from Beta client build 1.60.1.69913 instead of assuming a familiar Classic talent is unchanged.',
          'The Beta tracker compares each reviewed client build with the previous dataset before production changes. Players can report conflicting tooltips or positions through the Feedback button so a correction enters the same review process.',
        ],
      },
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
