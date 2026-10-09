/** Read-only evidence completeness review, independent of the page publication/task policy. */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLISHED_CLASSES } from '../src/data/classes'
import { publishedClassPages, type ClassBuild, type ClassDefinition, type ClassPageDefinition } from '../src/lib/classPage'

export type RankEvidenceGap = {
  talentId: string
  talentName: string
  rank: number
  reason: 'talent_missing' | 'rank_invalid' | 'rank_text_missing' | 'rank_evidence_unknown' | 'rank_text_unresolved' | 'rank_source_mismatch'
}
export type BuildRankCoverage = { buildId: string; sourceBuild: string; selectedEndpoints: number; resolvedEndpoints: number; missing: RankEvidenceGap[] }
export type PageRankCoverage = { primary: BuildRankCoverage | null; related: BuildRankCoverage[] }

function rankCoverageForBuild(def: ClassDefinition, build: ClassBuild): BuildRankCoverage {
  const selected = Object.entries(build.build).filter(([, rank]) => rank > 0)
  const missing: RankEvidenceGap[] = []
  for (const [talentId, rank] of selected) {
    const talent = def.talents.find(candidate => candidate.id === talentId)
    const base = { talentId, talentName: talent?.name ?? talentId, rank }
    if (!talent) missing.push({ ...base, reason: 'talent_missing' })
    else if (!Number.isInteger(rank) || rank > talent.maxRank) missing.push({ ...base, reason: 'rank_invalid' })
    else if (!talent.rankDescriptions?.[rank - 1]?.trim()) missing.push({ ...base, reason: 'rank_text_missing' })
    else if (/\$[a-zA-Z0-9{]|\bX%|\bUnknown\b/.test(talent.rankDescriptions[rank - 1])) missing.push({ ...base, reason: 'rank_text_unresolved' })
    else if (talent.sourceClientBuild !== build.verifiedThroughBuild || talent.verifiedThroughBuild !== build.verifiedThroughBuild) missing.push({ ...base, reason: 'rank_source_mismatch' })
    else if (!talent.fieldEvidence.rankDescriptions || talent.fieldEvidence.rankDescriptions === 'unknown') missing.push({ ...base, reason: 'rank_evidence_unknown' })
  }
  return { buildId: build.id, sourceBuild: build.verifiedThroughBuild, selectedEndpoints: selected.length, resolvedEndpoints: selected.length - missing.length, missing }
}

export function rankCoverageForPage(def: ClassDefinition, page: ClassPageDefinition): PageRankCoverage {
  const primary = def.builds.find(build => build.id === page.primaryBuildId)
  const related = [...new Set(page.relatedBuildIds)]
    .filter(id => id !== primary?.id)
    .flatMap(id => { const build = def.builds.find(candidate => candidate.id === id); return build ? [rankCoverageForBuild(def, build)] : [] })
  return { primary: primary ? rankCoverageForBuild(def, primary) : null, related }
}

export function reviewPublishedRankEvidence(classes: ClassDefinition[]) {
  const active = publishedClassPages(classes)
  const pages = active.map(({ classDef, page }) => ({
    classId: classDef.id, path: `/${page.slug}`, clientBuild: classDef.verifiedBuild,
    structuralTaskGate: classDef.contentPolicy ?? 'legacy',
    ...rankCoverageForPage(classDef, page),
  }))
  const rows = classes.map(def => {
    const owned = pages.filter(page => page.classId === def.id)
    const primary = owned.flatMap(page => page.primary ? [page.primary] : [])
    return {
      classId: def.id, clientBuild: def.verifiedBuild, structuralTaskGate: def.contentPolicy ?? 'legacy',
      publishedPages: owned.length, primaryBuildPages: primary.length,
      primaryPagesWithGaps: owned.filter(page => page.primary?.missing.length).length,
      allReferencedPagesWithGaps: owned.filter(page => [page.primary, ...page.related].some(build => build?.missing.length)).length,
      primarySelectedEndpoints: primary.reduce((sum, build) => sum + build.selectedEndpoints, 0),
      primaryResolvedEndpoints: primary.reduce((sum, build) => sum + build.resolvedEndpoints, 0),
    }
  })
  return {
    scope: 'Published ClassDefinition pages only. Paladin uses a separate dataset validator and is outside this registry report.',
    limits: 'Text availability is not proof of mechanic correctness, recommendation quality or AdSense approval. Unknown effects are never filled from a generic description or another rank. No page is published or retired by this review.',
    summary: {
      publishedPages: pages.length,
      primaryBuildPages: rows.reduce((sum, row) => sum + row.primaryBuildPages, 0),
      primaryPagesWithGaps: rows.reduce((sum, row) => sum + row.primaryPagesWithGaps, 0),
      allReferencedPagesWithGaps: rows.reduce((sum, row) => sum + row.allReferencedPagesWithGaps, 0),
    },
    classes: rows,
    pagesNeedingRankText: pages.filter(page => [page.primary, ...page.related].some(build => build?.missing.length)),
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = reviewPublishedRankEvidence(PUBLISHED_CLASSES)
  console.log(JSON.stringify(report, null, 2))
  // An explicit review gate must fail on known gaps; the ordinary build may still preserve useful historical references.
  if (process.argv.includes('--require-rank-text') && report.summary.allReferencedPagesWithGaps) process.exitCode = 1
}
