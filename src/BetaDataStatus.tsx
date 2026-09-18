import { ArrowRight, Check } from 'lucide-react'
import { PALADIN_BETA_STATUS } from './data/betaStatus'

export default function BetaDataStatus() {
  const status = PALADIN_BETA_STATUS

  return (
    <section className="beta-data-strip shell" aria-label="WoW Forever Beta data status">
      <div className="beta-data-build">
        <span><Check size={13} /> Current talent dataset</span>
        <strong>Beta build {status.build}</strong>
      </div>
      <div className="beta-data-facts">
        <span>Updated {status.updated}</span>
        <span>{status.talentCount} talent nodes</span>
        <span>{status.newTalentCount} new in WoW Forever</span>
        <span>{status.phaseLabel} · Level cap {status.levelCap}</span>
        <span>{status.added} added · {status.updatedTalents} updated · {status.removed} removed</span>
        <span>{status.updatedTalents} tooltip updates since {status.previousBuild}</span>
      </div>
      <a href={status.changelogHref}>Review Beta changes <ArrowRight size={14} /></a>
    </section>
  )
}
