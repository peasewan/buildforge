import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, Swords } from 'lucide-react'
import type { ClassDefinition, ClassPageDefinition } from '../lib/classPage'
import { publishedClassPages } from '../lib/classPage'
import SiteFooter from '../SiteFooter'
import ClassIntentExperience from './ClassIntentExperience'
import ClassSignature, { hasClassSignature } from './ClassSignature'
import { experienceLabel } from './experienceLabels'

type Slot = 'intent' | 'signature' | 'evidence' | 'editorial' | 'comparison' | 'faq' | 'related'
const supportOrder = (kind: ClassPageDefinition['kind']): Slot[] => {
  if (kind === 'buildsHub') return ['intent', 'signature', 'editorial', 'evidence', 'faq', 'related']
  if (kind === 'comparison') return ['intent', 'comparison', 'editorial', 'evidence', 'faq', 'related']
  if (kind === 'talents' || kind === 'specTalents') return ['intent', 'evidence', 'related', 'editorial', 'faq']
  if (kind === 'specBuild') return ['intent', 'editorial', 'signature', 'related', 'evidence', 'comparison', 'faq']
  if (kind === 'dungeon' || kind === 'specDungeon' || kind === 'tank') return ['intent', 'signature', 'evidence', 'editorial', 'comparison', 'faq', 'related']
  if (kind === 'pvp' || kind === 'specPvp') return ['intent', 'signature', 'editorial', 'comparison', 'evidence', 'faq', 'related']
  return ['intent', 'signature', 'editorial', 'evidence', 'comparison', 'faq', 'related']
}

export default function ClassExperiencePage({
  classDef: def,
  page,
}: {
  classDef: ClassDefinition
  page: ClassPageDefinition
}) {
  const published = publishedClassPages([def]).map(({ page }) => page),
    paths = new Set(published.map((p) => `/${p.slug}`))
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
    signature: hasClassSignature(def, page) ? <ClassSignature classDef={def} page={page} /> : null,
    evidence: (
      <details className="ix-evidence">
        <summary>Data sources, verification &amp; planning limits</summary>
        <p>{def.dataReview?.notice ?? 'Talent positions and ranks are client records. Build allocations are editorial examples; performance is not simulated. Prerequisite rank rules may be derived assumptions.'}</p>
        <ul>{def.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul>
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
          <p className="ix-dek">{page.description}</p>
          <div className="ix-meta">
            <span>
              {def.dataReview ? 'CLIENT-TABLE PREVIEW' : def.beta.phaseLabel}
            </span>
            {(def.dataReview ||
              !def.beta.phaseLabel.includes(def.verifiedBuild)) && (
              <span>Build {def.verifiedBuild}</span>
            )}
            <span>Reviewed {page.updatedAt}</span>
          </div>
        </div>
      </section>
      <div className="shell ix-body">
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
