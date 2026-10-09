import { createHash, randomUUID } from 'node:crypto'
import { existsSync, linkSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import {
  CURRENT_CLASS_CLIENT_TABLES, CURRENT_CLASS_CONFIGS, reconcileCurrentClassClient,
  type CurrentClassId, type CurrentClassTables,
  type ReviewedIdentityMapping, type ReviewedClientQuarantine, type ReviewedClientEdgeQuarantine,
  type ReviewedClientGridPosition, type ReviewedClientEdgeInterpretation,
} from '../src/lib/currentClassClientReconcile'

const arg = (name: string): string => {
  const index = process.argv.indexOf(name)
  if (index < 0 || !process.argv[index + 1]) throw new Error('Missing ' + name)
  return process.argv[index + 1]
}
const optionalArg = (name: string): string | undefined => process.argv.includes(name) ? arg(name) : undefined
const classId = arg('--class') as CurrentClassId
if (!Object.hasOwn(CURRENT_CLASS_CONFIGS, classId)) throw new Error('Unsupported class')
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

const baselinePath = resolve(classId === 'warrior' ? 'src/data/warrior-beta-1.60.1.69913.json' : `src/data/expansion/${classId}-1.60.1.69913.json`)
const baselineRaw = JSON.parse(readFileSync(baselinePath, 'utf8'))
const baseline = {
  classId, clientBuild: '1.60.1.69913',
  branches: [...CURRENT_CLASS_CONFIGS[classId].branches],
  talents: Array.isArray(baselineRaw) ? baselineRaw : baselineRaw.talents,
}
const resolvedExport = JSON.parse(readFileSync(exportPath, 'utf8'))
const tables = Object.fromEntries(CURRENT_CLASS_CLIENT_TABLES.map(table => [table, readFileSync(resolve(clientDir, table + '.' + shortBuild + '.csv'), 'utf8')])) as CurrentClassTables

// Explicit reviewed semantic transitions. A reused raw node is never a rename.
const identityReview: Partial<Record<CurrentClassId, ReviewedIdentityMapping[]>> = {
  warrior: [{ currentName: 'Iron Will', currentBranch: 'protection', previousId: 'warrior-fury-iron-will', expectedSpellId: 12962 }],
  hunter: [
    { currentName: 'Trueshot Aura', currentBranch: 'marksmanship', previousId: 'hunter-1361', expectedPreviousSpellId: 19506, expectedSpellId: 1299346 },
    { currentName: 'Improved Stings', currentBranch: 'marksmanship', previousId: 'hunter-1348', expectedPreviousSpellId: 19464, expectedSpellId: 1310661 },
  ],
  rogue: [
    { currentName: 'Improved Eviscerate', currentBranch: 'combat', previousId: 'rogue-276', expectedSpellId: 14162, reason: 'Same name and canonical SpellID; current licensed Classic comparison confirms Assassination to Combat move.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Improved Gouge', currentBranch: 'assassination', previousId: 'rogue-203', expectedSpellId: 13741, reason: 'Same name and canonical SpellID; current licensed Classic comparison confirms Combat to Assassination move.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Hack and Slash', currentBranch: 'combat', previousId: 'rogue-242', expectedSpellId: 13960, reason: 'Exact existing Hack and Slash SpellID13960 preserved. Old Dagger13706 and Mace13709 records carried the same display alias but are not migrated into this identity.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Puncturing Wounds', currentBranch: 'combat', previousId: 'rogue-202', expectedPreviousSpellId: 13733, expectedSpellId: 1224716, reason: 'Current licensed Classic comparison explicitly identifies Improved Backstab as the renamed predecessor; current Backstab critical effect is expanded to Mutilate and combo-point generation.', sourceUrl: 'https://talentsforever.com/data.json' },
  ],
  priest: [{ currentName: 'Blackout', currentBranch: 'shadow', previousId: 'priest-464', expectedPreviousSpellId: 15268, expectedSpellId: 15326, reason: 'Same named stun talent and explicit unchanged percentage series; active Trait canonical SpellID uses the former last legacy rank. Stable talent identity is preserved without fabricating per-rank spell IDs.', sourceUrl: 'https://talentsforever.com/data.json' }],
  druid: [
    { currentName: 'Natural Shapeshifter', currentBranch: 'restoration', previousId: 'druid-781', expectedSpellId: 16833, reason: 'Same name and canonical SpellID; licensed Classic comparison explicitly confirms Balance to Restoration move.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Insect Swarm', currentBranch: 'balance', previousId: 'druid-827', expectedSpellId: 5570, reason: 'Same name and canonical SpellID; licensed Classic comparison explicitly confirms Restoration to Balance move.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Feral Charge', currentBranch: 'feral', previousId: 'druid-804', expectedPreviousSpellId: 16979, expectedSpellId: 1238122, reason: 'Current named Feral Charge preserves the reviewed Bear charge/interrupt effect and adds a Cat form charge. Licensed Classic comparison identifies the former Bear-only talent; old ranks remain historical.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Blood Frenzy', currentBranch: 'feral', previousId: 'druid-800', expectedPreviousSpellId: 16952, expectedSpellId: 16958, reason: 'Licensed Classic comparison explicitly says Blood Frenzy takes in the former Primal Fury effect. Retain Blood Frenzy semantic ID only; separate old Primal Fury allocations remain archived rather than merged automatically.', sourceUrl: 'https://talentsforever.com/data.json' },
  ],
  warlock: [{ currentName: 'Conflagrate', currentBranch: 'destruction', previousId: 'warlock-968', expectedPreviousSpellId: 17962, expectedSpellId: 1293817, reason: 'Same named Immolate-consuming spell and explicit Classic comparison; current canonical spell replaces historical Spell17962, with moved tier and removed Improved Immolate prerequisite.', sourceUrl: 'https://talentsforever.com/data.json' }],
  shaman: [
    { currentName: "Earth's Grasp", currentBranch: 'enhancement', previousId: 'shaman-572', expectedSpellId: 16043, reason: 'Same name and canonical SpellID; licensed Classic comparison explicitly confirms Elemental to Enhancement move.', sourceUrl: 'https://talentsforever.com/data.json' },
    { currentName: 'Call of Thunder', currentBranch: 'elemental', previousId: 'shaman-562', expectedPreviousSpellId: 16041, expectedSpellId: 16120, reason: 'Same named Lightning critical-chance talent; current explicit single rank uses former last legacy SpellID and current rank cap is reconciled from TraitNodeEntry. Old five-rank allocation is not silently migrated.', sourceUrl: 'https://talentsforever.com/data.json' },
  ],
}
const reviewedIdentityMappings = build === '1.60.1.70291' ? identityReview[classId] ?? [] : []
const reviewedQuarantines: ReviewedClientQuarantine[] = classId === 'hunter' && build === '1.60.1.70291' ? [
  { nodeId: 104982, name: 'Lightning Reflexes', spellId: 19168, posX: 102800, posY: 5740, replacementNodeId: 110859, reason: 'Off-grid duplicate remnant: same name and SpellID as on-grid current node110859; current Talents Forever70291 visible-tree export uses Survival row6/column3. Raw coordinate typo is retained, never corrected.', sourceUrl: 'https://talentsforever.com/data.json' },
  { nodeId: 105003, name: 'Improved Serpent Sting', spellId: 19464, posX: 6820, posY: 39300, replacementNodeId: 110870, reason: 'Off-grid former talent remnant. Blizzard Hunter Deep Dive explicitly states Improved Stings replaces/renames Improved Serpent Sting and moves to row2. Current node110870/Spell1310661 and licensed visible-tree export agree; raw obsolete record retained.', sourceUrl: 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid' },
] : []
if (classId === 'priest' && build === '1.60.1.70291') reviewedQuarantines.push({ nodeId: 105865, name: 'Holy Specialization', spellId: 14889, posX: 9280, posY: 21300, replacementNodeId: 110855, reason: 'Exact off-grid duplicate has the same name/SpellID as active on-grid Holy row1/column3 node110855; licensed current visible-tree membership contains only the active copy. Original malformed coordinates remain archived.', sourceUrl: 'https://talentsforever.com/data.json' })
const reviewedGridPositions: ReviewedClientGridPosition[] = classId === 'warlock' && build === '1.60.1.70291' ? [
  { nodeId: 105916, name: 'Amplify Curse', spellId: 18288, posX: 2220, posY: 3320, branch: 'affliction', row: 3, column: 3, reason: 'Current licensed visible tree explicitly places this exact named active Spell18288 at Affliction row3/column3. Raw y3320 is malformed and preserved; displayed row/column are community_verified rather than a corrected client coordinate.', sourceUrl: 'https://talentsforever.com/data.json' },
  { nodeId: 105921, name: 'Improved Life Tap', spellId: 18182, posX: 1020, posY: 2120, branch: 'affliction', row: 1, column: 1, reason: 'Current licensed visible tree explicitly places this exact named active Spell18182 at Affliction row1/column1. Raw y2120 is malformed and preserved; displayed row/column are community_verified rather than a corrected client coordinate.', sourceUrl: 'https://talentsforever.com/data.json' },
] : []
const reviewedEdgeInterpretations: ReviewedClientEdgeInterpretation[] = classId === 'druid' && build === '1.60.1.70291' ? [
  { edgeId: 124666, leftNodeId: 104928, rightNodeId: 104927, type: 0, prerequisite: false, reason: "Exact reverse Nature's Splendor to Nature's Majesty Type0 visual connection is not a spend requirement in the independently reviewed current licensed tree. Both raw endpoints/type are retained; no general Type0 interpretation is inferred.", sourceUrl: 'https://talentsforever.com/data.json' },
  { edgeId: 124675, leftNodeId: 104927, rightNodeId: 104928, type: 3, prerequisite: true, reason: "Exact Nature's Majesty to Nature's Splendor Type3 connection matches the current licensed visible prerequisite chain. Direction is community_verified; client type semantics and required rank are not claimed independently verified.", sourceUrl: 'https://talentsforever.com/data.json' },
] : []
const reviewedEdgeQuarantines: ReviewedClientEdgeQuarantine[] = classId === 'hunter' && build === '1.60.1.70291' ? [
  { edgeId: 124700, leftNodeId: 104961, rightNodeId: 104964, reason: 'Raw reciprocal Bestial Wrath↔Intimidation Type2 links form an impossible spend graph. Exact BestialWrath→Intimidation connection excluded after current licensed visible-tree review and tier geometry; BestialSwiftness→Intimidation→BestialWrath remains. Affected direction is community_verified, not client-only proof.', sourceUrl: 'https://talentsforever.com/data.json' },
] : []
const { candidate, diff } = reconcileCurrentClassClient({ classId, build, tables, baseline, resolved: resolvedExport, reviewedIdentityMappings, reviewedQuarantines, reviewedEdgeQuarantines, reviewedGridPositions, reviewedEdgeInterpretations })

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
  tableEvidence, reviewedIdentityMappings, reviewedQuarantines, reviewedEdgeQuarantines, reviewedGridPositions, reviewedEdgeInterpretations,
  rawClientNodeCount: candidate.rawClientNodeCount, activeMembershipVerification: candidate.activeMembershipVerification,
  rawClientTreeId: candidate.treeId, activeNodes: candidate.talents.length,
  completeRankTexts: candidate.talents.reduce((sum, talent) => sum + talent.rankDescriptions.length, 0),
  sourceVocabulary: { structure: 'client_verified', reviewedDisplayGrid: reviewedGridPositions.length ? 'community_verified' : 'client_verified', reviewedPrerequisiteDirection: (reviewedEdgeInterpretations.length || reviewedEdgeQuarantines.length) ? 'community_verified' : 'client_verified', rankText: 'community_verified', iconName: 'community_verified', treePoints: 'derived_assumption', prerequisiteRequiredRank: 'derived_assumption' },
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
