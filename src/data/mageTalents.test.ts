import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MAGE_DATA_VERSION, mageTalents } from './mageTalents'
import type { MageSourceTalent } from '../lib/mageTalentReconcile'

const foreverDiff = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-source-foreverdiff-1.60.1.69913.json'), 'utf8')) as { talents: MageSourceTalent[] }
const theWowDb = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-source-thewowdb-1.60.1.69913.json'), 'utf8')) as { talents: MageSourceTalent[] }
const production = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-beta-1.60.1.69913.json'), 'utf8')) as (MageSourceTalent & { id: string })[]

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
      expect(talent.sources).toHaveLength(2)
      expect(talent.verifiedThroughBuild).toBe('1.60.1.69913')
      if (talent.rankDescriptions) expect(talent.rankDescriptions).toHaveLength(talent.maxRank)
      if (talent.icon) expect(existsSync(join(process.cwd(), 'public', talent.icon))).toBe(true)
    }
    expect(mageTalents.some((talent) => talent.name === 'Ice Lance')).toBe(iceLanceDualPlannerLegal)
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
})
