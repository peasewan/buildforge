// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import packageJson from '../package.json'

const directories: string[] = []
afterEach(() => directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true, force: true })))

function runBuildScript(seoExitCode: number) {
  const directory = mkdtempSync(join(tmpdir(), 'buildforge-build-gate-'))
  directories.push(directory)
  const log = join(directory, 'commands.log')
  for (const command of ['tsc', 'tsx', 'vite', 'node']) {
    const executable = join(directory, command)
    writeFileSync(executable, `#!/bin/sh\nprintf '%s %s\\n' '${command}' "$*" >> "$BUILD_GATE_LOG"\ncase "$*" in *scripts/seo-validate.ts*) exit "$BUILD_GATE_SEO_EXIT";; esac\nexit 0\n`)
    chmodSync(executable, 0o755)
  }
  const result = spawnSync('/bin/sh', ['-c', packageJson.scripts.build], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, BUILD_GATE_LOG: log, BUILD_GATE_SEO_EXIT: String(seoExitCode) },
  })
  return { status: result.status, commands: readFileSync(log, 'utf8').trim().split('\n') }
}

describe('production build gate', () => {
  it('fails the normal build after prerender when SEO validation fails', () => {
    const result = runBuildScript(42)
    expect(result.commands.at(-1)).toContain('scripts/seo-validate.ts')
    expect(result.status).toBe(42)
  }, 15_000)

  it('keeps the normal build successful when SEO validation succeeds', () => {
    const result = runBuildScript(0)
    expect(result.commands.at(-1)).toContain('scripts/seo-validate.ts')
    expect(result.status).toBe(0)
  }, 15_000)
})
