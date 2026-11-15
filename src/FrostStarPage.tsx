import { useRef, useState } from 'react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { frostStar } from './data/frostStar'
import { track } from './lib/analytics'

function RollEstimate() {
  const [wave, setWave] = useState<number>(9)
  const [rolls, setRolls] = useState('10')
  const used = useRef(false)
  const count = Number(rolls)
  const valid = rolls.trim() !== '' && Number.isSafeInteger(count) && count >= 1 && count <= 1000
  const { denominator } = frostStar.waves.find(row => row.wave === wave)!
  const chance = -100 * Math.expm1(count * Math.log1p(-1 / denominator))
  function recordUse() {
    if (used.current) return
    track('frost_star_odds_used')
    used.current = true
  }
  return <section className="fs-panel" aria-labelledby="roll-title">
    <h2 id="roll-title">What are my odds after several rolls?</h2>
    <p>Choose one wave and enter the number of reward rolls at that wave. The estimate assumes independent rolls at the published rate.</p>
    <div className="fs-fields">
      <label>Reward wave<select value={wave} onChange={event => { setWave(Number(event.target.value)); recordUse() }}>
        {frostStar.waves.map(row => <option key={row.wave} value={row.wave}>Wave {row.wave}</option>)}
      </select></label>
      <label>Number of reward rolls<input type="number" min="1" max="1000" step="1" value={rolls} aria-invalid={!valid} aria-describedby="roll-result" onChange={event => { setRolls(event.target.value); if (event.target.validity.valid && event.target.value !== '') recordUse() }} /></label>
    </div>
    <p className="fs-result" id="roll-result" role="status">{valid ? <><strong>{chance >= 99.95 ? '>99.9' : chance.toFixed(1)}%</strong> chance of at least one Frost Star in {count} wave {wave} {count === 1 ? 'roll' : 'rolls'}.</> : 'Enter a whole number from 1 to 1,000 rolls.'}</p>
    <p>A run may contain more than one wave. Count a roll only when the game awards an eligible reward. This estimate treats each selected wave separately.</p>
  </section>
}

export default function FrostStarPage() {
  return <div className="site-discovery fs-page">
    <DiscoveryHeader />
    <main className="sd-main">
      <div className="sd-intro">
        <p className="sd-kicker">Roblox · The Forge</p>
        <h1>How to get Frost Star in The Forge</h1>
        <p>Look for Frost Star in the <strong>Tower of Hell raid, Tier 15</strong>. The community ore table lists this exotic ore in the reward pools for waves 9 and 10.</p>
      </div>
      <section className="fs-panel" aria-labelledby="rates-title">
        <h2 id="rates-title">Tier 15 drop rates</h2>
        <table><caption>Reported chance per eligible reward roll</caption>
          <thead><tr><th scope="col">Wave</th><th scope="col">Listed odds</th><th scope="col">Chance</th></tr></thead>
          <tbody>{frostStar.waves.map(({ wave, denominator }) => <tr key={wave}><th scope="row">Wave {wave}</th><td>1 in {denominator}</td><td>{100 / denominator}%</td></tr>)}</tbody>
        </table>
        <p>These figures come from Bloxron’s November 10 ore table for the version 1.10 raid expansion. Check the loot preview on the raid difficulty screen before starting a run. <a href={frostStar.oreTable}>View the ore table</a></p>
      </section>
      <section className="fs-panel" aria-labelledby="farm-title">
        <h2 id="farm-title">Should I stop at wave 9?</h2>
        <p>Wave 10 has the higher listed chance per roll. To decide whether staying saves time, check when your run pays out. We could not verify whether leaving after wave 9 keeps its reward, whether both waves pay on a full clear, or how the loot multiplier applies to Frost Star.</p>
        <p>Before repeating a route, compare the loot preview with your end-of-run rewards. Record which wave you finished, how long the run took and how much ore you received. A larger stack and a higher drop chance affect farming differently.</p>
      </section>
      <RollEstimate />
      <section className="fs-panel" aria-labelledby="sources-title">
        <h2 id="sources-title">Sources and version</h2>
        <p>Reviewed <time dateTime="2026-11-15">November 15, 2026</time>. The figures above are community-reported. The developer’s game listing identifies The Forge as a beta. Players describe finding loot odds next to the difficulty selector.</p>
        <ul><li><a href={frostStar.game}>The Forge on Roblox</a></li><li><a href={frostStar.oreTable}>Bloxron’s Frost Star and raid ore tables</a></li><li><a href={frostStar.playerDiscussion}>Player discussion of raid rewards and the loot preview</a></li></ul>
      </section>
    </main>
    <SiteFooter discovery links={[]} />
  </div>
}
