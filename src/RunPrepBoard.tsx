import { useEffect, useState } from 'react'
import { RUN_PREP_CHECKLIST, RUN_PREP_DUNGEONS, type RunPrepFaction } from './data/runPrep'
import type { ToolRole } from './data/planningTools'

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

interface RunPrepBoardProps {
  dungeonId: string
  faction: 'all' | RunPrepFaction
  level: number
  role: ToolRole
}

export default function RunPrepBoard({dungeonId, faction, level, role}: RunPrepBoardProps) {
  const [saved, setSaved] = useState<SavedState>(readSaved)
  const dungeon = RUN_PREP_DUNGEONS.find(item => item.id === dungeonId)
  const inRange = !!dungeon && level >= dungeon.filterMinLevel && level <= dungeon.filterMaxLevel
  const quests = dungeon?.quests.filter(quest => faction === 'all' || quest.faction === 'both' || quest.faction === faction) ?? []

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)) } catch { /* Keep the checklist usable when storage is unavailable. */ }
  }, [saved])

  const toggle = (dungeonId: string, itemId: string) => {
    setSaved(current => ({ ...current, [dungeonId]: { ...current[dungeonId], [itemId]: !current[dungeonId]?.[itemId] } }))
  }

  return <section className="pt-run-prep" aria-labelledby="run-prep-title">
    <div className="pt-run-prep-heading">
      <div><p className="pt-kicker">FIELD NOTES · BETA SOURCES</p><h2 id="run-prep-title">Run Prep</h2><p>Quest pickups below follow the dungeon, faction and level you selected above. Save a few planning checks on this device; confirm availability in game.</p></div>
    </div>
    <p className="pt-run-prep-filter-note">Level {level} · {role === 'damage' ? 'DPS' : role === 'heal' ? 'Heal' : 'Tank'} · {faction === 'all' ? 'All factions' : faction === 'alliance' ? 'Alliance' : 'Horde'}. Level ranges are reference guidance, not confirmation of access. Role does not change quest pickup evidence.</p>
    {inRange && dungeon ? <div className="pt-run-prep-grid"><article className="pt-run-prep-card" aria-label={dungeon.name}>
      <div className="pt-run-prep-title"><span>{dungeon.level}</span><h3>{dungeon.name}</h3></div>
      <p><strong>Level guidance:</strong> {dungeon.levelNote}</p><p><strong>Known:</strong> {dungeon.known}</p><p><strong>Location:</strong> {dungeon.location}</p>
      <p><strong>Faction:</strong> {faction === 'all' ? dungeon.factionNote : dungeon.factionFacts[faction] ?? dungeon.factionNote}</p>
      <p className="pt-run-prep-unverified"><strong>Unverified:</strong> {dungeon.unverified}</p>
      <fieldset><legend>Your prep checks</legend>{RUN_PREP_CHECKLIST.map(item => <label key={item.id}><input type="checkbox" checked={!!saved[dungeon.id]?.[item.id]} onChange={() => toggle(dungeon.id, item.id)} />{item.label}</label>)}</fieldset>
      <div className="pt-run-prep-quests"><h4>Published quest pickups</h4>
        {quests.length ? quests.map(quest => <div className="pt-run-prep-quest" key={quest.id}>
          <label><input type="checkbox" checked={!!saved[dungeon.id]?.[`quest:${quest.id}`]} onChange={() => toggle(dungeon.id, `quest:${quest.id}`)} /><span><strong>{quest.name}</strong><small className="pt-run-prep-quest-faction">{quest.faction === 'both' ? 'Both factions' : quest.faction === 'alliance' ? 'Alliance' : 'Horde'}</small><small>{quest.pickup}</small>{quest.note && <small className="pt-run-prep-quest-note">{quest.note}</small>}</span></label>
          <a href={quest.source.href} target="_blank" rel="noreferrer">Source</a>
        </div>) : <p className="pt-run-prep-unverified">No faction-specific pickup is listed here; see what remains unverified above.</p>}
      </div>
      <div className="pt-run-prep-sources"><a href={dungeon.source.href} target="_blank" rel="noreferrer">{dungeon.source.label}</a>{dungeon.factSource && <a href={dungeon.factSource.href} target="_blank" rel="noreferrer">{dungeon.factSource.label}</a>}</div>
    </article></div> : <div className="pt-run-prep-empty" role="status">No listed dungeon level range includes level {level} for this selection.</div>}
    <p className="pt-run-prep-footnote">Checklist ticks are stored in this browser only. They are personal reminders, not quest prerequisites.</p>
  </section>
}
