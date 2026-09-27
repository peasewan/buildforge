import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { diffEmbervilleDatasets, parseEmbervilleDataset, queryEmbervilleDataset, type EmbervilleDataset } from '../src/lib/embervilleData'

const usage = 'Usage: --validate file | --query file --search text | --diff before after | --import candidate --output nonproduction-file'

function readDataset(file: string): EmbervilleDataset {
  let input: unknown
  const contents = readFileSync(file, 'utf8')
  try { input = JSON.parse(contents) } catch { throw new Error(`${file}: invalid JSON`) }
  return parseEmbervilleDataset(input)
}

/** Resolve existing ancestors as well as existing files, so an alias cannot bypass import guards. */
function physicalPath(file: string): string {
  const absolute = resolve(file)
  if (existsSync(absolute)) return realpathSync(absolute)
  const parent = dirname(absolute)
  return parent === absolute ? absolute : join(physicalPath(parent), basename(absolute))
}

const isProductionDataset = (file: string): boolean => /^emberville-preview.*\.json$/i.test(basename(file))
  && basename(dirname(file)).toLowerCase() === 'data'
  && basename(dirname(dirname(file))).toLowerCase() === 'src'

function importCandidate(input: string, output: string, data: EmbervilleDataset): { imported: true; dataVersion: string; output: string } {
  const inputPath = physicalPath(input)
  const outputPath = physicalPath(output)
  if (isProductionDataset(resolve(output)) || isProductionDataset(outputPath)) throw new Error('Import cannot overwrite a production Emberville dataset; choose a separate candidate output.')
  const inputStat = statSync(inputPath)
  const outputStat = existsSync(outputPath) ? statSync(outputPath) : undefined
  if (inputPath === outputPath || (outputStat && inputStat.dev === outputStat.dev && inputStat.ino === outputStat.ino)) throw new Error('Import output cannot be the same file as the source candidate.')
  if (outputStat?.isDirectory()) throw new Error('Import output must be a file.')
  const temporary = join(dirname(outputPath), `.emberville-import-${randomUUID()}.tmp`)
  try {
    writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
    renameSync(temporary, outputPath)
  } catch (error) {
    rmSync(temporary, { force: true })
    throw error
  }
  return { imported: true, dataVersion: data.dataVersion, output: outputPath }
}

/** Local-only tooling; the full candidate is validated before import touches the filesystem. */
export function runEmbervilleDataCli(args: string[]): unknown {
  if (args.length === 2 && args[0] === '--validate' && args[1]) {
    const data = readDataset(args[1])
    return { valid: true, dataVersion: data.dataVersion, reviewedAt: data.reviewedAt, counts: { sources: data.sources.length, mechanics: data.mechanics.length, classes: data.classes.length, weapons: data.weapons.length, skills: data.skills.length } }
  }
  if (args.length === 4 && args[0] === '--query' && args[1] && args[2] === '--search') return queryEmbervilleDataset(readDataset(args[1]), args[3])
  if (args.length === 3 && args[0] === '--diff' && args[1] && args[2]) return diffEmbervilleDatasets(readDataset(args[1]), readDataset(args[2]))
  if (args.length === 4 && args[0] === '--import' && args[1] && args[2] === '--output' && args[3]) {
    const data = readDataset(args[1])
    return importCandidate(args[1], args[3], data)
  }
  throw new Error(usage)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(runEmbervilleDataCli(process.argv.slice(2)), null, 2)) }
  catch (error) { console.error(error instanceof Error ? error.message : 'Emberville data command failed.'); process.exitCode = 1 }
}
