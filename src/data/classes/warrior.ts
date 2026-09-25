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
const PHASE = 'Current Beta'
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
const CAP_NOTE = 'The current Level 20 Beta cap gives a Warrior 11 talent points. Every published allocation spends that same budget so the routes remain directly comparable.'
const EVIDENCE_NOTE = 'Talent names, ranks, positions and tooltips come from dual-source client records reviewed through build 1.60.1.69913. Build allocations and playstyle notes are editorial testing routes, not official best builds.'

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
  sources: [{ label: 'BuildForgeTools current-cap Warrior testing route', url: `https://buildforgetools.com${href}` }],
  verifiedThroughBuild: WARRIOR_VERIFIED_BUILD,
  createdAt: UPDATED,
  updatedAt: UPDATED,
  href,
})

const warriorBuilds: ClassBuild[] = [
  makeBuild(armsPreset, 'warrior-arms-build', 'spec', '/wow-forever-arms-warrior-build', 'Arms Warrior Build (Level 20)', 'Weapon damage and stance control', ['Apply Rend before settling into the pull.', 'Preserve Rage while changing stance.', 'Use Anger Management as the current-cap endpoint.'], ['Direct solo route', 'Stance-change testing', 'Two-handed weapon focus']),
  makeBuild(furyPreset, 'warrior-fury-build', 'spec', '/wow-forever-fury-warrior-build', 'Fury Warrior Build (Level 20)', 'Critical strikes and Rage flow', ['Build Cruelty before deeper Fury talents.', 'Measure Unbridled Wrath with the same weapon speed.', 'Use Piercing Howl to create space.'], ['Simple melee loop', 'Rage-generation test', 'Current-cap control']),
  makeBuild(protectionPreset, 'warrior-protection-build', 'spec', '/wow-forever-protection-warrior-build', 'Protection Warrior Build (Level 20)', 'Shield tank and defensive group play', ['Keep a shield equipped for the full test.', 'Use Bloodrage before the pull needs extra Rage.', 'Hold Last Stand for a real defensive check.'], ['Shield-first route', 'Dungeon-ready utility', 'Defensive cooldown']),
  makeBuild(armsPreset, 'warrior-arms-leveling', 'leveling', '/wow-forever-arms-warrior-leveling-build', 'Arms Warrior Leveling Build (Level 20)', 'Solo leveling with weapon damage', ['Open with Rend.', 'Keep enough Rage for the next stance decision.', 'Compare pulls with the same weapon.'], ['Sustained solo damage', 'Straightforward point order', 'Low setup cost']),
  makeBuild(furyPreset, 'warrior-fury-leveling', 'leveling', '/wow-forever-fury-warrior-leveling-build', 'Fury Warrior Leveling Build (Level 20)', 'Fast melee leveling and Rage testing', ['Max Cruelty first.', 'Track extra Rage from Unbridled Wrath.', 'Use Piercing Howl when a pull becomes unsafe.'], ['Fast melee rhythm', 'Extra Rage opportunities', 'Escape utility']),
  makeBuild(protectionPreset, 'warrior-protection-leveling', 'leveling', '/wow-forever-protection-warrior-leveling-build', 'Protection Warrior Leveling Build (Level 20)', 'Defensive leveling and dungeon groups', ['Level with a shield when survivability matters.', 'Use Thunder Clap on controlled multi-target pulls.', 'Move to the dungeon route when group tanking becomes the goal.'], ['Safer pulls', 'Group-ready talents', 'Clear defensive identity']),
  makeBuild(armsPreset, 'warrior-arms-pvp', 'pvp', '/wow-forever-arms-warrior-pvp-build', 'Arms Warrior PvP Build (Level 20)', 'Weapon pressure and stance control in PvP', ['Keep Rend active when pressure is possible.', 'Preserve Rage through the stance change that answers the opponent.', 'Treat the route as a current-cap test, not a final PvP ranking.'], ['Sustained pressure', 'Rage retention', 'Simple 11-point route']),
  makeBuild(furyPreset, 'warrior-fury-pvp', 'pvp', '/wow-forever-fury-warrior-pvp-build', 'Fury Warrior PvP Build (Level 20)', 'Melee pressure with Piercing Howl utility', ['Use Piercing Howl to stay connected or disengage.', 'Test Cruelty and Rage generation across repeated fights.', 'Avoid claiming full-level Fury conclusions from the Level 20 cap.'], ['Movement control', 'Critical-strike pressure', 'Rage-flow testing']),
  makeBuild(protectionPreset, 'warrior-protection-dungeon', 'dungeon', '/wow-forever-protection-warrior-dungeon-build', 'Protection Warrior Dungeon Build (Level 20)', 'Current-cap dungeon tank', ['Enter each pull with a shield and a Rage plan.', 'Use Thunder Clap where the pack makes it worthwhile.', 'Reserve Last Stand for the pull that would otherwise end the run.'], ['Shield specialization', 'Multi-target control', 'Emergency cooldown']),
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
}): ClassPageDefinition => ({
  ...input,
  ogImage: input.spec ? WARRIOR_SPEC_HERO[input.spec] : WARRIOR_HERO,
  canonical: `https://buildforgetools.com/${input.slug}`,
  robots: 'index, follow',
  updatedAt: UPDATED,
  relatedBuildIds: input.relatedBuildIds ?? [],
  relatedPages: related(...input.relatedPages),
  faqs: input.faqs ?? [],
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
    description: 'Explore Level 20 WoW Forever Warrior builds for Arms, Fury, and Protection, then customize every talent in the BuildForgeTools calculator.', eyebrow: 'Current Beta Builds',
    relatedBuildIds: warriorBuilds.map((build) => build.id),
    relatedPages: [['/warrior', 'Warrior Talent Calculator'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling Build'], ['/wow-forever-warrior-pvp-build', 'Warrior PvP Builds'], ['/wow-forever-warrior-dungeon-build', 'Warrior Dungeon Builds']],
    sections: [{ heading: 'Choose a Warrior route', paragraphs: ['Arms, Fury and Protection solve different current-cap problems. Use the role and intent labels to choose a starting route, then edit its exact allocation in the calculator.', EVIDENCE_NOTE] }],
    publishRequirements: ['level20Builds'],
  }),
  page({
    kind: 'leveling', slug: 'wow-forever-warrior-leveling-build', intent: 'General Leveling',
    title: 'WoW Forever Warrior Leveling Build | Level 20 Beta', h1: 'WoW Forever Warrior Leveling Build',
    description: 'Compare three current-cap Warrior routes, then load a complete 11-point path in the talent calculator.', eyebrow: 'Level 20 Beta Starter', primaryBuildId: 'warrior-arms-leveling',
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
    sections: [{ heading: 'Why this Arms route', paragraphs: ['Improved Rend opens the damage package while Deflection completes the first tier. Improved Tactical Mastery preserves more Rage through stance changes before Anger Management closes the current-cap route.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Spend three points in Improved Rend, two in Deflection, five in Improved Tactical Mastery and take Anger Management with the final point.'] }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specBuild', slug: 'wow-forever-fury-warrior-build', intent: 'Fury Build',
    title: 'WoW Forever Fury Warrior Build | Level 20 Beta', h1: 'WoW Forever Fury Warrior Build',
    description: 'A Level 20 Fury path for testing critical strikes, Rage generation, and Piercing Howl utility.', eyebrow: '0/11/0 Community Route', spec: 'fury', primaryBuildId: 'warrior-fury-build',
    relatedBuildIds: ['warrior-fury-leveling', 'warrior-fury-pvp'],
    relatedPages: [['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling'], ['/wow-forever-fury-warrior-pvp-build', 'Fury PvP'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Why this Fury route', paragraphs: ['Cruelty raises critical-strike chance, Unbridled Wrath creates a repeatable Rage-generation test and Piercing Howl adds current-cap control after ten Fury points.', EVIDENCE_NOTE] }, { heading: 'Talent order', paragraphs: ['Complete Cruelty, spend five points in Unbridled Wrath, then take Piercing Howl with the eleventh point.'] }],
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
    description: 'Browse all 53 current WoW Forever Warrior talents across Arms, Fury, and Protection with Beta change status, rank, position, and source labels.', eyebrow: 'Client Talent Catalogue',
    relatedPages: [['/warrior', 'Warrior Talent Calculator'], ['/wow-forever-arms-warrior-talents', 'Arms Talents'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/wow-forever-warrior-builds', 'Warrior Builds']],
    sections: [{ heading: 'Read the current Warrior trees', paragraphs: ['The catalogue groups every published node by branch and by its change status in the imported Beta dataset. It keeps client facts separate from editorial allocations.', EVIDENCE_NOTE] }],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-arms-warrior-leveling-build', intent: 'Arms Leveling',
    title: 'WoW Forever Arms Warrior Leveling Build', h1: 'WoW Forever Arms Warrior Leveling Build',
    description: 'Follow an editable Level 20 Arms Warrior leveling route built around Rend, Rage retention, and a direct two-handed playstyle.', eyebrow: 'Level 20 Arms Leveling', spec: 'arms', primaryBuildId: 'warrior-arms-leveling', relatedBuildIds: ['warrior-fury-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Level 10 to 20 talent path', paragraphs: ['Build Improved Rend first, add Deflection, then commit the next five points to Improved Tactical Mastery before taking Anger Management.', CAP_NOTE] }, { heading: 'Weapons, Rage and solo play', paragraphs: ['Use the same weapon while comparing pulls so weapon speed does not hide the talent result. The route values predictable Rage handling over an unverified damage ranking.'] }],
    faqs: [{ question: 'Is Arms good for leveling in the current Beta?', answer: 'It offers a legal, direct 11-point route with Rend and Rage retention. Its performance still depends on weapon and encounter conditions.' }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specLeveling', slug: 'wow-forever-fury-warrior-leveling-build', intent: 'Fury Leveling',
    title: 'WoW Forever Fury Warrior Leveling Build', h1: 'WoW Forever Fury Warrior Leveling Build',
    description: 'Test a Level 20 Fury Warrior leveling route focused on critical strikes, Rage generation, and Piercing Howl utility.', eyebrow: 'Level 20 Fury Leveling', spec: 'fury', primaryBuildId: 'warrior-fury-leveling', relatedBuildIds: ['warrior-arms-leveling'],
    relatedPages: [['/wow-forever-fury-warrior-build', 'Fury Build'], ['/wow-forever-arms-vs-fury-warrior-leveling', 'Arms vs Fury'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Level 10 to 20 talent path', paragraphs: ['Max Cruelty, invest five points in Unbridled Wrath and take Piercing Howl with the final point.', CAP_NOTE] }, { heading: 'Rage and early Fury', paragraphs: ['Track Rage generation over several equivalent fights. A short Beta sample cannot establish a universal Fury ranking, but it can show whether the route fits your weapon and pace.'] }],
    faqs: [{ question: 'Is Fury good for leveling?', answer: 'Fury offers a legal early route with critical-strike and Rage tools. Compare it directly with Arms using equivalent weapons and targets.' }, { question: 'Can this page prove a dual-wield build is best?', answer: 'No. This page publishes a current-cap talent route and does not turn weapon assumptions into client facts.' }],
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
    description: 'Compare current-cap Arms and Fury Warrior PvP testing routes and review the verified Protection talent options still awaiting a recommended allocation.', eyebrow: 'Current Beta PvP',
    relatedBuildIds: ['warrior-arms-pvp', 'warrior-fury-pvp'],
    relatedPages: [['/wow-forever-arms-warrior-pvp-build', 'Arms PvP'], ['/wow-forever-fury-warrior-pvp-build', 'Fury PvP'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Choose a PvP playstyle', paragraphs: ['Arms emphasizes weapon pressure and stance decisions. Fury uses critical strikes, Rage flow and Piercing Howl. Protection has verified talent data but no recommended PvP allocation yet.', EVIDENCE_NOTE] }],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-arms-warrior-pvp-build', intent: 'Arms PvP',
    title: 'WoW Forever Arms Warrior PvP Build', h1: 'WoW Forever Arms Warrior PvP Build',
    description: 'Load an editable Level 20 Arms Warrior PvP route for Rend pressure, stance changes, and Rage retention in the current Beta.', eyebrow: 'Level 20 Arms PvP', spec: 'arms', primaryBuildId: 'warrior-arms-pvp',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-warrior-talents', 'Arms Talents']],
    sections: [{ heading: 'Current-cap Arms PvP plan', paragraphs: ['The route spends all eleven points on a legal Arms path. Rend maintains pressure while Tactical Mastery supports the stance change needed to answer a target.', 'Level 20 cannot represent the full Warrior PvP toolkit, so use this allocation as an editable test rather than a final competitive ranking.'] }],
    publishRequirements: ['legalBuild:arms'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-fury-warrior-pvp-build', intent: 'Fury PvP',
    title: 'WoW Forever Fury Warrior PvP Build', h1: 'WoW Forever Fury Warrior PvP Build',
    description: 'Load an editable Level 20 Fury Warrior PvP route for melee pressure, Rage generation, and Piercing Howl control.', eyebrow: 'Level 20 Fury PvP', spec: 'fury', primaryBuildId: 'warrior-fury-pvp',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-fury-warrior-build', 'Fury Build'], ['/wow-forever-warrior-talents', 'Warrior Talents']],
    sections: [{ heading: 'Current-cap Fury PvP plan', paragraphs: ['Cruelty and Unbridled Wrath make repeated fights measurable, while Piercing Howl gives the route a control tool at the current cap.', 'The allocation is editorial. Talent structure is client-derived, but matchups and effectiveness require player testing.'] }],
    publishRequirements: ['legalBuild:fury'],
  }),
  page({
    kind: 'specPvp', slug: 'wow-forever-protection-warrior-pvp-build', intent: 'Protection PvP',
    title: 'WoW Forever Protection Warrior PvP Build', h1: 'WoW Forever Protection Warrior PvP Build',
    description: 'Review verified Protection Warrior PvP talent options for the current Beta while the recommended Level 20 allocation remains under review.', eyebrow: 'Protection PvP Data Status', spec: 'protection',
    relatedPages: [['/wow-forever-warrior-pvp-build', 'Warrior PvP Hub'], ['/wow-forever-protection-warrior-talents', 'Protection Talents'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Build pending verification', paragraphs: ['A Protection PvP allocation is pending verification. The page publishes the current talent dataset and its defensive options without presenting the dungeon tank route as a proven PvP build.', 'Use the calculator to test Shield Specialization, Rage tools and control talents, then report what works in actual matches.'] }],
    publishRequirements: ['talentDataset'],
  }),
  page({
    kind: 'dungeon', slug: 'wow-forever-warrior-dungeon-build', intent: 'Warrior Dungeon Hub',
    title: 'WoW Forever Warrior Dungeon Builds', h1: 'WoW Forever Warrior Dungeon Builds',
    description: 'Compare Warrior roles for current Beta dungeons and open the dedicated Protection tank route in the talent calculator.', eyebrow: 'Current Beta Dungeons', primaryBuildId: 'warrior-protection-dungeon',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build'],
    relatedPages: [['/wow-forever-protection-warrior-dungeon-build', 'Protection Dungeon Tank'], ['/wow-forever-protection-warrior-build', 'Protection Build'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling']],
    sections: [{ heading: 'Warrior dungeon roles', paragraphs: ['Protection supplies the dedicated tank route. Arms and Fury remain damage-oriented alternatives when another player tanks the group.', 'This hub separates the role choice from the client facts and links the shield route directly into the calculator.'] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'specDungeon', slug: 'wow-forever-protection-warrior-dungeon-build', intent: 'Protection Dungeon Tank',
    title: 'WoW Forever Protection Warrior Dungeon Build', h1: 'WoW Forever Protection Warrior Dungeon Build',
    description: 'Use an editable Level 20 Protection Warrior dungeon tank route with shield, Rage, multi-target control, and Last Stand planning.', eyebrow: 'Level 20 Dungeon Tank', spec: 'protection', primaryBuildId: 'warrior-protection-dungeon',
    relatedPages: [['/wow-forever-warrior-dungeon-build', 'Warrior Dungeon Builds'], ['/wow-forever-protection-warrior-leveling-build', 'Protection Leveling'], ['/wow-forever-protection-warrior-talents', 'Protection Talents']],
    sections: [{ heading: 'Threat, Rage and pulling', paragraphs: ['Enter a pull with a plan for Bloodrage and Thunder Clap instead of spending Rage reactively. Keep a shield equipped so Shield Specialization is part of the test.', 'Talent allocation alone does not prove threat output. Compare similar packs and record when Rage or survivability becomes the limiting factor.'] }, { heading: 'Survivability at Level 20', paragraphs: ['Last Stand is the route endpoint and emergency button. It does not replace pacing, positioning or healer awareness.', EVIDENCE_NOTE] }],
    publishRequirements: ['legalBuild:protection'],
  }),
  page({
    kind: 'levelCap', slug: 'wow-forever-warrior-level-20-build', intent: 'Current Beta Level 20',
    title: 'WoW Forever Warrior Level 20 Builds', h1: 'WoW Forever Warrior Level 20 Builds',
    description: 'Compare complete 11-point Arms, Fury, and Protection Warrior builds for the current WoW Forever Level 20 Beta cap.', eyebrow: 'Current Beta Cap',
    relatedBuildIds: ['warrior-arms-build', 'warrior-fury-build', 'warrior-protection-build'],
    relatedPages: [['/wow-forever-arms-warrior-build', 'Arms 11/0/0'], ['/wow-forever-fury-warrior-build', 'Fury 0/11/0'], ['/wow-forever-protection-warrior-build', 'Protection 0/0/11'], ['/warrior', 'Warrior Calculator']],
    sections: [{ heading: 'Level 20 and 11 talent points', paragraphs: [CAP_NOTE, 'The three starter routes spend the same budget in one branch each. That makes the tradeoffs visible without pretending the Beta cap represents a full Level 60 build.'] }],
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury', 'legalBuild:protection'],
  }),
  page({
    kind: 'comparison', slug: 'wow-forever-arms-vs-fury-warrior-leveling', intent: 'Arms vs Fury Leveling',
    title: 'Arms vs Fury Warrior for Leveling in WoW Forever', h1: 'Arms vs Fury Warrior for Leveling in WoW Forever',
    description: 'Compare Arms and Fury Warrior leveling playstyles, Rage mechanics, control, and current-cap talent routes without declaring a universal winner.', eyebrow: 'Leveling Comparison',
    relatedBuildIds: ['warrior-arms-leveling', 'warrior-fury-leveling'],
    relatedPages: [['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling Build'], ['/wow-forever-fury-warrior-leveling-build', 'Fury Leveling Build'], ['/wow-forever-warrior-leveling-build', 'Warrior Leveling Hub']],
    sections: [{ heading: 'Choose by playstyle', paragraphs: ['Arms favors a direct weapon route and stance-aware Rage retention. Fury favors critical-strike and Rage-generation testing with Piercing Howl as its current-cap control tool.', 'Weapon quality and play conditions can outweigh small talent differences, so the comparison presents tradeoffs rather than a winner.'] }],
    comparison: { columns: ['Arms', 'Fury'], rows: [
      { label: 'Current route', values: ['11/0/0', '0/11/0'] },
      { label: 'Core loop', values: ['Rend and stance management', 'Critical strikes and Rage flow'] },
      { label: 'Control', values: ['Stance tools and weapon pressure', 'Piercing Howl'] },
      { label: 'Best test', values: ['Consistent weapon pulls', 'Repeated Rage samples'] },
    ] },
    publishRequirements: ['legalBuild:arms', 'legalBuild:fury'],
  }),
  page({
    kind: 'specTalents', slug: 'wow-forever-arms-warrior-talents', intent: 'Arms Talent Tree',
    title: 'WoW Forever Arms Warrior Talents', h1: 'WoW Forever Arms Warrior Talents',
    description: 'Browse the current WoW Forever Arms Warrior talent tree with client-derived ranks, positions, change status, and links to builds using the branch.', eyebrow: 'Arms Talent Catalogue', spec: 'arms',
    relatedBuildIds: ['warrior-arms-build', 'warrior-arms-leveling', 'warrior-arms-pvp'],
    relatedPages: [['/wow-forever-warrior-talents', 'All Warrior Talents'], ['/wow-forever-arms-warrior-build', 'Arms Build'], ['/wow-forever-arms-warrior-leveling-build', 'Arms Leveling']],
    sections: [{ heading: 'Read the Arms tree', paragraphs: ['This catalogue filters the Warrior dataset to Arms and groups its nodes by Beta change status. Build links show where the branch is used without turning an editorial allocation into a client fact.', EVIDENCE_NOTE] }],
  }),
  page({
    kind: 'specTalents', slug: 'wow-forever-protection-warrior-talents', intent: 'Protection Talent Tree',
    title: 'WoW Forever Protection Warrior Talents', h1: 'WoW Forever Protection Warrior Talents',
    description: 'Browse the current WoW Forever Protection Warrior talent tree with client-derived ranks, positions, change status, and tank-build links.', eyebrow: 'Protection Talent Catalogue', spec: 'protection',
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
  beta: { phaseLabel: 'Beta · Build 1.60.1.69913', levelCap: 20, pointsAtCap: 11 },
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
