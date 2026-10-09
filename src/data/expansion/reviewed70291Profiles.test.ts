import { describe, expect, it } from 'vitest'
import rogue from '../rogue-beta-1.60.1.70291.json'
import priest from '../priest-beta-1.60.1.70291.json'
import druid from '../druid-beta-1.60.1.70291.json'
import warlock from '../warlock-beta-1.60.1.70291.json'
import shaman from '../shaman-beta-1.60.1.70291.json'
import { allocationSignature, contentTaskIssues, validClassBuild, type ClassTalent } from '../../lib/classPage'
import { canIncrementPlannerTalent, incrementPlannerTalent, totalPlannerPoints, type PlannerBuild } from '../../lib/talentPlanner'
import { createExpansionClass } from './createClass'
import { expansionProfiles } from './profiles'
import { buildReviewed70291Profile, buildReviewed70291RoleDecision } from './reviewed70291Profiles'

type RawTalent = Omit<ClassTalent<string>, 'prerequisite'> & { prerequisite: string[] }
interface ProfileDataset { classId: string; build: string; branches: string[]; sources: unknown[]; talents: unknown[]; ready: boolean; conflicts: string[] }
const datasets = [rogue, priest, druid, warlock, shaman]
const roleKinds = new Set(['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'])
const normalized = (dataset: ProfileDataset): ClassTalent<string>[] => (dataset.talents as unknown as RawTalent[]).map(talent => ({
  ...talent, prerequisite: talent.prerequisite.map(talentId => ({ talentId, requiredRank: null })),
}))
const fixture = (dataset: ProfileDataset) => {
  const talents = normalized(dataset)
  const original = expansionProfiles.find(profile => profile.id === dataset.classId)!
  const profile = buildReviewed70291Profile(original, talents)
  const def = createExpansionClass(profile, { ...dataset, talents }, {
    currentDataReview: { ready: dataset.ready, notice: 'Reviewed 70291 client structure; Talents Forever rank text, CC BY 4.0. Tooltip values are not rescaled from Level 60.' },
    levelCap: 30, level20Builds: true, reviewedAt: '2026-10-09',
  })
  for (const page of def.pages) page.roleDecision = buildReviewed70291RoleDecision(def, page)
  return { original, talents, profile, def }
}

