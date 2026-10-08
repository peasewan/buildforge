import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
export default function BetaPatchNotice({classId,expanded=false}:{classId:string;expanded?:boolean}) {
  const notes = BETA_PATCH_REVIEW.notes[classId as keyof typeof BETA_PATCH_REVIEW.notes]
  if (!notes) return null
  return <aside className="beta-patch-notice" aria-label="September 24 Beta update">
    <details open={expanded || undefined}><summary>{classId === 'paladin' ? 'Beta 70009 history · Paladin structure reconciled through 70245' : 'Beta 70009 update · this page’s older dataset is awaiting reconciliation'}</summary>
      <p>Official changes reviewed September 27. The calculator’s displayed dataset version remains its actual imported version; it has not been relabeled as verified 70009.</p>
      <ul>{notes.map(note=><li key={note}>{note}</li>)}</ul>
      {classId === 'paladin' ? <p><strong>Client-confirmed removal:</strong> Crusade removed from Retribution: node 110883 is absent from the reviewed 70245 tree. This is not an official removal announcement.</p> : BETA_PATCH_REVIEW.clientReported[classId]?.map(note=><p key={note}><strong>Client-diff report:</strong> {note}</p>)}
      <nav aria-label="Beta update sources"><a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Official development notes</a><a href={BETA_PATCH_REVIEW.clientDiffSource} target="_blank" rel="noreferrer">69977 → 70009 client diff</a></nav>
      <p>Old allocations are historical planning examples. Recheck changed or removed talents before using them in the updated Beta.</p>
    </details>
  </aside>
}
