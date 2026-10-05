import { ArrowRight, Check, Route } from 'lucide-react'
import PaladinRouteTimeline from './PaladinRouteTimeline'
import { PROTECTION_POINT_STEPS } from './data/paladinDecisionTools'
import PaladinLevelingTimeline from './PaladinLevelingTimeline'
import VerificationBadge from './VerificationBadge'
import { BETA_LEVEL_CAP_SOURCE, betaLevelingPlannerHref, betaLevelingSnapshot, type BetaLevelingPageId } from './data/levelingBeta'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
import { protectionPlannerHref } from './data/protectionCurrentRoute'
import ProtectionRouteEvidence from './ProtectionRouteEvidence'

export default function BetaLevelingSnapshot({ pageId }: { pageId: BetaLevelingPageId }) {
  const snapshot = betaLevelingSnapshot(pageId)
  const archived = snapshot.status === 'archived'
  if (pageId !== 'protection-leveling') return <PaladinLevelingTimeline />

  return (
    <>
    <PaladinRouteTimeline steps={PROTECTION_POINT_STEPS} routeId="protection-leveling" title="Protection Level 10–30 Talent Timeline" evidence="Editorial route using five Protection nodes reviewed against 70170. Replay each point in the imported planner; full current-client tooltips and in-game performance remain unverified." />
    <section className="beta-leveling-snapshot shell" aria-label="Beta leveling snapshot">
      <header>
        <div><Route size={18} /><span>{archived ? 'Archived Beta leveling snapshot' : 'Beta leveling snapshot'}</span></div>
        <h2>{snapshot.title}</h2>
        <p>{archived ? snapshot.archiveNotice : 'Follow a reviewed-node, editorial Protection point order from Level 10 to the current Level 30 Beta cap. Standard progression excludes Legacy: Talented.'}</p>
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
          <b>{snapshot.next.allocation ?? 'No reviewed allocation'}</b>
          <p>{snapshot.next.note}</p>
          <small>A {snapshot.next.points}-point budget follows standard one-point-per-level progression without Legacy: Talented; this is an editorial route, not a measured best build.</small>
          {snapshot.next.build && <a href={protectionPlannerHref(30)}>Open Level 30 route in Calculator <ArrowRight size={14} /></a>}
        </article>
      </div>
      <div className="beta-leveling-evidence">
        <p><Check size={14} /><span><VerificationBadge status="client_verified" /> {archived ? 'Historical talent names and positions were recorded from' : 'Selected Protection node IDs, ranks, and tree positions checked against'} Beta client Build {archived ? PALADIN_BETA_SNAPSHOT.clientBuild : '1.60.1.70170'}.</span></p>
        <p><Check size={14} /><span><VerificationBadge status="derived_assumption" /> {archived ? 'Historical community recommendation' : 'BuildForgeTools editorial point order'}, last reviewed {snapshot.recommendationSource.updated}.</span></p>
        {archived && <p><Check size={14} /><span><a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Blizzard September 24 removal notice</a> · replacement route pending review.</span></p>}
        <ul>{snapshot.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}</ul>
        <div><a href={BETA_LEVEL_CAP_SOURCE.href} target="_blank" rel="noreferrer">Official level-cap source</a><a href={snapshot.recommendationSource.href} target="_blank" rel="noreferrer">{archived ? 'Recommendation source' : 'Protection client node source'}</a></div>
        {!archived && <ProtectionRouteEvidence />}
      </div>
    </section>
    </>
  )
}
