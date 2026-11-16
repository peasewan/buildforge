import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import BetaDataStatus from './BetaDataStatus'
import App from './App'
import GuidePage from './GuidePage'
import AppRoute from './AppRoute'

it('distinguishes the editable Beta snapshot from separately reviewed launch references', () => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<BetaDataStatus />), 'text/html')
  expect(doc.body.textContent).toContain('Archived Beta snapshot')
  expect(doc.body.textContent).toContain('1.60.1.70245')
  expect(doc.body.textContent).toContain('not verified for the launch tree')
  expect(doc.querySelector('a[href="/wow-forever-paladin-builds#launch-builds"]')?.textContent).toContain('launch')
  expect(doc.body.textContent).toContain('October 1 Beta cap')
  expect(doc.body.textContent).not.toMatch(/live.*cap|official level cap 30/i)
  expect(doc.querySelector('a[href="/wow-forever-paladin-beta-talent-changes"]')).not.toBeNull()
})

it.each([['calculator', App], ['talent index', GuidePage]] as const)('does not present the old Beta cap as live on the %s', (_name, Page) => {
  localStorage.clear()
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<Page />), 'text/html')
  expect(doc.body.textContent).toContain('not verified for the launch tree')
  expect(doc.body.textContent).not.toMatch(/live (?:Beta )?cap|live Level 30|official Beta cap is now/i)
})

it.each([
  '/wow-forever-paladin-build', '/wow-forever-protection-paladin-build',
  '/wow-forever-retribution-paladin-build', '/wow-forever-paladin-pvp-build',
  '/wow-forever-holy-paladin-pvp-build', '/wow-forever-protection-paladin-pvp-build',
  '/wow-forever-retribution-paladin-pvp-build', '/wow-forever-paladin-raid-build',
  '/wow-forever-holy-paladin-talents', '/wow-forever-protection-paladin-talents',
  '/wow-forever-retribution-paladin-talents', '/wow-forever-paladin-beta-talent-changes',
])('keeps the rendered data scope truthful on %s', path => {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(<AppRoute pathname={path} />), 'text/html')
  expect(doc.body.textContent).not.toMatch(/live (?:WoW Forever )?(?:Level 30|Beta cap)|current level cap\s*30|current Level 30 Beta|level cap is now\s*30/i)
})
