import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WARRIOR_DATA_VERSION, warriorTalents } from './warriorTalents'

describe('WoW Forever Warrior talent data', () => {
  it('contains the complete 53-node dataset reviewed through Beta build 69913', () => {
    expect(WARRIOR_DATA_VERSION).toBe('wow_forever_beta_1.60.1.69913')
    expect(warriorTalents).toHaveLength(53)
    expect(warriorTalents.filter((talent) => talent.branch === 'arms')).toHaveLength(17)
    expect(warriorTalents.filter((talent) => talent.branch === 'fury')).toHaveLength(18)
    expect(warriorTalents.filter((talent) => talent.branch === 'protection')).toHaveLength(18)
  })

  it('retains rank text, coordinates, provenance, and valid prerequisite links', () => {
    const ids = warriorTalents.map((talent) => talent.id)
    expect(new Set(ids).size).toBe(53)

    for (const talent of warriorTalents) {
      expect(talent.rankDescriptions).toHaveLength(talent.maxRank)
      expect(talent.row).toBeGreaterThanOrEqual(1)
      expect(talent.column).toBeGreaterThanOrEqual(1)
      expect(talent.sources).toHaveLength(2)
      expect(talent.verifiedThroughBuild).toBe('1.60.1.69913')
      expect(existsSync(join(process.cwd(), 'public', talent.icon))).toBe(true)
      for (const prerequisite of talent.prerequisite ?? []) expect(ids).toContain(prerequisite.talentId)
    }
  })

  it.each(['Spearing Strike', 'Bloodthrill', 'Boundless Rage', 'Last Stand'])('includes the current node %s', (name) => {
    expect(warriorTalents.some((talent) => talent.name === name)).toBe(true)
  })
})
