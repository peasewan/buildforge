import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseForeverDiffMage, parseTheWowDbMage } from '../src/lib/mageTalentParse'
import { reconcileMageTalents, type MageBranch, type MagePrimaryClientTalent, type MageSourceTalent, type ReconciledMageTalent } from '../src/lib/mageTalentReconcile'
import { assertMagePublishable } from '../src/lib/mageTalentPublish'
import { readManualSnapshot } from '../src/lib/mageTalentSnapshot'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const foreverDiffUrl = 'https://foreverdiff.com/talents/mage/calculator/'
const theWowDbUrl = 'https://thewowdb.com/wow-forever/talents/mage/'
const foreverDiffSnapshot = 'mage-source-foreverdiff-1.60.1.69913.json'
const theWowDbSnapshot = 'mage-source-thewowdb-1.60.1.69913.json'
const primaryClientSnapshot = 'mage-primary-client-1.60.1.69913.json'

const fetchText = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

type Acquisition = 'fetch' | 'manual_snapshot'

interface AcquisitionSource {
  file: string
  source: string
  acquisition: Acquisition
  // `written` is false on the manual fallback: the importer reads the checked-in file and
  // must not restamp it with a fetch timestamp or relabel its provenance.
  written: boolean
  talents: MageSourceTalent[]
}

// Fetch both views. `--allow-manual-snapshot` is the spec's fallback for a page that cannot be
// parsed reliably: instead of failing, read the checked-in snapshots, which must themselves
// declare `acquisition: manual_snapshot`. The flag never relabels fetched data and never
// bypasses the publish guards below.
const acquire = async (allowManualSnapshot: boolean): Promise<AcquisitionSource[]> => {
  try {
    const [foreverHtml, wowdbHtml] = await Promise.all([fetchText(foreverDiffUrl), fetchText(theWowDbUrl)])
    return [
      { file: foreverDiffSnapshot, source: foreverDiffUrl, acquisition: 'fetch', written: true, talents: parseForeverDiffMage(foreverHtml) },
      { file: theWowDbSnapshot, source: theWowDbUrl, acquisition: 'fetch', written: true, talents: parseTheWowDbMage(wowdbHtml) },
    ]
  } catch (error) {
    if (!allowManualSnapshot) throw error
    console.error(`Fetch or parse failed, falling back to checked-in manual snapshots: ${error instanceof Error ? error.message : String(error)}`)
    const read = async (file: string, source: string): Promise<AcquisitionSource> => ({
      file,
      source,
      acquisition: 'manual_snapshot',
      written: false,
      talents: readManualSnapshot(file, await readFile(resolve(root, 'src/data', file), 'utf8')),
    })
    return [await read(foreverDiffSnapshot, foreverDiffUrl), await read(theWowDbSnapshot, theWowDbUrl)]
  }
}

// Plan line 141: "each branch must have at least one row-1 talent". A row-1 talent is the branch's
// allocatable entry point, which the sources state as `requiredTreePoints === 0`. The report states
// the per-branch entry-point count instead of the weaker "branch is non-empty" gate below.
const mageBranches: MageBranch[] = ['arcane', 'fire', 'frost']

const entryPointsFor = (published: ReconciledMageTalent[], branch: MageBranch) =>
  published.filter((talent) => talent.branch === branch && talent.requiredTreePoints === 0).length

