import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassPageKind, PublishRequirement } from '../../lib/classPage'
import { WARRIOR_LEVEL_20_BUILDS, WARRIOR_LEVEL_30_BUILDS, WARRIOR_PVP_LEVEL_30_BUILDS, type WarriorPreset } from '../warriorBuilds'
import {
  WARRIOR_BRANCHES,
  WARRIOR_ARCHIVED_DATA_VERSION,
  archivedWarriorTalents,
  WARRIOR_DATA_VERSION,
  WARRIOR_DATA_REVIEW_READY,
  WARRIOR_PLANNER_CONFIG,
  WARRIOR_SOURCES,
  WARRIOR_VERIFIED_BUILD,
  warriorBranchNames,
  warriorBranchTaglines,
  warriorTalents,
  type WarriorBranch,
} from '../warriorTalents'

const UPDATED = '2026-10-09'
const PHASE = 'Level 30 Beta editorial route'
const OFFICIAL_OCT_1_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/4'
const OFFICIAL_OCT_2_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/warrior-updates-in-todays-beta-build/2369360'
const OFFICIAL_OCT_8_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-8/2360696/5'
const WARRIOR_HERO = '/images/warrior/warrior-hero-v1.jpg'
const WARRIOR_SPEC_HERO: Record<WarriorBranch, string> = {
  arms: '/images/warrior/arms-warrior-hero-v1.jpg',
  fury: '/images/warrior/fury-warrior-hero-v1.jpg',
  protection: '/images/warrior/protection-warrior-hero-v1.jpg',
}
const WARRIOR_BRANCH_ICONS: Record<WarriorBranch, string> = {
  arms: '/images/warrior-talents/ability_warrior_savageblow.jpg',
  fury: '/images/warrior-talents/spell_nature_bloodlust.jpg',
  protection: '/images/warrior-talents/inv_shield_06.jpg',
}
const CAP_NOTE = "Blizzard raised the playable Beta cap to Level 30 on October 1. The current 21-point routes use the reviewed 1.60.1.70291 Warrior tree; the Level 20 page preserves the earlier 11-point opening allocations."
const EVIDENCE_NOTE = 'Client build 1.60.1.70291 verifies all 52 talent identities, rank caps, positions and prerequisite links. All 150 resolved rank descriptions are adapted from Talents Forever under CC BY 4.0 and labelled community-verified. Exported effect values are tooltip transcriptions resolved at Level 60; the planner does not rescale them to Level 30 or simulate damage. Change labels compare the preserved 69913 import. Point-per-level, tier spending and required prerequisite ranks remain derived planning rules. Build allocations and playstyle notes are editorial tests, not official best builds.'

const [armsPreset, furyPreset, protectionPreset] = WARRIOR_LEVEL_30_BUILDS
const [armsPvpPreset, furyPvpPreset] = WARRIOR_PVP_LEVEL_30_BUILDS

const makeBuild = (
  preset: WarriorPreset,
  id: string,
  intent: 'spec' | 'leveling' | 'pvp' | 'dungeon' | 'snapshot',
  href: string,
  title: string,
  role: string,
  playstyle: string[],
  strengths: string[],
): ClassBuild => ({
  id,
  spec: preset.branch,
  intent,
  level: 30,
  levelCap: 21,
  phase: PHASE,
  points: 21,
  allocation: preset.allocation,
  title,
  shortTitle: preset.shortTitle,
  role,
  playstyle,
  strengths,
  keyTalentIds: [...new Set(preset.order)].slice(-3),
  order: [...new Set(preset.order)],
  pointOrder: [...preset.order],
  build: preset.build,
  evidence: 'derived_assumption',
  sources: [
    { label: 'BuildForgeTools Level 30 Warrior editorial route', url: `https://buildforgetools.com${href}` },
    { label: 'Blizzard October 1 Beta cap announcement', url: OFFICIAL_OCT_1_SOURCE },
    { label: 'Blizzard October 2 Warrior changes', url: OFFICIAL_OCT_2_SOURCE },
    { label: 'Blizzard October 8 Beta fixes', url: OFFICIAL_OCT_8_SOURCE },
  ],
  verifiedThroughBuild: WARRIOR_VERIFIED_BUILD,
  createdAt: UPDATED,
  updatedAt: UPDATED,
  href,
})

