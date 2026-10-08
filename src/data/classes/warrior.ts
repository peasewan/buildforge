import type { ClassBuild, ClassDefinition, ClassPageDefinition, ClassPageKind, PublishRequirement } from '../../lib/classPage'
import { WARRIOR_LEVEL_20_BUILDS, type WarriorPreset } from '../warriorBuilds'
import {
  WARRIOR_BRANCHES,
  WARRIOR_DATA_VERSION,
  WARRIOR_PLANNER_CONFIG,
  WARRIOR_SOURCES,
  WARRIOR_VERIFIED_BUILD,
  warriorBranchNames,
  warriorBranchTaglines,
  warriorTalents,
  type WarriorBranch,
} from '../warriorTalents'

const UPDATED = '2026-09-22'
const PHASE = 'Level 20 starter snapshot'
const OFFICIAL_OCT_1_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696'
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
const CAP_NOTE = "Blizzard's October 1 Beta development notes raised the playable cap to Level 30. These 11-point Level 20 starter snapshots retain the reviewed 1.60.1.69913 Warrior tree; no reviewed Level 30 Warrior allocation is published here."
const EVIDENCE_NOTE = 'Talent names, ranks, positions and tooltips come from dual-source client records reviewed through build 1.60.1.69913. The October 1–2 Warrior changes are official announcements, not imported or client-verified updates to this tree. Build allocations and playstyle notes are editorial testing routes, not official best builds.'

const [armsPreset, furyPreset, protectionPreset] = WARRIOR_LEVEL_20_BUILDS

const makeBuild = (
  preset: WarriorPreset,
  id: string,
  intent: 'spec' | 'leveling' | 'pvp' | 'dungeon',
  href: string,
  title: string,
  role: string,
  playstyle: string[],
  strengths: string[],
): ClassBuild => ({
  id,
  spec: preset.branch,
  intent,
  level: 20,
  levelCap: 20,
  phase: PHASE,
  points: 11,
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
    { label: 'BuildForgeTools Level 20 Warrior starter route', url: `https://buildforgetools.com${href}` },
    { label: 'Blizzard October 1 Beta announcement: cap and Warrior changes, not client verification', url: OFFICIAL_OCT_1_SOURCE },
  ],
  verifiedThroughBuild: WARRIOR_VERIFIED_BUILD,
  createdAt: UPDATED,
  updatedAt: UPDATED,
  href,
})

