import { useState } from 'react'
import { ArrowDown, ArrowUpRight, Plus, Search, X } from 'lucide-react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { labCards, labCardSources } from './data/dandyLabCards'
import { planAmbrosia, wholeAmbrosia } from './lib/labAmbrosia'

const canonical = 'https://buildforgetools.com/roblox/dandys-world/lab-cards'
const robloxGame = 'https://www.roblox.com/games/16116270224/Dandys-World'
const studioDevlog = 'https://www.youtube.com/watch?v=61zPppIwcQo'
const cardRarities = ['Common', 'Rare', 'Legendary'].filter(rarity => labCards.some(card => card.rarity === rarity))
const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Dandy's World Lab Cards & Ambrosia Calculator",
  url: canonical,
  inLanguage: 'en',
  dateModified: '2026-11-23',
  isAccessibleForFree: true,
}

const numberFormat = new Intl.NumberFormat('en-US')

export default function DandyLabCardsPage() {
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [balance, setBalance] = useState('0')
  const [perRun, setPerRun] = useState('')
  const query = search.trim().toLowerCase()
  const filtered = labCards.filter(card => (
    (rarity === 'all' || card.rarity === rarity)
    && [card.name, card.effect, card.unlock].some(value => value?.toLowerCase().includes(query))
  ))
  const selected = labCards.filter(card => selectedIds.includes(card.id))
  const total = selected.reduce((sum, card) => sum + card.cost, 0)
  const { shortfall, runs } = planAmbrosia(total, balance, perRun)
  const balanceInvalid = balance !== '' && wholeAmbrosia(balance) === null
  const perRunInvalid = perRun !== '' && !wholeAmbrosia(perRun)

  function toggleCard(id: string) {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(selectedId => selectedId !== id) : [...ids, id])
  }

  return (
    <div className="site-discovery lab-page">
      <DiscoveryHeader />
      <main className="sd-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <header className="lab-intro">
          <div>
            <p className="sd-kicker">ROBLOX · THE LABS</p>
            <h1>Dandy's World Lab Cards &amp; Ambrosia Calculator</h1>
            <p>Compare card effects and research requirements, then work out how many Labs runs you need for your next purchases.</p>
          </div>
          <a className="lab-jump" href="#ambrosia-budget">Jump to budget <ArrowDown size={16} aria-hidden="true" /></a>
        </header>

        <div className="lab-workspace">
          <section className="lab-catalog" aria-labelledby="lab-catalog-heading">
            <div className="lab-catalog-header">
              <h2 id="lab-catalog-heading">Lab Cards</h2>
              <p>Select the cards you want to buy. The budget keeps your picks across filters.</p>
              <div className="lab-controls">
                <label>Search cards
                  <span className="lab-search">
                    <Search size={16} aria-hidden="true" />
                    <input type="search" value={search} placeholder="Name, effect or unlock" onChange={event => setSearch(event.target.value)} />
                  </span>
                </label>
                <label>Rarity
                  <select value={rarity} onChange={event => setRarity(event.target.value)}>
                    <option value="all">All rarities</option>
                    {cardRarities.map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              </div>
              <p className="lab-count" role="status">{filtered.length} of {labCards.length} documented cards</p>
            </div>

            <div className="lab-card-grid">
              {filtered.map(card => {
                const picked = selectedIds.includes(card.id)
                return (
                  <article className={picked ? 'lab-card lab-card-selected' : 'lab-card'} id={card.id} key={card.id}>
                    <div className="lab-card-meta">
                      <span className="lab-rarity" data-rarity={card.rarity}>{card.rarity}</span>
                      <strong>{numberFormat.format(card.cost)} <span>Ambrosia</span></strong>
                    </div>
                    <h3>{card.name}</h3>
                    <p>{card.effect}</p>
                    {card.unlock && <p className="lab-unlock">{card.unlock}</p>}
                    <div className="lab-card-actions">
                      <label className="lab-add">
                        <input type="checkbox" aria-label={`Add ${card.name} to budget`} checked={picked} onChange={() => toggleCard(card.id)} />
                        {picked ? 'In budget' : 'Add to budget'}
                      </label>
                      <a href={card.sources[0]} aria-label={`Source for ${card.name}`}>Source <ArrowUpRight size={12} aria-hidden="true" /></a>
                    </div>
                  </article>
                )
              })}
            </div>
            {filtered.length === 0 && <p className="lab-empty">No cards match. Try another search or rarity.</p>}
            {selected.length > 0 && <a className="lab-mobile-budget" href="#ambrosia-budget">
              View budget · {numberFormat.format(total)} Ambrosia <ArrowDown size={15} aria-hidden="true" />
            </a>}
          </section>

          <section className="lab-budget" id="ambrosia-budget" aria-labelledby="ambrosia-heading">
            <h2 id="ambrosia-heading">Ambrosia calculator</h2>
            <p>Use your own recent Labs earnings for the run estimate.</p>
            <div className="lab-budget-fields">
              <label>Current Ambrosia
                <input inputMode="numeric" autoComplete="off" value={balance} onChange={event => setBalance(event.target.value)} aria-invalid={balanceInvalid} />
              </label>
              <label>Ambrosia per run
                <input inputMode="numeric" autoComplete="off" value={perRun} onChange={event => setPerRun(event.target.value)} placeholder="Your usual yield" aria-invalid={perRunInvalid} />
              </label>
            </div>
            {balanceInvalid && <p className="lab-input-error" role="status">Enter a whole balance of zero or more.</p>}
            {perRunInvalid && <p className="lab-input-error" role="status">Enter a whole amount greater than zero per run.</p>}
            <dl className="lab-totals" aria-live="polite">
              <div><dt>Selected cost</dt><dd aria-label="Selected cost">{numberFormat.format(total)}</dd></div>
              <div><dt>Still needed</dt><dd aria-label="Still needed">{selected.length && shortfall !== null ? numberFormat.format(shortfall) : '—'}</dd></div>
              <div><dt>Estimated runs</dt><dd aria-label="Estimated runs">{selected.length && runs !== null ? numberFormat.format(runs) : '—'}</dd></div>
            </dl>
            {selected.length > 0 ? (
              <>
                <div className="lab-picks-heading">
                  <h3>Purchase list</h3>
                  <button type="button" onClick={() => setSelectedIds([])}>Clear picks</button>
                </div>
                <ul className="lab-picks">
                  {selected.map(card => <li key={card.id}>
                    <span>{card.name}</span>
                    <strong>{numberFormat.format(card.cost)}</strong>
                    <button type="button" aria-label={`Remove ${card.name}`} onClick={() => toggleCard(card.id)}><X size={16} aria-hidden="true" /></button>
                  </li>)}
                </ul>
                <p className="lab-budget-note">Check research gates and shop stock before making a purchase.</p>
              </>
            ) : <p className="lab-empty-picks"><Plus size={16} aria-hidden="true" /> Add a card to start your purchase list.</p>}
          </section>
        </div>

        <section className="lab-guide" aria-labelledby="lab-guide-heading">
          <h2 id="lab-guide-heading">How Lab Cards work</h2>
          <div className="lab-guide-grid">
            <section><h3>Check Dioda’s shop</h3><p>Use Ambrosia to buy cards in the lobby. Some purchases need research progress on a specific Twisted. Limited offers rotate, so check availability in the game.</p></section>
            <section><h3>Bring cards into The Labs</h3><p>Purchased cards stay in your collection. Equipped cards from your team enter the voting pool during a Labs run, where players choose which effect to activate.</p></section>
            <section><h3>Estimate with your own runs</h3><p>Subtract your current Ambrosia from the purchase cost, then divide what remains by your per-run earnings and round up. A 1,200 shortfall at 250 per run takes about five runs.</p></section>
          </div>
        </section>

        <section className="lab-guide lab-sources" id="lab-sources" aria-labelledby="lab-source-heading">
          <h2 id="lab-source-heading">Sources and coverage</h2>
          <p>This is a curated catalog for version 1.0. We reviewed public launch references on <time dateTime="2026-11-23">November 23, 2026</time>. Check Dioda’s shop for current prices, stock and any requirements missing from a card entry.</p>
          <ul>
            <li><a href={robloxGame}>Dandy's World on Roblox</a></li>
            <li><a href={studioDevlog}>BlushCrunch Studio’s 1.0 devlog</a></li>
            {labCardSources.map(source => <li key={source.url}><a href={source.url}>{source.label}</a></li>)}
          </ul>
        </section>
      </main>
      <SiteFooter discovery links={[]} />
    </div>
  )
}
