import { priestLevelingComparisonSlug } from '../data/classes/priest'
import BetaPatchNotice from '../BetaPatchNotice'
import PriestLevelingChoice from './PriestLevelingChoice'
import LaunchBuildGuide from '../LaunchBuildGuide'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, Swords } from 'lucide-react'
import type { ClassDefinition, ClassPageDefinition } from '../lib/classPage'
import { publishedClassPages } from '../lib/classPage'
import { classBuildPlannerHref, hasRemovedTalentInBuild } from '../lib/archivedClassBuild'
import SiteFooter from '../SiteFooter'
import ClassIntentExperience from './ClassIntentExperience'
import ClassSignature, { hasClassSignature } from './ClassSignature'
import HunterOfficialUpdate, { isHunterOfficialUpdatePage } from './HunterOfficialUpdate'
import OfficialClassChanges from './OfficialClassChanges'
import { experienceLabel } from './experienceLabels'

const OCTOBER_BETA_NOTES = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696'
const OCTOBER_REVIEWED_PAGES = new Set([
  'wow-forever-hunter-pvp-build',
  'wow-forever-warlock-pvp-build',
  'wow-forever-arms-vs-fury-warrior-leveling',
  'wow-forever-beast-mastery-vs-marksmanship-hunter-leveling',
])

type Slot = 'intent' | 'official' | 'signature' | 'evidence' | 'editorial' | 'comparison' | 'faq' | 'related'
const supportOrder = (kind: ClassPageDefinition['kind']): Slot[] => {
  if (kind === 'buildsHub') return ['intent', 'signature', 'official', 'editorial', 'evidence', 'faq', 'related']
  if (kind === 'comparison') return ['intent', 'comparison', 'official', 'editorial', 'evidence', 'faq', 'related']
  if (kind === 'talents' || kind === 'specTalents') return ['intent', 'official', 'evidence', 'related', 'editorial', 'faq']
  if (kind === 'specBuild') return ['intent', 'editorial', 'official', 'signature', 'related', 'evidence', 'comparison', 'faq']
  if (kind === 'dungeon' || kind === 'specDungeon' || kind === 'tank') return ['intent', 'signature', 'official', 'evidence', 'editorial', 'comparison', 'faq', 'related']
  if (kind === 'pvp' || kind === 'specPvp') return ['intent', 'signature', 'official', 'editorial', 'comparison', 'evidence', 'faq', 'related']
  return ['intent', 'signature', 'official', 'editorial', 'evidence', 'comparison', 'faq', 'related']
}

