import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { pointStepHref, type PointStep } from './data/paladinDecisionTools'
import { talents } from './data/talents'
import { track } from './lib/analytics'

export default function PaladinRouteTimeline({ steps, routeId, title, evidence }: { steps: readonly PointStep[]; routeId: string; title: string; evidence: string }) {
  const [level, setLevel] = useState(30)
  const step = steps.find(item => item.level === level)!
  const next = steps.find(item => item.level === level + 1)
  function selectLevel(value: number) {
    if (value === level) return
    setLevel(value)
    track('leveling_step_select', { class: 'paladin', level: value, placement: routeId })
  }
  return <section className="beta-leveling-snapshot shell leveling-timeline" aria-label={title}>
    <header><h2>{title}</h2><p>{evidence}</p></header>
    <label className="leveling-slider">Your level <strong>Level {level} · {level - 9} points</strong><input aria-label={`${title} level`} type="range" min="10" max="30" value={level} onChange={event => selectLevel(Number(event.target.value))} /></label>
    <div className="leveling-milestones">{[10, 15, 20, 25, 30].map(value => <button key={value} type="button" aria-pressed={level === value} onClick={() => selectLevel(value)}>Level {value}</button>)}</div>
    <div className="beta-leveling-grid">
      <article><h3>Allocation at Level {level}</h3><ul className="leveling-ranks">{Object.entries(step.build).map(([id, rank]) => { const talent = talents.find(item => item.id === id)!; return <li key={id}><img src={talent.icon} alt="" loading="lazy" /><span>{talent.name}</span><b>{rank}/{talent.maxRank}</b></li> })}</ul><a href={pointStepHref(step)} data-analytics-placement={routeId}>Edit Level {level} in Calculator <ArrowRight size={14} /></a></article>
      <article aria-live="polite"><h3>{next ? `Next: ${next.name} · rank ${next.rank}` : 'Level 30 cap reached'}</h3><p>{next ? `Spend the next point at Level ${next.level}.` : 'All 21 points are allocated. Edit the route or compare another approach.'}</p><p>Standard progression: one point per level from 10. Legacy: Talented is excluded. Point order is editorial; prerequisite full-rank rules are derived assumptions.</p></article>
    </div>
    <details className="leveling-order"><summary>Every point from Level 10 to 30</summary><ol>{steps.map(item => <li key={item.level}>Level {item.level}: {item.name} — rank {item.rank}</li>)}</ol></details>
  </section>
}
