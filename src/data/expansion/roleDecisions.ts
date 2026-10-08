import { isValidPlannerBuild } from '../../lib/talentPlanner'
import type { ClassBuild, ClassPageDefinition, ClassTalent } from '../../lib/classPage'
import type { ExpansionProfile, SpecProfile } from './profiles'

export interface RoleDecision {
  question: string
  options: { id: string; label: string; explanation: string; talentIds: string[]; alternativeBuildId?: string }[]
  sources: { label: string; url: string }[]
}

interface Condition {
  id: string
  label: string
  explanation: string
  sourceTalentIds: number[]
  alternativeSpec?: string
}
interface DecisionPlan { question: string; options: Condition[] }

const OFFICIAL_NOTES = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1'
const HUNTER_DEEP_DIVE = 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid'
const ROLE_KINDS = new Set(['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'])

const PVP: Record<string, DecisionPlan> = {
  rogue: {
    question: 'How does this Rogue encounter begin?',
    options: [
      { id: 'stealth-opener', label: 'Stealth opener available', sourceTalentIds: [261, 244], explanation: 'Opportunity and Camouflage are the selected opener-and-positioning records. Use this focus when you can choose the opening position, and record preparation time separately from the attack. An isolated opener does not establish how the route performs when another player joins.' },
      { id: 'open-combat', label: 'Prolonged open combat', sourceTalentIds: [303], alternativeSpec: 'combat', explanation: 'Ghostly Strike is the selected endpoint, but the other ten points still form a stealth-oriented route. When repeated open combat prevents another controlled opener, compare the Combat starter at the same budget. No measured PvP win rate or universal escape sequence is established here.' },
    ],
  },
  priest: {
    question: 'Which support job does this Priest encounter need?',
    options: [
      { id: 'shield-support', label: 'Shield and wand support', sourceTalentIds: [343, 344], explanation: 'Improved Power Word: Shield and Improved Power Word: Fortitude are the selected support records. Keep the wand unchanged and record successful support casts and recovery; a spell-only test does not evaluate the entry investment in Wand Specialization.' },
      { id: 'healing-casts', label: 'Repeated healing casts', sourceTalentIds: [345, 348], alternativeSpec: 'holy', explanation: 'Wand Specialization and Inner Focus show where this Discipline route differs from the Holy healing starter. Compare Holy when repeated healing is the job, keeping completed casts and mana recovery visible. Blizzard later changed Inner Focus, so the older tooltip is not proof of current periodic-effect behavior.' },
    ],
  },
  druid: {
    question: 'Which form and job will this Druid use?',
    options: [
      { id: 'bear', label: 'Bear engagement', sourceTalentIds: [804], explanation: 'Feral Charge (Bear) is the imported route endpoint. When an opponent closes in, record whether using Bear helps you create a controlled disengagement or reach a teammate. Form choice and terrain belong in that test; this eleven-point snapshot establishes neither a universal escape sequence nor a PvP win rate.' },
      { id: 'cat', label: 'Cat positioning', sourceTalentIds: [796, 799], explanation: 'Ferocity and Feral Instinct make up the earlier Feral investment. The Bear-labelled endpoint is not an unconditional Cat damage gain. Keep Cat positioning, opponent pressure and recovery consistent when testing the earlier points, and record time spent changing form to help a teammate rather than treating one duel as a ranking.' },
    ],
  },
  warlock: {
    question: 'What prevents useful Warlock pressure?',
    options: [
      { id: 'sustained-target', label: 'Targets survive sustained pressure', sourceTalentIds: [1003, 1061], explanation: 'Improved Corruption and Amplify Curse are the selected sustained-pressure records. Compare encounters where the target survives long enough to observe the spell cycle, recording lost control and recovery. A short duel does not establish a damage or win-rate ranking.' },
      { id: 'pet-control', label: 'Pet control limits the encounter', sourceTalentIds: [1007, 1004], alternativeSpec: 'demonology', explanation: 'Improved Life Tap and Soul Siphon occupy recovery-related points in the Affliction allocation; they do not create the Demonology pet package. If pet survival or repositioning limits the encounter, compare Demonology with the same demon and budget. Record safe health-to-mana windows without inventing pet scaling or a best-demon ranking.' },
    ],
  },
  hunter: {
    question: 'What happens to this Hunter’s intended distance?',
    options: [
      { id: 'melee-reached', label: 'Enemy reaches melee range', sourceTalentIds: [1311, 1621, 1308], explanation: 'Deflection, Savage Strikes and Deterrence are the selected close-range records. Record whether you recover distance after an opponent reaches you. Blizzard changed Deflection after the 69913 snapshot, so the historical rank text is not current Parry tuning or proof of a best PvP route.' },
      { id: 'trap-window', label: 'Trap window preserves distance', sourceTalentIds: [1304], explanation: 'Entrapment is the selected trap-related record. Inspect its source text while recording useful trap windows, distance and pet control. The talent snapshot does not verify every current trap spell interaction, a Level 30 allocation or a measured PvP outcome.' },
    ],
  },
  shaman: {
    question: 'Can this Shaman complete the intended casts?',
    options: [
      { id: 'safe-casts', label: 'Safe ranged casting', sourceTalentIds: [564, 561, 574], explanation: 'Convection, Call of Flame and Elemental Focus form the selected casting investment. Compare completed casts and recovery under similar range and line-of-sight conditions. The talent records do not supply a verified spell rotation or endgame damage ranking.' },
      { id: 'interrupted-casts', label: 'Repeated cast interruptions', sourceTalentIds: [1640], alternativeSpec: 'enhancement', explanation: 'Elemental Warding is part of this allocation, but a legal Elemental route does not guarantee that intended casts finish. If the session instead favors weapon play, compare Enhancement with the same weapon and budget; check its historical weapon-access endpoint in the live client before making an equipment claim.' },
    ],
  },
}

