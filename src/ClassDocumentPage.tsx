import { useState } from 'react'
import { ArrowRight, Check, Swords } from 'lucide-react'
import SiteFooter from './SiteFooter'
import VerificationBadge from './VerificationBadge'
import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassTalent } from './lib/classPage'
import { classPlannerHref } from './lib/classPage'
import { encodePlannerBuild, totalPlannerPoints } from './lib/talentPlanner'

type ChangeStatus = ClassTalent<string>['changeStatus']

const intentLabels: Record<string, string> = { leveling: 'Leveling', aoe: 'AoE', pvp: 'PvP', dungeon: 'Dungeon', spec: 'Specialization' }

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

function BuildChip() {
  return <span className="class-build-chip">Community / Editorial Build</span>
}

function TalentEvidence() {
  // The badge covers planner-legal fields only (spec UI block): row, column and maxRank are
  // `client_verified` on every published node, while `rankDescriptions` evidence is `unknown`
  // on 17 of the 30 Mage nodes. Naming tooltips here would claim evidence the dataset lacks.
  return <p className="class-evidence-line"><span>Talent data</span><VerificationBadge status="client_verified" /><small>positions and ranks only</small></p>
}

function BuildGroups<B extends string>({ classDef }: { classDef: ClassDefinition<B> }) {
  const intents = [...new Set(classDef.builds.map((build) => build.intent))]
  return <section className="class-build-groups">
    <h2>{classDef.name} builds</h2>
    {intents.map((intent) => <div key={intent}>
      <h3>{intentLabels[intent] ?? intent}</h3>
      {classDef.builds.filter((build) => build.intent === intent).map((build) => <article key={build.id}>
        <a href={build.href}>{build.title}</a>
        <p>{build.role} · Level {build.level} · {build.phase}</p>
        <p>{build.allocation} · {totalPlannerPoints(build.build)} / {build.levelCap} points</p>
        {build.strengths.length > 0 && <ul>{build.strengths.map((strength) => <li key={strength}><Check size={14} /> <span>{strength}</span></li>)}</ul>}
        <BuildChip />
      </article>)}
    </div>)}
  </section>
}

function PvpTabs<B extends string>({ classDef }: { classDef: ClassDefinition<B> }) {
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
      <a className="button class-primary" href={calculatorHref(classDef, activeBuild)}>Edit this build in Calculator <ArrowRight size={15} /></a>
    </div>
  </section>
}

function TalentCatalogue<B extends string>({ classDef }: { classDef: ClassDefinition<B> }) {
  return <section className="class-catalogue" data-testid="class-talent-catalogue">
    <h2>{classDef.name} talent catalogue</h2>
    <p>Every node, grouped by branch and client change status through build {classDef.verifiedBuild}.</p>
    {classDef.branches.map((branch) => <div className="class-catalogue-branch" key={branch}>
      <h3>{classDef.branchNames[branch]}</h3>
      <p>{classDef.branchTaglines[branch]}</p>
      {changeStatusGroups.map(({ status, label }) => {
        const talents = classDef.talents.filter((talent) => talent.branch === branch && talent.changeStatus === status)
        if (talents.length === 0) return null
        return <div key={status}>
          <h4>{label}</h4>
          <ul>{talents.map((talent) => <li key={talent.id} data-testid="class-talent-entry">
            <span>{talent.name}</span>
            <b>{talent.row}/{talent.column}</b>
            <VerificationBadge status={talent.verificationStatus} />
          </li>)}</ul>
        </div>
      })}
    </div>)}
  </section>
}

/**
 * Class-neutral document renderer. The page kind, copy, builds and comparison table all
 * come from the `ClassDefinition` and the requested `ClassPageDefinition`.
 */
export default function ClassDocumentPage<B extends string>({ classDef, page }: { classDef: ClassDefinition<B>; page: ClassPageDefinition }) {
  const primaryBuild = buildById(classDef, page.primaryBuildId)
  const relatedBuilds = page.relatedBuildIds.flatMap((id) => buildById(classDef, id) ?? [])
  const showsBuildGroups = kindsListingEveryBuild.includes(page.kind)
  const showsRelatedBuilds = relatedBuilds.length > 0 && !kindsHandlingTheirOwnBuildLinks.includes(page.kind)
  const calculatorPage = classDef.pages.find((candidate) => candidate.kind === 'calculator')
  const navPages = classDef.pages.filter((candidate) => candidate.kind === 'buildsHub' || candidate.kind === 'talents')
  // Only this class's own links: the site-wide class list lives in SiteFooter, which prepends
  // these to it. Nothing here may name another class.
  const footerLinks = navPages
    .map((candidate) => ({ href: `/${candidate.slug}`, label: candidate.h1 }))
    .concat([{ href: classDef.plannerPath, label: `${classDef.name} Talent Calculator` }])
  const editInCalculator = <a className="button class-primary" href={calculatorHref(classDef, primaryBuild)}>Edit this build in Calculator <ArrowRight size={15} /></a>

  return <main className="class-page">
    <header className="class-nav shell">
      <a className="class-brand" href="/"><Swords /><span>BUILD<b>FORGE</b></span></a>
      <nav aria-label={`${classDef.name} pages`}>
        <a href={classDef.plannerPath}>{calculatorPage?.h1 ?? `${classDef.name} Talent Calculator`}</a>
        {navPages.map((candidate) => <a href={`/${candidate.slug}`} key={candidate.slug}>{candidate.h1}</a>)}
      </nav>
    </header>

    <section className="class-hero">
      <div className="shell class-hero-grid">
        <div>
          <p className="class-kicker">{page.eyebrow} · {classDef.beta.phaseLabel}</p>
          <h1>{page.h1}</h1>
          <p>{page.description}</p>
          <div className="class-hero-actions">{editInCalculator}</div>
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
        {showsBuildGroups && <BuildGroups classDef={classDef} />}
        {page.kind === 'pvp' && <PvpTabs classDef={classDef} />}
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

      {page.relatedPages.length > 0 && <section className="class-related-pages">
        <h2>Related {classDef.name} pages</h2>
        <nav aria-label={`Related ${classDef.name} pages`}>{page.relatedPages.map((related) => <a href={related.href} key={related.href}>{related.label}</a>)}</nav>
      </section>}

      <section className="class-cta">
        <h2>Open the {classDef.name} calculator</h2>
        <p>Every {classDef.name} page points back at the planner at {classDef.plannerPath}.</p>
        {editInCalculator}
      </section>
    </div>

    <SiteFooter classLinks={footerLinks} />
  </main>
}
