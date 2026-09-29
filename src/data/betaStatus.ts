import { compareTalentVersions } from '../lib/talentDiff'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import { betaDataset, previousBetaDataset } from './datasets'
import { BETA_PATCH_REVIEW } from './betaPatchReview'

const latestDiff = compareTalentVersions(previousBetaDataset, betaDataset)

export const PALADIN_BETA_STATUS = {
  build: PALADIN_BETA_SNAPSHOT.clientBuild,
  previousBuild: previousBetaDataset.sourceVersion.replace('wow_forever_beta_1.60.1.', ''),
  comparisonLabel: `${previousBetaDataset.sourceVersion.replace('wow_forever_beta_', '')} → ${PALADIN_BETA_SNAPSHOT.clientBuild}`,
  updated: 'September 20, 2026',
  patchReviewedAt: 'September 24, 2026',
  patchBuild: BETA_PATCH_REVIEW.clientBuild,
  talentCount: betaDataset.talents.length,
  newTalentCount: PALADIN_BETA_SNAPSHOT.counts.paladinNewTalents,
  phaseLabel: PALADIN_BETA_SNAPSHOT.phase.label,
  levelCap: PALADIN_BETA_SNAPSHOT.phase.levelCap,
  added: latestDiff.added.length,
  updatedTalents: latestDiff.changed.length,
  removed: latestDiff.removed.length,
  changelogHref: '/wow-forever-paladin-beta-talent-changes',
} as const
