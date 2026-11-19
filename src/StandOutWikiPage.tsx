import { useState } from 'react'
import { ArrowDown, ArrowUpRight, BookOpen, Calculator, Hammer } from 'lucide-react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { acquisition, stands, type StoryStage } from './data/standOut'

const tools = [
  { href: '/roblox/stand-out/stand-picker', title: 'Choose a Stand', detail: 'Compare PvP, raid and farming picks before rerolling.', icon: BookOpen },
  { href: '/roblox/stand-out/arrow-calculator', title: 'Compare arrow odds', detail: 'Turn your arrow or Train Token budget into rolls and rarity chances.', icon: Calculator },
  { href: '/roblox/stand-out/arrow-crafting', title: 'Plan your materials', detail: 'Subtract your inventory and find what is still missing for a craft.', icon: Hammer },
]
const rarities = ['Rare', 'Epic', 'Legendary', 'Mythical', 'Pinnacle', 'Evolution', 'Quest']
const schema = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': 'https://buildforgetools.com/roblox/stand-out#page', url: 'https://buildforgetools.com/roblox/stand-out', name: 'Stand Out Roblox Wiki', description: 'A dated Stand directory with selected moves, acquisition routes, arrow references and planning tools.', inLanguage: 'en', isAccessibleForFree: true },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'BuildForgeTools', item: 'https://buildforgetools.com/' },
      { '@type': 'ListItem', position: 2, name: 'Stand Out Wiki', item: 'https://buildforgetools.com/roblox/stand-out' },
    ] },
  ],
}

