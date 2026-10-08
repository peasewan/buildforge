import { compareTalentVersions } from '../lib/talentDiff'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { betaDataset, archivedBetaDataset } from './datasets'
import { BETA_PATCH_REVIEW } from './betaPatchReview'

const latestDiff = compareTalentVersions(archivedBetaDataset, betaDataset)

export const PALADIN_BETA_STATUS = {
  build: PALADIN_BETA_SNAPSHOT.clientBuild,
  previousBuild: archivedBetaDataset.sourceVersion.replace('wow_forever_beta_1.60.1.', ''),
  comparisonLabel: `${archivedBetaDataset.sourceVersion.replace('wow_forever_beta_', '')} → ${PALADIN_BETA_SNAPSHOT.clientBuild}`,
  updated: 'October 7, 2026',
  patchReviewedAt: 'September 24, 2026',
  patchBuild: BETA_PATCH_REVIEW.clientBuild,
  talentCount: betaDataset.talents.length,
  newTalentCount: PALADIN_BETA_SNAPSHOT.counts.paladinNewTalents,
  phaseLabel: PALADIN_BETA_SNAPSHOT.phase.label,
  levelCap: PALADIN_BETA_SNAPSHOT.phase.levelCap,
  levelCapSource: PALADIN_BETA_SNAPSHOT.phase.officialSource,
  routeSnapshotLevelCap: PALADIN_BETA_SNAPSHOT.phase.routeSnapshotLevelCap,
  added: latestDiff.added.length,
  updatedTalents: latestDiff.changed.length,
  updatedRankStrings: latestDiff.changed.reduce((sum, change) => sum + (change.changes.rankDescriptions?.length ?? 0), 0),
  removed: latestDiff.removed.length,
  changelogHref: '/wow-forever-paladin-beta-talent-changes',
} as const
