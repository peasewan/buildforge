import { createHash, randomUUID } from 'node:crypto'
import { existsSync, linkSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import {
  CURRENT_CLASS_CLIENT_TABLES, reconcileCurrentClassClient,
  type CurrentClassId, type CurrentClassTables,
  type ReviewedIdentityMapping, type ReviewedClientQuarantine, type ReviewedClientEdgeQuarantine,
} from '../src/lib/currentClassClientReconcile'

const arg = (name: string): string => {
  const index = process.argv.indexOf(name)
  if (index < 0 || !process.argv[index + 1]) throw new Error('Missing ' + name)
  return process.argv[index + 1]
}
const optionalArg = (name: string): string | undefined => process.argv.includes(name) ? arg(name) : undefined
const classId = arg('--class') as CurrentClassId
if (!['hunter', 'warrior'].includes(classId)) throw new Error('Unsupported class')
const build = arg('--build')
if (!/^1\.60\.1\.\d+$/.test(build)) throw new Error('Invalid client build')
const clientDir = resolve(arg('--client-dir'))
const exportPath = resolve(arg('--resolved-export'))
const shortBuild = build.split('.').at(-1)

// Import never promotes a candidate into src/data. Promotion remains a separate,
// reviewed code change after the saved diff and source manifest have been checked.
const candidateRoot = resolve('data/candidates/current-classes')
const candidatePath = resolve(optionalArg('--output') ?? resolve(candidateRoot, build, `${classId}-beta-${build}.json`))
const inside = relative(candidateRoot, candidatePath)
if (!inside || inside === '..' || inside.startsWith('..' + sep) || resolve(candidateRoot, inside) !== candidatePath || !candidatePath.endsWith('.json')) {
  throw new Error('Output must stay inside data/candidates/current-classes and use a .json filename')
}
function refuseSymlinkAncestors(path: string): void {
  const components = relative(process.cwd(), path).split(sep)
  let current = process.cwd()
  for (const component of components) {
    current = resolve(current, component)
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Refusing symlink output/source path ' + current)
  }
}
const reviewDir = dirname(candidatePath)
const stem = basename(candidatePath, '.json')
const diffPath = resolve(reviewDir, stem + '.diff.json')
const manifestPath = resolve(reviewDir, stem + '.source-manifest.json')
for (const path of [candidatePath, diffPath, manifestPath]) {
  refuseSymlinkAncestors(path)
  if (existsSync(path)) throw new Error('Output already exists; choose a new candidate filename: ' + path)
}

const baselinePath = resolve(classId === 'hunter' ? 'src/data/expansion/hunter-1.60.1.69913.json' : 'src/data/warrior-beta-1.60.1.69913.json')
const baselineRaw = JSON.parse(readFileSync(baselinePath, 'utf8'))
const baseline = {
  classId, clientBuild: '1.60.1.69913',
  branches: classId === 'hunter' ? ['beast-mastery', 'marksmanship', 'survival'] : ['arms', 'fury', 'protection'],
  talents: Array.isArray(baselineRaw) ? baselineRaw : baselineRaw.talents,
}
const resolvedExport = JSON.parse(readFileSync(exportPath, 'utf8'))
const tables = Object.fromEntries(CURRENT_CLASS_CLIENT_TABLES.map(table => [table, readFileSync(resolve(clientDir, table + '.' + shortBuild + '.csv'), 'utf8')])) as CurrentClassTables

// Explicit reviewed semantic transitions. A reused raw node is never a rename.
const reviewedIdentityMappings: ReviewedIdentityMapping[] = classId === 'warrior'
  ? [{ currentName: 'Iron Will', currentBranch: 'protection', previousId: 'warrior-fury-iron-will', expectedSpellId: 12962 }]
  : [
    { currentName: 'Trueshot Aura', currentBranch: 'marksmanship', previousId: 'hunter-1361', expectedPreviousSpellId: 19506, expectedSpellId: 1299346 },
    { currentName: 'Improved Stings', currentBranch: 'marksmanship', previousId: 'hunter-1348', expectedPreviousSpellId: 19464, expectedSpellId: 1310661 },
  ]
const reviewedQuarantines: ReviewedClientQuarantine[] = classId === 'hunter' && build === '1.60.1.70291' ? [
  { nodeId: 104982, name: 'Lightning Reflexes', spellId: 19168, posX: 102800, posY: 5740, replacementNodeId: 110859, reason: 'Off-grid duplicate remnant: same name and SpellID as on-grid current node110859; current Talents Forever70291 visible-tree export uses Survival row6/column3. Raw coordinate typo is retained, never corrected.', sourceUrl: 'https://talentsforever.com/data.json' },
  { nodeId: 105003, name: 'Improved Serpent Sting', spellId: 19464, posX: 6820, posY: 39300, replacementNodeId: 110870, reason: 'Off-grid former talent remnant. Blizzard Hunter Deep Dive explicitly states Improved Stings replaces/renames Improved Serpent Sting and moves to row2. Current node110870/Spell1310661 and licensed visible-tree export agree; raw obsolete record retained.', sourceUrl: 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid' },
] : []
const reviewedEdgeQuarantines: ReviewedClientEdgeQuarantine[] = classId === 'hunter' && build === '1.60.1.70291' ? [
  { edgeId: 124700, leftNodeId: 104961, rightNodeId: 104964, reason: 'Raw reciprocal Bestial Wrath↔Intimidation Type2 links form an impossible spend graph. Exact BestialWrath→Intimidation connection excluded after current licensed visible-tree review and tier geometry; BestialSwiftness→Intimidation→BestialWrath remains. Affected direction is community_verified, not client-only proof.', sourceUrl: 'https://talentsforever.com/data.json' },
] : []
const { candidate, diff } = reconcileCurrentClassClient({ classId, build, tables, baseline, resolved: resolvedExport, reviewedIdentityMappings, reviewedQuarantines, reviewedEdgeQuarantines })

const sourceDir = resolve('data/sources/current-classes/' + build)
const sourceArtifacts = [...CURRENT_CLASS_CLIENT_TABLES, 'TraitNodeGroupXTraitNode'].map(table => {
  const input = resolve(clientDir, table + '.' + shortBuild + '.csv')
  const buffer = readFileSync(input)
  return { table, input, path: resolve(sourceDir, basename(input)), buffer }
})
const exportBuffer = readFileSync(exportPath)
const preserved = [...sourceArtifacts, { table: 'resolved_export', input: exportPath, path: resolve(sourceDir, 'talentsforever-resolved.json'), buffer: exportBuffer }]
// All checks precede any writes. A saved raw artifact is immutable even if an
// upstream source later returns different bytes for the same client build.
for (const artifact of preserved) {
  refuseSymlinkAncestors(artifact.path)
  if (existsSync(artifact.path) && !readFileSync(artifact.path).equals(artifact.buffer)) {
    throw new Error('Preserved source differs; refusing overwrite: ' + artifact.path)
  }
}
const tableEvidence = sourceArtifacts.map(({ table, path, buffer }) => ({
  table, url: 'https://wago.tools/db2/' + table + '/csv?build=' + build,
  path: relative(process.cwd(), path).split(sep).join('/'), bytes: buffer.length,
  sha256: createHash('sha256').update(buffer).digest('hex'),
}))
const manifest = {
  classId, build, sourceDate: resolvedExport.generated, candidateGeneratedAt: new Date().toISOString(),
  candidatePath: relative(process.cwd(), candidatePath).split(sep).join('/'),
  resolvedRankSourceUrl: 'https://talentsforever.com/data.json', resolvedRankSourceBuild: candidate.resolvedRankSourceBuild,
  resolvedRankLicense: resolvedExport.license, resolvedRankLicenseUrl: candidate.resolvedRankLicenseUrl,
  resolvedRankAttribution: resolvedExport.attribution, resolvedRankExportSha256: createHash('sha256').update(exportBuffer).digest('hex'),
  tableEvidence, reviewedIdentityMappings, reviewedQuarantines, reviewedEdgeQuarantines,
  rawClientNodeCount: candidate.rawClientNodeCount, activeMembershipVerification: candidate.activeMembershipVerification,
  rawClientTreeId: candidate.treeId, activeNodes: candidate.talents.length,
  completeRankTexts: candidate.talents.reduce((sum, talent) => sum + talent.rankDescriptions.length, 0),
  sourceVocabulary: { structure: 'client_verified', rankText: 'community_verified', iconName: 'community_verified', treePoints: 'derived_assumption', prerequisiteRequiredRank: 'derived_assumption' },
  promotionStatus: 'candidate_only',
}
const jsonBuffer = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const writes = [
  ...preserved.filter(artifact => !existsSync(artifact.path)).map(artifact => ({ path: artifact.path, buffer: artifact.buffer })),
  { path: diffPath, buffer: jsonBuffer(diff) }, { path: manifestPath, buffer: jsonBuffer(manifest) },
  { path: candidatePath, buffer: jsonBuffer(candidate) },
]
const created: string[] = []
try {
  for (const output of writes) {
    mkdirSync(dirname(output.path), { recursive: true })
    const staged = output.path + '.' + randomUUID() + '.tmp'
    try {
      writeFileSync(staged, output.buffer, { flag: 'wx', mode: 0o644 })
      // An exclusive hard link publishes complete bytes atomically and fails if
      // another process creates the destination after the earlier existence check.
      linkSync(staged, output.path)
      created.push(output.path)
    } finally { rmSync(staged, { force: true }) }
  }
} catch (error) {
  for (const path of created.reverse()) rmSync(path, { force: true })
  throw error
}
console.log(JSON.stringify({ candidatePath, diffPath, manifestPath, talents: candidate.talents.length, ranks: manifest.completeRankTexts, summary: diff.summary, promotionStatus: 'candidate_only' }, null, 2))
