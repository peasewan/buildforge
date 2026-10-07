import { useState } from 'react'
import { compareDungeonXp, type DungeonXpMeasurement } from './lib/dungeonXp'
import { track } from './lib/analytics'
import type { RunPrepFaction } from './data/runPrep'
import type { ToolRole } from './data/planningTools'
const fields: Array<{key:keyof DungeonXpMeasurement;label:string;min:number}> = [
  {key:'firstRunXp',label:'First-run total XP',min:0}, {key:'repeatRunXp',label:'Repeat-run total XP',min:0},
  {key:'waitMinutes',label:'Group wait (minutes)',min:0}, {key:'travelMinutes',label:'Round-trip travel (minutes)',min:0},
  {key:'runMinutes',label:'Dungeon clear (minutes)',min:0.1}, {key:'turnInMinutes',label:'Quest pickup / turn-in (minutes)',min:0},
  {key:'questXp',label:'Questing total XP',min:0}, {key:'questMinutes',label:'Questing total time (minutes)',min:0.1},
]
const blank = Object.fromEntries(fields.map(({key})=>[key,''])) as Record<keyof DungeonXpMeasurement,string>
const sample = { firstRunXp:'12000',repeatRunXp:'3000',waitMinutes:'10',travelMinutes:'5',runMinutes:'25',turnInMinutes:'5',questXp:'6000',questMinutes:'30' }
const format = (n:number) => n.toLocaleString('en-US',{maximumFractionDigits:0})
interface DungeonXpCompareProps {
  dungeonName: string
  level: number
  role: ToolRole
  faction: 'all' | RunPrepFaction
}

export default function DungeonXpCompare({dungeonName, level, role, faction}: DungeonXpCompareProps) {
  const [values,setValues] = useState({...blank})
  const [isSample,setIsSample] = useState(false)
  const [submitted,setSubmitted] = useState(false)
  const numbers = Object.fromEntries(fields.map(({key})=>[key,values[key].trim()==='' ? NaN : Number(values[key])])) as unknown as DungeonXpMeasurement
  const result = submitted ? compareDungeonXp(numbers) : null
  function breakEven(wait:number|null) {
    if (!result) return ''
    if (result.questPerHour===0) return 'No break-even wait: questing XP is zero.'
    return wait===null ? 'Below your questing rate even with no group wait.' : `Up to ${format(wait)} minutes of group wait to match your questing rate.`
  }
  return <section className="pt-evidence dungeon-xp" id="xp-compare" aria-labelledby="xp-heading">
    <p className="pt-kicker">MEASURE YOUR OWN RUNS</p><h2 id="xp-heading">Dungeon leveling XP comparison</h2><p className="xp-context">{dungeonName} · Level {level} · {role === 'damage' ? 'DPS' : role === 'heal' ? 'Heal' : 'Tank'} · {faction === 'all' ? 'All factions' : faction === 'alliance' ? 'Alliance' : 'Horde'}</p><p>Compare your first run, a repeat run and questing using measured XP and time. Include all kill and quest XP in each total once. First-run quests are not automatically added to a repeat run.</p>
    <p>Use measurements from the same character level, rest state and party conditions. Tank / healer / DPS affects your observed wait and clear time; no role bonus, repeat penalty or high-level party formula is assumed.</p>
    <form onSubmit={event=>{event.preventDefault();setSubmitted(true);if(compareDungeonXp(numbers))track('dungeon_xp_compare',{input_source:isSample ? 'illustrative' : 'user_measurement'})}}>
      <div className="xp-fields">{fields.map(({key,label,min})=><label key={key} htmlFor={`xp-${key}`}>{label}<input id={`xp-${key}`} type="number" inputMode="decimal" min={min} step="any" required value={values[key]} onChange={event=>{setValues({...values,[key]:event.target.value});setSubmitted(false)}}/></label>)}</div>
      <p>Both dungeon scenarios use the same timing assumptions you enter. Change the times and compare again if your repeat run is faster. Questing time must also include travel, downtime and turn-ins, without overlapping minutes.</p>
      <div className="xp-actions"><button type="submit">Compare XP per hour</button><button type="button" onClick={()=>{setValues({...sample});setIsSample(true);setSubmitted(false)}}>Try illustrative numbers</button><button type="button" onClick={()=>{setValues({...blank});setIsSample(false);setSubmitted(false)}}>Clear</button></div>
    </form>
    {isSample && <p role="note">Illustrative inputs — not measured WoW Forever dungeon rewards. Replace every value with your own observations.</p>}
    {submitted && <div aria-live="polite">{result ? <><p>Total dungeon trip: <strong>{format(result.totalMinutes)} minutes</strong></p><div className="xp-results"><article><h3>First run</h3><strong>{format(result.firstPerHour)} XP/hour</strong><p>{breakEven(result.firstMaxWait)}</p></article><article><h3>Repeat run</h3><strong>{format(result.repeatPerHour)} XP/hour</strong><p>{breakEven(result.repeatMaxWait)}</p></article><article><h3>Questing</h3><strong>{format(result.questPerHour)} XP/hour</strong><p>Your measured comparison baseline.</p></article></div></> : <p role="alert">Enter finite, non-negative values in every field. Dungeon clear and questing time must be greater than zero.</p>}</div>}
    <details><summary>How the comparison works</summary><p>XP/hour = total XP × 60 ÷ total minutes. Break-even wait = dungeon XP ÷ questing XP per minute − travel, clear and quest-handling time. These are comparisons of your inputs, not predictions of server rewards. Loot, enjoyment and helping friends are separate reasons to run a dungeon.</p></details>
  </section>
}
