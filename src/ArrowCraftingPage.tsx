import { useState } from 'react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { useFirstToolAdjustment } from './lib/useFirstToolAdjustment'

const recipes = { Mysterious: 1, Lucky: 3, Bizarre: 9 }
const materials = [
  { label: 'Arrow Parts', perArrow: 3 },
  { label: 'Steel Ingots', perArrow: 2 },
  { label: 'Wood', perArrow: 1 },
] as const

export default function ArrowCraftingPage() {
  const [target, setTarget] = useState<keyof typeof recipes>('Bizarre')
  const [quantity, setQuantity] = useState('1')
  const [owned, setOwned] = useState('0')
  const [stock, setStock] = useState(['0', '0', '0'])
  const record = useFirstToolAdjustment('stand_out_crafting_used')
  const needs = Math.max(0, Number(quantity) * recipes[target] - Number(owned))
  function valid(value: string, min: number) {
    return value.trim() !== '' && Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= 10000
  }
  const ready = valid(quantity, 1) && valid(owned, 0) && stock.every(value => valid(value, 0))
  return <div className="site-discovery stand-page arrow-page"><DiscoveryHeader /><main className="sd-main">
    <nav aria-label="Stand Out reference"><a href="/roblox/stand-out" className="stand-wiki-back">← Stand Out Wiki: Stands, arrows &amp; materials</a></nav>
    <header className="stand-hero"><div><p className="sd-kicker">Roblox / Stand Out</p>
      <h1>Stand Out arrow crafting planner</h1>
      <p>Craft a Bizarre Arrow with <strong>9 Mysterious Arrows</strong> at the workbench in <strong>Big Chop’s Garden</strong>. Enter what you already have to see what’s left to gather.</p>
      <nav className="arrow-jump-links" aria-label="Crafting shortcuts"><a href="#crafting-planner">Jump to the material calculator</a></nav></div>
      <img src="/images/stand-out/cover.webp" width="768" height="432" alt="Stand Out game artwork" /></header>
    <div className="stand-compare stand-pair arrow-craft-guide">
      <section className="stand-card" id="bizarre-arrow-recipe" aria-labelledby="bizarre-recipe-heading">
        <h2 id="bizarre-recipe-heading">How to craft a Bizarre Arrow</h2>
        <p>Have nine Mysterious Arrows? Select <strong>Bizarre Arrow</strong> at the workbench and craft it. If you have fewer than nine, craft the missing Mysterious Arrows first.</p>
        <p>Starting from zero takes <strong>27 Arrow Parts, 18 Steel Ingots and 9 Wood</strong> to make all nine.</p>
      </section>
      <section className="stand-card" id="arrow-workbench" aria-labelledby="arrow-workbench-heading">
        <h2 id="arrow-workbench-heading">Where is the arrow workbench?</h2>
        <p>On your in-game Phone, open <strong>Huber</strong> and travel to <strong>Jodio’s Corner</strong>. Walk past Jodio to Big Chop’s Garden. The wooden workbench is beside Big Chop, among the garden beds.</p>
        <p>On keyboard, walk up to the table and press <kbd>H</kbd> when the craft prompt appears.</p>
      </section>
    </div>
    <section className="stand-compare" id="crafting-planner"><h2>Plan your craft</h2>
      <div className="arrow-inputs stand-card">
        <label>Target arrow<select value={target} onChange={e => { setTarget(e.target.value as keyof typeof recipes); record('target') }}>
          {Object.keys(recipes).map(name => <option key={name}>{name}</option>)}</select></label>
        <label>Target quantity<input type="number" min="1" max="10000" value={quantity} aria-invalid={!valid(quantity, 1)}
          onChange={e => { setQuantity(e.target.value); if (valid(e.target.value, 1)) record('quantity') }} /></label>
        <label>Mysterious Arrows on hand<input type="number" min="0" max="10000" value={owned} aria-invalid={!valid(owned, 0)}
          onChange={e => { setOwned(e.target.value); if (valid(e.target.value, 0)) record('inventory') }} /></label>
        {materials.map(({label}, index) => <label key={label}>{label} on hand<input type="number" min="0" max="10000" value={stock[index]} aria-invalid={!valid(stock[index], 0)}
          onChange={e => { const value = e.target.value; setStock(previous => previous.map((v, i) => i === index ? value : v)); if (valid(value, 0)) record('materials') }} /></label>)}
      </div>
      <div className="stand-card" aria-live="polite"><h3>Materials still to gather</h3>
        {ready ? <><p>{needs} more Mysterious {needs === 1 ? 'Arrow' : 'Arrows'} to craft after using your stock.</p>
          <ul>{materials.map(({ label, perArrow }, i) => <li key={label}><strong>{Math.max(0, needs * perArrow - Number(stock[i]))} {label}</strong> to gather · {needs * perArrow} required</li>)}</ul></>
          : <p>Enter whole numbers up to 10,000. Target quantity starts at one and inventory starts at zero.</p>}</div>
    </section>
    <section className="stand-reading"><h2>Arrow recipes at Big Chop’s Garden</h2>
      <table><caption>Ingredients for one finished arrow</caption><thead><tr><th scope="col">Arrow</th><th scope="col">Workbench recipe</th></tr></thead><tbody>
        <tr><th scope="row">Mysterious</th><td>3 Arrow Parts, 2 Steel Ingots, 1 Wood</td></tr>
        <tr><th scope="row">Lucky</th><td>3 Mysterious Arrows</td></tr><tr><th scope="row">Bizarre</th><td>9 Mysterious Arrows</td></tr></tbody></table>
      <p>For one Bizarre Arrow with four Mysterious Arrows already in your bag, craft five more. Bring 15 Arrow Parts, 10 Steel Ingots and 5 Wood. At the workbench, craft the five regular arrows first, then spend all nine on the Bizarre recipe.</p>
      <h2>Where to get the missing materials</h2>
      <p>Use the metal detector on the beach near Big Chop’s Garden to look for Arrow Parts. Big Chop sells Steel and Wood. Return to the workbench beside him when you have the ingredients.</p>
      <p>Before spending your arrows, <a href="/roblox/stand-out/arrow-calculator">compare Lucky and Bizarre drop chances</a>. For a specific Stand, <a href="/roblox/stand-out/stand-picker">check its acquisition route</a>.</p>
      <p>See the <a href="https://stand-out.site/guides/craft-arrows">fast-travel directions and workbench screenshots</a> and the <a href="https://allthings.how/stand-out-how-to-craft-arrows-with-every-workbench-recipe/">keyboard prompt and workbench menu</a>. Core recipes reviewed November 16, 2026.</p>
    </section></main><SiteFooter discovery links={[]} /></div>
}
