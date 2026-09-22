import rawTalents from './warrior-beta-1.60.1.69913.json'
import type { ClassTalent, ClassTalentSource, FieldEvidenceKey } from '../lib/classPage'
import type { PlannerConfig, PlannerPrerequisite } from '../lib/talentPlanner'

export type WarriorBranch = 'arms' | 'fury' | 'protection'
export const WARRIOR_DATA_VERSION = 'wow_forever_beta_1.60.1.69913' as const
export const WARRIOR_SOURCE_BUILD = '1.60.1.69876' as const
export const WARRIOR_VERIFIED_BUILD = '1.60.1.69913' as const
export const WARRIOR_BRANCHES = ['arms', 'fury', 'protection'] as const

export const WARRIOR_PLANNER_CONFIG: PlannerConfig<WarriorBranch> = {
  branches: WARRIOR_BRANCHES,
  pointCap: 51,
}

export const warriorBranchNames: Record<WarriorBranch, string> = {
  arms: 'Arms',
  fury: 'Fury',
  protection: 'Protection',
}

export const warriorBranchTaglines: Record<WarriorBranch, string> = {
  arms: 'Control the fight with weapons, bleeds, and stance mastery.',
  fury: 'Turn Rage and attack speed into relentless pressure.',
  protection: 'Hold the line with shields, control, and defensive tools.',
}

export type WarriorTalent = ClassTalent<WarriorBranch>

export const WARRIOR_SOURCES: ClassTalentSource[] = [
  { label: 'WoW Forever Talents Warrior client view', type: 'beta_client', url: 'https://wowforevertalents.net/warrior/' },
  { label: 'TheWoWDB Warrior talent cross-check', type: 'beta_client_crosscheck', url: 'https://thewowdb.com/wow-forever/talents/warrior/' },
]

type RawWarriorTalent = Omit<WarriorTalent, 'x' | 'y' | 'prerequisite' | 'fieldEvidence' | 'changeStatus'> & {
  prerequisite: PlannerPrerequisite[]
  changeStatus: string
}

const columnX: Record<number, number> = { 1: 12.5, 2: 37.5, 3: 62.5, 4: 87.5 }
const rowY: Record<number, number> = { 1: 7, 2: 21.3, 3: 35.6, 4: 49.9, 5: 64.2, 6: 78.5, 7: 92.8 }

const verifiedFields: FieldEvidenceKey[] = ['name', 'branch', 'row', 'column', 'maxRank', 'requiredTreePoints', 'rankDescriptions', 'sourceTalentId', 'iconName', 'changeStatus']

const normalizeChangeStatus = (status: string): WarriorTalent['changeStatus'] => {
  if (status === 'new_in_dataset') return 'new'
  if (status === 'same_in_dataset') return 'same'
  if (status === 'text_changed' || status === 'moved') return 'changed'
  return 'unknown'
}

export const warriorTalents: WarriorTalent[] = (rawTalents as RawWarriorTalent[]).map((talent) => ({
  ...talent,
  x: columnX[talent.column] ?? 50,
  y: rowY[talent.row] ?? 50,
  fieldEvidence: Object.fromEntries([
    ...verifiedFields.map((field) => [field, 'client_verified'] as const),
    ...(talent.prerequisite.length > 0 ? [['prerequisiteLink', 'client_verified'] as const] : []),
  ]),
  changeStatus: normalizeChangeStatus(talent.changeStatus),
}))

export const warriorTalentById = (id: string) => warriorTalents.find((talent) => talent.id === id)
