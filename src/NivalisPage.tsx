import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowRight, BarChart3, Calculator, Download, ExternalLink, Store, TrendingUp } from 'lucide-react'
import { track } from './lib/analytics'
import { calculateProfit, parseProfitPlan, profitPlanCsv, validScenario, type ProfitScenario } from './lib/nivalisProfit'
import { NIVALIS_PAGE } from './data/nivalis'

const STORAGE_KEY = 'nivalis-profit-plan'
const number = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fields = [
  ['price', 'Selling price per unit', '0.01'], ['cost', 'Variable cost per unit', '0.01'],
  ['sales', 'Units sold per period', '1'], ['fixedCost', 'Fixed costs per period', '0.01'],
  ['hours', 'Operating hours per period', '0.01'], ['investment', 'Initial investment', '0.01'],
] as const
type Draft = Record<'name' | typeof fields[number][0], string>
const emptyDraft = (index: number): Draft => ({ name: `Business ${index === 0 ? 'A' : 'B'}`, price: '', cost: '', sales: '', fixedCost: '', hours: '', investment: '' })
const toDraft = (row: ProfitScenario): Draft => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value)])) as Draft
function restoredScenarios() {
  if (typeof window === 'undefined') return []
  try { return parseProfitPlan(localStorage.getItem(STORAGE_KEY)).scenarios } catch { return [] }
}

