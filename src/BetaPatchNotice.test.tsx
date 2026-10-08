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
