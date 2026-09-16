import type { BuildCardIcon } from '../BuildCard'

export type SpecializationIcon = 'holy' | 'protection' | 'retribution'

export interface HubSpecialization {
  name: string
  role: string
  href: string
  icon: SpecializationIcon
}

export interface HubBuild {
  title: string
  description: string
  href: string
  icon: BuildCardIcon
}

export interface HubPlaystyleSection {
  id: string
  eyebrow: string
  heading: string
  intro: string
  builds: HubBuild[]
}

export const HUB_TITLE = 'WoW Forever Paladin Builds & Talent Calculator'

export const HUB_INTRO = 'All Paladin builds for WoW Forever.'
export const HUB_INTRO_SUB = 'Choose your playstyle, then customize a talent setup.'

export const HUB_SPECIALIZATIONS: HubSpecialization[] = [
  { name: 'Holy', role: 'Healing & Support', href: '/wow-forever-paladin-build', icon: 'holy' },
  { name: 'Protection', role: 'Tank & Defense', href: '/wow-forever-protection-paladin-builds', icon: 'protection' },
  { name: 'Retribution', role: 'Melee Damage', href: '/wow-forever-retribution-paladin-build', icon: 'retribution' },
]

export const HUB_PLAYSTYLE_SECTIONS: HubPlaystyleSection[] = [
  {
    id: 'leveling',
    eyebrow: 'Leveling Builds',
    heading: 'Level Efficiently from 1–60',
    intro: 'Solo-friendly talent paths for steady progression while leveling.',
    builds: [
      { title: 'Paladin Leveling Build', description: 'A flexible solo path from level 10 onward, focused on steady progression and survivability.', href: '/wow-forever-paladin-leveling-build', icon: 'leveling' },
      { title: 'Protection Paladin Leveling Build', description: 'A durable solo route that leans on defensive talents and carries into dungeon tanking.', href: '/wow-forever-protection-paladin-leveling-build', icon: 'protection' },
      { title: 'Retribution Paladin Leveling Build', description: 'A damage-focused solo leveling route with early Holy support for questing.', href: '/wow-forever-retribution-paladin-leveling-build', icon: 'retribution' },
    ],
  },
  {
    id: 'pve',
    eyebrow: 'PvE Builds',
    heading: 'Group Content Builds',
    intro: 'Tank, healing, and damage setups for dungeons and raids.',
    builds: [
      { title: 'Protection Paladin Dungeon Tank Build', description: 'A defensive tank setup for dungeons and group content.', href: '/wow-forever-protection-paladin-dungeon-build', icon: 'protection' },
      { title: 'Protection Paladin Shield Build', description: 'A complete 20/31/0 Protection tank build for group play.', href: '/wow-forever-protection-paladin-build', icon: 'protection' },
      { title: 'Paladin Raid Build', description: 'Raid-oriented paths for healing, tanking, and damage support.', href: '/wow-forever-paladin-raid-build', icon: 'raid' },
    ],
  },
  {
    id: 'pvp',
    eyebrow: 'PvP Builds',
    heading: 'Arena & Battleground Builds',
    intro: 'Pressure, utility, and survivability for player-versus-player combat.',
    builds: [
      { title: 'Paladin PvP Build', description: 'Pressure, utility, and survivability for arena and battlegrounds.', href: '/wow-forever-paladin-pvp-build', icon: 'pvp' },
      { title: 'Retribution Paladin PvP Build', description: 'A burst-oriented setup built around short damage windows and utility.', href: '/wow-forever-retribution-paladin-pvp-build', icon: 'retribution' },
      { title: 'Holy Paladin PvP Build', description: 'A support-oriented direction for keeping teammates alive under pressure.', href: '/wow-forever-holy-paladin-pvp-build', icon: 'holy' },
    ],
  },
]

export const HUB_BUILD_HREFS = [
  ...HUB_SPECIALIZATIONS.map((spec) => spec.href),
  ...HUB_PLAYSTYLE_SECTIONS.flatMap((section) => section.builds.map((build) => build.href)),
]
