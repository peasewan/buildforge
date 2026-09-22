import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MAGE_DATA_VERSION, mageTalents } from './mageTalents'
import type { MageSourceTalent } from '../lib/mageTalentReconcile'

const foreverDiff = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-source-foreverdiff-1.60.1.69913.json'), 'utf8')) as { talents: MageSourceTalent[] }
const theWowDb = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-source-thewowdb-1.60.1.69913.json'), 'utf8')) as { talents: MageSourceTalent[] }
const production = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-beta-1.60.1.69913.json'), 'utf8')) as (MageSourceTalent & { id: string })[]
const importReport = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-import-report.json'), 'utf8')) as {
  published: number
  fieldConflicts: { name: string; branch: string; field: string; resolution?: string }[]
  entryPoints: Record<MageSourceTalent['branch'], number>
  plannerLegal: boolean
  blockers: { code: string; branch?: string; detail?: string }[]
}

const identity = (talent: MageSourceTalent) => `${talent.branch}::${talent.name.trim().toLowerCase()}`
const wowDbById = new Map(theWowDb.talents.map((talent) => [identity(talent), talent]))
const iceLanceA = foreverDiff.talents.find((talent) => talent.name === 'Ice Lance')
const iceLanceB = wowDbById.get(identity(iceLanceA ?? { name: 'Ice Lance', branch: 'frost', row: 0, column: 0, maxRank: 0 }))
const iceLanceDualPlannerLegal = Boolean(
  iceLanceA && iceLanceB
  && iceLanceA.branch === iceLanceB.branch
  && iceLanceA.row === iceLanceB.row
  && iceLanceA.column === iceLanceB.column
  && iceLanceA.maxRank === iceLanceB.maxRank,
)

