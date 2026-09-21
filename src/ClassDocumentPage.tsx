import { useState } from 'react'
import { ArrowRight, Ban, Check, Swords } from 'lucide-react'
import SiteFooter from './SiteFooter'
import VerificationBadge from './VerificationBadge'
import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassTalent } from './lib/classPage'
import { classPlannerHref, publishedClassPages, satisfiedRequirements, unallocatableBranches } from './lib/classPage'
import { encodePlannerBuild, totalPlannerPoints } from './lib/talentPlanner'

type ChangeStatus = ClassTalent<string>['changeStatus']

const intentLabels: Record<string, string> = { leveling: 'Leveling', aoe: 'AoE', pvp: 'PvP', dungeon: 'Dungeon', spec: 'Specialization' }

/**
 * The third evidence state, stated once so every unallocatable branch says the same thing.
 *
 * A published node can be a dual-source client record and still be unspendable: when no node in its
 * branch is at `requiredTreePoints === 0`, nothing in the branch can be the first point spent. That
 * is neither the client-verified chrome (which covers positions and ranks, and is still true here)
 * nor the editorial build chrome (which covers allocations, and none exists here), so it is worded
 * and styled as its own state rather than borrowing either label.
 *
 * The reason names only the condition the renderer derives. *Why* a branch is entryless is class
 * data — a dropped row-1 node, an unimported tier, a branch the sources disagree about — and a
 * constant here would state one class's cause as if it were every class's. The page prose carries
 * that story, authored per class, where it can be true.
 */
const EXCLUSION_LABEL = 'Excluded from build validation'
const EXCLUSION_REASON = 'no node in this branch can be taken first: every published node here sits behind a tree-point requirement'

const changeStatusGroups: { status: ChangeStatus; label: string }[] = [
  { status: 'new', label: 'New in this build' },
  { status: 'changed', label: 'Changed in this build' },
  { status: 'same', label: 'Unchanged from Classic' },
  { status: 'unknown', label: 'Change status unknown' },
]

const kindsListingEveryBuild = ['buildsHub', 'levelCap']
const kindsHandlingTheirOwnBuildLinks = ['buildsHub', 'levelCap', 'pvp']

function buildById<B extends string>(classDef: ClassDefinition<B>, id: string | undefined): ClassBuild | undefined {
  return id ? classDef.builds.find((build) => build.id === id) : undefined
}

function orderedBuildTalents<B extends string>(build: ClassBuild, classDef: ClassDefinition<B>): { talent: ClassTalent<B>; rank: number }[] {
  const spent = Object.entries(build.build).filter(([, rank]) => rank > 0).map(([talentId]) => talentId)
  const ordered = [...build.order.filter((talentId) => spent.includes(talentId)), ...spent.filter((talentId) => !build.order.includes(talentId))]
  return ordered.flatMap((talentId) => {
    const talent = classDef.talents.find((candidate) => candidate.id === talentId)
    return talent ? [{ talent, rank: build.build[talentId] ?? 0 }] : []
  })
}

function calculatorHref<B extends string>(classDef: ClassDefinition<B>, build: ClassBuild | undefined): string {
  if (!build) return classDef.plannerPath
  return classPlannerHref(classDef, encodePlannerBuild(build.build), build.level)
}

/**
 * The class calculator is a page like any other: it renders only when the class satisfies
 * `completeClassPlanner`. A class whose planner is withheld must not link `plannerPath` at all —
 * that path falls through to another class's calculator, so the link would be wrong, not just
 * unavailable. Derived from the gate, so publishing the planner brings the CTA back with no edit.
 */
function hasPublishedPlanner<B extends string>(classDef: ClassDefinition<B>): boolean {
  return satisfiedRequirements(classDef).has('completeClassPlanner')
}

function BuildChip() {
  return <span className="class-build-chip">Community / Editorial Build</span>
}

