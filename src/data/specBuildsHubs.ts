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
  featured: { title: string; description: string; href: string; role: string; playstyle: string; status: string }
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
      description: 'A historical 51-point Protection reference; start a blank route for the live Level 30 cap.',
      href: '/wow-forever-protection-paladin-dungeon-build',
      role: 'Dungeon Tank',
      playstyle: 'Defensive / Utility',
      status: 'Historical 51-point reference',
    },
    buildTypes: [
      { id: 'dungeon-tank', eyebrow: 'Dungeon Tank', title: 'Protection Paladin Dungeon Tank Build', description: 'A historical full allocation for group tank planning, not a current-cap build.', href: '/wow-forever-protection-paladin-dungeon-build', icon: 'protection' },
      { id: 'leveling-tank', eyebrow: 'Level 20–30', title: 'Protection Paladin Leveling Build', description: 'Load an editorial 0/11/0 starter or 0/21/0 current-cap route checked against newer Protection client nodes.', href: '/wow-forever-protection-paladin-leveling-build', icon: 'leveling' },
      { id: 'pvp-protection', eyebrow: 'PvP', title: 'Protection Paladin PvP Build', description: 'A defensive route for objectives, survival, control, and team utility.', href: '/wow-forever-protection-paladin-pvp-build', icon: 'pvp' },
    ],
    editorialSections: [
      {
        heading: 'How to Use These Protection Paladin Builds',
        paragraphs: [
          'The historical Protection example on BuildForgeTools uses a 20/31/0 allocation: 31 points establish a defensive Protection core and 20 supporting points come from Holy. Its full build page lists every selected rank, but the 51 points exceed the live Level 30 cap. For the active Beta, the separate leveling page now offers editable 0/11/0 and 0/21/0 routes.',
          'The dungeon page explains the jobs a group tank must plan around. The Protection leveling page uses Toughness, Redoubt, Precision, Anticipation, and Improved Righteous Fury in an editorial order. The selected node IDs, positions, ranks, and prerequisite edges were checked in the 70170 Beta Trait tables; ForeverDiff reports 70205 table records unchanged. This focused route review does not promote the complete calculator beyond its explicitly labeled 69913 snapshot.',
        ],
      },
      {
        heading: 'Protection Priorities for a Tank Planner',
        paragraphs: [
          'Start by deciding what the build must do. A dungeon tank needs a dependable defensive base, a way to keep enemy attention, and enough utility to respond when a pull changes. In the planner, check the talents that support those jobs before spending points simply to reach a deeper row. The point counter and prerequisite locks show whether the route is legal, but they cannot decide whether a talent fits a particular party or encounter.',
          'The historical 51-point example reaches Holy Shield as the Protection endpoint and uses Holy support for the remaining allocation. Because beta behavior can differ from inherited Classic behavior, names such as Toughness, Anticipation, Redoubt, and Holy Shield are useful landmarks rather than proof that every number is unchanged. Open the dedicated Protection talents page to inspect the displayed tree, then verify important effects against the current game client before treating the result as final.',
        ],
      },
      {
        heading: 'Dungeon Tank and Leveling Tradeoffs',
        paragraphs: [
          'A leveling route values consistency across many ordinary fights, while a dungeon route gives more weight to party protection and tools for difficult pulls. The current 0/11/0 and 0/21/0 Protection allocations are standard-progression examples without Legacy: Talented. Their selected nodes avoid the prerequisite edges whose required ranks are still inferred by the planner.',
          'Use the leveling page to load either reviewed-node milestone, the dungeon page to review the group role, and the historical Shield build to inspect a separate 51-point example. Blizzard changed Redoubt to 4/8/12/16/20% on October 1. The imported 69913 tooltips may still show the earlier values, so check the official patch note before evaluating the current route.',
        ],
      },
      {
        heading: 'Protection Data Status',
        paragraphs: [
          'BuildForgeTools separates confirmed information, community-supported information, and details that still need review. Beta client records may confirm a talent or ability name without confirming its tree coordinate, point cost, prerequisite, or final tooltip. New records enter the beta comparison process first, and the public tree changes only after the fields needed by the planner can be reviewed together.',
          'Protection has several full 51-point historical examples and one reviewed-node current-cap editorial route. Neither is a measured performance ranking. Check the Beta tracker for later patch notices and client-import status, and use the Feedback button when an in-game value conflicts with the planner.',
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
      status: 'Historical 51-point reference',
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
          'The Retribution PvP page is also a planning discussion, not a fully verified PvP allocation. Its 51-point preview shares that under-review Crusade branch and is visibly marked historical. The separate Level 20 starting snapshot is an editable 11-point route under the official Level 30 cap, not a completed current-cap build. Start a blank tree for a fresh PvP setup.',
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
