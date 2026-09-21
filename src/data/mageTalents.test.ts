import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MAGE_DATA_VERSION, mageTalents } from './mageTalents'
import type { MageSourceTalent } from '../lib/mageTalentReconcile'

const foreverDiff = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-source-foreverdiff-1.60.1.69913.json'), 'utf8')) as { talents: MageSourceTalent[] }
const theWowDb = JSON.parse(readFileSync(join(process.cwd(), 'src/data/mage-source-thewowdb-1.60.1.69913.json'), 'utf8')) as { talents: MageSourceTalent[] }

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
})