const GROUP: Record<string, DecisionPlan> = {
  rogue: {
    question: 'What limits this Rogue group pull?',
    options: [
      { id: 'melee-attacks', label: 'Repeated melee attacks', sourceTalentIds: [201, 181], explanation: 'Improved Sinister Strike and Precision are the selected repeated-melee records. Keep the weapon and agreed tank target consistent, and record misses across several packs. Compare Assassination separately when enemies survive long enough for complete finisher cycles.', alternativeSpec: 'assassination' },
      { id: 'defensive-pressure', label: 'Recovery or defensive pressure', sourceTalentIds: [186, 204], explanation: 'Lightning Reflexes and Endurance are selected in this Combat baseline; Deflection and Riposte are not. Inspect the chosen ranks and record incoming damage and downtime before adjusting the route. Extra enemies or a failed control plan are encounter problems that this talent allocation cannot diagnose on its own.' },
    ],
  },
  priest: {
    question: 'What limits this Priest healing pull?',
    options: [
      { id: 'cast-window', label: 'Healing casts miss their window', sourceTalentIds: [410, 1181], explanation: 'Twilight Focus and Divine Fury are selected in the historical Holy casting route. Inspect the rank text and record whether healing casts land when needed, keeping line of sight and uncontrolled enemies visible. Later official Holy changes are not yet reconciled into this 69913 snapshot.' },
      { id: 'mana-recovery', label: 'Mana recovery limits the next pull', sourceTalentIds: [406, 442], alternativeSpec: 'discipline', explanation: 'Improved Renew and Holy Nova remain part of this Holy allocation; the presence of Holy Nova does not establish that every group-damage situation calls for it. Compare the Discipline support starter when shielding and preparation fit the task, recording mana after equivalent pulls. Neither route supplies a verified healing rotation.' },
    ],
  },
  warlock: {
    question: 'What kind of target does this Warlock pull provide?',
    options: [
      { id: 'direct-casts', label: 'Completed direct casts', sourceTalentIds: [944, 943], explanation: 'Improved Shadow Bolt and Bane are the selected direct-casting records. Use the agreed tank target and record completed casts, interruptions and recovery while keeping demon behavior fixed. This comparison does not establish a dungeon damage ranking.' },
      { id: 'long-target', label: 'Long-lived or controlled targets', sourceTalentIds: [963], alternativeSpec: 'affliction', explanation: 'Shadowburn is the endpoint of this direct-cast starter; its presence does not turn the allocation into a sustained Affliction route. Compare Affliction only where the intended target lives long enough to test it. Keep damage-over-time effects off an agreed crowd-control target and record control failures separately from talent changes.' },
    ],
  },
  hunter: {
    question: 'What limits this Hunter group pull?',
    options: [
      { id: 'ranged-distance', label: 'Stable ranged distance', sourceTalentIds: [1342, 1344], explanation: 'Efficiency and Lethal Attacks are the selected ranged records in the 69913 example. Compare completed ranged attacks, movement interruptions and mana with the same weapon. This is a historical route: its Aimed Shot node later became baseline, so use a blank calculator and check the live tree before testing current points.' },
      { id: 'close-pulls', label: 'Close-range or uncontrolled pulls', sourceTalentIds: [1345], alternativeSpec: 'survival', explanation: 'The historical Aimed Shot endpoint is not a solution to pet pulls or collapsed ranged distance. Blizzard made Aimed Shot baseline at Level 20; start a blank calculator rather than spending this old point. Agree on pet control and the target first, then compare Survival only for the close-range condition you observed.' },
    ],
  },
  shaman: {
    question: 'What limits this Shaman healing pull?',
    options: [
      { id: 'repeated-healing', label: 'Repeated healing casts', sourceTalentIds: [586], explanation: 'Improved Healing Wave is the selected healing record. Inspect its rank text and record casts that land when needed and mana remaining after similar pulls. This starter does not define a complete raid healing setup or a verified rotation.' },
      { id: 'moving-support', label: 'Moving group needs support', sourceTalentIds: [595, 582], explanation: 'Totemic Focus and Totemic Mastery are the selected totem records. Record whether party movement leaves the chosen placement behind and how that changes recovery. A talent allocation alone cannot choose a totem loadout; the loadout and unrecorded spell interactions remain unverified.' },
    ],
  },
}

