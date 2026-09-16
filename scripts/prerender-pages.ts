import { readFile, writeFile } from 'node:fs/promises'
import { BUILD_LANDING_PAGES } from '../src/data/buildLandingPages'
import { SPEC_BUILDS_HUBS } from '../src/data/specBuildsHubs'
import { SPEC_TALENTS_PAGES } from '../src/data/specTalentsPages'
import { renderHubPrerender, renderLandingPrerender, renderSpecHubPrerender, renderSpecTalentsPrerender } from '../src/lib/prerender'

// Filenames come from each page's own slug so a new landing page cannot be added
// without its template being picked up here.
const targets: { filename: string; render: () => string }[] = [
  { filename: 'wow-forever-paladin-builds', render: renderHubPrerender },
  ...SPEC_BUILDS_HUBS.map((hub) => ({ filename: hub.slug, render: () => renderSpecHubPrerender(hub.spec) })),
  ...BUILD_LANDING_PAGES.map((page) => ({ filename: page.slug, render: () => renderLandingPrerender(page.id) })),
  ...SPEC_TALENTS_PAGES.map((page) => ({ filename: page.slug, render: () => renderSpecTalentsPrerender(page.spec) })),
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
