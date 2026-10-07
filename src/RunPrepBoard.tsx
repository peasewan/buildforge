import { useEffect, useState } from 'react'
import { RUN_PREP_CHECKLIST, RUN_PREP_DUNGEONS, type RunPrepFaction } from './data/runPrep'

const STORAGE_KEY = 'buildforge:run-prep:v1'
type Checks = Record<string, boolean>
type SavedState = Record<string, Checks>

function readSaved(): SavedState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as SavedState : {}
  } catch { return {} }
}

export default function RunPrepBoard() {
  const [faction, setFaction] = useState<'all' | RunPrepFaction>('all')
  const [level, setLevel] = useState(20)
  const [saved, setSaved] = useState<SavedState>(readSaved)

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)) } catch { /* Keep the checklist usable when storage is unavailable. */ }
  }, [saved])

  const toggle = (dungeonId: string, itemId: string) => {
    setSaved(current => ({ ...current, [dungeonId]: { ...current[dungeonId], [itemId]: !current[dungeonId]?.[itemId] } }))
  }

  return <section className="pt-run-prep" aria-labelledby="run-prep-title">
    <div className="pt-run-prep-heading">
      <div><p className="pt-kicker">FIELD NOTES · BETA SOURCES</p><h2 id="run-prep-title">Run Prep</h2><p>Save a few planning checks on this device. The notes separate published facts from details that still need an in-game check.</p></div>
      <div className="pt-run-prep-filters">
        <label>Faction view<select aria-label="Faction view" value={faction} onChange={e => setFaction(e.target.value as typeof faction)}><option value="all">All factions</option><option value="alliance">Alliance</option><option value="horde">Horde</option></select></label>
        <label>Your level<input aria-label="Run prep level" type="range" min="1" max="30" value={level} onChange={e => setLevel(Number(e.target.value))} /><span>Level {level}</span></label>
      </div>
    </div>
    <p className="pt-run-prep-filter-note">Showing dungeons whose published level guidance includes level {level}. These ranges are reference guidance, not confirmation of access.</p>
    {RUN_PREP_DUNGEONS.some(dungeon => level >= dungeon.filterMinLevel && level <= dungeon.filterMaxLevel) ? <div className="pt-run-prep-grid">{RUN_PREP_DUNGEONS.filter(dungeon => level >= dungeon.filterMinLevel && level <= dungeon.filterMaxLevel).map(dungeon => <article className="pt-run-prep-card" aria-label={dungeon.name} key={dungeon.id}>
      <div className="pt-run-prep-title"><span>{dungeon.level}</span><h3>{dungeon.name}</h3></div>
      <p><strong>Level guidance:</strong> {dungeon.levelNote}</p><p><strong>Known:</strong> {dungeon.known}</p><p><strong>Location:</strong> {dungeon.location}</p>
      <p><strong>Faction:</strong> {faction === 'all' ? dungeon.factionNote : dungeon.factionFacts[faction] ?? dungeon.factionNote}</p>
      <p className="pt-run-prep-unverified"><strong>Unverified:</strong> {dungeon.unverified}</p>
      <fieldset><legend>Your prep checks</legend>{RUN_PREP_CHECKLIST.map(item => <label key={item.id}><input type="checkbox" checked={!!saved[dungeon.id]?.[item.id]} onChange={() => toggle(dungeon.id, item.id)} />{item.label}</label>)}</fieldset>
      <div className="pt-run-prep-quests"><h4>Published quest pickups</h4>
        {dungeon.quests.filter(quest => faction === 'all' || quest.faction === 'both' || quest.faction === faction).length ? dungeon.quests.filter(quest => faction === 'all' || quest.faction === 'both' || quest.faction === faction).map(quest => <div className="pt-run-prep-quest" key={quest.id}>
          <label><input type="checkbox" checked={!!saved[dungeon.id]?.[`quest:${quest.id}`]} onChange={() => toggle(dungeon.id, `quest:${quest.id}`)} /><span><strong>{quest.name}</strong><small>{quest.pickup}</small>{quest.note && <small className="pt-run-prep-quest-note">{quest.note}</small>}</span></label>
          <a href={quest.source.href} target="_blank" rel="noreferrer">Source</a>
        </div>) : <p className="pt-run-prep-unverified">No faction-specific pickup is listed here; see what remains unverified above.</p>}
      </div>
      <div className="pt-run-prep-sources"><a href={dungeon.source.href} target="_blank" rel="noreferrer">{dungeon.source.label}</a>{dungeon.factSource && <a href={dungeon.factSource.href} target="_blank" rel="noreferrer">{dungeon.factSource.label}</a>}</div>
    </article>)}</div> : <div className="pt-run-prep-empty" role="status">No listed dungeon level range includes level {level}.</div>}
    <p className="pt-run-prep-footnote">Checklist ticks are stored in this browser only. They are personal reminders, not quest prerequisites.</p>
  </section>
}
