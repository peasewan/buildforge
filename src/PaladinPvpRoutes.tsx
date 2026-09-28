import { BETA_SPEC_PATHS, betaSpecPlannerHref } from './data/betaSpecPaths'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
import { branchNames } from './data/talents'
import { track } from './lib/analytics'

/** Reuse the published routes as editable starts, without claiming measured PvP performance. */
export default function PaladinPvpRoutes() {
  return <section id="pvp-starting-routes" className="shell pvp-starting-routes" aria-label="Paladin PvP starting routes">
    <header><div className="eyebrow">Editorial planning examples</div><h2>Choose a starting route, then adjust for PvP</h2>
      <p>These Level 20 examples reuse our existing damage and support paths. They are not tested PvP recommendations or best-build claims.</p>
      <p>Imported talent dataset: {PALADIN_BETA_SNAPSHOT.clientBuild}. The newer {BETA_PATCH_REVIEW.clientBuild} update is awaiting reconciliation; review changed talents before using any historical setup.</p>
      <p>The Level 20 snapshot opens in the 51-point reference calculator. Extra room is for future planning, not talent points available at Level 20.</p>
    </header>
    <div className="pvp-starting-grid">{(['retribution', 'holy'] as const).map(branch => {
      const path = BETA_SPEC_PATHS[branch]
      return <article key={branch}>
        <span>Editorial · Level {path.current.level} · {path.current.points} points</span>
        <h3>{branchNames[branch]} {branch === 'holy' ? 'support' : 'damage'} starting route</h3>
        <strong>{path.current.allocation}</strong>
        <p>{branch === 'holy' ? 'Start from the published healing path and review its support choices for your matchup.' : 'Start from the published damage path and review its pressure and utility choices for your matchup.'}</p>
        <ol>{path.current.steps.map(step => <li key={step.talent}>{step.talent}</li>)}</ol>
        <a className="button primary" href={betaSpecPlannerHref(branch)} onClick={() => track('build_landing_cta_click', { page_id: 'pvp', placement: 'editorial-route', branch })}>Load {branchNames[branch]} route →</a>
        <small>Adapted from <a href={path.recommendationSource.href} target="_blank" rel="noreferrer">{path.recommendationSource.label}</a>; a guide recommendation, not a client fact.</small>
      </article>
    })}</div>
    <p>Protection is omitted from these starters until the removed Improved Holy Strike talent is reconciled. The existing specialist pages remain available as historical references.</p>
  </section>
}
