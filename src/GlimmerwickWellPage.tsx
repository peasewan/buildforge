import { useState, type FormEvent } from 'react'
import { ArrowRight, BookOpen, Droplets, Trash2 } from 'lucide-react'

type WellItem = { id: string; name: string; owned: number; keep: number; unitPrice: number }
const STORAGE_KEY = 'glimmerwick-well-ledger'

function readSavedItems(): WellItem[] {
  if (typeof window === 'undefined') return []
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value.slice(0, 20).filter((item): item is WellItem =>
      typeof item === 'object' && item !== null && typeof item.id === 'string'
      && typeof item.name === 'string' && item.name.length <= 60
      && Number.isInteger(item.owned) && item.owned >= 1 && item.owned <= 9999
      && Number.isInteger(item.keep) && item.keep >= 0 && item.keep <= item.owned
      && Number.isFinite(item.unitPrice) && item.unitPrice >= 0 && item.unitPrice <= 1000000)
  } catch { return [] }
}

export default function GlimmerwickWellPage() {
  const [items, setItems] = useState(readSavedItems)
  const [name, setName] = useState('')
  const [owned, setOwned] = useState('1')
  const [keep, setKeep] = useState('0')
  const [unitPrice, setUnitPrice] = useState('')
  const [error, setError] = useState('')
  const [storageNotice, setStorageNotice] = useState('This list stays in this browser.')
  const total = items.reduce((sum, item) => sum + (item.owned - item.keep) * item.unitPrice, 0)

  function save(next: WellItem[]) {
    setItems(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStorageNotice('Saved in this browser.') }
    catch { setStorageNotice('Browser storage is unavailable. The list still works until you leave this page.') }
  }

  function add(event: FormEvent) {
    event.preventDefault()
    const itemName = name.trim()
    const quantity = Number(owned)
    const reserved = Number(keep)
    const price = Number(unitPrice)
    if (!itemName || itemName.length > 60) { setError('Enter an item name of up to 60 characters.'); return }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999 || !Number.isInteger(reserved) || reserved < 0 || reserved > quantity) {
      setError('Owned must be 1–9999 and Keep cannot exceed Owned.'); return
    }
    if (!unitPrice.trim() || !Number.isFinite(price) || price < 0 || price > 1000000 || Math.abs(Math.round(price * 100) - price * 100) > 1e-7) {
      setError('Enter the unit price you saw in your game, with at most two decimal places.'); return
    }
    if (items.length >= 20) { setError('This list holds 20 items. Remove one before adding another.'); return }
    save([...items, { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, name: itemName, owned: quantity, keep: reserved, unitPrice: price }])
    setName(''); setOwned('1'); setKeep('0'); setUnitPrice(''); setError('')
  }

  return <div className="glimmerwick-site gw-well-site">
    <header className="gw-header"><a className="gw-brand" href="/">BuildForge<span>Tools</span></a><nav aria-label="Glimmerwick tools"><a href="/songs-of-glimmerwick">Garden Planner</a><a href="/songs-of-glimmerwick-first-days">First Days</a><a href="/songs-of-glimmerwick-spellcasting">Spellcasting</a></nav></header>
    <main>
      <section className="gw-well-hero"><p className="gw-eyebrow"><Droplets size={16}/> GARDEN WELL · KEEP OR SELL</p><h1>Songs of Glimmerwick Garden Well Sell Planner</h1><p>Set aside what you want to keep, then estimate the value of the remaining items before you drop them into the well. Use the prices shown in your own inventory.</p><a className="gw-button" href="#well-tool">Plan what to sell <ArrowRight size={16}/></a></section>
      <section className="gw-well-grid" id="well-tool" data-surface="glimmerwick-well">
        <form className="gw-well-form" onSubmit={add} noValidate><p className="gw-eyebrow">YOUR INVENTORY NUMBERS</p><h2>Add an item</h2><p>No item prices are prefilled. A Demo player reported that the inventory shows an item’s sale price, while the well itself does not show the amount as you drop it in.</p><label htmlFor="well-name">Item name</label><input id="well-name" value={name} maxLength={60} onChange={event => setName(event.target.value)} placeholder="Name from your inventory"/><div className="gw-well-fields"><div><label htmlFor="well-owned">Owned</label><input id="well-owned" type="number" min="1" max="9999" step="1" value={owned} onChange={event => setOwned(event.target.value)}/></div><div><label htmlFor="well-keep">Keep</label><input id="well-keep" type="number" min="0" max="9999" step="1" value={keep} onChange={event => setKeep(event.target.value)}/></div></div><label htmlFor="well-price">Unit price seen in game</label><input id="well-price" type="number" min="0" max="1000000" step="0.01" value={unitPrice} onChange={event => setUnitPrice(event.target.value)} placeholder="Your observed price"/>{error && <p role="alert" className="gw-error">{error}</p>}<button type="submit" className="gw-button">Add item</button></form>
        <div className="gw-well-plan"><p className="gw-eyebrow">YOUR SELL PLAN</p><h2>Keep first. Sell the rest.</h2><p className="gw-well-total">Estimated proceeds <strong>{total.toFixed(2)}</strong></p><p className="gw-field-help">Arithmetic only: (Owned − Keep) × your observed unit price. This is not a verified launch price list, and it does not account for quests or changing prices.</p>{items.length ? <div className="gw-table-scroll"><table aria-label="Your well plan"><thead><tr><th>Item</th><th>Owned</th><th>Keep</th><th>Sell</th><th>Unit price</th><th>Estimate</th><th/></tr></thead><tbody>{items.map(item => <tr key={item.id}><th scope="row">{item.name}</th><td>{item.owned}</td><td>{item.keep}</td><td>{item.owned - item.keep}</td><td>{item.unitPrice.toFixed(2)}</td><td>{((item.owned - item.keep) * item.unitPrice).toFixed(2)}</td><td><button type="button" aria-label={`Remove ${item.name}`} onClick={() => save(items.filter(row => row.id !== item.id))}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div> : <div className="gw-well-empty">Add an item to see what stays in your inventory and what goes into the well.</div>}<p className="gw-storage" role="status">{storageNotice}</p></div>
      </section>
      <section className="gw-well-help"><p className="gw-eyebrow"><BookOpen size={16}/> WHAT IS ACTUALLY KNOWN</p><h2>How the garden well works</h2><div className="gw-well-cards"><article><h3>The well sells items</h3><p>A launch walkthrough describes dropping unwanted items into the garden well and receiving compensation later. Treat an item put into the well as a sale, not temporary storage.</p><a href="https://intoindiegames.com/walkthroughs/songs-of-glimmerwick-prologue-walkthrough/" target="_blank" rel="noreferrer">Launch walkthrough ↗</a></article><article><h3>Check your inventory for a price</h3><p>A separate Demo hands-on report says the unit sale value appears in inventory, not at the moment of dropping an item in the well. That observation has not been separately reconfirmed for every item in the released game.</p><a href="https://tgexp.com/songs-of-glimmerwick/" target="_blank" rel="noreferrer">Demo inventory observation ↗</a></article><article><h3>Reserve uncertain items</h3><p>If your journal still asks for a crop or ingredient, enter the amount you intend to keep. The opening Basil quest is described inconsistently by launch walkthroughs, so this planner does not prescribe a quantity or decide your quests for you.</p><a href="/songs-of-glimmerwick">Plan garden harvests →</a></article></div></section>
      <section className="gw-well-help gw-well-related"><h2>Continue planning</h2><a href="/songs-of-glimmerwick">Garden Planner →</a><a href="/songs-of-glimmerwick-first-days">First Days Checklist →</a><a href="/songs-of-glimmerwick-spellcasting">Spellcasting Basics →</a></section>
    </main><footer className="gw-footer"><div><a className="gw-brand" href="/">BuildForge<span>Tools</span></a><p>Independent player planning tools. Not affiliated with Eastshade Studios.</p></div><nav aria-label="Site information"><a href="/">All tools</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav></footer>
  </div>
}
