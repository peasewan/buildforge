import { useState } from 'react'
import { CircleHelp, Save, ShieldCheck, RotateCcw } from 'lucide-react'
import { track } from './lib/analytics'
import { EMBERVILLE_CATALOG } from './data/embervilleCatalog'
import { evaluateEmbervilleDraft, type EmbervilleDataset } from './lib/embervilleData'
import { EMBERVILLE_DRAFT_KEY, EMBERVILLE_NOTES_KEY, emptyEmbervilleDraft, restoreEmbervilleDraft, type EmbervilleWorkspace } from './lib/embervilleDraft'
import { EmbervilleFactEvidence } from './EmbervilleEvidence'

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

function loadWorkspace(data: EmbervilleDataset) {
  if (typeof window === 'undefined') return { draft: emptyEmbervilleDraft(data.dataVersion), notice: '' }
  try {
    return restoreEmbervilleDraft(localStorage.getItem(EMBERVILLE_DRAFT_KEY), localStorage.getItem(EMBERVILLE_NOTES_KEY), { ...data, skills: data.skills.map(skill => ({ id: skill.id, type: skill.type.value })) })
  } catch { return { draft: emptyEmbervilleDraft(data.dataVersion), notice: 'Local storage is unavailable. You can still plan in this tab.' } }
}

