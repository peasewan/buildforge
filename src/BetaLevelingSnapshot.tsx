import { ArrowRight, Check, Route } from 'lucide-react'
import VerificationBadge from './VerificationBadge'
import { BETA_LEVEL_CAP_SOURCE, betaLevelingPlannerHref, betaLevelingSnapshot, type BetaLevelingPageId } from './data/levelingBeta'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'

export default function BetaLevelingSnapshot({ pageId }: { pageId: BetaLevelingPageId }) {
  const snapshot = betaLevelingSnapshot(pageId)
  const archived = snapshot.status === 'archived'

  return (
    <section className="beta-leveling-snapshot shell" aria-label="Beta leveling snapshot">
      <header>
        <div><Route size={18} /><span>{archived ? 'Archived Beta leveling snapshot' : 'Beta leveling snapshot'}</span></div>
        <h2>{snapshot.title}</h2>
        <p>{archived ? snapshot.archiveNotice : 'This reviewed Level 20 route is an 11-point start within the current Level 30 Beta cap.'}</p>
      </header>
      <div className="beta-leveling-grid">
        <article>
          <div><span>{archived ? 'Archived Level 20 route' : 'Level 20 starting route'}</span><VerificationBadge status="derived_assumption" /></div>
          <strong>Level {snapshot.current.level} · {snapshot.current.points} points</strong>
          <b>{snapshot.current.allocation}</b>
          <p>{snapshot.current.note}</p>
          <a href={betaLevelingPlannerHref(pageId)}>{archived ? 'Open Calculator without this route' : 'Open Level 20 start in Calculator'} <ArrowRight size={14} /></a>
        </article>
        <article>
          <div><span>Official Level 30 cap</span><VerificationBadge status="official" /></div>
          <strong>Official cap: Level {snapshot.next.level}</strong>
          <b>No reviewed allocation</b>
          <p>{snapshot.next.note}</p>
          <small>A {snapshot.next.points}-point budget follows the one-point-per-level planning assumption; it is not a verified build.</small>
        </article>
      </div>
      <div className="beta-leveling-evidence">
        <p><Check size={14} /><span><VerificationBadge status="client_verified" /> {archived ? 'Historical talent names and positions were recorded from' : 'Talent names, ranks, and tree positions checked against'} Beta client Build {PALADIN_BETA_SNAPSHOT.clientBuild}.</span></p>
        <p><Check size={14} /><span><VerificationBadge status="derived_assumption" /> Community recommendation, last reviewed {snapshot.recommendationSource.updated}.</span></p>
        {archived && <p><Check size={14} /><span><a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Blizzard September 24 removal notice</a> · replacement route pending review.</span></p>}
        <ul>{snapshot.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}</ul>
        <div><a href={BETA_LEVEL_CAP_SOURCE.href} target="_blank" rel="noreferrer">Official level-cap source</a><a href={snapshot.recommendationSource.href} target="_blank" rel="noreferrer">Recommendation source</a></div>
      </div>
    </section>
  )
}
