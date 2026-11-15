import { useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Calculator, Compass, Gem, Layers3, Mountain } from 'lucide-react'
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
  return <section className="fs-calculator fs-card" id="odds" aria-labelledby="roll-title">
    <h2 id="roll-title"><Calculator aria-hidden="true" />Drop chance calculator</h2>
    <p>Choose a wave and the number of eligible reward rolls.</p>
    <div className="fs-fields">
      <label>Reward wave<select value={wave} onChange={event => { setWave(Number(event.target.value)); recordUse() }}>
        {frostStar.waves.map(row => <option key={row.wave} value={row.wave}>Wave {row.wave}</option>)}
      </select></label>
      <label>Reward rolls<input type="number" min="1" max="1000" step="1" value={rolls} aria-invalid={!valid} aria-describedby="roll-result" onChange={event => { setRolls(event.target.value); if (event.target.validity.valid && event.target.value !== '') recordUse() }} /></label>
    </div>
    <div className="fs-result" id="roll-result" role="status">{valid ? <>
      <strong>{chance >= 99.95 ? '>99.9' : chance.toFixed(1)}<small>%</small></strong>
      <span>chance of at least one Frost Star in {count} wave {wave} {count === 1 ? 'roll' : 'rolls'}</span>
    </> : <span>Enter a whole number from 1 to 1,000 rolls.</span>}</div>
    <p className="fs-note">Assumes independent rolls at the listed rate. Count each eligible reward at the selected wave.</p>
  </section>
}

export default function FrostStarPage() {
  return <div className="site-discovery fs-page">
    <DiscoveryHeader />
    <main className="sd-main">
      <header className="fs-hero">
        <img className="fs-art" src="/images/the-forge/frost-star.webp" alt="" fetchPriority="high" />
        <div className="fs-hero-copy">
          <p className="sd-kicker">Roblox <span>/</span> The Forge</p>
          <h1><span className="fs-sr">How to get </span>Frost Star<span className="fs-sr"> in The Forge</span></h1>
          <p className="fs-lead">Hunt this exotic ore in Tier 15 of the Tower of Hell, or check your weekly Gold Ore Cards at the Island 4 Raid Trader.</p>
          <a className="fs-jump" href="#rates">View drop rates <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </header>
      <div className="fs-facts">
        <div><Mountain aria-hidden="true" /><dl><dt>Raid</dt><dd>Tower of Hell</dd></dl></div>
        <div><Layers3 aria-hidden="true" /><dl><dt>Difficulty</dt><dd>Tier 15</dd></dl></div>
        <div><Gem aria-hidden="true" /><dl><dt>Ore rarity</dt><dd>Exotic</dd></dl></div>
      </div>
      <div className="fs-workbench">
        <section className="fs-card fs-rates" id="rates" aria-labelledby="rates-title">
          <h2 id="rates-title"><Gem aria-hidden="true" />Tier 15 drop rates</h2>
          <table><caption>Community-reported odds per eligible reward roll.</caption>
            <thead><tr><th scope="col">Wave</th><th scope="col">Listed odds</th><th scope="col">Chance</th></tr></thead>
            <tbody>{frostStar.waves.map(({ wave, denominator }) => <tr key={wave}><th scope="row">Wave {wave}</th><td>1 in {denominator}</td><td>{100 / denominator}%</td></tr>)}</tbody>
          </table>
          <p className="fs-note">Bloxron lists both waves in its November 10 ore table for the version 1.10 raid expansion. Check the loot preview on the difficulty screen before starting.</p>
          <a className="fs-text-link" href={frostStar.oreTable}>View the ore table <ArrowUpRight aria-hidden="true" size={15} /></a>
        </section>
        <RollEstimate />
      </div>
      <div className="fs-reading">
        <section aria-labelledby="farm-title">
          <h2 id="farm-title"><Compass aria-hidden="true" />Should I stop at wave 9?</h2>
          <p>If your group can finish wave 10, continue to the victory screen. The ore table lists Frost Star at wave 9, but we found no Tier 15 test showing that a player who voluntarily leaves after that wave keeps the reward. A <a href={frostStar.raidVictory}>player’s Tier 15 victory report</a> shows the end-of-run loot. The report does not identify the wave behind each drop.</p>
          <h3>When would stopping early save time?</h3>
          <p>Suppose each route pays exactly one eligible roll at its final wave and your group reliably completes both. The listed rates are 0.8% and 1%, so wave 10 can take 25% longer for the same expected number of successful rolls per hour. If a wave 9 cycle takes 8 minutes including re-entry, the break-even time for a full cycle is 10 minutes.</p>
          <p>Only use that comparison once you know your early exit pays out. Whether a full clear rolls both waves independently is still unverified. We count eligible rolls individually in the calculator above.</p>
          <h3>How many rolls for a 50% or 90% chance?</h3>
          <table><caption>Eligible rolls at the same wave, assuming independent rewards</caption><thead><tr><th scope="col">Target chance</th>{frostStar.waves.map(w => <th scope="col" key={w.wave}>Wave {w.wave}</th>)}</tr></thead>
          <tbody>{[0.5, 0.9].map(target => <tr key={target}><th scope="row">{target * 100}%</th>{frostStar.waves.map(w => <td key={w.wave}>{Math.ceil(Math.log1p(-target) / Math.log1p(-1 / w.denominator))} rolls</td>)}</tr>)}</tbody></table>
          <p>At the 50% mark, roughly half of players would still have no drop under this model. Count rewards actually received when comparing your own runs.</p>

        </section>
        <section aria-labelledby="raid-shop" className="fs-sources">
          <h2 id="raid-shop">Can I get Frost Star before clearing Tier 15?</h2>
          <p>Check the Raid Trader on Island 4. The November 14 update lists Frost Star among the ores on weekly Gold Ore Cards. Clearing Tier 11 through Tier 15 awards Gold Raid Shards, so a group farming a lower tier in that range can still use the shop.</p>
          <p>Reveal your three personal Gold cards and check the ore on each one. If Frost Star appears, you can buy it. One weekly reroll costs 30 Gold Shards and gives another chance to see it. The notes give no per-ore card odds. <a href={frostStar.raidShopNotes}>Read the November 14 Raid Shop notes</a>.</p>
          <h2 id="sources-title">Sources and version</h2>
          <p>Community rates reviewed <time dateTime="2026-11-15">November 15, 2026</time>. The developer lists the game as a beta.</p>
          <ul>{[[frostStar.game, 'The Forge on Roblox'], [frostStar.oreTable, 'Bloxron raid ore tables'], [frostStar.raidVictory, 'Tier 15 player victory report'], [frostStar.raidShopNotes, 'November 14 patch notes reproduced by RoCodes']].map(([href, label]) => <li key={href}><a href={href}>{label}<ArrowUpRight size={15} aria-hidden="true" /></a></li>)}</ul>
        </section>
      </div>
    </main>
    <SiteFooter discovery links={[]} />
  </div>
}
