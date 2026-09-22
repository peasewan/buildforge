import type { ClassBuild, ClassDefinition, ClassPageDefinition } from '../../lib/classPage'
import { MAGE_BRANCHES, MAGE_DATA_VERSION, MAGE_PLANNER_CONFIG, MAGE_SOURCES, mageBranchNames, mageBranchTaglines, mageTalents, type MageBranch } from '../mageTalents'

/**
 * The Mage class package: the fifteen spec URLs and the editorial allocations that back them.
 *
 * Evidence boundary: every talent fact on these pages comes from `mageTalents` (dual-source client
 * records reviewed through build 1.60.1.69913). Every allocation, talent order, playstyle note and
 * farming loop is editorial — `community_verified` or `derived_assumption` — and never a client fact.
 *
 * `Improved Fireball` has a display-column disagreement between the two derived web views. Build
 * 1.60.1.69913's primary client Talent table resolves it to row 1, column 2, so Fire now has a legal
 * planner entry point. Fire build pages remain withheld for a separate reason: this package does
 * not yet carry a reviewed Fire allocation, and no URL promises a preset it cannot deliver.
 */

const MAGE_UPDATED = '2026-09-22'
const BUILD_VERIFIED = '1.60.1.69913'
const MAGE_HERO = '/images/mage/mage-hero-v1.webp'
const FROST_MAGE_HERO = '/images/mage/frost-mage-hero-v1.webp'
const ARCANE_MAGE_HERO = '/images/mage/arcane-mage-hero-v1.webp'

/** Published talent ids, so no allocation can name a node the dataset does not carry. */
const T = {
  arcaneFocus: 'mage-arcane-arcane-focus',
  improvedChanneling: 'mage-arcane-improved-channeling',
  arcaneConcentration: 'mage-arcane-arcane-concentration',
  arcaneImpact: 'mage-arcane-arcane-impact',
  frostWarding: 'mage-frost-frost-warding',
  improvedFrostbolt: 'mage-frost-improved-frostbolt',
  iceShards: 'mage-frost-ice-shards',
  improvedFrostNova: 'mage-frost-improved-frost-nova',
  piercingIce: 'mage-frost-piercing-ice',
  improvedBlizzard: 'mage-frost-improved-blizzard',
}

/** The eleven-point question, answered the same way on every page that presents a build. */
const ELEVEN_POINT_NOTE = 'At the current Level 20 Beta cap a Mage has 11 talent points. Every allocation on this page spends all 11.'

const evidenceBoundary = 'Talent names, positions and ranks are dual-source client records reviewed through build 1.60.1.69913. The allocation and the order it is spent in are editorial recommendations for testing, not official or guaranteed best builds.'

