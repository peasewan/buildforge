import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, expect, it } from 'vitest'

beforeAll(async () => {
  document.body.innerHTML = new DOMParser().parseFromString(readFileSync(resolve('poe-atlas-tree-compare/index.html'), 'utf8'), 'text/html').body.innerHTML
  await import('../poe-atlas-tree-compare/main')
})
it('checks the changed Yield Upon Yield effect, deduplicates IDs and flags unknown inputs', () => {
  const input = document.querySelector<HTMLTextAreaElement>('#ids')!
  input.value = '2378, 2378 999999'
  document.querySelector<HTMLButtonElement>('#check')!.click()
  expect(document.querySelector('#summary')!.textContent).toContain('1 changed')
  expect(document.querySelector('#summary')!.textContent).toContain('999999')
  expect(document.querySelectorAll('#selection details')).toHaveLength(1)
  expect(document.querySelector('#selection')!.textContent).toContain('50% increased chance')
  expect(document.querySelector('#selection')!.textContent).toContain('+30% chance')
})
it('displays each migration outcome and can clear the allocation', () => {
  document.querySelector<HTMLButtonElement>('#example')!.click()
  expect(document.querySelector('#summary')!.textContent).toMatch(/1 retained · 1 changed · 1 removed/)
  document.querySelector<HTMLButtonElement>('#reset')!.click()
  expect(document.querySelector('#selection')!.children).toHaveLength(0)
})

// Published October 22 during 3.29, by the author of this SSF race thread:
// https://www.reddit.com/r/PathOfExileSSF/comments/1xcdet3/advice_needed_ssf_138138_race_strategy_zerker/
const realCode = 'AAAABgAAGdSHYCGDlGa1AM6dXlrO6o23zHUnK9fJJ52HxtDjcKueUYKu57V9c6UXy4dUxjP-yUOpAAA='
const prefix = 'https://www.pathofexile.com/fullscreen-atlas-skill-tree/'
function submitUrl(url: string) {
  document.querySelector<HTMLInputElement>('#atlas-url')!.value = url
  document.querySelector<HTMLFormElement>('#import-form')!.dispatchEvent(new Event('submit', { cancelable: true }))
}

it('imports the published SSF race allocation with explicit and implicit patch versions', () => {
  for (const patch of ['', '3.29.1/']) {
    submitUrl(prefix + patch + realCode)
    expect(document.querySelector('#import-status')!.textContent).toContain('Imported 25 unique IDs')
    expect(document.querySelector('#summary')!.textContent).toBe('2 retained · 20 changed · 3 removed')
    expect(document.querySelector('#ids')).toHaveProperty('value', '54407, 24609, 33684, 26293, 206, 40286, 23246, 60045, 47052, 29991, 11223, 51495, 40327, 50896, 58224, 43934, 20866, 44775, 46461, 29605, 6091, 34644, 50739, 65225, 17321')
  }
})
it('rejects malformed, truncated, wrong-tree, wrong-host and wrong-patch URLs', async () => {
  const { importAtlas } = await import('../poe-atlas-tree-compare/importAtlas')
  for (const link of [
    prefix + realCode.slice(0, -8), prefix + realCode.replace('=', '!'), prefix + 'AAAABgAAGQAA',
    prefix + realCode.replace('AAAABg', 'AAAABw'), prefix.replace('-atlas-', '-passive-') + realCode,
    prefix.replace('.com/', '.com.example/') + realCode, prefix + '3.30.0/' + realCode,
    prefix + realCode + '?ruthless=true', prefix + 'ruthless/' + realCode,
  ]) expect(() => importAtlas(link)).toThrow()
})
it('reports each lost edge once only when both endpoints were selected', () => {
  const input = document.querySelector<HTMLTextAreaElement>('#ids')!
  const check = document.querySelector<HTMLButtonElement>('#check')!
  input.value = '31, 40286'
  check.click()
  expect(document.querySelector('#lost-links h3')!.textContent).toBe('1 lost direct link between selected nodes')
  expect(document.querySelector('#lost-links li')!.textContent).toContain('#40286')
  input.value = '31'
  check.click()
  expect(document.querySelector('#lost-links h3')!.textContent).toMatch(/^0 lost/)
})
