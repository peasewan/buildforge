import VerificationBadge from '../VerificationBadge'
import { OCTOBER_OFFICIAL_SOURCE, OFFICIAL_OCTOBER_CHANGES, type OfficialOctoberClassId } from '../data/officialOctoberChanges'

export default function OfficialClassChanges({ classId }: { classId: string }) {
  if (!Object.hasOwn(OFFICIAL_OCTOBER_CHANGES, classId)) return null
  const change = OFFICIAL_OCTOBER_CHANGES[classId as OfficialOctoberClassId]
  const { name, notes } = change
  const dateLabel = 'dateLabel' in change ? change.dateLabel : 'October 1'

  return <section className="hunter-official" aria-label={`${name} ${dateLabel} official changes`}>
    <div className="hunter-official-heading"><span>BLIZZARD {dateLabel.toUpperCase()} NOTES</span><VerificationBadge status="official" /></div>
    <h2>{dateLabel} Beta changes for {name}</h2>
    <p className="hunter-official-source">Official Beta announcement · <a href={OCTOBER_OFFICIAL_SOURCE} target="_blank" rel="noreferrer">Blizzard’s October 1 development notes</a>{'additionalSource' in change && <> · <a href={change.additionalSource} target="_blank" rel="noreferrer">October 2 Warrior follow-up</a></>}</p>
    <div className="hunter-official-facts">{notes.map((note) => <p key={note}>{note}</p>)}</div>
    <p className="hunter-official-boundary">The live Beta level cap is 30. The imported 1.60.1.69913 talent tree is older than this announcement. Level 20 routes with 11 talent points are starting snapshots; a Level 30 allocation has not been verified against the updated tree.</p>
  </section>
}
