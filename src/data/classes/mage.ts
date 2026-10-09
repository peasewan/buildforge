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

const MAGE_CREATED = '2026-09-22'
// Editorial correction date; source client verification remains 69913.
const MAGE_UPDATED = '2026-10-09'
const BUILD_VERIFIED = '1.60.1.69913'
const OFFICIAL_CAP_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696'
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

/** Keep the reviewed starter allocation separate from the playable Beta cap. */
const ELEVEN_POINT_NOTE = 'This reviewed Level 20 starter allocation spends 11 points. Blizzard raised the playable Beta cap to Level 30 on October 1; this route is not a reviewed Level 30 build.'
const LIVE_CAP_NOTE = `Blizzard's October 1 Beta development notes raised the playable cap to Level 30. These 11-point Mage routes preserve the initial Level 20 snapshot, and no Level 30 allocation is verified here. Official source: ${OFFICIAL_CAP_SOURCE}`

const evidenceBoundary = 'Talent names, positions and ranks are dual-source client records reviewed through build 1.60.1.69913. The allocation and the order it is spent in are editorial recommendations for testing, not official or guaranteed best builds.'

const mageBuilds: ClassBuild[] = [
  {
    id: 'mage-frost-build',
    spec: 'frost',
    intent: 'spec',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage Build (Level 20)',
    shortTitle: 'Frost Mage',
    role: 'Frost single-target damage',
    playstyle: [
      'Allocate five Improved Frostbolt ranks from the entry row',
      'Allocate five Ice Shards ranks after the five-point Frost gate opens',
      'Put the eleventh point into Piercing Ice and compare this preset with the leveling route',
    ],
    strengths: ['Complete 11-point allocation', 'Five Ice Shards ranks', 'Distinct from the leveling and area presets'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.piercingIce],
    order: [T.improvedFrostbolt, T.iceShards, T.piercingIce],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 5, [T.piercingIce]: 1 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Frost Mage route, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-frost-mage-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-frost-mage-build',
  },
  {
    id: 'mage-frost-leveling',
    spec: 'frost',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage Leveling Build (Level 20)',
    shortTitle: 'Frost Leveling',
    role: 'Frost solo leveling',
    playstyle: [
      'Fill Improved Frostbolt with five points before allocating the second row',
      'Allocate four Ice Shards ranks and two Improved Frost Nova ranks',
      'Compare these fixed talent selections with the five-rank Ice Shards single-target preset',
    ],
    strengths: ['Five Improved Frostbolt, four Ice Shards and two Improved Frost Nova ranks', 'Two points in one Improved Frost Nova node', 'Exact comparison with the single-target preset'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 4, [T.improvedFrostNova]: 2 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Frost Mage leveling route, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-frost-mage-leveling-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-frost-mage-leveling-build',
  },
  {
    id: 'mage-frost-aoe',
    spec: 'frost',
    intent: 'aoe',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage AoE Build (Level 20)',
    shortTitle: 'Frost AoE',
    role: 'Frost area damage',
    playstyle: [
      'Replay the five Improved Frostbolt and three Ice Shards points first',
      'Allocate one fixed point to Improved Blizzard after ten Frost points',
      'Compare the two Improved Frost Nova points with the alternative Ice Shards and Piercing Ice points',
    ],
    strengths: ['Distinct 11-point area allocation', 'One point in the Improved Blizzard node', 'Three-point tradeoff against the single-target preset'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova, T.improvedBlizzard],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova, T.improvedBlizzard],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 3, [T.improvedFrostNova]: 2, [T.improvedBlizzard]: 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Frost Mage area route, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-frost-mage-aoe-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-frost-mage-aoe-build',
  },
  {
    id: 'mage-arcane-build',
    spec: 'arcane',
    intent: 'spec',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '11/0/0',
    title: 'Arcane Mage Build (Level 20)',
    shortTitle: 'Arcane Mage',
    role: 'Arcane single-target damage',
    playstyle: [
      'Allocate five Arcane Focus points from the entry row; its rank effect text is unresolved',
      'Inspect the published interruption-avoidance text for Improved Channeling',
      'Keep the single Arcane Concentration point in the saved allocation until you edit the planner',
    ],
    strengths: ['Two filled entry-row nodes', 'Published Improved Channeling rank text', 'One fixed Arcane Concentration point'],
    keyTalentIds: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    order: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    build: { [T.arcaneFocus]: 5, [T.improvedChanneling]: 5, [T.arcaneConcentration]: 1 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Arcane Mage route, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-arcane-mage-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-arcane-mage-build',
  },
  {
    id: 'mage-arcane-leveling',
    spec: 'arcane',
    intent: 'leveling',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '11/0/0',
    title: 'Arcane Mage Leveling Build (Level 20)',
    shortTitle: 'Arcane Leveling',
    role: 'Arcane solo leveling',
    playstyle: [
      'Allocate five Arcane Focus points before moving to the second row',
      'Allocate five Arcane Concentration points and inspect the unresolved-effect notice',
      'Place the final point in Arcane Impact and compare this allocation with the Channeling preset',
    ],
    strengths: ['Five Arcane Focus, five Arcane Concentration and one Arcane Impact rank', 'Reproducible point order', 'Distinct from the Improved Channeling preset'],
    keyTalentIds: [T.arcaneFocus, T.arcaneConcentration, T.arcaneImpact],
    order: [T.arcaneFocus, T.arcaneConcentration, T.arcaneImpact],
    build: { [T.arcaneFocus]: 5, [T.arcaneConcentration]: 5, [T.arcaneImpact]: 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Arcane Mage leveling route, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-arcane-mage-leveling-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
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
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '0/0/11',
    title: 'Mage Leveling Build (Frost)',
    shortTitle: 'Mage Leveling',
    role: 'Frost solo leveling, recommended for the class',
    playstyle: [
      'Load the editorial Frost starter: five Improved Frostbolt, four Ice Shards and two Improved Frost Nova ranks',
      'Compare its two Improved Frost Nova points with the single-target preset',
      'Finish with two Improved Frost Nova ranks after the four Ice Shards ranks',
    ],
    strengths: ['Full eleven-point starter budget', 'Two allocated Improved Frost Nova ranks', 'Source limits shown beside the route'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 4, [T.improvedFrostNova]: 2 },
    evidence: 'community_verified',
    sources: [{ label: 'BuildForgeTools Mage leveling recommendation, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-mage-leveling-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-leveling-build',
  },
  {
    id: 'mage-dungeon',
    spec: 'frost',
    intent: 'dungeon',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '0/0/11',
    title: 'Mage Dungeon Build (Frost)',
    shortTitle: 'Dungeon Frost',
    role: 'Frost dungeon damage with control',
    playstyle: [
      'Allocate the two entry-row Frost Warding ranks first',
      'Fill Improved Frostbolt with five points, then Ice Shards with four',
      'Compare the two Frost Warding, five Improved Frostbolt and four Ice Shards ranks with the four-node area preset',
    ],
    strengths: ['Published Frost Warding effect text', 'Two Frost Warding, five Improved Frostbolt and four Ice Shards ranks', 'Distinct from the area preset'],
    keyTalentIds: [T.frostWarding, T.improvedFrostbolt, T.iceShards],
    order: [T.frostWarding, T.improvedFrostbolt, T.iceShards],
    build: { [T.frostWarding]: 2, [T.improvedFrostbolt]: 5, [T.iceShards]: 4 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Mage dungeon route, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-mage-dungeon-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-dungeon-build',
  },
  {
    id: 'mage-frost-pvp',
    spec: 'frost',
    intent: 'pvp',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '0/0/11',
    title: 'Frost Mage PvP Build (Level 20)',
    shortTitle: 'Frost PvP',
    role: 'Frost player-versus-player damage and control',
    playstyle: [
      'Allocate five Improved Frostbolt and five Ice Shards points',
      'Place the eleventh point in Improved Frost Nova',
      'Compare that single point with the Piercing Ice point in the single-target preset',
    ],
    strengths: ['Full 11-point Frost allocation', 'One fixed Improved Frost Nova point', 'Exact comparison with the single-target preset'],
    keyTalentIds: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    order: [T.improvedFrostbolt, T.iceShards, T.improvedFrostNova],
    build: { [T.improvedFrostbolt]: 5, [T.iceShards]: 5, [T.improvedFrostNova]: 1 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Mage PvP routes, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-mage-pvp-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
    updatedAt: MAGE_UPDATED,
    href: '/wow-forever-mage-pvp-build',
  },
  {
    id: 'mage-arcane-pvp',
    spec: 'arcane',
    intent: 'pvp',
    level: 20,
    levelCap: 20,
    phase: 'Level 20 starter snapshot',
    points: 11,
    allocation: '11/0/0',
    title: 'Arcane Mage PvP Build (Level 20)',
    shortTitle: 'Arcane PvP',
    role: 'Arcane player-versus-player damage',
    playstyle: [
      'Allocate five Arcane Focus points and three Improved Channeling points',
      'Keep three Arcane Concentration points selected in the saved allocation',
      'Compare these five Arcane Focus, three Improved Channeling and three Arcane Concentration ranks with the preset that fills Improved Channeling to five and leaves one Arcane Concentration rank',
    ],
    strengths: ['Full eleven-point Arcane allocation', 'Three fixed Arcane Concentration points', 'Published Improved Channeling effect text'],
    keyTalentIds: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    order: [T.arcaneFocus, T.improvedChanneling, T.arcaneConcentration],
    build: { [T.arcaneFocus]: 5, [T.improvedChanneling]: 3, [T.arcaneConcentration]: 3 },
    evidence: 'derived_assumption',
    sources: [{ label: 'BuildForgeTools Mage PvP routes, Level 20 starter snapshot', url: 'https://buildforgetools.com/wow-forever-mage-pvp-build' }],
    verifiedThroughBuild: BUILD_VERIFIED,
    createdAt: MAGE_CREATED,
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
    description: 'Build Arcane, Fire and Frost Mage talent trees from reviewed Beta client data. The live cap is Level 30; our recommended routes remain 11-point Level 20 snapshots.',
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
          'Level 20, 30 and 60 point-budget modes; only the 11-point Level 20 routes have reviewed allocations',
          'Rank tooltips, prerequisite messages and required-tree-point labels on every node',
          'Copy build link, reset, and recommended build presets',
        ],
      },
      {
        heading: 'Where the three trees stand in the reviewed snapshot',
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
      { question: 'Which Mage tree should a new player plan first?', answer: 'Frost is this site’s editorial Level 20 starter: five Improved Frostbolt, four Ice Shards and two Improved Frost Nova points. Compare it with the other eleven-point presets; a Level 30 allocation has not been reviewed here.' },
    ],
  },
  {
    kind: 'buildsHub',
    slug: 'wow-forever-mage-builds',
    intent: 'Builds Hub',
    title: 'WoW Forever Mage Builds | Talent Calculator',
    h1: 'WoW Forever Mage Builds',
    description: 'Reviewed Level 20 Mage starter builds in one place: Frost leveling and area routes, an Arcane 11-point route, dungeon play and the calculator.',
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
        heading: 'Three specs in the Level 20 snapshot',
        paragraphs: [
          'The Frost leveling starter allocates five Improved Frostbolt ranks, four Ice Shards ranks and two Improved Frost Nova ranks. Arcane is another eleven-point allocation with its own unresolved effect descriptions. Neither route has been extended and reviewed for Level 30.',
          ELEVEN_POINT_NOTE,
        ],
        bullets: [
          'Frost leveling and Frost area routes',
          'Arcane 11-point route with a stated Level 20 scope',
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
    description: 'The Mage leveling recommendation for the Level 20 starter snapshot: an 11-point Frost route, the order to spend it in, and how Arcane and Fire compare while leveling.',
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
          'This editorial Frost starter puts five points in Improved Frostbolt, four in Ice Shards and two in Improved Frost Nova. Compare those last six points with the single-target and area presets in the calculator. ' + ELEVEN_POINT_NOTE,
        ],
        bullets: [
          'Improved Frostbolt 5 — published cast-time reduction text',
          'Ice Shards 4 — four allocated points; effect text remains unresolved',
          'Improved Frost Nova 2 — two ranks in one talent node',
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
          'The Frost leveling preset allocates five Improved Frostbolt ranks, four Ice Shards ranks and two Improved Frost Nova ranks. The Arcane leveling preset uses five Arcane Focus ranks, five Arcane Concentration ranks and one Arcane Impact rank. Both spend eleven points; no measured leveling-speed or mana-efficiency comparison is available. Fire can be planned manually, while its preset remains under review.',
        ],
      },
      {
        heading: 'Where the points stop',
        paragraphs: [
          'Deeper Frost nodes sit beyond this 11-point allocation. Arctic Reach needs 15 Frost points, Winter’s Chill needs 25 and Ice Barrier needs 30, so this Level 20 route cannot reach them. The live Level 30 cap alone does not validate a new allocation.',
        ],
      },
    ],
    faqs: [
      { question: 'Is Frost the best Mage leveling spec?', answer: 'It is an editorial starter choice on this site. The calculator can reproduce its eleven points, but that does not establish comparative leveling speed or survival. The Arcane alternative spends the same point budget.' },
      { question: 'Can I level as Fire right now?', answer: 'You can plan a Fire tree manually from Improved Fireball. BuildForgeTools does not yet publish a recommended Fire leveling preset.' },
    ],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-frost-mage-build',
    intent: 'Frost Build',
    title: 'WoW Forever Frost Mage Build | Level 20 Beta',
    h1: 'WoW Forever Frost Mage Build',
    description: 'The Frost Mage Level 20 starter snapshot: an 11-point allocation, its spend order and key nodes. The live Beta cap is 30; this is not a reviewed 30 build.',
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
        heading: 'Level 20 starter Frost allocation',
        paragraphs: [
          'Improved Frostbolt 5, Ice Shards 5 and Piercing Ice 1. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Talent order',
        paragraphs: [
          'Improved Frostbolt first, all five ranks: this entry-row talent has published Frostbolt cast-time reduction text. Ice Shards next — at five Frost points the second row opens and Ice Shards becomes takeable. Piercing Ice last, at one rank, because it needs ten Frost points already spent before it can be taken.',
        ],
      },
      {
        heading: 'Key talents',
        bullets: [
          'Improved Frostbolt — five points with published cast-time reduction text',
          'Ice Shards — five allocated ranks; resolved effect text remains unavailable',
          'Piercing Ice — the last point, and only after ten Frost points are down',
        ],
        paragraphs: [],
      },
      {
        heading: 'What this 11-point route cannot reach',
        paragraphs: [
          'Frost’s deeper rows are not reachable with this 11-point route. Arctic Reach needs 15 Frost points, Winter’s Chill needs 25 and Ice Barrier needs 30. The Beta cap has risen to 30, but these nodes need a separate, reviewed allocation before we recommend them.',
        ],
      },
    ],
    faqs: [
      { question: 'Why only one rank of Piercing Ice?', answer: 'It sits behind a ten-point requirement, so with 11 points total only one rank is left over after Improved Frostbolt and Ice Shards are filled.' },
      { question: 'Is this the Frost AoE build?', answer: 'The area preset is a different allocation: it replaces two Ice Shards points and one Piercing Ice point with two Improved Frost Nova points and one Improved Blizzard point. This is an allocation comparison, not a measured damage ranking.' },
    ],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-fire-mage-build',
    intent: 'Fire Build',
    title: 'WoW Forever Fire Mage Build | Level 20 Beta',
    h1: 'WoW Forever Fire Mage Build',
    description: 'The Fire Mage tree at the Level 20 starter snapshot: its client-verified entry point, the published nodes, and why the editorial Fire preset is still under review.',
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
      { question: 'Is there a reviewed Fire Mage build for Level 20?', answer: 'The planner accepts Fire points, but this site has not published a reviewed Fire starter preset or a Level 30 allocation.' },
      { question: 'Are fire talents published at all?', answer: 'Yes. The Mage talent catalogue lists 12 Fire nodes, including the primary-client-resolved Improved Fireball entry point.' },
    ],
  },
  {
    kind: 'specBuild',
    slug: 'wow-forever-arcane-mage-build',
    intent: 'Arcane Build',
    title: 'WoW Forever Arcane Mage Build | Level 20 Beta',
    h1: 'WoW Forever Arcane Mage Build',
    description: 'The Arcane Mage Level 20 starter snapshot: an 11-point allocation, its spend order and deeper rows outside this route. Live Beta cap: Level 30.',
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
        heading: 'Level 20 starter Arcane allocation',
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
        heading: 'Beyond this 11-point Arcane route',
        paragraphs: [
          'This 11-point Level 20 starter route covers the entry half of the Arcane tree. Arcane Shielding and Improved Counterspell need 15 Arcane points, Presence of Mind and Arcane Mind need 20, and Arcane Power needs 30. None fit this reviewed route; the current Level 30 cap does not itself verify a deeper allocation.',
        ],
      },
    ],
    faqs: [
      { question: 'Can this build reach Arcane Power?', answer: 'No. Arcane Power requires 30 Arcane points, while this reviewed Level 20 route spends 11. We have not validated a Level 30 allocation.' },
      { question: 'Why max Arcane Focus before Arcane Concentration?', answer: 'Arcane Focus is on the entry row and can be spent immediately, while Arcane Concentration needs five Arcane points in the tree first. The order spends points where they can actually go.' },
    ],
  },
  {
    kind: 'specLeveling',
    slug: 'wow-forever-frost-mage-leveling-build',
    intent: 'Frost Leveling',
    title: 'WoW Forever Frost Mage Leveling Build',
    h1: 'WoW Forever Frost Mage Leveling Build',
    description: 'Compare the Frost Mage Level 20 starter allocation with the single-target and area presets, replay its eleven points and inspect the limits of the saved talent data.',
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
          'Improved Frostbolt 5, Ice Shards 4 and Improved Frost Nova 2. Five points in Improved Frostbolt open the second row; four points then go in Ice Shards and the final two in Improved Frost Nova. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Compare the single-target allocation',
        paragraphs: [
          'Compare the four Ice Shards ranks here with five in the single-target preset. Talent ranks remain selected until you edit or reset the planner. Ice Shards effect text is unresolved in this snapshot, so this page supports comparing allocations without prescribing its combat timing.',
        ],
      },
      {
        heading: 'Compare the area allocation',
        paragraphs: [
          'The area preset keeps five Improved Frostbolt points and two Improved Frost Nova points. It moves one of this route’s four Ice Shards points into Improved Blizzard. Load both presets to inspect that one-point tradeoff; the talent allocation does not establish spell-learning levels or a verified farming rotation.',
        ],
      },
      {
        heading: 'What the rank count establishes',
        paragraphs: [
          'Improved Frost Nova has two allocated ranks here, both in the same node. Its resolved rank text is unavailable in this snapshot. A talent point count does not establish how many times a spell can be cast, a guaranteed root duration or a complete kiting kit.',
        ],
      },
    ],
    faqs: [
      { question: 'Is Frost the right choice for a first Mage?', answer: 'This site publishes it as an editorial eleven-point starter. It has been replayed through the planner; target immunities, spell timing and in-game leveling performance have not been validated here.' },
      { question: 'Do I need Improved Blizzard to level as Frost?', answer: 'This leveling preset has no Improved Blizzard point. The area preset moves one Ice Shards point into that node while retaining the same two Improved Frost Nova points; use the calculator to compare them.' },
    ],
  },
  {
    kind: 'specLeveling',
    slug: 'wow-forever-fire-mage-leveling-build',
    intent: 'Fire Leveling',
    title: 'WoW Forever Fire Mage Leveling Build',
    h1: 'WoW Forever Fire Mage Leveling Build',
    description: 'Leveling as a Fire Mage at the Level 20 starter snapshot: the verified Fire entry point, why the leveling preset is still under review, and the published Frost and Arcane alternatives.',
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
          'Frost is the reviewed Level 20 leveling recommendation on this site, but no reviewed Fire route is available for a fair comparison. Both branches have client-reviewed entry nodes; Frost also has control tools in the published data. The head-to-head page remains withheld until the Fire allocation is reviewed.',
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
    description: 'The Arcane Mage Level 20 starter allocation: replay its eleven points, compare the Channeling variant and see which effect descriptions remain unresolved.',
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
          'This is an editorial alternative for comparing eleven-point allocations. Arcane Focus, Arcane Concentration and Arcane Impact have unresolved rank descriptions in the published snapshot, so this route does not establish mana savings, cast reliability or leveling speed. ' + ELEVEN_POINT_NOTE,
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
          'This Level 20 snapshot covers the first phase of Arcane. Later rows require more than 11 points: 15 for Arcane Shielding and Improved Counterspell, 20 for Presence of Mind and Arcane Mind, and 30 for Arcane Power. Those gates are client data; this page does not turn them into a Level 30 recommendation.',
        ],
      },
    ],
    faqs: [
      { question: 'Is Arcane a good leveling choice?', answer: 'It is a planner-legal editorial alternative. Compare its five Arcane Focus ranks, five Arcane Concentration ranks and one Arcane Impact rank with the Arcane Channeling preset; neither legal ranks nor an eleven-point total prove in-game leveling performance.' },
      { question: 'How deep can 11 Arcane points go?', answer: 'As far as the third row in this route. Arcane Impact requires ten Arcane points, leaving one rank for the eleventh point.' },
    ],
  },
  {
    kind: 'aoe',
    slug: 'wow-forever-frost-mage-aoe-build',
    intent: 'Frost AoE farming',
    title: 'WoW Forever Frost Mage AoE Build',
    h1: 'WoW Forever Frost Mage AoE Build',
    description: 'Compare the Frost Mage eleven-point area preset with the single-target route, replay the three-point tradeoff and inspect unresolved effect and spell-learning details.',
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
          'Improved Frostbolt 5, Ice Shards 3, Improved Frost Nova 2 and Improved Blizzard 1. This Level 20 allocation differs from the Frost single-target route: it gives up two Ice Shards ranks and one Piercing Ice rank for two Improved Frost Nova ranks and one Improved Blizzard rank. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Spend order',
        paragraphs: [
          'Improved Frostbolt first — five points, and enough to open the second row. Ice Shards to three ranks next. Improved Frost Nova ranks after that, and Improved Blizzard last: it needs ten Frost points spent before the tree will let you take it, which is exactly what the first three steps provide.',
        ],
      },
      {
        heading: 'Spells this route leans on',
        paragraphs: [
          'This allocation selects Improved Frost Nova and Improved Blizzard; it does not verify when the underlying spells are learned. Both nodes have unresolved rank descriptions in this snapshot. Improved Frostbolt has published cast-time reduction text, but the talent catalogue is not a Mage spellbook or a verified combat rotation.',
        ],
      },
      {
        heading: 'Replay the area tradeoff',
        paragraphs: [
          'Load the area preset, then compare it with the single-target preset. The first eight points match. The final three change from two Ice Shards points and one Piercing Ice point to two Improved Frost Nova points and one Improved Blizzard point. Copy the resulting allocation only after checking that the calculator still shows eleven points.',
        ],
      },
    ],
    faqs: [
      { question: 'Why does this build not max Ice Shards?', answer: 'It is an editorial three-point tradeoff. Both builds spend their first eight points the same way; this preset uses the final three for two Improved Frost Nova ranks and one Improved Blizzard rank instead of the single-target preset’s two additional Ice Shards ranks and one Piercing Ice rank.' },
      { question: 'Does the allocation verify a farming rotation?', answer: 'No. The planner verifies its selected ranks and point order. The saved talent dataset does not establish spell-learning levels, target immunities or a farming rotation.' },
    ],
  },
  {
    kind: 'pvp',
    slug: 'wow-forever-mage-pvp-build',
    intent: 'Mage PvP hub',
    title: 'WoW Forever Mage PvP Build',
    h1: 'WoW Forever Mage PvP Build',
    description: 'The Mage PvP hub for the Level 20 starter snapshot, with a tab per specialization, the allocation each one loads, and the fire tab that cannot be supplied yet.',
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
      { question: 'Are the Frost and Arcane PvP allocations legal now?', answer: 'Yes, as Level 20 starter allocations. Both spend 11 points and replay through the planner without a skipped requirement; neither is a reviewed Level 30 route.' },
    ],
  },
  {
    kind: 'dungeon',
    slug: 'wow-forever-mage-dungeon-build',
    intent: 'Dungeon',
    title: 'WoW Forever Mage Dungeon Build',
    h1: 'WoW Forever Mage Dungeon Build',
    description: 'The Mage dungeon build for the Level 20 starter snapshot: a Frost utility-focused 11-point allocation, the control that groups want, and the class claims that stay assumptions.',
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
          'Frost Warding 2, Improved Frostbolt 5 and Ice Shards 4. Frost Warding and Improved Frostbolt have published rank text; Ice Shards effect text is unresolved. Compare the two Frost Warding ranks, five Improved Frostbolt ranks and four Ice Shards ranks with the area preset before changing the route. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'Utility and control first',
        paragraphs: [
          'The dungeon preset spends two points in Frost Warding, five in Improved Frostbolt and four in Ice Shards. The area preset drops Frost Warding and one Ice Shards point to allocate two Improved Frost Nova points and one Improved Blizzard point. This comparison identifies the selected talents; it does not verify spell availability or group-control performance.',
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
          'Fire is often offered as a dungeon alternative, but BuildForgeTools has not reviewed a Fire dungeon allocation for this Level 20 snapshot or the new Level 30 phase. The calculator can plan one manually; this page presents only the 11-point Frost route.',
        ],
      },
    ],
    faqs: [
      { question: 'Why does the dungeon build start with Frost Warding?', answer: 'It is an entry-row node with published armor, resistance and Frost Ward reflection text. The editorial order allocates its two points first; that does not guarantee protection against every dungeon pull.' },
      { question: 'Is there a fire dungeon alternative?', answer: 'No reviewed Fire dungeon preset is published yet, so only the Frost route is presented.' },
    ],
  },
  {
    kind: 'levelCap',
    slug: 'wow-forever-mage-level-20-build',
    intent: 'Level 20 starter snapshot',
    title: 'WoW Forever Mage Level 20 Build',
    h1: 'WoW Forever Mage Level 20 Build',
    description: 'The initial Level 20 Mage snapshot: 11-point Frost and Arcane routes and the planner-ready Fire tree. The current Beta cap is Level 30.',
    eyebrow: 'Level 20 Starter Snapshot',
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
          'The Beta began with a Level 20 cap and an 11-point planning budget. Blizzard raised the live cap to Level 30 on October 1. The calculator also offers Level 30 and Level 60 point-budget modes, but this page documents only reviewed Level 20 routes. ' + ELEVEN_POINT_NOTE,
        ],
      },
      {
        heading: 'The three specs in this starter snapshot',
        bullets: [
          'Frost — legal: an 11-point single-target route, with a distinct area variant for packs',
          'Arcane — legal: an 11-point route through the entry rows, with deeper nodes stated as out of reach',
          'Fire — planner-ready from Improved Fireball; the reviewed 11-point preset is still pending',
        ],
        paragraphs: [
          'This page compares the three specs at Level 20. All three branches have client-reviewed entry nodes, while the Frost and Arcane 11-point builds remain editorial recommendations rather than verified Level 30 routes.',
        ],
      },
      {
        heading: 'How to use this older snapshot',
        paragraphs: [
          'The playable cap has already risen to Level 30. Keep this Level 20 page as a starting allocation; do not treat its eleven points as a complete current-cap build.',
        ],
      },
    ],
    faqs: [
      { question: 'How many points are in this Level 20 Mage snapshot?', answer: '11 planning points, spendable across Arcane, Fire and Frost. The live Beta cap is Level 30; this page does not document a reviewed Level 30 allocation.' },
      { question: 'Which Mage specs have reviewed 11-point presets?', answer: 'Frost and Arcane have published starter presets. Fire has a client-reviewed entry node, but its preset remains under review.' },
    ],
  },
  {
    kind: 'comparison',
    slug: 'wow-forever-frost-vs-fire-mage-leveling',
    intent: 'Frost vs Fire leveling',
    title: 'Frost vs Fire Mage for Leveling in WoW Forever',
    h1: 'Frost vs Fire Mage for Leveling in WoW Forever',
    description: 'Frost and Fire compared for Mage leveling at the Level 20 starter snapshot: playstyle, area damage, safety, key mechanics and what each branch can actually allocate today.',
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
          'The table compares Frost and Fire for the Level 20 starter snapshot on playstyle, area damage, safety, key mechanics and what each branch can allocate. It does not claim to compare reviewed Level 30 builds.',
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
      columns: ['Playstyle', 'AoE', 'Safety', 'Key mechanics', 'Level 20 snapshot'],
      rows: [
        {
          label: 'Frost',
          values: [
            'Editorial eleven-point Frost allocation with published Frostbolt cast-time reduction text',
            'The separate area preset allocates one Improved Blizzard point; its effect text remains unresolved',
            'Two ranks in the same Improved Frost Nova node; spell timing is unverified',
            'Improved Frostbolt 5, Ice Shards 4 and Improved Frost Nova 2; unresolved effect text is identified',
            'Legal 11-point leveling route published',
          ],
        },
        {
          label: 'Fire',
          values: [
            'A reviewed eleven-point Fire preset is not yet published',
            'Blast Wave needs 20 Fire points, beyond this eleven-point starter comparison',
            'Safety and control of a Fire starter have not been reviewed here',
            'Improved Fireball entry node; several resolved Fire rank descriptions remain unavailable',
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
  builds: mageBuilds.map((build) => ({
    ...build,
    sources: [...build.sources, { label: 'Blizzard October 1 Beta development notes: Level 30 cap', url: OFFICIAL_CAP_SOURCE }],
  })),
  pages: magePages.map((page) => ({
    ...page,
    sections: page.sections.map((section, index) => index === 0 ? { ...section, paragraphs: [LIVE_CAP_NOTE, ...section.paragraphs] } : section),
    ogImage: page.spec === 'frost' ? FROST_MAGE_HERO : page.spec === 'arcane' ? ARCANE_MAGE_HERO : page.ogImage,
  })),
  // Frost leveling first: the class-level recommendation the calculator loads by default.
  recommendedBuildIds: ['mage-leveling', 'mage-frost-build', 'mage-arcane-build'],
  sources: MAGE_SOURCES,
}
