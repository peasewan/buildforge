import { useState } from 'react'
import { ArrowRight, Compass, Shield, Sparkles, Swords, Lock, MapPin } from 'lucide-react'
import DungeonXpCompare from './DungeonXpCompare'
import RunPrepBoard from './RunPrepBoard'
import SiteFooter from './SiteFooter'
import { DISCOVERY_PAGES } from './data/siteDiscovery'
import { DUNGEONS, DUNGEON_SOURCES, TOOL_CLASSES, dungeonMatches, milestonesForDungeon, nextTalentAtLevel, pickSpecs, snapshotAtLevel, type ToolRole, type ToolActivity, type ToolStyle, type ToolRoute } from './data/planningTools'
import { track } from './lib/analytics'

const roles: Array<{id:ToolRole;label:string;icon:typeof Shield}> = [{id:'tank',label:'Tank',icon:Shield},{id:'heal',label:'Heal',icon:Sparkles},{id:'damage',label:'DPS',icon:Swords}]
function RouteCard({route,level,reasons}:{route:ToolRoute;level:number;reasons?:string[]}) {
  const snapshot = snapshotAtLevel(route,level)!
  const next = nextTalentAtLevel(route,level)
  const archived = route.removedTalentNames.length > 0
  return <article className="pt-route" data-tool-route={route.id}>
    <div className="pt-route-heading">{route.image && <img src={route.image} alt="" loading="lazy" />}<div><p>{route.className} · {route.role === 'damage' ? 'DPS' : route.role === 'heal' ? 'Heal' : 'Tank'}</p><h3>{route.specName} {route.className}</h3></div></div>
    <p className="pt-route-status">{archived ? 'Historical route · not a current Beta recommendation' : reasons ? 'Published editorial starting route' : route.activity === 'dungeon' ? 'Published group-role route' : 'Starting route — dungeon performance not tested'}</p>
    {archived && <p role="note">{route.removedTalentNames.join(', ')} {route.removedTalentNames.length === 1 ? 'was' : 'were'} removed after this 69913 snapshot. Review these old points as history; start a blank calculator for a current plan.</p>}
    {reasons && <ul className="pt-reasons">{reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>}
    <div className="pt-snapshot"><strong>Level {level} snapshot</strong><span>{level-9} talent points</span><ol>{Object.entries(snapshot.allocation).map(([id,rank])=><li key={id}><span>{route.steps.find(s=>s.talentId===id)!.name}</span><b>{rank}</b></li>)}</ol></div>
    {next && <p className="pt-next-point"><span>{archived ? 'Historical next point' : 'Next point'} · Level {next.level}</span><strong>{next.name} · rank {next.rank}</strong></p>}
    <div className="pt-route-actions"><a className="button primary" href={route.calculatorHref(snapshot.allocation)} data-analytics-placement="planning-tool-result">{archived ? `Open blank ${route.className} Calculator` : `Edit level ${level} snapshot`} <ArrowRight size={15}/></a><a href={route.href}>View reference page <ArrowRight size={14}/></a></div>
    <small>Talent dataset reviewed through {route.version}. Allocation and point order are editorial planning choices.</small>
  </article>
}
function EvidenceNotes() {
  return <section className="pt-evidence"><h2>What these results mean</h2><p>These tools match published starting routes, not simulated performance or player popularity. One talent point per level from 10 is the normal planning assumption; Legacy perks are not included.</p><p>Most underlying talent datasets are older 69913-era snapshots. The Protection Paladin starter selects only nodes cross-checked in the 70170 Trait tables; the complete calculator still imports the 69913 tree. Blizzard raised the live Beta cap to Level 30 on October 1 and announced later class changes. Check the <a href="/wow-forever-paladin-beta-talent-changes">Beta update notes</a> before using an older allocation.</p><p>The Protection route is an editorial standard-progression example, not an official or tested dungeon ranking. Blizzard changed Redoubt on October 1, so the older imported tooltip may be stale. <a href="/wow-forever-protection-paladin-leveling-build">Review the node evidence and Level 30 extension</a>.</p><p>Low-level snapshots open as partial allocations: generic calculators use Level 20 mode; Paladin links specify their Level 20 budget. Keep the snapshot’s point budget when planning for your actual level.</p><h3>Dungeon references</h3><ul>{DUNGEON_SOURCES.map(source=><li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul><p>Level ranges are reference guidance, not confirmations of live server access, faction access or encounter difficulty.</p></section>
}
export default function PlanningToolsPage({tool}:{tool:'dungeon-finder'|'class-picker'}) {
  const page = DISCOVERY_PAGES.find(p=>p.id===tool)!
  const [dungeonId,setDungeonId] = useState<string>('ruins-of-lordaeron')
  const [level,setLevel] = useState(20)
  const [role,setRole] = useState<ToolRole>('tank')
  const [classId,setClassId] = useState('all')
  const [activity,setActivity] = useState<ToolActivity>('solo')
  const [pickerRole,setPickerRole] = useState<ToolRole>('damage')
  const [style,setStyle] = useState<ToolStyle>('any')
  const [showAll,setShowAll] = useState(false)
  const dungeon = DUNGEONS.find(d=>d.id===dungeonId)!
  const routes = dungeonMatches(dungeonId,role,classId,level)
  const matches = pickSpecs({activity,role:pickerRole,style})
  const preferencesChanged = () => {setShowAll(false); track('class_picker_change',{page:page.path})}
  return <div className={`planning-tools pt-${tool}`} data-experience-kind={tool}>
    <header className="pt-header"><a href="/" className="pt-brand"><Compass/>BUILD<b>FORGE</b></a><nav aria-label="Planning tools"><a href="/wow-forever-dungeon-build-finder">Dungeon finder</a><a href="/wow-forever-class-picker">Class picker</a><a href="/wow-forever-classes">Calculators</a></nav></header>
    <main className="pt-main"><div className="pt-intro"><p className="pt-kicker">WOW FOREVER · EDITORIAL ROUTE MATCHING</p><h1>{page.h1}</h1><p>{page.description}</p><span className="pt-reviewed">Level 20 planning snapshots · Live Beta cap Level 30 · 69913 talent data awaiting later patch reconciliation</span></div>
      {tool === 'dungeon-finder' ? <>
        <a className="pt-xp-jump" href="#xp-compare">Compare dungeon XP per hour ↓</a>
        <section className="pt-dungeons" aria-label="Choose a dungeon">{DUNGEONS.map(d=><button type="button" key={d.id} disabled={!d.supported} aria-pressed={dungeonId===d.id} onClick={()=>{setDungeonId(d.id);setLevel(d.minLevel);track('dungeon_select',{dungeon:d.id})}}><span>{d.supported ? <MapPin size={20}/> : <Lock size={20}/>}</span><strong>{d.name}</strong><small>Reference levels {d.minLevel}–{d.maxLevel}</small>{!d.supported && <em>Dungeon open in Beta · build routes awaiting review</em>}</button>)}</section>
        {dungeonId === 'ruins-of-lordaeron' && <section className="pt-ruins-context" aria-label="Ruins of Lordaeron planning context"><div><p className="pt-kicker">FEATURED · LEVEL 20 STARTER DUNGEON</p><h2>Plan for Ruins of Lordaeron</h2><p>Blizzard lists this new WoW Forever dungeon for levels 15–20. Choose your party role, then compare published Level 20 starting routes at the points you can actually spend. These allocations are editorial examples, not dungeon-tested rankings.</p><a href="https://worldofwarcraft.blizzard.com/en-us/news/24304160/the-world-of-warcraft-forever-beta-now-live" target="_blank" rel="noreferrer">Blizzard Beta announcement <ArrowRight size={14}/></a></div><div className="pt-ruins-facts"><span>Dungeon range <strong>15–20</strong></span><span>Route budget <strong>6–11 points</strong></span><span>Choices <strong>Tank · Heal · DPS</strong></span></div></section>}
        <section className="pt-controls" aria-label="Dungeon planning choices"><div><p className="pt-kicker">01 · PARTY ROLE</p><div className="pt-role-buttons">{roles.map(({id,label,icon:Icon})=><button type="button" key={id} aria-pressed={role===id} onClick={()=>{setRole(id);track('dungeon_role_select',{role:id,dungeon:dungeonId})}}><Icon size={19}/>{label}</button>)}</div></div><label><span>02 · CLASS</span>Class<select aria-label="Class" value={classId} onChange={e=>setClassId(e.target.value)}><option value="all">All available classes</option>{TOOL_CLASSES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><span>03 · YOUR POINT BUDGET</span>Your level<input aria-label="Your level" type="range" min={dungeon.minLevel} max={dungeon.maxLevel} value={level} onChange={e=>setLevel(Number(e.target.value))}/><b>Level {level} · {level-9} points</b></label></section>
        <div className="pt-milestones" aria-label={`${dungeon.name} level milestones`}><span>Preview your route at</span>{milestonesForDungeon(dungeonId).map(milestone=><button type="button" key={milestone} aria-label={`Level ${milestone} milestone`} aria-pressed={level===milestone} onClick={()=>{setLevel(milestone);track('dungeon_level_select',{dungeon:dungeonId,level:milestone})}}>Level {milestone}<small>{milestone-9} points</small></button>)}</div>
        <div className="pt-results-heading"><div><h2>{dungeon.name}: {roles.find(r=>r.id===role)!.label} routes</h2><p>{dungeon.note}</p></div><span>{routes.length} {routes.length===1?'result':'results'}</span></div>
        {routes.length ? <div className="pt-route-grid">{routes.map(route=><RouteCard key={route.id} route={route} level={level}/>)}</div> : <div className="pt-empty" role="status"><h3>No reviewed route for this combination</h3><p>Try another class or party role. We do not fill coverage gaps with unverified builds.</p><button type="button" onClick={()=>setClassId('all')}>Show all classes</button></div>}
      </> : <>
        <section className="pt-picker-controls" aria-label="Your playstyle preferences"><div><p className="pt-kicker">YOUR PLAYSTYLE</p><h2>Start with how you want to play</h2><p>Choose a role and a combat style. Matching routes are shown alphabetically within activity matches; they are not a tier list.</p></div><div className="pt-picker-fields"><label>Activity<select aria-label="Activity" value={activity} onChange={e=>{setActivity(e.target.value as ToolActivity);preferencesChanged()}}><option value="solo">Solo / leveling</option><option value="pvp">PvP</option><option value="dungeon">Dungeons / group play</option></select></label><label>Party role<select aria-label="Party role" value={pickerRole} onChange={e=>{setPickerRole(e.target.value as ToolRole);preferencesChanged()}}><option value="damage">DPS</option><option value="tank">Tank</option><option value="heal">Heal</option></select></label><label>Combat style<select aria-label="Combat style" value={style} onChange={e=>{setStyle(e.target.value as ToolStyle);preferencesChanged()}}><option value="any">Open to either</option><option value="melee">Melee</option><option value="ranged">Ranged / casting</option></select></label></div></section>
        <div className="pt-results-heading"><div><h2>Your matching starting points</h2><p>Compare the reasons, inspect the build, then try the allocation yourself.</p></div><span>{matches.length} matches</span></div>
        {matches.length ? <><div className="pt-route-grid">{(showAll?matches:matches.slice(0,3)).map(({route,reasons})=><RouteCard key={route.id} route={route} level={20} reasons={reasons}/>)}</div>{matches.length>3 && <button className="pt-more" type="button" onClick={()=>setShowAll(!showAll)}>{showAll?'Show first three':`Compare all ${matches.length} matches`}</button>}</> : <div className="pt-empty" role="status"><h3>No published route matches all three choices</h3><p>This is a catalogue coverage limit, not proof that a class cannot play this way.</p><button type="button" onClick={()=>{setActivity('solo');setPickerRole('damage');setStyle('any');setShowAll(false)}}>Reset preferences</button></div>}
        <aside className="pt-time-note"><h2>Short on play time?</h2><p>Start with one route, spend its points and keep the build link. We do not estimate leveling hours or call one class more time-efficient without measured evidence.</p><a href="/wow-forever-builds">Browse published playstyle routes <ArrowRight size={15}/></a></aside>
      </>}
      {tool === 'dungeon-finder' && <><RunPrepBoard/><DungeonXpCompare/></>}
      <EvidenceNotes/>
    </main><SiteFooter discovery/>
  </div>
}