export default function EmbervillePlanner({ data = EMBERVILLE_CATALOG }: { data?: EmbervilleDataset }) {
  const [workspace, setWorkspace] = useState(() => loadWorkspace(data))
  const [saveMessage, setSaveMessage] = useState('')
  const { draft } = workspace
  const selected = styles.find(([id]) => id === draft.style) ?? styles[0]
  const selectedExperiment = experiments.find(([id]) => id === draft.experiment) ?? experiments[0]
  const baseClass = data.classes.find(record => record.id === draft.baseClassId)
  const weapon = data.weapons.find(record => record.id === draft.weaponId)
  const result = evaluateEmbervilleDraft(data, draft)
  const hasSelectableSkills = data.skills.some(skill => (skill.type.value === 'active' || skill.type.value === 'passive') && skill.name.value !== null && skill.effect.value !== null)
  const statusLabel = result.status === 'confirmed' ? 'Inheritance evidence complete' : result.status === 'blocked' ? 'Combination blocked' : 'Needs verification'

  function update(patch: Partial<EmbervilleWorkspace>) {
    setWorkspace(current => ({ ...current, draft: { ...current.draft, ...patch } }))
    setSaveMessage('')
  }
  function toggle(key: 'learnedClassIds' | 'activeSkillIds' | 'passiveSkillIds', id: string) {
    update({ [key]: draft[key].includes(id) ? draft[key].filter(item => item !== id) : [...draft[key], id] })
    track('emberville_record_select', { record_type: key === 'learnedClassIds' ? 'learned_class' : 'skill', record_id: id, data_version: data.dataVersion })
  }
  function save() {
    try {
      localStorage.setItem(EMBERVILLE_DRAFT_KEY, JSON.stringify(draft))
      localStorage.setItem(EMBERVILLE_NOTES_KEY, draft.notes)
      if (!saveMessage) {
        track('emberville_draft_save', { data_version: data.dataVersion, base_class: draft.baseClassId ?? 'unselected', active_count: draft.activeSkillIds.length, passive_count: draft.passiveSkillIds.length })
        if (draft.notes.trim()) track('emberville_notes_save', { has_notes: 1 })
      }
      setSaveMessage('Draft saved in this browser.')
    } catch { setSaveMessage('Your draft could not be saved. Keep this tab open to retain your choices.') }
  }
  function reset() {
    setWorkspace({ draft: emptyEmbervilleDraft(data.dataVersion), notice: '' })
    try { localStorage.removeItem(EMBERVILLE_DRAFT_KEY); localStorage.removeItem(EMBERVILLE_NOTES_KEY); setSaveMessage('Draft reset.') }
    catch { setSaveMessage('Choices reset in this tab. Browser storage could not be cleared.') }
  }

  function skillSection(type: 'active' | 'passive') {
    const skills = data.skills.filter(skill => skill.type.value === type && skill.name.value !== null && skill.effect.value !== null)
    const key = type === 'active' ? 'activeSkillIds' : 'passiveSkillIds'
    return <section className="ember-skill-section" aria-labelledby={`inherited-${type}`}><h3 id={`inherited-${type}`}>Inherited {type} skills</h3>
      {skills.length ? skills.map(skill => {
        const source = data.classes.find(record => record.id === skill.classId)
        const learned = draft.baseClassId === skill.classId || draft.learnedClassIds.includes(skill.classId)
        return <label className="ember-skill-choice" key={skill.id}><input type="checkbox" checked={draft[key].includes(skill.id)} disabled={(!learned || skill.inheritance.value === false) && !draft[key].includes(skill.id)} onChange={() => toggle(key, skill.id)} /><span><strong>{skill.name.value}</strong><small>{source?.name.value} · {skill.effect.value}</small>{!learned && <small>Select its source class as learned first.</small>}{skill.inheritance.value === false && <small>This skill is not inheritable.</small>}</span><EmbervilleFactEvidence fact={skill.inheritance} data={data} /></label>
      }) : <p className="ember-empty"><CircleHelp size={18} />No reviewed {type} skill records with a confirmed type and effect are available yet.</p>}
    </section>
  }

  return <section className="ember-planner" id="planner" aria-labelledby="planner-title" data-surface="emberville-planner">
    <div className="ember-panel planner-controls">
      <p className="ember-kicker">SOURCED PREVIEW NOTEBOOK</p><h2 id="planner-title">Keep a sourced planning notebook</h2>
      <p className="planner-evidence">Save a combat direction, reviewed class and weapon ideas, and private notes to investigate. This preview does not produce a validated game build; inheritance restrictions remain under review.</p>
      <fieldset><legend>Combat direction</legend><div className="style-grid">{styles.map(([id, label, description]) => <button type="button" className={draft.style === id ? 'selected' : ''} aria-pressed={draft.style === id} key={id} onClick={() => { update({ style: id }); track('emberville_style_select', { style: id }) }}><strong>{label}</strong><span>{description}</span></button>)}</div></fieldset>
      <div className="ember-record-controls">
        <div><label htmlFor="ember-base-class">Base class</label><select id="ember-base-class" value={draft.baseClassId ?? ''} onChange={event => { update({ baseClassId: event.target.value || null }); if (event.target.value) track('emberville_record_select', { record_type: 'base_class', record_id: event.target.value, data_version: data.dataVersion }) }}><option value="">Choose a reviewed class</option>{data.classes.filter(record => record.name.value !== null).map(record => <option key={record.id} value={record.id}>{record.name.value}{record.name.verificationStatus === 'community_verified' ? ' · Press preview' : ''}</option>)}</select>{baseClass && <EmbervilleFactEvidence fact={baseClass.name} data={data} />}</div>
        <div><label htmlFor="ember-weapon">Weapon category</label><select id="ember-weapon" value={draft.weaponId ?? ''} onChange={event => { update({ weaponId: event.target.value || null }); if (event.target.value) track('emberville_record_select', { record_type: 'weapon', record_id: event.target.value, data_version: data.dataVersion }) }}><option value="">Choose a category example</option>{data.weapons.filter(record => record.name.value !== null).map(record => <option key={record.id} value={record.id}>{record.name.value}</option>)}</select>{weapon && <EmbervilleFactEvidence fact={weapon.name} data={data} />}</div>
      </div>
      <p className="planner-evidence">These are partial preview records. Selecting a class and weapon records your intention; their compatibility is not yet verified.</p>
      <fieldset className="ember-learned"><legend>Other learned classes</legend>{data.classes.filter(record => record.id !== draft.baseClassId).map(record => <label key={record.id}><input type="checkbox" checked={draft.learnedClassIds.includes(record.id)} onChange={() => toggle('learnedClassIds', record.id)} />{record.name.value}</label>)}<p>The base class is treated as learned for planning. Selecting a class does not confirm that you have unlocked it in game.</p></fieldset>
      {hasSelectableSkills ? <>{skillSection('active')}{skillSection('passive')}</> : <p className="ember-empty" role="note"><CircleHelp size={18} />No reviewed active or passive skills can be selected yet. Save research notes while skill types and inheritance rules remain unverified.</p>}
      {data.skills.some(skill => skill.type.value === null) && <details className="ember-pending-skills"><summary>Observed skills awaiting classification ({data.skills.filter(skill => skill.type.value === null).length})</summary>{data.skills.filter(skill => skill.type.value === null).map(skill => <article key={skill.id}><h4>{skill.name.value}</h4><p>{skill.effect.value}</p><EmbervilleFactEvidence fact={skill.effect} data={data} /><p>Active / passive type and inheritance eligibility are not verified, so this skill cannot be added to a setup yet.</p></article>)}</details>}
      <fieldset><legend>Mechanic to test</legend><div className="experiment-grid">{experiments.map(([id, label]) => <button type="button" className={draft.experiment === id ? 'selected' : ''} aria-pressed={draft.experiment === id} key={id} onClick={() => { update({ experiment: id }); track('emberville_mechanic_select', { mechanic: id }) }}>{label}</button>)}</div></fieldset>
      <a className="ember-inline-link" href="/emberville-skill-inheritance">Review the confirmed inheritance system</a>
    </div>
    <aside className="ember-panel planner-summary">
      <p className="ember-kicker">NOTEBOOK SUMMARY</p><h3>{selected[1]} direction</h3><p>{selected[2]}</p>
      <dl><div><dt>Base class</dt><dd>{baseClass?.name.value ?? 'Not selected'}</dd></div><div><dt>Weapon</dt><dd>{weapon?.name.value ?? 'Not selected'}</dd></div>{hasSelectableSkills && <div><dt>Active / passive choices</dt><dd>{draft.activeSkillIds.length} / {draft.passiveSkillIds.length}</dd></div>}<div><dt>Mechanic to test</dt><dd>{selectedExperiment[1]}</dd></div></dl>
      <div className={`ember-validation ${result.status}`} aria-live="polite"><strong>{result.status === 'confirmed' ? <ShieldCheck size={18} /> : <CircleHelp size={18} />}{statusLabel}</strong><ul>{result.messages.map(message => <li key={message}>{message}</li>)}</ul></div>
      <p className="planner-evidence">This checks recorded inheritance evidence. Your in-game unlock level and class–weapon compatibility are not checked.</p>
      <p className="experiment-summary">{selectedExperiment[2]}</p>
      <label htmlFor="ember-notes">Build notes</label><textarea id="ember-notes" maxLength={500} value={draft.notes} onChange={event => update({ notes: event.target.value })} placeholder="Record playstyle ideas and combinations to test…" /><small className="ember-note-count">{draft.notes.length}/500 · Stored only in this browser</small>
      <button className="ember-button" type="button" onClick={save}><Save size={17} />Save draft</button><button className="ember-button secondary" type="button" onClick={reset}><RotateCcw size={16} />Reset draft</button>
      <p role="status" className="ember-save-status">{saveMessage || workspace.notice}</p>
      <p className="ember-catalog-version">Reviewed {data.reviewedAt}<br />{data.dataVersion}<br />Saving a draft does not verify its game compatibility.</p>
    </aside>
  </section>
}
