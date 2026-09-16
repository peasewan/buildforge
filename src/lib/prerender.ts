import { BUILD_LANDING_PAGES, type BuildLandingPageId, type LandingSection } from '../data/buildLandingPages'
import { HUB_INTRO, HUB_INTRO_SUB, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TITLE } from '../data/paladinBuildsHub'
import { PROTECTION_HUB_BUILD_TYPES, PROTECTION_HUB_INTRO, PROTECTION_HUB_RELATED, PROTECTION_HUB_TITLE } from '../data/protectionBuildsHub'

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const link = (href: string, label: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`

const linkList = (links: { href: string; label: string }[]) =>
  `<ul>${links.map(({ href, label }) => `<li>${link(href, label)}</li>`).join('')}</ul>`

/**
 * Renders a landing page section as static HTML. Every branch reads from the same
 * `LandingSection` the React page renders, so the two cannot describe different content.
 */
function landingSection(section: LandingSection): string {
  const heading = `<h2>${escapeHtml(section.title)}</h2>`

  if (section.kind === 'bullets') {
    return `<section>${heading}<p>${escapeHtml(section.intro)}</p><ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
  }

  if (section.kind === 'talent-preview') {
    return `<section>${heading}<p>${escapeHtml(section.intro)}</p><p>The interactive talent tree on this page requires JavaScript. ${link('/paladin#calculator', 'Open the Paladin Talent Calculator')} to inspect the same allocation.</p></section>`
  }

  if (section.kind === 'related') {
    return `<section>${heading}${linkList(section.items.map((item) => ({ href: item.href, label: `${item.title} — ${item.body}` })))}</section>`
  }

  const items = section.items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.body)}</li>`).join('')
  return `<section>${heading}${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''}<ul>${items}</ul></section>`
}

const pageFooterLinks = [
  { href: '/paladin', label: 'Open the WoW Forever Paladin Talent Calculator' },
  { href: '/wow-forever-paladin-builds', label: 'Explore all WoW Forever Paladin builds' },
]

export function renderLandingPrerender(pageId: BuildLandingPageId): string {
  const page = BUILD_LANDING_PAGES.find((candidate) => candidate.id === pageId) ?? BUILD_LANDING_PAGES[0]
  const summary = page.summary.map((item) => `<li>${escapeHtml(item.label)}: ${escapeHtml(item.value)}</li>`).join('')
  const sections = page.sections.map(landingSection).join('\n  ')

  return `<main class="landing-prerender">
  <article>
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.subtitle)}</p>
    <ul>${summary}</ul>
  </article>
  ${sections}
  ${linkList(pageFooterLinks)}
</main>`
}

export function renderHubPrerender(): string {
  const specializations = HUB_SPECIALIZATIONS.map((spec) => ({ href: spec.href, label: `${spec.name} — ${spec.role}` }))
  const sections = HUB_PLAYSTYLE_SECTIONS.map((section) =>
    `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.intro)}</p>${linkList(
      section.builds.map((build) => ({ href: build.href, label: `${build.title} — ${build.description}` })),
    )}</section>`,
  ).join('\n  ')

  return `<main class="hub-prerender">
  <article>
    <h1>${escapeHtml(HUB_TITLE)}</h1>
    <p>${escapeHtml(HUB_INTRO)} ${escapeHtml(HUB_INTRO_SUB)}</p>
  </article>
  <section><h2>Choose Your Paladin Specialization</h2>${linkList(specializations)}</section>
  ${sections}
  ${linkList([...pageFooterLinks, { href: '/wow-forever-paladin-talents', label: 'Read the WoW Forever Paladin talent guide' }])}
</main>`
}

export function renderProtectionHubPrerender(): string {
  const buildTypes = PROTECTION_HUB_BUILD_TYPES.map((build) => ({ href: build.href, label: `${build.title} — ${build.description}` }))
  const related = PROTECTION_HUB_RELATED.map(({ href, label }) => ({ href, label }))

  return `<main class="hub-prerender">
  <article>
    <h1>${escapeHtml(PROTECTION_HUB_TITLE)}</h1>
    <p>${escapeHtml(PROTECTION_HUB_INTRO)}</p>
  </article>
  <section><h2>Protection Build Types</h2>${linkList(buildTypes)}</section>
  <section><h2>More Paladin Builds</h2>${linkList(related)}</section>
</main>`
}