const EXTRAS: Record<string, Partial<Record<ClassPageDefinition['kind'], DecisionPlan>>> = {
  druid: {
    tank: {
      question: 'Which form and job will this Druid use?',
      options: [
        { id: 'bear', label: 'Bear engagement', sourceTalentIds: [804], explanation: 'Feral Charge (Bear) is the selected endpoint for this group-tank comparison. Agree on the pull and Bear role, then record pack control, incoming damage and healer recovery under similar conditions. A legal allocation alone cannot establish that the tank will hold every enemy or that a dungeon is safe.' },
        { id: 'cat', label: 'Cat positioning', sourceTalentIds: [796, 799], explanation: 'Ferocity and Feral Instinct are the earlier selected Feral records to inspect for Cat play. The Bear-labelled endpoint is not an unconditional Cat damage gain, and a Cat comparison does not answer the group’s Bear-tank requirement. Agree on the role before the run; use the separate Restoration route if the group expects healing.' },
      ],
    },
    healing: {
      question: 'What limits this Druid support session?',
      options: [
        { id: 'party-healing', label: 'Party healing is the job', sourceTalentIds: [821, 824], explanation: 'Improved Mark of the Wild and Naturalist are the early selected support records. Use them as a group-healing comparison and record missed healing opportunities and the cost of switching roles. They do not establish a best gear set or an endgame healing ranking.' },
        { id: 'recovery', label: 'Recovery limits repeated pulls', sourceTalentIds: [829], explanation: 'The route includes one Reflection rank, so inspect that exact rank while recording mana pressure between comparable pulls. If the session is mostly solo melee, compare Feral separately; Restoration recovery points and the Bear-specific Feral endpoint answer different role questions.', alternativeSpec: 'feral' },
      ],
    },
  },
  warlock: {
    pet: {
      question: 'Which demon is part of this Warlock test?',
      options: [
        { id: 'voidwalker', label: 'Voidwalker remains active', sourceTalentIds: [1225, 1242], explanation: 'Improved Voidwalker and Fel Vitality are selected in this demon-support allocation. Keep the Voidwalker active for a comparable test and record pet survival, lost control and recovery. No pet scaling coefficient or best-pet ranking is verified here.' },
        { id: 'another-demon', label: 'Another demon is needed', sourceTalentIds: [1223, 1226], explanation: 'Demonic Embrace and Fel Domination remain selected, but the three Improved Voidwalker points should not be treated as a universal benefit for another demon. Review the route when changing the pet role; compare Affliction if sustained player pressure is the new test instead of silently carrying over a Voidwalker package.', alternativeSpec: 'affliction' },
      ],
    },
  },
  hunter: {
    pet: {
      question: 'What limits this Hunter pet test?',
      options: [
        { id: 'pet-recovery', label: 'Pet survival and recovery', sourceTalentIds: [1389, 1395, 1625], explanation: 'Endurance Training, Thick Hide and Improved Revive Pet form the historical pet-support package. Blizzard later merged Thick Hide into Endurance Training, so read these old ranks and start a blank calculator for current talents. The snapshot does not verify a pet family ranking, separate pet tree or pet damage calculation.' },
        { id: 'pet-travel', label: 'Pet reaches targets late', sourceTalentIds: [1391], explanation: 'Bestial Swiftness is the historical endpoint to inspect while recording time for the same pet to reach useful combat. Keep pet family and weapon fixed, and include recovery. If the pet contributes little because the encounter instead favors direct shots, compare the historical Marksmanship route, then use a blank calculator to check current talents.', alternativeSpec: 'marksmanship' },
      ],
    },
  },
  shaman: {
    totem: {
      question: 'How does the party use this Shaman’s placement?',
      options: [
        { id: 'stable-placement', label: 'Group stays near placement', sourceTalentIds: [595, 582], explanation: 'Totemic Focus and Totemic Mastery are the selected totem records to inspect when the group stays near its chosen placement. Record group coverage and mana recovery. The four-totem loadout and unrecorded spell interactions remain unverified; selected talents do not automatically supply that setup.' },
        { id: 'moving-healing', label: 'Movement and healing dominate', sourceTalentIds: [586], explanation: 'Improved Healing Wave is also selected, so focus the comparison on successful healing casts when movement repeatedly ends a placement test. Record where the party moves between packs and how much mana remains. A stationary talent comparison does not prove that the next moving pull receives the same support.' },
      ],
    },
  },
}

