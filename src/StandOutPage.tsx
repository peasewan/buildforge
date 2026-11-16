import { useState } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import StandVerdict from './StandVerdict'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import { acquisition, stands, type Stand, type StoryStage } from './data/standOut'

function StandCard({ stand, onChange, stage, label }: { stand: Stand; onChange: (id: string) => void; stage: StoryStage; label: string }) {
  const route = acquisition(stand, stage)
  return <article className="stand-card">
    <label>{label}<select value={stand.id} onChange={e => onChange(e.target.value)}>{stands.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
    <p className="stand-meta">{stand.tier} <span>·</span> {stand.part}</p>
    <div className="stand-route" aria-live="polite"><h3>{route.label}</h3><p>{route.detail}</p></div>
    <h3>Selected moves</h3><dl className="stand-moves">{stand.moves.map(m=><div key={m.name}><dt>{m.name}</dt><dd>{m.cooldown || 'Unlisted'}</dd></div>)}</dl>
    <a href={'https://standout.wiki/stands/'+stand.id+'/'}>Full moveset and patch notes <ArrowUpRight size={14} /></a>
  </article>
}

export default function StandOutPage() {
  const [left, setLeft] = useState('star-platinum')
  const [right, setRight] = useState('rolling-stones')
  const [stage, setStage] = useState<StoryStage>('story')
  const pick = (id: string) => stands.find(stand => stand.id === id)!
  function selectLeft(id: string) {
    if (id === right) setRight(left)
    setLeft(id)
  }
  return <div className="site-discovery stand-page"><DiscoveryHeader /><main className="sd-main">
    <header className="stand-hero"><div><p className="sd-kicker">ROBLOX / STAND OUT</p><h1>Stand Out tier list</h1><p>Our picks for Roblox Stand Out are Star Platinum for PvP duels, Magician’s Red for raids and Harvest for item farming. Already rolled a Stand? Check its best use before spending another arrow.</p><a href="#keep-or-reroll" className="sd-primary">Check my roll <ArrowDown size={16} /></a></div>
      <img src="/images/stand-out/cover.webp" width="768" height="432" alt="Stand Out game artwork featuring a player and a purple Stand." fetchPriority="high" /></header>
    <StandVerdict stand={pick(left)} stage={stage} select={selectLeft} />
    <section id="compare" className="stand-compare"><h2>Which Stand can I get?</h2><fieldset><legend>Your story progress</legend>{([['story','Playing the story'],['override','Story pool override on'],['complete','Story complete']] as const).map(([value,text])=><label key={value}><input type="radio" name="stage" checked={stage===value} onChange={()=>setStage(value)} />{text}</label>)}</fieldset>
      <div className="stand-pair"><StandCard label="First Stand" stand={pick(left)} stage={stage} onChange={selectLeft}/><StandCard label="Compare with" stand={pick(right)} stage={stage} onChange={id=>{if(id===left)setLeft(right);setRight(id)}}/></div></section>
    <section className="stand-reading"><h2>Which Stands need a quest or evolution?</h2>
    <dl className="stand-exceptions">{['hermit-purple','jojosapiens','star-platinum-the-world','the-world-alternative-universe'].map(id => {
      const stand = pick(id)
      return <div key={id}><dt>{stand.name}</dt><dd>{acquisition(stand, stage).detail} <a href={'https://standout.wiki/stands/'+id+'/'}>View {stand.name} moves</a>.</dd></div>
    })}</dl><h2>How to read a Stand tier list</h2><p>Rarity determines which arrows can roll a Stand. For a fight, compare what a move does and how long it takes to recover. A short cooldown on a utility move tells you little about its damage. The move rows show listed base cooldowns.</p>
    <p>A basic Mysterious Arrow draws from the eligible pool. Lucky Arrows start at Epic and Bizarre Arrows start at Legendary. To narrow a roll further, look for a focus arrow that matches the Stand’s part.</p>
    <p>Deciding what to craft? <a href="/roblox/stand-out/arrow-calculator">Compare Lucky and Bizarre Arrow odds for your budget</a> before spending arrows or Train Tokens.</p>
    <p>Launch rules and profiles checked November 15, 2026. <a href="https://trello.com/b/7IlUxQPN/stand-out-official-trello">Developer Trello</a> · <a href="https://standout.wiki/arrows/">Arrow and story-pool notes</a> · <a href="https://www.roblox.com/games/128828638194450/STAND-OUT">Play Stand Out on Roblox</a></p></section>
  </main><SiteFooter discovery links={[]} /></div>
}
