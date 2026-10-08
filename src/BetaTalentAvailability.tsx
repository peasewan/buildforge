import { Check, LockKeyhole } from 'lucide-react'
import { betaAvailabilityFor } from './data/betaAvailability'
import type { Branch } from './lib/build'

export default function BetaTalentAvailability({ branch }: { branch: Branch }) {
  const { talent, levelCap, availablePoints, requiredPoints, minimumLevel, available } = betaAvailabilityFor(branch)

  return (
    <section className="beta-availability shell" aria-label="Beta level-range check">
      <div>
        <span>Beta level-range check</span>
        <strong>Level cap {levelCap}</strong>
        <small>Up to {availablePoints} points under the leveling assumption</small>
      </div>
      <article className={available ? 'available' : 'unavailable'}>
        <img src={talent.icon} alt="" />
        <div>
          <strong>{talent.name}</strong>
          <span>{requiredPoints} talent points · Level {minimumLevel}</span>
        </div>
        <b>{available ? <Check size={14} /> : <LockKeyhole size={14} />}{available ? 'Within level range' : 'Above level range'}</b>
      </article>
      <p>Level 30 is official. The point budget assumes one point per level from 10; talent structure comes from the reviewed 70245 client tree. Full-rank prerequisite rules remain derived assumptions, and the level-range check does not establish build performance.</p>
    </section>
  )
}
