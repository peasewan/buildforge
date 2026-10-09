import { describe, expect, it } from 'vitest'
import { PUBLISHED_CLASSES } from '../classes'
import { isLegalAllocation, type ClassDefinition, type ClassPageDefinition } from '../../lib/classPage'
import { buildHunterCurrentRoleDecision, createHunterCurrentProfile } from '../classes/hunterCurrentProfile'
import historicalHunterDataset from './hunter-1.60.1.69913.json'
import { createExpansionClass } from './createClass'
import { expansionProfiles, type ExpansionProfile } from './profiles'
import { buildRoleDecision } from './roleDecisions'

const roleKinds = new Set(['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'])
const classIds = ['rogue', 'priest', 'druid', 'warlock', 'hunter', 'shaman']
const fixture = (id: string, kind: string) => {
  const definition = PUBLISHED_CLASSES.find((candidate) => candidate.id === id)!
  const profile = id === 'hunter' ? createHunterCurrentProfile(definition.talents) : expansionProfiles.find((candidate) => candidate.id === id)!
  const page = definition.pages.find((candidate) => candidate.kind === kind)!
  return { definition, profile, page }
}

const historicalHunterProfile = expansionProfiles.find(profile => profile.id === 'hunter')!
const historicalHunterClass = createExpansionClass(historicalHunterProfile, historicalHunterDataset)
function decisionFor(definition: ClassDefinition, profile: ExpansionProfile, page: ClassPageDefinition) {
  return definition.id === 'hunter' && definition.dataReview?.current
    ? buildHunterCurrentRoleDecision(definition, page)
    : buildRoleDecision(profile, page, definition.talents, definition.builds)
}

describe('expansion role decisions', () => {
  for (const id of classIds) {
    it(`${id}: changes the relevant selected talent records when the condition changes`, () => {
      const { definition, profile } = fixture(id, 'pvp')
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
            expect(isLegalAllocation(alternative!.build, definition.talents, definition.plannerConfig, alternative!.levelCap)).toBe(true)
          }
        }
        expect(decision!.sources.length).toBeGreaterThan(0)
        const selectedSources = new Set(decision!.options.flatMap((option) => option.talentIds).flatMap((talentId) => definition.talents.find((talent) => talent.id === talentId)!.sources.map((source) => source.url)))
        for (const source of decision!.sources) {
          const url = new URL(source.url)
          expect(url.protocol).toBe('https:')
          expect(url.hostname).not.toBe('buildforgetools.com')
          expect(selectedSources.has(source.url) || url.hostname.endsWith('blizzard.com')).toBe(true)
        }
      }
    })
  }

  it('distinguishes a Rogue stealth opener from prolonged open combat', () => {
    const { definition, profile, page } = fixture('rogue', 'pvp')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['rogue-261', 'rogue-244'])
    expect(decision.options[1].talentIds).toEqual(['rogue-303'])
    expect(definition.builds.find((build) => build.id === decision.options[1].alternativeBuildId)?.spec).toBe('combat')
  })

  it('keeps the Druid Bear endpoint out of the Cat talent focus', () => {
    const { definition, profile, page } = fixture('druid', 'tank')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['druid-804'])
    expect(decision.options[1].talentIds).toEqual(['druid-796', 'druid-799'])
    expect(decision.options[1].explanation).toMatch(/Bear.*Cat|Cat.*Bear/)
  })

  it('separates Druid opponent pressure from the Bear group-tank job', () => {
    const { definition, profile, page } = fixture('druid', 'pvp')
    const tank = definition.pages.find((candidate) => candidate.kind === 'tank')!
    const pvpDecision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    const tankDecision = buildRoleDecision(profile, tank, definition.talents, definition.builds)!
    expect(pvpDecision.options[0].explanation).toMatch(/opponent/)
    expect(tankDecision.options[0].explanation).toMatch(/healer/)
    expect(pvpDecision.options[0].explanation).not.toBe(tankDecision.options[0].explanation)
  })

  it('limits the Voidwalker focus when another Warlock demon is selected', () => {
    const { definition, profile, page } = fixture('warlock', 'pet')
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

  it('does not claim a verified Shaman totem loadout from talent coverage', () => {
    const { definition, profile, page } = fixture('shaman', 'totem')
    const decision = buildRoleDecision(profile, page, definition.talents, definition.builds)!
    expect(decision.options[0].talentIds).toEqual(['shaman-595', 'shaman-582'])
    expect(decision.options[1].talentIds).toEqual(['shaman-586'])
    expect(decision.options.map((option) => option.explanation).join(' ')).toMatch(/loadout.*unverified|unverified.*loadout/)
  })

  it('returns no role decisions for catalogues, calculators or progression pages', () => {
    for (const profile of expansionProfiles) {
      const definition = PUBLISHED_CLASSES.find((candidate) => candidate.id === profile.id)!
      for (const page of definition.pages.filter((candidate) => !roleKinds.has(candidate.kind))) {
        expect(decisionFor(definition, profile.id === 'hunter' ? createHunterCurrentProfile(definition.talents) : profile, page), page.slug).toBeUndefined()
      }
    }
  })

  it('withholds a decision without a primary allocation or sufficient selected records', () => {
    const { definition, profile, page } = fixture('rogue', 'pvp')
    expect(buildRoleDecision(profile, { ...page, primaryBuildId: 'missing' }, definition.talents, definition.builds)).toBeUndefined()
    for (const allocation of [{ 'rogue-261': 5 }, { 'rogue-261': 5, 'rogue-303': 1 }]) {
      const builds = definition.builds.map((build) => build.id === page.primaryBuildId ? { ...build, build: allocation } : build)
      expect(buildRoleDecision(profile, page, definition.talents, builds)).toBeUndefined()
    }
  })

  it('omits an alternative when that branch is absent or the supplied allocation is invalid', () => {
    const { definition, profile, page } = fixture('rogue', 'pvp')
    for (const builds of [
      definition.builds.filter((build) => build.spec !== 'combat'),
      definition.builds.map((build) => build.spec === 'combat' ? { ...build, build: { 'unknown-talent': 11 } } : build),
    ]) {
      const decision = buildRoleDecision(profile, page, definition.talents, builds)!
      expect(decision.options[1].alternativeBuildId).toBeUndefined()
    }
  })
})
