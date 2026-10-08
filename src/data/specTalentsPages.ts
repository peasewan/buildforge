import type { Branch } from '../lib/build'
import type { ExampleBuildId } from './builds'

export interface SpecTalentsPageConfig {
  spec: Branch
  slug: string
  title: string
  metaTitle: string
  description: string
  eyebrow: string
  intro: string
  /** The example allocation the tree preview highlights. */
  buildId: ExampleBuildId
  allocation: { label: string; value: string; note: string }
  sections: { heading: string; paragraphs: string[] }[]
  /** Where this specialization's builds live. Holy has no dedicated hub yet. */
  hub: { href: string; label: string }
  nav: { href: string; label: string }[]
}

/**
 * Every paragraph below describes nodes that are actually in the transcribed tree
 * (`src/data/talents.ts`). Nothing here should assert a talent effect the data does
 * not carry — build recommendations are kept separate from verified client fields for that reason.
 */
export const SPEC_TALENTS_PAGES: SpecTalentsPageConfig[] = [
  {
    spec: 'holy',
    slug: 'wow-forever-holy-paladin-talents',
    title: 'WoW Forever Holy Paladin Talents',
    metaTitle: 'WoW Forever Holy Paladin Talents | Talent Tree',
    description: 'Explore the WoW Forever Holy Paladin talent tree, review the healing and support talents, and plan your own allocation in the talent calculator.',
    eyebrow: 'Holy Talent Guide',
    intro: 'Explore Holy healing and support talents in the imported 69913 tree. The live Beta cap is Level 30; the 51-point allocation below is a historical reference, not a current build.',
    buildId: 'holy-healing-31-20-0',
    allocation: {
      label: 'Historical 51-point reference',
      value: '31 Holy',
      note: 'This 31/20/0 route uses all 51 points in the older 1.60.1.69913 client snapshot. It exceeds the live Level 30 Beta cap; inspect it as a long-term reference, then start a new calculator route for current testing.',
    },
    sections: [
      {
        heading: 'Planning Holy Paladin Talents',
        paragraphs: [
          'Holy Paladin talents organize the healing side of the WoW Forever Paladin tree. The opening rows in the imported 69913 snapshot include Divine Strength and Divine Intellect. Healing Light, Spiritual Focus, and Improved Seals follow, alongside utility options such as Unyielding Faith and Reverence. These are tree landmarks for comparison, not an endorsed Level 30 point order.',
          'Deeper rows in that older snapshot contain Illumination, Divine Favor, Divine Precision, Purifying Power, Infusion of Light, Holy Shock, and Light’s Vigil. BuildForgeTools displays the imported 1.60.1.69913 positions and rank tooltips so players can inspect the historical tree. Later official changes are tracked separately; a fully reconciled current-cap route has not yet been published.',
        ],
      },
      {
        heading: 'From Talent Tree to Healing Build',
        paragraphs: [
          'The featured 31/20/0 allocation spends 31 points in Holy and 20 in Protection. Its 51-point total is beyond the live Level 30 Beta cap. The read-only tree below preserves that longer-term example, while its calculator links start blank so the old allocation is not presented as a current preset.',
          'To test a Holy route now, add only points available to your character and check important effects against current in-game tooltips. The calculator uses reviewed 70245 structure and separately sourced community rank text, so treat later patch notices and any uncertain rank text separately from a verified live allocation.',
        ],
      },
    ],
    hub: { href: '/wow-forever-paladin-build', label: 'Holy Healing Build' },
    nav: [
      { href: '/wow-forever-paladin-build', label: 'Holy Healing Build' },
      { href: '#talent-tree', label: 'Talent Tree' },
      { href: '/paladin', label: 'Calculator' },
    ],
  },
  {
    spec: 'protection',
    slug: 'wow-forever-protection-paladin-talents',
    title: 'WoW Forever Protection Paladin Talents',
    metaTitle: 'WoW Forever Protection Paladin Talents | Talent Tree',
    description: 'Explore the WoW Forever Protection Paladin talent tree, review key tank talents, and create a custom build in the talent calculator.',
    eyebrow: 'Protection Talent Guide',
    intro: 'Explore Protection tank talents in the imported 69913 tree. The live Beta cap is Level 30; the 51-point tank allocation below is a historical reference, not a current build.',
    buildId: 'protection-shield-20-31-0',
    allocation: {
      label: 'Historical 51-point reference',
      value: '31 Protection',
      note: 'This 20/31/0 route uses all 51 points in the older 1.60.1.69913 client snapshot. It exceeds the live Level 30 Beta cap, and its Redoubt and Holy Shield tooltips predate the October 1 tuning.',
    },
    sections: [
      {
        heading: 'Planning Protection Paladin Talents',
        paragraphs: [
          'Protection Paladin talents organize the defensive side of the WoW Forever Paladin tree. The opening rows in the imported 69913 snapshot include Toughness, Redoubt, Precision, and Anticipation. Improved Righteous Fury and Improved Seal of Fury appear among threat choices, while Guardian’s Favor and Sacred Duty are utility landmarks. This is a historical tree inventory, not a reviewed Level 30 tank order.',
          'Deeper rows in that older snapshot include Shield Specialization, One-Handed Weapon Specialization, Templar’s Bulwark, Reckoning, Iron Creed, Swift Judgement, and Holy Shield. Blizzard changed Redoubt and Holy Shield on October 1. Their 69913 rank text can therefore be stale even though the old positions remain useful for comparing the historical route.',
        ],
      },
      {
        heading: 'From Talent Tree to Tank Build',
        paragraphs: [
          'The featured 20/31/0 allocation combines 31 Protection points with 20 Holy points. Its 51-point total is beyond the live Level 30 Beta cap. The read-only preview preserves it as a long-term reference; the calculator links start blank rather than loading it as a current tank preset.',
          'For a tank build you can test now, start from a blank tree and check the current client before relying on mitigation, threat, or prerequisite text. The calculator uses reviewed 70245 structure and separately sourced community rank text, while historical rank text is preserved separately from current resolved descriptions.',
        ],
      },
    ],
    hub: { href: '/wow-forever-protection-paladin-builds', label: 'Protection Builds' },
    nav: [
      { href: '/wow-forever-protection-paladin-builds', label: 'Protection Builds' },
      { href: '#talent-tree', label: 'Talent Tree' },
      { href: '/paladin', label: 'Calculator' },
    ],
  },
  {
    spec: 'retribution',
    slug: 'wow-forever-retribution-paladin-talents',
    title: 'WoW Forever Retribution Paladin Talents',
    metaTitle: 'WoW Forever Retribution Paladin Talents | Talent Tree',
    description: 'Explore the WoW Forever Retribution Paladin talent tree, review the damage and judgement talents, and plan your own build in the talent calculator.',
    eyebrow: 'Retribution Talent Guide',
    intro: 'Explore Retribution damage talents in the imported 69913 tree. The live Beta cap is Level 30; the 51-point route below is historical and includes Crusade, absent from the reviewed 70245 tree.',
    buildId: 'retribution-judgment-0-20-31',
    allocation: {
      label: 'Historical 51-point reference',
      value: '31 Retribution',
      note: 'This 0/20/31 route uses all 51 points in the older 1.60.1.69913 snapshot. It exceeds the live Level 30 cap and selects Crusade; the reviewed 70245 tree confirms that this node is absent, so do not use it as a current route.',
    },
    sections: [
      {
        heading: 'Planning Retribution Paladin Talents',
        paragraphs: [
          'Retribution Paladin talents organize the damage side of the WoW Forever Paladin tree. The opening rows in the imported 69913 snapshot include Deflection, Benediction, and Improved Judgement. Conviction and Vindication follow, alongside options such as Pursuit of Justice and Eye for an Eye. These names describe the older tree; they do not establish a reviewed current-cap point order.',
          'Deeper rows in the imported 69913 snapshot include Seal of Command, Sanctified Judgement, Crusade, Vengeance, Two-Handed Weapon Specialization, Sacred Arbiter, and Repentance. Champion of the Light, Instrument of Law, and Twist of Light are other deeper tree options, not all selected by this example. The reviewed 70245 TraitTree confirms Crusade node 110883 is absent; no official removal note is claimed. Blizzard also changed Champion of the Light on October 1. The 51-point preview retains its original ranks and remains a historical comparison.',
        ],
      },
      {
        heading: 'From Talent Tree to Damage Build',
        paragraphs: [
          'The featured 0/20/31 snapshot reached deeper Retribution nodes while spending 20 points in Protection. Its 51-point total exceeds the live Level 30 Beta cap. It also selects Crusade, so the read-only example is not loaded as a current calculator preset. The separate Level 20 route is an older editable starting snapshot, not a verified Level 30 recommendation.',
          'To test Retribution now, start a blank route and confirm important ranks against current in-game tooltips. The calculator uses reviewed 70245 structure and separately sourced community rank text, while Crusade remains readable only in historical allocations.',
        ],
      },
    ],
    hub: { href: '/wow-forever-retribution-paladin-builds', label: 'Retribution Builds' },
    nav: [
      { href: '/wow-forever-retribution-paladin-builds', label: 'Retribution Builds' },
      { href: '#talent-tree', label: 'Talent Tree' },
      { href: '/paladin', label: 'Calculator' },
    ],
  },
]

export function specTalentsPageBySpec(spec: Branch) {
  return SPEC_TALENTS_PAGES.find((page) => page.spec === spec) ?? SPEC_TALENTS_PAGES[0]
}
