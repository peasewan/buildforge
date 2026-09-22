import rawTalents from './mage-beta-1.60.1.69913.json'
import type { ClassTalent, ClassTalentSource } from '../lib/classPage'
import type { PlannerConfig } from '../lib/talentPlanner'
import type { MageBranch } from '../lib/mageTalentReconcile'

export type { MageBranch }
export const MAGE_DATA_VERSION = 'wow_forever_beta_1.60.1.69913' as const
export const MAGE_BRANCHES = ['arcane', 'fire', 'frost'] as const
export const MAGE_PLANNER_CONFIG: PlannerConfig<MageBranch> = { branches: MAGE_BRANCHES, pointCap: 51 }
export const mageBranchNames: Record<MageBranch, string> = { arcane: 'Arcane', fire: 'Fire', frost: 'Frost' }
export const mageBranchTaglines: Record<MageBranch, string> = {
  arcane: 'Clearcasting, counters, and later Arcane synergies.',
  fire: 'Ignite, Pyroblast, and fire damage tools.',
  frost: 'Frostbolt, control, and chill effects.',
}

export const MAGE_SOURCES: ClassTalentSource[] = [
  { label: 'ForeverDiff Mage talent calculator', type: 'beta_client', url: 'https://foreverdiff.com/talents/mage/calculator/' },
  { label: 'Build 69913 Mage talent cross-check', type: 'beta_client_crosscheck', url: 'https://thewowdb.com/wow-forever/talents/mage/' },
  { label: 'Build 69913 client Talent table', type: 'beta_client', url: 'https://wago.tools/db2/Talent/csv?build=1.60.1.69913' },
]

const columnX: Record<number, number> = { 1: 12.5, 2: 37.5, 3: 62.5, 4: 87.5 }
const rowY: Record<number, number> = { 1: 7, 2: 21.3, 3: 35.6, 4: 49.9, 5: 64.2, 6: 78.5, 7: 92.8 }

type RawMageTalent = Omit<ClassTalent<MageBranch>, 'x' | 'y' | 'icon' | 'description' | 'prerequisite' | 'prerequisiteRuleStatus'> & {
  prerequisiteName?: string
  iconName?: string
  rankDescriptions?: string[]
}

const raw = rawTalents as RawMageTalent[]
const idByName = new Map(raw.map((talent) => [`${talent.branch}:${talent.name}`, talent.id]))

export const mageTalents: ClassTalent<MageBranch>[] = raw.map((talent) => {
  const parentId = talent.prerequisiteName ? idByName.get(`${talent.branch}:${talent.prerequisiteName}`) : undefined
  return {
    ...talent,
    description: talent.rankDescriptions?.[0] ?? `${talent.name} (${talent.maxRank} ranks).`,
    icon: talent.iconName ? `/images/mage-talents/${talent.iconName}.jpg` : undefined,
    x: columnX[talent.column] ?? 50,
    y: rowY[talent.row] ?? 50,
    prerequisite: parentId ? [{ talentId: parentId, requiredRank: null }] : undefined,
    prerequisiteRuleStatus: parentId ? 'derived_assumption' : 'not_applicable',
    changeStatus: talent.changeStatus ?? 'unknown',
  }
})

export const mageTalentById = (id: string) => mageTalents.find((talent) => talent.id === id)
