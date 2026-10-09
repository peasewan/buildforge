import type { ClassDefinition, ClassTalent } from '../../lib/classPage'
import type { CurrentClassSnapshot } from '../../lib/currentClassClientReconcile'
import type { ExpansionProfile } from './profiles'
import { createExpansionClass } from './createClass'
import { buildReviewed70291Profile, buildReviewed70291RoleDecision } from './reviewed70291Profiles'

/** Adapt reviewed current client facts without converting inferred spend rules into facts. */
export function createReviewedExpansionClass(profile: ExpansionProfile, snapshot: CurrentClassSnapshot, historical: { classId: string; build: string; talents: unknown[] }): ClassDefinition {
  if (profile.id !== snapshot.classId || historical.classId !== profile.id || snapshot.clientBuild !== '1.60.1.70291') throw new Error('Reviewed expansion dataset identity mismatch')
  const historicalTalents = historical.talents as ClassTalent<string>[]
  const beforeById = new Map(historicalTalents.map(talent => [talent.id, talent]))
  const currentById = new Map(snapshot.talents.map(talent => [talent.id, talent]))
  const talents: ClassTalent<string>[] = snapshot.talents.map(record => {
    const previous = beforeById.get(record.id)
    const before = previous && [previous.name, previous.branch, previous.row, previous.column, previous.maxRank, previous.requiredTreePoints, previous.rankDescriptions, (previous.prerequisite ?? []).map(link => link.talentId).sort()]
    const after = [record.name, record.branch, record.row, record.column, record.maxRank, record.requiredTreePoints, record.rankDescriptions, [...record.prerequisite].sort()]
    return {
      ...record,
      changeStatus: !previous ? 'new' : JSON.stringify(before) === JSON.stringify(after) ? 'same' : 'changed',
      fieldEvidence: { ...record.fieldEvidence as ClassTalent<string>['fieldEvidence'], changeStatus: 'derived_assumption' },
      prerequisite: record.prerequisite.map(talentId => {
        const parent = currentById.get(talentId)
        if (!parent) throw new Error(`Missing reviewed prerequisite: ${record.id}/${talentId}`)
        return { talentId, requiredRank: parent.maxRank }
      }),
    }
  })
  const rankCount = talents.reduce((sum, talent) => sum + talent.maxRank, 0)
  const quarantine = snapshot.quarantinedClientNodes.length
    ? ` ${snapshot.quarantinedClientNodes.length} exact off-grid duplicate record is excluded under the published membership review; visible membership is community-reviewed.` : ''
  const grid = talents.filter(talent => talent.fieldEvidence.row === 'community_verified' || talent.fieldEvidence.column === 'community_verified').length
    ? ' Two active Warlock positions use explicitly reviewed row/column mappings; the original raw coordinates are preserved and those mapped positions have community evidence.' : ''
  const links = profile.id === 'druid' ? ' The Nature’s Majesty–Nature’s Splendor prerequisite direction is community-reviewed against two exact raw edges; both original edge records are preserved.' : ''
  const notice = `Reviewed ${profile.name} snapshot: ${talents.length} visible nodes from Wago client build ${snapshot.clientBuild}, reconciled against Talents Forever. All ${rankCount} rank descriptions are adapted from Talents Forever (CC BY 4.0, https://talentsforever.com), with community verification.${quarantine}${grid}${links} The export resolves tooltip values at Level 60; it does not rescale them to the selected level or simulate damage. Level 30 examples spend 21 points; the existing Level 20 page uses eleven-point stages of this reviewed tree. One point per level from 10, five points per tier, full-rank prerequisites and the editorial point order remain derived planning assumptions. Original 69913 saves remain historical records and are not partially migrated into a changed allocation.`
  const reviewedProfile = buildReviewed70291Profile(profile, talents)
  const def = createExpansionClass(reviewedProfile, { ...snapshot, talents }, {
    currentDataReview: { ready: snapshot.ready && snapshot.conflicts.length === 0, notice },
    levelCap: 30, level20Builds: true, reviewedAt: '2026-10-09',
  })
  def.sources = [...def.sources, { label: 'Creative Commons Attribution 4.0 · rank-text license', type: 'beta_client_crosscheck', url: snapshot.resolvedRankLicenseUrl }]
  def.historicalSnapshots = [{ clientBuild: historical.build, dataVersion: `WoW Forever Beta ${historical.build}`, storageKey: `buildforge-${profile.id}-${historical.build.split('.').at(-1)}-v1`, talents: historicalTalents }]
  for (const page of def.pages.filter(page => !page.retiredTo)) {
    page.roleDecision = buildReviewed70291RoleDecision(def, page)
    if (page.kind === 'pvp' && reviewedProfile.pvpDescription) page.description = reviewedProfile.pvpDescription
  }
  return def
}
