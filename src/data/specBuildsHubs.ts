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
      { id: 'leveling-tank', eyebrow: 'Archived Leveling', title: 'Protection Paladin Leveling Build', description: 'The old Level 20 route used a removed talent. Review its history, then start a blank planner; no replacement is verified.', href: '/wow-forever-protection-paladin-leveling-build', icon: 'leveling' },
      { id: 'pvp-protection', eyebrow: 'PvP', title: 'Protection Paladin PvP Build', description: 'A defensive route for objectives, survival, control, and team utility.', href: '/wow-forever-protection-paladin-pvp-build', icon: 'pvp' },
    ],
    editorialSections: [
      {
        heading: 'How to Use These Protection Paladin Builds',
        paragraphs: [
          'The complete Protection example on BuildForgeTools uses a 20/31/0 allocation: 31 points establish the defensive Protection core and 20 supporting points come from Holy. The full build page lists every selected rank and loads the same allocation into the calculator. Use that page when you want an exact setup rather than a general description of tank play.',
          'The dungeon page explains the jobs a group tank must plan around. The leveling page now preserves an older Level 20 route for comparison: it included Improved Holy Strike, which Blizzard removed on September 24. Do not load that archived allocation as a current route. The separate 20/31/0 example is a longer-term community build, not a verified replacement for Level 20. Talent fields in the planner are from client build 1.60.1.69913 and remain under review against later Beta changes.',
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
          'A leveling route values consistency across many ordinary fights, while a dungeon route gives more weight to party protection and tools for difficult pulls. The archived Level 20 Protection route included a talent since removed, so it cannot be treated as a verified progression into the separate 20/31/0 tank example. Compare the two pages as different planning records until a replacement early-level path is reviewed.',
          'Use the archived leveling page to see why the earlier point order was retired, the dungeon page to review the group role, and the complete Shield build to inspect every rank of a separate 51-point example. To plan current leveling, begin with a blank calculator and check each point against the latest client before sharing it. We will publish a new step-by-step Protection route only after its data and allocation are reviewed.',
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
      description: 'A historical 69913-era allocation; its Crusade ranks await 70009 identity review.',
      href: '/wow-forever-retribution-paladin-build',
      role: 'Melee Damage',
      playstyle: 'Offensive / Support',
    },
    buildTypes: [
      { id: 'damage-build', eyebrow: 'Damage Build', title: 'Retribution Paladin Build 0/20/31', description: 'Historical 69913 allocation with 20 Protection points; Crusade awaits review.', href: '/wow-forever-retribution-paladin-build', icon: 'retribution' },
      { id: 'leveling', eyebrow: 'Leveling', title: 'Retribution Paladin Leveling Build', description: 'Historical 20/0/31 route with Holy support; its Crusade ranks await review.', href: '/wow-forever-retribution-paladin-leveling-build', icon: 'leveling' },
      { id: 'pvp', eyebrow: 'PvP', title: 'Retribution Paladin PvP Build', description: 'A burst-oriented setup built around short damage windows and utility.', href: '/wow-forever-retribution-paladin-pvp-build', icon: 'pvp' },
    ],
    editorialSections: [
      {
        heading: 'Compare the Retribution Paladin Routes',
        paragraphs: [
          'BuildForgeTools preserves two complete 51-point Retribution examples from the imported 69913 snapshot. The 0/20/31 Judgment build used 31 Retribution points and 20 Protection points for defensive support. The 20/0/31 leveling example used the same deep Retribution route with Holy support. Both selected Crusade. A reported 70009 client removal names Crusade but its node ID conflicts with the imported record, so these two allocations are historical and under review. Their individual pages list the old ranks for comparison but start a blank calculator instead of loading them as current builds.',
          'The Retribution PvP page is also a planning discussion, not a fully verified PvP allocation. Its 51-point preview shares that under-review Crusade branch and is visibly marked historical. Use the separate Level 20 route for an editable current-cap example, or start a blank tree for a fresh PvP setup.',
        ],
      },
      {
        heading: 'Choosing Between 0/20/31 and 20/0/31',
        paragraphs: [
          'In those historical examples, the Protection-supported build aimed at a sturdier offensive role in group play. The Holy-supported version aimed at steadier solo progression. These older allocations can help readers compare why the remaining 20 points were placed in different branches, but neither is a current route while the Crusade identity remains unresolved.',
          'Open both full build pages and compare the selected-talent columns rather than their three-number summaries alone. A 31-point Retribution core can look similar at a glance while the supporting branch changes recovery, durability, and utility. Start a fresh calculator route when you want a playable allocation and copy its own URL after checking the latest patch information.',
        ],
      },
      {
        heading: 'Planning the Retribution Talent Core',
        paragraphs: [
          'A useful Retribution plan begins with the role of the build: solo leveling, general damage, or PvP pressure. Spend toward the talents that serve that role, then check whether prerequisite ranks and tree-point thresholds leave enough room for the supporting branch. Familiar landmarks such as Benediction, Conviction, Seal of Command, Vengeance, and Repentance help readers follow the path, while Forever-specific or changed talents require stronger source notes.',
          'The interface enforces the imported 69913 snapshot’s rank limits and unlocking rules, with the official September 24 removal blocked separately. That prevents some internally invalid paths, but it cannot prove that all later tuning has been reconciled or that any allocation performs best. Treat each selected rank as a planning model and compare it with the latest game client.',
        ],
      },
      {
        heading: 'Retribution Data Status',
        paragraphs: [
          'Retribution mixes recognizable inherited talents with WoW Forever additions and revisions. The calculator reads ranks, positions, prerequisite links, and effects from the last fully imported Beta client build 1.60.1.69913; later patch notes are shown separately until their client identities reconcile.',
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
