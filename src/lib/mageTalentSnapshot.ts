import type { MageSourceTalent } from './mageTalentReconcile'

export interface MageSnapshotFile {
  acquisition?: string
  source?: string
  fetchedAt?: string
  talents?: MageSourceTalent[]
}

// Spec: "If a page cannot be parsed reliably, a checked-in snapshot is allowed only with
// `acquisition: manual_snapshot` on that source file, and the review report must list it."
// This is the only way the importer's fallback may consume a snapshot: the file has to say
// it was transcribed by hand, so a fetched snapshot can never be relabelled as manual (and
// a hand-written one can never masquerade as a fetch).
export function readManualSnapshot(file: string, contents: string): MageSourceTalent[] {
  const parsed = JSON.parse(contents) as MageSnapshotFile
  if (parsed.acquisition !== 'manual_snapshot') {
    throw new Error(
      `${file} declares acquisition ${JSON.stringify(parsed.acquisition)}; --allow-manual-snapshot only accepts a checked-in snapshot with acquisition "manual_snapshot"`,
    )
  }
  if (!parsed.talents?.length) {
    throw new Error(`${file} declares acquisition "manual_snapshot" but contains no talents`)
  }
  return parsed.talents
}
