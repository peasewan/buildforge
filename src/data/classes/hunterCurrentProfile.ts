import type { ClassDefinition, ClassPageDefinition, ClassTalent } from '../../lib/classPage'
import type { ExpansionProfile } from '../expansion/profiles'
import type { RoleDecision } from '../expansion/roleDecisions'

const CURRENT_SOURCE = 'https://talentsforever.com/data.json'
const DEEP_DIVE = 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid'
const OCTOBER_NOTES = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696'

/** Editorial point order resolves only against the separately reviewed current dataset. */
export function createHunterCurrentProfile(talents: ClassTalent<string>[]): ExpansionProfile {
  const route = (branch: string, choices: [string, number][]): [string, number][] => choices.map(([name, rank]) => {
    const matches = talents.filter(talent => talent.branch === branch && talent.name === name)
    const talent = matches[0]
    if (matches.length !== 1 || !talent || rank < 1 || rank > talent.maxRank) throw new Error(`Unresolved current Hunter route: ${branch}/${name}/${rank}`)
    return [talent.id, rank]
  })
  return {
    id: 'hunter', name: 'Hunter', defaultSpec: 'beast-mastery', pvpSpec: 'survival', dungeonSpec: 'marksmanship',
    intro: 'Compare pet-supported Beast Mastery, ranged Marksmanship and close-range Survival using the reviewed 1.60.1.70291 talent snapshot. Each full editorial route spends 21 points at Level 30; the Level 20 page keeps separate eleven-point stages of the same current tree.',
    resource: 'Mana, ranged positioning and pet control',
    leveling: 'Start with Beast Mastery when the active pet, its travel time and recovery determine the next pull. Compare Marksmanship with the same pet, ranged weapon and target type when ranged uptime is reliable. The routes are editable testing examples; no kill-time dataset establishes a best leveling choice.',
    pvp: 'Use the 21-point Survival route to compare trap windows with the moment an opponent reaches melee range. It selects current Deflection, Entrapment, Deterrence, trap support and Strider Kick. Keep opponent level, equipment and pet family comparable, then record recovered distance and useful actions instead of treating one duel as a win-rate estimate.',
    pvpDescription: 'Test a current Level 30, 21-point Survival Hunter PvP route with trap support, close-range control, source-linked rank effects and an editable calculator.',
    pvpUpdatedAt: '2026-10-09',
    pvpArticle: 'This current-tree Survival example spends Deflection 5/5, Entrapment 5/5, Deterrence 1/1, Clever Traps 2/2, Surefooted 2/3, Survival Tactics 2/2, Improved Wing Clip 3/3 and Strider Kick 1/1. A trap-window test and a melee-recovery test use different selected effects; choose the condition below before comparing encounters. The 70291 export supplies rank text, while point order, five-point tiers and full-rank prerequisites remain planning assumptions. A legal allocation supplies neither a measured win rate nor a universal escape sequence.',
    dungeon: 'The Marksmanship example keeps the pet active and leaves Lone Wolf unselected. Agree on pet control and the tank target, then compare completed ranged attacks, party range and mana after equivalent packs. Trueshot Aura is the chosen final point in this editorial sequence, rather than a claim that it can only unlock at that level.',
    comparison: ['beast-mastery', 'marksmanship'],
    specs: [
      {
        id: 'beast-mastery', name: 'Beast Mastery', role: 'Pet-supported leveling and recovery',
        route: route('beast-mastery', [['Endurance Training', 5], ['Focused Fire', 2], ['Improved Revive Pet', 2], ['Pathfinding', 1], ['Bestial Swiftness', 1], ['Unleashed Fury', 4], ['Summon Hawk', 1], ['Ferocity', 4], ['Intimidation', 1]]),
        rationale: 'Endurance Training 5/5 establishes pet health and armor, followed by Focused Fire 2/2, Improved Revive Pet 2/2 and Pathfinding 1/2. Bestial Swiftness is point eleven. Unleashed Fury 4/5 precedes Summon Hawk at point sixteen; Ferocity 4/5 then leads to Intimidation at point twenty-one. Those deliberately partial damage ranks preserve both current active abilities within the budget.',
        leveling: 'At the eleven-point stage, compare pet travel and recovery. At the sixteen-point stage, test Summon Hawk while keeping its shared cooldown with Arcane Shot visible. At the twenty-one-point stage, record whether Intimidation helps regain control; its high-threat text also matters when the group already has a tank.',
        tradeoff: 'This route keeps an active pet and spends outside Marksmanship shot talents. Improved Revive Pet contributes only when revival is needed, and Summon Hawk shares Arcane Shot’s cooldown. Compare whole pull-and-recovery cycles before crediting the allocation for a single large hit.',
        test: 'Keep the pet family and ranged weapon unchanged. Record time to useful pet contact, pet deaths, recovery, hawk use and control failures over equivalent pulls.',
      },
      {
        id: 'marksmanship', name: 'Marksmanship', role: 'Ranged attacks and party support',
        route: route('marksmanship', [['Lethal Attacks', 5], ['Efficiency', 5], ['Careful Aim', 5], ['Mortal Shots', 5], ['Trueshot Aura', 1]]),
        rationale: 'Lethal Attacks 5/5 and Efficiency 5/5 form the first ten points. Careful Aim 5/5 supplies the selected prerequisite for Mortal Shots 5/5. Trueshot Aura closes this 21-point editorial sequence. Aimed Shot is absent from the current talent tree, so no point is spent on its archived 69913 node.',
        leveling: 'The eleven-point stage has the first Careful Aim rank. Continue to its fifth rank before buying Mortal Shots, then inspect Trueshot Aura with party position held constant. These chosen milestones describe the route’s sequence, not a separately verified live unlock schedule.',
        tradeoff: 'The example leaves Lone Wolf unselected so it can be compared with an active pet. It also gives up the Beast Mastery recovery package and Survival trap investment. Critical-strike talents do not guarantee a critical hit in a short test.',
        test: 'Use the same ranged weapon, pet and equipment. Record completed ranged attacks, movement interruptions, party range and mana before the next comparable pull.',
      },
      {
        id: 'survival', name: 'Survival', role: 'Trap windows and close-range recovery',
        route: route('survival', [['Deflection', 5], ['Entrapment', 5], ['Deterrence', 1], ['Clever Traps', 2], ['Surefooted', 2], ['Survival Tactics', 2], ['Improved Wing Clip', 3], ['Strider Kick', 1]]),
        rationale: 'Deflection 5/5 and Entrapment 5/5 lead to Deterrence at point eleven. Clever Traps 2/2 and Surefooted 2/3 complete the fifteen-point stage; Survival Tactics 2/2 and Improved Wing Clip 3/3 precede Strider Kick at point twenty-one. The allocation deliberately combines trap support with options for a target already in melee range.',
        leveling: 'Use the eleven-point stage to separate trap control from Deterrence windows. Add the later trap and Wing Clip ranks before testing the Strider Kick endpoint. Record whether you regain useful distance rather than assuming a defensive allocation improves every safe pet-held pull.',
        tradeoff: 'This route leaves Beast Mastery pet support and Marksmanship ranged investment outside the budget. Deflection affects Parry, while Deterrence has an activation window; neither is a general reduction to all incoming damage. A trap effect also depends on using the appropriate trap in the encounter.',
        test: 'Keep the opponent or enemy type comparable. Record triggered trap windows, movement impairments, time spent in melee and successful recovery of ranged distance.',
      },
    ],
    extras: [
      {
        suffix: 'hunter-pet-build', title: 'Hunter Pet Build', kind: 'pet', spec: 'beast-mastery',
        lead: 'Select an official pet-family ability and inspect a current 21-point Beast Mastery pet-support route, without inventing pet damage rankings.',
        sections: [
          { heading: 'What this page actually selects', paragraphs: ['Use the eighteen-family lookup to inspect the officially announced family abilities. The calculator edits Hunter talents; it does not allocate a separate pet talent tree, simulate pet damage or choose a family from an invented damage ranking.'] },
          { heading: 'Evaluate the pet-supported loop', paragraphs: ['The 70291 route uses Endurance Training, Focused Fire, Improved Revive Pet, Pathfinding and Bestial Swiftness before Unleashed Fury, Summon Hawk, Ferocity and Intimidation. Endurance Training includes pet Health and Armor in the current export; the old Thick Hide node is retained only in the historical dataset.', 'Choose recovery or active-pet combat below, inspect the selected rank effects, then keep the family and weapon consistent across comparable pulls. Intimidation generates high threat, and Summon Hawk shares Arcane Shot’s cooldown; those conditions belong in the test.'], bullets: ['Keep the pet family and ranged weapon unchanged.', 'Include pet travel, revival and recovery time.', 'Record family-ability use separately from Hunter talent changes.'] },
        ],
      },
      {
        suffix: 'beast-mastery-vs-marksmanship-hunter-leveling', title: 'Beast Mastery vs Marksmanship Hunter Leveling', kind: 'comparison', spec: 'beast-mastery',
        lead: 'Compare current Level 30, 21-point Beast Mastery and Marksmanship routes, with eleven-point stages available on the retained Level 20 page.',
        sections: [
          { heading: 'Where the points go', paragraphs: ['Beast Mastery uses the pet recovery package, reaches Bestial Swiftness at eleven points, adds Summon Hawk at sixteen and finishes with Intimidation at twenty-one. Marksmanship follows Lethal Attacks, Efficiency, Careful Aim and Mortal Shots before Trueshot Aura. Both allocations come from the current 70291 tree and can load into the calculator.'] },
          { heading: 'Which route answers your leveling problem?', paragraphs: ['Choose the Beast Mastery example when the active pet’s survival, contact time or recovery limits repeated pulls. Choose the Marksmanship example when you can keep ranged uptime and want to inspect the ranged and party-support effects. Both spend 21 points at Level 30; the retained Level 20 page compares their eleven-point current-tree stages.', 'Lone Wolf is present in the current tree but unselected in these examples, so the active-pet comparison remains meaningful. Aimed Shot is absent as a talent node. Official design announcements, current rank text and the editorial point order remain separate evidence.'] },
          { heading: 'A fair leveling comparison', paragraphs: ['Use the same pet, ranged weapon and target type. Include the time needed to start the next pull; a larger attack number does not establish a better recovery pattern.', 'Record pull time, pet recovery, completed ranged attacks and mana needed before the next target. Changing pet family or weapon while switching talent routes makes the result difficult to interpret.'] },
        ],
      },
      {
        suffix: 'hunter-dungeon-build', title: 'Hunter Dungeon Build', kind: 'dungeon', spec: 'marksmanship',
        lead: 'Load a current 21-point Marksmanship route for ranged group play, with party support, mana and pet control kept visible.',
        sections: [
          { heading: 'Control before damage', paragraphs: ['Agree on the tank target and pet behavior before the pull. Lone Wolf is unselected in the displayed route. Avoid crediting a talent change for a run where accidental pet pulls or a different party position changed the encounter.'] },
          { heading: 'Review the encounter conditions', paragraphs: ['Inspect Lethal Attacks, Careful Aim, Mortal Shots and Trueshot Aura for stable ranged pulls, then inspect Efficiency when mana recovery limits the next pack. If space repeatedly forces close combat, compare the Survival route for that observed condition. No dungeon damage ranking is established by these editorial allocations.'] },
        ],
      },
    ],
  }
}

