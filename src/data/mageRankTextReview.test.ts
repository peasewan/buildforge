import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { reviewPublishedRankEvidence } from '../../scripts/content-review'
import { mageClass } from './classes/mage'
import { MAGE_DATA_VERSION, mageTalents } from './mageTalents'
import { parseClientCsv } from '../lib/paladinClientReconcile'
import rankReview from '../../data/reviews/rank-text/1.60.1.69913/mage-selected-ranks.json'

const reviewedRanks: Record<string, string[]> = {
  'mage-arcane-improved-channeling': [1, 2, 3, 4, 5].map(rank => `Gives you a ${rank * 20}% chance to avoid interruption caused by damage while channeling Arcane Missiles and a ${rank * 14}% chance while casting Arcane Blast.`),
  'mage-frost-frost-warding': [1, 2].map(rank => `Increases the Armor and resistance given by your Frost Armor and Ice Armor spells by ${rank * 15}%. In addition, gives your Frost Ward a ${rank * 10}% chance to reflect Frost spells and effects while active.`),
  'mage-frost-improved-frostbolt': [1, 2, 3, 4, 5].map(rank => `Reduces the casting time of your Frostbolt spell by ${rank / 10} sec.`),
  'mage-frost-piercing-ice': [2, 4, 6].map(value => `Increases the damage done by your Frost spells by ${value}%.`),
  'mage-frost-ice-shards': [20, 40, 60, 80, 100].map(value => `Increases the critical strike damage bonus of your Frost spells by ${value}%.`),
  'mage-frost-improved-frost-nova': [2, 4].map(value => `Reduces the cooldown of your Frost Nova spell by ${value} sec.`),
  'mage-arcane-arcane-focus': [1, 2, 3, 4, 5].map(value => `Improves your chance to hit with Arcane spells by ${value}%.`),
  'mage-arcane-arcane-concentration': [2, 4, 6, 8, 10].map(value => `Gives you a ${value}% chance of entering a Clearcasting state after any damage spell hits a target. The Clearcasting state reduces the mana cost of your next damage spell by 100%.`),
  'mage-arcane-arcane-impact': [2, 4, 6].map(value => `Increases the critical strike chance of your Arcane spells by ${value}%.`),
  'mage-frost-improved-blizzard': [15, 25, 40].map(value => `Adds a Chill effect to your Blizzard spell. This effect lowers the target's movement speed by ${value}% for 1.5 sec.`),
}

describe('Mage selected-rank review for the historical 69913 snapshot', () => {
  it('renders each missing rank from the same-build effect curves, including linked spell values', () => {
    for (const [id, ranks] of Object.entries(reviewedRanks)) {
      const talent = mageTalents.find(candidate => candidate.id === id)
      expect(talent?.rankDescriptions, id).toEqual(ranks)
      expect(talent?.fieldEvidence.rankDescriptions, id).toBe('client_verified')
      expect(talent?.nodeId, id).toBeGreaterThan(0)
      expect(talent?.spellId, id).toBeGreaterThan(0)
      expect(talent?.sourceClientBuild, id).toBe('1.60.1.69913')
      expect(talent?.verifiedThroughBuild, id).toBe('1.60.1.69913')
    }
  })

  it('completes exact primary and related rank endpoints without advancing the Mage build version', () => {
    const report = reviewPublishedRankEvidence([mageClass])
    expect(report.classes[0].primaryBuildPages).toBe(7)
    expect(report.classes[0].primaryPagesWithGaps).toBe(0)
    expect(report.classes[0].allReferencedPagesWithGaps).toBe(0)
    expect(MAGE_DATA_VERSION).toBe('wow_forever_beta_1.60.1.69913')
    expect(mageClass.verifiedBuild).toBe('1.60.1.69913')
    expect(mageClass.dataReview?.current).not.toBe(true)
  })
})


