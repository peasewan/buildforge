import { readFile, writeFile } from 'node:fs/promises'

const guidePath = new URL('../src/content/paladin-guide.json', import.meta.url)
const outputPath = new URL('../dist/wow-forever-paladin-talents/index.html', import.meta.url)
const buildPath = new URL('../src/content/holy-healing-build.json', import.meta.url)
const buildOutputPath = new URL('../dist/wow-forever-paladin-build/index.html', import.meta.url)

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
    <p><a href="/paladin">Open the WoW Forever Paladin Talent Calculator</a></p>
  </article>
</main>`

const template = await readFile(outputPath, 'utf8')
if (!template.includes('<!-- GUIDE_PRERENDER -->')) {
  throw new Error('Guide prerender marker was not found in the built HTML.')
}
await writeFile(outputPath, template.replace('<!-- GUIDE_PRERENDER -->', prerendered))
console.log(`Prerendered guide with ${words} words.`)

const build = JSON.parse(await readFile(buildPath, 'utf8'))
const buildWords = [build.title, build.dek, ...build.sections.flatMap((section) => [section.heading, ...section.paragraphs])]
  .join(' ')
  .match(/[A-Za-z0-9’'-]+/g)?.length ?? 0

if (buildWords < 450 || buildWords > 750) {
  throw new Error(`Build page must contain 450–750 words; found ${buildWords}.`)
}

const buildSections = build.sections.map((section) => `
  <section id="${escapeHtml(section.id)}">
    <h2>${escapeHtml(section.heading)}</h2>
    ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n    ')}
  </section>`).join('\n')

const buildPrerendered = `<main class="build-page build-prerender">
  <article>
    <p>${escapeHtml(build.eyebrow)}</p>
    <h1>${escapeHtml(build.title)}</h1>
    <p>${escapeHtml(build.dek)}</p>
    <p><strong>Talent allocation: 31/20/0 — 31 Holy, 20 Protection, 0 Retribution.</strong></p>
    <h2>Selected talents</h2>
    <ul>${build.selectedTalents.map((talent) => `<li>${escapeHtml(talent)}</li>`).join('')}</ul>
    ${buildSections}
    <p><a href="${escapeHtml(build.plannerPath)}">Open and edit this WoW Forever Paladin build</a></p>
  </article>
</main>`

const buildTemplate = await readFile(buildOutputPath, 'utf8')
if (!buildTemplate.includes('<!-- BUILD_PRERENDER -->')) {
  throw new Error('Build prerender marker was not found in the built HTML.')
}
await writeFile(buildOutputPath, buildTemplate.replace('<!-- BUILD_PRERENDER -->', buildPrerendered))
console.log(`Prerendered build page with ${buildWords} words.`)
