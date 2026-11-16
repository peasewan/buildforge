import { useState } from 'react'
import { acquisition, stands, type Stand, type StoryStage } from './data/standOut'
import { goals, standRoles, type Goal } from './data/standRoles'
import { useFirstToolAdjustment } from './lib/useFirstToolAdjustment'

const alternatives: Record<Goal, string> = { duel: 'star-platinum', raid: 'magician-s-red', farm: 'harvest' }

export default function StandVerdict({ stand, stage, select }: { stand: Stand; stage: StoryStage; select: (id: string) => void }) {
  const [goal, setGoal] = useState<Goal>('duel')
  const record = useFirstToolAdjustment('stand_out_picker_used')
  const role = standRoles[stand.id]
  const route = acquisition(stand, stage)
  const outsidePool = ['Removed from the arrow pool', 'Blocked by the story pool', 'Quest route', 'Evolution route'].includes(route.label)
  const verdict = role?.keep.includes(goal) ? 'Keep equipped' : outsidePool || (role && role.keep.length > 0) ? 'Store before switching' : 'Consider a reroll'
  const alternative = stands.find(item => item.id === alternatives[goal])!
  const reason = role?.reason ?? (outsidePool ? route.detail : 'Try '+(stand.moves[0]?.name ?? 'the base moveset')+' on your usual route first. This Stand has no specialist pick for this goal in our guide. Save it in storage if you want to keep the moveset.')
  return <section className="stand-compare" id="keep-or-reroll">
    <h2>Should you keep or reroll your Stand?</h2>
    <p>Pick the Stand you rolled and the job you need it for. Farming here means finding items and travelling between them.</p>
    <div className="stand-pair"><div className="stand-card"><label>Your rolled Stand<select value={stand.id} onChange={e => {select(e.target.value); record('stand')}}>{stands.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label>Your goal<select value={goal} onChange={e => {setGoal(e.target.value as Goal); record('goal')}}>{Object.entries(goals).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
      <article className="stand-card" aria-live="polite"><p className="stand-meta">{stand.name} · {goals[goal]}</p><h3>{verdict}</h3><p>{reason}</p>
        {role && role.keep.length > 0 && !role.keep.includes(goal) && <p>Its strongest use in this guide is {role.keep.map(g => goals[g]).join(' and ')}.</p>}
        {stand.id !== alternative.id && <p><strong>Alternative for {goals[goal]}: {alternative.name}.</strong> {acquisition(alternative,stage).detail}</p>}
        <a href="#compare">Inspect moves and how to get this Stand</a></article></div>
    <section className="stand-role-list" aria-labelledby="stand-picks-heading"><h2 id="stand-picks-heading">Best Stands for PvP, raids and farming</h2>
      <p>For duels, Star Platinum can reach an opponent with Star Finger before closing in. Magician’s Red can keep pressure on raid enemies from range with Penta Ankh. Harvest’s Search Party marks items, making it a pick for gathering between fights.</p>
      <details><summary>More recommended Stands for each activity</summary>{(Object.keys(goals) as Goal[]).map(g => <p key={g}><strong>{goals[g]}</strong> · {stands.filter(s => standRoles[s.id]?.keep.includes(g)).map(s => s.name).join(', ')}</p>)}</details></section>
    <p className="stand-source">Editorial picks based on move utility and acquisition difficulty. A reroll can cost your current Stand. <a href="https://standout.wiki/stands/">Stand move profiles</a> · <a href="https://standoutcodes.com/tier-list">Community mode rankings</a></p>
  </section>
}