/** Only offer a supplied alternative that reproduces its reviewed profile route legally. */
function alternativeBuild(profile: ExpansionProfile, specId: string, talents: ClassTalent<string>[], builds: ClassBuild[], primary: ClassBuild): ClassBuild | undefined {
  const spec = profile.specs.find((candidate) => candidate.id === specId)
  if (!spec || specId === primary.spec) return undefined
  const route = spec.route.map(([sourceId, rank]) => ({ talent: talents.find((candidate) => candidate.sourceTalentId === sourceId), rank }))
  if (route.some(({ talent, rank }) => !talent || !Number.isInteger(rank) || rank < 1 || rank > talent.maxRank)) return undefined
  const expectedPoints = route.reduce((sum, entry) => sum + entry.rank, 0)
  return builds.find((candidate) => {
    if (candidate.spec !== specId || candidate.level !== primary.level || candidate.points !== expectedPoints || candidate.levelCap !== primary.levelCap || expectedPoints > candidate.levelCap) return false
    if (Object.keys(candidate.build).length !== route.length || route.some(({ talent, rank }) => candidate.build[talent!.id] !== rank)) return false
    return isValidPlannerBuild(candidate.build, talents, { branches: profile.specs.map((branch) => branch.id), pointCap: candidate.levelCap })
  })
}

function decisionPlan(profile: ExpansionProfile, page: ClassPageDefinition): DecisionPlan | undefined {
  if (page.kind === 'pvp' || page.kind === 'specPvp') return PVP[profile.id]
  if (page.kind === 'dungeon' || page.kind === 'specDungeon' || page.kind === 'healing') return EXTRAS[profile.id]?.[page.kind] ?? GROUP[profile.id]
  return EXTRAS[profile.id]?.[page.kind]
}

/** Resolve editorial conditions against the actual page allocation, never unselected talents. */
export function buildRoleDecision(profile: ExpansionProfile, page: ClassPageDefinition, talents: ClassTalent<string>[], builds: ClassBuild[]): RoleDecision | undefined {
  if (!ROLE_KINDS.has(page.kind)) return undefined
  const primary = builds.find((build) => build.id === page.primaryBuildId)
  const spec: SpecProfile | undefined = profile.specs.find((candidate) => candidate.id === primary?.spec)
  const plan = decisionPlan(profile, page)
  if (!primary || !spec || !plan) return undefined
  if (plan.options.some((condition) => condition.sourceTalentIds.some((sourceId) => !talents.some((talent) => talent.sourceTalentId === sourceId && (primary.build[talent.id] ?? 0) > 0)))) return undefined
  const options: RoleDecision['options'] = plan.options.map((condition) => {
    const selected = condition.sourceTalentIds.map((sourceId) => talents.find((talent) => talent.sourceTalentId === sourceId && (primary.build[talent.id] ?? 0) > 0)).filter((talent): talent is ClassTalent<string> => Boolean(talent))
    const alternative = condition.alternativeSpec ? alternativeBuild(profile, condition.alternativeSpec, talents, builds, primary) : undefined
    return { id: condition.id, label: condition.label, explanation: `${condition.explanation} ${spec.test}`, talentIds: selected.map((talent) => talent.id), ...(alternative ? { alternativeBuildId: alternative.id } : {}) }
  })
  if (options.length < 2 || options.some((option) => option.talentIds.length === 0) || new Set(options.map((option) => [...option.talentIds].sort().join(','))).size !== options.length) return undefined
  const selectedIds = new Set(options.flatMap((option) => option.talentIds))
  const sources = talents.filter((talent) => selectedIds.has(talent.id)).flatMap((talent) => talent.sources.map(({ label, url }) => ({ label, url })))
  sources.push({ label: 'Blizzard October 1 Beta development notes', url: OFFICIAL_NOTES })
  if (profile.id === 'hunter') sources.push({ label: 'Blizzard Hunter class deep dive: historical talent changes', url: HUNTER_DEEP_DIVE })
  const externalSources = sources.filter(({ url }) => {
    try { const source = new URL(url); return source.protocol === 'https:' && source.hostname !== 'buildforgetools.com' }
    catch { return false }
  }).filter((source, index, all) => all.findIndex((candidate) => candidate.url === source.url) === index)
  if (externalSources.length === 0) return undefined
  return { question: plan.question, options, sources: externalSources }
}
