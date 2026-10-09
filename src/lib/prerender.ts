import { paladinLevelingHref } from '../data/paladinLevelingProgression'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import PaladinLevelingTimeline from '../PaladinLevelingTimeline'
import ProtectionRouteEvidence from '../ProtectionRouteEvidence'
import BetaDataStatus from '../BetaDataStatus'
import PaladinRankAttribution from '../PaladinRankAttribution'
import type { Branch } from './build'
import { escapeHtml } from './html'
import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassTalent } from './classPage'
import { publishedClassPages, satisfiedRequirements } from './classPage'
import { classBuildPlannerHref, hasRemovedTalentInBuild } from './archivedClassBuild'
import { publishedClassCatalogues } from './classStaticPages'
import { BUILD_LANDING_PAGES, type BuildLandingPageId, type LandingSection } from '../data/buildLandingPages'
import { HUB_INTRO, HUB_INTRO_SUB, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TALENTS, HUB_TITLE } from '../data/paladinBuildsHub'
import { specBuildsHubBySpec } from '../data/specBuildsHubs'
import { specTalentsPageBySpec } from '../data/specTalentsPages'
import { trustPageById, type TrustPageId } from '../data/trustPages'
import { PALADIN_BETA_STATUS } from '../data/betaStatus'
import { betaAvailabilityFor } from '../data/betaAvailability'
import { EMBERVILLE_EDITORIAL, EMBERVILLE_PAGES, EMBERVILLE_SOURCES, EMBERVILLE_STATUS, embervillePageById, type EmbervillePageId } from '../data/emberville'
import { BETA_LEVEL_CAP_SOURCE, betaLevelingPlannerHref, betaLevelingSnapshot, type BetaLevelingPageId } from '../data/levelingBeta'
import { betaSpecPath, betaSpecPlannerHref } from '../data/betaSpecPaths'
import { protectionPlannerHref } from '../data/protectionCurrentRoute'
import { BETA_PATCH_REVIEW } from '../data/betaPatchReview'
import { EVIDENCE_STATUS } from '../data/verification'
import { paladinSpellbook } from '../data/paladinSpellbook'
import { OCTOBER_OFFICIAL_SOURCE, OFFICIAL_OCTOBER_CHANGES, officialTalentNotice, type OfficialOctoberClassId } from '../data/officialOctoberChanges'
import type { SpellChange } from '../data/spellbook'

