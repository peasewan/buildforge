import { useState } from 'react'
import { ArrowRight, CheckCircle2, CircleHelp } from 'lucide-react'
import { PALADIN_BETA_SNAPSHOT } from './data/betaSnapshot'
import { PALADIN_CHECKLIST_CAP, PALADIN_CHECKLIST_SNAPSHOT, PALADIN_CHECKLIST_SOURCE, paladinUnlocksAtLevel, savedPaladinUnlocks } from './data/paladinLevelingChecklist'
import { PALADIN_LEVELING_SOURCE, paladinLevelingHref } from './data/paladinLevelingProgression'

const STORAGE_KEY = 'buildforge:paladin-leveling-checklist:69893'

function readChecks(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? savedPaladinUnlocks(JSON.parse(value)) : []
  } catch { return [] }
}

export default function PaladinLevelingChecklist() {
  const [level, setLevel] = useState(10)
  const [checked, setChecked] = useState<string[]>(readChecks)
  const reminders = paladinUnlocksAtLevel(level)
  const completed = reminders.available.filter((entry) => checked.includes(entry.id)).length
  const completedTalents = reminders.talentSteps.filter((step) => checked.includes(`talent:${step.level}`)).length

  function toggle(id: string) {
    const next = checked.includes(id) ? checked.filter((item) => item !== id) : [...checked, id]
    setChecked(next)
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* Continue without persistence. */ }
  }

  return <section className="paladin-leveling-checklist shell" aria-label="Paladin 1–30 checklist">
    <div className="paladin-checklist-heading">
      <div><span>LEVELING COMPANION · PALADIN</span><h2>Paladin 1–30 Checklist</h2><p>Use the older spellbook snapshot as a reminder of what to check in your game. Mark an entry only after you have reviewed it yourself.</p></div>
      <label>Your level<select aria-label="Your checklist level" value={level} onChange={(event) => setLevel(Number(event.target.value))}>{Array.from({ length: PALADIN_CHECKLIST_CAP }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Level {value}</option>)}</select></label>
    </div>
    <div className="paladin-checklist-status"><CheckCircle2 size={17} /><strong>{completed} / {reminders.available.length}</strong><span>spell reminders checked through level {reminders.level} · {completedTalents} / {reminders.talentSteps.length} community talent steps checked</span></div>
    <div className="paladin-checklist-grid">
      <div><h3>Check in your game</h3><p>First-unlock levels recorded in the 69893 snapshot. These are personal checks, not an instruction to buy a particular rank.</p>
        {reminders.available.length ? <ul className="paladin-checklist-items">{reminders.available.map((entry) => <li key={entry.id}><label><input type="checkbox" checked={checked.includes(entry.id)} onChange={() => toggle(entry.id)} /><span><strong>{entry.name}</strong><small>Snapshot level {entry.learnedAt} · {entry.category}</small></span></label></li>)}</ul> : <p>No first-unlock entries at this level in the imported snapshot.</p>}
      </div>
      <aside><h3>What is next?</h3>{reminders.next.length ? <><p>Next listed at level {reminders.next[0].learnedAt} in the snapshot:</p><ul>{reminders.next.map((entry) => <li key={entry.id}>{entry.name}</li>)}</ul></> : <p>This snapshot has no more first unlocks before the current level cap.</p>}
        <p>At level 10 and above, compare the next talent point with the existing community route.</p>
        <a href={level >= 10 ? paladinLevelingHref(level) : '/paladin#calculator'}>Open your talent plan <ArrowRight size={15} /></a>
      </aside>
    </div>
    {reminders.talentSteps.length > 0 && <div className="paladin-checklist-talents"><div><h3>Community talent point plan</h3><p>Track the existing Retribution route one point at a time. This is a guide recommendation, not a verified current-client talent order.</p></div><ul>{reminders.talentSteps.map((step) => <li key={step.level}><label><input type="checkbox" checked={checked.includes(`talent:${step.level}`)} onChange={() => toggle(`talent:${step.level}`)} /><span>Level {step.level}: {step.name} {step.rank}</span></label></li>)}</ul><a href={PALADIN_LEVELING_SOURCE.href} target="_blank" rel="noreferrer">Community route source</a></div>}
    <div className="paladin-checklist-evidence"><CircleHelp size={18} /><p><strong>{PALADIN_CHECKLIST_SNAPSHOT} snapshot.</strong> Current Beta trainer data needs review; later ranks, training costs, and current availability are not established by this checklist. <a href={PALADIN_CHECKLIST_SOURCE.url} target="_blank" rel="noreferrer">Spellbook source</a> · <a href={PALADIN_BETA_SNAPSHOT.phase.officialSource} target="_blank" rel="noreferrer">Official level 30 cap</a>. Checked items stay in this browser.</p></div>
  </section>
}