function TalentEvidence() {
  // The badge covers planner-legal fields only (spec UI block): row, column and maxRank are
  // `client_verified` on every published node, while `rankDescriptions` evidence is `unknown`
  // on 17 of the 30 Mage nodes. Naming tooltips here would claim evidence the dataset lacks.
  return <p className="class-evidence-line"><span>Talent data</span><VerificationBadge status="client_verified" /><small>positions and ranks only</small></p>
}

function BuildGroups<B extends string>({ classDef, isPublishedHref }: { classDef: ClassDefinition<B>; isPublishedHref: (href: string) => boolean }) {
  const intents = [...new Set(classDef.builds.map((build) => build.intent))]
  return <section className="class-build-groups">
    <h2>{classDef.name} builds</h2>
    {intents.map((intent) => <div key={intent}>
      <h3>{intentLabels[intent] ?? intent}</h3>
      {classDef.builds.filter((build) => build.intent === intent).map((build) => <article key={build.id}>
        {isPublishedHref(build.href) ? <a href={build.href}>{build.title}</a> : <strong>{build.title}</strong>}
        <p>{build.role} · Level {build.level} · {build.phase}</p>
        <p>{build.allocation} · {totalPlannerPoints(build.build)} / {build.levelCap} points</p>
        {build.strengths.length > 0 && <ul>{build.strengths.map((strength) => <li key={strength}><Check size={14} /> <span>{strength}</span></li>)}</ul>}
        <BuildChip />
      </article>)}
    </div>)}
  </section>
}

function PvpTabs<B extends string>({ classDef, plannerPublished }: { classDef: ClassDefinition<B>; plannerPublished: boolean }) {
  const pvpBuilds = classDef.builds.filter((build) => build.intent === 'pvp')
  const specs = classDef.branches.filter((branch) => pvpBuilds.some((build) => build.spec === branch))
  const [activeSpec, setActiveSpec] = useState<B | undefined>(specs.length > 0 ? specs[0] : undefined)
  const activeBuild = pvpBuilds.find((build) => build.spec === activeSpec)
  if (specs.length === 0 || !activeBuild) return null
  return <section className="class-pvp">
    <h2>{classDef.name} PvP builds</h2>
    <div className="class-tabs" role="tablist" aria-label={`${classDef.name} PvP specializations`}>
      {specs.map((spec) => <button role="tab" type="button" key={spec} aria-selected={spec === activeSpec} className={spec === activeSpec ? 'active' : ''} onClick={() => setActiveSpec(spec)}>{classDef.branchNames[spec]}</button>)}
    </div>
    <div className="class-pvp-panel" role="tabpanel">
      <h3>{activeBuild.title}</h3>
      <p><strong>{activeBuild.allocation}</strong> · {activeBuild.points} / {activeBuild.levelCap} points · {activeBuild.phase}</p>
      <ul>{orderedBuildTalents(activeBuild, classDef).map(({ talent, rank }) => <li key={talent.id}><span>{talent.name}</span><b>{rank}/{talent.maxRank}</b></li>)}</ul>
      <p>{activeBuild.role}</p>
      <BuildChip />
      {plannerPublished && <a className="button class-primary" href={calculatorHref(classDef, activeBuild)}>Edit this build in Calculator <ArrowRight size={15} /></a>}
    </div>
  </section>
}

