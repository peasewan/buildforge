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
    intro: 'Explore the Holy Paladin talent tree. Plan talent points, review the healing and support talents, and create your own build.',
    buildId: 'holy-healing-31-20-0',
    allocation: {
      label: 'Example Beta allocation',
      value: '31 Holy',
      note: 'The selected route reaches Holy Shock and Light’s Vigil through the healing, spell support, and utility talents in the Beta client build 1.60.1.69913.',
    },
    sections: [
      {
        heading: 'Planning Holy Paladin Talents',
        paragraphs: [
          'Holy Paladin talents organize the healing side of the WoW Forever Paladin tree. The opening rows in this Beta example include Divine Strength and Divine Intellect, which support the class baseline before any healing choice is made. Healing Light, Spiritual Focus, and Improved Seals follow, alongside utility options such as Unyielding Faith and Reverence that shape how the build plays around other players.',
          'Deeper rows move into the talents a healing build is usually recognised by. Illumination, Divine Favor, and Divine Precision sit alongside Purifying Power and Infusion of Light, with Holy Shock and Light’s Vigil among the nodes that define the specialization. BuildForgeTools publishes these nodes from Beta client build 1.60.1.69913 so players can inspect the current structure and rank tooltips.',
        ],
      },
      {
        heading: 'From Talent Tree to Healing Build',
        paragraphs: [
          'A Holy tree becomes more useful when it connects to a complete build. The featured 31/20/0 setup spends its Holy points first and then reaches into Protection for early survivability and utility. The full allocation can be opened from the calculator, where every selected node is visible, all 51 points are counted, and the edited result becomes a shareable URL.',
          'WoW Forever talent information may change while new captures and testing become available. Review current in-game tooltips before treating a talent value as confirmed. The planner keeps uncertain data visible, makes each edit reversible, and gives the community one consistent way to compare Holy Paladin builds.',
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
    intro: 'Explore the Protection Paladin talent tree. Plan talent points, review key talents, and create your own build.',
    buildId: 'protection-shield-20-31-0',
    allocation: {
      label: 'Example Beta allocation',
      value: '31 Protection',
      note: 'The selected route reaches Holy Shield through defensive, threat, shield, and utility talents represented in the Beta client build 1.60.1.69913.',
    },
    sections: [
      {
        heading: 'Planning Protection Paladin Talents',
        paragraphs: [
          'Protection Paladin talents organize the defensive side of the WoW Forever Paladin tree. The opening rows in this Beta example include Toughness, Redoubt, Precision, and Anticipation, which build the baseline a tank works from. Improved Righteous Fury and Improved Seal of Fury address threat, while Guardian’s Favor and Sacred Duty support the tools a group expects from a Paladin.',
          'Deeper rows add the shield and durability choices the specialization is recognised by. Shield Specialization, One-Handed Weapon Specialization, and Templar’s Bulwark sit alongside Reckoning, Iron Creed, and Swift Judgement, with Holy Shield among the nodes that define the route. BuildForgeTools publishes these nodes from Beta client build 1.60.1.69913 so players can inspect the current structure and rank tooltips.',
        ],
      },
      {
        heading: 'From Talent Tree to Tank Build',
        paragraphs: [
          'The Protection tree becomes more useful when it connects to a complete build. The featured 20/31/0 setup combines 31 Protection points with early Holy support and can be opened from the Protection Builds Hub. From there, the calculator shows every selected node, counts all 51 points, and creates a shareable URL for the edited result.',
          'WoW Forever talent information may change while new captures and testing become available. Review current in-game tooltips before treating a talent value as confirmed. The planner keeps uncertain data visible, makes each edit reversible, and gives the community one consistent way to compare Protection Paladin builds.',
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
    intro: 'Explore the Retribution Paladin talent tree. Plan talent points, review the damage talents, and create your own build.',
    buildId: 'retribution-judgment-0-20-31',
    allocation: {
      label: 'Example Beta allocation',
      value: '31 Retribution',
      note: 'The selected route reaches Crusade and Vengeance through the weapon, judgement, and seal talents in the Beta client build 1.60.1.69913.',
    },
    sections: [
      {
        heading: 'Planning Retribution Paladin Talents',
        paragraphs: [
          'Retribution Paladin talents organize the damage side of the WoW Forever Paladin tree. The opening rows in this Beta example include Deflection, Benediction, and Improved Judgement, which set up the weapon and seal play the specialization is built around. Conviction and Vindication follow, alongside utility options such as Pursuit of Justice and Eye for an Eye that change how the build answers pressure.',
          'Deeper rows add the talents an offensive build is usually recognised by. Seal of Command, Sanctified Judgement, Crusade, and Vengeance sit alongside Two-Handed Weapon Specialization, Sacred Arbiter, and Repentance, with Champion of the Light, Instrument of Law, and Twist of Light among the nodes that close the route. BuildForgeTools publishes these nodes from Beta client build 1.60.1.69913 so players can inspect the current structure and rank tooltips.',
        ],
      },
      {
        heading: 'From Talent Tree to Damage Build',
        paragraphs: [
          'A Retribution tree becomes more useful when it connects to a complete build. The featured 0/20/31 setup reaches the deeper Retribution nodes while spending 20 points in Protection for survivability, and both the leveling and PvP routes start from the same allocation shape. The full setup opens in the calculator, where every selected node is visible, all 51 points are counted, and the edited result becomes a shareable URL.',
          'WoW Forever talent information may change while new captures and testing become available. Review current in-game tooltips before treating a talent value as confirmed. The planner keeps uncertain data visible, makes each edit reversible, and gives the community one consistent way to compare Retribution Paladin builds.',
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