const link = (href: string, label: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`

const linkList = (links: { href: string; label: string }[]) =>
  `<ul>${links.map(({ href, label }) => `<li>${link(href, label)}</li>`).join('')}</ul>`

const spellChangeLabels: Record<SpellChange, string> = {
  same: 'Carried forward',
  changed: 'Changed in Forever',
  new: 'New in Forever',
  was_talent: 'Former talent',
}

export function renderSpellbookPrerender(): string {
  const source = paladinSpellbook.entries[0].sources[0]
  const entries = paladinSpellbook.entries.map((entry) => `<article data-spellbook-entry>
    <h3>${escapeHtml(entry.name)}</h3>
    <p>${escapeHtml(entry.category)} · First learned at Level ${entry.learnedAt} · Maximum rank ${entry.maxRank} · ${escapeHtml(spellChangeLabels[entry.change])}.</p>
  </article>`).join('\n')

  return `<main class="spellbook-prerender">
  <article>
    <p>Beta Paladin Data</p>
    <h1>WoW Forever Paladin Abilities &amp; Spellbook</h1>
    <p>Browse all 45 reviewed WoW Forever Paladin abilities, skills, and spells by specialization and trainer level.</p>
    <p>Beta client ${escapeHtml(paladinSpellbook.clientBuild)} · Reviewed ${escapeHtml(paladinSpellbook.reviewedAt)} · Trainer spell groups.</p>
    <p>This spellbook snapshot remains versioned separately from the separately reviewed 70245 talent tree. It records spell presence, first trainer level, maximum rank, and change state.</p>
    <p>The official Beta cap rose to Level ${PALADIN_BETA_STATUS.levelCap} on October 1. Level filters use this older client snapshot; current spell availability requires a newer review. ${link(PALADIN_BETA_STATUS.levelCapSource, 'Blizzard October 1 notes')}.</p>
  </article>
  <section><h2>Paladin spellbook entries</h2>${entries}</section>
  <section><h2>Data source and verification</h2><p>The snapshot comes from reviewed Beta client data. Exact rank tooltips are published only when the source record contains them.</p><p>${link(source.url, source.label)}</p></section>
  <section><h2>Related Paladin tools</h2>${linkList([
    { href: '/paladin#calculator', label: 'Open the Paladin Talent Calculator' },
    { href: '/wow-forever-paladin-builds', label: 'Explore Paladin builds' },
    { href: '/wow-forever-paladin-talents', label: 'Review Paladin talent trees' },
    { href: '/wow-forever-paladin-beta-talent-changes', label: 'Track Beta talent changes' },
    { href: '/about', label: 'About BuildForgeTools' },
    { href: '/contact', label: 'Contact BuildForgeTools' },
    { href: '/privacy', label: 'BuildForgeTools Privacy Policy' },
  ])}</section>
</main>`
}

export function renderEmbervillePrerender(pageId: EmbervillePageId): string {
  const page = embervillePageById(pageId)
  const related = EMBERVILLE_PAGES.filter((item) => item.id !== pageId).map((item) => ({ href: `/${item.slug}`, label: item.title }))
  const pageCopy: Record<EmbervillePageId, string> = {
    planner: '<h2>Plan with confirmed systems</h2><p>Choose a melee, magic, ranged, or hybrid combat direction. Compare planning directions, then select reviewed class and weapon names while leaving unverified compatibility open.</p>',
    classes: '<h2>What we know before Early Access</h2><p>Emberville has a combat class system, classes can be changed, and learned classes can contribute active and passive skills. Exact class records remain in review.</p>',
    inheritance: '<h2>How skill inheritance shapes a build</h2><p>Learn another class, inherit confirmed active or passive skills, and use those options to shape a build direction. Slot limits, costs, and compatibility rules remain under review.</p>',
  }
  const editorial = EMBERVILLE_EDITORIAL[pageId].map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</section>`).join('')
  return `<main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><p>${escapeHtml(EMBERVILLE_STATUS.phase)} · ${escapeHtml(EMBERVILLE_STATUS.scope)} · Updated ${escapeHtml(EMBERVILLE_STATUS.updated)}</p></article><section>${pageCopy[pageId]}</section>${editorial}<section><h2>Official sources</h2>${linkList(EMBERVILLE_SOURCES.map((source) => ({ href: source.href, label: source.label })))}</section><section><h2>Related Emberville tools</h2>${linkList(related)}</section></main>`
}

export function renderBetaStatusPrerender(): string {
  return renderToStaticMarkup(createElement(BetaDataStatus)) + renderToStaticMarkup(createElement(PaladinRankAttribution))
}

export function renderBetaAvailabilityPrerender(branch: Branch): string {
  const availability = betaAvailabilityFor(branch)
  return `<section aria-label="Beta level-range check">
    <h2>Beta level-range check</h2>
    <p>Official level cap ${availability.levelCap} · ${availability.availablePoints} points under the one-point-per-level planning assumption.</p>
    <p><strong>${escapeHtml(availability.talent.name)}: ${availability.available ? 'Within level range' : 'Above level range'}.</strong> The reviewed 70245 tree requires ${availability.requiredPoints} talent points and character level ${availability.minimumLevel}.</p>
    <p>Structural fields were checked in 70245; prerequisite rank requirements remain derived assumptions. ${link(PALADIN_BETA_STATUS.levelCapSource, 'Blizzard October 1 notes')}.</p>
  </section>`
}

