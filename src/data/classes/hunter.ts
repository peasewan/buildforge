import dataset from '../hunter-beta-1.60.1.70291.json'
import historicalDataset from '../expansion/hunter-1.60.1.69913.json'
import { createExpansionClass } from '../expansion/createClass'
import type { ClassTalent } from '../../lib/classPage'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
import { buildHunterCurrentRoleDecision, createHunterCurrentProfile } from './hunterCurrentProfile'

export const HUNTER_HISTORICAL_BUILD = '1.60.1.69913'
export const HUNTER_HISTORICAL_DATA_VERSION = `WoW Forever Beta ${HUNTER_HISTORICAL_BUILD}`
export const HUNTER_HISTORICAL_STORAGE_KEY = 'buildforge-hunter-69913-v1'
export const hunterHistoricalTalents = historicalDataset.talents as ClassTalent<string>[]

const currentDataset = dataset as CurrentClassSnapshot

const historicalById = new Map(hunterHistoricalTalents.map(talent => [talent.id, talent]))

/** Change labels compare saved client snapshots; the upstream Classic label stays on the raw JSON. */
function hunterClientChangeStatus(record: CurrentClassSnapshot['talents'][number]): ClassTalent<string>['changeStatus'] {
  const previous = historicalById.get(record.id)
  if (!previous) return 'new'
  const before = [previous.name, previous.branch, previous.row, previous.column, previous.maxRank, previous.requiredTreePoints, previous.rankDescriptions, (previous.prerequisite ?? []).map(link => link.talentId).sort()]
  const after = [record.name, record.branch, record.row, record.column, record.maxRank, record.requiredTreePoints, record.rankDescriptions, [...record.prerequisite].sort()]
  return JSON.stringify(before) === JSON.stringify(after) ? 'same' : 'changed'
}

/** Client links establish identity; spending every prerequisite rank remains a planning rule. */
export function normalizeHunterCurrentTalents(snapshot: CurrentClassSnapshot): ClassTalent<string>[] {
  if (snapshot.classId !== 'hunter') throw new Error('Current Hunter adapter received another class')
  const byId = new Map(snapshot.talents.map(talent => [talent.id, talent]))
  return snapshot.talents.map(talent => ({
    ...talent,
    changeStatus: hunterClientChangeStatus(talent),
    fieldEvidence: { ...talent.fieldEvidence as ClassTalent<string>['fieldEvidence'], changeStatus: 'derived_assumption' },
    prerequisite: talent.prerequisite.map(talentId => {
      const prerequisite = byId.get(talentId)
      if (!prerequisite) throw new Error(`Unknown current Hunter prerequisite: ${talent.id}/${talentId}`)
      return { talentId, requiredRank: prerequisite.maxRank }
    }),
  }))
}
const talents = normalizeHunterCurrentTalents(currentDataset)
const currentNotice = 'Reviewed current Hunter grid: 50 visible nodes from Wago’s 1.60.1.70291 client structure, reconciled against Talents Forever’s export, with all 148 rank descriptions adapted from Talents Forever (CC BY 4.0, https://talentsforever.com). The raw client class table also contains two off-grid records, documented separately in the source review; they are not assigned repaired coordinates or included as extra playable talents. Visible membership is community-reconciled against the client table. One exact reciprocal Bestial Wrath–Intimidation connection is excluded under source review: Intimidation’s prerequisite direction is community-verified, while its identity, position and rank cap remain client-verified. Structural fields and rank text retain their field-level evidence. Exported effect values are tooltip transcriptions at Level 60; the calculator does not rescale them to Level 30 or simulate damage. Ordinary editorial routes spend 21 points at Level 30; the retained Level 20 page uses eleven-point stages of the current tree. One point per level from 10, five points per tier, full-rank prerequisites and the selected point order are planning assumptions, not separately verified live Beta rules or measured performance. The 69913 dataset remains a historical reference; removed old nodes are not substituted into current builds.'

export const hunterClass = createExpansionClass(createHunterCurrentProfile(talents), { ...currentDataset, talents }, {
  currentDataReview: { ready: currentDataset.ready && currentDataset.conflicts.length === 0, notice: currentNotice },
  levelCap: 30,
  level20Builds: true,
  reviewedAt: '2026-10-09',
})
hunterClass.sources.push({label: 'Creative Commons Attribution 4.0 · rank-text license', type:'beta_client_crosscheck', url:currentDataset.resolvedRankLicenseUrl})
hunterClass.historicalSnapshots = [{ clientBuild: HUNTER_HISTORICAL_BUILD, dataVersion: HUNTER_HISTORICAL_DATA_VERSION, storageKey: HUNTER_HISTORICAL_STORAGE_KEY, talents: hunterHistoricalTalents }]
for (const page of hunterClass.pages.filter(candidate => !candidate.retiredTo)) {
  const decision = buildHunterCurrentRoleDecision(hunterClass, page)
  if (decision) page.roleDecision = decision
}
