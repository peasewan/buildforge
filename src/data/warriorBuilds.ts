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

export const warriorPresetById = (id: string) => WARRIOR_LEVEL_20_BUILDS.find((preset) => preset.id === id)

