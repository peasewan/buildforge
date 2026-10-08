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
  const matches = selectedTalents.flatMap((talent) => {
    const notice = officialTalentNotice(className, talent.name)
    return notice ? [{ ...talent, notice }] : []
  })
  return <aside className="ix-official-build-summary" aria-label="Official change review" data-build-version={buildVersion}>
    <strong>Official change review{contextLabel ? ` · ${contextLabel}` : ''}</strong>
    <p>Talent tree source: client {buildVersion}. The selected allocation is a community or editorial example, not client data. This checks named talents against tracked official announcements through October 2, 2026; it is not an exhaustive patch history. {className.toLowerCase() === 'paladin' ? 'The current Paladin structure is reviewed through 70245; its rank text has separate community evidence. Historical allocations retain their original client records.' : 'The full newer-client tree remains unreconciled.'}</p>
    {matches.length ? <ul>{matches.map(({ name, rank, notice }) => <li key={name}>
      <b>{name} · {rank} selected</b> — {notice.status === 'removed' ? 'Removed' : 'Changed'} in official update. {notice.message}{' '}
      <a href={notice.source} target="_blank" rel="noreferrer">Source</a>
    </li>)}</ul> : <p>No matching tracked announcement for the selected talents. This does not mean the build or talents are verified current.</p>}
  </aside>
}
