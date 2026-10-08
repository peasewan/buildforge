import { archivedBetaTalents, removedPaladinTalents } from '../data/talents'
import { decodeBuild } from './build'

/** Detect tombstones before current decoding can discard historical point selections. */
export function inspectPaladinBuildArchive(code: string) {
  const build = decodeBuild(code, archivedBetaTalents)
  const removed = removedPaladinTalents.filter(talent => (build[talent.id] ?? 0) > 0)
  if (!removed.length) return null
  return { code, build, removed, ranks: archivedBetaTalents.filter(talent => (build[talent.id] ?? 0) > 0).map(talent => ({ talent, rank: build[talent.id] })) }
}