export default function NivalisPage() {
  const [scenarios, setScenarios] = useState<ProfitScenario[]>(restoredScenarios)
  const [active, setActive] = useState(0)
  const [draft, setDraft] = useState<Draft>(() => scenarios[0] ? toDraft(scenarios[0]) : emptyDraft(0))
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const [storage, setStorage] = useState('Calculated scenarios stay in this browser. Export CSV for a backup.')
  const current = scenarios[active]
  const result = current && !dirty ? calculateProfit(current) : null
  function persist(rows: ProfitScenario[]) {
    setScenarios(rows)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, scenarios: rows })); setStorage('Saved in this browser. Export CSV for a backup.') }
    catch { setStorage('Storage unavailable — calculations still work. Export CSV before leaving.') }
  }
  function select(index: number) {
    setActive(index); setDraft(scenarios[index] ? toDraft(scenarios[index]) : emptyDraft(index)); setDirty(false); setError('')
  }
  function calculate(event: FormEvent) {
    event.preventDefault()
    if (!draft.price.trim() || !draft.cost.trim() || !draft.sales.trim()) { setError('Enter a selling price, variable cost and units sold first.'); return }
    const row: ProfitScenario = { name: draft.name.trim(), price: Number(draft.price), cost: Number(draft.cost), sales: Number(draft.sales), fixedCost: Number(draft.fixedCost), hours: Number(draft.hours), investment: Number(draft.investment) }
    if (!validScenario(row)) { setError('Use a name up to 60 characters, whole units sold and non-negative values. Currency supports two decimals and values up to 1,000,000; hours up to 10,000.'); return }
    const rows = [...scenarios]; rows[active] = row
    persist(rows); setDirty(false); setError('')
    track('nivalis_calculate', { scenario_count: rows.length })
  }
  function reset() {
    persist([]); setActive(0); setDraft(emptyDraft(0)); setDirty(false); setError('')
    track('nivalis_reset', { scenario_count: 0 })
  }
  function exportCsv() {
    let url: string | undefined
    let link: HTMLAnchorElement | undefined
    try {
      url = URL.createObjectURL(new Blob([profitPlanCsv(scenarios)], { type: 'text/csv;charset=utf-8' }))
      link = document.createElement('a'); link.href = url; link.download = 'nivalis-business-profit.csv'
      document.body.appendChild(link); link.click()
      track('nivalis_export', { scenario_count: scenarios.length })
    } catch { setStorage('CSV export is unavailable. You can still copy the figures from the comparison table.') }
    finally { link?.remove(); if (url) URL.revokeObjectURL(url) }
  }
  return <div className="nivalis-site">
    <header className="nv-header"><a className="nv-brand" href="/">BuildForge<span>Tools</span></a><nav aria-label="Nivalis tools"><a href="#profit-calculator">Calculator</a><a href="#nv-method">How it works</a><a href="/">All games <ArrowRight size={14}/></a></nav></header>
    <main>
      <section className="nv-hero nv-width"><div><p className="nv-kicker"><Store size={16}/> NIVALIS NIGHTS · BUSINESS WORKBENCH</p><h1>Nivalis Nights <span>Business Profit Calculator</span></h1><p className="nv-lead">Put your next business idea through the numbers. Compare selling prices, ingredient costs and trading volume before you invest.</p><div className="nv-badges"><span>Player-input estimates</span><span>Pre-release · Sep 29, 2026</span></div><a className="nv-button" href="#profit-calculator">Calculate a scenario <ArrowDown size={16}/></a></div><aside className="nv-formula-art" aria-label="Profit model"><BarChart3 size={38}/><p>THE BOTTOM LINE</p><strong>Revenue<br/><span>− Costs</span></strong><div className="nv-art-line"/><b>= Your estimated profit</b><small>A planning model using your inputs.</small></aside></section>
      <section className="nv-width nv-tool" id="profit-calculator" data-surface="nivalis-profit" aria-labelledby="nv-tool-title">
        <div className="nv-section-head"><div><p className="nv-kicker">ONE PERIOD. TWO POSSIBILITIES.</p><h2 id="nv-tool-title">Plan your business margin</h2></div><span className="nv-local"><Calculator size={15}/> Local calculations</span></div>
        <p className="nv-intro">No verified recipe prices or business costs are prefilled. Use values you observe in-game or want to test. Sales, fixed costs and hours must refer to the same trading period. All currency values use your game’s currency units.</p>
        <div className="nv-workbench">
          <aside className="nv-inputs"><div role="tablist" aria-label="Business scenarios">{[0, 1].map(index => <button key={index} id={`nv-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls="nv-input-panel" disabled={index === 1 && !scenarios[0]} onClick={() => select(index)}>Business {index === 0 ? 'A' : 'B'}</button>)}</div>
            <p className="nv-small">Calculate A first, then open B to compare. Switching tabs restores the last calculated inputs.</p>
            <form id="nv-input-panel" role="tabpanel" aria-labelledby={`nv-tab-${active}`} onSubmit={calculate} noValidate>
              <label htmlFor="nv-name">Business name</label><input id="nv-name" value={draft.name} maxLength={60} onChange={event => { setDraft({ ...draft, name: event.target.value }); setDirty(true) }}/>
              <div className="nv-field-grid">{fields.map(([key, label, step]) => <div key={key}><label htmlFor={`nv-${key}`}>{label}</label><input id={`nv-${key}`} type="number" min="0" max={key === 'hours' ? 10000 : 1e6} step={step} value={draft[key]} placeholder={['hours', 'investment', 'fixedCost'].includes(key) ? 'Optional · 0 if blank' : 'Enter observed value'} onChange={event => { setDraft({ ...draft, [key]: event.target.value }); setDirty(true) }}/></div>)}</div>
              <p className="nv-small">Include all per-unit ingredients or consumables in variable cost. Add any overhead you choose to model in fixed costs. Hours are optional.</p>
              {error && <p role="alert" className="nv-error">{error}</p>}
              <button type="submit" className="nv-button">Calculate profit <TrendingUp size={16}/></button>
            </form>
          </aside>
          <div className="nv-results" aria-live="polite"><div className="nv-result-head"><h3>{current ? current.name : 'Your estimate'}</h3><span>PER TRADING PERIOD</span></div>
            {result ? <><div className={`nv-net ${result.netProfit < 0 ? 'nv-loss' : ''}`}><span>Estimated net profit</span><strong data-testid="net-profit">{number(result.netProfit)}</strong><small>{result.netProfit < 0 ? 'Costs exceed revenue in this scenario.' : 'After the costs entered below.'}</small></div><dl className="nv-metrics"><div><dt>Revenue</dt><dd>{number(result.revenue)}</dd></div><div><dt>Variable costs</dt><dd>{number(result.variableCost)}</dd></div><div><dt>Fixed costs</dt><dd>{number(current.fixedCost)}</dd></div><div><dt>Contribution per unit</dt><dd>{number(result.contribution)}</dd></div><div><dt>Break-even sales</dt><dd data-testid="break-even">{result.breakEvenUnits === null ? 'Not reachable' : `${result.breakEvenUnits.toLocaleString('en-US')} units`}</dd></div><div><dt>Net profit per hour</dt><dd>{result.perHour === null ? 'Hours not entered' : number(result.perHour)}</dd></div><div><dt>Net margin</dt><dd>{result.marginPercent === null ? 'No revenue' : `${number(result.marginPercent)}%`}</dd></div><div><dt>Investment payback</dt><dd>{result.paybackPeriods === null ? current.investment === 0 ? 'Not entered' : 'No positive profit' : `${number(result.paybackPeriods)} periods`}</dd></div></dl></> : <div className="nv-empty"><Calculator size={40}/><h3>{dirty && current ? 'Recalculate your changes' : 'A clearer view of your next move'}</h3><p>{dirty && current ? 'The previous result is hidden until you calculate again. Comparisons and CSV use the last calculated scenarios.' : 'Enter your own prices and costs to see net profit, break-even volume and an estimated payback period.'}</p></div>}
            <p className="nv-small">This is arithmetic, not a simulation of customer demand, opening hours, spoilage, recipe unlocks or production limits. Only entered costs are included. Payback assumes this period’s profit repeats unchanged.</p>
          </div>
        </div>
        {scenarios.length === 2 && <section className="nv-comparison" aria-labelledby="nv-compare-title"><h3 id="nv-compare-title">Compare your last calculated scenarios</h3><p data-testid="profit-difference">Net profit difference: <strong>{number(Math.abs(calculateProfit(scenarios[0]).netProfit - calculateProfit(scenarios[1]).netProfit))}</strong> per period. Compare equal-length periods; a larger estimate is not a verified best business.</p><div className="nv-table-scroll"><table aria-label="Business scenario comparison"><thead><tr><th scope="col">Scenario</th><th scope="col">Sales</th><th scope="col">Revenue</th><th scope="col">Total costs</th><th scope="col">Net profit</th></tr></thead><tbody>{scenarios.map((row, index) => { const metrics = calculateProfit(row); return <tr key={index}><th scope="row">{index === 0 ? 'A' : 'B'} · {row.name}</th><td>{row.sales}</td><td>{number(metrics.revenue)}</td><td>{number(metrics.variableCost + row.fixedCost)}</td><td>{number(metrics.netProfit)}</td></tr> })}</tbody></table></div></section>}
        <div className="nv-actions"><button className="nv-button nv-quiet" type="button" disabled={!scenarios.length} onClick={exportCsv}><Download size={16}/>Export CSV</button><button className="nv-reset" type="button" onClick={reset}>Reset both businesses</button><p role="status">{storage}</p></div>
      </section>
      <section className="nv-width nv-guide" id="nv-method" aria-labelledby="nv-method-title"><p className="nv-kicker">UNDERSTAND THE NUMBERS</p><h2 id="nv-method-title">From a recipe to a business plan</h2><div className="nv-guide-grid"><article><span>01 / COST</span><h3>Find the cost of one sale</h3><p>For a recipe profit calculation, total the ingredients consumed by one serving. Divide a batch’s ingredient cost by its output if your observed recipe makes several servings. Add other per-sale costs you want to include. Homegrown or fished ingredients can use your own chosen acquisition cost; a zero input means the model assigns no cost to them.</p></article><article><span>02 / VOLUME</span><h3>Keep the period consistent</h3><p>Choose an in-game day, a shift or another interval you can observe. Enter units actually sold during that interval and the fixed costs for the same interval. Unsold stock is not revenue in this model. Production time and capacity do not automatically determine sales.</p></article><article><span>03 / COMPARE</span><h3>Test one change at a time</h3><p>Calculate your current business as A, then enter a different price, cost or sales assumption in B. Changing price does not automatically change customer demand here. Use the two estimates to decide what to test in-game, then revise the numbers with what you observe.</p></article></div><div className="nv-equations"><p><strong>Net profit</strong><span>(selling price − variable cost) × units sold − fixed costs</span></p><p><strong>Break-even units</strong><span>Fixed costs ÷ positive contribution per unit, rounded up</span></p><p><strong>Payback periods</strong><span>Initial investment ÷ positive net profit per period</span></p></div></section>
      <section className="nv-width nv-source" aria-labelledby="nv-source-title"><div><p className="nv-kicker">GAME FACTS AND INPUTS STAY SEPARATE</p><h2 id="nv-source-title">What is confirmed</h2><p>The official Steam page describes growing a business from a noodle stand into restaurants and nightclubs, buying or growing ingredients, and fishing. It lists September 29, 2026 as the planned release date.</p><p>The source confirms these systems, not the numbers in your scenario. Recipe prices, yields, fees, demand and operating costs still need release data or player observations. This page has no complete economy dataset.</p><small>Official reference checked {NIVALIS_PAGE.checkedAt}.</small></div><a className="nv-button nv-quiet" href={NIVALIS_PAGE.source} target="_blank" rel="noreferrer">Official Steam reference <ExternalLink size={16}/></a></section>
      <section className="nv-width nv-faq" aria-labelledby="nv-faq-title"><h2 id="nv-faq-title">Profit calculator questions</h2><details><summary>Can this recommend the most profitable Nivalis Nights recipe?</summary><p>Not without verified recipe and demand data. It compares the figures you enter. A high per-unit margin may still produce less total profit when sales are lower or overhead is higher.</p></details><details><summary>Why does break-even say “Not reachable”?</summary><p>If selling price is equal to or below variable cost, each sale has zero or negative contribution. Increasing volume cannot cover positive fixed costs with that unit margin. Review your inputs before treating the estimate as a game result.</p></details><details><summary>Where are my business scenarios saved?</summary><p>In this browser only, after you calculate. They are not uploaded or synced. Clearing browser storage removes them. CSV contains your last calculated inputs and results; export a backup before leaving if storage is unavailable.</p></details></section>
    </main><footer className="nv-footer nv-width"><div><a className="nv-brand" href="/">BuildForge<span>Tools</span></a><p>Independent planning tool. Not affiliated with ION LANDS or 505 Games.</p></div><nav aria-label="Site information"><a href="/">Game tools</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav></footer>
  </div>
}
