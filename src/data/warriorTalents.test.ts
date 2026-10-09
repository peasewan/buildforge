import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WARRIOR_DATA_VERSION, WARRIOR_ARCHIVED_DATA_VERSION, archivedWarriorTalents, warriorTalents } from './warriorTalents'

// A partial import, missing client links, or rank text mislabelled as client verified
// must not become the interactive Warrior tree.
describe('WoW Forever Warrior talent data', () => {
  it('provides all 52 current nodes and 150 complete rank descriptions', () => {
    expect(WARRIOR_DATA_VERSION).toBe('wow_forever_beta_1.60.1.70291')
    expect(warriorTalents).toHaveLength(52)
    expect(warriorTalents.filter((talent) => talent.branch === 'arms')).toHaveLength(17)
    expect(warriorTalents.filter((talent) => talent.branch === 'fury')).toHaveLength(17)
    expect(warriorTalents.filter((talent) => talent.branch === 'protection')).toHaveLength(18)
    expect(warriorTalents.reduce((total, talent) => total + (talent.rankDescriptions?.length ?? 0), 0)).toBe(150)
  })

  it('retains raw identity, source evidence, complete text, and usable artwork', () => {
    const ids = warriorTalents.map((talent) => talent.id)
    expect(new Set(ids).size).toBe(52)
    for (const talent of warriorTalents) {
      expect(talent.rankDescriptions).toHaveLength(talent.maxRank)
      expect(talent.rankDescriptions?.every((text) => text.trim().length > 0)).toBe(true)
      expect(talent.nodeId).toBeGreaterThan(0)
      expect(talent.spellId).toBeGreaterThan(0)
      expect(talent.row).toBeGreaterThanOrEqual(1)
      expect(talent.column).toBeGreaterThanOrEqual(1)
      expect(talent.sources.some((source) => source.url.includes('wago.tools/db2/'))).toBe(true)
      expect(talent.sources.some((source) => source.url === 'https://talentsforever.com/data.json')).toBe(true)
      expect(talent.verifiedThroughBuild).toBe('1.60.1.70291')
      expect(talent.fieldEvidence.name).toBe('client_verified')
      expect(talent.fieldEvidence.rankDescriptions).toBe('community_verified')
      expect(existsSync(join(process.cwd(), 'public', talent.icon!))).toBe(true)
      for (const prerequisite of talent.prerequisite ?? []) {
        expect(ids).toContain(prerequisite.talentId)
        expect(talent.fieldEvidence.prerequisiteLink).toBe('client_verified')
        expect(talent.prerequisiteRuleStatus).toBe('derived_assumption')
      }
    }
  })

  it('includes the October Fury replacements and excludes removed nodes from current planning', () => {
    for (const name of ['Lingering Rage', 'Furious Precision', 'Gore Drinker', 'Spearing Strike', 'Last Stand']) {
      expect(warriorTalents.some((talent) => talent.name === name), name).toBe(true)
    }
    for (const name of ['Improved Cleave', 'Boundless Rage', 'Precision', 'Toughness']) {
      expect(warriorTalents.some((talent) => talent.name === name), name).toBe(false)
    }
  })

  it('keeps historical identities and links readable without reusing replaced raw nodes', () => {
    expect(WARRIOR_ARCHIVED_DATA_VERSION).toBe('wow_forever_beta_1.60.1.69913')
    expect(archivedWarriorTalents).toHaveLength(53)
    expect(archivedWarriorTalents.find((talent) => talent.id === 'warrior-fury-iron-will')?.branch).toBe('fury')
    expect(warriorTalents.find((talent) => talent.id === 'warrior-fury-iron-will')?.branch).toBe('protection')
    expect(archivedWarriorTalents.find((talent) => talent.id === 'warrior-fury-boundless-rage')).toBeDefined()
    expect(warriorTalents.find((talent) => talent.id === 'warrior-fury-boundless-rage')).toBeUndefined()
    expect(archivedWarriorTalents.find((talent) => talent.id === 'warrior-fury-flurry')?.prerequisite).toEqual([{ talentId: 'warrior-fury-enrage', requiredRank: null }])
  })

  it('uses the client prerequisites and current ranked Fury tuning', () => {
    const talent = (id: string) => warriorTalents.find((node) => node.id === id)!
    expect(talent('warrior-fury-flurry').prerequisite).toEqual([{ talentId: 'warrior-fury-death-wish', requiredRank: null }])
    expect(talent('warrior-arms-impale').prerequisite).toEqual([{ talentId: 'warrior-arms-deep-wounds', requiredRank: null }])
    expect(talent('warrior-fury-gore-drinker').prerequisite).toEqual([{ talentId: 'warrior-fury-enrage', requiredRank: null }])
    expect(talent('warrior-fury-lingering-rage').rankDescriptions?.[4]).toMatch(/10 sec/)
    expect(talent('warrior-fury-furious-precision').rankDescriptions?.[2]).toMatch(/10%/)
    expect(talent('warrior-fury-unbridled-wrath').description).not.toMatch(/two.handed/i)
  })
})
