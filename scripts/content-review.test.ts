import { describe, expect, it } from 'vitest'
import { warriorClass } from '../src/data/classes/warrior'
import { rankCoverageForPage, reviewPublishedRankEvidence } from './content-review'

function fixture() {
  const build = warriorClass.builds.find(candidate => Object.keys(candidate.build).length > 1)!
  const page = warriorClass.pages.find(candidate => candidate.primaryBuildId === build.id && !candidate.retiredTo)!
  return { def: structuredClone(warriorClass), page: structuredClone(page), build: structuredClone(build) }
}

describe('published selected-rank evidence review', () => {
  it('checks legacy classes even when the structural task gate is absent', () => {
    const { def, page, build } = fixture()
    delete def.contentPolicy
    const id = Object.keys(build.build)[0]
    const talent = def.talents.find(candidate => candidate.id === id)!
    talent.rankDescriptions = []
    const coverage = rankCoverageForPage(def, page)
    expect(coverage.primary?.missing).toContainEqual(expect.objectContaining({ talentId: id, rank: build.build[id], reason: 'rank_text_missing' }))
  })

  it('requires the selected rank itself instead of falling back to a generic or earlier description', () => {
    const { def, page, build } = fixture()
    const [id, rank] = Object.entries(build.build).find(([, value]) => value > 1)!
    const talent = def.talents.find(candidate => candidate.id === id)!
    talent.description = 'Generic effect text'
    talent.rankDescriptions = Array.from({ length: talent.maxRank }, (_, index) => index === rank - 1 ? '' : 'Another rank')
    expect(rankCoverageForPage(def, page).primary?.missing).toContainEqual(expect.objectContaining({ talentId: id, rank, reason: 'rank_text_missing' }))
  })

  it('does not count text as resolved when its evidence is explicitly unknown', () => {
    const { def, page, build } = fixture()
    const id = Object.keys(build.build)[0]
    const talent = def.talents.find(candidate => candidate.id === id)!
    talent.fieldEvidence.rankDescriptions = 'unknown'
    expect(rankCoverageForPage(def, page).primary?.missing).toContainEqual(expect.objectContaining({ talentId: id, reason: 'rank_evidence_unknown' }))
  })

  it('does not treat an omitted rank-evidence field as reviewed text', () => {
    const { def, page, build } = fixture()
    const id = Object.keys(build.build)[0]
    const talent = def.talents.find(candidate => candidate.id === id)!
    delete talent.fieldEvidence.rankDescriptions
    expect(rankCoverageForPage(def, page).primary?.missing).toContainEqual(expect.objectContaining({ talentId: id, reason: 'rank_evidence_unknown' }))
  })

  it('reports related build gaps separately and does not double count a primary repeated as related', () => {
    const { def, page, build } = fixture()
    const related = structuredClone(build)
    related.id = 'review-only-related'
    const id = Object.keys(related.build)[0]
    related.build = { [id]: 1 }
    const talent = def.talents.find(candidate => candidate.id === id)!
    talent.rankDescriptions![0] = ''
    def.builds.push(related)
    page.relatedBuildIds = [build.id, related.id, related.id]
    const coverage = rankCoverageForPage(def, page)
    expect(coverage.related).toHaveLength(1)
    expect(coverage.related[0].missing).toContainEqual(expect.objectContaining({ talentId: id, rank: 1 }))
  })

  it('reports publication coverage without changing any routes or source data', () => {
    const before = JSON.stringify(warriorClass)
    const report = reviewPublishedRankEvidence([warriorClass])
    expect(report.summary.primaryBuildPages).toBeGreaterThan(0)
    expect(report.summary.primaryPagesWithGaps).toBe(0)
    expect(report.summary.allReferencedPagesWithGaps).toBe(0)
    expect(report.classes[0].structuralTaskGate).toBe('legacy')
    expect(JSON.stringify(warriorClass)).toBe(before)
  })
})
