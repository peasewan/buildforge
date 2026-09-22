import type { EvidenceStatus } from '../data/verification'
import type { FieldEvidenceKey } from './classPage'

export type MageBranch = 'arcane' | 'fire' | 'frost'

// Shared vocabulary for "how does this node differ from Classic". Both live sources
// state it in their own words (ForeverDiff `status`, TheWoWDB `change.kind`); the
// parsers normalize onto this type so the reconcile step can compare them.
export type MageChangeStatus = 'new' | 'changed' | 'same'
export type MagePublishedChangeStatus = MageChangeStatus | 'unknown'

export interface MageSourceTalent {
  name: string
  branch: MageBranch
  row: number
  column: number
  maxRank: number
  rankDescriptions?: string[]
  sourceTalentId?: number
  prerequisiteName?: string
  iconName?: string
  requiredTreePoints?: number
  changeStatus?: MageChangeStatus
}

export interface ReconciledMageTalent extends Omit<MageSourceTalent, 'changeStatus'> {
  changeStatus: MagePublishedChangeStatus
  fieldEvidence: Partial<Record<FieldEvidenceKey, EvidenceStatus | 'unknown'>>
  verificationStatus: EvidenceStatus
}

export interface MageFieldConflict {
  name: string
  branch: MageBranch
  field: FieldEvidenceKey
  resolution?: 'primary_client'
}

/** Structural evidence read directly from the versioned client Talent table. */
export interface MagePrimaryClientTalent {
  sourceTalentId?: number
  name: string
  branch: MageBranch
  row: number
  column: number
}

export interface MageReconcileResult {
  published: ReconciledMageTalent[]
  fieldConflicts: MageFieldConflict[]
  missingInA: MageSourceTalent[]
  missingInB: MageSourceTalent[]
}

const identity = (talent: Pick<MageSourceTalent, 'branch' | 'name'>) => `${talent.branch}::${talent.name.trim().toLowerCase()}`

const sameArray = (left?: string[], right?: string[]) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null)

const prefixRanks = (left?: string[], right?: string[]) => {
  if (!left?.length || !right?.length) return undefined
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left]
  return shorter.every((value, index) => value === longer[index]) ? longer : undefined
}

// `requiredTreePoints` is planner-legal: `talentPlanner.canIncrement` refuses to spend a talent
// until the branch has that many points, so a disagreement — or silence on either side — makes the
// node unallocatable rather than a cosmetic difference. Such nodes are vetoed, not merged.
const plannerLegal: FieldEvidenceKey[] = ['name', 'branch', 'row', 'maxRank', 'requiredTreePoints']

// Planner-legal fields must be stated by BOTH sources, not merely equal: `undefined === undefined`
// would publish a node with no value at all, and `canIncrement` compares
// `current < talent.requiredTreePoints`, which is always false against `undefined` — such a node
// would render in the tree but never be spendable. That is a silent break, so silence on either
// side is treated exactly like a disagreement and drops the node loudly.
const plannerFieldConflict = (left: MageSourceTalent, right: MageSourceTalent, field: FieldEvidenceKey) => {
  const leftValue = left[field as keyof MageSourceTalent]
  const rightValue = right[field as keyof MageSourceTalent]
  return leftValue === undefined || rightValue === undefined || leftValue !== rightValue
}

