import { describe, expect, it } from 'vitest'
import { hunterClass, normalizeHunterCurrentTalents } from './classes/hunter'
import currentSnapshot from './hunter-beta-1.60.1.70291.json'
import currentDiff from '../../data/reviews/current-classes/1.60.1.70291/hunter-diff.json'
import type { CurrentClassSnapshot } from '../lib/currentClassClientReconcile'
import { buildHunterCurrentRoleDecision, createHunterCurrentProfile } from './classes/hunterCurrentProfile'
import oldDataset from './expansion/hunter-1.60.1.69913.json'
import { createExpansionClass } from './expansion/createClass'
import { expansionProfiles } from './expansion/profiles'
import { allocationSignature, publishedClassPages, validClassBuild } from '../lib/classPage'
import { progressionForBuild } from '../experiences/buildExperience'
import { decodePlannerBuild, encodePlannerBuild } from '../lib/talentPlanner'

const oldClass = createExpansionClass(expansionProfiles.find(profile => profile.id === 'hunter')!, oldDataset)
const selectedNames = (buildId: string) => {
  const build = hunterClass.builds.find(candidate => candidate.id === buildId)!
  return build.order.map(id => hunterClass.talents.find(talent => talent.id === id)!.name)
}

describe('reviewed current Hunter data and routes', () => {
  it('explains the actual specialization selected by role pages', () => {
    const pvp = hunterClass.pages.find(page => page.kind === 'pvp')!
    expect(pvp.sections[0].heading).toBe('Survival: selected talents and trade-offs')
    expect(pvp.sections[0].paragraphs.join(' ')).toContain('Deflection')
    expect(pvp.sections[0].paragraphs.join(' ')).not.toContain('Ferocity 4/5')
    const dungeon = hunterClass.pages.find(page => page.kind === 'dungeon')!
    expect(dungeon.sections.some(section => section.heading === 'Marksmanship: selected talents and trade-offs')).toBe(true)
  })

  it('publishes all 50 current nodes with 148 complete rank descriptions without relabeling the old export', () => {
    expect(hunterClass.verifiedBuild).toBe('1.60.1.70291')
    expect(hunterClass.dataReview?.ready).toBe(true)
    expect(hunterClass.dataReview?.current).toBe(true)
    expect(hunterClass.talentCount).toBe(50)
    expect(hunterClass.talents).toHaveLength(50)
    expect(hunterClass.dataReview?.notice).toContain('tooltip transcriptions at Level 60')
    expect(hunterClass.dataReview?.notice).toContain('planning assumptions')
    expect(hunterClass.branches.map(branch => hunterClass.talents.filter(talent => talent.branch === branch).length)).toEqual([16, 16, 18])
    expect(hunterClass.talents.reduce((sum, talent) => sum + talent.maxRank, 0)).toBe(148)
    for (const talent of hunterClass.talents) {
      expect(talent.sourceClientBuild, talent.name).toBe('1.60.1.70291')
      expect(talent.verifiedThroughBuild, talent.name).toBe('1.60.1.70291')
      expect(talent.rankDescriptions, talent.name).toHaveLength(talent.maxRank)
      expect(talent.rankDescriptions?.every(description => Boolean(description.trim())), talent.name).toBe(true)
      expect(talent.sources.some(source => source.url === 'https://talentsforever.com/data.json'), talent.name).toBe(true)
    }
    expect(hunterClass.talents.some(talent => ['Thick Hide', 'Aimed Shot'].includes(talent.name))).toBe(false)
    expect(hunterClass.talents.some(talent => talent.name === 'Summon Hawk')).toBe(true)
    expect(hunterClass.talents.some(talent => talent.name === 'Lone Wolf')).toBe(true)
    expect(hunterClass.talents.some(talent => talent.name === 'Strider Kick')).toBe(true)
    expect(oldDataset.build).toBe('1.60.1.69913')
    expect(oldDataset.talents).toHaveLength(46)
    expect(oldDataset.talents.some(talent => talent.name === 'Thick Hide')).toBe(true)
    expect(oldDataset.talents.some(talent => talent.name === 'Aimed Shot')).toBe(true)
    expect(hunterClass.historicalSnapshots).toEqual([{ clientBuild: '1.60.1.69913', dataVersion: 'WoW Forever Beta 1.60.1.69913', storageKey: 'buildforge-hunter-69913-v1', talents: oldDataset.talents }])
  })

  it('labels runtime changes against the saved 69913 snapshot instead of upstream Classic comparisons', () => {
    const added = new Set(currentDiff.added.map(talent => talent.id))
    const changed = new Set([...currentDiff.moved, ...currentDiff.rank_changed, ...currentDiff.tooltip_changed, ...currentDiff.prerequisite_changed].map(talent => talent.id))
    const unchanged = new Set(currentDiff.unchanged.map(talent => talent.id))
    expect(added.size).toBe(13)
    expect(unchanged.size).toBe(3)
    for (const talent of hunterClass.talents) {
      const expected = added.has(talent.id) ? 'new' : unchanged.has(talent.id) ? 'same' : changed.has(talent.id) ? 'changed' : undefined
      expect(expected, talent.id).toBeDefined()
      expect(talent.changeStatus, talent.id).toBe(expected)
      expect(talent.fieldEvidence.changeStatus, talent.id).toBe('derived_assumption')
    }
    expect(hunterClass.talents.filter(talent => talent.changeStatus === 'new')).toHaveLength(13)
    expect(hunterClass.talents.filter(talent => talent.changeStatus === 'same')).toHaveLength(3)
    expect(hunterClass.talents.filter(talent => talent.changeStatus === 'changed')).toHaveLength(34)
    // The upstream Classic comparison remains preserved on the raw candidate.
    expect(currentSnapshot.talents.find(talent => talent.id === 'hunter-1382')?.changeStatus).toBe('changed')
  })

  it('preserves current raw identities and qualifies prerequisite rank requirements as planning assumptions', () => {
    const raw = currentSnapshot as CurrentClassSnapshot
    const normalized = normalizeHunterCurrentTalents(raw)
    for (const talent of normalized) {
      const source = raw.talents.find(candidate => candidate.id === talent.id)!
      expect(talent).toMatchObject({ id: source.id, nodeId: source.nodeId, spellId: source.spellId, row: source.row, column: source.column, maxRank: source.maxRank, x: source.x, y: source.y, sourceClientBuild: source.sourceClientBuild, verifiedThroughBuild: source.verifiedThroughBuild })
      expect(talent.spellIds, talent.name).toBeUndefined()
      expect(talent.prerequisite?.map(parent => parent.talentId), talent.name).toEqual(source.prerequisite)
      for (const prerequisite of talent.prerequisite ?? []) {
        expect(prerequisite.requiredRank, talent.name).toBe(normalized.find(parent => parent.id === prerequisite.talentId)!.maxRank)
        expect(talent.prerequisiteRuleStatus, talent.name).toBe('derived_assumption')
        expect(talent.fieldEvidence.prerequisiteLink, talent.name).toBe(talent.nodeId === 104964 ? 'community_verified' : 'client_verified')
      }
      expect(talent.fieldEvidence.requiredTreePoints, talent.name).toBe('derived_assumption')
      expect(talent.fieldEvidence.rankDescriptions, talent.name).toBe('community_verified')
    }
    expect(normalized.find(talent => talent.name === 'Summon Hawk')?.sourceTalentId).toBeUndefined()
    expect(currentSnapshot.rawClientNodeCount).toBe(52)
    expect(currentSnapshot.activeMembershipVerification).toBe('community_verified')
    expect(currentSnapshot.quarantinedClientNodes.map(node => [node.nodeId, node.spellId, node.posX, node.posY, node.replacementNodeId])).toEqual([[104982, 19168, 102800, 5740, 110859], [105003, 19464, 6820, 39300, 110870]])
    expect(currentSnapshot.quarantinedClientEdges).toHaveLength(1)
    expect(currentSnapshot.quarantinedClientEdges[0]).toMatchObject({ edgeId: 124700, leftNodeId: 104961, rightNodeId: 104964, sourceUrl: 'https://talentsforever.com/data.json' })
    expect(normalized.filter(talent => talent.fieldEvidence.prerequisiteLink === 'community_verified').map(talent => talent.nodeId)).toEqual([104964])
    expect(normalized.find(talent => talent.name === 'Intimidation')?.prerequisite).toEqual([{ talentId: 'hunter-1391', requiredRank: 1 }])
    expect(normalized.find(talent => talent.name === 'Bestial Wrath')?.prerequisite).toEqual([{ talentId: 'hunter-1387', requiredRank: 1 }])
    const broken = structuredClone(raw)
    broken.talents[0].prerequisite = ['unknown-current-node']
    expect(() => normalizeHunterCurrentTalents(broken)).toThrow('Unknown current Hunter prerequisite')
  })

  it('uses executable 21-point current routes for each spec, leveling, PvP, dungeon and pet task', () => {
    expect(hunterClass.beta).toMatchObject({ levelCap: 30, pointsAtCap: 21 })
    expect(hunterClass.plannerModes).toEqual(expect.arrayContaining([expect.objectContaining({ level: 30, points: 21 }), expect.objectContaining({ level: 20, points: 11 })]))
    const routes = hunterClass.builds.filter(build => build.level === 30)
    expect(routes.map(build => build.intent)).toEqual(expect.arrayContaining(['spec', 'leveling', 'pvp', 'dungeon', 'pet']))
    for (const build of routes) {
      expect(build.points, build.id).toBe(21)
      expect(build.levelCap, build.id).toBe(21)
      expect(build.evidence, build.id).toBe('derived_assumption')
      expect(build.verifiedThroughBuild, build.id).toBe('1.60.1.70291')
      expect(validClassBuild(hunterClass, build), build.id).toBe(true)
      const replay = progressionForBuild(hunterClass, build)
      expect(replay.error, build.id).toBeUndefined()
      expect(replay.steps, build.id).toHaveLength(21)
      expect(replay.steps.at(-1)?.allocation, build.id).toEqual(build.build)
      expect(decodePlannerBuild(encodePlannerBuild(build.build), hunterClass.talents), build.id).toEqual(build.build)
    }
    expect(selectedNames('hunter-beast-mastery-starter')).toContain('Summon Hawk')
    expect(selectedNames('hunter-beast-mastery-starter').at(-1)).toBe('Intimidation')
    expect(selectedNames('hunter-marksmanship-starter').at(-1)).toBe('Trueshot Aura')
    expect(selectedNames('hunter-survival-starter').at(-1)).toBe('Strider Kick')
    expect(selectedNames('hunter-hunter-dungeon-build')).not.toContain('Lone Wolf')
  })

  it('keeps the Level 20 URL as three legal current-tree eleven-point snapshots', () => {
    const page = hunterClass.pages.find(candidate => candidate.slug === 'wow-forever-hunter-level-20-build')!
    expect(page.h1).toBe('WoW Forever Hunter Level 20 Build')
    const snapshots = page.relatedBuildIds.map(id => hunterClass.builds.find(build => build.id === id)!)
    expect(snapshots).toHaveLength(3)
    expect(new Set(snapshots.map(build => allocationSignature(build.build))).size).toBe(3)
    for (const snapshot of snapshots) {
      expect(snapshot.level, snapshot.id).toBe(20)
      expect(snapshot.points, snapshot.id).toBe(11)
      expect(snapshot.levelCap, snapshot.id).toBe(11)
      expect(validClassBuild(hunterClass, snapshot), snapshot.id).toBe(true)
      const staged = progressionForBuild(hunterClass, snapshot)
      expect(staged.error, snapshot.id).toBeUndefined()
      expect(staged.steps, snapshot.id).toHaveLength(11)
      expect(staged.steps.at(-1)?.allocation, snapshot.id).toEqual(snapshot.build)
      const current = hunterClass.builds.find(build => build.spec === snapshot.spec && build.intent === 'spec' && build.level === 30)!
      const replay = progressionForBuild(hunterClass, current)
      expect(snapshot.build, snapshot.id).toEqual(replay.steps.find(entry => entry.level === 20)?.allocation)
    }
  })

  it('preserves every page URL, title, H1 and reviewed consolidation while making active tasks publishable', () => {
    expect(hunterClass.pages.map(page => ({ slug: page.slug, title: page.title, h1: page.h1, canonical: page.canonical, retiredTo: page.retiredTo }))).toEqual(oldClass.pages.map(page => ({ slug: page.slug, title: page.title, h1: page.h1, canonical: page.canonical, retiredTo: page.retiredTo })))
    expect(hunterClass.pages.filter(page => page.retiredTo)).toHaveLength(3)
    expect(publishedClassPages([hunterClass])).toHaveLength(12)
    expect(hunterClass.pages.find(page => page.kind === 'buildsHub')?.description).toContain('Level 30')
    expect(hunterClass.pages.find(page => page.kind === 'pet')?.retiredTo).toBeUndefined()
  })

  it('ties role conditions to distinct sets of selected current talents and source evidence', () => {
    for (const page of hunterClass.pages.filter(page => ['pvp', 'dungeon', 'pet'].includes(page.kind))) {
      const build = hunterClass.builds.find(candidate => candidate.id === page.primaryBuildId)!
      const decision = page.roleDecision!
      expect(decision, page.slug).toBeDefined()
      expect(decision.options.length, page.slug).toBeGreaterThanOrEqual(2)
      expect(new Set(decision.options.map(option => [...option.talentIds].sort().join('/'))).size, page.slug).toBeGreaterThanOrEqual(2)
      for (const option of decision.options) {
        expect(option.explanation.length, `${page.slug}/${option.id}`).toBeGreaterThan(80)
        expect(option.talentIds.length, `${page.slug}/${option.id}`).toBeGreaterThan(0)
        expect(option.talentIds.every(id => hunterClass.talents.some(talent => talent.id === id) && build.build[id] > 0), `${page.slug}/${option.id}`).toBe(true)
        if (option.alternativeBuildId) expect(validClassBuild(hunterClass, hunterClass.builds.find(candidate => candidate.id === option.alternativeBuildId)!)).toBe(true)
      }
      expect(decision.sources.some(source => source.url === 'https://talentsforever.com/data.json'), page.slug).toBe(true)
    }
  })
  it('fails closed when a required current route node or selected role rank is missing', () => {
    expect(() => createHunterCurrentProfile(hunterClass.talents.filter(talent => talent.name !== 'Summon Hawk'))).toThrow('Unresolved current Hunter route')
    const page = hunterClass.pages.find(candidate => candidate.kind === 'pet')!
    const invalid = { ...hunterClass, builds: hunterClass.builds.map(build => build.id === page.primaryBuildId ? { ...build, build: {} } : build) }
    expect(() => buildHunterCurrentRoleDecision(invalid, page)).toThrow('Current Hunter role has no selected rank')
    expect(buildHunterCurrentRoleDecision(hunterClass, hunterClass.pages.find(candidate => candidate.kind === 'talents')!)).toBeUndefined()
  })

})
