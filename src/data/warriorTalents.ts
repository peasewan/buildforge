import currentDataset from './warrior-beta-1.60.1.70291.json'
import archivedDataset from './warrior-beta-1.60.1.69913.json'
import type { ClassTalent, ClassTalentSource, FieldEvidenceKey } from '../lib/classPage'
import type { PlannerConfig, PlannerPrerequisite } from '../lib/talentPlanner'

export type WarriorBranch = 'arms' | 'fury' | 'protection'
export const WARRIOR_DATA_VERSION = currentDataset.sourceVersion
export const WARRIOR_SOURCE_BUILD = currentDataset.clientBuild
export const WARRIOR_VERIFIED_BUILD = currentDataset.clientBuild
export const WARRIOR_DATA_REVIEW_READY = currentDataset.ready && currentDataset.conflicts.length === 0
export const WARRIOR_ARCHIVED_DATA_VERSION = 'wow_forever_beta_1.60.1.69913' as const
export const WARRIOR_BRANCHES = ['arms', 'fury', 'protection'] as const

export const WARRIOR_PLANNER_CONFIG: PlannerConfig<WarriorBranch> = { branches: WARRIOR_BRANCHES, pointCap: 51 }
export const warriorBranchNames: Record<WarriorBranch, string> = { arms: 'Arms', fury: 'Fury', protection: 'Protection' }
export const warriorBranchTaglines: Record<WarriorBranch, string> = {
  arms: 'Control the fight with weapons, bleeds, and stance mastery.',
  fury: 'Turn Rage and attack speed into relentless pressure.',
  protection: 'Hold the line with shields, control, and defensive tools.',
}
export type WarriorTalent = ClassTalent<WarriorBranch>

export const WARRIOR_SOURCES: ClassTalentSource[] = [
  ...(currentDataset.sources as ClassTalentSource[]),
  { label: 'Creative Commons Attribution 4.0 · rank-text license', type: 'beta_client_crosscheck', url: 'https://creativecommons.org/licenses/by/4.0/' },
]

export const WARRIOR_RANK_TEXT_SOURCE = {
  url: currentDataset.resolvedRankSourceUrl,
  sourceBuild: currentDataset.resolvedRankSourceBuild,
  licenseUrl: currentDataset.resolvedRankLicenseUrl,
  attribution: currentDataset.attribution,
  adaptationNotice: currentDataset.resolvedRankAdaptationNotice,
}

const columnX: Record<number, number> = { 1: 12.5, 2: 37.5, 3: 62.5, 4: 87.5 }
const rowY: Record<number, number> = { 1: 7, 2: 21.3, 3: 35.6, 4: 49.9, 5: 64.2, 6: 78.5, 7: 92.8 }

type RawArchivedWarriorTalent = Omit<WarriorTalent, 'x' | 'y' | 'prerequisite' | 'fieldEvidence' | 'changeStatus'> & {
  prerequisite: PlannerPrerequisite[]
  changeStatus: string
}
const archivedVerifiedFields: FieldEvidenceKey[] = ['name', 'branch', 'row', 'column', 'maxRank', 'requiredTreePoints', 'rankDescriptions', 'sourceTalentId', 'iconName', 'changeStatus']
const normalizeArchivedChangeStatus = (status: string): WarriorTalent['changeStatus'] => {
  if (status === 'new_in_dataset') return 'new'
  if (status === 'same_in_dataset') return 'same'
  if (status === 'text_changed' || status === 'moved') return 'changed'
  return 'unknown'
}

/** Exact historical adapter retained for old saved codes; never enters current planning. */
export const archivedWarriorTalents: WarriorTalent[] = (archivedDataset as RawArchivedWarriorTalent[]).map((talent) => ({
  ...talent,
  x: columnX[talent.column],
  y: rowY[talent.row],
  fieldEvidence: Object.fromEntries([
    ...archivedVerifiedFields.map((field) => [field, 'client_verified'] as const),
    ...(talent.prerequisite.length > 0 ? [['prerequisiteLink', 'client_verified'] as const] : []),
  ]),
  changeStatus: normalizeArchivedChangeStatus(talent.changeStatus),
}))

const archivedById = new Map(archivedWarriorTalents.map((talent) => [talent.id, talent]))
type CurrentRecord = (typeof currentDataset.talents)[number]

function reviewedChangeStatus(record: CurrentRecord): WarriorTalent['changeStatus'] {
  const old = archivedById.get(record.id)
  if (!old) return 'new'
  const before = [old.branch, old.row, old.column, old.maxRank, old.rankDescriptions, (old.prerequisite ?? []).map((link) => link.talentId).sort()]
  const after = [record.branch, record.row, record.column, record.maxRank, record.rankDescriptions, [...record.prerequisite].sort()]
  return JSON.stringify(before) === JSON.stringify(after) ? 'same' : 'changed'
}

export const warriorTalents: WarriorTalent[] = currentDataset.talents.map((record): WarriorTalent => ({
  ...record,
  branch: record.branch as WarriorBranch,
  x: columnX[record.column],
  y: rowY[record.row],
  icon: `/images/warrior-talents/${record.iconName.toLowerCase()}.jpg`,
  sourceClientBuild: WARRIOR_SOURCE_BUILD,
  verifiedThroughBuild: WARRIOR_VERIFIED_BUILD,
  prerequisite: record.prerequisite.map((talentId) => ({ talentId, requiredRank: null })),
  prerequisiteRuleStatus: record.prerequisite.length ? 'derived_assumption' : 'not_applicable',
  verificationStatus: 'client_verified',
  fieldEvidence: {
    ...record.fieldEvidence as WarriorTalent['fieldEvidence'],
    name: 'client_verified', branch: 'client_verified', row: 'client_verified', column: 'client_verified', maxRank: 'client_verified',
    requiredTreePoints: 'derived_assumption', rankDescriptions: 'community_verified', iconName: 'community_verified', changeStatus: 'derived_assumption',
    ...(record.prerequisite.length ? { prerequisiteLink: 'client_verified' as const } : {}),
  },
  dataNotes: [...record.dataNotes, 'Rank text uses the export’s Level 60 tooltip values; the planner does not rescale effects to the selected level.', 'Change labels compare the preserved 69913 import.'],
  changeStatus: reviewedChangeStatus(record),
  sources: WARRIOR_SOURCES,
}))

export const warriorTalentById = (id: string) => warriorTalents.find((talent) => talent.id === id)
