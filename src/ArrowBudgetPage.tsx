import { useState } from 'react'
import { useFirstToolAdjustment } from './lib/useFirstToolAdjustment'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'

const arrows = [
  { name: 'Lucky', craft: 3, shop: 17, rates: { Epic: 42.5, Legendary: 34, Mythic: 22.1, Pinnacle: 1.5 } },
  { name: 'Bizarre', craft: 9, shop: 33, rates: { Epic: 0, Legendary: 57.9, Mythic: 37.7, Pinnacle: 4.4 } },
]
type Tier = keyof (typeof arrows)[number]['rates']
const tiers: Tier[] = ['Epic', 'Legendary', 'Mythic', 'Pinnacle']
const source = 'https://standout.wiki/arrows/'
function formatChance(percent: number) {
  return percent > 99.995 ? '>99.99%' : percent.toFixed(2) + '%'
}

export default function ArrowBudgetPage() {
  const [currency, setCurrency] = useState<'craft' | 'shop'>('craft')
  const [budget, setBudget] = useState('9')
  const [tier, setTier] = useState<Tier>('Pinnacle')
  const record = useFirstToolAdjustment('stand_out_arrow_used')
  const amount = Number(budget)
  const valid = budget.trim() !== '' && Number.isInteger(amount) && amount >= 0 && amount <= 10000
  const unit = currency === 'craft' ? 'Mysterious Arrows' : 'Train Tokens'
  return <div className="site-discovery stand-page arrow-page"><DiscoveryHeader /><main className="sd-main">
    <nav aria-label="Stand Out reference"><a href="/roblox/stand-out" className="stand-wiki-back">← Stand Out Wiki: Stands, arrows &amp; materials</a></nav>
    <header className="stand-hero"><div><p className="sd-kicker">Roblox / Stand Out</p><h1>Lucky vs Bizarre Arrows</h1><p>Which arrow gives your budget a better chance at the rarity you want? Compare crafting with Mysterious Arrows or buying from the Train Shop.</p></div><img src="/images/stand-out/cover.webp" width="768" height="432" alt="Stand Out on Roblox" /></header>
    <section className="stand-compare"><h2>Compare your arrow budget</h2><div className="arrow-inputs stand-card">
      <label>Pay with<select value={currency} onChange={e => { setCurrency(e.target.value as typeof currency); record('currency') }}><option value="craft">Mysterious Arrows</option><option value="shop">Train Tokens</option></select></label>
      <label>{unit} available<input type="number" min="0" max="10000" step="1" value={budget} onChange={e => { const value = e.target.value; setBudget(value); if (value.trim() && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 10000) record('budget') }} aria-invalid={!valid}/></label>
      <label>Exact target rarity<select value={tier} onChange={e => { setTier(e.target.value as Tier); record('rarity') }}>{tiers.map(t => <option key={t}>{t}</option>)}</select></label></div>
      <div aria-live="polite">{valid ? <div className="stand-pair">{arrows.map(arrow => {
        const cost = arrow[currency]
        const rolls = Math.floor(amount / cost)
        const rate = arrow.rates[tier]
        const chance = 100 * (1 - (1 - rate / 100) ** rolls)
        return <article className="stand-card" key={arrow.name}><h3>{arrow.name} Arrow</h3><p className="arrow-chance">{formatChance(chance)}</p><p>Chance of at least one {tier} in {rolls} {rolls === 1 ? 'roll' : 'rolls'}.</p><p>{cost} {unit} each · {amount % cost} left.</p>{rolls === 0 && <p>You need {cost - amount} more for the first roll.</p>}{rate === 0 && <p>This arrow excludes {tier} Stands.</p>}</article>
      })}</div> : <p>Enter a whole budget from 0 to 10,000.</p>}</div>
      <p><a className="sd-primary" href="/roblox/stand-out/stand-picker#keep-or-reroll">Already rolled? Check whether to keep your Stand</a></p>
    </section><section className="stand-reading"><h2>What nine Mysterious Arrows buy</h2><p>You can craft three Lucky Arrows or one Bizarre Arrow. For a Pinnacle, three independent Lucky rolls give about 4.43% versus 4.40% for one Bizarre. For an Epic, only the Lucky can hit that tier. In the Train Shop the costs change: 33 tokens buy one Bizarre, but only one Lucky with 16 tokens left.</p>
    <p>Short on Mysterious Arrows? <a href="/roblox/stand-out/arrow-crafting">Calculate the crafting materials you still need</a>.</p>
    <h2>Drop rates per arrow</h2><table><caption>Published rarity percentages, rounded as listed</caption><thead><tr><th>Rarity</th>{arrows.map(a => <th key={a.name}>{a.name}</th>)}</tr></thead><tbody>{tiers.map(t => <tr key={t}><th scope="row">{t}</th>{arrows.map(a => <td key={a.name}>{a.rates[t]}%</td>)}</tr>)}</tbody></table>
    <p>The estimate assumes independent attempts at the listed rate. It compares spending your budget on one arrow type at a time. Specific Stand odds depend on the eligible pool. Regular Mysterious Arrows have no published rarity table.</p>
    <p>For a particular Stand, check whether it needs a focus arrow, quest or evolution in the <a href="/roblox/stand-out/stand-picker">Stand picker and acquisition guide</a>.</p><p>Rates and prices checked November 15, 2026 against the <a href={source}>community transcription of in-game arrow listings</a>.</p></section>
  </main><SiteFooter discovery links={[]} /></div>
}