export function renderBetaLevelingSnapshotPrerender(pageId: BetaLevelingPageId): string {
  if (pageId !== 'protection-leveling') return renderToStaticMarkup(createElement(PaladinLevelingTimeline))
  const snapshot = betaLevelingSnapshot(pageId)
  const archived = snapshot.status === 'archived'
  return `<section aria-label="Beta leveling snapshot">
    <h2>${escapeHtml(snapshot.title)}</h2>
    ${archived ? `<p>${escapeHtml(snapshot.archiveNotice ?? '')} ${link(BETA_PATCH_REVIEW.officialSource, 'Blizzard September 24 removal notice')}.</p>` : ''}
    <h3>${archived ? 'Archived Level 20 route' : 'Level 20 starting route'}</h3>
    <p><strong>Level ${snapshot.current.level} · ${snapshot.current.points} points · ${escapeHtml(snapshot.current.allocation)}</strong></p>
    <p>${escapeHtml(snapshot.current.note)} ${link(betaLevelingPlannerHref(pageId), archived ? 'Open Calculator without this route' : 'Open Level 20 start in Calculator')}.</p>
    <p>${archived ? 'Historical 69913 snapshot.' : 'Selected Protection node records checked in client 70170; the complete calculator now uses reviewed 70245 structure.'}</p>
    <h3>Official Level 30 cap · ${snapshot.next.build ? 'Editorial Protection route' : 'Route pending review'}</h3>
    <p><strong>Official cap: Level ${snapshot.next.level} · ${escapeHtml(snapshot.next.allocation ?? 'No reviewed allocation')}</strong></p>
    <p>${escapeHtml(snapshot.next.note)}</p>
    <p>A ${snapshot.next.points}-point budget follows standard one-point-per-level planning without Legacy: Talented; the route is editorial, not a tested best build.</p>
    ${snapshot.next.build ? `<p>${link(protectionPlannerHref(30), 'Open Level 30 Protection route in Calculator')}</p>` : ''}
    <ul>${snapshot.milestones.map((milestone) => `<li>${escapeHtml(milestone)}</li>`).join('')}</ul>
    <p>${link(BETA_LEVEL_CAP_SOURCE.href, 'Official level-cap source')} · ${link(snapshot.recommendationSource.href, archived ? 'Recommendation source' : 'Protection client node source')}</p>
    ${pageId === 'protection-leveling' && !archived ? renderToStaticMarkup(createElement(ProtectionRouteEvidence)) : ''}
  </section>`
}

export function renderBetaSpecPathPrerender(branch: Branch): string {
  const path = betaSpecPath(branch)
  const archived = path.status === 'archived'
  return `<section aria-label="${archived ? 'Archived Beta talent path' : 'Beta talent starting path'}">
    <h2>${escapeHtml(path.title)}</h2>
    ${archived ? `<p>${escapeHtml(path.archiveNotice ?? '')} ${link(BETA_PATCH_REVIEW.officialSource, 'Blizzard September 24 removal notice')}.</p>` : ''}
    <p>Best for: ${path.bestFor.map(escapeHtml).join(' · ')}.</p>
    <h3>${archived ? 'Archived Level 20 route' : 'Level 20 starting route'}</h3>
    <p><strong>Level ${path.current.level} · ${path.current.points} points · ${escapeHtml(path.current.allocation)}</strong></p>
    <p>${archived ? 'Historical community recommendation; not playable after the September 24 talent removal.' : branch === 'protection' ? 'BuildForgeTools editorial point order; not performance tested.' : 'Community recommendation.'}</p>
    <ol>${path.current.steps.map((step) => `<li><strong>${escapeHtml(step.levels)}:</strong> ${escapeHtml(step.talent)}</li>`).join('')}</ol>
    <p>${link(betaSpecPlannerHref(branch), archived ? 'Open Calculator without this route' : `Load the Level ${path.current.level} path in the Calculator`)}.</p>
    <h3>Official Level 30 cap · ${path.next.build ? (branch === 'protection' ? 'Editorial Protection route' : 'Community Ret route') : 'Route pending review'}</h3>
    <p><strong>Official cap: Level ${path.next.level} · ${escapeHtml(path.next.allocation ?? 'No reviewed allocation')}</strong></p>
    <p>${escapeHtml(path.next.note)}</p>
    <p>A ${path.next.points}-point budget follows standard one-point-per-level planning without Legacy: Talented; it is not a measured best build.</p>
    ${branch === 'protection' && path.next.build ? `<p>${link(protectionPlannerHref(30), 'Load Level 30 Protection route')}</p>` : ''}
    ${branch === 'retribution' && path.next.build ? `<p>${link(paladinLevelingHref(30), 'Load Level 30 Ret route')}</p>` : ''}
    <p>${branch === 'protection' && !archived ? 'Selected Protection node IDs, ranks, and positions · client 1.60.1.70170. Complete calculator structure is reviewed through 70245.' : `${archived ? 'Historical' : escapeHtml(EVIDENCE_STATUS.client_verified.label)} talent names, ranks, and positions · Build ${escapeHtml(PALADIN_BETA_STATUS.build)}.`}</p>
    <p>${link(BETA_LEVEL_CAP_SOURCE.href, 'Official level-cap source')} · ${link(path.recommendationSource.href, branch === 'protection' && !archived ? 'Protection client node source' : 'Recommendation source')}</p>
    ${branch === 'protection' && !archived ? renderToStaticMarkup(createElement(ProtectionRouteEvidence)) : ''}
  </section>`
}

