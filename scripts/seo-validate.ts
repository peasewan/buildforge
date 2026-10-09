import notebookFooterAmendments from '../docs/seo/approved-emberville-notebook-footer-2026-10-09.json'
import paladin70245Amendments from '../docs/seo/approved-paladin-70245-remediation-2026-10-09.json'
import calculatorEntryAmendments from '../docs/seo/approved-calculator-entry-2026-10-06.json'
import wowUtilityAmendments from '../docs/seo/approved-wow-utility-tools-2026-10-07.json'
import paladinLevel30Amendments from '../docs/seo/approved-paladin-level30-decisions-2026-10-07.json'
import decisionToolsAmendments from '../docs/seo/approved-paladin-decision-tools-2026-10-05.json'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLISHED_CLASSES } from '../src/data/classes'
import { DISCOVERY_PAGES } from '../src/data/siteDiscovery'
import { TRUST_PAGES } from '../src/data/trustPages'
import { EMBERVILLE_PAGES } from '../src/data/emberville'
import { publishedClassPages } from '../src/lib/classStaticPages'
import type { ClassPageKind } from '../src/lib/classPage'
import { experienceEnabled } from '../src/experiences/rollout'
import baseline from '../docs/seo/paladin-frozen-baseline.json'
import patchAmendments from '../docs/seo/approved-patch-notice-2026-09-27.json'
import growthAmendments from '../docs/seo/approved-growth-flow-2026-09-27.json'
import pvpEntryAmendments from '../docs/seo/approved-pvp-entry-2026-09-28.json'
import retentionAmendments from '../docs/seo/approved-retention-quality-2026-09-28.json'
import protectionArchiveAmendments from '../docs/seo/approved-protection-archive-2026-09-29.json'
import forgePilotAmendments from '../docs/seo/approved-forge-pilot-2026-09-29.json'
import forgePilotAccountAmendments from '../docs/seo/approved-forge-pilot-account-2026-09-29.json'
import previewReleaseAmendments from '../docs/seo/approved-preview-release-gate-2026-09-29.json'
import siteConsistencyAmendments from '../docs/seo/approved-site-consistency-2026-09-29.json'
import betaCapAndFivePagesAmendments from '../docs/seo/approved-beta-level30-truth-2026-10-03.json'
import levelingToolsAmendments from '../docs/seo/approved-leveling-tools-2026-10-04.json'
import searchRecoveryDatesAmendments from '../docs/seo/approved-search-recovery-dates-2026-10-04.json'
import searchRecoveryContentAmendments from '../docs/seo/approved-search-recovery-content-2026-10-05.json'
// Explicitly reviewed annotations scope body and sitemap revisions; only named descriptions and head fingerprints can change.
const frozenPages = baseline.pages.map(page => {
  const archiveAmendment = protectionArchiveAmendments.pages[page.path as keyof typeof protectionArchiveAmendments.pages]
  const amendment = archiveAmendment
    ?? retentionAmendments.pages[page.path as keyof typeof retentionAmendments.pages]
    ?? pvpEntryAmendments.pages[page.path as keyof typeof pvpEntryAmendments.pages]
    ?? growthAmendments.pages[page.path as keyof typeof growthAmendments.pages]
    ?? patchAmendments.pages[page.path as keyof typeof patchAmendments.pages]
  const previouslyReviewed = amendment ? {
    ...page,
    rootSha256: amendment.rootSha256,
    linksSha256: amendment.linksSha256,
    lastmod: archiveAmendment?.lastmod ?? page.lastmod,
    description: archiveAmendment && 'description' in archiveAmendment ? archiveAmendment.description : page.description,
    headSeoSha256: archiveAmendment && 'headSeoSha256' in archiveAmendment ? archiveAmendment.headSeoSha256 : page.headSeoSha256,
  } : page
  const previewAmendment = previewReleaseAmendments.pages[page.path as keyof typeof previewReleaseAmendments.pages]
  const withPreview = previewAmendment ? { ...previouslyReviewed, ...previewAmendment } : previouslyReviewed
  const consistencyAmendment = siteConsistencyAmendments.pages[page.path as keyof typeof siteConsistencyAmendments.pages]
  const withConsistency = consistencyAmendment ? { ...withPreview, ...consistencyAmendment } : withPreview
  const forgePilotAmendment = forgePilotAmendments.pages[page.path as keyof typeof forgePilotAmendments.pages]
  const withForgePilot = forgePilotAmendment ? { ...withConsistency, ...forgePilotAmendment } : withConsistency
  const accountAmendment = forgePilotAccountAmendments.pages[page.path as keyof typeof forgePilotAccountAmendments.pages]
  const withAccount = accountAmendment ? { ...withForgePilot, ...accountAmendment } : withForgePilot
  const betaCapAmendment = betaCapAndFivePagesAmendments.pages[page.path as keyof typeof betaCapAndFivePagesAmendments.pages]
  const withBeta = betaCapAmendment ? { ...withAccount, ...betaCapAmendment } : withAccount
  const levelingAmendment = levelingToolsAmendments.pages[page.path as keyof typeof levelingToolsAmendments.pages]
  const withLeveling = levelingAmendment ? { ...withBeta, ...levelingAmendment } : withBeta
  const datesAmendment = searchRecoveryDatesAmendments.pages[page.path as keyof typeof searchRecoveryDatesAmendments.pages]
  const withDates = datesAmendment ? { ...withLeveling, ...datesAmendment } : withLeveling
  const contentAmendment = searchRecoveryContentAmendments.pages[page.path as keyof typeof searchRecoveryContentAmendments.pages]
  const withContent = contentAmendment ? { ...withDates, ...contentAmendment } : withDates
  const decisions = decisionToolsAmendments.pages[page.path as keyof typeof decisionToolsAmendments.pages]
  const withDecisions = decisions ? { ...withContent, ...decisions } : withContent
  const entry = calculatorEntryAmendments.pages[page.path as keyof typeof calculatorEntryAmendments.pages]
  const withEntry = entry ? { ...withDecisions, ...entry } : withDecisions
  const utility = wowUtilityAmendments.pages[page.path as keyof typeof wowUtilityAmendments.pages]
  const withUtility = utility ? { ...withEntry, ...utility } : withEntry
  const level30 = paladinLevel30Amendments.pages[page.path as keyof typeof paladinLevel30Amendments.pages]
  const withLevel30 = level30 ? { ...withUtility, ...level30 } : withUtility
  const promotion = paladin70245Amendments.pages[page.path as keyof typeof paladin70245Amendments.pages]
  const withPromotion = promotion ? { ...withLevel30, ...promotion } : withLevel30
  const notebookFooter = notebookFooterAmendments.pages[page.path as keyof typeof notebookFooterAmendments.pages]
  return notebookFooter ? { ...withPromotion, ...notebookFooter } : withPromotion
})
import vercel from '../vercel.json'
import { collectSeoRedirects, parseSitemap, validateSeo, type Requirement } from './seo/validate'

