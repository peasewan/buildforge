import { readFile, writeFile } from 'node:fs/promises'

const guidePath = new URL('../src/content/paladin-guide.json', import.meta.url)
const outputPath = new URL('../dist/wow-forever-paladin-talents/index.html', import.meta.url)
const buildTargets = [
  ['../src/content/holy-healing-build.json', '../dist/wow-forever-paladin-build/index.html'],
  ['../src/content/protection-shield-build.json', '../dist/wow-forever-protection-paladin-build/index.html'],
  ['../src/content/retribution-judgment-build.json', '../dist/wow-forever-retribution-paladin-build/index.html'],
]
const plannerOutputPath = new URL('../dist/paladin/index.html', import.meta.url)

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const guide = JSON.parse(await readFile(guidePath, 'utf8'))
const words = [guide.title, guide.dek, ...guide.sections.flatMap((section) => [section.heading, ...section.paragraphs])]
  .join(' ')
  .match(/[A-Za-z0-9’'-]+/g)?.length ?? 0

if (words < 500 || words > 800) {
  throw new Error(`Guide must contain 500–800 words; found ${words}.`)
}

const sections = guide.sections.map((section) => `
  <section id="${escapeHtml(section.id)}">
    <h2>${escapeHtml(section.heading)}</h2>
    ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n    ')}
  </section>`).join('\n')

const prerendered = `<main class="guide-page guide-prerender">
  <article>
    <p>${escapeHtml(guide.eyebrow)}</p>
    <h1>${escapeHtml(guide.title)}</h1>
    <p>${escapeHtml(guide.dek)}</p>
    ${sections}
    <p><a href="/paladin">Open the WoW Forever Paladin Talent Calculator</a> · <a href="/wow-forever-paladin-builds">Explore all WoW Forever Paladin builds</a></p>
  </article>
</main>`

const template = await readFile(outputPath, 'utf8')
if (!template.includes('<!-- GUIDE_PRERENDER -->')) {
  throw new Error('Guide prerender marker was not found in the built HTML.')
}
await writeFile(outputPath, template.replace('<!-- GUIDE_PRERENDER -->', prerendered))
console.log(`Prerendered guide with ${words} words.`)

for (const [contentFile, outputFile] of buildTargets) {
  const build = JSON.parse(await readFile(new URL(contentFile, import.meta.url), 'utf8'))
  const buildWords = [build.title, build.dek, ...build.sections.flatMap((section) => [section.heading, ...section.paragraphs])]
    .join(' ')
    .match(/[A-Za-z0-9’'-]+/g)?.length ?? 0

  if (buildWords < 450 || buildWords > 750) {
    throw new Error(`${build.spec} build page must contain 450–750 words; found ${buildWords}.`)
  }

  const buildSections = build.sections.map((section) => `
    <section id="${escapeHtml(section.id)}">
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n      ')}
    </section>`).join('\n')

  const buildPrerendered = `<main class="build-page build-prerender">
    <article>
      <p>${escapeHtml(build.eyebrow)}</p>
      <h1>${escapeHtml(build.title)}</h1>
      <p>${escapeHtml(build.dek)}</p>
      <p><strong>Talent allocation: ${escapeHtml(build.heroHeading.match(/\(([^)]+)\)/)?.[1] ?? '')} — ${escapeHtml(build.allocationSummary)}.</strong></p>
      <h2>Selected talents</h2>
      <ul>${build.selectedTalents.map((talent) => `<li>${escapeHtml(talent)}</li>`).join('')}</ul>
      ${buildSections}
      <p><a href="${escapeHtml(build.plannerPath)}">Open and edit this WoW Forever ${escapeHtml(build.spec)} Paladin build</a> · <a href="/wow-forever-paladin-builds">Explore all Paladin builds</a></p>
    </article>
  </main>`

  const buildOutputPath = new URL(outputFile, import.meta.url)
  const buildTemplate = await readFile(buildOutputPath, 'utf8')
  if (!buildTemplate.includes('<!-- BUILD_PRERENDER -->')) {
    throw new Error(`${build.spec} build prerender marker was not found in the built HTML.`)
  }
  await writeFile(buildOutputPath, buildTemplate.replace('<!-- BUILD_PRERENDER -->', buildPrerendered))
  console.log(`Prerendered ${build.spec} build page with ${buildWords} words.`)
}

const plannerPrerendered = `<main class="planner-prerender">
  <article>
    <p>Paladin Talent Tool</p>
    <h1>WoW Forever Paladin Talent Calculator</h1>
    <p>Build Paladin talent trees for Holy, Protection, and Retribution. Plan all 51 points, preview talent ranks, create a legal build, and share the exact setup without an account.</p>
    <section>
      <h2>WoW Forever Paladin Talent Tree</h2>
      <p>The interactive talent tree shows 52 community-transcribed preview nodes across all three Paladin specializations. Choose a branch, spend points, and see deeper rows unlock as the allocation becomes valid.</p>
    </section>
    <section>
      <h2>WoW Forever Talents Calculator</h2>
      <p>Use the calculator to compare a Holy healing route, defensive Protection talents, or a Retribution path. The point counter and selected talent summary update with every rank.</p>
    </section>
    <h2>Popular Paladin Builds</h2>
    <ul>
      <li><a href="/wow-forever-paladin-build">Holy Paladin Healing Build — 31/20/0</a></li>
      <li><a href="/wow-forever-protection-paladin-build">Protection Paladin Shield Build — 20/31/0</a></li>
      <li><a href="/wow-forever-retribution-paladin-build">Retribution Paladin Judgment Build — 0/20/31</a></li>
    </ul>
    <h2>Explore Paladin Builds</h2>
    <ul>
      <li><a href="/wow-forever-paladin-leveling-build">WoW Forever Paladin Leveling Build</a></li>
      <li><a href="/wow-forever-paladin-pvp-build">WoW Forever Paladin PvP Build</a></li>
      <li><a href="/wow-forever-paladin-raid-build">WoW Forever Paladin Raid Build</a></li>
      <li><a href="/wow-forever-protection-paladin-dungeon-build">WoW Forever Protection Paladin Dungeon Tank Build</a></li>
    </ul>
    <p><a href="/wow-forever-paladin-talents">Read the WoW Forever Paladin talent guide</a></p>
    <p><a href="/wow-forever-paladin-builds">Explore the WoW Forever Paladin builds hub</a></p>
  </article>
</main>`

const plannerTemplate = await readFile(plannerOutputPath, 'utf8')
if (!plannerTemplate.includes('<!-- PLANNER_PRERENDER -->')) {
  throw new Error('Planner prerender marker was not found in the built HTML.')
}
await writeFile(plannerOutputPath, plannerTemplate.replace('<!-- PLANNER_PRERENDER -->', plannerPrerendered))
console.log('Prerendered Paladin calculator landing content.')
