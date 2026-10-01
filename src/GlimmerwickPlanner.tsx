import { useState, type FormEvent } from 'react'
import { CalendarDays, Check, Download, Leaf, Pencil, Plus, Trash2 } from 'lucide-react'
import { track } from './lib/analytics'
import { GLIMMERWICK_REVIEWED_CROPS } from './data/glimmerwick'
import { createGardenPlan, gardenPlanCsv, gardenSchedule, parseGardenPlan, recordGardenHarvest, type GardenPlan, type GardenPlanting } from './lib/glimmerwickPlanner'

const STORAGE_KEY = 'glimmerwick-garden-plan'
const emptyDraft = (day: number) => ({ crop: '', quantity: '1', plantedDay: String(day), growthDays: '', notes: '' })
type PlantingDraft = ReturnType<typeof emptyDraft>

function storedPlan(): GardenPlan {
  if (typeof window === 'undefined') return createGardenPlan()
  try { return parseGardenPlan(localStorage.getItem(STORAGE_KEY)) } catch { return createGardenPlan() }
}

export default function GlimmerwickPlanner() {
  const [plan, setPlan] = useState(storedPlan)
  const [dayInput, setDayInput] = useState(() => String(plan.currentDay))
  const [draft, setDraft] = useState(() => emptyDraft(plan.currentDay))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [dayError, setDayError] = useState('')
  const [storageMessage, setStorageMessage] = useState('Plans stay in this browser. Export a copy to keep a backup.')
  const schedule = gardenSchedule(plan)
  const next = schedule.find(row => !row.planting.harvestedDay && row.daysRemaining !== null && row.daysRemaining > 0)
  const ready = schedule.filter(row => !row.planting.harvestedDay && row.daysRemaining !== null && row.daysRemaining <= 0).length

  function persist(nextPlan: GardenPlan) {
    setPlan(nextPlan)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPlan))
      setStorageMessage('Saved in this browser. Export a copy to keep a backup.')
    } catch {
      setStorageMessage('Storage unavailable — your plan still works here. Export a CSV before leaving this page.')
    }
  }

  function updateDraft(field: keyof PlantingDraft, value: string) {
    setDraft(current => ({ ...current, [field]: value }))
  }

  function updateDay(event: FormEvent) {
    event.preventDefault()
    const day = Number(dayInput)
    if (!Number.isInteger(day) || day < 1 || day > 9999) {
      setDayError('Enter a whole-number day from 1 to 9999.')
      return
    }
    persist({ ...plan, currentDay: day })
    setDayError('')
    if (!editingId && !draft.crop) setDraft(emptyDraft(day))
    track('glimmerwick_day_update', { planting_count: plan.plantings.length })
  }

  function savePlanting(event: FormEvent) {
    event.preventDefault()
    const crop = draft.crop.trim()
    const quantity = Number(draft.quantity)
    const plantedDay = Number(draft.plantedDay)
    const growthDays = draft.growthDays.trim() ? Number(draft.growthDays) : null
    if (!crop || crop.length > 80 || draft.notes.length > 240) {
      setFormError('Add a crop name of up to 80 characters. Notes can contain up to 240 characters.')
      return
    }
    if (![quantity, plantedDay].every(Number.isInteger)
      || quantity < 1 || quantity > 999 || plantedDay < 1 || plantedDay > 9999
      || (growthDays !== null && (!Number.isInteger(growthDays) || growthDays < 1 || growthDays > 365))) {
      setFormError('Use whole numbers: quantity 1–999, planting day 1–9999, and growth days 1–365, or leave growth days blank when unknown.')
      return
    }
    if (!editingId && plan.plantings.length >= 30) {
      setFormError('This plan holds 30 plantings. Edit or remove a row before adding another.')
      return
    }
    const previous = plan.plantings.find(row => row.id === editingId)
    const sameObservation = previous?.harvestedDay !== undefined && previous.crop === crop && previous.plantedDay === plantedDay && previous.growthDays === growthDays
    const planting: GardenPlanting = {
      id: editingId ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      crop, quantity, plantedDay, growthDays, notes: draft.notes.trim(),
      ...(sameObservation ? { harvestedDay: previous.harvestedDay } : {}),
    }
    const plantings = editingId ? plan.plantings.map(row => row.id === editingId ? planting : row) : [...plan.plantings, planting]
    persist({ ...plan, plantings })
    track(editingId ? 'glimmerwick_planting_edit' : 'glimmerwick_planting_add', { planting_count: plantings.length })
    setEditingId(null)
    setDraft(emptyDraft(plan.currentDay))
    setFormError('')
  }

  function edit(planting: GardenPlanting) {
    setEditingId(planting.id)
    setDraft({ crop: planting.crop, quantity: String(planting.quantity), plantedDay: String(planting.plantedDay), growthDays: planting.growthDays === null ? '' : String(planting.growthDays), notes: planting.notes })
    setFormError('')
    document.getElementById('gw-crop')?.focus()
  }

  function remove(planting: GardenPlanting) {
    const plantings = plan.plantings.filter(row => row.id !== planting.id)
    persist({ ...plan, plantings })
    if (editingId === planting.id) { setEditingId(null); setDraft(emptyDraft(plan.currentDay)); setFormError('') }
    track('glimmerwick_planting_remove', { planting_count: plantings.length })
  }

  function recordHarvest(planting: GardenPlanting) {
    const observed = recordGardenHarvest(planting, plan.currentDay)
    if (!observed) {
      setFormError('Set the current garden day to the actual harvest day first. Record 1–365 elapsed days after planting.')
      return
    }
    persist({ ...plan, plantings: plan.plantings.map(row => row.id === planting.id ? observed : row) })
    if (editingId === planting.id) { setEditingId(null); setDraft(emptyDraft(plan.currentDay)) }
    setFormError('')
    track('glimmerwick_harvest_record', { planting_count: plan.plantings.length })
  }

  function exportCsv() {
    try {
      const blob = new Blob([gardenPlanCsv(plan)], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'glimmerwick-garden-plan.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      track('glimmerwick_plan_export', { planting_count: plan.plantings.length })
    } catch {
      setStorageMessage('CSV export is unavailable in this browser. Your planning table is still available to copy.')
    }
  }

  return <section className="gw-tool" id="garden-planner" data-surface="glimmerwick-garden" aria-labelledby="gw-tool-title">
    <div className="gw-section-heading"><div><p className="gw-eyebrow">YOUR GARDEN NOTEBOOK</p><h2 id="gw-tool-title">Make room for the next harvest</h2></div><span className="gw-local-badge"><Leaf size={15} /> No account needed</span></div>
    <p className="gw-tool-intro">Growth times come from your observations, not a prefilled game database. Use a consecutive day count of your own; the planner does not assume a season length.</p>
    <div className="gw-workbench">
      <aside className="gw-input-panel">
        <form className="gw-day-form" onSubmit={updateDay} noValidate>
          <label htmlFor="gw-day"><CalendarDays size={17} /> Current garden day</label>
          <div><input id="gw-day" type="number" min="1" max="9999" step="1" value={dayInput} onChange={event => setDayInput(event.target.value)} /><button className="gw-button gw-button-quiet" type="submit">Update day</button></div>
          {dayError && <p className="gw-error" role="alert">{dayError}</p>}
        </form>
        <form className="gw-planting-form" onSubmit={savePlanting} noValidate>
          <h3>{editingId ? 'Edit your planting' : 'Add a planting'}</h3>
          <div className="gw-reviewed-crop"><span>SOURCE-LINKED CROP NAMES</span>{GLIMMERWICK_REVIEWED_CROPS.map(crop => <div key={crop.id}><div className="gw-crop-heading"><strong>{crop.name}</strong><button className="gw-button gw-button-quiet" type="button" onClick={() => { setDraft(current => ({ ...current, crop: crop.name, growthDays: '' })); setFormError('') }}>Use {crop.name}</button></div><p>{crop.version} name only. Growth time, season, yield and seed price remain unverified.</p><a href={crop.sources[0].href} target="_blank" rel="noreferrer">{crop.sources[0].label}</a></div>)}</div>
          <label htmlFor="gw-crop">Crop name</label><input id="gw-crop" value={draft.crop} maxLength={80} onChange={event => updateDraft('crop', event.target.value)} placeholder="Use the name from your game" />
          <div className="gw-field-pair"><div><label htmlFor="gw-quantity">Quantity</label><input id="gw-quantity" type="number" min="1" max="999" step="1" value={draft.quantity} onChange={event => updateDraft('quantity', event.target.value)} /></div><div><label htmlFor="gw-planted">Planting day</label><input id="gw-planted" type="number" min="1" max="9999" step="1" value={draft.plantedDay} onChange={event => updateDraft('plantedDay', event.target.value)} /></div></div>
          <label htmlFor="gw-growth">Observed growth days</label><input id="gw-growth" type="number" min="1" max="365" step="1" value={draft.growthDays} onChange={event => updateDraft('growthDays', event.target.value)} placeholder="Your measured estimate" aria-describedby="gw-growth-help" />
          <p className="gw-field-help" id="gw-growth-help">Optional: leave blank if unknown. Readiness estimate = planting day + elapsed growth days. Your entries are personal observations, not verified game defaults.</p>
          <label htmlFor="gw-notes">Notes</label><textarea id="gw-notes" value={draft.notes} maxLength={240} onChange={event => updateDraft('notes', event.target.value)} placeholder="Watering, a song to test, or a quest ingredient…" rows={3} />
          {formError && <p className="gw-error" role="alert">{formError}</p>}
          <div className="gw-form-actions"><button className="gw-button" type="submit"><Plus size={16} />{editingId ? 'Save changes' : 'Add planting'}</button>{editingId && <button className="gw-text-button" type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft(plan.currentDay)); setFormError('') }}>Cancel edit</button>}</div>
        </form>
      </aside>
      <div className="gw-plan-panel">
        <div className="gw-stats"><div><span>Plants planned</span><strong>{plan.plantings.reduce((sum, row) => sum + row.quantity, 0)}</strong></div><div><span>Ready to check</span><strong>{ready}</strong></div><div><span>Next estimate</span><strong>{next ? `Day ${next.readyDay}` : '—'}</strong></div></div>
        <div className="gw-schedule-heading"><h3>Harvest schedule</h3><button className="gw-button gw-button-quiet" type="button" onClick={exportCsv} disabled={!plan.plantings.length}><Download size={16} />Export CSV</button></div>
        {schedule.length ? <div className="gw-table-scroll"><table aria-label="Your harvest schedule"><thead><tr><th scope="col">Planting</th><th scope="col">Qty</th><th scope="col">Planted</th><th scope="col">Ready / observed</th><th scope="col">To check</th><th scope="col">Actions</th></tr></thead><tbody>{schedule.map(({ planting, readyDay, daysRemaining }) => <tr key={planting.id}>
          <td><strong>{planting.crop}</strong>{planting.notes && <small>{planting.notes}</small>}</td><td>{planting.quantity}</td><td>Day {planting.plantedDay}</td>
          <td>{planting.harvestedDay ? <><span>Observed · Day {planting.harvestedDay}</span><small>{planting.growthDays} elapsed {planting.growthDays === 1 ? 'day' : 'days'} · Your record</small></> : readyDay === null ? 'Growth unknown' : `Day ${readyDay}`}</td>
          <td><span className={daysRemaining === 0 && !planting.harvestedDay ? 'gw-ready' : 'gw-waiting'}>{planting.harvestedDay ? 'Harvest recorded' : daysRemaining === null ? 'Observe in game' : daysRemaining === 0 ? 'Ready to check' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`}</span></td>
          <td><div className="gw-row-actions">{!planting.harvestedDay && <button type="button" aria-label={`Record harvest for ${planting.crop}`} title="Record a harvest on the current garden day" onClick={() => recordHarvest(planting)}><Check size={16} /></button>}<button type="button" aria-label={`Edit ${planting.crop}`} onClick={() => edit(planting)}><Pencil size={16} /></button><button type="button" aria-label={`Remove ${planting.crop}`} onClick={() => remove(planting)}><Trash2 size={16} /></button></div></td>
        </tr>)}</tbody></table></div> : <div className="gw-empty"><Leaf size={34} /><h4>A place for your first planting</h4><p>Add a reviewed crop name or your own. Growth time can stay unknown until you observe a harvest.</p></div>}
        <p className="gw-field-help">To record a harvest, first set the current garden day to the day you actually harvested, then use the check mark on that row. This records elapsed days for that planting only; it does not prove the earliest possible maturity day or a universal crop timing.</p>
        <p className="gw-storage" role="status">{storageMessage}</p>
        <p className="gw-estimate-note">Estimates do not account for weather, missed watering, skills, spells or regrowth. Quantity counts planned plants, not harvest yield. Check your garden in-game before treating a row as ready.</p>
      </div>
    </div>
  </section>
}
