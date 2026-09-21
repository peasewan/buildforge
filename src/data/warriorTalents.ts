import rawTalents from './warrior-beta-1.60.1.69913.json'
import type { PlannerConfig, PlannerPrerequisite, PlannerTalent } from '../lib/talentPlanner'

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

export interface WarriorTalentSource {
  label: string
  type: 'beta_client' | 'beta_client_crosscheck'
  url: string
}

export interface WarriorTalent extends PlannerTalent<WarriorBranch> {
  name: string
  description: string
  rankDescriptions: string[]
  row: number
  column: number
  x: number
  y: number
  iconName: string
  icon: string
  sourceClientBuild: string
  verifiedThroughBuild: string
  sourceTalentId: number
  verificationStatus: 'client_verified'
  prerequisiteRuleStatus: 'derived_assumption' | 'not_applicable'
  changeStatus: string
  sources: WarriorTalentSource[]
}

type RawWarriorTalent = Omit<WarriorTalent, 'x' | 'y' | 'prerequisite'> & {
  prerequisite: PlannerPrerequisite[]
}

const columnX: Record<number, number> = { 1: 12.5, 2: 37.5, 3: 62.5, 4: 87.5 }
const rowY: Record<number, number> = { 1: 7, 2: 21.3, 3: 35.6, 4: 49.9, 5: 64.2, 6: 78.5, 7: 92.8 }

export const warriorTalents: WarriorTalent[] = (rawTalents as RawWarriorTalent[]).map((talent) => ({
  ...talent,
  x: columnX[talent.column],
  y: rowY[talent.row],
}))

export const warriorTalentById = (id: string) => warriorTalents.find((talent) => talent.id === id)

