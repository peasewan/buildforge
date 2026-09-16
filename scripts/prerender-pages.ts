import { readFile, writeFile } from 'node:fs/promises'
import type { BuildLandingPageId } from '../src/data/buildLandingPages'
import { renderHubPrerender, renderLandingPrerender, renderProtectionHubPrerender } from '../src/lib/prerender'

const targets: { filename: string; render: () => string }[] = [
  { filename: 'wow-forever-paladin-builds', render: renderHubPrerender },
  { filename: 'wow-forever-protection-paladin-builds', render: renderProtectionHubPrerender },
  ...(['leveling', 'pvp', 'raid', 'protection-dungeon'] as BuildLandingPageId[]).map((id) => ({
    filename: id === 'protection-dungeon' ? 'wow-forever-protection-paladin-dungeon-build' : `wow-forever-paladin-${id}-build`,
    render: () => renderLandingPrerender(id),
  })),
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