export function reconcileMageTalents(
  foreverDiff: MageSourceTalent[],
  theWowDb: MageSourceTalent[],
  primaryClientTalents: MagePrimaryClientTalent[] = [],
): MageReconcileResult {
  const sourceA = new Map(foreverDiff.map((talent) => [identity(talent), talent]))
  const sourceB = new Map(theWowDb.map((talent) => [identity(talent), talent]))
  const primaryClient = new Map(primaryClientTalents.map((talent) => [identity(talent), talent]))
  const published: ReconciledMageTalent[] = []
  const fieldConflicts: MageFieldConflict[] = []
  const missingInA: MageSourceTalent[] = []
  const missingInB: MageSourceTalent[] = []

  for (const talent of theWowDb) {
    if (!sourceA.has(identity(talent))) missingInA.push(talent)
  }
  for (const talent of foreverDiff) {
    if (!sourceB.has(identity(talent))) missingInB.push(talent)
  }

  for (const [key, left] of sourceA) {
    const right = sourceB.get(key)
    if (!right) continue

    const plannerMismatch = plannerLegal.filter((field) => plannerFieldConflict(left, right, field))
    if (plannerMismatch.length) {
      for (const field of plannerMismatch) fieldConflicts.push({ name: left.name, branch: left.branch, field })
      continue
    }

    // Column is a display coordinate, but the planner still needs one deterministic value. When
    // the two derived web views disagree, resolve it only with the versioned client Talent table;
    // without that primary record the node remains fail-closed.
    const columnsAgree = left.column !== undefined && left.column === right.column
    const primary = primaryClient.get(key)
    if (!columnsAgree && primary?.column === undefined) {
      fieldConflicts.push({ name: left.name, branch: left.branch, field: 'column' })
      continue
    }
    const column = columnsAgree ? left.column : primary!.column
    if (!columnsAgree) {
      fieldConflicts.push({ name: left.name, branch: left.branch, field: 'column', resolution: 'primary_client' })
    }

    // Reachable only for nodes whose every planner-legal field is present on both sources and equal
    // between them, so each entry below claims a value the sources actually state.
    const fieldEvidence: ReconciledMageTalent['fieldEvidence'] = {
      name: 'client_verified',
      branch: 'client_verified',
      row: 'client_verified',
      column: 'client_verified',
      maxRank: 'client_verified',
      requiredTreePoints: 'client_verified',
    }

    const merged: ReconciledMageTalent = {
      name: left.name,
      branch: left.branch,
      row: left.row,
      column,
      maxRank: left.maxRank,
      // The planner-legal filter above already proved both sources state this gate and agree, so
      // this is the agreed, present value — not a fallback that prefers ForeverDiff when one source
      // is silent (that case never reaches here).
      requiredTreePoints: left.requiredTreePoints,
      changeStatus: 'unknown',
      fieldEvidence,
      verificationStatus: 'client_verified',
    }

    if (sameArray(left.rankDescriptions, right.rankDescriptions) && left.rankDescriptions) {
      merged.rankDescriptions = left.rankDescriptions
      fieldEvidence.rankDescriptions = 'client_verified'
    } else if (left.rankDescriptions && !right.rankDescriptions) {
      merged.rankDescriptions = left.rankDescriptions
      fieldEvidence.rankDescriptions = 'client_datamined'
    } else if (right.rankDescriptions && !left.rankDescriptions) {
      merged.rankDescriptions = right.rankDescriptions
      fieldEvidence.rankDescriptions = 'client_datamined'
    } else if (!left.rankDescriptions && !right.rankDescriptions) {
      fieldEvidence.rankDescriptions = 'unknown'
    } else {
      const prefixed = prefixRanks(left.rankDescriptions, right.rankDescriptions)
      if (prefixed) {
        merged.rankDescriptions = prefixed
        fieldEvidence.rankDescriptions = 'client_datamined'
      } else {
        fieldEvidence.rankDescriptions = 'unknown'
        fieldConflicts.push({ name: left.name, branch: left.branch, field: 'rankDescriptions' })
      }
    }

    if (left.sourceTalentId !== undefined && left.sourceTalentId === right.sourceTalentId) {
      merged.sourceTalentId = left.sourceTalentId
      fieldEvidence.sourceTalentId = 'client_verified'
    } else if (left.sourceTalentId !== undefined && right.sourceTalentId === undefined) {
      merged.sourceTalentId = left.sourceTalentId
      fieldEvidence.sourceTalentId = 'client_datamined'
    } else if (right.sourceTalentId !== undefined && left.sourceTalentId === undefined) {
      merged.sourceTalentId = right.sourceTalentId
      fieldEvidence.sourceTalentId = 'client_datamined'
    } else if (left.sourceTalentId !== undefined && right.sourceTalentId !== undefined) {
      fieldEvidence.sourceTalentId = 'unknown'
      fieldConflicts.push({ name: left.name, branch: left.branch, field: 'sourceTalentId' })
    }

    if (left.prerequisiteName && left.prerequisiteName === right.prerequisiteName) {
      merged.prerequisiteName = left.prerequisiteName
      fieldEvidence.prerequisiteLink = 'client_verified'
    } else if (left.prerequisiteName && right.prerequisiteName && left.prerequisiteName !== right.prerequisiteName) {
      fieldEvidence.prerequisiteLink = 'unknown'
      fieldConflicts.push({ name: left.name, branch: left.branch, field: 'prerequisiteLink' })
    } else if (left.prerequisiteName || right.prerequisiteName) {
      fieldEvidence.prerequisiteLink = 'unknown'
    } else {
      fieldEvidence.prerequisiteLink = 'unknown'
    }

    // Spec: "changeStatus vs Classic — dual agree: publish; one source: unknown; disagree: unknown".
    if (left.changeStatus && right.changeStatus) {
      if (left.changeStatus === right.changeStatus) {
        merged.changeStatus = left.changeStatus
        fieldEvidence.changeStatus = 'client_verified'
      } else {
        fieldEvidence.changeStatus = 'unknown'
        fieldConflicts.push({ name: left.name, branch: left.branch, field: 'changeStatus' })
      }
    } else {
      fieldEvidence.changeStatus = 'unknown'
    }

    if (left.iconName && left.iconName === right.iconName) {
      merged.iconName = left.iconName
      fieldEvidence.iconName = 'client_verified'
    } else if (left.iconName && !right.iconName) {
      merged.iconName = left.iconName
      fieldEvidence.iconName = 'client_datamined'
    } else if (right.iconName && !left.iconName) {
      merged.iconName = right.iconName
      fieldEvidence.iconName = 'client_datamined'
    } else if (left.iconName && right.iconName) {
      fieldEvidence.iconName = 'unknown'
      fieldConflicts.push({ name: left.name, branch: left.branch, field: 'iconName' })
    }

    published.push(merged)
  }

  return { published, fieldConflicts, missingInA, missingInB }
}