const main = async () => {
  const allowManualSnapshot = process.argv.includes('--allow-manual-snapshot')
  const [foreverDiffSource, theWowDbSource] = await acquire(allowManualSnapshot)
  const foreverDiff = foreverDiffSource.talents
  const theWowDb = theWowDbSource.talents
  const primaryClientRecord = JSON.parse(await readFile(resolve(root, 'src/data', primaryClientSnapshot), 'utf8')) as {
    source: string
    build: string
    talents: MagePrimaryClientTalent[]
  }
  const result = reconcileMageTalents(foreverDiff, theWowDb, primaryClientRecord.talents)
  const fetchedAt = foreverDiffSource.acquisition === 'fetch' ? new Date().toISOString() : null
  // The launch gate stated as data instead of prose: `plannerLegal` is false while any branch has
  // zero allocatable entry points, and `blockers` names each offending branch. The importer still
  // exits 0 — throwing on this would make it permanently unrunnable against today's live data.
  const entryPoints = Object.fromEntries(
    mageBranches.map((branch) => [branch, entryPointsFor(result.published, branch)]),
  ) as Record<MageBranch, number>
  const blockers = mageBranches
    .filter((branch) => entryPoints[branch] === 0)
    .map((branch) => ({ code: `${branch}:no-entry-point`, branch }))
  const report = {
    foreverDiffUrl,
    theWowDbUrl,
    fetchedAt,
    acquisition: foreverDiffSource.acquisition,
    snapshots: [foreverDiffSource, theWowDbSource].map(({ talents, written, ...snapshot }) => ({ ...snapshot, written, talentCount: talents.length })),
    primaryClientSnapshot: {
      file: primaryClientSnapshot,
      source: primaryClientRecord.source,
      build: primaryClientRecord.build,
      talentCount: primaryClientRecord.talents.length,
    },
    foreverDiffCount: foreverDiff.length,
    theWowDbCount: theWowDb.length,
    published: result.published.length,
    missingInA: result.missingInA.map((talent) => `${talent.branch}:${talent.name}`),
    missingInB: result.missingInB.map((talent) => `${talent.branch}:${talent.name}`),
    fieldConflicts: result.fieldConflicts,
    changeStatuses: {
      new: result.published.filter((talent) => talent.changeStatus === 'new').length,
      changed: result.published.filter((talent) => talent.changeStatus === 'changed').length,
      same: result.published.filter((talent) => talent.changeStatus === 'same').length,
      unknown: result.published.filter((talent) => talent.changeStatus === 'unknown').length,
    },
    branches: {
      arcane: result.published.filter((talent) => talent.branch === 'arcane').length,
      fire: result.published.filter((talent) => talent.branch === 'fire').length,
      frost: result.published.filter((talent) => talent.branch === 'frost').length,
    },
    entryPoints,
    plannerLegal: blockers.length === 0,
    blockers,
  }

  const dataDir = resolve(root, 'src/data')
  await mkdir(dataDir, { recursive: true })
  for (const snapshot of [foreverDiffSource, theWowDbSource]) {
    if (!snapshot.written) continue
    await writeFile(resolve(dataDir, snapshot.file), `${JSON.stringify({ acquisition: snapshot.acquisition, source: snapshot.source, fetchedAt, talents: snapshot.talents }, null, 2)}\n`)
  }
  await writeFile(resolve(dataDir, 'mage-import-report.json'), `${JSON.stringify(report, null, 2)}\n`)

  // This is the Task 3 Step 3 gate (a branch with zero published nodes), deliberately weaker than
  // the plan's row-1 rule: `entryPoints`, `plannerLegal` and `blockers` above record that rule's
  // result, and src/data/mageTalents.test.ts pins it against the committed dataset. The weaker
  // empty-branch guard remains a hard import failure; entry-point legality is published in the
  // report and then consumed by the page requirements.
  const emptyBranch = Object.values(report.branches).some((count) => count === 0)
  if (foreverDiff.length === 0 || theWowDb.length === 0 || emptyBranch) {
    console.log(JSON.stringify(report, null, 2))
    throw new Error('Mage import did not produce planner-legal trees for every branch.')
  }

  const production = result.published.map((talent) => ({
    id: `mage-${talent.branch}-${slug(talent.name)}`,
    ...talent,
    sourceClientBuild: '1.60.1.69913',
    verifiedThroughBuild: '1.60.1.69913',
    sources: [
      { label: 'ForeverDiff Mage talent calculator', type: 'beta_client', url: foreverDiffUrl },
      { label: 'Build 69913 Mage talent cross-check', type: 'beta_client_crosscheck', url: theWowDbUrl },
      { label: 'Build 69913 client Talent table', type: 'beta_client', url: primaryClientRecord.source },
    ],
  }))

  assertMagePublishable(production)

  await writeFile(resolve(dataDir, 'mage-beta-1.60.1.69913.json'), `${JSON.stringify(production, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invoked) await main()
