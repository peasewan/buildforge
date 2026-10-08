import { ArrowRight, Check } from 'lucide-react'
import { PALADIN_BETA_STATUS } from './data/betaStatus'

export default function BetaDataStatus() {
  const status = PALADIN_BETA_STATUS

  return (
    <section className="beta-data-strip shell" aria-label="WoW Forever Beta data status">
      <div className="beta-data-build">
        <span><Check size={13} /> Imported client snapshot</span>
        <strong>Beta build {status.build}</strong>
      </div>
      <div className="beta-data-facts">
        <span>70245 structure reviewed {status.updated}</span>
        <span>{status.talentCount} talent nodes</span>
        <span>{status.newTalentCount} new in WoW Forever</span>
        <span>{status.phaseLabel} · Official level cap {status.levelCap} · <a href={status.levelCapSource} target="_blank" rel="noreferrer">Blizzard notes</a></span>
        <span>Level {status.routeSnapshotLevelCap} routes are 11-point starting snapshots; reviewed Level 30 Ret and Protection routes are available.</span>
        <span>October 1 official tuning: Redoubt, Holy Shield, and Champion of the Light checked alongside the resolved rank source; rank text remains community-verified. <a href={status.levelCapSource} target="_blank" rel="noreferrer">Official notes</a></span>
        <span>{status.comparisonLabel}: {status.added} added · {status.updatedTalents} updated · {status.removed} removed</span>
        <span>{status.updatedTalents} talents with {status.updatedRankStrings} changed rank strings since {status.previousBuild} in that comparison</span>
        <span>Improved Holy Strike: official removal. Crusade: client-confirmed absence in 70245. The 52-node 69913 archive remains readable.</span>
      </div>
      <a href={status.changelogHref}>Review Beta changes <ArrowRight size={14} /></a>
    </section>
  )
}
