import { useState } from 'react'
import { raceChoices, raceClasses, raceSources, type RaceClass, type RaceFaction } from './data/raceChoices'
import type { ToolActivity } from './data/planningTools'

export default function RacialComparison({className, setClassName, activity}:{className:RaceClass; setClassName:(name:RaceClass)=>void;activity:ToolActivity}) {
  const [faction,setFaction] = useState<'Both'|RaceFaction>('Both')
  const [first,setFirst] = useState('Dwarf')
  const [second,setSecond] = useState('Orc')
  const eligible = raceChoices.filter(r => r.classes.includes(className) && (faction === 'Both' || r.faction === faction))
  const a = eligible.find(r => r.name === first) ?? eligible[0]
  const alternatives = eligible.filter(r => r !== a)
  const b = alternatives.find(r => r.name === second) ?? alternatives[0]
  const activityLabel = {solo:'Solo leveling',dungeon:'Dungeon play',pvp:'PvP'}[activity]
  return <section className="wow-review" id="race-comparison" aria-labelledby="race-compare-title">
    <p className="wow-review-date">Character creation · November 15, 2026</p><h2 id="race-compare-title">Compare races for your class</h2>
    <p>Choose two eligible races to see how their racials fit your activity. The faction filter follows the launch character-creation options.</p>
    <div className="wow-race-fields">
      <label>Compare class<select value={className} onChange={e=>setClassName(e.target.value as RaceClass)}>{raceClasses.map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Race faction<select value={faction} onChange={e=>setFaction(e.target.value as typeof faction)}>{['Both','Alliance','Horde'].map(f=><option key={f}>{f}</option>)}</select></label>
      <label>First race<select value={a.name} onChange={e=>setFirst(e.target.value)}>{eligible.map(r=><option key={r.name}>{r.name}</option>)}</select></label>
      {b && <label>Compare with<select value={b.name} onChange={e=>setSecond(e.target.value)}>{alternatives.map(r=><option key={r.name}>{r.name}</option>)}</select></label>}
    </div>
    {!b && <p>{a.name} is the only {faction} race available for {className}. Choose both factions to compare.</p>}
    <div className="wow-race-cards" aria-live="polite">{[a,b].filter(Boolean).map(r=><article key={r.name}>
      <p className="wow-review-date">{r.faction} · {className}</p><h3>{r.name}</h3><p>{r.active} {r.passive}</p>
      {r.name.endsWith('Skyborne') && <p><small>Requires the Skyborne race unlock from an optional digital pack. <a href={raceSources.access}>Blizzard access details</a>.</small></p>}
      <strong>{activityLabel}</strong><p>{r.uses[activity]} {r.pairing?.[className]}</p>
    </article>)}</div>
    <p><small>Selected racials and editorial use cases. <a href={raceSources.matrix}>Blizzard race and class tables</a> · <a href={raceSources.tooltips}>November 14 client tooltips</a> · <a href={raceSources.guide}>Method’s November 5 guide</a>.</small></p>
  </section>
}