const warriorBuilds: ClassBuild[] = [
  makeBuild(armsPreset, 'warrior-arms-build', 'spec', '/wow-forever-arms-warrior-build', 'Arms Warrior Build (Level 30)', 'Two-handed damage and stance control', ['Keep Rend and stance changes visible in the test.', 'Build Deep Wounds and Impale before Sweeping Strikes.', 'Use Sweeping Strikes where a second nearby opponent makes the effect useful.'], ['21-point weapon route', 'Bleed and critical-strike package', 'Two-target cooldown']),
  makeBuild(furyPreset, 'warrior-fury-build', 'spec', '/wow-forever-fury-warrior-build', 'Fury Warrior Build (Level 30)', 'Off-hand attacks and Rage flow', ['Compare the same main-hand and off-hand weapons.', 'Track Furious Precision and off-hand Rage separately from critical strikes.', 'Account for the increased damage taken while Death Wish is active.'], ['Current off-hand package', 'Rage-flow testing', 'Death Wish cooldown']),
  makeBuild(protectionPreset, 'warrior-protection-build', 'spec', '/wow-forever-protection-warrior-build', 'Protection Warrior Build (Level 30)', 'Shield tank and defensive control', ['Keep a shield equipped for the full test.', 'Use Vanguard to Charge while remaining in Defensive Stance.', 'Plan Shield Bash, Concussion Blow and Last Stand around the pull.'], ['Shield Rage and threat', 'Caster and target control', 'Defensive cooldown']),
  makeBuild(armsPreset, 'warrior-arms-leveling', 'leveling', '/wow-forever-arms-warrior-leveling-build', 'Arms Warrior Leveling Build (Level 30)', 'Solo leveling with two-handed damage', ['Open with Rend where its damage can run.', 'Preserve Rage for the next stance decision.', 'Compare Sweeping Strikes pulls with the same weapon and target count.'], ['21-point solo route', 'Executable point order', 'Two-target testing']),
  makeBuild(furyPreset, 'warrior-fury-leveling', 'leveling', '/wow-forever-fury-warrior-leveling-build', 'Fury Warrior Leveling Build (Level 30)', 'Off-hand leveling and Rage testing', ['Max Cruelty before the deeper Fury package.', 'Test the selected off-hand bonuses with an off-hand weapon.', 'Use Piercing Howl to create space and record Death Wish recovery costs.'], ['Off-hand hit and Rage', 'Current Fury talents', 'Escape utility']),
  makeBuild(protectionPreset, 'warrior-protection-leveling', 'leveling', '/wow-forever-protection-warrior-leveling-build', 'Protection Warrior Leveling Build (Level 30)', 'Defensive leveling and dungeon groups', ['Choose a shield when survivability and tank assignments drive the session.', 'Compare Rage from Master of Defense over similar pulls.', 'Use the dungeon page for the tank-versus-damage decision.'], ['Shield-first route', 'Controlled group pulls', 'Executable Level 30 path']),
  makeBuild(armsPvpPreset, 'warrior-arms-pvp', 'pvp', '/wow-forever-arms-warrior-pvp-build', 'Arms Warrior PvP Build (Level 30)', 'Weapon pressure and mounted-target control', ['Use Spearing Strike in Battle Stance and test mounted-target dismounts.', 'Preserve Rage through stance changes that answer the opponent.', 'Compare the traded two-handed rank against the general Arms route.'], ['Spearing Strike option', 'Bleeds and stance Rage', 'Distinct PvP allocation']),
  makeBuild(furyPvpPreset, 'warrior-fury-pvp', 'pvp', '/wow-forever-fury-warrior-pvp-build', 'Fury Warrior PvP Build (Level 30)', 'Melee pressure with reactive recovery', ['Use Piercing Howl to connect or disengage.', 'Watch Blood Craze and Enrage when opponents hit you.', 'Plan Death Wish around Fear pressure and its increased damage-taken cost.'], ['Reactive talent package', 'Movement control', 'Distinct PvP allocation']),
  makeBuild(protectionPreset, 'warrior-protection-dungeon', 'dungeon', '/wow-forever-protection-warrior-dungeon-build', 'Protection Warrior Dungeon Build (Level 30)', 'Level 30 shield tank test', ['Enter each pull with a shield and a Rage plan.', 'Use Vanguard, Shield Bash and Concussion Blow for controlled pulls.', 'Reserve Last Stand for a real emergency.'], ['Shield threat and Rage', 'Caster silence', 'Five-second stun']),
  ...WARRIOR_LEVEL_20_BUILDS.map((preset): ClassBuild => ({
    ...makeBuild(preset, `warrior-${preset.branch}-level-20-snapshot`, 'snapshot', '/wow-forever-warrior-level-20-build', preset.title, preset.role, ['Inspect the original opening allocation.', 'Keep the same level, weapon and targets when comparing branches.'], ['11-point opening', 'Preserved editorial allocation']),
    level: 20, levelCap: 11, points: 11, phase: 'Level 20 opening snapshot',
    sources: [{ label: 'BuildForgeTools preserved Level 20 opening allocation', url: 'https://buildforgetools.com/wow-forever-warrior-level-20-build' }],
  })),
]

const related = (...items: [string, string][]) => items.map(([href, label]) => ({ href, label }))

