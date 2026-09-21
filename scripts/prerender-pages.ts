import { readFile, writeFile } from 'node:fs/promises'
import { BUILD_LANDING_PAGES } from '../src/data/buildLandingPages'
import { SPEC_BUILDS_HUBS } from '../src/data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../src/data/specTalentsPages'
import { TRUST_PAGES } from '../src/data/trustPages'
import { renderClassPage, renderEmbervillePrerender, renderHubPrerender, renderLandingPrerender, renderSpecHubPrerender, renderSpecTalentsPrerender, renderSpellbookPrerender, renderTrustPrerender, renderWarriorBuildPrerender, renderWarriorHubPrerender, renderWarriorPlannerPrerender } from '../src/lib/prerender'
import { EMBERVILLE_PAGES } from '../src/data/emberville'
import { WARRIOR_BUILD_PAGES } from '../src/data/warriorPages'
import { publishedClassPages } from '../src/lib/classStaticPages'

// Filenames come from each page's own slug so a new landing page cannot be added
// without its template being picked up here. Class pages come from the publish gate, so a page
// whose `publishRequirements` are unmet has no shell to fill and is never prerendered, while
// satisfying a requirement later prerenders it with nothing authored here.
const targets: { filename: string; render: () => string }[] = [
  { filename: 'warrior', render: renderWarriorPlannerPrerender },
  { filename: 'wow-forever-warrior-builds', render: renderWarriorHubPrerender },
  ...WARRIOR_BUILD_PAGES.map((page) => ({ filename: page.slug, render: () => renderWarriorBuildPrerender(page.id) })),
  ...EMBERVILLE_PAGES.map((page) => ({ filename: page.slug, render: () => renderEmbervillePrerender(page.id) })),
  ...publishedClassPages().map(({ classDef, page }) => ({ filename: page.slug, render: () => renderClassPage(classDef, page) })),
  { filename: 'wow-forever-paladin-builds', render: renderHubPrerender },
  { filename: 'wow-forever-paladin-abilities', render: renderSpellbookPrerender },
  ...SPEC_BUILDS_HUBS.map((hub) => ({ filename: hub.slug, render: () => renderSpecHubPrerender(hub.spec) })),
  ...BUILD_LANDING_PAGES.map((page) => ({ filename: page.slug, render: () => renderLandingPrerender(page.id) })),
  ...SPEC_TALENTS_PAGES.map((page) => ({ filename: page.slug, render: () => renderSpecTalentsPrerender(page.spec) })),
  ...TRUST_PAGES.map((page) => ({ filename: page.slug, render: () => renderTrustPrerender(page.id) })),
]

for (const { filename, render } of targets) {
  const outputPath = new URL(`../dist/${filename}/index.html`, import.meta.url)
  const template = await readFile(outputPath, 'utf8')

  if (!template.includes('<!-- PAGES_PRERENDER -->')) {
    throw new Error(`Prerender marker was not found in the built HTML for ${filename}.`)
  }

  await writeFile(outputPath, template.replace('<!-- PAGES_PRERENDER -->', render()))
  console.log(`Prerendered ${filename}.`)
}
