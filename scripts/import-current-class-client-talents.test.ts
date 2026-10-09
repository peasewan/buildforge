import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const repo = process.cwd()
const script = resolve(repo, 'scripts/import-current-class-client-talents.ts')
const loader = pathToFileURL(resolve(repo, 'node_modules/tsx/dist/loader.mjs')).href
const sourceDir = resolve(repo, 'data/sources/current-classes/1.60.1.70291')
const original = 'src/data/warrior-beta-1.60.1.69913.json'
const production = 'src/data/warrior-beta-1.60.1.70291.json'
const candidate = 'data/candidates/current-classes/1.60.1.70291/warrior-beta-1.60.1.70291.json'
const args = ['--class', 'warrior', '--build', '1.60.1.70291', '--client-dir', sourceDir, '--resolved-export', resolve(sourceDir, 'talentsforever-resolved.json')]

function fixture() {
  const cwd = mkdtempSync(resolve(tmpdir(), 'buildforge-current-import-cli-'))
  mkdirSync(resolve(cwd, 'src/data'), { recursive: true })
  copyFileSync(resolve(repo, original), resolve(cwd, original))
  copyFileSync(resolve(repo, production), resolve(cwd, production))
  return cwd
}
const run = (cwd: string, extra: string[] = []) => execFileSync(process.execPath, ['--import', loader, script, ...args, ...extra], { cwd, encoding: 'utf8', stdio: 'pipe' })
const failure = (cwd: string, extra: string[] = []) => {
  try { run(cwd, extra) } catch (error) {
    return (error as { stderr: string }).stderr
  }
  throw new Error('Import unexpectedly succeeded')
}

describe('current class import CLI write boundary', () => {
  it('writes a validated candidate outside production and never overwrites an existing candidate', () => {
    const cwd = fixture()
    try {
      const beforeArchive = readFileSync(resolve(cwd, original), 'utf8')
      const beforeProduction = readFileSync(resolve(cwd, production), 'utf8')
      run(cwd)
      const output = resolve(cwd, candidate)
      expect(existsSync(output)).toBe(true)
      expect(JSON.parse(readFileSync(output, 'utf8')).talents).toHaveLength(52)
      expect(readFileSync(resolve(cwd, original), 'utf8')).toBe(beforeArchive)
      expect(readFileSync(resolve(cwd, production), 'utf8')).toBe(beforeProduction)
      const beforeCandidate = readFileSync(output, 'utf8')
      expect(failure(cwd)).toMatch(/output already exists/i)
      expect(readFileSync(output, 'utf8')).toBe(beforeCandidate)
    } finally { rmSync(cwd, { recursive: true, force: true }) }
  })

  it.each([production, original, '../outside-review.json'])('rejects unsafe explicit output %s without changing production or archives', (output) => {
    const cwd = fixture()
    try {
      const before = [original, production].map(path => readFileSync(resolve(cwd, path), 'utf8'))
      expect(failure(cwd, ['--output', output])).toMatch(/output must stay inside.*data.candidates.current-classes/i)
      expect([original, production].map(path => readFileSync(resolve(cwd, path), 'utf8'))).toEqual(before)
      expect(existsSync(resolve(cwd, candidate))).toBe(false)
    } finally { rmSync(cwd, { recursive: true, force: true }) }
  })

  it('does not replace preserved source evidence when an existing artifact has different bytes', () => {
    const cwd = fixture()
    try {
      const raw = resolve(cwd, 'data/sources/current-classes/1.60.1.70291/TraitNode.70291.csv')
      mkdirSync(resolve(cwd, 'data/sources/current-classes/1.60.1.70291'), { recursive: true })
      writeFileSync(raw, 'Preserved independent source bytes\n')
      expect(failure(cwd)).toMatch(/preserved source differs/i)
      expect(readFileSync(raw, 'utf8')).toBe('Preserved independent source bytes\n')
      expect(existsSync(resolve(cwd, candidate))).toBe(false)
    } finally { rmSync(cwd, { recursive: true, force: true }) }
  })
})


describe('current five-class CLI source review', () => {
  it.each([['hunter', 50, 148], ['rogue', 53, 139], ['priest', 53, 148], ['druid', 52, 148], ['warlock', 52, 149], ['shaman', 50, 148]])('imports complete %s using its own immutable baseline and actual class tree', (classId, nodes, ranks) => {
    const cwd = mkdtempSync(resolve(tmpdir(), 'buildforge-five-class-import-'))
    const archive = 'src/data/expansion/' + classId + '-1.60.1.69913.json'
    const current = 'src/data/' + classId + '-beta-1.60.1.70291.json'
    try {
      mkdirSync(resolve(cwd, 'src/data/expansion'), { recursive: true })
      copyFileSync(resolve(repo, archive), resolve(cwd, archive))
      writeFileSync(resolve(cwd, current), 'reviewed production sentinel')
      const before = readFileSync(resolve(cwd, archive), 'utf8')
      const output = execFileSync(process.execPath, ['--import', loader, script, '--class', String(classId), ...args.slice(2)], { cwd, encoding: 'utf8', stdio: 'pipe' })
      const summary = JSON.parse(output)
      const payload = JSON.parse(readFileSync(summary.candidatePath, 'utf8'))
      const manifest = JSON.parse(readFileSync(summary.manifestPath, 'utf8'))
      expect(manifest.sourceVocabulary.reviewedPrerequisiteDirection).toBe(['hunter', 'druid'].includes(String(classId)) ? 'community_verified' : 'client_verified')
      expect(payload.classId).toBe(classId)
      expect(payload.talents).toHaveLength(Number(nodes))
      expect(payload.talents.reduce((n: number, talent: { rankDescriptions: string[] }) => n + talent.rankDescriptions.length, 0)).toBe(Number(ranks))
      expect(payload.talents.every((talent: { sourceClientBuild: string; fieldEvidence: { rankDescriptions: string } }) => talent.sourceClientBuild === '1.60.1.70291' && talent.fieldEvidence.rankDescriptions === 'community_verified')).toBe(true)
      expect(readFileSync(resolve(cwd, archive), 'utf8')).toBe(before)
      expect(readFileSync(resolve(cwd, current), 'utf8')).toBe('reviewed production sentinel')
    } finally { rmSync(cwd, { recursive: true, force: true }) }
  })
})
