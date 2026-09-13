import { readFile, writeFile } from 'node:fs/promises'

const guidePath = new URL('../src/content/paladin-guide.json', import.meta.url)
const outputPath = new URL('../dist/wow-forever-paladin-talents/index.html', import.meta.url)

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