/**
 * Renders a landing page section as static HTML. Every branch reads from the same
 * `LandingSection` the React page renders, so the two cannot describe different content.
 */
function landingSection(section: LandingSection): string {
  const heading = `<h2>${escapeHtml(section.title)}</h2>`

  if (section.kind === 'copy') {
    return `<section>${heading}${section.intro ? `<p>${escapeHtml(section.intro)}</p>` : ''}${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`
  }

  if (section.kind === 'bullets') {
    return `<section>${heading}<p>${escapeHtml(section.intro)}</p><ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
  }

  if (section.kind === 'talent-preview') {
    return `<section>${heading}<p>${escapeHtml(section.intro)}</p><p>The interactive talent tree on this page requires JavaScript. ${link('/paladin#calculator', 'Open a blank Paladin Talent Calculator')} to plan a new route; this link does not load the historical preview allocation.</p></section>`
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

/**
 * The one discovery link each published class contributes to the existing surfaces: the catalogue
 * its gate publishes. Derived rather than written, so a class that cannot back a catalogue carries
 * no link, a new class carries one with no edit here, and nothing points at a withheld page.
 */
const classDiscoveryLinks = publishedClassCatalogues().map(({ classDef, page }) => ({
  href: `/${page.slug}`,
  label: `Explore WoW Forever ${classDef.name} talents`,
}))

const pageFooterLinks = [
  { href: '/paladin', label: 'Open the WoW Forever Paladin Talent Calculator' },
  { href: '/wow-forever-paladin-builds', label: 'Explore all WoW Forever Paladin builds' },
  ...classDiscoveryLinks,
  { href: '/about', label: 'About BuildForgeTools' },
  { href: '/contact', label: 'Contact BuildForgeTools' },
  { href: '/privacy', label: 'BuildForgeTools Privacy Policy' },
]

export function renderLandingPrerender(pageId: BuildLandingPageId): string {
  const page = BUILD_LANDING_PAGES.find((candidate) => candidate.id === pageId) ?? BUILD_LANDING_PAGES[0]
  const summary = page.summary.map((item) => `<li>${escapeHtml(item.label)}: ${escapeHtml(item.value)}</li>`).join('')
  const sections = page.sections.map(landingSection).join('\n  ')
  const levelingSnapshot = pageId === 'leveling' || pageId === 'protection-leveling'
    ? renderBetaLevelingSnapshotPrerender(pageId)
    : ''

  return `<main class="landing-prerender">
  <article>
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.subtitle)}</p>
    <ul>${summary}</ul>
  </article>
  ${renderBetaStatusPrerender()}
  ${levelingSnapshot}
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
  ${renderBetaStatusPrerender()}
  <section><h2>Choose Your Paladin Specialization</h2>${linkList(specializations)}</section>
  ${sections}
  ${linkList([...pageFooterLinks, HUB_TALENTS, { href: '/wow-forever-paladin-abilities', label: 'Browse 45 WoW Forever Paladin abilities' }, { href: '/wow-forever-paladin-beta-talent-changes', label: 'Track WoW Forever Paladin Beta talent changes' }])}
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
  ${renderBetaStatusPrerender()}
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
  ${renderBetaStatusPrerender()}
  ${spec === 'protection' ? (() => {
    const snapshot = betaLevelingSnapshot('protection-leveling')
    return `<section aria-label="Current Beta Protection starting route"><h2>Level ${snapshot.current.level} Protection route</h2><p>${escapeHtml(snapshot.current.note)}</p><p>Editorial standard-progression route · ${snapshot.current.points} points at Level ${snapshot.current.level} · ${escapeHtml(snapshot.current.allocation)}. Selected node records were checked in client 70170; the complete calculator now uses reviewed 70245 structure.</p><p>${link(betaLevelingPlannerHref('protection-leveling'), 'Load Level 20 Protection route')} · ${link(protectionPlannerHref(30), 'Load Level 30 Protection route')} · ${link('/wow-forever-protection-paladin-leveling-build', 'See the level-by-level route')}</p></section>`
  })() : ''}
  <section><h2>${label} Build Types</h2>${linkList(buildTypes)}</section>
  ${hub.editorialSections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('\n  ')}
  <section><h2>${label} Paladin Talents</h2>${linkList(hub.talents)}</section>
  <section><h2>More Paladin Builds</h2>${linkList(hub.related)}</section>
  ${linkList(pageFooterLinks)}