const page = (input: {
  kind: ClassPageKind
  slug: string
  intent: string
  title: string
  h1: string
  description: string
  eyebrow: string
  spec?: WarriorBranch
  primaryBuildId?: string
  retiredTo?: ClassPageDefinition['retiredTo']
  relatedBuildIds?: string[]
  relatedPages: [string, string][]
  sections: ClassPageDefinition['sections']
  faqs?: ClassPageDefinition['faqs']
  comparison?: ClassPageDefinition['comparison']
  publishRequirements?: PublishRequirement[]
  updatedAt?: string
}): ClassPageDefinition => ({
  ...input,
  ogImage: input.spec ? WARRIOR_SPEC_HERO[input.spec] : WARRIOR_HERO,
  canonical: `https://buildforgetools.com/${input.slug}`,
  robots: 'index, follow',
  updatedAt: input.updatedAt ?? UPDATED,
  relatedBuildIds: input.relatedBuildIds ?? [],
  relatedPages: related(...input.relatedPages),
  faqs: input.faqs ?? [],
  sections: input.sections.map((section, index) => index === 0
    ? { ...section, paragraphs: [CAP_NOTE, ...section.paragraphs.filter((paragraph) => paragraph !== CAP_NOTE)] }
    : section),
})

const warriorPages: ClassPageDefinition[] = [
  page({
    kind: 'calculator', slug: 'warrior', intent: 'Talent Calculator',
    title: 'WoW Forever Warrior Talent Calculator | Beta Build 70291', h1: 'WoW Forever Warrior Talent Calculator',
    description: 'Plan Arms, Fury, and Protection trees with the WoW Forever Warrior Talent Calculator, 52 complete nodes, level caps, presets, and shareable builds.', eyebrow: 'Beta Talent Planner',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build', 'warrior-protection-build'],
    relatedPages: [['/wow-forever-warrior-builds', 'Warrior Builds'], ['/wow-forever-warrior-talents', 'Warrior Talents'], ['/wow-forever-warrior-level-20-build', 'Level 20 Builds']],
    sections: [{ heading: 'Build all three Warrior talent trees', paragraphs: [CAP_NOTE, EVIDENCE_NOTE], bullets: ['Arms weapon and stance talents', 'Fury Rage and pressure talents', 'Protection shield and tank talents'] }],
    publishRequirements: ['completeClassPlanner'],
  }),
  page({
    kind: 'buildsHub', slug: 'wow-forever-warrior-builds', intent: 'Builds Hub',
    title: 'WoW Forever Warrior Builds & Talent Calculator | BuildForgeTools', h1: 'WoW Forever Warrior Builds',
    description: 'Explore complete Level 30 Warrior routes for Arms, Fury, and Protection, then customize each 21-point allocation in the talent calculator.', eyebrow: 'Level 30 Editorial Routes',
    relatedBuildIds: warriorBuilds.map((build) => build.id),
    relatedPages: [['/warrior', 'Warrior Talent Calculator'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling Build'], ['/wow-forever-warrior-pvp-build', 'Warrior PvP Builds'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Build']],
    sections: [{ heading: 'Choose a Warrior route', paragraphs: ['Arms, Fury and Protection offer different ways to spend the 21-point Level 30 budget. Use the role and intent labels to choose a starting route, then edit its exact allocation in the calculator.', EVIDENCE_NOTE] }],
    publishRequirements: ['level20Builds'],
  }),
  page({
    kind: 'leveling', slug: 'wow-forever-warrior-leveling-build', intent: 'General Leveling',
    title: 'WoW Forever Warrior Leveling Build | Level 30 Beta', h1: 'WoW Forever Warrior Leveling Build',
    description: 'Compare three complete Level 30 Warrior routes, replay the 21-point progression, and edit the allocation in the talent calculator.', eyebrow: 'Level 30 Beta Routes', primaryBuildId: 'warrior-arms-leveling',
    relatedBuildIds: ['warrior-fury-leveling', 'warrior-protection-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling'], ['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling'], ['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury']],
    sections: [{ heading: 'Choose a Level 30 Warrior path', paragraphs: ['Choose Arms for the two-handed bleed and Sweeping Strikes route, Fury to test the selected off-hand package, or Protection when shield tanking and control determine the session. The recorded point orders reach Level 30 without treating the allocations as measured rankings.', CAP_NOTE] }, { heading: 'Use the build as a test', paragraphs: [EVIDENCE_NOTE, 'Load the route, keep weapon and target conditions consistent, and change one talent decision at a time.'] }],
    publishRequirements: ['level20Builds'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-arms-warrior-build', intent: 'Arms Build',
    title: 'WoW Forever Arms Warrior Build | Level 30 Beta', h1: 'WoW Forever Arms Warrior Build',
    description: 'A complete Level 30 Arms path with Rend, retained Rage, Deep Wounds, Impale and Sweeping Strikes.', eyebrow: '21/0/0 Editorial Route', spec: 'arms', primaryBuildId: 'warrior-arms-build',
    relatedBuildIds: ['warrior-arms-leveling', 'warrior-arms-pvp'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling'], ['/wow-forever-arms-warrior-pvp-build', 'Arms PvP'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Why this Arms route', paragraphs: ['Improved Rend and Deflection open the first tier. Improved Tactical Mastery and Anger Management support stance Rage; Deep Wounds, Impale and three Two-Handed Weapon Specialization ranks extend the damage package before Sweeping Strikes at the 21-point endpoint.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Spend Rend 3, Deflection 2, Improved Tactical Mastery 5 and Anger Management 1 for the eleven-point opening. Add Deep Wounds 3, Improved Overpower 1, Two-Handed Weapon Specialization 3 and Impale 2; take Sweeping Strikes at Level 30. The timeline below lets you inspect every intermediate allocation.'] }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-fury-warrior-build', intent: 'Fury Build',
    title: 'WoW Forever Fury Warrior Build | Level 30 Beta', h1: 'WoW Forever Fury Warrior Build',
    description: 'A complete Level 30 Fury off-hand path with Furious Precision, Dual Wield Specialization, Piercing Howl and Death Wish.', eyebrow: '0/21/0 Off-hand Route', spec: 'fury', primaryBuildId: 'warrior-fury-build',
    relatedBuildIds: ['warrior-fury-leveling', 'warrior-fury-pvp'],
    relatedPages: [['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling'], ['/wow-forever-fury-warrior-pvp-build', 'Fury PvP'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Why this Fury route', paragraphs: ['Cruelty, Unbridled Wrath and Piercing Howl form the opening. Furious Precision improves off-hand hit chance; Dual Wield Specialization modifies off-hand damage and Rage. Those eight points need an off-hand weapon to test their stated benefits. Death Wish supplies the Level 30 endpoint and adds a damage-taken tradeoff.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Complete Cruelty 5 and Unbridled Wrath 5, then take Piercing Howl. Add Furious Precision 3 and Lingering Rage 1 to reach fifteen Fury points; finish Dual Wield Specialization 5 and Death Wish 1. Compare a different route if you are using one weapon.'] }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-protection-warrior-build', intent: 'Protection Build',
    title: 'WoW Forever Protection Warrior Build | Level 30 Beta', h1: 'WoW Forever Protection Warrior Build',
    description: 'A complete Level 30 Protection shield path with defensive Rage, threat, Vanguard, Shield Bash and Concussion Blow.', eyebrow: '0/0/21 Shield Route', spec: 'protection', primaryBuildId: 'warrior-protection-build',
    relatedBuildIds: ['warrior-protection-leveling', 'warrior-protection-dungeon'],
    relatedPages: [['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Why this Protection route', paragraphs: ['Shield Specialization, Improved Bloodrage, Improved Thunder Clap and Last Stand preserve the opening. Master of Defense adds shield-equipped dodge/parry Rage and Defiance modifies shield threat in Defensive Stance. Vanguard, two Shield Bash ranks and Concussion Blow extend pull and caster control.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Take Shield Specialization 5, Improved Bloodrage 2, Improved Thunder Clap 3 and Last Stand 1. Add Master of Defense 2 and Defiance 2, then Improved Sunder Armor 2, Vanguard 1, Improved Shield Bash 2 and Concussion Blow 1. The sequence below shows the tier gates at each point.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'talents', slug: 'wow-forever-warrior-talents', intent: 'Talent Trees and Changes',
    title: 'WoW Forever Warrior Talents & Talent Trees', h1: 'WoW Forever Warrior Talents & Talent Trees',
    description: 'Browse the 52 imported 70291 Warrior talents across Arms, Fury, and Protection with Beta change status, rank, position, and source labels.', eyebrow: '70291 Client Talent Catalogue',
    relatedPages: [['/warrior', 'Warrior Talent Calculator'], ['/wow-forever-arms-warrior-talents', 'Arms Talents'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/wow-forever-warrior-builds', 'Warrior Builds']],
    sections: [{ heading: 'Read the imported Warrior trees', paragraphs: ['The catalogue covers all 52 nodes in the reviewed 70291 client tree. The current Fury replacements and Protection moves are included; the preserved 69913 tree remains available for historical saved builds. Structural client evidence is separate from resolved community rank text and editorial allocations.', EVIDENCE_NOTE] }],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-arms-warrior-leveling-build', intent: 'Arms Leveling',
    title: 'WoW Forever Arms Warrior Leveling Build', h1: 'WoW Forever Arms Warrior Leveling Build',
    description: 'Follow a complete editable Level 30 Arms route from Rend and stance Rage to Deep Wounds, Impale and Sweeping Strikes.', eyebrow: 'Level 30 Arms Leveling', spec: 'arms', primaryBuildId: 'warrior-arms-leveling', relatedBuildIds: ['warrior-fury-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Level 10 to 30 talent path', paragraphs: ['The first eleven points remain Rend 3, Deflection 2, Improved Tactical Mastery 5 and Anger Management 1. The next ten build Deep Wounds, one Improved Overpower rank, two-handed specialization and Impale before Sweeping Strikes. Use the timeline to load the exact allocation at each level.', CAP_NOTE] }, { heading: 'Weapons, Rage and solo play', paragraphs: ['Use the same weapon while comparing pulls so weapon speed does not hide the talent result. The route values predictable Rage handling over an unverified damage ranking.'] }],
    faqs: [{ question: 'Is Arms a useful leveling starter?', answer: 'The route spends all 21 Level 30 points legally in the reviewed 70291 tree. It is an editorial two-handed test with a replayable order; speed and damage rankings still depend on weapons, targets and player tests.' }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-fury-warrior-leveling-build', intent: 'Fury Leveling',
    title: 'WoW Forever Fury Warrior Leveling Build', h1: 'WoW Forever Fury Warrior Leveling Build',
    description: 'Replay a complete Level 30 Fury off-hand leveling route with Furious Precision, Rage generation, Piercing Howl and Death Wish.', eyebrow: 'Level 30 Fury Leveling', spec: 'fury', primaryBuildId: 'warrior-fury-leveling', relatedBuildIds: ['warrior-arms-leveling'],
    relatedPages: [['/wow-forever-fury-warrior-build', 'Fury Build'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Level 10 to 30 talent path', paragraphs: ['Max Cruelty and Unbridled Wrath, then take Piercing Howl for the opening. Furious Precision 3 and Lingering Rage 1 unlock the fourth row; add Dual Wield Specialization 5 and Death Wish. This route commits eight points to off-hand attacks, so compare equivalent two-weapon conditions.', CAP_NOTE] }, { heading: 'Rage and early Fury', paragraphs: ['Track Rage generation over several equivalent fights. A short Beta sample cannot establish a universal Fury ranking, but it can show whether the route fits your weapon and pace.'] }],
    faqs: [{ question: 'Is Fury good for leveling?', answer: 'The reviewed 70291 route is a legal 21-point off-hand test with critical-strike, hit and Rage tools. Compare it with Arms at the same level while recording each weapon and target condition.' }, { question: 'Can this page prove a dual-wield build is best?', answer: 'No. The selected Furious Precision and Dual Wield Specialization benefits require an off-hand attack, but their presence does not prove that dual wielding levels fastest. Unbridled Wrath no longer has the earlier extra two-handed Rage clause in the resolved current text.' }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-protection-warrior-leveling-build', intent: 'Protection Leveling',
    title: 'WoW Forever Protection Warrior Leveling Build', h1: 'WoW Forever Protection Warrior Leveling Build',
    description: 'Use a complete Level 30 Protection shield route when tank assignments, caster control and defensive pulls drive the session.', eyebrow: 'Level 30 Protection Leveling', spec: 'protection', primaryBuildId: 'warrior-protection-leveling', relatedBuildIds: ['warrior-protection-dungeon'],
    relatedPages: [['/wow-forever-protection-warrior-build', 'Protection Build'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Solo and dungeon leveling', paragraphs: ['Protection makes the most sense when the character regularly tanks groups or values defensive consistency. Solo kills may take longer than a weapon-focused route.', CAP_NOTE] }, { heading: 'When to use this path', paragraphs: ['Choose the shield route when dungeon access and survivability drive the session. Move to the dedicated dungeon page for pull and cooldown planning.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'pvp', slug: 'wow-forever-warrior-pvp-build', intent: 'Warrior PvP Hub',
    title: 'WoW Forever Warrior PvP Builds', h1: 'WoW Forever Warrior PvP Builds',
    description: 'Compare distinct 21-point Arms and Fury PvP test routes with mounted-target control or reactive recovery; Protection PvP remains unpublished.', eyebrow: 'Level 30 PvP Test Routes', primaryBuildId: 'warrior-arms-pvp',
    relatedBuildIds: ['warrior-arms-pvp', 'warrior-fury-pvp'],
    relatedPages: [['/wow-forever-arms-warrior-pvp-build', 'Arms PvP'], ['/wow-forever-fury-warrior-pvp-build', 'Fury PvP'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Choose a PvP playstyle', paragraphs: ['Choose Arms when stance pressure and Spearing Strike mounted-target control fit the encounter. Choose Fury when Piercing Howl and the selected Blood Craze/Enrage package matter during incoming attacks. These are distinct editorial allocations in the reviewed tree; no match win-rate ranking is established. Protection talent data is available, but its PvP page still has no reviewed allocation.', EVIDENCE_NOTE] }],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-arms-warrior-pvp-build', intent: 'Arms PvP',
    title: 'WoW Forever Arms Warrior PvP Build', h1: 'WoW Forever Arms Warrior PvP Build',
    description: 'Load a complete Level 30 Arms PvP test with bleeds, stance Rage, Spearing Strike and Sweeping Strikes.', eyebrow: 'Level 30 Arms PvP', spec: 'arms', primaryBuildId: 'warrior-arms-pvp',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Level 30 Arms PvP test', paragraphs: ['The 21-point route trades one two-handed specialization rank from the general Arms allocation for Spearing Strike. The current description includes dismounting a mounted target; Blizzard also specifies Battle Stance. Keep stance, target type and positioning visible when testing the choice.', 'Deep Wounds, Impale, stance Rage and Sweeping Strikes remain selected. These talent choices can be replayed and edited, but the route does not establish competitive results or a universally correct cooldown sequence.'] }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-fury-warrior-pvp-build', intent: 'Fury PvP',
    title: 'WoW Forever Fury Warrior PvP Build', h1: 'WoW Forever Fury Warrior PvP Build',
    description: 'Load a complete Level 30 Fury PvP test with Piercing Howl, Blood Craze, Enrage and Death Wish.', eyebrow: 'Level 30 Fury PvP', spec: 'fury', primaryBuildId: 'warrior-fury-pvp',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-fury-warrior-build', 'Fury Build'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Level 30 Fury PvP test', paragraphs: ['This 21-point route replaces the general Fury off-hand package with Blood Craze 3 and Enrage 5. Incoming attacks are part of those talents’ stated conditions; Piercing Howl remains the movement-control tool. Compare the off-hand route when repeated weapon attacks, rather than incoming pressure, determine the test.', 'Death Wish increases physical damage and grants Fear immunity while also increasing damage taken. Plan that tradeoff for the encounter rather than assuming the cooldown is always safe. The client structure is reviewed through 70291; the allocation and matchup guidance remain editorial.'] }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-protection-warrior-pvp-build', intent: 'Protection PvP',
    title: 'WoW Forever Protection Warrior PvP Build', h1: 'WoW Forever Protection Warrior PvP Build',
    description: 'Review 70291 Protection Warrior PvP talent options while a recommended allocation for the Level 30 Beta remains under review.', eyebrow: 'Protection PvP Data Status', spec: 'protection',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Build pending verification', paragraphs: ['A Protection PvP allocation is pending verification. The page publishes the imported 70291 talent dataset and its defensive options without presenting the dungeon tank route as a proven PvP build.', 'Use the calculator to test Shield Specialization, Rage tools and control talents, then report what works in actual matches.'] }],
    publishRequirements: ['talentDataset'],
  }),
  page({
    kind: 'dungeon', slug: 'wow-forever-warrior-dungeon-build', intent: 'Warrior Dungeon Hub',
    title: 'WoW Forever Warrior Dungeon Builds', h1: 'WoW Forever Warrior Dungeon Builds',
    // Retired: the role choice now lives on the Protection dungeon page. The shared
    // publication gate and static artifact sync consume this explicit destination.
    retiredTo: '/wow-forever-protection-warrior-dungeon-build',
    description: 'Compare Warrior dungeon roles and open the complete 21-point Protection tank route in the talent calculator.', eyebrow: 'Dungeon Role Starters',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build'],
    relatedPages: [['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-build', 'Protection Build'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling']],
    sections: [{ heading: 'Warrior dungeon roles', paragraphs: ['Protection supplies the dedicated tank route. Arms and Fury remain damage-oriented alternatives when another player tanks the group.', 'This hub separates the role choice from the client facts and links the shield route directly into the calculator.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'specDungeon', slug: 'wow-forever-protection-warrior-dungeon-build', intent: 'Protection Dungeon Tank',
    title: 'WoW Forever Protection Warrior Dungeon Build', h1: 'WoW Forever Protection Warrior Dungeon Build',
    description: 'Use an editable Level 30 Protection dungeon tank route with shield Rage, Vanguard, caster silence, Concussion Blow and Last Stand.', eyebrow: 'Level 30 Dungeon Tank', spec: 'protection', primaryBuildId: 'warrior-protection-dungeon',
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms damage starter'], ['/wow-forever-fury-warrior-build', 'Fury damage starter'], ['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Threat, Rage and pulling', paragraphs: ['Enter a pull with a plan for Bloodrage and Thunder Clap instead of spending Rage reactively. Keep a shield equipped so Shield Specialization is part of the test.', 'Talent allocation alone does not prove threat output. Compare similar packs and record when Rage or survivability becomes the limiting factor.'] }, { heading: 'Choose the party job before the route', paragraphs: ['Choose Protection when assigned to tank: this page loads the 0/0/21 shield route for Rage, threat and control. If another player tanks, inspect the separate 21-point Arms or Fury damage routes, including Fury’s off-hand conditions, before editing an allocation.', 'The Arms and Fury routes are not measured dungeon damage rankings. Keep the same group, target packs and weapon conditions when comparing them, and record Rage flow, control and recovery instead of assuming either route performs better.'] }, { heading: 'Control and survival at Level 30', paragraphs: ['Concussion Blow is the Level 30 endpoint; Last Stand remains the emergency health cooldown from the opening. It does not replace pacing, positioning or healer awareness.', EVIDENCE_NOTE] }],
    comparison: { columns: ['Tank assignment', 'Damage assignment'], rows: [
      { label: 'Published starting point', values: ['Protection 0/0/21 dungeon tank route', 'Arms 21/0/0 or Fury 0/21/0 general route'] },
      { label: 'Question to test', values: ['Does shield, Rage and Thunder Clap planning keep the pull controlled?', 'Can the chosen starter sustain useful attacks without disrupting the tank?'] },
      { label: 'Evidence limit', values: ['Editorial Level 30 route; no measured threat ranking', 'General Level 30 routes; no measured dungeon damage rankings'] },
    ] },
    updatedAt: UPDATED,
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'levelCap', slug: 'wow-forever-warrior-level-20-build', intent: 'Level 20 Starter Snapshots',
    title: 'WoW Forever Warrior Level 20 Builds', h1: 'WoW Forever Warrior Level 20 Builds',
    description: 'Compare the three preserved 11-point Level 20 Warrior opening allocations beside the current Level 30 routes.', eyebrow: 'Level 20 Opening Snapshots',
    relatedBuildIds: ['warrior-arms-level-20-snapshot', 'warrior-fury-level-20-snapshot', 'warrior-protection-level-20-snapshot'],
    relatedPages: [['/wow-forever-arms-warrior-build', 'Current Arms 21/0/0'], ['/wow-forever-fury-warrior-build', 'Current Fury 0/21/0'], ['/wow-forever-protection-warrior-build', 'Current Protection 0/0/21'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Level 20 and 11 talent points', paragraphs: ['The original Arms, Fury and Protection opening allocations are preserved here. Their selected nodes remain legal in the current 70291 tree, so the calculator can replay the same eleven points; this does not restore every historical tooltip or layout. Older versioned saved builds retain the separate 69913 dataset.', 'The official Beta cap is Level 30. Use the current branch pages for complete 21-point routes rather than treating these eleven-point openings as cap builds.'] }],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury', 'legalBuild:protection'],
  }),
  page({
    kind: 'comparison', slug: 'wow-forever-arms-vs-fury-warrior-leveling', intent: 'Arms vs Fury Leveling',
    title: 'Arms vs Fury Warrior for Leveling in WoW Forever', h1: 'Arms vs Fury Warrior for Leveling in WoW Forever',
    description: 'Compare complete 21-point Arms and Fury Level 30 routes by their selected talents, weapon conditions, Rage tools and cooldown tradeoffs.', eyebrow: 'Level 30 Route Comparison',
    relatedBuildIds: ['warrior-arms-leveling', 'warrior-fury-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling Build'], ['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling Build'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling Hub']],
    sections: [
      { heading: 'Which Level 30 route should you load?', paragraphs: [
        'Choose Arms for a two-handed bleed and stance route: Rend, Deep Wounds and Impale lead to Sweeping Strikes at 21/0/0. The selected two-handed specialization needs a two-handed weapon. Compare Rage after stance changes and the value of a second nearby target instead of assuming one universal leveling speed.',
        'Choose Fury to test off-hand attacks: the 0/21/0 route selects Furious Precision and Dual Wield Specialization before Death Wish. Eight selected points modify off-hand attacks, so this allocation is unsuitable as an unconditional two-handed recommendation. Piercing Howl remains available for unsafe pulls.',
      ] },
      { heading: 'Current client changes and practical limits', paragraphs: [
        'The reviewed 70291 tree contains Lingering Rage, Furious Precision and Gore Drinker, the moved Protection layout, and Death Wish as the prerequisite for Flurry. This Fury route selects one Lingering Rage rank and three Furious Precision ranks; Gore Drinker and Flurry remain below the Level 30 point reach. Their presence in the full planner is not a claim that this route can spend them at 21 points.',
        'Blizzard’s October 8 notes restore the Deep Wounds link to Impale and describe Rage, Deep Wounds and Last Stand fixes. The current client prerequisite link is checked separately from the derived required-rank rule. Resolved rank text is community-verified under CC BY 4.0, while allocation and encounter choices are editorial.',
      ] },
      { heading: 'Run a useful comparison', paragraphs: ['Load each complete route and use the progression timeline for an equal level. Record weapon damage and speed, off-hand presence, target count, downtime, Rage after stance changes and Death Wish recovery. Keep target and group conditions similar; these routes do not establish a universal damage or leveling-speed ranking.'] },
    ],
    comparison: { columns: ['Arms', 'Fury'], rows: [
      { label: 'Published Level 30 route', values: ['21/0/0 in reviewed 70291', '0/21/0 in reviewed 70291'] },
      { label: 'Weapon condition', values: ['Three two-handed specialization ranks', 'Furious Precision 3 and Dual Wield Specialization 5 require off-hand attacks'] },
      { label: 'Opening eleven points', values: ['Rend 3, Deflection 2, Tactical Mastery 5, Anger Management 1', 'Cruelty 5, Unbridled Wrath 5, Piercing Howl 1'] },
      { label: 'Level 30 endpoint', values: ['Sweeping Strikes: next five melee attacks strike a nearby opponent', 'Death Wish: physical damage and Fear immunity with increased damage taken'] },
      { label: 'Rage question', values: ['Rage preserved through stance changes', 'Unbridled Wrath and off-hand Rage, plus one Lingering Rage rank'] },
      { label: 'Control and safety', values: ['Stance decisions and two-target positioning', 'Piercing Howl and the Death Wish damage-taken tradeoff'] },
      { label: 'What remains unverified', values: ['Leveling speed and encounter performance', 'Leveling speed and encounter performance'] },
    ] },
    faqs: [
      { question: 'Is Arms or Fury faster to level?', answer: 'No universal speed ranking is verified. Both published allocations spend all 21 Level 30 points legally. Compare weapon quality, target choice and downtime at equal levels before choosing.' },
      { question: 'Does this Fury route require dual wielding?', answer: 'Its eight off-hand talent points need off-hand attacks to supply their stated benefit. That condition belongs to this allocation, not every Fury route. Unbridled Wrath no longer has the earlier extra two-handed Rage clause in the current resolved text.' },
      { question: 'Can I still inspect the Level 20 opening?', answer: 'Yes. The Level 20 page preserves the original three eleven-point allocations, and the current routes provide replayable progression through Level 30. Versioned older saved builds retain the separate historical dataset.' },
    ],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury'],
  }),
  page({
    kind: 'specTalents', slug: 'wow-forever-arms-warrior-talents', intent: 'Arms Talent Tree',
    title: 'WoW Forever Arms Warrior Talents', h1: 'WoW Forever Arms Warrior Talents',
    description: 'Browse the imported 70291 Arms Warrior talent tree with client structure, community-verified rank text, positions, change status, and links to starter builds.', eyebrow: 'Arms Talent Catalogue', spec: 'arms',
    relatedBuildIds: ['warrior-arms-build', 'warrior-arms-leveling', 'warrior-arms-pvp'],
    relatedPages: [['/wow-forever-warrior-talents', 'All Warrior Talents'], ['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling']],
    sections: [{ heading: 'Read the Arms tree', paragraphs: ['This catalogue filters the Warrior dataset to Arms and groups its nodes by Beta change status. Build links show where the branch is used without turning an editorial allocation into a client fact.', EVIDENCE_NOTE] }],
  }),
  page({
    kind: 'specTalents', slug: 'wow-forever-protection-warrior-talents', intent: 'Protection Talent Tree',
    title: 'WoW Forever Protection Warrior Talents', h1: 'WoW Forever Protection Warrior Talents',
    description: 'Browse the imported 70291 Protection Warrior talent tree with client structure, community-verified rank text, positions, change status, and tank-build links.', eyebrow: 'Protection Talent Catalogue', spec: 'protection',
    relatedBuildIds: ['warrior-protection-build', 'warrior-protection-leveling', 'warrior-protection-dungeon'],
    relatedPages: [['/wow-forever-warrior-talents', 'All Warrior Talents'], ['/wow-forever-protection-warrior-build', 'Protection Build'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank']],
    sections: [{ heading: 'Read the Protection tree', paragraphs: ['This catalogue filters the Warrior dataset to Protection and connects shield, Rage and defensive nodes to the routes that use them.', EVIDENCE_NOTE] }],
  }),
]

export const warriorClass: ClassDefinition<WarriorBranch> = {
  id: 'warrior',
  name: 'Warrior',
  plannerPath: '/warrior',
  ogImage: WARRIOR_HERO,
  branches: WARRIOR_BRANCHES,
  branchIcons: WARRIOR_BRANCH_ICONS,
  branchNames: warriorBranchNames,
  branchTaglines: warriorBranchTaglines,
  storageKey: 'buildforge-warrior-70291-v1',
  analyticsClass: 'warrior',
  dataVersion: WARRIOR_DATA_VERSION,
  verifiedBuild: WARRIOR_VERIFIED_BUILD,
  talentCount: warriorTalents.length,
  dataReview: { ready: WARRIOR_DATA_REVIEW_READY, current: true, notice: EVIDENCE_NOTE },
  historicalSnapshots: [{ clientBuild: '1.60.1.69913', dataVersion: WARRIOR_ARCHIVED_DATA_VERSION, storageKey: 'wow-forever-warrior-build', talents: archivedWarriorTalents }],
  beta: { phaseLabel: 'Beta · 1.60.1.70291 · Level 30', levelCap: 30, pointsAtCap: 21 },
  plannerModes: [
    { level: 30, points: 21, label: 'Level 30' },
    { level: 20, points: 11, label: 'Level 20 comparison' },
    { level: 60, points: 51, label: 'Level 60 theorycraft' },
  ],
  talents: warriorTalents,
  plannerConfig: WARRIOR_PLANNER_CONFIG,
  builds: warriorBuilds,
  pages: warriorPages,
  recommendedBuildIds: ['warrior-arms-leveling', 'warrior-fury-build', 'warrior-protection-build'],
  sources: WARRIOR_SOURCES,
}
