import type { Branch } from './build'
import { escapeHtml } from './html'
import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassTalent } from './classPage'
import { classPlannerHref, publishedClassPages, satisfiedRequirements } from './classPage'
import { publishedClassCatalogues } from './classStaticPages'
import { encodePlannerBuild } from './talentPlanner'
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
import { EVIDENCE_STATUS } from '../data/verification'
import { paladinSpellbook } from '../data/paladinSpellbook'
import type { SpellChange } from '../data/spellbook'
import { warriorTalents, warriorBranchNames, WARRIOR_BRANCHES } from '../data/warriorTalents'
import { WARRIOR_BUILD_PAGES, warriorBuildPageById, warriorPlannerHref, type WarriorBuildPageId } from '../data/warriorPages'

const link = (href: string, label: string) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`

const linkList = (links: { href: string; label: string }[]) =>
  `<ul>${links.map(({ href, label }) => `<li>${link(href, label)}</li>`).join('')}</ul>`

const spellChangeLabels: Record<SpellChange, string> = {
  same: 'Carried forward',
  changed: 'Changed in Forever',
  new: 'New in Forever',
  was_talent: 'Former talent',
}

export function renderWarriorPlannerPrerender(): string {
  const trees = WARRIOR_BRANCHES.map((branch) => `<section><h2>${warriorBranchNames[branch]} Warrior Talents</h2><p>${warriorTalents.filter((talent) => talent.branch === branch).length} reviewed nodes in the ${warriorBranchNames[branch]} tree.</p><ul>${warriorTalents.filter((talent) => talent.branch === branch).map((talent) => `<li data-warrior-talent><strong>${escapeHtml(talent.name)}</strong> — ${talent.maxRank} rank${talent.maxRank === 1 ? '' : 's'} · Tier ${talent.row}. ${escapeHtml(talent.description)}</li>`).join('')}</ul></section>`).join('')
  return `<main class="warrior-prerender"><article><p>Beta Build 69913</p><h1>WoW Forever Warrior Talent Calculator</h1><p>Plan Arms, Fury, and Protection talent trees with 53 reviewed nodes, Level 20, Level 30, and full 51-point budgets, rank tooltips, and shareable build links.</p><p>The source talent snapshot was read from Beta client records and cross-checked unchanged through build 1.60.1.69913. Bonus talent points remain excluded until their rules can be verified.</p></article>${trees}<section><h2>Level 20 Warrior Builds</h2>${linkList(WARRIOR_BUILD_PAGES.map((page) => ({ href: `/${page.slug}`, label: page.title })))}</section><section><h2>Data verification</h2><p>Client-derived names, positions, ranks, icons, and descriptions are kept separate from community build recommendations and derived prerequisite-rank behavior.</p><p>${link('https://wowforevertalents.net/warrior/', 'Warrior client-data reference')} · ${link('https://thewowdb.com/wow-forever/talents/warrior/', 'Build 69913 cross-check')}</p></section></main>`
}

export function renderWarriorBuildPrerender(pageId: WarriorBuildPageId): string {
  const page = warriorBuildPageById(pageId)
  const selected = Object.entries(page.preset.build).map(([id, rank]) => {
    const talent = warriorTalents.find((candidate) => candidate.id === id)!
    return `<li>${escapeHtml(talent.name)} — ${rank}/${talent.maxRank}</li>`
  }).join('')
  return `<main class="warrior-prerender"><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.subtitle)}</p><p><strong>Level 20 · ${escapeHtml(page.preset.allocation)} · 11 points · Community recommendation.</strong></p><p>${link(warriorPlannerHref(page.preset), `Open ${page.preset.shortTitle} in the Warrior Talent Calculator`)}</p></article><section><h2>Selected talents</h2><ul>${selected}</ul></section>${page.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')}<section><h2>Verification boundary</h2><p>Talent names, ranks, positions, and tooltip text come from client-derived records checked through 1.60.1.69913. This allocation is an editable community route and is not an official or guaranteed best build.</p>${linkList([{ href: '/wow-forever-warrior-builds', label: 'Explore all Warrior builds' }, { href: '/warrior', label: 'Open the Warrior Talent Calculator' }, { href: '/about', label: 'About BuildForgeTools' }, { href: '/contact', label: 'Contact BuildForgeTools' }, { href: '/privacy', label: 'Privacy Policy' }])}</section></main>`
}

