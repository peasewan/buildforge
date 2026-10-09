import { PUBLISHED_CLASSES } from './data/classes'
import { officialTalentNotice } from './data/officialOctoberChanges'

type SelectedTalent = { name: string; rank: number }

/** Summarizes only exact selected-name matches in the reviewed announcement index. */
export default function OfficialBuildChangeSummary({
  className,
  buildVersion,
  selectedTalents,
  contextLabel,
}: {
  className: string
  buildVersion: string
  selectedTalents: SelectedTalent[]
  contextLabel?: string
}) {
  const reviewedClass = (className === 'hunter' || className === 'warrior') && buildVersion === '1.60.1.70291'
    ? PUBLISHED_CLASSES.find(classDef => classDef.id === className && classDef.dataReview?.current
      && classDef.dataReview.ready && classDef.verifiedBuild === buildVersion)
    : undefined
  const matches = selectedTalents.flatMap((talent) => {
    const notice = officialTalentNotice(className, talent.name)
    if (!notice) return []
    const currentNode = reviewedClass?.talents.some(current => current.name === talent.name)
    const message = currentNode ? notice.message.replace(/(?:This|The) (?:older )?69913 [^.]*\.\s*/g, '').trim() : notice.message
    return [{ ...talent, notice: { ...notice, message } }]
  })
  return <aside className="ix-official-build-summary" aria-label="Official change review" data-build-version={buildVersion}>
    <strong>Official change review{contextLabel ? ` · ${contextLabel}` : ''}</strong>
    <p>Talent tree source: client {buildVersion}. The selected allocation is a community or editorial example, not client data. This checks named talents against tracked official announcements through October 2, 2026; it is not an exhaustive patch history. {className.toLowerCase() === 'paladin' ? 'The current Paladin structure is reviewed through 70245; its rank text has separate community evidence. Historical allocations retain their original client records.' : reviewedClass ? `The current ${reviewedClass.name} tree is reviewed through ${reviewedClass.verifiedBuild}; rank descriptions have community evidence, while point budgets, tier costs and prerequisite-rank rules remain derived planning assumptions.` : 'The full newer-client tree remains unreconciled.'}</p>
    {reviewedClass && <p><a href="https://wago.tools/db2/TraitNode/csv?build=1.60.1.70291" target="_blank" rel="noreferrer">Reviewed client records</a>{' · '}<a href="https://talentsforever.com/data.json" target="_blank" rel="noreferrer">Community rank text</a>{' · '}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 license</a></p>}
    {matches.length ? <ul>{matches.map(({ name, rank, notice }) => <li key={name}>
      <b>{name} · {rank} selected</b> — {notice.status === 'removed' ? 'Removed' : 'Changed'} in official update. {notice.message}{' '}
      <a href={notice.source} target="_blank" rel="noreferrer">Source</a>
    </li>)}</ul> : <p>No matching tracked announcement for the selected talents. This does not mean the build or talents are verified current.</p>}
  </aside>
}