export default function StandOutWikiPage() {
  const [query, setQuery] = useState('')
  const [rarity, setRarity] = useState('all')
  const [stage, setStage] = useState<StoryStage>('story')
  const filtered = stands.filter(stand => stand.name.toLowerCase().includes(query.trim().toLowerCase()) && (rarity === 'all' || stand.tier === rarity))
  function resetFilters() { setQuery(''); setRarity('all') }

  return <div className="site-discovery stand-page stand-wiki"><DiscoveryHeader /><main className="sd-main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <header className="stand-hero"><div><p className="sd-kicker">ROBLOX / FIELD GUIDE</p><h1>Stand Out Roblox Wiki</h1><p>Find a Stand, check its selected moves and acquisition route, then plan the arrows and materials you need. Start with the directory or open a calculator below.</p><a className="sd-primary" href="#stands">Explore {stands.length} Stand records <ArrowDown size={16} aria-hidden="true" /></a><p className="sw-snapshot">Independent fan reference · Stand snapshot: November 15, 2026</p></div><img src="/images/stand-out/cover.webp" width="768" height="432" fetchPriority="high" alt="Stand Out game artwork showing a player with a purple Stand." /></header>
    <nav className="sw-jump" aria-label="Wiki sections"><a href="#stands">Stand directory</a><a href="#arrows">Arrows &amp; materials</a><a href="#progression">Getting your next Stand</a><a href="#sources">Sources &amp; coverage</a></nav>
    <section className="sw-tools" aria-label="Stand Out planning tools">{tools.map(({ href, title, detail, icon: Icon }, index) => <a key={href} href={href}><span className="sw-step">0{index + 1} <Icon size={21} aria-hidden="true" /></span><h2>{title} <ArrowUpRight size={18} aria-hidden="true" /></h2><p>{detail}</p></a>)}</section>

    <section id="stands" className="sw-section" aria-label="Stand directory"><div className="sw-heading"><div><p className="sd-kicker">LOOK UP YOUR ROLL</p><h2>Stand directory</h2></div><span>{stands.length} documented records</span></div>
      <p>Rarity is an acquisition category, not a power ranking. This directory includes quest, evolution and removed records; a listed Stand is not necessarily obtainable from arrows. Open a card for three selected moves and the route recorded in our November 15 snapshot.</p>
      <div className="sw-filters"><label>Find a Stand<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try Star Platinum or Harvest" /></label><label>Rarity<select value={rarity} onChange={event => setRarity(event.target.value)}><option value="all">All rarities &amp; routes</option>{rarities.map(value => <option key={value}>{value}</option>)}</select></label><label>Story progress<select value={stage} onChange={event => setStage(event.target.value as StoryStage)}><option value="story">Playing the story</option><option value="override">Story pool override on</option><option value="complete">Story complete</option></select></label></div>
      <div className="sw-results"><p role="status">Showing {filtered.length} of {stands.length} records</p>{(query || rarity !== 'all') && <button type="button" onClick={resetFilters}>Reset filters</button>}</div>
      {filtered.length === 0 && <p className="sw-empty">No Stands match these filters. Try another name or reset the filters.</p>}
      <div className="sw-directory">{filtered.map(stand => { const route = acquisition(stand, stage); return <details id={'stand-' + stand.id} key={stand.id} className="sw-record"><summary><h3>{stand.name}</h3><span className="stand-meta">{stand.tier} · {stand.part}</span></summary><div className="sw-record-body"><div className="stand-route"><h4>{route.label}</h4><p>{route.detail}</p></div><h4>Selected moves · listed base cooldowns</h4><dl className="stand-moves">{stand.moves.map(move => <div key={move.name}><dt>{move.name}</dt><dd>{move.cooldown || 'Unlisted'}</dd></div>)}</dl><a href={'https://standout.wiki/stands/' + stand.id + '/'}>{stand.name} community profile <ArrowUpRight size={14} aria-hidden="true" /></a></div></details> })}</div>
    </section>

    <section id="arrows" className="sw-section"><p className="sd-kicker">SPEND WITH A PLAN</p><h2>Stand Out arrows and crafting materials</h2><p>Mysterious Arrows use the eligible pool; Lucky excludes Rare, and Bizarre excludes Rare and Epic. Story restrictions and special acquisition routes still matter. A rarity percentage does not give the chance of a particular Stand.</p>
      <div className="sw-table"><table><caption>Core recipes used by our crafting planner · November 16 snapshot</caption><thead><tr><th scope="col">Craft</th><th scope="col">Ingredients</th><th scope="col">Next step</th></tr></thead><tbody><tr><th scope="row">Mysterious Arrow</th><td>3 Arrow Parts + 2 Steel + 1 Wood</td><td>Start a material plan</td></tr><tr><th scope="row">Lucky Arrow</th><td>3 Mysterious Arrows</td><td>Compare rolls for your budget</td></tr><tr><th scope="row">Bizarre Arrow</th><td>9 Mysterious Arrows</td><td>Compare the narrower rarity pool</td></tr></tbody></table></div>
      <p>Arrow Parts are ingredients, not arrows you can roll. Part 3 and Part 5 focus arrows target their respective parts; the Part 9 item is a Mysterious Rock. The three core recipes above are the ones supported by our planner.</p>
      <nav className="sw-links" aria-label="Arrow planning"><a href="/roblox/stand-out/arrow-calculator">Calculate Lucky vs Bizarre odds →</a><a href="/roblox/stand-out/arrow-crafting">Calculate missing crafting materials →</a></nav>
    </section>

    <section id="progression" className="sw-section"><h2>How to get your next Stand</h2><ol className="sw-route-steps"><li><h3>Decide what you need it for</h3><p>Choose a job before a rarity. Our <a href="/roblox/stand-out/stand-picker">Stand tier list and comparison tool</a> explains editorial picks for PvP, raids and farming, with move details alongside them. These are playstyle recommendations, not measured win rates.</p></li><li><h3>Check the acquisition route</h3><p>Set your story progress in the directory. Some records are blocked during the story, some use quests or evolution, and others were removed from the arrow pool. For example, Hermit Purple has a quest route and Star Platinum: The World uses an evolution route in this snapshot. Spending more arrows does not bypass those requirements.</p></li><li><h3>Check your budget before spending</h3><p>Use the arrow calculator to compare attempts, then the crafting planner to account for materials you already own. Its probabilities model independent attempts at a rarity. They do not promise a specific Stand, a pity reward or a guaranteed result.</p></li></ol></section>

    <section id="sources" className="sw-section sw-sources"><h2>Sources and coverage</h2><p>This is an independent fan guide, not the official Stand Out wiki or a live game database. The 48 records, selected moves and acquisition rules reuse our November 15, 2026 community snapshot. Core crafting recipes were reviewed for the planner on November 16. Publishing this hub on November 19 does not mean every Stand has been checked against a new patch.</p><p>“Unlisted” means we do not have a cooldown in the stored source record; it does not mean zero. Each card links to its community profile for the fuller moveset and subsequent changes. Check the game before spending scarce items if a later patch conflicts with this reference.</p><ul><li><a href="https://www.roblox.com/games/128828638194450/STAND-OUT">Stand Out on Roblox</a> — official game entry.</li><li><a href="https://trello.com/b/7IlUxQPN/stand-out-official-trello">Developer Trello</a> — developer reference; availability may vary.</li><li><a href="https://standout.wiki/">Stand Out community wiki</a> and <a href="https://standout.wiki/arrows/">arrow reference</a> — community sources for the stored Stand and arrow snapshot.</li><li><a href="https://stand-out.site/guides/craft-arrows">Arrow crafting guide</a> and <a href="https://powerupgaming.co.uk/2026/11/15/how-to-craft-arrows-in-stand-out-full-recipes-guide/">PowerUp Gaming recipe guide</a> — sources used by our material planner.</li></ul><p>Found a changed recipe or move? <a href="/contact">Send a correction</a> with the Stand name and a source or in-game screenshot.</p></section>
  </main><SiteFooter discovery links={[]} /></div>
}
