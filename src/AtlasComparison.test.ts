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