describe('Mage historical spell and effect evidence', () => {
  it('preserves the original acquired snapshots and exact-build raw source hashes', () => {
    for (const source of [...rankReview.originalSnapshots, ...rankReview.sources.map(source => ({ path: source.path, sha256: source.fullDownloadSha256 }))]) {
      expect(createHash('sha256').update(readFileSync(join(process.cwd(), source.path))).digest('hex'), source.path).toBe(source.sha256)
    }
    for (const source of rankReview.sources) {
      expect(source.clientBuild).toBe('1.60.1.69913')
      expect(new URL(source.url).searchParams.get('build')).toBe('1.60.1.69913')
    }
  })

  it('joins every reviewed rank to live Mage membership and explicit same-build curve points', () => {
    const tables = new Map(rankReview.sources.map(source => [source.table, new Map(parseClientCsv(readFileSync(join(process.cwd(), source.path), 'utf8')).map(row => [row.ID, row]))]))
    const selected = new Set(mageClass.builds.flatMap(build => Object.entries(build.build).filter(([, rank]) => rank > 0).map(([id]) => id)))
    expect(rankReview.records.map(record => record.talentId).sort()).toEqual([...selected].sort())
    expect(rankReview.records.reduce((sum, record) => sum + record.maxRank, 0)).toBe(38)
    for (const record of rankReview.records) {
      const { membership } = record
      expect(membership.skillLine.SkillLineID).toBe('237')
      expect(membership.skillLine.TraitTreeID).toBe('1112')
      expect(membership.node.TraitTreeID).toBe(membership.skillLine.TraitTreeID)
      expect(membership.nodeEntryLink.TraitNodeID).toBe(membership.node.ID)
      expect(membership.nodeEntryLink.TraitNodeEntryID).toBe(membership.nodeEntry.ID)
      expect(membership.nodeEntry.TraitDefinitionID).toBe(membership.definition.ID)
      expect(membership.definition.SpellID).toBe(String(record.spellId))
      expect(Number(membership.nodeEntry.MaxRanks)).toBe(record.maxRank)
      for (const [key, table] of Object.entries({ skillLine: 'SkillLineXTraitTree', node: 'TraitNode', nodeEntryLink: 'TraitNodeXTraitNodeEntry', nodeEntry: 'TraitNodeEntry', definition: 'TraitDefinition', spellName: 'SpellName', spell: 'Spell' })) {
        const raw = membership[key as keyof typeof membership]
        expect(tables.get(table)?.get(raw.ID), `${record.name} ${table}`).toEqual(raw)
      }
      expect(record.template).toBe(membership.spell.Description_lang)
      for (const curve of record.curves) {
        expect(curve.sourceRow.TraitDefinitionID).toBe(membership.definition.ID)
        expect(curve.sourceRow.OperationType).toBe('0')
        expect(tables.get('TraitDefinitionEffectPoints')?.get(curve.sourceRow.ID)).toEqual(curve.sourceRow)
        expect(curve.points.map(point => Number(point.Pos_0)).sort((a, b) => a - b)).toEqual(Array.from({ length: record.maxRank }, (_, index) => index + 1))
        for (const point of curve.points) {
          expect(point.CurveID).toBe(curve.sourceRow.CurveID)
          expect(tables.get('CurvePoint')?.get(point.ID)).toEqual(point)
        }
      }
      const published = mageTalents.find(talent => talent.id === record.talentId)!
      expect(published.rankDescriptions).toEqual(record.rankDescriptions)
      expect(published).toMatchObject({ nodeId: record.nodeId, spellId: record.spellId, maxRank: record.maxRank, sourceClientBuild: '1.60.1.69913', verifiedThroughBuild: '1.60.1.69913' })
      expect(published.fieldEvidence.rankDescriptions).toBe('client_verified')
    }
  })

  it('records the two linked references instead of substituting another rank or spell maximum', () => {
    const concentration = rankReview.records.find(record => record.spellId === 11213)!
    const clearcasting = concentration.linkedReferences[0]
    expect(clearcasting).toMatchObject({ kind: 'spell_effect', divisor: 10, resolvedValue: 100, effect: { SpellID: '12536', EffectIndex: '0', EffectBasePointsF: '-1000' } })
    const blizzard = rankReview.records.find(record => record.spellId === 11185)!
    expect(blizzard.linkedReferences[0]).toMatchObject({ kind: 'duration', divisor: 1000, resolvedValue: 1.5, spellMisc: { SpellID: '12484', DurationIndex: '65' }, duration: { ID: '65', Duration: '1500', MaxDuration: '1500' } })
    const tables = new Map(rankReview.sources.filter(source => ['Spell', 'SpellEffect', 'SpellMisc', 'SpellDuration'].includes(source.table)).map(source => [source.table, new Map(parseClientCsv(readFileSync(join(process.cwd(), source.path), 'utf8')).map(row => [row.ID, row]))]))
    for (const record of [concentration, blizzard]) {
      for (const reference of record.linkedReferences) {
        expect(tables.get('Spell')?.get(reference.spell.ID)).toEqual(reference.spell)
        if (reference.kind === 'spell_effect') expect(tables.get('SpellEffect')?.get(reference.effect?.ID ?? '')).toEqual(reference.effect)
        if (reference.kind === 'duration') {
          expect(tables.get('SpellMisc')?.get(reference.spellMisc?.ID ?? '')).toEqual(reference.spellMisc)
          expect(tables.get('SpellDuration')?.get(reference.duration?.ID ?? '')).toEqual(reference.duration)
        }
      }
    }
    expect(rankReview.resolution).toContain('No interpolation')
  })
})
