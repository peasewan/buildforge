import { ArrowRight, Check, Route } from 'lucide-react'
import VerificationBadge from './VerificationBadge'
import { betaSpecPath, betaSpecPlannerHref, BETA_LEVEL_CAP_SOURCE } from './data/betaSpecPaths'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
import type { Branch } from './lib/build'

export default function BetaSpecPath({ branch }: { branch: Branch }) {
  const path = betaSpecPath(branch)
  const archived = path.status === 'archived'

  return (
    <section className="beta-leveling-snapshot beta-spec-path shell" aria-label={archived ? 'Archived Beta talent path' : 'Beta talent starting path'}>
      <header>
        <div><Route size={18} /><span>{archived ? 'Archived Beta talent path' : 'Beta talent starting path'}</span></div>
        <h2>{path.title}</h2>
        <p>{archived ? path.archiveNotice : 'An 11-point Level 20 starting route from the imported client tree. The official Beta cap is now Level 30.'}</p>
      </header>

      <div className="beta-spec-best-for" aria-label="Best for">
        <strong>Best for</strong>
        {path.bestFor.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="beta-leveling-grid">
        <article>
          <div><span>{archived ? 'Archived Level 20 route' : 'Level 20 starting route'}</span><VerificationBadge status="derived_assumption" /></div>
          <strong>Level {path.current.level} · {path.current.points} points</strong>
          <b>{path.current.allocation}</b>
          <small>{archived ? 'Historical community recommendation — not playable in the updated tree' : 'Community recommendation'}</small>
          <ol className="beta-spec-steps">
            {path.current.steps.map((step) => <li key={step.levels}><span>{step.levels}</span><b>{step.talent}</b></li>)}
          </ol>
          <a href={betaSpecPlannerHref(branch)}>{archived ? 'Open Calculator without this route' : `Load Level ${path.current.level} path`} <ArrowRight size={14} /></a>
        </article>
        <article>
          <div><span>Official Level 30 cap</span><VerificationBadge status="official" /></div>
          <strong>Official cap: Level {path.next.level}</strong>
          <b>No reviewed allocation</b>
          <p>{path.next.note}</p>
          <small>A {path.next.points}-point budget follows the one-point-per-level planning assumption; it is not a verified build.</small>
        </article>
      </div>

      <div className="beta-leveling-evidence">
        <p><Check size={14} /><span><VerificationBadge status="client_verified" /> {archived ? 'Historical talent names and positions were recorded from' : 'Talent names, ranks, and positions checked against'} Beta client Build {PALADIN_BETA_SNAPSHOT.clientBuild}.</span></p>
        <p><Check size={14} /><span><VerificationBadge status="derived_assumption" /> Talent order is editorial guidance, reviewed {path.recommendationSource.updated}.</span></p>
        {archived && <p><Check size={14} /><span><a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Blizzard September 24 removal notice</a> · affected route pending review.</span></p>}
        <div><a href={BETA_LEVEL_CAP_SOURCE.href} target="_blank" rel="noreferrer">Official level-cap source</a><a href={path.recommendationSource.href} target="_blank" rel="noreferrer">Recommendation source</a></div>
      </div>
    </section>
  )
}
