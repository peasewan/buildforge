import { ArrowRight, Check, Route } from 'lucide-react'
import VerificationBadge from './VerificationBadge'
import { BETA_LEVEL_CAP_SOURCE, betaLevelingPlannerHref, betaLevelingSnapshot, type BetaLevelingPageId } from './data/levelingBeta'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'

export default function BetaLevelingSnapshot({ pageId }: { pageId: BetaLevelingPageId }) {
  const snapshot = betaLevelingSnapshot(pageId)

  return (
    <section className="beta-leveling-snapshot shell" aria-label="Beta leveling snapshot">
      <header>
        <div><Route size={18} /><span>Beta leveling snapshot</span></div>
        <h2>{snapshot.title}</h2>
        <p>Current client facts and editorial recommendations are labeled separately.</p>
      </header>
      <div className="beta-leveling-grid">
        <article>
          <div><span>Current Beta cap</span><VerificationBadge status="official" /></div>
          <strong>Level {snapshot.current.level} · {snapshot.current.points} points</strong>
          <b>{snapshot.current.allocation}</b>
          <p>{snapshot.current.note}</p>
          <a href={betaLevelingPlannerHref(pageId)}>Open current path in Calculator <ArrowRight size={14} /></a>
        </article>
        <article>
          <div><span>Level 30 plan</span><VerificationBadge status="derived_assumption" /></div>
          <strong>Level {snapshot.next.level} · {snapshot.next.points} points</strong>
          <b>{snapshot.next.allocation}</b>
          <p>{snapshot.next.note}</p>
          <small>Community recommendation · prepare now, available after Blizzard raises the cap.</small>
        </article>
      </div>
      <div className="beta-leveling-evidence">
        <p><Check size={14} /><span><VerificationBadge status="client_verified" /> Talent names, ranks, and tree positions checked against Beta client Build {PALADIN_BETA_SNAPSHOT.clientBuild}.</span></p>
        <p><Check size={14} /><span><VerificationBadge status="derived_assumption" /> Community recommendation, last reviewed {snapshot.recommendationSource.updated}.</span></p>
        <ul>{snapshot.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}</ul>
        <div><a href={BETA_LEVEL_CAP_SOURCE.href} target="_blank" rel="noreferrer">Official level-cap source</a><a href={snapshot.recommendationSource.href} target="_blank" rel="noreferrer">Recommendation source</a></div>
      </div>
    </section>
  )
}
