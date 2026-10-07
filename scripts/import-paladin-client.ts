import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  PALADIN_CLIENT_TABLES, parseClientCsv, reconcilePaladinClient, validatePaladinCandidate,
  type PaladinClientTable, type PaladinSnapshot,
} from '../src/lib/paladinClientReconcile'

const argument = (name: string): string => {
  const index = process.argv.indexOf(name)
  if (index < 0 || !process.argv[index + 1]) throw new Error('Missing ' + name)
  return process.argv[index + 1]
}

const build = argument('--build')
const clientDir = resolve(argument('--client-dir'))
const resolvedPath = resolve(argument('--resolved-export'))
const baselinePath = resolve('src/data/paladin-beta-1.60.1.69913.json')
const candidatePath = resolve('src/data/paladin-beta-' + build + '.json')
if (candidatePath === baselinePath) throw new Error('Cannot overwrite production baseline')

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as PaladinSnapshot
const resolved = JSON.parse(readFileSync(resolvedPath, 'utf8'))
const source = resolved?.talents?.Paladin?.source as string | undefined
const resolvedBuild = source?.match(/1\.60\.1\.\d+/)?.[0]
if (!resolvedBuild) throw new Error('Resolved export does not identify a Paladin source build')
const shortBuild = build.split('.').at(-1)
const shortResolved = resolvedBuild.split('.').at(-1)

const allTables = [...PALADIN_CLIENT_TABLES, 'SpellEffect', 'SpellAuraOptions'] as const
const tables = Object.fromEntries(PALADIN_CLIENT_TABLES.map((table) => [
  table, readFileSync(resolve(clientDir, table + '.' + shortBuild + '.csv'), 'utf8'),
])) as Record<PaladinClientTable, string>
const resolvedClientTables = Object.fromEntries(PALADIN_CLIENT_TABLES.map((table) => [
  table, readFileSync(resolve(clientDir, table + '.' + shortResolved + '.csv'), 'utf8'),
])) as Record<PaladinClientTable, string>

const tableEvidence = allTables.map((table) => {
  const current = readFileSync(resolve(clientDir, table + '.' + shortBuild + '.csv'))
  const sourceClient = readFileSync(resolve(clientDir, table + '.' + shortResolved + '.csv'))
  if (!current.equals(sourceClient)) {
    throw new Error('Client tables differ between resolved export and target build: ' + table)
  }
  return {
    table,
    sourceUrl: 'https://wago.tools/db2/' + table + '/csv?build=' + build,
    resolvedClientUrl: 'https://wago.tools/db2/' + table + '/csv?build=' + resolvedBuild,
    sha256: createHash('sha256').update(current).digest('hex'),
    bytes: current.length,
  }
})

const { candidate, diff } = reconcilePaladinClient({
  baseline, build, tables, resolved, resolvedClientTables,
})
// Re-read the raw TraitNode table for the publication gate. This checks the
// serialized candidate's membership against the client tree, independently of
// the candidate's own talent array and the export's resolved rank list.
const clientNodeIds = parseClientCsv(tables.TraitNode)
  .filter((row) => row.TraitTreeID === '1100')
  .map((row) => Number(row.ID))
if (clientNodeIds.some((nodeId) => !Number.isSafeInteger(nodeId))) {
  throw new Error('Invalid Paladin client node ID')
}
const validationErrors = validatePaladinCandidate(candidate, clientNodeIds)
if (validationErrors.length) throw new Error('Candidate validation failed:\n' + validationErrors.join('\n'))
const reviewDir = resolve('data/reviews/' + build)
mkdirSync(reviewDir, { recursive: true })
const manifest = {
  build,
  resolvedRankSourceBuild: resolvedBuild,
  resolvedRankSourceUrl: 'https://talentsforever.com/data.json',
  resolvedRankLicense: resolved.license,
  resolvedRankLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  resolvedRankAttribution: resolved.attribution,
  adaptationNotice: candidate.resolvedRankAdaptationNotice,
  resolvedRankExportSha256: createHash('sha256').update(readFileSync(resolvedPath)).digest('hex'),
  upstreamExportSha256: resolved.upstreamExportSha256 ?? null,
  tableEvidence,
  sourceVocabulary: {
    structure: 'client_verified',
    rankText: 'community_verified',
    officialTuning: 'official',
    prerequisiteRank: 'derived_assumption',
  },
  officialChangesUrl: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696',
  promotionStatus: 'candidate_only',
}
writeFileSync(candidatePath, JSON.stringify(candidate, null, 2) + '\n')
writeFileSync(resolve(reviewDir, 'diff.json'), JSON.stringify(diff, null, 2) + '\n')
writeFileSync(resolve(reviewDir, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify({ candidatePath, reviewDir, talents: candidate.talents.length, summary: diff.summary }, null, 2))
