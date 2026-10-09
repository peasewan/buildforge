import { PUBLISHED_CLASSES } from '../src/data/classes'
import { reviewPublishedRankEvidence } from './content-review'
import { allocationSignature, contentTaskIssues, publishedClassPages, publishRequirementsFor, satisfiedRequirements, validClassBuild } from '../src/lib/classPage'
import { classPageRedirects } from '../src/lib/classStaticPages'

// Read-only audit: never promotes data, modifies routes or fabricates quality scores.
const active = publishedClassPages(PUBLISHED_CLASSES)
const report = PUBLISHED_CLASSES.map(def => {
  const published = active.filter(entry => entry.classDef === def).map(entry => entry.page)
  const signatures = new Set(def.builds.map(build => allocationSignature(build.build)))
  const failures = def.pages.filter(page => !page.retiredTo).flatMap(page => {
    const unmet = publishRequirementsFor(page).filter(requirement => !satisfiedRequirements(def).has(requirement))
    const issues = contentTaskIssues(def, page)
    const invalid = [page.primaryBuildId, ...page.relatedBuildIds].filter(Boolean).filter(id => !def.builds.some(build => build.id === id && validClassBuild(def,build)))
    return unmet.length || issues.length || invalid.length ? [{path:`/${page.slug}`, unmet, issues, invalidBuilds:invalid}] : []
  })
  const taskGroups = new Map<string,string[]>()
  for (const page of published.filter(page => ['specBuild','specLeveling'].includes(page.kind))) {
    const build = def.builds.find(build => build.id === page.primaryBuildId)!
    const key = `${page.spec}:${allocationSignature(build.build)}`
    taskGroups.set(key, [...(taskGroups.get(key) ?? []), `/${page.slug}`])
  }
  return {
    classId:def.id, dataset:def.verifiedBuild, contentPolicy:def.contentPolicy ?? 'legacy',
    defined: def.pages.length, published:published.length, retired:def.pages.filter(page=>page.retiredTo).length,
    namedBuildRecords:def.builds.length, distinctAllocations:signatures.size,
    readableRankTexts:def.talents.reduce((sum,t)=>sum+(t.rankDescriptions?.filter(text=>text.trim()).length ?? 0),0),
    recordedRanks:def.talents.reduce((sum,t)=>sum+t.maxRank,0),
    failures, duplicateSpecTasks:[...taskGroups.values()].filter(paths=>paths.length>1),
  }
})
const redirects = classPageRedirects()
const rankEvidence = reviewPublishedRankEvidence(PUBLISHED_CLASSES)
if (process.argv.includes('--check')) {
  console.log(`Structural content audit: ${active.length} published class pages, ${redirects.length / 2} reviewed consolidations, ${report.filter(row=>row.contentPolicy === 'intent_tasks_v1').length} task-gated classes. Legacy classes are outside that task gate.`)
  console.log(`Selected-rank review covers every published registry class, including legacy: ${rankEvidence.summary.primaryPagesWithGaps}/${rankEvidence.summary.primaryBuildPages} primary-build pages and ${rankEvidence.summary.allReferencedPagesWithGaps}/${active.length} pages with any referenced build still have missing exact rank text. Run npm run content:review for the strict evidence report. This is not an AdSense approval gate.`)
}
else console.log(JSON.stringify({classes:report, publishedClassPages:active.length, consolidationRedirects:redirects.length, rankEvidence, limits:'Structural task/data checks do not establish AdSense approval or live performance. Older datasets remain explicitly historical.'},null,2))
// Legacy pending pages are intentionally withheld. Every active opted-in class task must pass.
if (report.some(row => row.contentPolicy === 'intent_tasks_v1' && (row.failures.length || row.duplicateSpecTasks.length))) process.exitCode = 1