export function renderWarriorHubPrerender(): string {
  return `<main class="warrior-prerender"><article><p>Beta Build 69913</p><h1>WoW Forever Warrior Builds &amp; Talent Calculator</h1><p>Choose a current-cap Arms, Fury, or Protection Warrior build, inspect its 11-point talent order, and customize it in the calculator.</p><p>${link('/warrior', 'Open the Warrior Talent Calculator')}</p></article><section><h2>Level 20 Warrior builds</h2>${WARRIOR_BUILD_PAGES.map((page) => `<article><h3>${link(`/${page.slug}`, page.title)}</h3><p>${escapeHtml(page.subtitle)} ${escapeHtml(page.preset.allocation)}.</p></article>`).join('')}</section><section><h2>How these builds are labeled</h2><p>The talent database is client-derived and reviewed through build 69913. Build allocations are community recommendations designed for testing, with no claim that they are official or universally optimal.</p>${linkList([{ href: '/about', label: 'About BuildForgeTools' }, { href: '/contact', label: 'Report a correction' }, { href: '/privacy', label: 'Privacy Policy' }])}</section></main>`
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
    <p>This spellbook snapshot remains versioned separately from the 69913 talent tree. It records spell presence, first trainer level, maximum rank, and change state.</p>
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
    planner: '<h2>Plan with confirmed systems</h2><p>Choose a melee, magic, ranged, or hybrid combat direction. Class, weapon, and skill records remain locked until reliable identifiers and rules are confirmed.</p>',
    builds: '<h2>Explore build directions</h2><p>Compare melee, magic, ranged, and hybrid planning categories without claiming final balance or a best build.</p>',
    classes: '<h2>What we know before Early Access</h2><p>Emberville has a combat class system, classes can be changed, and learned classes can contribute active and passive skills. Exact class records remain in review.</p>',
    inheritance: '<h2>How skill inheritance shapes a build</h2><p>Learn another class, inherit confirmed active or passive skills, and use those options to shape a build direction. Slot limits, costs, and compatibility rules remain under review.</p>',
  }
  const editorial = EMBERVILLE_EDITORIAL[pageId].map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</section>`).join('')
  return `<main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><p>${escapeHtml(EMBERVILLE_STATUS.phase)} · ${escapeHtml(EMBERVILLE_STATUS.scope)} · Updated ${escapeHtml(EMBERVILLE_STATUS.updated)}</p></article><section>${pageCopy[pageId]}</section>${editorial}<section><h2>Official sources</h2>${linkList(EMBERVILLE_SOURCES.map((source) => ({ href: source.href, label: source.label })))}</section><section><h2>Related Emberville tools</h2>${linkList(related)}</section></main>`
}

export function renderBetaStatusPrerender(): string {
  const status = PALADIN_BETA_STATUS
  return `<section aria-label="WoW Forever Beta data status">
    <h2>Beta build ${escapeHtml(status.build)}</h2>
    <p>Updated ${escapeHtml(status.updated)} · ${status.talentCount} talent nodes · ${status.newTalentCount} new in WoW Forever · ${escapeHtml(status.phaseLabel)} · Level cap ${status.levelCap}.</p>
    <p>${status.added} added · ${status.updatedTalents} updated · ${status.removed} removed in the latest client diff.</p>
    <p>${status.updatedTalents} tooltip updates since ${escapeHtml(status.previousBuild)}. ${link(status.changelogHref, 'Review Beta changes')}.</p>
  </section>`
}

export function renderBetaAvailabilityPrerender(branch: Branch): string {
  const availability = betaAvailabilityFor(branch)
  return `<section aria-label="Current Beta availability">
    <h2>Current Beta availability</h2>
    <p>Level cap ${availability.levelCap} · ${availability.availablePoints} talent points available.</p>
    <p><strong>${escapeHtml(availability.talent.name)}: ${availability.available ? 'Available' : 'Not available'}.</strong> Requires ${availability.requiredPoints} talent points and character level ${availability.minimumLevel}.</p>
    <p>Calculated from the current Beta level cap and the client tree requirement for the first rank.</p>
  </section>`
}

export function renderBetaLevelingSnapshotPrerender(pageId: BetaLevelingPageId): string {
  const snapshot = betaLevelingSnapshot(pageId)
  return `<section aria-label="Beta leveling snapshot">
    <h2>${escapeHtml(snapshot.title)}</h2>
    <h3>Current Beta cap</h3>
    <p><strong>Level ${snapshot.current.level} · ${snapshot.current.points} points · ${escapeHtml(snapshot.current.allocation)}</strong></p>
    <p>${escapeHtml(snapshot.current.note)} ${link(betaLevelingPlannerHref(pageId), 'Open current path in Calculator')}.</p>
    <p>${escapeHtml(EVIDENCE_STATUS.official.label)} level cap · ${escapeHtml(EVIDENCE_STATUS.client_verified.label)} talent data · Build ${escapeHtml(PALADIN_BETA_STATUS.build)}.</p>
    <h3>Level 30 plan</h3>
    <p><strong>Level ${snapshot.next.level} · ${snapshot.next.points} points · ${escapeHtml(snapshot.next.allocation)}</strong></p>
    <p>${escapeHtml(snapshot.next.note)}</p>
    <p>Community recommendation · ${escapeHtml(EVIDENCE_STATUS.derived_assumption.label)} editorial route, reviewed ${escapeHtml(snapshot.recommendationSource.updated)}.</p>
    <ul>${snapshot.milestones.map((milestone) => `<li>${escapeHtml(milestone)}</li>`).join('')}</ul>
    <p>${link(BETA_LEVEL_CAP_SOURCE.href, 'Official level-cap source')} · ${link(snapshot.recommendationSource.href, 'Recommendation source')}</p>
  </section>`
}

export function renderBetaSpecPathPrerender(branch: Branch): string {
  const path = betaSpecPath(branch)
  return `<section aria-label="Current Beta talent path">
    <h2>${escapeHtml(path.title)}</h2>
    <p>Best for: ${path.bestFor.map(escapeHtml).join(' · ')}.</p>
    <h3>Official current cap</h3>
    <p><strong>Level ${path.current.level} · ${path.current.points} points · ${escapeHtml(path.current.allocation)}</strong></p>
    <p>Community recommendation.</p>
    <ol>${path.current.steps.map((step) => `<li><strong>${escapeHtml(step.levels)}:</strong> ${escapeHtml(step.talent)}</li>`).join('')}</ol>
    <p>${link(betaSpecPlannerHref(branch), `Load the Level ${path.current.level} path in the Calculator`)}.</p>
    <h3>Level 30 plan</h3>
    <p><strong>Level ${path.next.level} · ${path.next.points} points · ${escapeHtml(path.next.allocation)}</strong></p>
    <p>${escapeHtml(path.next.note)}</p>
    <p>Future-cap ${escapeHtml(EVIDENCE_STATUS.derived_assumption.label)} community route, reviewed ${escapeHtml(path.recommendationSource.updated)}.</p>
    <p>${escapeHtml(EVIDENCE_STATUS.client_verified.label)} talent names, ranks, and positions · Build ${escapeHtml(PALADIN_BETA_STATUS.build)}.</p>
    <p>${link(BETA_LEVEL_CAP_SOURCE.href, 'Official level-cap source')} · ${link(path.recommendationSource.href, 'Recommendation source')}</p>
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
  const calculatorLink = primaryBuild
    ? link(classPlannerHref(classDef, encodePlannerBuild(primaryBuild.build), primaryBuild.level), 'Edit this build in Calculator')
    : link(classDef.plannerPath, `Open the ${classDef.name} Talent Calculator`)

  const rankLabel = (talent: ClassTalent<B>) => `${talent.maxRank} rank${talent.maxRank === 1 ? '' : 's'}`

  // The calculator has no build of its own: it has to carry the whole dataset instead, so a
  // crawler sees every published node the planner offers.
  const calculatorTrees = page.kind === 'calculator'
    ? classDef.branches.map((branch) => {
      const talents = classDef.talents.filter((talent) => talent.branch === branch)
      return `<section><h2>${escapeHtml(classDef.branchNames[branch])} ${escapeHtml(classDef.name)} Talents</h2><p>${escapeHtml(classDef.branchTaglines[branch])}</p><ul>${talents.map((talent) => `<li data-class-talent="${escapeHtml(talent.id)}"><strong>${escapeHtml(talent.name)}</strong> — ${rankLabel(talent)} · Row ${talent.row} column ${talent.column}</li>`).join('')}</ul></section>`
    }).join('\n  ')
    : ''

  const primaryBuildSection = primaryBuild
    ? `<section><h2>${escapeHtml(primaryBuild.title)}</h2><p><strong>${escapeHtml(primaryBuild.allocation)}</strong> · ${primaryBuild.points} / ${primaryBuild.levelCap} points · ${escapeHtml(primaryBuild.phase)}</p><p>${escapeHtml(primaryBuild.role)}</p>${primaryBuild.playstyle.length > 0 ? `<ul>${primaryBuild.playstyle.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}<h3>Talents in this build</h3><ul>${orderedBuildTalents(primaryBuild, classDef).map(({ talent, rank }) => `<li><strong>${escapeHtml(talent.name)}</strong> — ${rank}/${talent.maxRank}</li>`).join('')}</ul><p>Community / Editorial Build · ${escapeHtml(primaryBuild.evidence === 'community_verified' ? 'Community-verified recommendation.' : 'Derived planning assumption.')} Talent positions and ranks remain client data; this allocation is editorial only.</p></section>`
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
    <p>${escapeHtml(page.eyebrow)} · ${escapeHtml(classDef.beta.phaseLabel)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.description)}</p>
    <p>Reviewed ${escapeHtml(page.updatedAt)} · Client build ${escapeHtml(classDef.verifiedBuild)}.</p>
  </article>
  <section><h2>Evidence boundary</h2><p><strong>Talent data</strong>: positions, ranks and branches are client-derived records checked through ${escapeHtml(classDef.verifiedBuild)}; planner-legal fields only.</p><p><strong>Build</strong>: Community / Editorial build for the current Beta level cap ${classDef.beta.levelCap}. Allocations are editorial, never client facts.</p></section>
  ${calculatorTrees}
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
