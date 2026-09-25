import { useEffect, useState } from 'react'
import { Check, Save } from 'lucide-react'
import { track } from './lib/analytics'

const styles = [
  ['melee', 'Melee', 'Close-range pressure and positioning.'],
  ['magic', 'Magic', 'Spell-focused control and power.'],
  ['ranged', 'Ranged', 'Distance, precision, and mobility.'],
  ['hybrid', 'Hybrid', 'Combine systems through skill inheritance.'],
] as const

const experiments = [
  ['class-switching', 'Class switching', 'Compare how this combat direction feels when you change classes.'],
  ['weapon-combos', 'Weapon combos', 'Observe how weapon-bound combos support this direction.'],
  ['skill-inheritance', 'Skill inheritance', 'Test active and passive skills learned through other classes.'],
] as const

export default function EmbervillePlanner() {
  const [style, setStyle] = useState('melee')
  const [experiment, setExperiment] = useState('class-switching')
  const [notes, setNotes] = useState(() => typeof window === 'undefined' ? '' : localStorage.getItem('emberville-build-notes') ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => { localStorage.setItem('emberville-build-notes', notes) }, [notes])
  const selected = styles.find(([id]) => id === style) ?? styles[0]
  const selectedExperiment = experiments.find(([id]) => id === experiment) ?? experiments[0]

  function choose(next: string) {
    setStyle(next)
    track('emberville_style_select', { style: next })
  }
  function chooseExperiment(next: string) {
    setExperiment(next)
    track('emberville_mechanic_select', { mechanic: next })
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
      <fieldset><legend>Mechanic to test</legend><div className="experiment-grid">{experiments.map(([id, label]) => <button type="button" className={experiment === id ? 'selected' : ''} aria-pressed={experiment === id} key={id} onClick={() => chooseExperiment(id)}>{label}</button>)}</div></fieldset>
      <p className="planner-evidence">This is a personal planning workspace. Class, weapon, and skill names are excluded until their exact records and rules are verified. <a href="/emberville-skill-inheritance">Review the confirmed inheritance system</a>.</p>
    </div>
    <aside className="ember-panel planner-summary">
      <p className="ember-kicker">BUILD SUMMARY</p>
      <h3>{selected[1]} direction</h3><p>{selected[2]}</p>
      <dl><div><dt>Mechanic to test</dt><dd>{selectedExperiment[1]}</dd></div><div><dt>Evidence</dt><dd><Check size={15} /> Confirmed system</dd></div></dl>
      <p className="experiment-summary">{selectedExperiment[2]}</p>
      <label>Build notes<textarea maxLength={500} value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false) }} placeholder="Record playstyle ideas and combinations to test…" /><span>{notes.length}/500</span></label>
      <button className="ember-button secondary" type="button" onClick={save} disabled={!notes.trim()}><Save size={17} /> {saved ? 'Saved locally' : 'Save notes'}</button>
    </aside>
  </section>
}
