import { encodePlannerBuild } from '../lib/talentPlanner'
import { WARRIOR_LEVEL_20_BUILDS, type WarriorPreset } from './warriorBuilds'

export type WarriorBuildPageId = 'leveling' | 'arms' | 'fury' | 'protection'

export interface WarriorBuildPageData {
  id: WarriorBuildPageId
  slug: string
  metaTitle: string
  title: string
  eyebrow: string
  subtitle: string
  preset: WarriorPreset
  bestFor: string[]
  sections: { heading: string; paragraphs: string[] }[]
}

const [arms, fury, protection] = WARRIOR_LEVEL_20_BUILDS

export const warriorPlannerHref = (preset: WarriorPreset) => `/warrior?build=${encodeURIComponent(encodePlannerBuild(preset.build))}&level=20`

export const WARRIOR_BUILD_PAGES: WarriorBuildPageData[] = [
  {
    id: 'leveling', slug: 'wow-forever-warrior-leveling-build', metaTitle: 'WoW Forever Warrior Leveling Build | Level 20 Beta',
    title: 'WoW Forever Warrior Leveling Build', eyebrow: 'Level 20 Beta starter',
    subtitle: 'Compare three current-cap Warrior routes, then load a complete 11-point path in the talent calculator.', preset: arms,
    bestFor: ['Solo leveling', 'Learning stance changes', 'Testing Arms progression'],
    sections: [
      { heading: 'Choose a Level 20 Warrior path', paragraphs: ['Arms offers a direct weapon-focused route, Fury tests early Rage and critical-strike interactions, and Protection creates a shield-based path for group play. The three starters use the same 11-point budget so they are easy to compare.', 'These are community testing routes, not official or proven best builds. Load one in the calculator, adjust it around your weapons and group role, and keep the exact URL for later testing.'] },
      { heading: 'Leveling with the current Beta cap', paragraphs: ['The current planner mode assumes one talent point per level from 10 through 20. It intentionally excludes any unverified bonus talent points. Level 30 and Level 60 modes are planning views for future caps.'] },
    ],
  },
  {
    id: 'arms', slug: 'wow-forever-arms-warrior-build', metaTitle: 'WoW Forever Arms Warrior Build | Level 20 Beta',
    title: 'WoW Forever Arms Warrior Build', eyebrow: '11/0/0 community route',
    subtitle: 'A Level 20 Arms path built around Rend, retained Rage, and Anger Management.', preset: arms,
    bestFor: ['Weapon-focused leveling', 'Stance testing', 'Sustained solo fights'],
    sections: [
      { heading: 'Why this Arms route', paragraphs: ['Improved Rend supplies the opening damage package while Deflection fills the first tier. Improved Tactical Mastery then preserves more Rage through stance changes and unlocks Anger Management at the current cap.', 'The route is most useful as a controlled test: compare Rage before and after stance changes and keep weapon speed and target type consistent.'] },
      { heading: 'Talent order from Level 10 to 20', paragraphs: ['Spend three points in Improved Rend, two in Deflection, five in Improved Tactical Mastery, then take Anger Management at Level 20. The calculator link loads this exact order as an editable build.'] },
    ],
  },
  {
    id: 'fury', slug: 'wow-forever-fury-warrior-build', metaTitle: 'WoW Forever Fury Warrior Build | Level 20 Beta',
    title: 'WoW Forever Fury Warrior Build', eyebrow: '0/11/0 community route',
    subtitle: 'A Level 20 Fury path for testing critical strikes, Rage generation, and Piercing Howl utility.', preset: fury,
    bestFor: ['Fast melee combat', 'Rage-flow testing', 'Open-world control'],
    sections: [
      { heading: 'Why this Fury route', paragraphs: ['Cruelty increases critical-strike chance while Unbridled Wrath creates a measurable Rage-generation test. Piercing Howl adds a current-cap control tool after ten points are invested in Fury.', 'The route is a starting point rather than a final damage ranking. Weapon speed, uptime, and target armor all affect what feels strongest during the Beta.'] },
      { heading: 'Talent order from Level 10 to 20', paragraphs: ['Complete Cruelty first, spend five points in Unbridled Wrath, then take Piercing Howl. You can move early points between the first two talents in the calculator while keeping the same 11-point total.'] },
    ],
  },
  {
    id: 'protection', slug: 'wow-forever-protection-warrior-build', metaTitle: 'WoW Forever Protection Warrior Build | Level 20 Beta',
    title: 'WoW Forever Protection Warrior Build', eyebrow: '0/0/11 shield route',
    subtitle: 'A Level 20 Protection path for early dungeon tanking and defensive group play.', preset: protection,
    bestFor: ['Dungeon tanking', 'Shield play', 'Group leveling'],
    sections: [
      { heading: 'Why this Protection route', paragraphs: ['Shield Specialization establishes the shield package. Improved Bloodrage supports Rage generation, Improved Thunder Clap reduces an early control cost, and Last Stand provides a defensive cooldown at Level 20.', 'Use a shield and compare similar pulls when testing. The client data verifies talent text and tree placement; it does not prove threat rankings or a universal best tank build.'] },
      { heading: 'Talent order from Level 10 to 20', paragraphs: ['Take five ranks of Shield Specialization, two of Improved Bloodrage, three of Improved Thunder Clap, and Last Stand at Level 20. The linked calculator preserves the complete 0/0/11 allocation.'] },
    ],
  },
]

export const warriorBuildPageById = (id: WarriorBuildPageId) => WARRIOR_BUILD_PAGES.find((page) => page.id === id) ?? WARRIOR_BUILD_PAGES[0]

