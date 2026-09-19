import { useEffect, useState } from 'react'
import { Check, LockKeyhole, Save } from 'lucide-react'
import { track } from './lib/analytics'

const styles = [
  ['melee', 'Melee', 'Close-range pressure and positioning.'],
  ['magic', 'Magic', 'Spell-focused control and power.'],
  ['ranged', 'Ranged', 'Distance, precision, and mobility.'],
  ['hybrid', 'Hybrid', 'Combine systems through skill inheritance.'],
] as const

export default function EmbervillePlanner() {
  const [style, setStyle] = useState('melee')
  const [notes, setNotes] = useState(() => typeof window === 'undefined' ? '' : localStorage.getItem('emberville-build-notes') ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => { localStorage.setItem('emberville-build-notes', notes) }, [notes])
  const selected = styles.find(([id]) => id === style) ?? styles[0]

  function choose(next: string) {
    setStyle(next)
    track('emberville_style_select', { style: next })
  }
  function save() {
    if (!notes.trim()) return
    localStorage.setItem('emberville-build-notes', notes)
    if (!saved) track('emberville_notes_save', { has_notes: 1 })
    setSaved(true)
  }

  return <section className="ember-planner" id="planner" aria-labelledby="planner-title">
    <div className="ember-panel planner-controls">
      <p className="ember-kicker">BUILD DIRECTION</p>
      <h2 id="planner-title">Plan with confirmed systems</h2>
      <fieldset><legend>Combat direction</legend><div className="style-grid">{styles.map(([id, label, description]) => <button type="button" className={style === id ? 'selected' : ''} aria-pressed={style === id} key={id} onClick={() => choose(id)}><strong>{label}</strong><span>{description}</span></button>)}</div></fieldset>
      <div className="locked-fields">
        <label>Base class<select disabled><option>Awaiting confirmed class data</option></select></label>
        <label>Weapon<select disabled><option>Awaiting confirmed weapon data</option></select></label>
      </div>
      <div className="future-slots"><LockKeyhole aria-hidden="true" /><div><strong>Skill slots coming soon</strong><p>Active, passive, and inherited skill choices will unlock when stable identifiers and rules are confirmed.</p></div></div>
    </div>
    <aside className="ember-panel planner-summary">
      <p className="ember-kicker">BUILD SUMMARY</p>
      <h3>{selected[1]} direction</h3><p>{selected[2]}</p>
      <dl><div><dt>Class</dt><dd>In review</dd></div><div><dt>Weapon</dt><dd>In review</dd></div><div><dt>Skill inheritance</dt><dd><Check size={15} /> Confirmed</dd></div></dl>
      <label>Build notes<textarea maxLength={500} value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false) }} placeholder="Record playstyle ideas and combinations to test…" /><span>{notes.length}/500</span></label>
      <button className="ember-button secondary" type="button" onClick={save} disabled={!notes.trim()}><Save size={17} /> {saved ? 'Saved locally' : 'Save notes'}</button>
    </aside>
  </section>
}
