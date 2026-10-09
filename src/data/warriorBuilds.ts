import type { PlannerBuild } from '../lib/talentPlanner'
import type { WarriorBranch } from './warriorTalents'

export interface WarriorPreset {
  id: string
  branch: WarriorBranch
  title: string
  shortTitle: string
  allocation: string
  role: string
  summary: string
  build: PlannerBuild
  order: string[]
}

const repeat = (id: string, ranks: number) => Array.from({ length: ranks }, () => id)

const armsOrder = [
  ...repeat('warrior-arms-improved-rend', 3),
  ...repeat('warrior-arms-deflection', 2),
  ...repeat('warrior-arms-improved-tactical-mastery', 5),
  'warrior-arms-anger-management',
]

const furyOrder = [
  ...repeat('warrior-fury-cruelty', 5),
  ...repeat('warrior-fury-unbridled-wrath', 5),
  'warrior-fury-piercing-howl',
]

const protectionOrder = [
  ...repeat('warrior-protection-shield-specialization', 5),
  ...repeat('warrior-protection-improved-bloodrage', 2),
  ...repeat('warrior-protection-improved-thunder-clap', 3),
  'warrior-protection-last-stand',
]

const buildFromOrder = (order: string[]): PlannerBuild => order.reduce<PlannerBuild>((build, id) => ({ ...build, [id]: (build[id] ?? 0) + 1 }), {})

export const WARRIOR_LEVEL_20_BUILDS: WarriorPreset[] = [
  {
    id: 'arms-level-20', branch: 'arms', title: 'Level 20 Arms Warrior Build', shortTitle: 'Arms Leveling', allocation: '11/0/0', role: 'Weapon damage · Leveling',
    summary: 'A community route built around Rend, stance-change Rage retention, and Anger Management.', order: armsOrder, build: buildFromOrder(armsOrder),
  },
  {
    id: 'fury-level-20', branch: 'fury', title: 'Level 20 Fury Warrior Build', shortTitle: 'Fury Leveling', allocation: '0/11/0', role: 'Damage · Rage flow',
    summary: 'A testable early Fury route that combines critical strike, Rage generation, and Piercing Howl utility.', order: furyOrder, build: buildFromOrder(furyOrder),
  },
  {
    id: 'protection-level-20', branch: 'protection', title: 'Level 20 Protection Warrior Build', shortTitle: 'Protection Tank', allocation: '0/0/11', role: 'Dungeon tank · Shield',
    summary: 'A shield-first route with stronger Bloodrage, cheaper Thunder Clap, and the Last Stand cooldown.', order: protectionOrder, build: buildFromOrder(protectionOrder),
  },
]

export const warriorPresetById = (id: string) => [...WARRIOR_LEVEL_20_BUILDS, ...WARRIOR_LEVEL_30_BUILDS, ...WARRIOR_PVP_LEVEL_30_BUILDS].find((preset) => preset.id === id)


const armsLevel30Order = [
  ...armsOrder,
  ...repeat('warrior-arms-deep-wounds', 3),
  'warrior-arms-improved-overpower',
  ...repeat('warrior-arms-two-handed-weapon-specialization', 3),
  ...repeat('warrior-arms-impale', 2),
  'warrior-arms-sweeping-strikes',
]

const furyLevel30Order = [
  ...furyOrder,
  ...repeat('warrior-fury-furious-precision', 3),
  'warrior-fury-lingering-rage',
  ...repeat('warrior-fury-dual-wield-specialization', 5),
  'warrior-fury-death-wish',
]

const protectionLevel30Order = [
  ...protectionOrder,
  ...repeat('warrior-protection-master-of-defense', 2),
  ...repeat('warrior-protection-defiance', 2),
  ...repeat('warrior-protection-improved-sunder-armor', 2),
  'warrior-protection-vanguard',
  ...repeat('warrior-protection-improved-shield-bash', 2),
  'warrior-protection-concussion-blow',
]

/** Editorial test routes in the reviewed 70291 tree, not measured rankings. */
export const WARRIOR_LEVEL_30_BUILDS: WarriorPreset[] = [
  {
    id: 'arms-level-30', branch: 'arms', title: 'Level 30 Arms Warrior Build', shortTitle: 'Arms Leveling', allocation: '21/0/0', role: 'Weapon damage · Sweeping Strikes',
    summary: 'Extend the Rend and stance-retention opening into Deep Wounds, Impale, two-handed damage and Sweeping Strikes.', order: armsLevel30Order, build: buildFromOrder(armsLevel30Order),
  },
  {
    id: 'fury-level-30', branch: 'fury', title: 'Level 30 Fury Warrior Build', shortTitle: 'Fury Off-hand', allocation: '0/21/0', role: 'Off-hand damage · Rage flow',
    summary: 'A dual-wield test route with Furious Precision, off-hand Rage from Dual Wield Specialization and the Death Wish cooldown.', order: furyLevel30Order, build: buildFromOrder(furyLevel30Order),
  },
  {
    id: 'protection-level-30', branch: 'protection', title: 'Level 30 Protection Warrior Build', shortTitle: 'Protection Tank', allocation: '0/0/21', role: 'Dungeon tank · Shield control',
    summary: 'Extend the shield opening into dodge/parry Rage, Defensive Stance threat, Vanguard, Shield Bash silence and Concussion Blow.', order: protectionLevel30Order, build: buildFromOrder(protectionLevel30Order),
  },
]

const armsPvpOrder = [
  ...armsOrder,
  ...repeat('warrior-arms-deep-wounds', 3),
  'warrior-arms-improved-overpower',
  'warrior-arms-spearing-strike',
  ...repeat('warrior-arms-two-handed-weapon-specialization', 2),
  ...repeat('warrior-arms-impale', 2),
  'warrior-arms-sweeping-strikes',
]

const furyPvpOrder = [
  ...furyOrder,
  ...repeat('warrior-fury-blood-craze', 3),
  'warrior-fury-lingering-rage',
  ...repeat('warrior-fury-enrage', 5),
  'warrior-fury-death-wish',
]

export const WARRIOR_PVP_LEVEL_30_BUILDS: WarriorPreset[] = [
  {
    id: 'arms-pvp-level-30', branch: 'arms', title: 'Level 30 Arms Warrior PvP Build', shortTitle: 'Arms PvP', allocation: '21/0/0', role: 'Weapon pressure · Mounted-target control',
    summary: 'Trade one two-handed damage rank for Spearing Strike while retaining bleeds, stance Rage and Sweeping Strikes.', order: armsPvpOrder, build: buildFromOrder(armsPvpOrder),
  },
  {
    id: 'fury-pvp-level-30', branch: 'fury', title: 'Level 30 Fury Warrior PvP Build', shortTitle: 'Fury PvP', allocation: '0/21/0', role: 'Melee pressure · Reactive recovery',
    summary: 'Choose Blood Craze and Enrage instead of the off-hand package, with Piercing Howl and Death Wish for control and pressure tests.', order: furyPvpOrder, build: buildFromOrder(furyPvpOrder),
  },
]
