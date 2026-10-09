import { createHash } from 'node:crypto'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import AppRoute from './AppRoute'
import { pageForPath } from './lib/routes'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
import { BETA_DATA_VERSION } from './data/talents'
it('keeps announced patch version separate from imported data and historical diffs',()=>{
 const html=renderToStaticMarkup(<AppRoute pathname="/wow-forever-paladin-beta-talent-changes"/>)
 expect(BETA_PATCH_REVIEW.clientBuild).toBe('1.60.1.70009')
 expect(BETA_DATA_VERSION).toContain('70245')
 expect(html).toContain('Last Imported Build Diff · Historical')
 expect(html).toContain('Crusade removed from Retribution')
 expect(html).toContain('Official development notes')
 expect(pageForPath('/paladin').title).toBe('WoW Forever Paladin Talent Calculator | Beta Build 70245')
})


import BetaPatchNotice from './BetaPatchNotice'
import { PUBLISHED_CLASSES } from './data/classes'
import { hunterClass } from './data/classes/hunter'
import { warriorClass } from './data/classes/warrior'

it.each(PUBLISHED_CLASSES.filter(def => def.verifiedBuild === '1.60.1.70291'))('shows the actual current $name review instead of the old pending banner', classDef => {
  const html = renderToStaticMarkup(<BetaPatchNotice classId={classDef.id} expanded />)
  expect(html).toContain('Reviewed current Beta tree · client 1.60.1.70291')
  expect(html).toContain('Level 30')
  expect(html).toContain('21-point')
  expect(html).toContain('community evidence')
  expect(html).toContain('planning assumptions')
  expect(html).toContain('https://wago.tools/db2/TraitNode/csv?build=1.60.1.70291')
  expect(html).toContain('https://talentsforever.com/data.json')
  expect(html).toContain('https://creativecommons.org/licenses/by/4.0/')
  expect(html).toContain('Historical September 24 notes')
  expect(html).toContain(BETA_PATCH_REVIEW.officialSource)
  expect(html).not.toContain('this page’s older dataset is awaiting reconciliation')
  if (classDef.id === 'hunter') {
    expect(html).toContain('visible membership')
    expect(html).toContain('Intimidation')
  }
})

it('keeps the pending banner when a current-class dataset has not passed review', () => {
  const oldReview = hunterClass.dataReview
  try {
    hunterClass.dataReview = { ...oldReview!, ready: false }
    expect(renderToStaticMarkup(<BetaPatchNotice classId="hunter" />)).toContain('this page’s older dataset is awaiting reconciliation')
    hunterClass.dataReview = { ...oldReview!, current: false }
    expect(renderToStaticMarkup(<BetaPatchNotice classId="hunter" />)).toContain('this page’s older dataset is awaiting reconciliation')
  } finally {
    hunterClass.dataReview = oldReview
  }
})

it('does not use the current review label for an unreviewed later build', () => {
  const oldVersion = warriorClass.verifiedBuild
  try {
    warriorClass.verifiedBuild = '1.60.1.70300'
    expect(renderToStaticMarkup(<BetaPatchNotice classId="warrior" />)).toContain('this page’s older dataset is awaiting reconciliation')
  } finally {
    warriorClass.verifiedBuild = oldVersion
  }
})

it.each([
  [false, '1f4c7a2ea7ba03cd4d2f2f91d630860576bbe3e44ffff56378a842f5df714ae1'],
  [true, '05eecea156a47e9cc5ecfbfbbbb8b15ac40b969b6918707820b12fb27770b82f'],
] as const)('preserves the frozen Paladin notice markup with expanded=%s', (expanded, hash) => {
  const html = renderToStaticMarkup(<BetaPatchNotice classId="paladin" expanded={expanded} />)
  expect(createHash('sha256').update(html).digest('hex')).toBe(hash)
})