function TalentCatalogue<B extends string>({ classDef }: { classDef: ClassDefinition<B> }) {
  // Which branches cannot be allocated comes from the dataset, through the same rule the publish
  // gate reads, so the catalogue cannot mark a branch the planner would accept — or miss one it
  // cannot start.
  const unallocatable = unallocatableBranches(classDef)
  return <section className="class-catalogue" data-testid="class-talent-catalogue">
    <h2>{classDef.name} talent catalogue</h2>
    <p>Every node, grouped by branch and client change status through build {classDef.verifiedBuild}.</p>
    {classDef.branches.map((branch) => {
      const excluded = unallocatable.has(branch)
      return <div className="class-catalogue-branch" key={branch} data-branch={branch} data-excluded={excluded ? 'true' : undefined}>
        <h3>{classDef.branchNames[branch]}</h3>
        <p>{classDef.branchTaglines[branch]}</p>
        {changeStatusGroups.map(({ status, label }) => {
          const talents = classDef.talents.filter((talent) => talent.branch === branch && talent.changeStatus === status)
          if (talents.length === 0) return null
          return <div key={status}>
            <h4>{label}</h4>
            <ul>{talents.map((talent) => <li key={talent.id} data-testid="class-talent-entry" data-talent-id={talent.id} data-excluded={excluded ? 'true' : undefined}>
              <span>{talent.name}</span>
              <b>{talent.row}/{talent.column}</b>
              <VerificationBadge status={talent.verificationStatus} />
              {excluded && <span className="class-exclusion-marker" data-testid="class-exclusion-marker">
                <Ban size={12} aria-hidden="true" />
                <span className="class-exclusion-label">{EXCLUSION_LABEL}</span>
                <small>{EXCLUSION_REASON}</small>
              </span>}
            </li>)}</ul>
          </div>
        })}
      </div>
    })}
  </section>
}

/**
 * Class-neutral document renderer. The page kind, copy, builds and comparison table all
 * come from the `ClassDefinition` and the requested `ClassPageDefinition`.
 */