</main>`
}

export function renderTrustPrerender(pageId: TrustPageId): string {
  const page = trustPageById(pageId)

  return `<main class="trust-prerender">
  <article>
    <p>${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.title)}</h1>
    <p>${escapeHtml(page.intro)}</p>
    <p>Last updated: ${escapeHtml(page.updated)}</p>
  </article>
  ${page.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}${section.links ? linkList(section.links) : ''}</section>`).join('\n  ')}
  ${linkList([{ href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }, { href: '/privacy', label: 'Privacy' }, ...pageFooterLinks])}
</main>`
}

/** Talents a build actually spends, in the order the build record lists them. */
function orderedBuildTalents<B extends string>(build: ClassBuild, classDef: ClassDefinition<B>): { talent: ClassTalent<B>; rank: number }[] {
  const spent = Object.entries(build.build).filter(([, rank]) => rank > 0).map(([talentId]) => talentId)
  const ordered = [...build.order.filter((talentId) => spent.includes(talentId)), ...spent.filter((talentId) => !build.order.includes(talentId))]
  return ordered.flatMap((talentId) => {
    const talent = classDef.talents.find((candidate) => candidate.id === talentId)
    return talent ? [{ talent, rank: build.build[talentId] ?? 0 }] : []
  })
}

const classPageFooterLinks = [
  { href: '/about', label: 'About BuildForgeTools' },
  { href: '/contact', label: 'Contact BuildForgeTools' },
  { href: '/privacy', label: 'BuildForgeTools Privacy Policy' },
]

function renderClassOfficialUpdate(classDef: ClassDefinition): string {
  const change = OFFICIAL_OCTOBER_CHANGES[classDef.id as OfficialOctoberClassId]
  if (!change) return ''
  const sources = [link(OCTOBER_OFFICIAL_SOURCE, 'Blizzard October 1 Beta development notes')]
  if ('additionalSource' in change) sources.push(link(change.additionalSource, 'October 2 Warrior follow-up'))

  return `<section aria-label="${escapeHtml(classDef.name)} official changes"><h2>${escapeHtml(classDef.name)} official changes</h2>
    <p>${classDef.dataReview?.current ? `Reviewed talent structure through ${escapeHtml(classDef.verifiedBuild)}. The current Beta cap is Level 30; ordinary editorial routes spend 21 points, and the retained Level 20 page uses separate 11-point stages. Licensed rank text is community verified, while point-order rules remain derived assumptions.` : `The live Beta cap is Level 30. This page presents the older ${escapeHtml(classDef.verifiedBuild)} talent tree; Level 20 routes are 11-point starting snapshots, not reviewed Level 30 allocations. Later official changes have not been fully imported into this tree.`}</p>
    <p>Official sources: ${sources.join(' · ')}.</p>
    <ul>${change.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
  </section>`
}

/**
 * Static HTML for one class page, rendered from the `ClassDefinition` and its own page record.
 *
 * Everything the page can link to is filtered through the same requirement gate the routes use:
 * a withheld page is absent rather than linked, and the class calculator is linked only by a class
 * that satisfies `completeClassPlanner` — the withheld path falls through to another class's
 * calculator, so the link would point at the wrong tool, not merely at a missing page.
 */