describe('WoW Forever Mage talent data', () => {
  it('publishes dual-source planner-legal nodes reviewed through Beta build 69913', () => {
    expect(MAGE_DATA_VERSION).toBe('wow_forever_beta_1.60.1.69913')
    expect(new Set(mageTalents.map((talent) => talent.id)).size).toBe(mageTalents.length)
    expect(mageTalents.length).toBeGreaterThan(0)
    for (const talent of mageTalents) {
      expect(talent.fieldEvidence.row).toBe('client_verified')
      expect(talent.fieldEvidence.column).toBe('client_verified')
      expect(talent.fieldEvidence.maxRank).toBe('client_verified')
      // The planner gates every spend on this field, so it must be dual-source verified like the
      // coordinates — `reconcileMageTalents` vetoes the node when the sources disagree on it.
      expect(talent.fieldEvidence.requiredTreePoints).toBe('client_verified')
      expect(talent.sources).toHaveLength(3)
      expect(talent.verifiedThroughBuild).toBe('1.60.1.69913')
      if (talent.rankDescriptions) expect(talent.rankDescriptions).toHaveLength(talent.maxRank)
      if (talent.icon) expect(existsSync(join(process.cwd(), 'public', talent.icon))).toBe(true)
    }
    expect(mageTalents.some((talent) => talent.name === 'Ice Lance')).toBe(iceLanceDualPlannerLegal)
  })

  it('restores Improved Fireball at the primary client coordinate and records the resolution', () => {
    const improvedFireball = mageTalents.find((talent) => talent.name === 'Improved Fireball')

    expect(improvedFireball).toMatchObject({ branch: 'fire', row: 1, column: 2, requiredTreePoints: 0 })
    expect(improvedFireball?.fieldEvidence.column).toBe('client_verified')
    expect(importReport.fieldConflicts).toContainEqual({
      name: 'Improved Fireball',
      branch: 'fire',
      field: 'column',
      resolution: 'primary_client',
    })
  })

  it('publishes changeStatus only where both sources agree, and never invents one', () => {
    const changeStatuses = new Set<unknown>(['new', 'changed', 'same', 'unknown'])
    let dualAgreed = 0

    for (const talent of mageTalents) {
      expect(changeStatuses.has(talent.changeStatus)).toBe(true)
      expect(talent.fieldEvidence.changeStatus).toBeDefined()

      const key = identity(talent)
      const left = foreverDiff.talents.find((source) => identity(source) === key)?.changeStatus
      const right = wowDbById.get(key)?.changeStatus
      const agreed = Boolean(left && right && left === right)

      if (agreed) dualAgreed += 1
      expect(talent.changeStatus).toBe(agreed ? left : 'unknown')
      expect(talent.fieldEvidence.changeStatus).toBe(agreed ? 'client_verified' : 'unknown')
    }

    expect(dualAgreed).toBeGreaterThan(0)
  })

  it('exercises a real changeStatus disagreement (ForeverDiff vs TheWoWDB on Ignite)', () => {
    // ForeverDiff reports Ignite unchanged; TheWoWDB reports it changed.
    const igniteA = foreverDiff.talents.find((talent) => talent.name === 'Ignite')
    const igniteB = wowDbById.get(identity({ name: 'Ignite', branch: 'fire', row: 0, column: 0, maxRank: 0 }))
    expect(igniteA?.changeStatus).toBe('same')
    expect(igniteB?.changeStatus).toBe('changed')

    const published = mageTalents.find((talent) => talent.name === 'Ignite')
    expect(published?.changeStatus).toBe('unknown')
    expect(published?.fieldEvidence.changeStatus).toBe('unknown')
  })

  it('never drops a prerequisite link when the target is published', () => {
    const publishedNames = new Set(production.map((talent) => identity(talent)))
    let links = 0

    for (const raw of production) {
      if (!raw.prerequisiteName) continue
      links += 1
      expect(publishedNames.has(identity({ name: raw.prerequisiteName, branch: raw.branch, row: 0, column: 0, maxRank: 0 }))).toBe(true)

      const mapped = mageTalents.find((talent) => talent.id === raw.id)
      expect(mapped?.prerequisite).toBeDefined()
      expect(mapped?.prerequisiteRuleStatus).toBe('derived_assumption')
    }

    expect(links).toBeGreaterThan(0)
  })

  it('reports a client-reviewed entry point for every Mage branch', () => {
    // Plan line 141: "each branch must have at least one row-1 talent". A row-1 talent is the
    // branch's allocatable entry point (`requiredTreePoints === 0`), and the import report must
    // state that count per branch. Fire's Improved Fireball column disagreement is resolved by the
    // versioned primary client snapshot, so all three branches must now be startable.
    expect(importReport.published).toBe(production.length)

    const counted = (branch: MageSourceTalent['branch']) =>
      production.filter((talent) => talent.branch === branch && talent.requiredTreePoints === 0).length

    for (const branch of ['arcane', 'fire', 'frost'] as const) {
      expect(importReport.entryPoints[branch]).toBe(counted(branch))
    }

    expect(importReport.entryPoints.fire).toBeGreaterThan(0)
    expect(importReport.entryPoints.arcane).toBeGreaterThan(0)
    expect(importReport.entryPoints.frost).toBeGreaterThan(0)
  })

  it('states the planner-legal verdict and the exact blockers, derived from the dataset', () => {
    // The importer exits 0 against this data (a throw would make it permanently unrunnable), so the
    // verdict has to be readable from the report alone: `plannerLegal` plus one blocker per branch
    // whose entry-point count is zero. Both are derived here from the count above, not restated.
    const blockedBranches = (['arcane', 'fire', 'frost'] as const).filter(
      (branch) => production.filter((talent) => talent.branch === branch && talent.requiredTreePoints === 0).length === 0,
    )

    expect(importReport.plannerLegal).toBe(blockedBranches.length === 0)
    expect(importReport.plannerLegal).toBe(true)
    expect(importReport.blockers).toEqual(blockedBranches.map((branch) => ({ code: `${branch}:no-entry-point`, branch })))
    expect(importReport.blockers).toEqual([])
  })
})
