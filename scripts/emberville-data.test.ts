// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const script = resolve(import.meta.dirname, 'emberville-data.ts')
const unknown = { value: null, verificationStatus: null, sourceIds: [] }
const fact = (value: string) => ({ value, verificationStatus: 'official', sourceIds: ['manual'] })
const candidate = (dataVersion = 'candidate-1') => ({
  schemaVersion: 1, dataVersion, phase: 'pre_early_access', reviewedAt: '2026-09-27',
  sources: [{ id: 'manual', label: 'Fixture manual', url: 'https://example.com/manual', kind: 'official' }],
  mechanics: [],
  classes: [{ id: 'guardian', name: fact('Guardian'), description: unknown, gameId: unknown }],
  weapons: [], skills: [],
  rules: { activeSlots: unknown, passiveSlots: unknown, unlockLevel: unknown, compatibility: [] },
})

let directory: string
beforeEach(() => { directory = mkdtempSync(join(tmpdir(), 'emberville-cli-')) })
afterEach(() => { rmSync(directory, { recursive: true, force: true }) })
const save = (name: string, data: unknown) => {
  const path = join(directory, name)
  writeFileSync(path, JSON.stringify(data))
  return path
}
const cli = (...args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', script, ...args], { encoding: 'utf8' })
const cliJson = (...args: string[]) => JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', script, ...args], { encoding: 'utf8' })) as Record<string, unknown>

describe('local Emberville data CLI', () => {
  it('validates a candidate and queries exact sourced records', () => {
    const path = save('candidate.json', candidate())
    expect(cliJson('--validate', path)).toMatchObject({ valid: true, dataVersion: 'candidate-1' })
    expect(cliJson('--query', path, '--search', ' GUARDIAN ')).toMatchObject({ classes: [{ id: 'guardian', name: { sourceIds: ['manual'] } }], weapons: [], skills: [] })
  })

  it('prints a structured diff of candidate versions', () => {
    const before = save('before.json', candidate())
    const after = save('after.json', candidate('candidate-2'))
    expect(cliJson('--diff', before, after)).toMatchObject({ beforeVersion: 'candidate-1', afterVersion: 'candidate-2', metadata: [{ field: 'dataVersion', before: 'candidate-1', after: 'candidate-2' }] })
  })

  it('imports an entirely validated candidate to a separate local file', () => {
    const input = save('candidate.json', candidate())
    const output = join(directory, 'reviewed-candidate.json')
    expect(cli('--import', input, '--output', output).status).toBe(0)
    expect(JSON.parse(readFileSync(output, 'utf8'))).toMatchObject({ dataVersion: 'candidate-1', classes: [{ gameId: unknown }] })
    expect(readdirSync(directory).sort()).toEqual(['candidate.json', 'reviewed-candidate.json'])
  })

  it('rejects malformed facts before creating or replacing an output', () => {
    const invalid = candidate()
    invalid.classes[0].name.sourceIds = []
    const input = save('invalid.json', invalid)
    const output = save('existing.json', { untouched: true })
    const result = cli('--import', input, '--output', output)
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/classes\[0\]\.name.*source/i)
    expect(readFileSync(output, 'utf8')).toBe('{"untouched":true}')
    expect(cli('--import', input, '--output', join(directory, 'new.json')).status).toBe(1)
    expect(readdirSync(directory).sort()).toEqual(['existing.json', 'invalid.json'])
  })

  it('rejects malformed JSON and invalid argument combinations', () => {
    const input = save('candidate.json', candidate())
    const badJson = join(directory, 'bad.json')
    writeFileSync(badJson, '{')
    expect(cli('--validate', badJson)).toMatchObject({ status: 1, stderr: expect.stringMatching(/JSON/i) })
    expect(cli('--query', input)).toMatchObject({ status: 1, stderr: expect.stringMatching(/search/i) })
    expect(cli('--validate', input, '--import', input)).toMatchObject({ status: 1, stderr: expect.stringMatching(/usage|one command/i) })
    expect(cli('--validate', input, '--output', join(directory, 'output.json')).status).toBe(1)
  })

  it('rejects production paths, including outputs that point to production through a symlink', () => {
    const input = save('candidate.json', candidate())
    const productionDirectory = join(directory, 'src', 'data')
    mkdirSync(productionDirectory, { recursive: true })
    const production = join(productionDirectory, 'emberville-preview-2026-09-27.json')
    writeFileSync(production, '{"untouched":true}')
    expect(cli('--import', input, '--output', production)).toMatchObject({ status: 1, stderr: expect.stringMatching(/production/i) })
    const alias = join(directory, 'candidate-alias.json')
    symlinkSync(production, alias)
    expect(cli('--import', input, '--output', alias)).toMatchObject({ status: 1, stderr: expect.stringMatching(/production/i) })
    expect(readFileSync(production, 'utf8')).toBe('{"untouched":true}')
    expect(readdirSync(productionDirectory)).toEqual(['emberville-preview-2026-09-27.json'])
  })

  it('rejects the input itself and symlink aliases without changing it', () => {
    const input = save('candidate.json', candidate())
    const original = readFileSync(input, 'utf8')
    const alias = join(directory, 'alias.json')
    symlinkSync(input, alias)
    expect(cli('--import', input, '--output', input)).toMatchObject({ status: 1, stderr: expect.stringMatching(/same|source/i) })
    expect(cli('--import', input, '--output', alias)).toMatchObject({ status: 1, stderr: expect.stringMatching(/same|source/i) })
    expect(readFileSync(input, 'utf8')).toBe(original)
    expect(readdirSync(directory).sort()).toEqual(['alias.json', 'candidate.json'])
  })

  it('does not leave temporary files when the target cannot be written', () => {
    const input = save('candidate.json', candidate())
    const output = join(directory, 'missing-directory', 'reviewed.json')
    expect(cli('--import', input, '--output', output).status).toBe(1)
    expect(readdirSync(directory)).toEqual(['candidate.json'])
  })
})
