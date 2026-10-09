import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../classes'
import { isLegalAllocation, type ClassDefinition, type ClassPageDefinition } from '../../lib/classPage'
import { buildHunterCurrentRoleDecision, createHunterCurrentProfile } from '../classes/hunterCurrentProfile'
import historicalRogueDataset from './rogue-1.60.1.69913.json'
import historicalPriestDataset from './priest-1.60.1.69913.json'
import historicalDruidDataset from './druid-1.60.1.69913.json'
import historicalWarlockDataset from './warlock-1.60.1.69913.json'
import historicalShamanDataset from './shaman-1.60.1.69913.json'
import { buildReviewed70291Profile, buildReviewed70291RoleDecision } from './reviewed70291Profiles'
import historicalHunterDataset from './hunter-1.60.1.69913.json'
import { createExpansionClass } from './createClass'
import { expansionProfiles, type ExpansionProfile } from './profiles'
import { buildRoleDecision } from './roleDecisions'

const roleKinds = new Set(['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'])
const classIds = ['rogue', 'priest', 'druid', 'warlock', 'hunter', 'shaman']
const fixture = (id: string, kind: string) => {
  const definition = PUBLISHED_CLASSES.find((candidate) => candidate.id === id)!
  const original = expansionProfiles.find(candidate => candidate.id === id)!
  const profile = id === 'hunter' ? createHunterCurrentProfile(definition.talents) : buildReviewed70291Profile(original, definition.talents)
  const page = definition.pages.find((candidate) => candidate.kind === kind)!
  return { definition, profile, page }
}

const historicalDatasets = [historicalRogueDataset, historicalPriestDataset, historicalDruidDataset, historicalWarlockDataset, historicalShamanDataset, historicalHunterDataset]
const historicalFixture = (id: string, kind: string) => {
  const profile = expansionProfiles.find(candidate => candidate.id === id)!
  const dataset = historicalDatasets.find(candidate => candidate.classId === id)!
  const definition = createExpansionClass(profile, dataset)
  return { definition, profile, page: definition.pages.find(candidate => candidate.kind === kind)! }
}

const historicalHunterProfile = expansionProfiles.find(profile => profile.id === 'hunter')!
const historicalHunterClass = createExpansionClass(historicalHunterProfile, historicalHunterDataset)
function decisionFor(definition: ClassDefinition, profile: ExpansionProfile, page: ClassPageDefinition) {
  if (definition.dataReview?.current) return definition.id === 'hunter'
    ? buildHunterCurrentRoleDecision(definition, page)
    : buildReviewed70291RoleDecision(definition, page)
  return buildRoleDecision(profile, page, definition.talents, definition.builds)
}

