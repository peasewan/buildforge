import type { EvidenceStatus } from '../data/verification'
import type { FieldEvidenceKey } from './classPage'

export type MageBranch = 'arcane' | 'fire' | 'frost'

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
}

export interface ReconciledMageTalent extends MageSourceTalent {
  fieldEvidence: Partial<Record<FieldEvidenceKey, EvidenceStatus | 'unknown'>>
  verificationStatus: EvidenceStatus
}

export interface MageFieldConflict {
  name: string
  branch: MageBranch
  field: FieldEvidenceKey
}

export interface MageReconcileResult {
  published: ReconciledMageTalent[]
  fieldConflicts: MageFieldConflict[]
  missingInA: MageSourceTalent[]
  missingInB: MageSourceTalent[]
}

const identity = (talent: MageSourceTalent) => `${talent.branch}::${talent.name.trim().toLowerCase()}`

const sameArray = (left?: string[], right?: string[]) => JSON.stringify(left ?? null) === JSON.stringify(right ?? null)

const prefixRanks = (left?: string[], right?: string[]) => {
  if (!left?.length || !right?.length) return undefined
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left]
  return shorter.every((value, index) => value === longer[index]) ? longer : undefined
}

const plannerLegal: FieldEvidenceKey[] = ['name', 'branch', 'row', 'column', 'maxRank']

export function reconcileMageTalents(foreverDiff: MageSourceTalent[], theWowDb: MageSourceTalent[]): MageReconcileResult {
  const sourceA = new Map(foreverDiff.map((talent) => [identity(talent), talent]))
  const sourceB = new Map(theWowDb.map((talent) => [identity(talent), talent]))
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

    const plannerMismatch = plannerLegal.filter((field) => left[field as keyof MageSourceTalent] !== right[field as keyof MageSourceTalent])
    if (plannerMismatch.length) {
      for (const field of plannerMismatch) fieldConflicts.push({ name: left.name, branch: left.branch, field })
      continue
    }

    const fieldEvidence: ReconciledMageTalent['fieldEvidence'] = {
      name: 'client_verified',
      branch: 'client_verified',
      row: 'client_verified',
      column: 'client_verified',
      maxRank: 'client_verified',
    }

    const merged: ReconciledMageTalent = {
      name: left.name,
      branch: left.branch,
      row: left.row,
      column: left.column,
      maxRank: left.maxRank,
      requiredTreePoints: left.requiredTreePoints ?? right.requiredTreePoints,
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
