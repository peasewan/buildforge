import { Check, LockKeyhole } from 'lucide-react'
import { betaAvailabilityFor } from './data/betaAvailability'
import type { Branch } from './lib/build'

export default function BetaTalentAvailability({ branch }: { branch: Branch }) {
  const { talent, levelCap, availablePoints, requiredPoints, minimumLevel, available } = betaAvailabilityFor(branch)

  return (
    <section className="beta-availability shell" aria-label="Current Beta availability">
      <div>
        <span>Current Beta availability</span>
        <strong>Level cap {levelCap}</strong>
        <small>{availablePoints} talent points available</small>
      </div>
      <article className={available ? 'available' : 'unavailable'}>
        <img src={talent.icon} alt="" />
        <div>
          <strong>{talent.name}</strong>
          <span>{requiredPoints} talent points · Level {minimumLevel}</span>
        </div>
        <b>{available ? <Check size={14} /> : <LockKeyhole size={14} />}{available ? 'Available' : 'Not available'}</b>
      </article>
      <p>Calculated from the current Beta level cap and the client tree requirement for the first rank.</p>
    </section>
  )
}