describe('reviewed five-class 70291 editorial profiles', () => {
  for (const dataset of datasets) {
    it(`${dataset.classId}: preserves route identity and old profiles without carrying old point caps or copy`, () => {
      const before = JSON.stringify(expansionProfiles)
      const { original, profile } = fixture(dataset)
      expect(JSON.stringify(expansionProfiles)).toBe(before)
      expect(profile.specs.map(spec => [spec.id, spec.name])).toEqual(original.specs.map(spec => [spec.id, spec.name]))
      expect(profile.extras.map(extra => [extra.suffix, extra.title, extra.kind, extra.spec])).toEqual(original.extras.map(extra => [extra.suffix, extra.title, extra.kind, extra.spec]))
      expect([profile.defaultSpec, profile.pvpSpec, profile.dungeonSpec, profile.comparison]).toEqual([original.defaultSpec, original.pvpSpec, original.dungeonSpec, original.comparison])
      expect(profile.intro).toContain('21 points at Level 30')
      expect(profile.intro).toContain('eleven-point')
      expect(JSON.stringify(profile)).not.toMatch(/69913|unreconciled|Totemic Mastery|Two-Handed Axes|Improved Mark of the Wild|Improved Power Word: Fortitude|Feral Charge \(Bear\)/)
    })

    it(`${dataset.classId}: every ordered point and its Level 20 prefix is legal with complete current source text`, () => {
      const { talents, profile, def } = fixture(dataset)
      for (const spec of profile.specs) {
        let build: PlannerBuild = {}
        const config = { branches: profile.specs.map(candidate => candidate.id), pointCap: 21 }
        for (const [id, count] of spec.route) {
          const talent = talents.find(candidate => candidate.id === id)!
          expect(talent.branch).toBe(spec.id)
          expect(talent.sourceClientBuild).toBe('1.60.1.70291')
          expect(talent.verifiedThroughBuild).toBe('1.60.1.70291')
          expect(talent.fieldEvidence.rankDescriptions).toBe('community_verified')
          for (let i = 0; i < count; i++) {
            expect(canIncrementPlannerTalent(build, talent, talents, config), `${spec.id}/${talent.name}/${i + 1}`).toBe(true)
            build = incrementPlannerTalent(build, talent, talents, config)
            const text = talent.rankDescriptions?.[build[talent.id] - 1]
            expect(text?.trim()).toBeTruthy()
            expect(text).not.toMatch(/\$[a-zA-Z0-9{]|\bX%|\bUnknown\b/)
            if (totalPlannerPoints(build) === 11) {
              const stage = def.builds.find(candidate => candidate.spec === spec.id && candidate.level === 20)!
              expect(stage.build).toEqual(build)
              expect(validClassBuild(def, stage)).toBe(true)
            }
          }
        }
        expect(totalPlannerPoints(build)).toBe(21)
        const endpoint = def.builds.find(candidate => candidate.spec === spec.id && candidate.intent === 'spec')!
        expect(endpoint.build).toEqual(build)
        expect(validClassBuild(def, endpoint)).toBe(true)
      }
    })

    it(`${dataset.classId}: every retained role changes selected source evidence and only offers a legal matching-budget alternative`, () => {
      const { def } = fixture(dataset)
      const pages = def.pages.filter(page => roleKinds.has(page.kind) && !page.retiredTo)
      expect(pages.length).toBeGreaterThanOrEqual(2)
      for (const page of pages) {
        expect(contentTaskIssues(def, page), page.slug).toEqual([])
        const decision = page.roleDecision!
        const primary = def.builds.find(build => build.id === page.primaryBuildId)!
        expect(new Set(decision.options.map(option => option.talentIds.slice().sort().join(','))).size).toBe(decision.options.length)
        expect(decision.sources.some(source => source.url === 'https://wago.tools/db2/TraitNode/csv?build=1.60.1.70291')).toBe(true)
        expect(decision.sources.some(source => source.url === 'https://talentsforever.com/data.json' && source.label.includes('CC BY 4.0'))).toBe(true)
        for (const option of decision.options) {
          expect(option.explanation).toContain('Level 60')
          expect(option.explanation).not.toMatch(/historical.*endpoint|older tooltip|unreconciled|best build|guaranteed/)
          for (const id of option.talentIds) {
            const talent = def.talents.find(candidate => candidate.id === id)!
            const rank = primary.build[id]
            expect(rank).toBeGreaterThan(0)
            expect(option.explanation).toContain(`${talent.name} ${rank}/${talent.maxRank}`)
            expect(option.explanation).toContain(talent.rankDescriptions![rank - 1])
          }
          if (option.alternativeBuildId) {
            const alternative = def.builds.find(build => build.id === option.alternativeBuildId)!
            expect(alternative.level).toBe(primary.level)
            expect(alternative.points).toBe(primary.points)
            expect(alternative.levelCap).toBe(primary.levelCap)
            expect(validClassBuild(def, alternative)).toBe(true)
            expect(allocationSignature(alternative.build)).not.toBe(allocationSignature(primary.build))
          }
        }
      }
    })
  }

  it('fails closed for old source versions, ambiguous names, missing selected rank text and changed rank caps', () => {
    const { original, talents } = fixture(rogue)
    expect(() => buildReviewed70291Profile(original, talents.map(talent => ({ ...talent, verifiedThroughBuild: '1.60.1.69913' })))).toThrow(/70291/)
    const precision = talents.find(talent => talent.name === 'Precision')!
    expect(() => buildReviewed70291Profile(original, [...talents, { ...precision, id: 'ambiguous' }])).toThrow(/Precision/)
    expect(() => buildReviewed70291Profile(original, talents.map(talent => talent.id === precision.id ? { ...talent, rankDescriptions: ['one', 'two', ''] } : talent))).toThrow(/rank text/)
    expect(() => buildReviewed70291Profile(original, talents.map(talent => talent.id === precision.id ? { ...talent, maxRank: 2 } : talent))).toThrow(/Precision/)
  })

  it('uses reduced current rank caps and replaces removed early nodes with current effects', () => {
    const rogueFixture = fixture(rogue)
    const rank = (dataset: ProfileDataset, branch: string, name: string) => {
      const { def } = fixture(dataset)
      const talent = def.talents.find(candidate => candidate.branch === branch && candidate.name === name)!
      return def.builds.find(build => build.spec === branch && build.intent === 'spec')!.build[talent.id] ?? 0
    }
    expect(rank(rogue, 'combat', 'Precision')).toBe(3)
    expect(rank(rogue, 'subtlety', 'Opportunity')).toBe(2)
    expect(rank(priest, 'discipline', 'Wand Specialization')).toBe(2)
    expect(rank(warlock, 'affliction', 'Improved Drains')).toBe(3)
    expect(rank(warlock, 'affliction', 'Soul Siphon')).toBe(0)
    expect(rank(warlock, 'demonology', 'Demonic Sacrifice')).toBe(0)
    expect(rank(shaman, 'enhancement', 'Stormstrike')).toBe(1)
    expect(rank(shaman, 'restoration', 'Water Shield')).toBe(1)
    const feral = fixture(druid).talents.find(talent => talent.name === 'Feral Charge')!
    expect(feral.rankDescriptions![0]).toMatch(/Feral Charge \(Cat\)/)
    expect(rogueFixture.talents.find(talent => talent.name === 'Precision')!.maxRank).toBe(3)
  })

  it('withholds role source claims when a selected rank is missing or its provenance is historical', () => {
    const { def } = fixture(priest)
    const page = def.pages.find(candidate => candidate.kind === 'pvp')!
    const selected = def.talents.find(talent => talent.name === 'Wand Specialization')!
    const incomplete = { ...def, talents: def.talents.map(talent => talent.id === selected.id ? { ...talent, rankDescriptions: [] } : talent) }
    expect(buildReviewed70291RoleDecision(incomplete, page)).toBeUndefined()
    const historical = { ...def, talents: def.talents.map(talent => talent.id === selected.id ? { ...talent, sourceClientBuild: '1.60.1.69913' } : talent) }
    expect(buildReviewed70291RoleDecision(historical, page)).toBeUndefined()
  })

  it('does not offer a mismatched level or an illegal same-budget alternative', () => {
    const { def } = fixture(rogue)
    const page = def.pages.find(candidate => candidate.kind === 'pvp')!
    const alternative = def.builds.find(build => build.spec === 'combat' && build.intent === 'spec')!
    const withoutCurrent = { ...def, builds: def.builds.map(build => build.id === alternative.id ? { ...build, level: 20 as const, levelCap: 11, points: 11 } : build) }
    expect(buildReviewed70291RoleDecision(withoutCurrent, page)!.options.every(option => !option.alternativeBuildId)).toBe(true)
    const invalid = { ...def, builds: def.builds.map(build => build.id === alternative.id ? { ...build, build: { unknown: 21 } } : build) }
    expect(buildReviewed70291RoleDecision(invalid, page)!.options.every(option => !option.alternativeBuildId)).toBe(true)
  })

  it('does not use the new role copy for legacy classes or non-role pages', () => {
    const { def } = fixture(priest)
    expect(buildReviewed70291RoleDecision({ ...def, verifiedBuild: '1.60.1.69913' }, def.pages.find(page => page.kind === 'pvp')!)).toBeUndefined()
    expect(buildReviewed70291RoleDecision(def, def.pages.find(page => page.kind === 'calculator')!)).toBeUndefined()
  })
})