describe('expansion role decisions', () => {
  for (const id of classIds) {
    for (const historical of [false, true]) {
    it(`${id}/${historical ? 'historical69913' : 'current70291'}: changes the relevant selected talent records when the condition changes`, () => {
      const { definition, profile } = historical ? historicalFixture(id, 'pvp') : fixture(id, 'pvp')
      for (const page of definition.pages.filter((candidate) => roleKinds.has(candidate.kind))) {
        const decision = decisionFor(definition, profile, page)
        expect(decision, page.slug).toBeDefined()
        expect(decision!.question.trim().length).toBeGreaterThan(0)
        expect(decision!.options.length).toBeGreaterThanOrEqual(2)
        expect(new Set(decision!.options.map((option) => option.id)).size).toBe(decision!.options.length)
        expect(new Set(decision!.options.map((option) => option.label)).size).toBe(decision!.options.length)
        expect(new Set(decision!.options.map((option) => option.explanation)).size).toBe(decision!.options.length)
        expect(new Set(decision!.options.map((option) => [...option.talentIds].sort().join(','))).size).toBe(decision!.options.length)
        const primary = definition.builds.find((build) => build.id === page.primaryBuildId)!
        for (const option of decision!.options) {
          expect(option.talentIds.length, `${page.slug}/${option.id}`).toBeGreaterThan(0)
          for (const talentId of option.talentIds) {
            expect(definition.talents.some((talent) => talent.id === talentId)).toBe(true)
            expect(primary.build[talentId]).toBeGreaterThan(0)
          }
          if (option.alternativeBuildId) {
            const alternative = definition.builds.find((build) => build.id === option.alternativeBuildId)
            expect(alternative).toBeDefined()
            expect(alternative!.spec).not.toBe(primary.spec)
            expect(alternative!.level).toBe(primary.level)
            expect(alternative!.points).toBe(primary.points)
            expect(alternative!.levelCap).toBe(primary.levelCap)
            expect(isLegalAllocation(alternative!.build, definition.talents, definition.plannerConfig, alternative!.levelCap)).toBe(true)
          }
        }
        expect(decision!.sources.length).toBeGreaterThan(0)
        const selectedSources = new Set(decision!.options.flatMap((option) => option.talentIds).flatMap((talentId) => definition.talents.find((talent) => talent.id === talentId)!.sources.map((source) => source.url)))
        for (const source of decision!.sources) {
          const url = new URL(source.url)
          expect(url.protocol).toBe('https:')
          expect(url.hostname).not.toBe('buildforgetools.com')
          const reviewedLicense = definition.dataReview?.current && source.url === 'https://creativecommons.org/licenses/by/4.0/' && definition.sources.some(candidate => candidate.url === source.url)
          expect(selectedSources.has(source.url) || url.hostname.endsWith('blizzard.com') || reviewedLicense).toBe(true)
        }
      }
    })
    }
  }

  it('historical69913: distinguishes a Rogue stealth opener from prolonged open combat', () => {
    const { definition, profile, page } = historicalFixture('rogue', 'pvp')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['rogue-261', 'rogue-244'])
    expect(decision.options[1].talentIds).toEqual(['rogue-303'])
    expect(definition.builds.find((build) => build.id === decision.options[1].alternativeBuildId)?.spec).toBe('combat')
  })

  it('historical69913: keeps the Druid Bear endpoint out of the Cat talent focus', () => {
    const { definition, profile, page } = historicalFixture('druid', 'tank')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['druid-804'])
    expect(decision.options[1].talentIds).toEqual(['druid-796', 'druid-799'])
    expect(decision.options[1].explanation).toMatch(/Bear.*Cat|Cat.*Bear/)
  })

  it('historical69913: separates Druid opponent pressure from the Bear group-tank job', () => {
    const { definition, profile, page } = historicalFixture('druid', 'pvp')
    const tank = definition.pages.find((candidate) => candidate.kind === 'tank')!
    const pvpDecision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    const tankDecision = buildRoleDecision(profile, tank, definition.talents, definition.builds)!
    expect(pvpDecision.options[0].explanation).toMatch(/opponent/)
    expect(tankDecision.options[0].explanation).toMatch(/healer/)
    expect(pvpDecision.options[0].explanation).not.toBe(tankDecision.options[0].explanation)
  })

  it('historical69913: limits the Voidwalker focus when another Warlock demon is selected', () => {
    const { definition, profile, page } = historicalFixture('warlock', 'pet')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['warlock-1225', 'warlock-1242'])
    expect(decision.options[1].talentIds).toEqual(['warlock-1223', 'warlock-1226'])
    expect(decision.options[1].explanation).toMatch(/Voidwalker/)
    expect(definition.builds.find((build) => build.id === decision.options[1].alternativeBuildId)?.spec).toBe('affliction')
  })

  it('retains official historical limits on Hunter pet and dungeon records', () => {
    for (const kind of ['pet', 'dungeon']) {
      const definition = historicalHunterClass
      const profile = historicalHunterProfile
      const page = definition.pages.find(page => page.kind === kind)!
      const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
      expect(definition.verifiedBuild).toBe('1.60.1.69913')
      const primary = definition.builds.find(build => build.id === page.primaryBuildId)!
      const historicalNode = definition.talents.find(talent => talent.name === (kind === 'pet' ? 'Thick Hide' : 'Aimed Shot'))!
      expect(primary.build[historicalNode.id]).toBeGreaterThan(0)
      expect(decision.sources.some((source) => source.url === 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid')).toBe(true)
      expect(decision.options.map((option) => option.explanation).join(' ')).toMatch(/historical/)
      expect(decision.options.map((option) => option.explanation).join(' ')).toMatch(/blank calculator/)
    }
  })

  it('uses complete current Hunter conditions rather than removed-node historical packages', () => {
    for (const kind of ['pvp', 'pet', 'dungeon']) {
      const { definition, profile, page } = fixture('hunter', kind)
      const decision = decisionFor(definition, profile, page)!
      expect(definition.verifiedBuild).toBe('1.60.1.70291')
      expect(profile.intro).toContain('21 points at Level 30')
      expect(decision).toEqual(page.roleDecision)
      expect(definition.builds.find(build => build.id === page.primaryBuildId)?.points).toBe(21)
      const names = decision.options.flatMap(option => option.talentIds.map(id => definition.talents.find(talent => talent.id === id)!.name))
      expect(names).not.toContain('Thick Hide')
      expect(names).not.toContain('Aimed Shot')
      expect(decision.options.map(option => option.explanation).join(' ')).not.toContain('blank calculator')
      expect(decision.sources.some(source => source.url === 'https://talentsforever.com/data.json')).toBe(true)
    }
  })

  it('retains the legacy Hunter PvP decision as an explicitly historical fixture', () => {
    const page = historicalHunterClass.pages.find(page => page.kind === 'pvp')!
    const decision = buildRoleDecision(historicalHunterProfile, page, historicalHunterClass.talents, historicalHunterClass.builds)!
    expect(decision.options[0].talentIds).toEqual(['hunter-1311', 'hunter-1621', 'hunter-1308'])
    expect(decision.options[1].talentIds).toEqual(['hunter-1304'])
    expect(decision.options[0].explanation).toContain('after the 69913 snapshot')
    expect(historicalHunterClass.builds.find(build => build.id === page.primaryBuildId)?.points).toBe(11)
  })

  it('historical69913: does not claim a verified Shaman totem loadout from talent coverage', () => {
    const { definition, profile, page } = historicalFixture('shaman', 'totem')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['shaman-595', 'shaman-582'])
    expect(decision.options[1].talentIds).toEqual(['shaman-586'])
    expect(decision.options.map((option) => option.explanation).join(' ')).toMatch(/loadout.*unverified|unverified.*loadout/)
  })

  it('current70291: distinguishes Rogue opener setup from recovery after contact', () => {
    const { definition, profile, page } = fixture('rogue', 'pvp')
    const decision = decisionFor(definition, profile, page)!
    const names = (index: number) => decision.options[index].talentIds.map(id => definition.talents.find(talent => talent.id === id)!.name)
    expect(names(0)).toEqual(['Camouflage', 'Opportunity', 'Initiative', 'Premeditation'])
    expect(names(1)).toEqual(['Ghostly Strike', 'Elusiveness', 'Heightened Senses', 'Preparation'])
    expect(decision.options[0].explanation).toMatch(/twenty-second/)
    expect(definition.builds.find(build => build.id === decision.options[1].alternativeBuildId)?.spec).toBe('combat')
    expect(decision).toEqual(page.roleDecision)
  })

  it('current70291: separates Druid opponent control from group tanking and form-specific threat', () => {
    const { definition, profile, page } = fixture('druid', 'pvp')
    const tank = definition.pages.find(candidate => candidate.kind === 'tank')!
    const pvp = decisionFor(definition, profile, page)!
    const group = decisionFor(definition, profile, tank)!
    const names = (ids: string[]) => ids.map(id => definition.talents.find(talent => talent.id === id)!.name)
    expect(names(pvp.options[0].talentIds)).toContain('Feral Charge')
    expect(names(pvp.options[0].talentIds)).not.toContain('Primal Bite')
    expect(names(group.options[0].talentIds)).toContain('Primal Bite')
    expect(names(group.options[1].talentIds)).not.toContain('Primal Bite')
    expect(pvp.options[0].explanation).toMatch(/opponent/)
    expect(group.options[0].explanation).toMatch(/healer recovery/)
    expect(group.options[1].explanation).toMatch(/group.*tank in Bear/)
    expect(pvp.options[0].explanation).not.toBe(group.options[0].explanation)
    expect(definition.builds.find(build => build.id === group.options[1].alternativeBuildId)?.spec).toBe('restoration')
  })

  it('current70291: keeps the Voidwalker active and separates combat from health-cost recovery', () => {
    const { definition, profile, page } = fixture('warlock', 'pet')
    const decision = decisionFor(definition, profile, page)!
    const names = (index: number) => decision.options[index].talentIds.map(id => definition.talents.find(talent => talent.id === id)!.name)
    expect(names(0)).toEqual(['Improved Voidwalker', 'Fel Vitality', 'Unholy Power', 'Demonic Knowledge'])
    expect(names(1)).toContain('Improved Health Funnel')
    expect(names(1)).toContain('Master Summoner')
    const primary = definition.builds.find(build => build.id === page.primaryBuildId)!
    const sacrifice = definition.talents.find(talent => talent.name === 'Demonic Sacrifice')!
    expect(primary.build[sacrifice.id] ?? 0).toBe(0)
    expect(decision.options[0].explanation).toMatch(/Demonic Sacrifice unselected/)
    expect(decision.options[1].explanation).toMatch(/player health/)
  })

  it('current70291: uses actual Shaman totem effects without the absent Totemic Mastery record', () => {
    const { definition, profile, page } = fixture('shaman', 'totem')
    const decision = decisionFor(definition, profile, page)!
    const names = decision.options[0].talentIds.map(id => definition.talents.find(talent => talent.id === id)!.name)
    expect(names).toEqual(['Totemic Focus', 'Restorative Totems', 'Mana Tide Totem'])
    expect(definition.talents.some(talent => talent.name === 'Totemic Mastery')).toBe(false)
    expect(decision.options[0].explanation).toMatch(/loadout.*unverified/)
    expect(decision.options[1].talentIds.map(id => definition.talents.find(talent => talent.id === id)!.name)).toContain('Water Shield')
  })

  it('returns no role decisions for catalogues, calculators or progression pages', () => {
    for (const profile of expansionProfiles) {
      const definition = PUBLISHED_CLASSES.find((candidate) => candidate.id === profile.id)!
      for (const page of definition.pages.filter((candidate) => !roleKinds.has(candidate.kind))) {
        expect(decisionFor(definition, profile.id === 'hunter' ? createHunterCurrentProfile(definition.talents) : profile, page), page.slug).toBeUndefined()
      }
    }
  })

  it('historical69913: withholds a decision without a primary allocation or sufficient selected records', () => {
    const { definition, profile, page } = historicalFixture('rogue', 'pvp')
    expect(buildRoleDecision(profile, { ...page, primaryBuildId: 'missing' }, definition.talents, definition.builds)).toBeUndefined()
    for (const allocation of [{ 'rogue-261': 5 }, { 'rogue-261': 5, 'rogue-303': 1 }]) {
      const builds = definition.builds.map((build) => build.id === page.primaryBuildId ? { ...build, build: allocation } : build)
      expect(buildRoleDecision(profile, page, definition.talents, builds)).toBeUndefined()
    }
  })

  it('historical69913: omits an alternative when that branch is absent or the supplied allocation is invalid', () => {
    const { definition, profile, page } = historicalFixture('rogue', 'pvp')
    for (const builds of [
      definition.builds.filter((build) => build.spec !== 'combat'),
      definition.builds.map((build) => build.spec === 'combat' ? { ...build, build: { 'unknown-talent': 11 } } : build),
    ]) {
      const decision = buildRoleDecision(profile, page, definition.talents, builds)!
      expect(decision.options[1].alternativeBuildId).toBeUndefined()
    }
  })
})
