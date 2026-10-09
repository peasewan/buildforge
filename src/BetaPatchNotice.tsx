import { PUBLISHED_CLASSES } from './data/classes'
import { BETA_PATCH_REVIEW } from './data/betaPatchReview'
export default function BetaPatchNotice({classId,expanded=false}:{classId:string;expanded?:boolean}) {
  const notes = BETA_PATCH_REVIEW.notes[classId as keyof typeof BETA_PATCH_REVIEW.notes]
  if (!notes) return null
  const reviewedClass = PUBLISHED_CLASSES.find(classDef => classDef.id === classId && classDef.dataReview?.current
      && classDef.dataReview.ready && classDef.verifiedBuild === '1.60.1.70291')
  if (reviewedClass) return <aside className="beta-patch-notice" aria-label="Reviewed current Beta data">
    <details open={expanded || undefined}><summary>Reviewed current Beta tree · client {reviewedClass.verifiedBuild}</summary>
      <p>The published {reviewedClass.name} calculator uses reviewed client records for the Level 30, 21-point routes. Resolved rank text has community evidence from Talents Forever under CC BY 4.0; tier costs and prerequisite-rank requirements remain planning assumptions.</p>
      {classId === 'hunter' && <p>Hunter visible membership and Intimidation’s prerequisite direction have community evidence; they are separate from client-verified identities, positions and rank caps.</p>}
      {classId === 'priest' && <p>One exact off-grid duplicate is excluded under community-reviewed visible membership.</p>}
      {classId === 'warlock' && <p>Two active row/column mappings have community evidence; the original raw coordinates are preserved.</p>}
      {classId === 'druid' && <p>The Nature’s Majesty–Nature’s Splendor prerequisite direction is community-reviewed against two exact raw edge records; required prerequisite ranks remain a planning assumption.</p>}
      <nav aria-label="Current talent data sources"><a href="https://wago.tools/db2/TraitNode/csv?build=1.60.1.70291" target="_blank" rel="noreferrer">Reviewed client records</a><a href="https://talentsforever.com/data.json" target="_blank" rel="noreferrer">Community rank text</a><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 license</a></nav>
      <p><strong>Historical September 24 notes:</strong> These announcements remain separate from the current dataset review.</p>
      <ul>{notes.map(note=><li key={note}>{note}</li>)}</ul>
      <nav aria-label="Historical Beta update sources"><a href={BETA_PATCH_REVIEW.officialSource} target="_blank" rel="noreferrer">Official development notes</a><a href={BETA_PATCH_REVIEW.clientDiffSource} target="_blank" rel="noreferrer">69977 → 70009 client diff</a></nav>
      <p>Older saved allocations retain their original version and need review before reopening. Legal planner ranks do not establish live-game performance or compatibility.</p>
    </details>
  </aside>
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