export default function ClassDocumentPage<B extends string>({ classDef, page }: { classDef: ClassDefinition<B>; page: ClassPageDefinition }) {
  const plannerPublished = hasPublishedPlanner(classDef)
  // A link out of a published page has to land on a page that publishes. Both lists come from the
  // same gate the routes use, so a withheld related page or build is not offered as a link at all.
  const publishedSlugs = new Set(publishedClassPages([classDef]).map((candidate) => candidate.page.slug))
  const isPublishedHref = (href: string) => publishedSlugs.has(href.replace(/^\//, '').split(/[?#]/)[0])
  const primaryBuild = buildById(classDef, page.primaryBuildId)
  const relatedBuilds = page.relatedBuildIds.flatMap((id) => buildById(classDef, id) ?? []).filter((build) => isPublishedHref(build.href))
  const showsBuildGroups = kindsListingEveryBuild.includes(page.kind)
  const showsRelatedBuilds = relatedBuilds.length > 0 && !kindsHandlingTheirOwnBuildLinks.includes(page.kind)
  const calculatorPage = classDef.pages.find((candidate) => candidate.kind === 'calculator')
  const navPages = classDef.pages.filter((candidate) => (candidate.kind === 'buildsHub' || candidate.kind === 'talents') && isPublishedHref(`/${candidate.slug}`))
  const relatedPages = page.relatedPages.filter((related) => isPublishedHref(related.href))
  // Only this class's own links: the site-wide class list lives in SiteFooter, which prepends
  // these to it. Nothing here may name another class.
  const footerLinks = navPages
    .map((candidate) => ({ href: `/${candidate.slug}`, label: candidate.h1 }))
    .concat(plannerPublished ? [{ href: classDef.plannerPath, label: `${classDef.name} Talent Calculator` }] : [])
  const editInCalculator = <a className="button class-primary" href={calculatorHref(classDef, primaryBuild)}>Edit this build in Calculator <ArrowRight size={15} /></a>

  return <main className="class-page">
    <header className="class-nav shell">
      <a className="class-brand" href="/"><Swords /><span>BUILD<b>FORGE</b></span></a>
      <nav aria-label={`${classDef.name} pages`}>
        {plannerPublished && <a href={classDef.plannerPath}>{calculatorPage?.h1 ?? `${classDef.name} Talent Calculator`}</a>}
        {navPages.map((candidate) => <a href={`/${candidate.slug}`} key={candidate.slug}>{candidate.h1}</a>)}
      </nav>
    </header>

    <section className="class-hero">
      <div className="shell class-hero-grid">
        <div>
          <p className="class-kicker">{page.eyebrow} · {classDef.beta.phaseLabel}</p>
          <h1>{page.h1}</h1>
          <p>{page.description}</p>
          {plannerPublished && <div className="class-hero-actions">{editInCalculator}</div>}
        </div>
        <aside>
          <div className="class-evidence">
            <p><span>Talent data</span><VerificationBadge status="client_verified" /></p>
            <p><span>Build</span><BuildChip /></p>
          </div>
          <p>Reviewed {page.updatedAt}</p>
        </aside>
      </div>
    </section>

    <div className="shell class-document">
      <div className="class-builds" data-testid="class-build-evidence">
        {showsBuildGroups && <BuildGroups classDef={classDef} isPublishedHref={isPublishedHref} />}
        {page.kind === 'pvp' && <PvpTabs classDef={classDef} plannerPublished={plannerPublished} />}
        {primaryBuild && !showsBuildGroups && <section className="class-primary-build">
          <h2>{primaryBuild.title}</h2>
          <p><strong>{primaryBuild.allocation}</strong> · {primaryBuild.points} / {primaryBuild.levelCap} points · {primaryBuild.phase}</p>
          <p>{primaryBuild.role}</p>
          {primaryBuild.playstyle.length > 0 && <ul>{primaryBuild.playstyle.map((item) => <li key={item}><Check size={14} /> <span>{item}</span></li>)}</ul>}
          <BuildChip />
          <p><small>{primaryBuild.evidence === 'community_verified' ? 'Community-verified recommendation.' : 'Derived planning assumption.'} Talent positions and ranks remain client data; this allocation is editorial only.</small></p>
        </section>}
        {showsRelatedBuilds && <section className="class-related-builds">
          <h2>Related {classDef.name} builds</h2>
          {relatedBuilds.map((build) => <article key={build.id}>
            <a href={build.href}>{build.title}</a>
            <p>{build.role} · Level {build.level} · {build.phase}</p>
            <BuildChip />
          </article>)}
        </section>}
      </div>

      {primaryBuild && <section className="class-selected" data-testid="class-talent-evidence">
        <h2>Talents in this build</h2>
        <TalentEvidence />
        <ul className="class-selected-list">{orderedBuildTalents(primaryBuild, classDef).map(({ talent, rank }) => <li key={talent.id}>
          <span>{talent.name}</span><b>{rank}/{talent.maxRank}</b><VerificationBadge status={talent.verificationStatus} />
        </li>)}</ul>
      </section>}

      {page.kind === 'talents' && <TalentCatalogue classDef={classDef} />}

      {page.sections.map((section) => <section className="class-section" key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}><Check size={14} /> <span>{bullet}</span></li>)}</ul>}
      </section>)}

      {page.comparison && <section className="class-comparison">
        <h2>{page.h1} comparison</h2>
        <div className="class-table-wrap">
          <table>
            <thead><tr><th scope="col">{page.h1}</th>{page.comparison.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{page.comparison.rows.map((row) => <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => <td key={`${row.label}-${page.comparison?.columns[index] ?? index}`}>{value}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </section>}

      {page.faqs.length > 0 && <section className="class-faq">
        <h2>Frequently asked questions</h2>
        {page.faqs.map((faq) => <div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}
      </section>}

      {relatedPages.length > 0 && <section className="class-related-pages">
        <h2>Related {classDef.name} pages</h2>
        <nav aria-label={`Related ${classDef.name} pages`}>{relatedPages.map((related) => <a href={related.href} key={related.href}>{related.label}</a>)}</nav>
      </section>}

      {plannerPublished && <section className="class-cta">
        <h2>Open the {classDef.name} calculator</h2>
        <p>Every published {classDef.name} page points back at the planner at {classDef.plannerPath}.</p>
        {editInCalculator}
      </section>}
    </div>

    <SiteFooter classLinks={footerLinks} />
  </main>
}