export function renderClassPage<B extends string>(classDef: ClassDefinition<B>, page: ClassPageDefinition): string {
  const plannerPublished = satisfiedRequirements(classDef).has('completeClassPlanner')
  const publishedSlugs = new Set(publishedClassPages([classDef]).map((entry) => entry.page.slug))
  const isPublished = (href: string) => publishedSlugs.has(href.replace(/^\//, '').split(/[?#]/)[0])
  const primaryBuild = page.primaryBuildId ? classDef.builds.find((build) => build.id === page.primaryBuildId) : undefined
  const relatedBuilds = page.relatedBuildIds.flatMap((id) => classDef.builds.filter((build) => build.id === id)).filter((build) => isPublished(build.href))
  const relatedPages = page.relatedPages.filter((related) => isPublished(related.href))
  const archivedBuild = primaryBuild ? hasRemovedTalentInBuild(classDef, primaryBuild) : false
  const calculatorLink = primaryBuild
    ? link(classBuildPlannerHref(classDef, primaryBuild), archivedBuild ? 'Open blank Calculator — historical route' : `Inspect Level ${primaryBuild.level} route in Calculator`)
    : link(classDef.plannerPath, `Open the ${classDef.name} Talent Calculator`)
  const buildEvidence = primaryBuild
    ? `<p><strong>Build</strong>: Community / Editorial Level ${primaryBuild.level} snapshot. The official Beta cap is now Level ${PALADIN_BETA_STATUS.levelCap} (${link(PALADIN_BETA_STATUS.levelCapSource, 'Blizzard October 1 notes')}). Allocations are editorial, never client facts.${archivedBuild ? ' This historical route includes an officially removed talent; the calculator opens blank.' : ''}</p>`
    : page.kind === 'specPvp'
      ? '<p><strong>Build status</strong>: Pending verification. This page does not publish an allocation until one has been reviewed.</p>'
      : '<p><strong>Build links</strong>: Editorial routes are labeled separately from client talent facts.</p>'

  const rankLabel = (talent: ClassTalent<B>) => `${talent.maxRank} rank${talent.maxRank === 1 ? '' : 's'}`
  const officialTalentLabel = (talent: ClassTalent<B>) => {
    const notice = officialTalentNotice(classDef.id, talent.name)
    if (!notice || classDef.dataReview?.current) return ''
    return ` · <strong>69913 historical record — ${notice.status === 'removed' ? 'Removed' : 'Changed'} in official update.</strong> ${escapeHtml(notice.message)} ${link(notice.source, 'Official update')}`
  }
  const officialTalentAttribute = (talent: ClassTalent<B>) => {
    const notice = officialTalentNotice(classDef.id, talent.name)
    return notice ? ` data-official-status="${notice.status}"` : ''
  }

  // The calculator has no build of its own: it has to carry the whole dataset instead, so a
  // crawler sees every published node the planner offers.
  const calculatorTrees = page.kind === 'calculator'
    ? classDef.branches.map((branch) => {
      const talents = classDef.talents.filter((talent) => talent.branch === branch)
      return `<section><h2>${escapeHtml(classDef.branchNames[branch])} ${escapeHtml(classDef.name)} Talents</h2><p>${escapeHtml(classDef.branchTaglines[branch])}</p><ul>${talents.map((talent) => `<li data-class-talent="${escapeHtml(talent.id)}"${officialTalentAttribute(talent)}><strong>${escapeHtml(talent.name)}</strong> — ${rankLabel(talent)} · Row ${talent.row} column ${talent.column}${officialTalentLabel(talent)}</li>`).join('')}</ul></section>`
    }).join('\n  ')
    : ''

  const catalogueBranches = page.kind === 'talents'
    ? classDef.branches
    : page.kind === 'specTalents' && page.spec
      ? classDef.branches.filter((branch) => branch === page.spec)
      : []
  const talentCatalogue = catalogueBranches.map((branch) => {
    const talents = classDef.talents.filter((talent) => talent.branch === branch)
    return `<section data-class-catalogue="${escapeHtml(branch)}"><h2>${escapeHtml(classDef.branchNames[branch])} ${escapeHtml(classDef.name)} talent catalogue</h2><p>${escapeHtml(classDef.branchTaglines[branch])}</p><ul>${talents.map((talent) => `<li data-class-talent="${escapeHtml(talent.id)}"${officialTalentAttribute(talent)}><strong>${escapeHtml(talent.name)}</strong> — ${rankLabel(talent)} · Row ${talent.row} column ${talent.column} · ${escapeHtml(talent.changeStatus)}${officialTalentLabel(talent)}</li>`).join('')}</ul></section>`
  }).join('\n  ')

  const primaryBuildSection = primaryBuild
    ? `<section><h2>${escapeHtml(primaryBuild.title)}</h2><p><strong>${escapeHtml(primaryBuild.allocation)}</strong> · ${primaryBuild.points} / ${primaryBuild.levelCap} points · ${escapeHtml(primaryBuild.phase)}</p><p>${escapeHtml(primaryBuild.role)}</p>${primaryBuild.playstyle.length > 0 ? `<ul>${primaryBuild.playstyle.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}<h3>Talents in this build</h3><ul>${orderedBuildTalents(primaryBuild, classDef).map(({ talent, rank }) => `<li${officialTalentAttribute(talent)}><strong>${escapeHtml(talent.name)}</strong> — ${rank}/${talent.maxRank}${officialTalentLabel(talent)}</li>`).join('')}</ul><p>Community / Editorial Build · ${escapeHtml(primaryBuild.evidence === 'community_verified' ? 'Community-verified recommendation.' : 'Derived planning assumption.')} Talent positions and ranks remain client data; this allocation is editorial only.</p></section>`
    : ''

  const relatedBuildSection = relatedBuilds.length > 0
    ? `<section><h2>Related ${escapeHtml(classDef.name)} builds</h2>${relatedBuilds.map((build) => `<article><h3>${link(build.href, build.title)}</h3><p>${escapeHtml(build.role)} · Level ${build.level} · ${escapeHtml(build.allocation)}</p></article>`).join('')}</section>`
    : ''

  const comparisonSection = page.comparison
    ? `<section><h2>${escapeHtml(page.h1)} comparison</h2><table><thead><tr><th scope="col">${escapeHtml(page.h1)}</th>${page.comparison.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${page.comparison.rows.map((row) => `<tr><th scope="row">${escapeHtml(row.label)}</th>${row.values.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>`
    : ''

  const faqSection = page.faqs.length > 0
    ? `<section><h2>Frequently asked questions</h2>${page.faqs.map((faq) => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join('')}</section>`
    : ''

  const navLinks = classDef.pages
    .filter((candidate) => isPublished(`/${candidate.slug}`) && (candidate.kind === 'talents' || candidate.kind === 'calculator'))
    .map((candidate) => ({ href: `/${candidate.slug}`, label: candidate.h1 }))

  return `<main class="class-prerender">
  <article>
    <nav aria-label="Breadcrumb">${link('/', 'BuildForgeTools')} / ${link(classDef.plannerPath, classDef.name)} / <span aria-current="page">${escapeHtml(page.h1)}</span></nav>
    <p>${escapeHtml(page.eyebrow)} · ${escapeHtml(classDef.beta.phaseLabel)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.description)}</p>
    <p>Reviewed ${escapeHtml(page.updatedAt)} · Client build ${escapeHtml(classDef.verifiedBuild)}.</p>
  </article>
  ${renderClassOfficialUpdate(classDef)}
  <section><h2>Evidence boundary</h2><p><strong>Talent data</strong>: positions, ranks and branches are client-derived records checked through ${escapeHtml(classDef.verifiedBuild)}; planner-legal fields only.</p>${buildEvidence}</section>
  ${classDef.dataReview ? `<section><h2>Client data and build assumptions</h2><p>${escapeHtml(classDef.dataReview.notice)}</p>${linkList(classDef.sources.map((source) => ({ href: source.url, label: source.label })))}</section>` : ''}
  ${calculatorTrees}
  ${talentCatalogue}
  ${primaryBuildSection}
  ${relatedBuildSection}
  ${page.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}</section>`).join('\n  ')}
  ${comparisonSection}
  ${faqSection}
  ${relatedPages.length > 0 ? `<section><h2>Related ${escapeHtml(classDef.name)} pages</h2>${linkList(relatedPages)}</section>` : ''}
  ${plannerPublished ? `<p>${calculatorLink}</p>` : ''}
  ${linkList([...navLinks, ...classPageFooterLinks])}
</main>`
}