const mageBuilds: ClassBuild[] = [
  {
    id: 'mage-frost-build',
    spec: 'frost',
    intent: 'spec',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage Build (Level 20)',
    shortTitle: 'Frost Mage',
    role: 'Frost single-target damage',
    playstyle: [
      'Open with Frostbolt and keep the chill effect on the target while you build ranks',
      'Hold Ice Shards for the moments the target is frozen or rooted',
      'Frost Nova buys the cast time back when a pull goes wrong',
    ],
    strengths: ['Chill slows every approach', 'Frost Nova resets a bad pull', 'Damage holds up without gear'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.piercingIce],
    order: [T.improvedFrostbolt, T.iceShards, T.piercingIce],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 5, [T.piercingIce]: 1 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Frost Mage route, current Beta cap', url: 'https://buildforgetools.com/wow-forever-frost-mage-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-frost-mage-build',
  },
  {
    id: 'mage-frost-leveling',
    spec: 'frost',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage Leveling Build (Level 20)',
    shortTitle: 'Frost Leveling',
    role: 'Frost solo leveling',
    playstyle: [
      'Pull at range with Frostbolt so the chill slow starts before the mob reaches you',
      'Frost Nova when a second mob joins, then walk out of melee range and keep casting',
      'Save Ice Shards ranks for frozen targets instead of spending them on the opener',
    ],
    strengths: ['Slows make solo pulls survivable', 'Two roots answer an add', 'No dependence on a group'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 4, [T.improvedFrostNova]: 2 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Frost Mage leveling route, current Beta cap', url: 'https://buildforgetools.com/wow-forever-frost-mage-leveling-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-frost-mage-leveling-build',
  },
  {
    id: 'mage-frost-aoe',
    spec: 'frost',
    intent: 'aoe',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage AoE Build (Level 20)',
    shortTitle: 'Frost AoE',
    role: 'Frost area damage',
    playstyle: [
      'Group the pull, then root it with Frost Nova before the area casts land',
      'Spend the single Improved Blizzard rank on packs, never on one target',
      'Ice Shards at three ranks carries the single-target damage this build gives up',
    ],
    strengths: ['Root plus area cast covers a pack', 'Only one rank is needed for the area tool', 'Kiting keeps the pack off you'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova, T.improvedBlizzard],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova, T.improvedBlizzard],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 3, [T.improvedFrostNova]: 2, [T.improvedBlizzard]: 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Frost Mage area route, current Beta cap', url: 'https://buildforgetools.com/wow-forever-frost-mage-aoe-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-frost-mage-aoe-build',
  },
  {
    id: 'mage-arcane-build',
    spec: 'arcane',
    intent: 'spec',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '11/0/0',
    title: 'Arcane Mage Build (Level 20)',
    shortTitle: 'Arcane Mage',
    role: 'Arcane single-target damage',
    playstyle: [
      'Lean on Arcane Focus ranks so the early casts land through pushback',
      'Improved Channeling keeps the channel from being interrupted mid-pull',
      'Hold the single Arcane Concentration rank for the pulls that run long',
    ],
    strengths: ['Pushback resistance on the opener', 'Channelled damage survives a hit', 'Mana lasts through a long pull'],
    keyTalentIds: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    order: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    build: { [T.arcaneFocus]: 5, [T.improvedChanneling]: 5, [T.arcaneConcentration]: 1 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Arcane Mage route, current Beta cap', url: 'https://buildforgetools.com/wow-forever-arcane-mage-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-arcane-mage-build',
  },
  {
    id: 'mage-arcane-leveling',
    spec: 'arcane',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '11/0/0',
    title: 'Arcane Mage Leveling Build (Level 20)',
    shortTitle: 'Arcane Leveling',
    role: 'Arcane solo leveling',
    playstyle: [
      'Fight one mob at a time and let Arcane Concentration cover the mana cost',
      'Use Arcane Focus ranks to keep casting while the mob is still walking in',
      'Skip frost control entirely and accept a longer time to kill',
    ],
    strengths: ['Little downtime between pulls', 'Simple single-target loop', 'No control tools to manage'],
    keyTalentIds: [T.arcaneFocus, T.arcaneConcentration, T.arcaneImpact],
    order: [T.arcaneFocus, T.arcaneConcentration, T.arcaneImpact],
    build: { [T.arcaneFocus]: 5, [T.arcaneConcentration]: 5, [T.arcaneImpact]: 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Arcane Mage leveling route, current Beta cap', url: 'https://buildforgetools.com/wow-forever-arcane-mage-leveling-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-arcane-mage-leveling-build',
  },
  {
    // The class-level recommendation. Frost is chosen for the whole class, not just for one page.
    id: 'mage-leveling',
    spec: 'frost',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Mage Leveling Build (Frost)',
    shortTitle: 'Mage Leveling',
    role: 'Frost solo leveling, recommended for the class',
    playstyle: [
      'Level as Frost: the slow and the two roots are what carry a solo player',
      'Frost Nova then walk out of range whenever a pull turns into two mobs',
      'Spend the last two points on Frost Nova ranks before touching anything deeper',
    ],
    strengths: ['Chill slows every pull', 'Two roots answer adds', 'Works without a group or gear'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 4, [T.improvedFrostNova]: 2 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Mage leveling recommendation, current Beta cap', url: 'https://buildforgetools.com/wow-forever-mage-leveling-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-leveling-build',
  },
  {
    id: 'mage-dungeon',
    spec: 'frost',
    intent: 'dungeon',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Mage Dungeon Build (Frost)',
    shortTitle: 'Dungeon Frost',
    role: 'Frost dungeon damage with control',
    playstyle: [
      'Open the Frost Warding ranks first so early pulls cost less attention',
      'Keep the chill slow on the target the group is killing, not on the stragglers',
      'Frost Nova is the group control button; spend it when the tank is being chased',
    ],
    strengths: ['Control that helps the whole group', 'Damage that needs no setup', 'Frost Warding covers early pulls'],
    keyTalentIds: [T.frostWarding, T.improvedFrostbolt, T.iceShards],
    order: [T.frostWarding, T.improvedFrostbolt, T.iceShards],
    build: { [T.frostWarding]: 2, [T.improvedFrostbolt]: 5, [T.iceShards]: 4 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Mage dungeon route, current Beta cap', url: 'https://buildforgetools.com/wow-forever-mage-dungeon-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-dungeon-build',
  },
  {
    id: 'mage-frost-pvp',
    spec: 'frost',
    intent: 'pvp',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage PvP Build (Level 20)',
    shortTitle: 'Frost PvP',
    role: 'Frost player-versus-player damage and control',
    playstyle: [
      'Max Frostbolt and Ice Shards: pressure is the point, control is what buys it',
      'One Frost Nova rank is the escape, not the opener',
      'Chill keeps a melee target reachable by your group',
    ],
    strengths: ['Slow keeps targets in range', 'Root breaks a melee push', 'Damage needs no setup'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 5, [T.improvedFrostNova]: 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Mage PvP routes, current Beta cap', url: 'https://buildforgetools.com/wow-forever-mage-pvp-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-pvp-build',
  },
  {
    id: 'mage-arcane-pvp',
    spec: 'arcane',
    intent: 'pvp',
    level: 20,
    levelCap: 20,
    phase: 'Current Beta',
    points: 11,
    allocation: '11/0/0',
    title: 'Arcane Mage PvP Build (Level 20)',
    shortTitle: 'Arcane PvP',
    role: 'Arcane player-versus-player damage',
    playstyle: [
      'Arcane Focus and Improved Channeling keep the damage coming under pressure',
      'Three Arcane Concentration ranks stretch the mana bar through a long fight',
      'No roots: this route trades control for raw channel uptime',
    ],
    strengths: ['Damage lands through pushback', 'Long fights stay affordable', 'Channels resist interruption'],
    keyTalentIds: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    order: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    build: { [T.arcaneFocus]: 5, [T.improvedChanneling]: 3, [T.arcaneConcentration]: 3 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Mage PvP routes, current Beta cap', url: 'https://buildforgetools.com/wow-forever-mage-pvp-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_UPDATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-pvp-build',
  },
]

/**
 * The fifteen spec URLs, declared as one literal so `publishRequirements` is contextually typed
 * against `PublishRequirement` — no cast, and a misspelled requirement fails typecheck.
 */
const magePages: ClassPageDefinition[] = [
  {
    kind: 'calculator',
    slug: 'mage',
    intent: 'Talent Calculator',
    title: 'WoW Forever Mage Talent Calculator – Arcane, Fire & Frost',
    h1: 'WoW Forever Mage Talent Calculator',
    description: 'Build Arcane, Fire and Frost Mage talent trees from current WoW Forever Beta data, spend the 11 points of the Level 20 cap and share the exact build link.',
    eyebrow: 'Beta Talent Planner',
    canonical: 'https://buildforgetools.com/mage',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    relatedBuildIds: ['mage-frost-leveling', 'mage-arcane-build'],
    relatedPages: [
      { href: '/wow-forever-mage-builds', label: 'WoW Forever Mage Builds' },
      { href: '/wow-forever-mage-talents', label: 'WoW Forever Mage Talents & Talent Trees' },
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
    ],
    publishRequirements: ['completeClassPlanner'],
    sections: [
      {
        heading: 'How the Mage calculator works',
        paragraphs: [
          'Spend points across the three Mage trees at the level cap you are planning for, inspect every rank before you commit it, and copy a link that reloads exactly the tree you built.',
          ELEVEN_POINT_NOTE,
        ],
        bullets: [
          'Level 20, 30 and 60 planning modes with 11, 21 and 51 talent points',
          'Rank tooltips, prerequisite messages and required-tree-point labels on every node',
          'Copy build link, reset, and recommended build presets',
        ],
      },
      {
        heading: 'Where the three trees stand at the current cap',
        paragraphs: [
          'Arcane, Fire and Frost each have a client-reviewed entry node that can take the first point. Improved Fireball is the Fire entry: its column conflict between the two derived web views is resolved to row 1, column 2 by the build 1.60.1.69913 client Talent table.',
          'The calculator can therefore spend points in all three trees. Frost and Arcane have reviewed presets; Fire stays a blank canvas until a reproducible editorial allocation is reviewed.',
        ],
      },
      {
        heading: 'Talent data and build data are separate',
        paragraphs: [
          'Talent names, positions and ranks come from dual-source client records reviewed through build 1.60.1.69913. Recommended builds, talent orders and playstyle notes are editorial: community-verified or stated planning assumptions, never client facts.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I spend points in the Fire tree?', answer: 'Yes. Improved Fireball is the client-resolved Fire entry node. Fire does not yet have a recommended preset, so create the allocation manually and copy the resulting build link.' },
      { question: 'Which Mage tree should a new player plan first?', answer: 'Frost. It has the control a solo player needs — a chill slow and two roots — and it can spend the full 11 points at the Level 20 cap.' },
    ],
  },
  {
    kind: 'buildsHub',
    slug: 'wow-forever-mage-builds',
    intent: 'Builds Hub',
    title: 'WoW Forever Mage Builds | Talent Calculator',
    h1: 'WoW Forever Mage Builds',
    description: 'Every current-cap Mage build in one place: Frost leveling and area routes, the Arcane 11-point route, dungeon play and the calculator that loads them.',
    eyebrow: 'Beta Build Hub',
    canonical: 'https://buildforgetools.com/wow-forever-mage-builds',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    relatedBuildIds: ['mage-frost-build', 'mage-arcane-build', 'mage-frost-leveling', 'mage-frost-aoe', 'mage-dungeon'],
    relatedPages: [
      { href: '/wow-forever-mage-talents', label: 'WoW Forever Mage Talents & Talent Trees' },
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
      { href: '/wow-forever-mage-level-20-build', label: 'WoW Forever Mage Level 20 Build' },
    ],
    publishRequirements: ['completeClassPlanner'],
    sections: [
      {
        heading: 'Three specs, one current cap',
        paragraphs: [
          'Frost is the class recommendation for leveling because the chill slow and the roots are what a solo player leans on. Arcane is the phase-preview route: its deeper nodes sit far above the 11-point cap, so what ships here is the entry half of that tree.',
          ELEVEN_POINT_NOTE,
        ],
        bullets: [
          'Frost leveling and Frost area routes',
          'Arcane 11-point route with a stated current-cap note',
          'Frost dungeon and Frost PvP routes',
        ],
      },
      {
        heading: 'Fire planning is available; a Fire preset is still under review',
        paragraphs: [
          'Fire can now accept points in the calculator because the primary client Talent table resolves Improved Fireball as its entry node. This hub still does not label a Fire allocation as recommended until that route has been reviewed and replayed through the planner.',
        ],
      },
      {
        heading: 'How these builds are labelled',
        paragraphs: [
          'Each build carries its own evidence chip: community-verified recommendation, or stated planning assumption. Talent positions and ranks stay client data and are labelled separately. ' + evidenceBoundary,
        ],
      },
    ],
    faqs: [
      { question: 'Do these builds cover every Mage specialization?', answer: 'The calculator covers Arcane, Fire and Frost. Reviewed presets currently cover Frost and Arcane; the Fire build page remains withheld until its editorial allocation is ready.' },
      { question: 'Are these builds official or guaranteed best?', answer: 'No. They are editorial routes for testing, built on client-reviewed talent positions and ranks reviewed through build 1.60.1.69913.' },
    ],
  },
  {
    kind: 'talents',
    slug: 'wow-forever-mage-talents',
    intent: 'Talent trees / changes',
    title: 'WoW Forever Mage Talents & Talent Trees',
    h1: 'WoW Forever Mage Talents & Talent Trees',
    description: 'The full Mage talent catalogue: all 31 published Arcane, Fire and Frost nodes with their rows, columns and change status through Beta build 1.60.1.69913.',
    eyebrow: 'Beta Talent Catalogue',
    canonical: 'https://buildforgetools.com/wow-forever-mage-talents',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    relatedBuildIds: [],
    relatedPages: [
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['talentDataset'],
    sections: [
      {
        heading: 'What this catalogue lists',
        paragraphs: [
          'Every Mage node published by both sources, grouped by branch and then by change status: new in this build, changed from Classic, unchanged, or change status not agreed. Each entry shows the verified row and column, and the client evidence badge that covers positions and ranks.',
          'A node only reaches this catalogue when both sources state it. Identity that appears on one source alone stays unpublished, and a spell that appears only inside another node’s tooltip is described as text in a tooltip, never as a tree node.',
        ],
      },
      {
        heading: 'How the Fire entry point was verified',
        paragraphs: [
          'Fire publishes 12 nodes, including Improved Fireball as its row-1 entry point. The two derived web views agree on its identity, row, ranks and zero-point gate but disagree on its display column.',
          'The build 1.60.1.69913 client Talent table resolves that display-only conflict to column 2. The source disagreement remains recorded in the import report, together with the primary-client resolution, instead of being hidden or repeated as an error under every Fire node.',
        ],
      },
      {
        heading: 'Reading the change status',
        paragraphs: [
          'Change status is published only where both sources agree; otherwise the node is listed as change status unknown. Change status describes the talent data, not the builds — a build being new or changed is an editorial statement and is labelled as such on the build pages.',
        ],
      },
    ],
    faqs: [
      { question: 'How many Mage talents are published?', answer: '31 nodes: 10 Arcane, 12 Fire and 9 Frost, reviewed through build 1.60.1.69913.' },
      { question: 'Can fire talents be allocated?', answer: 'Yes. Improved Fireball is the row-1 Fire entry point confirmed by the primary client Talent table.' },
    ],
  },
  {
    kind: 'leveling',
    slug: 'wow-forever-mage-leveling-build',
    intent: 'Mage Leveling',
    title: 'WoW Forever Mage Leveling Build | Level 20 Beta',
    h1: 'WoW Forever Mage Leveling Build',
    description: 'The Mage leveling recommendation for the Level 20 Beta cap: an 11-point Frost route, the order to spend it in, and how Arcane and Fire compare while leveling.',
    eyebrow: 'Beta Leveling Guide',
    canonical: 'https://buildforgetools.com/wow-forever-mage-leveling-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'frost',
    primaryBuildId: 'mage-leveling',
    relatedBuildIds: ['mage-frost-leveling'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-leveling-build', label: 'WoW Forever Frost Mage Leveling Build' },
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-mage-dungeon-build', label: 'WoW Forever Mage Dungeon Build' },
    ],
    publishRequirements: ['legalBuild:frost'],
    sections: [
      {
        heading: 'Community recommendation: level as Frost',
        paragraphs: [
          'This is an editorial recommendation, not a client fact. Frost is recommended for leveling because the chill slow keeps a target at range and the Frost Nova root answers the second mob that always turns up. ' + ELEVEN_POINT_NOTE,
        ],
        bullets: [
          'Improved Frostbolt 5 — the slower cast that everything else supports',
          'Ice Shards 4 — the frozen-target damage',
          'Improved Frost Nova 2 — the root that gets you out of a bad pull',
        ],
      },
      {
        heading: 'Level 10 to 20 spend order',
        paragraphs: [
          'Put the first five points into Improved Frostbolt. Five points into a branch is what unlocks the second row, so Ice Shards cannot be touched before that. Take Ice Shards next, and finish with Improved Frost Nova ranks once the tree allows them.',
        ],
      },
      {
        heading: 'Frost, Fire and Arcane while leveling',
        paragraphs: [
          'Frost trades a little time to kill for control: a slow, a root and an answer to adds. Arcane is the simpler loop — one target at a time with mana efficiency instead of control — and it can spend all 11 points at this cap. Fire is allocatable in the calculator, but its leveling preset remains under review and is not presented as a recommendation here.',
        ],
      },
      {
        heading: 'Where the points stop',
        paragraphs: [
          'Deeper Frost nodes sit above the current cap. Arctic Reach needs 15 points of Frost, Winter’s Chill needs 25 and Ice Barrier needs 30, so none of them are reachable at 11 points. The pages say so rather than planning points a player cannot spend yet.',
        ],
      },
    ],
    faqs: [
      { question: 'Is Frost the best Mage leveling spec?', answer: 'It is the recommendation on this site, not a claim about the best. Frost is picked for control: a chill slow plus two roots is what keeps a solo player alive. Arcane can spend the same 11 points and is described above.' },
      { question: 'Can I level as Fire right now?', answer: 'You can plan a Fire tree manually from Improved Fireball. BuildForgeTools does not yet publish a recommended Fire leveling preset.' },
    ],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-frost-mage-build',
    intent: 'Frost Build',
    title: 'WoW Forever Frost Mage Build | Level 20 Beta',
    h1: 'WoW Forever Frost Mage Build',
    description: 'The Frost Mage build for the Level 20 Beta cap: an 11-point allocation, the order to spend it in, the key nodes and the current-cap limits of the Frost tree.',
    eyebrow: 'Beta Spec Build',
    canonical: 'https://buildforgetools.com/wow-forever-frost-mage-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'frost',
    primaryBuildId: 'mage-frost-build',
    relatedBuildIds: ['mage-frost-leveling', 'mage-frost-aoe'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-leveling-build', label: 'WoW Forever Frost Mage Leveling Build' },
      { href: '/wow-forever-frost-mage-aoe-build', label: 'WoW Forever Frost Mage AoE Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['legalBuild:frost'],
    sections: [
      {
        heading: 'Current-cap Frost allocation',
        paragraphs: [
          'Improved Frostbolt 5, Ice Shards 5 and Piercing Ice 1. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Talent order',
        paragraphs: [
          'Improved Frostbolt first, all five ranks: it is the spell the whole build is built around and it sits on the entry row. Ice Shards next — at five Frost points the second row opens and Ice Shards becomes takeable. Piercing Ice last, at one rank, because it needs ten Frost points already spent before it can be taken.',
        ],
      },
      {
        heading: 'Key talents',
        bullets: [
          'Improved Frostbolt — the cast that carries the damage',
          'Ice Shards — the frozen-target payoff',
          'Piercing Ice — the last point, and only after ten Frost points are down',
        ],
        paragraphs: [],
      },
      {
        heading: 'What waits above this cap',
        paragraphs: [
          'Frost’s deeper rows are not reachable with 11 points. Arctic Reach needs 15 Frost points, Winter’s Chill needs 25 and Ice Barrier needs 30, so this build cannot touch them yet. When the cap rises, those are the first additions to plan.',
        ],
      },
    ],
    faqs: [
      { question: 'Why only one rank of Piercing Ice?', answer: 'It sits behind a ten-point requirement, so with 11 points total only one rank is left over after Improved Frostbolt and Ice Shards are filled.' },
      { question: 'Is this the Frost AoE build?', answer: 'No. The area route is a different allocation with Frost Nova and Improved Blizzard ranks; this one maxes single-target damage.' },
    ],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-fire-mage-build',
    intent: 'Fire Build',
    title: 'WoW Forever Fire Mage Build | Level 20 Beta',
    h1: 'WoW Forever Fire Mage Build',
    description: 'The Fire Mage tree at the Level 20 Beta cap: its client-verified entry point, the published nodes, and why the editorial Fire preset is still under review.',
    eyebrow: 'Beta Spec Build',
    canonical: 'https://buildforgetools.com/wow-forever-fire-mage-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'fire',
    relatedBuildIds: [],
    relatedPages: [
      { href: '/wow-forever-fire-mage-leveling-build', label: 'WoW Forever Fire Mage Leveling Build' },
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
      { href: '/wow-forever-mage-pvp-build', label: 'WoW Forever Mage PvP Build' },
    ],
    publishRequirements: ['legalBuild:fire'],
    sections: [
      {
        heading: 'Fire is planner-legal; the preset is not published yet',
        paragraphs: [
          'Improved Fireball is now confirmed as the Fire entry node by the build 1.60.1.69913 client Talent table, so the calculator accepts Fire points normally.',
          'This page remains withheld because a client-legal tree is not the same as a reviewed build recommendation. Frost and Arcane presets are published; Fire will publish after an 11-point allocation and spend order are tested and documented.',
        ],
      },
      {
        heading: 'The source conflict is resolved',
        paragraphs: [
          'The two derived web views disagree only on Improved Fireball’s display column. The primary build 1.60.1.69913 Talent table places it at row 1, column 2, so that coordinate is used while the disagreement remains visible in the import report.',
        ],
      },
      {
        heading: 'What would make this page publish',
        paragraphs: [
          'This definition stays in the repository with its requirement declared. Once a reviewed 11-point Fire route is authored and replays through the planner, the page can publish without changing its URL or metadata.',
        ],
      },
    ],
    faqs: [
      { question: 'Does a Fire Mage build exist for this cap?', answer: 'The planner accepts Fire points, but this site has not yet published a reviewed Fire preset for the current cap.' },
      { question: 'Are fire talents published at all?', answer: 'Yes. The Mage talent catalogue lists 12 Fire nodes, including the primary-client-resolved Improved Fireball entry point.' },
    ],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-arcane-mage-build',
    intent: 'Arcane Build',
    title: 'WoW Forever Arcane Mage Build | Level 20 Beta',
    h1: 'WoW Forever Arcane Mage Build',
    description: 'The Arcane Mage build for the Level 20 Beta cap: an 11-point allocation, its spend order, and the deeper Arcane rows that the current cap cannot reach.',
    eyebrow: 'Beta Spec Build',
    canonical: 'https://buildforgetools.com/wow-forever-arcane-mage-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'arcane',
    primaryBuildId: 'mage-arcane-build',
    relatedBuildIds: ['mage-arcane-leveling'],
    relatedPages: [
      { href: '/wow-forever-arcane-mage-leveling-build', label: 'WoW Forever Arcane Mage Leveling Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
    ],
    publishRequirements: ['legalBuild:arcane'],
    sections: [
      {
        heading: 'Current-cap Arcane allocation',
        paragraphs: [
          'Arcane Focus 5, Improved Channeling 5 and Arcane Concentration 1. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Talent order',
        paragraphs: [
          'Arcane Focus and Improved Channeling are both entry-row nodes, so they can be filled in that order without waiting on anything. Arcane Concentration sits behind a five-point requirement and opens as soon as the first five points are in.',
        ],
      },
      {
        heading: 'Current Beta note: the rest of the tree is out of reach',
        paragraphs: [
          'This is the entry half of the Arcane tree, not the whole of it. Arcane Shielding and Improved Counterspell need 15 Arcane points, Presence of Mind and Arcane Mind need 20, and Arcane Power needs 30. With 11 points available at the current cap, none of them can be taken, and this build does not pretend otherwise.',
        ],
      },
    ],
    faqs: [
      { question: 'Can this build reach Arcane Power?', answer: 'No. Arcane Power requires 30 Arcane points and the current cap allows 11 points in total, so it is out of reach at this level.' },
      { question: 'Why max Arcane Focus before Arcane Concentration?', answer: 'Arcane Focus is on the entry row and can be spent immediately, while Arcane Concentration needs five Arcane points in the tree first. The order spends points where they can actually go.' },
    ],
  },
  {
    kind: 'specLeveling',
    slug: 'wow-forever-frost-mage-leveling-build',
    intent: 'Frost Leveling',
    title: 'WoW Forever Frost Mage Leveling Build',
    h1: 'WoW Forever Frost Mage Leveling Build',
    description: 'How to level as a Frost Mage at the Level 20 Beta cap: the 11-point route, the spend order, single-target play, area pulls and how to kite with the tools the tree gives you.',
    eyebrow: 'Beta Spec Leveling',
    canonical: 'https://buildforgetools.com/wow-forever-frost-mage-leveling-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'frost',
    primaryBuildId: 'mage-frost-leveling',
    relatedBuildIds: ['mage-frost-build', 'mage-frost-aoe'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-frost-mage-aoe-build', label: 'WoW Forever Frost Mage AoE Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['legalBuild:frost'],
    sections: [
      {
        heading: 'The 11-point route',
        paragraphs: [
          'Improved Frostbolt 5, Ice Shards 4 and Improved Frost Nova 2. Five points into Improved Frostbolt open the second row, Ice Shards spends the middle of the build, and the last two points go into Frost Nova for the root. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Single-target leveling',
        paragraphs: [
          'Open from maximum range so the chill slow is already on the mob when it starts moving. Keep Frostbolt as the default cast and let Ice Shards do its work when the target is frozen or rooted. Eating a pushback is cheaper than moving.',
        ],
      },
      {
        heading: 'Area pulls',
        paragraphs: [
          'Frost Nova is the area button at this cap: root the pack, step out of melee range, and cast while it is held. A dedicated area allocation takes Improved Blizzard instead of maxing Ice Shards; that variant belongs to the Frost AoE build, and the choice is which of the two you would rather have.',
        ],
      },
      {
        heading: 'Kiting',
        paragraphs: [
          'The chill slow plus the root is the whole kiting kit here. Pull with Frostbolt, let the mob walk to you, root it when it arrives, then walk away and cast again. There is no blink-style escape in this tree at this cap.',
        ],
      },
    ],
    faqs: [
      { question: 'Is Frost the right choice for a first Mage?', answer: 'This site recommends it for leveling because the control is unconditional: the slow and the roots work on every mob without gear or setup.' },
      { question: 'Do I need Improved Blizzard to level as Frost?', answer: 'No. Improved Blizzard is for pulling groups; the leveling route spends those points on Frost Nova instead, and the Frost AoE build is where the area variant lives.' },
    ],
  },
  {
    kind: 'specLeveling',
    slug: 'wow-forever-fire-mage-leveling-build',
    intent: 'Fire Leveling',
    title: 'WoW Forever Fire Mage Leveling Build',
    h1: 'WoW Forever Fire Mage Leveling Build',
    description: 'Leveling as a Fire Mage at the Level 20 Beta cap: the verified Fire entry point, why the leveling preset is still under review, and the published Frost and Arcane alternatives.',
    eyebrow: 'Beta Spec Leveling',
    canonical: 'https://buildforgetools.com/wow-forever-fire-mage-leveling-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'fire',
    relatedBuildIds: [],
    relatedPages: [
      { href: '/wow-forever-fire-mage-build', label: 'WoW Forever Fire Mage Build' },
      { href: '/wow-forever-frost-mage-leveling-build', label: 'WoW Forever Frost Mage Leveling Build' },
      { href: '/wow-forever-frost-vs-fire-mage-leveling', label: 'Frost vs Fire Mage for Leveling in WoW Forever' },
    ],
    publishRequirements: ['legalBuild:fire'],
    sections: [
      {
        heading: 'No fire leveling route is published',
        paragraphs: [
          'The planner can now place the first Fire point in Improved Fireball. What is still missing is a reviewed 11-point leveling allocation and spend order, so this page stays withheld rather than labelling an untested route as a recommendation.',
        ],
      },
      {
        heading: 'Frost vs Fire, honestly',
        paragraphs: [
          'Frost is the leveling recommendation on this site, but the comparison cannot be run against a fire route that does not exist. What can be said is what the two branches offer in the data: Frost publishes an entry node and control tools, fire publishes neither at this cap. The head-to-head page is withheld for the same reason this one is.',
        ],
      },
      {
        heading: 'What would publish this page',
        paragraphs: [
          'The definition stays here with its requirement declared. When a reviewed Fire leveling allocation is added, this page publishes with no new URL or metadata work.',
        ],
      },
    ],
    faqs: [
      { question: 'Can I level as Fire in WoW Forever right now?', answer: 'You can allocate Fire points manually, beginning with Improved Fireball. A reviewed Fire leveling preset is not published yet.' },
      { question: 'What should I level as instead?', answer: 'Frost is the recommendation for control, and Arcane is a legal 11-point route if you would rather trade control for a simpler single-target loop.' },
    ],
  },
  {
    kind: 'specLeveling',
    slug: 'wow-forever-arcane-mage-leveling-build',
    intent: 'Arcane Leveling',
    title: 'WoW Forever Arcane Mage Leveling Build',
    h1: 'WoW Forever Arcane Mage Leveling Build',
    description: 'Leveling as an Arcane Mage at the Level 20 Beta cap: the 11-point route, why its mana tools matter while solo, and how far into the tree 11 points actually reach.',
    eyebrow: 'Beta Spec Leveling',
    canonical: 'https://buildforgetools.com/wow-forever-arcane-mage-leveling-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'arcane',
    primaryBuildId: 'mage-arcane-leveling',
    relatedBuildIds: ['mage-arcane-build'],
    relatedPages: [
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['legalBuild:arcane'],
    sections: [
      {
        heading: 'Should you level as Arcane?',
        paragraphs: [
          'It is a reasonable alternative to Frost, not the recommendation. Arcane trades Frost’s slow and roots for mana efficiency and channel uptime, which means less downtime between pulls but no answer when a second mob arrives. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'The 11-point route',
        paragraphs: [
          'Arcane Focus 5, then Arcane Concentration 5, then Arcane Impact 1. Arcane Focus goes in immediately from the entry row; Arcane Concentration opens after five Arcane points and five ranks of it consume the middle of the build; the last point lands on Arcane Impact, which sits behind a ten-point requirement.',
        ],
      },
      {
        heading: 'Phase 1 of the tree, and what comes later',
        paragraphs: [
          'What ships at this cap is the first phase of Arcane. The later rows are gated far above 11 points: 15 for Arcane Shielding and Improved Counterspell, 20 for Presence of Mind and Arcane Mind, 30 for Arcane Power. Those are named here from their verified requirements so the cap boundary is visible, and are not planned into the route.',
        ],
      },
    ],
    faqs: [
      { question: 'Is Arcane a good leveling choice?', answer: 'It is a legal alternative with a simpler loop. Frost is still the recommendation, because control is what saves a solo player when a pull goes wrong.' },
      { question: 'How deep can 11 Arcane points go?', answer: 'As far as the third row. Arcane Impact requires ten Arcane points, so one rank of it is the deepest this cap can reach.' },
    ],
  },
  {
    kind: 'aoe',
    slug: 'wow-forever-frost-mage-aoe-build',
    intent: 'Frost AoE farming',
    title: 'WoW Forever Frost Mage AoE Build',
    h1: 'WoW Forever Frost Mage AoE Build',
    description: 'The Frost Mage area allocation for the Level 20 Beta cap: root the pack, cast the area damage, and the spell list and farming loop that go with it.',
    eyebrow: 'Beta Area Route',
    canonical: 'https://buildforgetools.com/wow-forever-frost-mage-aoe-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'frost',
    primaryBuildId: 'mage-frost-aoe',
    relatedBuildIds: ['mage-frost-build', 'mage-dungeon'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-mage-dungeon-build', label: 'WoW Forever Mage Dungeon Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['legalBuild:frost'],
    sections: [
      {
        heading: 'The area allocation',
        paragraphs: [
          'Improved Frostbolt 5, Ice Shards 3, Improved Frost Nova 2 and Improved Blizzard 1. This is a different allocation from the Frost single-target build, not a relabelled copy: it gives up two Ice Shards ranks and its single Piercing Ice rank to buy two ranks of Improved Frost Nova and the one Improved Blizzard rank this cap can reach. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Spend order',
        paragraphs: [
          'Improved Frostbolt first — five points, and enough to open the second row. Ice Shards to three ranks next. Frost Nova ranks after that, and Improved Blizzard last: it needs ten Frost points spent before the tree will let you take it, which is exactly what the first three steps provide.',
        ],
      },
      {
        heading: 'Spells this route leans on',
        paragraphs: [
          'The tree supplies Frost Nova and Improved Blizzard, and Improved Frostbolt carries the filler damage between area casts. Anything beyond the published nodes — a conjured consumable, a summoned pet, a defensive cooldown from outside the tree — would be a planning assumption, not a talent, and is not presented as a rank anywhere on this page.',
        ],
      },
      {
        heading: 'Farming loop (planning assumption)',
        paragraphs: [
          'This loop is a derived assumption about play, not a verified fact: gather the pack, root it with Frost Nova, step out of melee range, and cast area damage while the root holds, refreshing the root when it breaks instead of standing in the middle of the pack. Treat the loop as something to test in game rather than a guaranteed route.',
        ],
      },
    ],
    faqs: [
      { question: 'Why does this build not max Ice Shards?', answer: 'Because the root and the area cast are what the area route is for. Both builds spend their first eight points the same way; the single-target build puts the last three into two more Ice Shards ranks and one Piercing Ice rank, while this one puts them into two ranks of Improved Frost Nova and one of Improved Blizzard.' },
      { question: 'Is the farming loop verified?', answer: 'No. It is a stated planning assumption. Only the talent names and ranks come from client-reviewed records.' },
    ],
  },
  {
    kind: 'pvp',
    slug: 'wow-forever-mage-pvp-build',
    intent: 'Mage PvP hub',
    title: 'WoW Forever Mage PvP Build',
    h1: 'WoW Forever Mage PvP Build',
    description: 'The Mage PvP hub for the Level 20 Beta cap, with a tab per specialization, the allocation each one loads, and the fire tab that cannot be supplied yet.',
    eyebrow: 'Beta PvP Hub',
    canonical: 'https://buildforgetools.com/wow-forever-mage-pvp-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    relatedBuildIds: ['mage-frost-pvp', 'mage-arcane-pvp'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
      { href: '/wow-forever-fire-mage-build', label: 'WoW Forever Fire Mage Build' },
    ],
    publishRequirements: ['legalBuild:fire'],
    sections: [
      {
        heading: 'One hub, one tab per specialization',
        paragraphs: [
          'Mage PvP runs as a single hub rather than three child URLs. Each specialization needs its own reviewed 11-point allocation; Frost and Arcane are ready, while the Fire recommendation is still under review.',
        ],
      },
      {
        heading: 'Why this hub waits',
        paragraphs: [
          'A three-tab hub with one tab empty is not the page the spec describes, so the requirement is declared rather than worked around: this page needs a reviewed Fire build before it publishes. Frost and Arcane PvP routes are written and ready.',
        ],
      },
      {
        heading: 'Allocations are editorial',
        paragraphs: [
          'PvP routes are recommendations, never client facts. ' + evidenceBoundary,
        ],
      },
    ],
    faqs: [
      { question: 'Why is there no Fire PvP tab yet?', answer: 'The tree is planner-legal, but the PvP hub needs a reviewed Fire allocation and spend order before that tab can publish.' },
      { question: 'Are the Frost and Arcane PvP allocations legal now?', answer: 'Yes. Both spend all 11 points at the Level 20 cap and both replay through the planner without a skipped requirement.' },
    ],
  },
  {
    kind: 'dungeon',
    slug: 'wow-forever-mage-dungeon-build',
    intent: 'Dungeon',
    title: 'WoW Forever Mage Dungeon Build',
    h1: 'WoW Forever Mage Dungeon Build',
    description: 'The Mage dungeon build for the Level 20 Beta cap: a Frost utility-focused 11-point allocation, the control that groups want, and the class claims that stay assumptions.',
    eyebrow: 'Beta Dungeon Route',
    canonical: 'https://buildforgetools.com/wow-forever-mage-dungeon-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    spec: 'frost',
    primaryBuildId: 'mage-dungeon',
    relatedBuildIds: ['mage-frost-aoe', 'mage-frost-build'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-aoe-build', label: 'WoW Forever Frost Mage AoE Build' },
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['legalBuild:frost'],
    sections: [
      {
        heading: 'Frost is the dungeon recommendation',
        paragraphs: [
          'Frost Warding 2, Improved Frostbolt 5 and Ice Shards 4. The build opens on the Warding ranks so the early pulls cost less attention, then fills the entry damage node and the frozen-target payoff. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Utility and control first',
        paragraphs: [
          'A dungeon group wants the Mage to keep a target where it can be hit and to stop the pull that is running at the healer. Frost supplies both: the chill slow on the kill target, and Frost Nova as the group control button. The area route is the alternative when the group is pulling packs rather than singletons.',
        ],
      },
      {
        heading: 'Class utility that stays an assumption',
        paragraphs: [
          'Polymorph, conjured food and conjured water are class utility claims. This branch has no published Mage spellbook record, so they are planning assumptions here, not client-verified talents, and no rank for them appears in the allocation or the spend order.',
        ],
      },
      {
        heading: 'Why no Fire alternative is listed',
        paragraphs: [
          'Fire is often offered as a dungeon alternative, but BuildForgeTools has not reviewed a Fire dungeon allocation for this cap. The calculator can plan one manually; this page presents only the tested Frost route.',
        ],
      },
    ],
    faqs: [
      { question: 'Why does the dungeon build start with Frost Warding?', answer: 'It is an entry-row node, so it can be spent immediately, and it covers the early pulls while the damage nodes are still being filled.' },
      { question: 'Is there a fire dungeon alternative?', answer: 'No reviewed Fire dungeon preset is published yet, so only the Frost route is presented.' },
    ],
  },
  {
    kind: 'levelCap',
    slug: 'wow-forever-mage-level-20-build',
    intent: 'Current Beta cap',
    title: 'WoW Forever Mage Level 20 Build',
    h1: 'WoW Forever Mage Level 20 Build',
    description: 'The Level 20 Mage cap in one place: the 11 points every specialization receives, the published Frost and Arcane routes, and the planner-ready Fire tree.',
    eyebrow: 'Current Beta Cap',
    canonical: 'https://buildforgetools.com/wow-forever-mage-level-20-build',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    relatedBuildIds: ['mage-frost-build', 'mage-arcane-build', 'mage-frost-leveling'],
    relatedPages: [
      { href: '/wow-forever-frost-mage-build', label: 'WoW Forever Frost Mage Build' },
      { href: '/wow-forever-arcane-mage-build', label: 'WoW Forever Arcane Mage Build' },
    ],
    publishRequirements: ['completeClassPlanner'],
    sections: [
      {
        heading: 'What Level 20 gives a Mage',
        paragraphs: [
          'The current Beta cap is Level 20 with 11 talent points. Planning modes for Level 30 and Level 60 exist in the calculator, but this page describes only the cap that is live now. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'The three specs at this cap',
        bullets: [
          'Frost — legal: an 11-point single-target route, with a distinct area variant for packs',
          'Arcane — legal: an 11-point route through the entry rows, with deeper nodes stated as out of reach',
          'Fire — planner-ready from Improved Fireball; the reviewed 11-point preset is still pending',
        ],
        paragraphs: [
          'This page compares the three specs at the live cap. All three branches now have client-reviewed entry nodes, while build recommendations remain clearly separated from client facts.',
        ],
      },
      {
        heading: 'When the cap moves',
        paragraphs: [
          'This page is time-sensitive and will be archived in place rather than deleted when the cap rises; the routes above are written for Level 20 and the current 11 points.',
        ],
      },
    ],
    faqs: [
      { question: 'How many talent points does a Level 20 Mage get?', answer: '11 points at the current Beta cap, spendable across the Arcane, Fire and Frost trees.' },
      { question: 'Which Mage specs can spend all 11 points today?', answer: 'Arcane, Fire and Frost all have client-reviewed entry nodes. BuildForgeTools currently publishes reviewed 11-point presets for Frost and Arcane.' },
    ],
  },
  {
    kind: 'comparison',
    slug: 'wow-forever-frost-vs-fire-mage-leveling',
    intent: 'Frost vs Fire leveling',
    title: 'Frost vs Fire Mage for Leveling in WoW Forever',
    h1: 'Frost vs Fire Mage for Leveling in WoW Forever',
    description: 'Frost and Fire compared for Mage leveling at the Level 20 Beta cap: playstyle, area damage, safety, key mechanics and what each branch can actually allocate today.',
    eyebrow: 'Beta Comparison',
    canonical: 'https://buildforgetools.com/wow-forever-frost-vs-fire-mage-leveling',
    robots: 'index, follow',
    updatedAt: MAGE_UPDATED,
    relatedBuildIds: [],
    relatedPages: [
      { href: '/wow-forever-frost-mage-leveling-build', label: 'WoW Forever Frost Mage Leveling Build' },
      { href: '/wow-forever-fire-mage-leveling-build', label: 'WoW Forever Fire Mage Leveling Build' },
      { href: '/wow-forever-mage-leveling-build', label: 'WoW Forever Mage Leveling Build' },
    ],
    publishRequirements: ['legalBuild:fire'],
    sections: [
      {
        heading: 'How to read this comparison',
        paragraphs: [
          'The table compares the Frost and Fire branches for leveling at the current cap on playstyle, area damage, safety, key mechanics and what each branch can allocate. There is no combined number anywhere on this page: a single figure for two different playstyles would hide exactly the trade-off the comparison exists to show.',
        ],
      },
      {
        heading: 'Why this comparison waits',
        paragraphs: [
          'Half of a useful comparison is a reviewed Fire leveling route. The Fire tree is planner-legal now, but the editorial allocation is still under review, so this page stays withheld rather than comparing Frost against an untested preset.',
        ],
      },
    ],
    faqs: [
      { question: 'Which is better for leveling, Frost or Fire?', answer: 'Frost is the current recommendation on this site for its control. The head-to-head page will publish after a Fire leveling preset has been reviewed.' },
      { question: 'Does this comparison reduce the branches to a single number?', answer: 'No. It compares one property at a time and never collapses two different playstyles into one figure.' },
    ],
    comparison: {
      columns: ['Playstyle', 'AoE', 'Safety', 'Key mechanics', 'Current Beta'],
      rows: [
        {
          label: 'Frost',
          values: [
            'Ranged caster that slows the target and keeps it out of melee',
            'Root the pack with Frost Nova, then cast area damage',
            'Two roots and a slow answer the second mob',
            'Chill slow, Frost Nova root, frozen-target Ice Shards payoff',
            'Legal 11-point leveling route published',
          ],
        },
        {
          label: 'Fire',
          values: [
            'Ranged caster built around fire damage and its ignite effects',
            'Packs have to be gathered by hand without a root of its own',
            'No slow and no root in the published nodes',
            'Improved Fireball entry, Ignite effects and deeper fire damage ranks',
            'Planner-legal; reviewed Level 20 preset still pending',
          ],
        },
      ],
    },
  },
]

export const mageClass: ClassDefinition<MageBranch> = {
  id: 'mage',
  name: 'Mage',
  plannerPath: '/mage',
  ogImage: MAGE_HERO,
  branches: MAGE_BRANCHES,
  branchNames: mageBranchNames,
  branchTaglines: mageBranchTaglines,
  storageKey: 'wow-forever-mage-build',
  analyticsClass: 'mage',
  dataVersion: MAGE_DATA_VERSION,
  verifiedBuild: BUILD_VERIFIED,
  talentCount: mageTalents.length,
  beta: { phaseLabel: 'Beta · Build 1.60.1.69913', levelCap: 20, pointsAtCap: 11 },
  plannerModes: [
    { level: 20, points: 11, label: 'Level 20' },
    { level: 30, points: 21, label: 'Level 30' },
    { level: 60, points: 51, label: 'Level 60' },
  ],
  talents: mageTalents,
  plannerConfig: MAGE_PLANNER_CONFIG,
  builds: mageBuilds,
  pages: magePages.map((page) => ({
    ...page,
    ogImage: page.spec === 'frost' ? FROST_MAGE_HERO : page.spec === 'arcane' ? ARCANE_MAGE_HERO : page.ogImage,
  })),
  // Frost leveling first: the class-level recommendation the calculator loads by default.
  recommendedBuildIds: ['mage-leveling', 'mage-frost-build', 'mage-arcane-build'],
  sources: MAGE_SOURCES,
}