const project = fileURLToPath(new URL('../', import.meta.url))
const dist = resolve(project, 'dist')
const published = publishedClassPages()
const classPaths = published.map(({ page }) => `/${page.slug}`)
const selectors: Record<ClassPageKind, string> = {
  calculator: '[data-intent-calculator="true"]', buildsHub: '.ix-hub', talents: '.ix-reference', specTalents: '.ix-reference',
  specBuild: '.ix-workbench', leveling: '.ix-progression', specLeveling: '.ix-progression', aoe: '.ix-progression', comparison: '.ix-comparison', levelCap: '.ix-cap',
  pvp: '.rs-surface', specPvp: '.rs-surface', dungeon: '.rs-surface', specDungeon: '.rs-surface', tank: '.rs-surface', healing: '.rs-surface', pet: '.rs-surface', totem: '.rs-surface',
}
const surfaces: Record<ClassPageKind, string> = {
  calculator: '', buildsHub: 'build-discovery', talents: 'talent-reference', specTalents: 'talent-reference',
  specBuild: 'build-workbench', leveling: 'level-progression', specLeveling: 'level-progression', aoe: 'level-progression', comparison: 'route-comparison', levelCap: 'cap-snapshot',
  pvp: 'pvp-matchup', specPvp: 'pvp-matchup', dungeon: 'dungeon-pull', specDungeon: 'dungeon-pull', tank: 'tank-inventory', healing: 'healing-compare', pet: 'pet-support', totem: 'totem-coverage',
}
// Exact existing UI messages, scoped inside the page's intent wrapper. Missing data is not a license to fabricate an allocation.
const unavailable: Partial<Record<ClassPageKind, string[]>> = {
  comparison: ['Two reviewed build records are not yet available for comparison.'],
  specBuild: ['No reviewed allocation is available for this page.'],
}
const progression = ['A reviewed point-by-point route is not available yet.', 'This route needs a point-order review before step-by-step planning is available. The existing endpoint remains available below.']
const role = ['A role-specific legal allocation has not been published. Review the documented limitations below before choosing a supported route.']
for (const kind of ['leveling', 'specLeveling', 'aoe'] as const) unavailable[kind] = progression
for (const kind of ['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'] as const) unavailable[kind] = role
const requirements: Record<string, Requirement> = {}
for (const { classDef, page } of published) requirements[`/${page.slug}`] = {
  selector: selectors[page.kind], kind: page.kind === 'calculator' ? undefined : page.kind,
  intentShell: page.kind !== 'calculator' && experienceEnabled(`/${page.slug}`),
  surface: page.kind !== 'calculator' && experienceEnabled(`/${page.slug}`) ? surfaces[page.kind] : undefined,
  hub: `/${published.find(p => p.classDef === classDef && p.page.kind === 'buildsHub')!.page.slug}`,
  unavailableText: unavailable[page.kind],
}
requirements['/wow-forever-paladin-build-comparator'] = { selector: '[data-surface="paladin-build-comparator"]' }
requirements['/invokyr'] = { selector: '[data-surface="invokyr-home"]' }
requirements['/invokyr-multiplayer'] = { selector: '[data-surface="invokyr-multiplayer"]' }
requirements['/songs-of-glimmerwick'] = { selector: '[data-surface="glimmerwick-garden"]' }
requirements['/songs-of-glimmerwick-first-days'] = { selector: '[data-surface="glimmerwick-first-days"]' }
requirements['/songs-of-glimmerwick-spellcasting'] = { selector: '[data-surface="glimmerwick-spellcasting"]' }
requirements['/songs-of-glimmerwick-garden-well'] = { selector: '[data-surface="glimmerwick-well"]' }
requirements['/nivalis-nights-profit-calculator'] = { selector: '[data-surface="nivalis-profit"]' }
for (const page of DISCOVERY_PAGES) requirements[page.path] = { selector: page.id === 'dungeon-finder' || page.id === 'class-picker' ? '.planning-tools' : page.id === 'home' ? '.sd-games' : page.id === 'classes' ? '.sd-class-grid' : '.sd-build-groups' }
for (const page of [...TRUST_PAGES, ...EMBERVILLE_PAGES]) requirements[`/${page.slug}`] = { selector: `[data-intent-experience="/${page.slug}"]` }
const files = readdirSync(dist, { recursive: true, withFileTypes: true }).filter(f => f.isFile() && f.name.endsWith('.html'))
const pages: Record<string, string> = {}
for (const file of files) {
  const absolute = resolve(file.parentPath, file.name), local = relative(dist, absolute).replaceAll('\\', '/')
  const path = local === 'index.html' ? '/' : local.endsWith('/index.html') ? `/${local.slice(0, -11)}` : `/${local}`
  pages[path] = readFileSync(absolute, 'utf8')
}
const redirects = collectSeoRedirects(vercel.redirects)
const report = validateSeo({ origin: 'https://buildforgetools.com', pages, sitemap: parseSitemap(readFileSync(resolve(dist, 'sitemap.xml'), 'utf8')),
  expectedPaths: ['/invokyr', '/invokyr-multiplayer', '/wow-forever-paladin-build-comparator', '/nivalis-nights-profit-calculator', '/songs-of-glimmerwick', '/songs-of-glimmerwick-first-days', '/songs-of-glimmerwick-spellcasting', '/songs-of-glimmerwick-garden-well', ...baseline.pages.map(p => p.path), ...classPaths, ...DISCOVERY_PAGES.map(p => p.path), ...TRUST_PAGES.map(p => `/${p.slug}`), ...EMBERVILLE_PAGES.map(p => `/${p.slug}`)],
  withheldPaths: PUBLISHED_CLASSES.flatMap(c => c.pages.map(p => `/${p.slug}`)).filter(p => !classPaths.includes(p)),
  redirects, aliases: { '/build': '/paladin' }, requirements, frozen: frozenPages,
})
const output = resolve(dist, 'seo-report.json')
writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), baselineCommit: baseline.commit, ...report }, null, 2)}\n`)
for (const error of report.errors) console.error(error)
console.log(`${report.passed ? 'PASS' : 'FAIL'} SEO: ${report.indexablePages}/${report.expectedPages} indexable pages; ${report.sitemapPages} sitemap entries; ${report.frozenPages} frozen; ${report.errors.length} errors; ${report.warnings.length} advisory warnings. Report: ${output}`)
if (!report.passed) process.exitCode = 1