const warriorBuilds: ClassBuild[] = [
  makeBuild(armsPreset, 'warrior-arms-build', 'spec', '/wow-forever-arms-warrior-build', 'Arms Warrior Build (Level 20)', 'Weapon damage and stance control', ['Apply Rend before settling into the pull.', 'Preserve Rage while changing stance.', 'Use Anger Management as the 11-point snapshot endpoint.'], ['Direct solo route', 'Stance-change testing', 'Two-handed weapon focus']),
  makeBuild(furyPreset, 'warrior-fury-build', 'spec', '/wow-forever-fury-warrior-build', 'Fury Warrior Build (Level 20)', 'Critical strikes and Rage flow', ['Build Cruelty before deeper Fury talents.', 'Measure Unbridled Wrath with the same weapon speed.', 'Use Piercing Howl to create space.'], ['Simple melee loop', 'Rage-generation test', 'Level 20 control']),
  makeBuild(protectionPreset, 'warrior-protection-build', 'spec', '/wow-forever-protection-warrior-build', 'Protection Warrior Build (Level 20)', 'Shield tank and defensive group play', ['Keep a shield equipped for the full test.', 'Use Bloodrage before the pull needs extra Rage.', 'Hold Last Stand for a real defensive check.'], ['Shield-first route', 'Dungeon-ready utility', 'Defensive cooldown']),
  makeBuild(armsPreset, 'warrior-arms-leveling', 'leveling', '/wow-forever-arms-warrior-leveling-build', 'Arms Warrior Leveling Build (Level 20)', 'Solo leveling with weapon damage', ['Open with Rend.', 'Keep enough Rage for the next stance decision.', 'Compare pulls with the same weapon.'], ['Sustained solo damage', 'Straightforward point order', 'Low setup cost']),
  makeBuild(furyPreset, 'warrior-fury-leveling', 'leveling', '/wow-forever-fury-warrior-leveling-build', 'Fury Warrior Leveling Build (Level 20)', 'Fast melee leveling and Rage testing', ['Max Cruelty first.', 'Track extra Rage from Unbridled Wrath.', 'Use Piercing Howl when a pull becomes unsafe.'], ['Fast melee rhythm', 'Extra Rage opportunities', 'Escape utility']),
  makeBuild(protectionPreset, 'warrior-protection-leveling', 'leveling', '/wow-forever-protection-warrior-leveling-build', 'Protection Warrior Leveling Build (Level 20)', 'Defensive leveling and dungeon groups', ['Level with a shield when survivability matters.', 'Use Thunder Clap on controlled multi-target pulls.', 'Move to the dungeon route when group tanking becomes the goal.'], ['Safer pulls', 'Group-ready talents', 'Clear defensive identity']),
  makeBuild(armsPreset, 'warrior-arms-pvp', 'pvp', '/wow-forever-arms-warrior-pvp-build', 'Arms Warrior PvP Build (Level 20)', 'Weapon pressure and stance control in PvP', ['Keep Rend active when pressure is possible.', 'Preserve Rage through the stance change that answers the opponent.', 'Treat the 11-point snapshot as a test, not a final PvP ranking.'], ['Sustained pressure', 'Rage retention', 'Simple 11-point route']),
  makeBuild(furyPreset, 'warrior-fury-pvp', 'pvp', '/wow-forever-fury-warrior-pvp-build', 'Fury Warrior PvP Build (Level 20)', 'Melee pressure with Piercing Howl utility', ['Use Piercing Howl to stay connected or disengage.', 'Test Cruelty and Rage generation across repeated fights.', 'Avoid claiming Level 30 Fury conclusions from this 11-point snapshot.'], ['Movement control', 'Critical-strike pressure', 'Rage-flow testing']),
  makeBuild(protectionPreset, 'warrior-protection-dungeon', 'dungeon', '/wow-forever-protection-warrior-dungeon-build', 'Protection Warrior Dungeon Build (Level 20)', 'Level 20 dungeon tank starter', ['Enter each pull with a shield and a Rage plan.', 'Use Thunder Clap where the pack makes it worthwhile.', 'Reserve Last Stand for the pull that would otherwise end the run.'], ['Shield specialization', 'Multi-target control', 'Emergency cooldown']),
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
    title: 'WoW Forever Warrior Talent Calculator | Beta Build 69913', h1: 'WoW Forever Warrior Talent Calculator',
    description: 'Plan Arms, Fury, and Protection trees with the WoW Forever Warrior Talent Calculator, 53 verified nodes, level caps, presets, and shareable builds.', eyebrow: 'Beta Talent Planner',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build', 'warrior-protection-build'],
    relatedPages: [['/wow-forever-warrior-builds', 'Warrior Builds'], ['/wow-forever-warrior-talents', 'Warrior Talents'], ['/wow-forever-warrior-level-20-build', 'Level 20 Builds']],
    sections: [{ heading: 'Build all three Warrior talent trees', paragraphs: [CAP_NOTE, EVIDENCE_NOTE], bullets: ['Arms weapon and stance talents', 'Fury Rage and pressure talents', 'Protection shield and tank talents'] }],
    publishRequirements: ['completeClassPlanner'],
  }),
  page({
    kind: 'buildsHub', slug: 'wow-forever-warrior-builds', intent: 'Builds Hub',
    title: 'WoW Forever Warrior Builds & Talent Calculator | BuildForgeTools', h1: 'WoW Forever Warrior Builds',
    description: 'Explore Level 20 Warrior starter builds for Arms, Fury, and Protection, then customize the 11-point snapshots in the talent calculator.', eyebrow: 'Level 20 Starter Builds',
    relatedBuildIds: warriorBuilds.map((build) => build.id),
    relatedPages: [['/warrior', 'Warrior Talent Calculator'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling Build'], ['/wow-forever-warrior-pvp-build', 'Warrior PvP Builds'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Build']],
    sections: [{ heading: 'Choose a Warrior route', paragraphs: ['Arms, Fury and Protection offer different ways to test the 11-point opening. Use the role and intent labels to choose a starting route, then edit its exact allocation in the calculator.', EVIDENCE_NOTE] }],
    publishRequirements: ['level20Builds'],
  }),
  page({
    kind: 'leveling', slug: 'wow-forever-warrior-leveling-build', intent: 'General Leveling',
    title: 'WoW Forever Warrior Leveling Build | Level 20 Beta', h1: 'WoW Forever Warrior Leveling Build',
    description: 'Compare three Level 20 Warrior starter routes, then load a complete 11-point snapshot in the talent calculator.', eyebrow: 'Level 20 Beta Starter', primaryBuildId: 'warrior-arms-leveling',
    relatedBuildIds: ['warrior-fury-leveling', 'warrior-protection-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling'], ['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling'], ['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury']],
    sections: [{ heading: 'Choose a Level 20 Warrior path', paragraphs: ['Arms offers direct weapon pressure, Fury tests critical strikes and Rage flow, and Protection trades speed for a safer shield route. Arms is the default starting point here because it gives solo players a clear eleven-point path.', CAP_NOTE] }, { heading: 'Use the build as a test', paragraphs: [EVIDENCE_NOTE, 'Load the route, keep weapon and target conditions consistent, and change one talent decision at a time.'] }],
    publishRequirements: ['level20Builds'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-arms-warrior-build', intent: 'Arms Build',
    title: 'WoW Forever Arms Warrior Build | Level 20 Beta', h1: 'WoW Forever Arms Warrior Build',
    description: 'A Level 20 Arms path built around Rend, retained Rage, and Anger Management.', eyebrow: '11/0/0 Community Route', spec: 'arms', primaryBuildId: 'warrior-arms-build',
    relatedBuildIds: ['warrior-arms-leveling', 'warrior-arms-pvp'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling'], ['/wow-forever-arms-warrior-pvp-build', 'Arms PvP'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Why this Arms route', paragraphs: ['Improved Rend opens the damage package while Deflection completes the first tier. Improved Tactical Mastery preserves more Rage through stance changes before Anger Management closes this 11-point snapshot.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Spend three points in Improved Rend, two in Deflection, five in Improved Tactical Mastery and take Anger Management with the final point.'] }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-fury-warrior-build', intent: 'Fury Build',
    title: 'WoW Forever Fury Warrior Build | Level 20 Beta', h1: 'WoW Forever Fury Warrior Build',
    description: 'A Level 20 Fury path for testing critical strikes, Rage generation, and Piercing Howl utility.', eyebrow: '0/11/0 Community Route', spec: 'fury', primaryBuildId: 'warrior-fury-build',
    relatedBuildIds: ['warrior-fury-leveling', 'warrior-fury-pvp'],
    relatedPages: [['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling'], ['/wow-forever-fury-warrior-pvp-build', 'Fury PvP'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Why this Fury route', paragraphs: ['Cruelty raises critical-strike chance, Unbridled Wrath creates a repeatable Rage-generation test and Piercing Howl adds control to this 11-point snapshot after ten Fury points.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Complete Cruelty, spend five points in Unbridled Wrath, then take Piercing Howl with the eleventh point.'] }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-protection-warrior-build', intent: 'Protection Build',
    title: 'WoW Forever Protection Warrior Build | Level 20 Beta', h1: 'WoW Forever Protection Warrior Build',
    description: 'A Level 20 Protection path for early dungeon tanking and defensive group play.', eyebrow: '0/0/11 Shield Route', spec: 'protection', primaryBuildId: 'warrior-protection-build',
    relatedBuildIds: ['warrior-protection-leveling', 'warrior-protection-dungeon'],
    relatedPages: [['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Why this Protection route', paragraphs: ['Shield Specialization establishes the shield package. Improved Bloodrage supports Rage, Improved Thunder Clap changes the early multi-target tool and Last Stand adds a defensive cooldown at Level 20.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Take five Shield Specialization ranks, two Improved Bloodrage ranks, three Improved Thunder Clap ranks and Last Stand.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'talents', slug: 'wow-forever-warrior-talents', intent: 'Talent Trees and Changes',
    title: 'WoW Forever Warrior Talents & Talent Trees', h1: 'WoW Forever Warrior Talents & Talent Trees',
    description: 'Browse the 53 imported 69913 Warrior talents across Arms, Fury, and Protection with Beta change status, rank, position, and source labels.', eyebrow: '69913 Client Talent Catalogue',
    relatedPages: [['/warrior', 'Warrior Talent Calculator'], ['/wow-forever-arms-warrior-talents', 'Arms Talents'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/wow-forever-warrior-builds', 'Warrior Builds']],
    sections: [{ heading: 'Read the imported Warrior trees', paragraphs: ['The catalogue groups every 69913 node by branch and by its change status in that imported Beta dataset. It keeps client facts separate from later announcements and editorial allocations.', EVIDENCE_NOTE] }],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-arms-warrior-leveling-build', intent: 'Arms Leveling',
    title: 'WoW Forever Arms Warrior Leveling Build', h1: 'WoW Forever Arms Warrior Leveling Build',
    description: 'Follow an editable Level 20 Arms Warrior leveling route built around Rend, Rage retention, and a direct two-handed playstyle.', eyebrow: 'Level 20 Arms Leveling', spec: 'arms', primaryBuildId: 'warrior-arms-leveling', relatedBuildIds: ['warrior-fury-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Level 10 to 20 talent path', paragraphs: ['Build Improved Rend first, add Deflection, then commit the next five points to Improved Tactical Mastery before taking Anger Management.', CAP_NOTE] }, { heading: 'Weapons, Rage and solo play', paragraphs: ['Use the same weapon while comparing pulls so weapon speed does not hide the talent result. The route values predictable Rage handling over an unverified damage ranking.'] }],
    faqs: [{ question: 'Is Arms a useful leveling starter?', answer: 'The reviewed Level 20 starter snapshot offers a legal, direct 11-point route with Rend and Rage retention. Its performance still depends on weapon and encounter conditions; no Level 30 recommendation has been verified.' }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-fury-warrior-leveling-build', intent: 'Fury Leveling',
    title: 'WoW Forever Fury Warrior Leveling Build', h1: 'WoW Forever Fury Warrior Leveling Build',
    description: 'Test a Level 20 Fury Warrior leveling route focused on critical strikes, Rage generation, and Piercing Howl utility.', eyebrow: 'Level 20 Fury Leveling', spec: 'fury', primaryBuildId: 'warrior-fury-leveling', relatedBuildIds: ['warrior-arms-leveling'],
    relatedPages: [['/wow-forever-fury-warrior-build', 'Fury Build'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Level 10 to 20 talent path', paragraphs: ['Max Cruelty, invest five points in Unbridled Wrath and take Piercing Howl with the final point.', CAP_NOTE] }, { heading: 'Rage and early Fury', paragraphs: ['Track Rage generation over several equivalent fights. A short Beta sample cannot establish a universal Fury ranking, but it can show whether the route fits your weapon and pace.'] }],
    faqs: [{ question: 'Is Fury good for leveling?', answer: 'The 69913 starter snapshot offers a legal 11-point route with critical-strike and Rage tools. Compare it directly with Arms using equivalent weapons and targets.' }, { question: 'Can this page prove a dual-wield build is best?', answer: 'No. This page publishes a Level 20 starter allocation and does not turn weapon assumptions into client facts or verify the October 1 Fury changes in a newer client.' }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-protection-warrior-leveling-build', intent: 'Protection Leveling',
    title: 'WoW Forever Protection Warrior Leveling Build', h1: 'WoW Forever Protection Warrior Leveling Build',
    description: 'Use a Level 20 Protection Warrior leveling route when safer pulls, shields, and frequent dungeon groups matter more than solo speed.', eyebrow: 'Level 20 Protection Leveling', spec: 'protection', primaryBuildId: 'warrior-protection-leveling', relatedBuildIds: ['warrior-protection-dungeon'],
    relatedPages: [['/wow-forever-protection-warrior-build', 'Protection Build'], ['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Solo and dungeon leveling', paragraphs: ['Protection makes the most sense when the character regularly tanks groups or values defensive consistency. Solo kills may take longer than a weapon-focused route.', CAP_NOTE] }, { heading: 'When to use this path', paragraphs: ['Choose the shield route when dungeon access and survivability drive the session. Move to the dedicated dungeon page for pull and cooldown planning.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'pvp', slug: 'wow-forever-warrior-pvp-build', intent: 'Warrior PvP Hub',
    title: 'WoW Forever Warrior PvP Builds', h1: 'WoW Forever Warrior PvP Builds',
    description: 'Compare 11-point Arms and Fury Warrior PvP starter routes and review Protection options awaiting a recommended allocation.', eyebrow: 'Level 20 PvP Snapshots',
    relatedBuildIds: ['warrior-arms-pvp', 'warrior-fury-pvp'],
    relatedPages: [['/wow-forever-arms-warrior-pvp-build', 'Arms PvP'], ['/wow-forever-fury-warrior-pvp-build', 'Fury PvP'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Choose a PvP playstyle', paragraphs: ['Arms emphasizes weapon pressure and stance decisions. Fury uses critical strikes, Rage flow and Piercing Howl. Protection has verified talent data but no recommended PvP allocation yet.', EVIDENCE_NOTE] }],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-arms-warrior-pvp-build', intent: 'Arms PvP',
    title: 'WoW Forever Arms Warrior PvP Build', h1: 'WoW Forever Arms Warrior PvP Build',
    description: 'Load an editable Level 20 Arms Warrior PvP snapshot for Rend pressure, stance changes, and Rage retention.', eyebrow: 'Level 20 Arms PvP', spec: 'arms', primaryBuildId: 'warrior-arms-pvp',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Level 20 Arms PvP starter', paragraphs: ['The route spends all eleven points on a legal Arms path in the 69913 tree. Rend maintains pressure while Improved Tactical Mastery supports the stance change needed to answer a target.', 'This starter allocation cannot represent the full Level 30 Warrior PvP toolkit, so use it as an editable test rather than a final competitive ranking.'] }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-fury-warrior-pvp-build', intent: 'Fury PvP',
    title: 'WoW Forever Fury Warrior PvP Build', h1: 'WoW Forever Fury Warrior PvP Build',
    description: 'Load an editable Level 20 Fury Warrior PvP route for melee pressure, Rage generation, and Piercing Howl control.', eyebrow: 'Level 20 Fury PvP', spec: 'fury', primaryBuildId: 'warrior-fury-pvp',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-fury-warrior-build', 'Fury Build'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Level 20 Fury PvP starter', paragraphs: ['Cruelty and Unbridled Wrath make repeated fights measurable, while Piercing Howl gives this 11-point snapshot a control tool.', 'The allocation is editorial. Its talent structure comes from the imported 69913 client tree, while October 1 Fury changes and matchups need fresh client review and player testing.'] }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-protection-warrior-pvp-build', intent: 'Protection PvP',
    title: 'WoW Forever Protection Warrior PvP Build', h1: 'WoW Forever Protection Warrior PvP Build',
    description: 'Review 69913 Protection Warrior PvP talent options while a recommended allocation for the Level 30 Beta remains under review.', eyebrow: 'Protection PvP Data Status', spec: 'protection',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Build pending verification', paragraphs: ['A Protection PvP allocation is pending verification. The page publishes the imported 69913 talent dataset and its defensive options without presenting the dungeon tank route as a proven PvP build.', 'Use the calculator to test Shield Specialization, Rage tools and control talents, then report what works in actual matches.'] }],
    publishRequirements: ['talentDataset'],
  }),
  page({
    kind: 'dungeon', slug: 'wow-forever-warrior-dungeon-build', intent: 'Warrior Dungeon Hub',
    title: 'WoW Forever Warrior Dungeon Builds', h1: 'WoW Forever Warrior Dungeon Builds',
    // Retired: the role choice now lives on the Protection dungeon page. A dungeon page
    // without its own primary route is withheld by the shared publication gate.
    description: 'Compare Warrior dungeon roles and open the 11-point Protection tank starter in the talent calculator.', eyebrow: 'Dungeon Role Starters',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build'],
    relatedPages: [['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-build', 'Protection Build'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling']],
    sections: [{ heading: 'Warrior dungeon roles', paragraphs: ['Protection supplies the dedicated tank route. Arms and Fury remain damage-oriented alternatives when another player tanks the group.', 'This hub separates the role choice from the client facts and links the shield route directly into the calculator.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'specDungeon', slug: 'wow-forever-protection-warrior-dungeon-build', intent: 'Protection Dungeon Tank',
    title: 'WoW Forever Protection Warrior Dungeon Build', h1: 'WoW Forever Protection Warrior Dungeon Build',
    description: 'Use an editable Level 20 Protection Warrior dungeon tank route with shield, Rage, multi-target control, and Last Stand planning.', eyebrow: 'Level 20 Dungeon Tank', spec: 'protection', primaryBuildId: 'warrior-protection-dungeon',
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms damage starter'], ['/wow-forever-fury-warrior-build', 'Fury damage starter'], ['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Threat, Rage and pulling', paragraphs: ['Enter a pull with a plan for Bloodrage and Thunder Clap instead of spending Rage reactively. Keep a shield equipped so Shield Specialization is part of the test.', 'Talent allocation alone does not prove threat output. Compare similar packs and record when Rage or survivability becomes the limiting factor.'] }, { heading: 'Choose the party job before the route', paragraphs: ['Choose Protection when assigned to tank: this page loads the 0/0/11 shield starter for pull control and survival. If another player tanks, Arms and Fury are available as separate 11-point damage starters; their general build pages let you inspect the exact ranks before editing a route.', 'The Arms and Fury starters are not reviewed dungeon damage rankings. Keep the same group, target packs and weapon conditions when comparing them, and record Rage flow, control and recovery instead of assuming either route performs better.'] }, { heading: 'Survivability at Level 20', paragraphs: ['Last Stand is the route endpoint and emergency button. It does not replace pacing, positioning or healer awareness.', EVIDENCE_NOTE] }],
    comparison: { columns: ['Tank assignment', 'Damage assignment'], rows: [
      { label: 'Published starting point', values: ['Protection 0/0/11 dungeon tank route', 'Arms 11/0/0 or Fury 0/11/0 general starter'] },
      { label: 'Question to test', values: ['Does shield, Rage and Thunder Clap planning keep the pull controlled?', 'Can the chosen starter sustain useful attacks without disrupting the tank?'] },
      { label: 'Evidence limit', values: ['Editorial Level 20 route, not a verified Level 30 tank recommendation', 'General Level 20 routes, not measured dungeon damage rankings'] },
    ] },
    updatedAt: '2026-10-08',
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'levelCap', slug: 'wow-forever-warrior-level-20-build', intent: 'Level 20 Starter Snapshots',
    title: 'WoW Forever Warrior Level 20 Builds', h1: 'WoW Forever Warrior Level 20 Builds',
    description: 'Compare three complete 11-point Level 20 Warrior starter snapshots while the official WoW Forever Beta cap is Level 30.', eyebrow: 'Level 20 Starter Snapshots',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build', 'warrior-protection-build'],
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms 11/0/0'], ['/wow-forever-fury-warrior-build', 'Fury 0/11/0'], ['/wow-forever-protection-warrior-build', 'Protection 0/0/11'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Level 20 and 11 talent points', paragraphs: [CAP_NOTE, 'The three historical starter routes spend the same budget in one branch each. That makes their opening tradeoffs visible without treating them as complete Level 30 builds.'] }],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury', 'legalBuild:protection'],
  }),
  page({
    kind: 'comparison', slug: 'wow-forever-arms-vs-fury-warrior-leveling', intent: 'Arms vs Fury Leveling',
    title: 'Arms vs Fury Warrior for Leveling in WoW Forever', h1: 'Arms vs Fury Warrior for Leveling in WoW Forever',
    description: 'Choose an Arms or Fury Warrior Level 20 starter route by Rage management, control, and weapon testing while the Level 30 Beta tree awaits review.', eyebrow: 'Leveling Comparison', updatedAt: '2026-10-02',
    relatedBuildIds: ['warrior-arms-leveling', 'warrior-fury-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling Build'], ['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling Build'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling Hub']],
    sections: [
      { heading: 'Which Level 20 starter should you load?', paragraphs: [
        'Choose Arms if you want a direct weapon-focused route and regularly switch stances: the published 11/0/0 snapshot spends three points in Improved Rend, two in Deflection, five in Improved Tactical Mastery and one in Anger Management. Rage retained through stance changes is the behavior to test.',
        'Choose Fury if you prefer to watch critical strikes and Rage flow across repeated pulls or value Piercing Howl when you need space. Its 0/11/0 snapshot spends five points in Cruelty, five in Unbridled Wrath and one in Piercing Howl. This is a reason to test Fury, not evidence that it levels faster or requires dual wielding.',
      ] },
      { heading: 'What changed on October 1?', paragraphs: [
        "Blizzard's October 1 development notes announce a Level 30 cap and Warrior changes. For Arms, Spearing Strike no longer requires a two-handed weapon but does require Battle Stance. For Fury, the notes announce Lingering Rage in row 2, Furious Precision in row 3, removal of the two-handed Rage bonus from Unbridled Wrath, and a changed path to Flurry through Death Wish.",
        'These are official announcements, not imported into the 69913 tree or client-verified in this calculator. The two linked 11-point routes use the older imported snapshot; no reviewed Level 30 allocation is published. Do not extend either route to 21 points as if the announced Fury layout were already verified.',
      ] },
      { heading: 'How to make a useful comparison', paragraphs: [
        'Run the two starter routes at the same level against comparable targets. Record weapon damage and speed, downtime between pulls, Rage left after stance changes, and whether Piercing Howl changes an unsafe pull. Swap one condition at a time; the result is more useful than a universal winner claim.',
      ] },
    ],
    comparison: { columns: ['Arms', 'Fury'], rows: [
      { label: 'Published Level 20 route', values: ['11/0/0 from imported 69913', '0/11/0 from imported 69913'] },
      { label: 'First 10 points', values: ['Improved Rend 3, Deflection 2, Improved Tactical Mastery 5', 'Cruelty 5, Unbridled Wrath 5'] },
      { label: 'Eleventh point', values: ['Anger Management', 'Piercing Howl'] },
      { label: 'Rage question', values: ['Does retaining Rage through stance changes help your pulls?', 'Does Unbridled Wrath improve Rage flow with your tested weapon?'] },
      { label: 'Control and safety', values: ['Plan stance changes before a pull becomes unsafe', 'Use Piercing Howl to create space when needed'] },
      { label: 'Best reason to choose', values: ['You value a direct weapon route and stance decisions', 'You want critical-strike and Rage-flow testing with a slow'] },
      { label: 'October 1 status', values: ['Spearing Strike rule announced; not imported into 69913', 'Lingering Rage and Furious Precision announced; not imported into 69913'] },
    ] },
    faqs: [
      { question: 'Is Arms or Fury faster to level?', answer: 'No universal speed ranking is verified. The published routes are 11-point Level 20 snapshots; weapon quality, target choice and downtime can change the result. Test comparable pulls before choosing.' },
      { question: 'Does Fury require dual wielding for this route?', answer: 'No. The 0/11/0 allocation does not establish a best weapon setup. Blizzard also announced the removal of Unbridled Wrath’s extra two-handed Rage bonus on October 1, but that change has not been reconciled with the imported 69913 client tree.' },
      { question: 'Can I use this as a Level 30 build?', answer: 'The official Beta cap is Level 30, but no reviewed Level 30 allocation is published here. Load either 11-point starter snapshot, then treat further point choices as experiments until the newer Warrior tree is reviewed.' },
    ],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury'],
  }),
  page({
    kind: 'specTalents', slug: 'wow-forever-arms-warrior-talents', intent: 'Arms Talent Tree',
    title: 'WoW Forever Arms Warrior Talents', h1: 'WoW Forever Arms Warrior Talents',
    description: 'Browse the imported 69913 Arms Warrior talent tree with client-derived ranks, positions, change status, and links to starter builds.', eyebrow: 'Arms Talent Catalogue', spec: 'arms',
    relatedBuildIds: ['warrior-arms-build', 'warrior-arms-leveling', 'warrior-arms-pvp'],
    relatedPages: [['/wow-forever-warrior-talents', 'All Warrior Talents'], ['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling']],
    sections: [{ heading: 'Read the Arms tree', paragraphs: ['This catalogue filters the Warrior dataset to Arms and groups its nodes by Beta change status. Build links show where the branch is used without turning an editorial allocation into a client fact.', EVIDENCE_NOTE] }],
  }),
  page({
    kind: 'specTalents', slug: 'wow-forever-protection-warrior-talents', intent: 'Protection Talent Tree',
    title: 'WoW Forever Protection Warrior Talents', h1: 'WoW Forever Protection Warrior Talents',
    description: 'Browse the imported 69913 Protection Warrior talent tree with client-derived ranks, positions, change status, and tank-build links.', eyebrow: 'Protection Talent Catalogue', spec: 'protection',
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
  storageKey: 'wow-forever-warrior-build',
  analyticsClass: 'warrior',
  dataVersion: WARRIOR_DATA_VERSION,
  verifiedBuild: WARRIOR_VERIFIED_BUILD,
  talentCount: warriorTalents.length,
  // The publication gate uses this budget to validate preserved Level 20 builds; the playable Beta cap is Level 30.
  beta: { phaseLabel: 'Beta · 1.60.1.69913 Level 20 snapshot', levelCap: 20, pointsAtCap: 11 },
  plannerModes: [
    { level: 20, points: 11, label: 'Level 20' },
    { level: 30, points: 21, label: 'Level 30' },
    { level: 60, points: 51, label: 'Level 60' },
  ],
  talents: warriorTalents,
  plannerConfig: WARRIOR_PLANNER_CONFIG,
  builds: warriorBuilds,
  pages: warriorPages,
  recommendedBuildIds: ['warrior-arms-leveling', 'warrior-fury-build', 'warrior-protection-build'],
  sources: WARRIOR_SOURCES,
}