export default function ClassExperiencePage({
  classDef: def,
  page,
}: {
  classDef: ClassDefinition
  page: ClassPageDefinition
}) {
  const priestComparison = page.slug === priestLevelingComparisonSlug
  const launchClass = page.kind === 'buildsHub' && (def.id === 'hunter' || def.id === 'mage') ? def.id : undefined
  const published = publishedClassPages([def]).map(({ page }) => page),
    paths = new Set(published.map((p) => `/${p.slug}`))
  const plannerPublished = published.some((p) => p.kind === 'calculator')
  const primaryBuild = def.builds.find((build) => build.id === page.primaryBuildId && paths.has(build.href))
  const archivedBuild = primaryBuild ? hasRemovedTalentInBuild(def, primaryBuild) : false
  const calculatorHref = primaryBuild ? classBuildPlannerHref(def, primaryBuild) : def.plannerPath
  const related = page.relatedPages.filter((p) => paths.has(p.href)),
    art = page.ogImage ?? def.ogImage
  const heroStyle = art
    ? ({ '--class-hero-image': `url("${art}")` } as CSSProperties)
    : undefined
  const nav = published.filter((p) =>
    ['calculator', 'buildsHub', 'talents'].includes(p.kind),
  )
  const slots: Record<Slot, ReactNode> = {
    intent: <ClassIntentExperience classDef={def} page={page} />,
    official: def.id === 'hunter' && isHunterOfficialUpdatePage(page.slug)
      ? <HunterOfficialUpdate slug={page.slug} reviewedBuild={def.dataReview?.current ? def.verifiedBuild : undefined} />
      : <OfficialClassChanges classId={def.id} reviewedBuild={def.dataReview?.current ? def.verifiedBuild : undefined} />,
    signature: hasClassSignature(def, page) ? <ClassSignature classDef={def} page={page} /> : null,
    evidence: (
      <details className="ix-evidence">
        <summary>Data sources, verification &amp; planning limits</summary>
        <p>{def.dataReview?.notice ?? 'Talent positions and ranks are client records. Build allocations are editorial examples; performance is not simulated. Prerequisite rank rules may be derived assumptions.'}</p>
        <ul>{def.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}
          {OCTOBER_REVIEWED_PAGES.has(page.slug) && <li><a href={OCTOBER_BETA_NOTES} target="_blank" rel="noreferrer">Blizzard October 1 Beta development notes</a></li>}
        </ul>
      </details>
    ),
    editorial: page.sections.length ? (
      <div className="ix-editorial">
        {page.sections.map((s, i) => (
          <section className="class-section" id={`notes-${i}`} key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
            {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          </section>
        ))}
      </div>
    ) : null,
    comparison: page.comparison ? (
      <section className="class-comparison">
        <h2>Role and playstyle comparison</h2>
        <div className="ix-table-wrap">
          <table>
            <thead><tr><th scope="col">Planning consideration</th>{page.comparison.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
            <tbody>{page.comparison.rows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th>{r.values.map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
    ) : null,
    faq: page.faqs.length ? (
      <section className="class-faq">
        <h2>Frequently asked questions</h2>
        {page.faqs.map((f) => <details key={f.question}><summary>{f.question}</summary><p>{f.answer}</p></details>)}
      </section>
    ) : null,
    related: related.length ? (
      <section className="ix-related">
        <h2>Continue planning your {def.name}</h2>
        <nav aria-label={`Related ${def.name} pages`}>
          {related.map((r) => <a href={r.href} key={r.href}>{r.label}<ArrowRight size={14} /></a>)}
        </nav>
      </section>
    ) : null,
  }
  return (
    <main
      className="class-page intent-page"
      data-class={def.id}
      data-client-preview={def.dataReview ? 'true' : undefined}
      data-intent-page={page.kind}
    >
      <header className="class-nav shell">
        <a className="class-brand" href="/">
          <Swords />
          <span>
            BUILD<b>FORGE</b>
          </span>
        </a>
        <nav aria-label={`${def.name} pages`}>
          {nav.map((p) => (
            <a key={p.slug} href={`/${p.slug}`}>
              {p.kind === 'calculator'
                ? 'Calculator'
                : p.kind === 'buildsHub'
                  ? 'Builds'
                  : 'Talents'}
            </a>
          ))}
        </nav>
      </header>
      <section className="class-hero ix-hero" style={heroStyle}>
        <div className="shell">
          <nav className="ix-breadcrumb" aria-label="Breadcrumb">
            <a href={def.plannerPath}>{def.name}</a>
            <span>/</span>
            <span>{experienceLabel(page.kind)}</span>
          </nav>
          <p className="ix-eyebrow">{experienceLabel(page.kind)}</p>
          <h1>{page.h1}</h1>
          <p className="ix-dek">{launchClass ? `Choose a ${def.name} allocation for leveling, dungeons, area damage or PvP. Inspect its ranks and open the filled launch tree.` : page.description}</p>
          {def.contentPolicy === 'intent_tasks_v1' && !def.dataReview?.current && <p className="ix-note" role="note">Historical {def.verifiedBuild} talent snapshot · Level 20 reference. The live Beta cap is Level 30; a current 21-point allocation has not been verified for this class here. Use the source-linked ranks and progression as a historical comparison.</p>}
          {priestComparison && <a className="button class-primary" href="#leveling-choice">Compare solo and dungeon leveling <ArrowRight size={15} aria-hidden="true" /></a>}
          {plannerPublished && !priestComparison && (
            <div className="class-hero-actions">
              <a className="button class-primary" href={launchClass ? '#launch-builds' : calculatorHref}>
                {launchClass ? `Choose a launch build` : archivedBuild ? `Open blank ${def.name} Calculator` : primaryBuild ? `Inspect Level ${primaryBuild.level} route in Calculator` : `Open ${def.name} Calculator`}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          )}
          {archivedBuild && <p className="ix-note" role="note">This historical route includes an officially removed talent. Review the old ranks below, then start a blank calculator route.</p>}
          <div className="ix-meta">
            <span>
              {priestComparison ? 'Launch leveling guide' : launchClass ? 'Launch builds and Beta archive' : def.dataReview && !def.dataReview.current ? 'CLIENT-TABLE PREVIEW' : def.beta.phaseLabel}
            </span>
            {!priestComparison && ((def.dataReview && !def.dataReview.current) ||
              !def.beta.phaseLabel.includes(def.verifiedBuild)) && (
              <span>{launchClass ? 'Archived Beta build' : 'Build'} {def.verifiedBuild}</span>
            )}
            <span>Reviewed {launchClass ? '2026-11-15' : page.updatedAt}</span>
          </div>
        </div>
      </section>
      <div className="shell ix-body">
        {priestComparison && <>
          <PriestLevelingChoice />
          <header className="ix-panel"><h2>October Beta builds at level 30</h2>
            <p>The point orders and patch notes below use Beta client {def.verifiedBuild}. Use them to inspect the two 21-point examples. The launch talent milestones are covered above.</p>
            <a href={calculatorHref}>Inspect the archived Priest allocation</a>
          </header>
          <BetaPatchNotice classId={def.id} />
        </>}
        {launchClass && <><LaunchBuildGuide id={launchClass} /><header className="ix-panel"><h2>Beta archive and local calculator</h2><p>The following tools and field notes preserve the pre-launch {def.verifiedBuild} tree. Their level caps and ability comparisons describe the October Beta.</p></header></>}
        {supportOrder(page.kind).map((slot) => slots[slot] ? (
          <div className={`ix-slot ix-slot--${slot}`} data-composition-slot={slot} key={slot}>{slots[slot]}</div>
        ) : null)}
      </div>
      <SiteFooter discovery
        classLinks={nav.map((p) => ({ href: `/${p.slug}`, label: p.h1 }))}
      />
    </main>
  )
}
