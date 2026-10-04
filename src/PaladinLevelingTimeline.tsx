import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PALADIN_LEVELING_SOURCE, PALADIN_LEVELING_STEPS, paladinLevelingHref, paladinLevelingStep } from './data/paladinLevelingProgression'
import { talents } from './data/talents'
import { track } from './lib/analytics'

export default function PaladinLevelingTimeline() {
  const [level,setLevel] = useState(30)
  const step = paladinLevelingStep(level)!
  const next = paladinLevelingStep(level+1)
  function selectLevel(value:number) { setLevel(value); track('leveling_step_select',{class:'paladin',level:value,placement:'leveling_timeline'}) }
  return <section className="beta-leveling-snapshot shell leveling-timeline" aria-label="Beta leveling snapshot">
    <header><div>Community recommendation · reviewed October 4</div><h2>Paladin Level 10–30 Talent Timeline</h2><p>A Retribution leveling route with a point-by-point plan. Move the slider to your level, then edit that exact snapshot.</p></header>
    <label className="leveling-slider">Your level <strong>Level {level} · {level-9} points · 0/0/{level-9}</strong><input aria-label="Paladin progression level" type="range" min="10" max="30" value={level} onChange={e=>selectLevel(Number(e.target.value))}/></label>
    <div className="leveling-milestones">{[10,15,20,25,30].map(value=><button key={value} type="button" aria-pressed={level===value} onClick={()=>selectLevel(value)}>Level {value}</button>)}</div>
    <div className="beta-leveling-grid">
      <article><h3>Your allocation at Level {level}</h3><ul className="leveling-ranks">{Object.entries(step.build).map(([id,rank])=>{const talent=talents.find(t=>t.id===id)!;return <li key={id}><img src={talent.icon} alt="" loading="lazy"/><span>{talent.name}</span><b>{rank}/{talent.maxRank}</b></li>})}</ul><a href={paladinLevelingHref(level)} data-analytics-placement="paladin-leveling-timeline">Edit Level {level} in Calculator <ArrowRight size={14}/></a></article>
      <article aria-live="polite"><span>{next ? `Next talent · Level ${next.level}` : 'Current Beta cap reached'}</span><h3>{next ? `${next.name} · rank ${next.rank}` : 'Level 30 · 21 points'}</h3><p>{next ? 'One more point follows this community route. You can compare alternatives in the calculator.' : 'This route stops at 30. It does not spend points reserved for a higher level cap.'}</p><p>Levels 1–9 have no talent points under the normal progression assumption. Legacy Talented perks are not included.</p><p>This mobility-first route takes Pursuit of Justice at 20–21 and Seal of Command at 22. If you already use our Seal-first Level 20 starter, keep those 11 points and take Pursuit of Justice at 21–22 to join the same route from 23.</p></article>
    </div>
    <details className="leveling-order"><summary>Full talent order: Level 10 → 30</summary><ol>{PALADIN_LEVELING_STEPS.map(item=><li key={item.level}>Level {item.level}: {item.name} — rank {item.rank}</li>)}</ol></details>
    <div className="beta-leveling-evidence"><p>Community recommendation, not an official or simulated best build. Source updated {PALADIN_LEVELING_SOURCE.updated}; allocation reviewed {PALADIN_LEVELING_SOURCE.reviewed}.</p><p>Every point passes the imported 69913 tree rules. This does not verify the complete 70205 client tree or current tooltip values. Vengeance requires full Sanctified Judgement under our derived prerequisite rule; check the live game before spending points.</p><a href={PALADIN_LEVELING_SOURCE.href} target="_blank" rel="noreferrer">{PALADIN_LEVELING_SOURCE.label}</a></div>
  </section>
}
