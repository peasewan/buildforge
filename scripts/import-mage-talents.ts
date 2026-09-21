import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { reconcileMageTalents, type MageSourceTalent } from '../src/lib/mageTalentReconcile'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const foreverDiffUrl = 'https://foreverdiff.com/talents/mage'
const theWowDbUrl = 'https://thewowdb.com/wow-forever/talents/mage/'

export const parseForeverDiffMage = (_html: string): MageSourceTalent[] => []
export const parseTheWowDbMage = (_html: string): MageSourceTalent[] => []

const fetchText = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

const main = async () => {
  const allowManual = process.argv.includes('--allow-manual-snapshot')
  const [foreverHtml, wowdbHtml] = await Promise.all([fetchText(foreverDiffUrl), fetchText(theWowDbUrl)])
  const foreverDiff = parseForeverDiffMage(foreverHtml)
  const theWowDb = parseTheWowDbMage(wowdbHtml)
  const result = reconcileMageTalents(foreverDiff, theWowDb)
  const report = {
    foreverDiffUrl,
    theWowDbUrl,
    fetchedAt: new Date().toISOString(),
    acquisition: 'fetch' as const,
    published: result.published.length,
    missingInA: result.missingInA.map((talent) => talent.name),
    missingInB: result.missingInB.map((talent) => talent.name),
    fieldConflicts: result.fieldConflicts,
  }
  await mkdir(resolve(root, 'src/data'), { recursive: true })
  await writeFile(resolve(root, 'src/data/mage-import-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
  if (!allowManual && (foreverDiff.length === 0 || theWowDb.length === 0)) {
    throw new Error('Mage source parse returned no talents. Implement live parsers or pass --allow-manual-snapshot.')
  }
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invoked) await main()
