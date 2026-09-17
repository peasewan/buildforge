import type { Branch } from './build'
import { escapeHtml } from './html'
import { BUILD_LANDING_PAGES, type BuildLandingPageId, type LandingSection } from '../data/buildLandingPages'
import { HUB_INTRO, HUB_INTRO_SUB, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TALENTS, HUB_TITLE } from '../data/paladinBuildsHub'
import { specBuildsHubBySpec } from '../data/specBuildsHubs'
import { specTalentsPageBySpec } from '../data/specTalentsPages'

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

  const items = section.kind === 'cards'
    ? section.items.map((item) => {
      const body = escapeHtml(item.body)
      return `<li>${item.href ? `${link(item.href, item.title)} ${body}` : `<strong>${escapeHtml(item.title)}</strong> ${body}`}</li>`
    }).join('')
    : section.items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.body)}</li>`).join('')
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
  ${linkList([...pageFooterLinks, HUB_TALENTS, { href: '/wow-forever-paladin-beta-talent-changes', label: 'Track WoW Forever Paladin Beta talent changes' }])}
</main>`
}

export function renderSpecTalentsPrerender(spec: Branch): string {
  const page = specTalentsPageBySpec(spec)

  return `<main class="spec-talents-prerender">
  <article>
    <p>${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.intro)}</p>
    <p><strong>${escapeHtml(page.allocation.label)}: ${escapeHtml(page.allocation.value)}</strong> — ${escapeHtml(page.allocation.note)}</p>
  </article>
  ${page.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('\n  ')}
  ${linkList([...page.nav.filter((item) => !item.href.startsWith('#')), ...pageFooterLinks])}
</main>`
}

export function renderSpecHubPrerender(spec: Branch): string {
  const hub = specBuildsHubBySpec(spec)
  const label = spec.charAt(0).toUpperCase() + spec.slice(1)
  const buildTypes = hub.buildTypes.map((build) => ({ href: build.href, label: `${build.title} — ${build.description}` }))

  return `<main class="hub-prerender">
  <article>
    <h1>${escapeHtml(hub.title)}</h1>
    <p>${escapeHtml(hub.intro)}</p>
  </article>
  <section><h2>${label} Build Types</h2>${linkList(buildTypes)}</section>
  <section><h2>${label} Paladin Talents</h2>${linkList(hub.talents)}</section>
  <section><h2>More Paladin Builds</h2>${linkList(hub.related)}</section>
</main>`
}
