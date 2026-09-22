import type { CSSProperties } from 'react'
import { ArrowRight, Swords } from 'lucide-react'
import type { ClassDefinition, ClassPageDefinition } from '../lib/classPage'
import { publishedClassPages } from '../lib/classPage'
import SiteFooter from '../SiteFooter'
import ClassIntentExperience from './ClassIntentExperience'
import { experienceLabel } from './experienceLabels'

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
        <ClassIntentExperience classDef={def} page={page} />
        <details className="ix-evidence">
          <summary>Data sources, verification &amp; planning limits</summary>
          <p>
            {def.dataReview?.notice ??
              'Talent positions and ranks are client records. Build allocations are editorial examples; performance is not simulated. Prerequisite rank rules may be derived assumptions.'}
          </p>
          <ul>
            {def.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
        <div className="ix-editorial">
          {page.sections.map((s, i) => (
            <section
              className="class-section"
              id={`notes-${i}`}
              key={s.heading}
            >
              <h2>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        {page.comparison && (
          <section className="class-comparison">
            <h2>Role and playstyle comparison</h2>
            <div className="ix-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Planning consideration</th>
                    {page.comparison.columns.map((c) => (
                      <th scope="col" key={c}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.comparison.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {r.values.map((v, i) => (
                        <td key={i}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {page.faqs.length > 0 && (
          <section className="class-faq">
            <h2>Frequently asked questions</h2>
            {page.faqs.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </section>
        )}
        {related.length > 0 && (
          <section className="ix-related">
            <h2>Continue planning your {def.name}</h2>
            <nav aria-label={`Related ${def.name} pages`}>
              {related.map((r) => (
                <a href={r.href} key={r.href}>
                  {r.label}
                  <ArrowRight size={14} />
                </a>
              ))}
            </nav>
          </section>
        )}
      </div>
      <SiteFooter
        classLinks={nav.map((p) => ({ href: `/${p.slug}`, label: p.h1 }))}
      />
    </main>
  )
}