/** Each focus names ranks actually selected by the page's current primary route. */
export function buildHunterCurrentRoleDecision(classDef: ClassDefinition, page: ClassPageDefinition): RoleDecision | undefined {
  if (!['pvp', 'dungeon', 'pet'].includes(page.kind)) return undefined
  const build = classDef.builds.find(candidate => candidate.id === page.primaryBuildId)
  if (!build) throw new Error(`Current Hunter role has no primary route: ${page.slug}`)
  const ids = (names: string[]) => names.map(name => {
    const talent = classDef.talents.find(candidate => candidate.name === name && (build.build[candidate.id] ?? 0) > 0)
    if (!talent) throw new Error(`Current Hunter role has no selected rank: ${page.slug}/${name}`)
    return talent.id
  })
  const alternate = (spec: string) => classDef.builds.find(candidate => candidate.spec === spec && candidate.intent === 'spec' && candidate.level === 30)?.id
  const sources = [
    { label: 'Talents Forever 1.60.1.70291 Hunter rank text, CC BY 4.0', url: CURRENT_SOURCE },
    { label: 'Blizzard Hunter class deep dive', url: DEEP_DIVE },
    { label: 'Blizzard October 1 Beta development notes', url: OCTOBER_NOTES },
  ]
  if (page.kind === 'pvp') return {
    question: 'What happens to this Hunter’s intended distance?', sources,
    options: [
      { id: 'melee-reached', label: 'Enemy reaches melee range', talentIds: ids(['Deflection', 'Deterrence', 'Improved Wing Clip', 'Strider Kick']), explanation: 'Inspect the current selected Parry ranks, Deterrence window, Wing Clip immobilization chance and Strider Kick movement effect. Record whether you regain useful ranged distance after contact. These 70291 rank effects do not supply a measured win rate or guarantee a safe escape against every opponent.' },
      { id: 'trap-window', label: 'Trap window preserves distance', talentIds: ids(['Entrapment', 'Clever Traps', 'Surefooted', 'Survival Tactics']), explanation: 'Inspect the selected Entrapment duration, trap effects, movement-impairment duration and Trap/Feign Death hit support. Keep opponent level, pet family and trap choice comparable while recording successful control windows. Point gates and order remain planning assumptions; the talent inventory does not verify every trap spell interaction.' },
    ],
  }
  if (page.kind === 'pet') return {
    question: 'What limits this Hunter pet test?', sources,
    options: [
      { id: 'pet-recovery', label: 'Pet travel or recovery', talentIds: ids(['Endurance Training', 'Improved Revive Pet', 'Bestial Swiftness']), explanation: 'Endurance Training selects pet Health and Armor, Improved Revive Pet selects revival recovery, and Bestial Swiftness selects pet movement speed. Count pet contact time, deaths and the interval until the next comparable pull. The official family lookup supplies ability descriptions; it supplies no pet scaling formula or damage ranking.' },
      { id: 'active-pet-combat', label: 'Active pet and hawk combat', talentIds: ids(['Focused Fire', 'Unleashed Fury', 'Summon Hawk', 'Ferocity', 'Intimidation']), explanation: 'Inspect the selected active-pet and hawk effects with the same pet family. Summon Hawk shares Arcane Shot’s cooldown, and Intimidation generates high threat, so record ability use and group control alongside useful combat time. This editorial allocation does not simulate pet damage or establish a best family.' },
    ],
  }
  return {
    question: 'What limits this Hunter group pull?', sources,
    options: [
      { id: 'ranged-distance', label: 'Stable ranged distance', talentIds: ids(['Lethal Attacks', 'Careful Aim', 'Mortal Shots', 'Trueshot Aura']), explanation: 'Inspect the selected attack critical chance, Intellect conversion, ranged critical damage and party aura effects. Hold the ranged weapon, pet and party position consistent while recording completed attacks. Lone Wolf is unselected; this active-pet example does not establish a dungeon damage ranking.' },
      { id: 'mana-movement', label: 'Mana or movement limits pulls', talentIds: ids(['Efficiency']), alternativeBuildId: alternate('survival'), explanation: 'Efficiency selects the current mana-cost reduction for Shots, Stings and melee abilities. Count recovery and movement interruptions before changing ranks. Agree on pet control first; compare the separate Survival route when the observed problem is repeated melee contact, using the same budget. Aimed Shot is baseline rather than a purchased node in this current tree.' },
    ],
  }
}
