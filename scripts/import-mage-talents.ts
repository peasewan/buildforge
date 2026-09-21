import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseForeverDiffMage, parseTheWowDbMage } from '../src/lib/mageTalentParse'
import { reconcileMageTalents } from '../src/lib/mageTalentReconcile'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const foreverDiffUrl = 'https://foreverdiff.com/talents/mage/calculator/'
const theWowDbUrl = 'https://thewowdb.com/wow-forever/talents/mage/'

const fetchText = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const main = async () => {
  const allowManual = process.argv.includes('--allow-manual-snapshot')
  const [foreverHtml, wowdbHtml] = await Promise.all([fetchText(foreverDiffUrl), fetchText(theWowDbUrl)])
  const foreverDiff = parseForeverDiffMage(foreverHtml)
  const theWowDb = parseTheWowDbMage(wowdbHtml)
  const result = reconcileMageTalents(foreverDiff, theWowDb)
  const fetchedAt = new Date().toISOString()
  const report = {
    foreverDiffUrl,
    theWowDbUrl,
    fetchedAt,
    acquisition: 'fetch' as const,
    foreverDiffCount: foreverDiff.length,
    theWowDbCount: theWowDb.length,
    published: result.published.length,
    missingInA: result.missingInA.map((talent) => `${talent.branch}:${talent.name}`),
    missingInB: result.missingInB.map((talent) => `${talent.branch}:${talent.name}`),
    fieldConflicts: result.fieldConflicts,
    branches: {
      arcane: result.published.filter((talent) => talent.branch === 'arcane').length,
      fire: result.published.filter((talent) => talent.branch === 'fire').length,
      frost: result.published.filter((talent) => talent.branch === 'frost').length,
    },
  }

  const dataDir = resolve(root, 'src/data')
  await mkdir(dataDir, { recursive: true })
  await writeFile(resolve(dataDir, 'mage-source-foreverdiff-1.60.1.69913.json'), `${JSON.stringify({ acquisition: 'fetch', source: foreverDiffUrl, fetchedAt, talents: foreverDiff }, null, 2)}\n`)
  await writeFile(resolve(dataDir, 'mage-source-thewowdb-1.60.1.69913.json'), `${JSON.stringify({ acquisition: 'fetch', source: theWowDbUrl, fetchedAt, talents: theWowDb }, null, 2)}\n`)
  await writeFile(resolve(dataDir, 'mage-import-report.json'), `${JSON.stringify(report, null, 2)}\n`)

  const emptyBranch = Object.values(report.branches).some((count) => count === 0)
  if (!allowManual && (foreverDiff.length === 0 || theWowDb.length === 0 || emptyBranch)) {
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
    ],
  }))
  await writeFile(resolve(dataDir, 'mage-beta-1.60.1.69913.json'), `${JSON.stringify(production, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invoked) await main()
