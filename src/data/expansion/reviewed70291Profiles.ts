import { allocationSignature, validClassBuild, type ClassDefinition, type ClassPageDefinition, type ClassTalent } from '../../lib/classPage'
import { canIncrementPlannerTalent, incrementPlannerTalent, totalPlannerPoints, type PlannerBuild } from '../../lib/talentPlanner'
import type { ExpansionProfile, SpecProfile, ExtraProfile } from './profiles'
import type { RoleDecision } from './roleDecisions'

const BUILD = '1.60.1.70291'
const CLIENT_SOURCE = `https://wago.tools/db2/TraitNode/csv?build=${BUILD}`
const RANK_SOURCE = 'https://talentsforever.com/data.json'
const ROLE_KINDS = new Set(['pvp', 'specPvp', 'dungeon', 'specDungeon', 'tank', 'healing', 'pet', 'totem'])

type NamedSpec = Omit<SpecProfile, 'name' | 'route'> & { route: [string, number][] }
type ExtraCopy = Pick<ExtraProfile, 'lead' | 'sections'>
interface ReviewedCopy {
  leveling: string
  pvp: string
  dungeon: string
  specs: NamedSpec[]
  extras: Record<string, ExtraCopy>
}
const spec = (id: string, role: string, route: [string, number][], rationale: string, leveling: string, tradeoff: string, test: string): NamedSpec => ({ id, role, route, rationale, leveling, tradeoff, test })

/** Names refer to the reviewed visible tree, never to the old numeric Talent ID table. */
const COPY: Record<string, ReviewedCopy> = {
  rogue: {
    leveling: 'Use Combat to test repeated Sinister Strike and finisher cycles with a fixed weapon. Compare Assassination when targets survive the full finisher cycle and Subtlety when opening position determines the encounter. The three routes spend the same 21-point budget; no kill-time dataset identifies a best route.',
    pvp: 'The Subtlety example separates a prepared stealth opener from combat after the opener has ended. Inspect the selected Initiative and Premeditation effects for the opening combo-point window, then Elusiveness, Ghostly Strike and Preparation for a recovery test. Keep opponent level and equipment comparable and record lost control or another player joining; this reused spec allocation has no measured PvP win rate.',
    dungeon: 'The Combat example includes Improved Kick and Blade Flurry alongside Sinister Strike, hit support and off-hand investment. Agree on the tank target and nearby crowd control before using an effect that also strikes another opponent. Record completed melee actions and successful interrupts across equivalent packs.',
    specs: [
      spec('assassination', 'Combo-point finishers and poisoned targets', [['Malice', 5], ['Ruthlessness', 3], ['Improved Slice and Dice', 2], ['Relentless Strikes', 1], ['Lethality', 4], ['Cold Blood', 1], ['Improved Poisons', 4], ['Mutilate', 1]],
        'Malice 5/5, Ruthlessness 3/3 and Improved Slice and Dice 2/3 lead to Relentless Strikes at point eleven. Lethality 4/5 precedes Cold Blood at point sixteen; Improved Poisons 4/5 then leads to Mutilate at point twenty-one. Partial ranks preserve both active choices within the budget.',
        'At eleven points, record complete finishing-move cycles and any Energy return. Later compare Cold Blood windows and Mutilate with both weapons and poison state held constant. The sequence describes editorial spending milestones, rather than separately verified unlock levels.',
        'Mutilate attacks with both weapons and its text makes extra damage conditional on a poisoned target. This example does not buy Combat hit support or the Subtlety stealth package; a short unpoisoned opener is an incomplete test of it.',
        'Keep both weapons and poison choices fixed. Record complete combo-point cycles, target lifetime, poison applications and recovery over several comparable pulls.'),
      spec('combat', 'Repeatable melee attacks and group interrupts', [['Improved Sinister Strike', 2], ['Improved Eviscerate', 3], ['Precision', 3], ['Deflection', 2], ['Endurance', 2], ['Improved Sprint', 2], ['Lightning Reflexes', 1], ['Dual Wield Specialization', 3], ['Improved Kick', 2], ['Blade Flurry', 1]],
        'Improved Sinister Strike 2/2 and Improved Eviscerate 3/3 form the first five points. Precision 3/3 and Deflection 2/3 complete ten; the first Endurance rank is the eleven-point stage. Endurance 2/2, Improved Sprint 2/2 and Lightning Reflexes 1/5 reach fifteen. Dual Wield Specialization 3/5 and Improved Kick 2/2 lead to Blade Flurry at twenty-one.',
        'Use the early stage for repeated attacks and cooldown recovery. Add the later off-hand and Kick ranks before testing Blade Flurry across the same number of enemies. Its selected place in this sequence is an editorial choice, not its only possible purchase level.',
        'The allocation reserves points for movement and interrupts, leaving off-hand damage at three of five ranks. Blade Flurry can strike another nearby opponent, so an agreed control target matters. Deflection is partial and Riposte is unselected.',
        'Keep weapon quality and the tank target fixed. Record misses, successful Kicks, movement losses, cooldown recovery and whether Blade Flurry hits an unintended controlled enemy.'),
      spec('subtlety', 'Stealth preparation and recovery after contact', [['Camouflage', 3], ['Opportunity', 2], ['Elusiveness', 2], ['Dirty Tricks', 2], ['Improved Ambush', 1], ['Ghostly Strike', 1], ['Initiative', 3], ['Master of Deception', 1], ['Premeditation', 1], ['Serrated Blades', 3], ['Heightened Senses', 1], ['Preparation', 1]],
        'Camouflage 3/5 and Opportunity 2/2 open the route. Elusiveness 2/2, Dirty Tricks 2/2 and Improved Ambush 1/3 lead to Ghostly Strike at eleven. Initiative 3/3 and Master of Deception 1/3 reach fifteen. Premeditation, Serrated Blades 3/3 and Heightened Senses 1/2 precede Preparation at twenty-one.',
        'Separate the time needed to reach the opener from actions after contact. At the later stage, test whether Premeditation combo points are used within their stated window and whether Preparation changes another engagement. Record recovery rather than only the first attack number.',
        'Several stealth and critical-strike talents remain partial. Ghostly Strike supplies a short Dodge window, while Preparation resets cooldowns in the exported text; neither establishes a universal escape sequence. The route leaves Combat hit and Kick investment outside the budget.',
        'Keep main-hand weapon and opponent level comparable. Record opener setup time, usable combo points, time in open combat and whether another engagement becomes possible.'),
    ],
    extras: {
      'subtlety-rogue-pvp-build': { lead: 'Inspect the current 21-point Subtlety opener and recovery example.', sections: [{ heading: 'Evaluate the opener and its aftermath', paragraphs: ['The current route pairs Opportunity, Initiative and Premeditation with Ghostly Strike, Elusiveness and Preparation. Record both the prepared opener and the actions available after it ends; the allocation is an editorial test without duel results.'] }] },
      'combat-vs-assassination-rogue-leveling': { lead: 'Compare current Level 30 Combat and Assassination routes, with separate eleven-point current-tree stages.', sections: [{ heading: 'Repeated attacks or a full finisher cycle', paragraphs: ['Combat reaches Blade Flurry after attack-cost, hit, off-hand and Kick support. Assassination reaches Mutilate after combo-point, finisher and poison investment. Hold weapons and target lifetime constant; the presence of an endpoint is not a damage ranking.'] }] },
      'rogue-dungeon-build': { lead: 'Test a current 21-point Combat group route with Kick support and nearby-target control.', sections: [{ heading: 'Agree on interrupts and nearby targets', paragraphs: ['Improved Kick is selected, while Blade Flurry also strikes another nearby opponent. Set the tank target and crowd-control plan before comparing packs. Keep weapon quality, enemy count and recovery comparable.'] }] },
    },
  },
  priest: {
    leveling: 'Compare Shadow when targets live long enough for Mind Flay and periodic effects, and Discipline when shield preparation and wand use fit the pull. Spirit Tap needs its stated kill condition; include recovery across repeated pulls before crediting a talent change.',
    pvp: 'This Discipline example contains shield, wand, casting-recovery and Penance choices. Separate pressure that leaves room for a wand from pressure that demands completed support casts. Martyrdom depends on receiving a melee or ranged critical strike, and Inner Focus applies its critical effect to eligible non-periodic spells; neither is an unconditional defensive outcome.',
    dungeon: 'Use the Holy example to compare completed healing casts, Renew coverage and short-range Holy Nova or Binding Heal opportunities. Agree on the party healing job and record line of sight, critical heals and mana after equivalent pulls. Spirit of Redemption only contributes after death and does not make an unsafe pull reliable.',
    specs: [
      spec('discipline', 'Shield preparation, wand actions and casting support', [['Wand Specialization', 2], ['Twin Disciplines', 3], ['Improved Power Word: Shield', 3], ['Martyrdom', 2], ['Inner Focus', 1], ['Meditation', 3], ['Silent Resolve', 1], ['Soul Warding', 1], ['Mental Agility', 3], ['Holy Precision', 1], ['Penance', 1]],
        'Wand Specialization 2/2 and Twin Disciplines 3/5 lead to Improved Power Word: Shield 3/3 and Martyrdom 2/2. Inner Focus is point eleven. Meditation 3/3 and Silent Resolve 1/3 reach fifteen; Soul Warding, Mental Agility 3/3 and Holy Precision 1/3 precede Penance at twenty-one.',
        'At eleven points, compare shield preparation and wand actions with the same wand. Later inspect casting mana recovery and the Shield cooldown/cost changes, then test Penance on the intended enemy or ally. Holy Precision affects Holy spells, not every spell school.',
        'The example retains only three Twin Disciplines ranks and one Silent Resolve and Holy Precision rank. Wand points need actual wand actions. Martyrdom has a critical-hit trigger, while Penance can serve damage or healing; this mixture does not establish a best healing or PvP build.',
        'Keep the wand and equipment fixed. Record shields used, completed casts, usable wand windows, Martyrdom triggers and mana after comparable encounters.'),
      spec('holy', 'Healing cast windows and party coverage', [['Twilight Focus', 2], ['Improved Renew', 3], ['Divine Fury', 5], ['Holy Nova', 1], ['Holy Specialization', 4], ['Inspiration', 3], ['Binding Heal', 1], ['Improved Healing', 1], ['Spirit of Redemption', 1]],
        'Twilight Focus 2/3 and Improved Renew 3/3 form the opening five points. Divine Fury 5/5 leads to Holy Nova at eleven. Holy Specialization 4/5 reaches fifteen; Inspiration 3/3, Binding Heal and Improved Healing 1/3 precede Spirit of Redemption at twenty-one.',
        'Use the eleven-point stage to compare completed casts and nearby Holy Nova coverage. Add the later critical-heal and Binding Heal effects with party damage held comparable. Record the death-triggered endpoint separately from successful healing while alive.',
        'Twilight Focus, Holy Specialization and Improved Healing remain partial. Inspiration requires a non-periodic critical heal, Holy Nova uses proximity, and Spirit of Redemption requires death. The allocation is a condition test without a healing throughput ranking.',
        'Record missed cast windows, Renew use, party distance, non-periodic critical heals, damage shared by caster and ally, and mana after equivalent pulls.'),
      spec('shadow', 'Sustained Shadow pressure and kill recovery', [['Spirit Tap', 5], ['Shadow Focus', 5], ['Mind Flay', 1], ['Improved Shadow Word: Pain', 2], ['Shadow Reach', 2], ['Vampiric Embrace', 1], ['Shadow Weaving', 3], ['Improved Mind Blast', 1], ['Silence', 1]],
        'Spirit Tap 5/5 and Shadow Focus 5/5 lead to Mind Flay at eleven. Improved Shadow Word: Pain 2/2 and Shadow Reach 2/2 reach fifteen. Vampiric Embrace, Shadow Weaving 3/3 and Improved Mind Blast 1/5 lead to Silence at twenty-one.',
        'Choose non-trivial targets that survive the selected periodic and channel effects. Record Spirit Tap after its stated kill condition, and compare the later Vampiric Embrace and Silence windows without changing target lifetime or opponent level.',
        'Improved Mind Blast is partial, and Improved Mind Flay is unselected. Spirit Tap is conditional on a kill; Vampiric Embrace depends on Shadow damage dealt, and Silence has a specific control window. Those effects do not establish unconditional mana recovery or survivability.',
        'Record completed channels, periodic-effect duration, qualifying kills, party healing from Shadow damage and useful Silence windows across comparable encounters.'),
    ],
    extras: {
      'priest-healing-build': { lead: 'Inspect the current Holy healing example and its conditional party support.', sections: [{ heading: 'Match healing effects to the damage pattern', paragraphs: ['Twilight Focus and Divine Fury support cast windows, while Renew, Holy Nova and Binding Heal answer different coverage conditions. Inspiration requires a non-periodic critical heal, and Spirit of Redemption requires death.'] }] },
      'holy-priest-dungeon-build': { lead: 'Test a current 21-point Holy route for completed casts and party healing coverage.', sections: [{ heading: 'Keep the healing job visible', paragraphs: ['Compare similar incoming damage, party distance and mana recovery. Holy Nova and Binding Heal are selected, but their presence does not verify a spell rotation or a safe response to every pack.'] }] },
      'shadow-vs-discipline-priest-leveling': { lead: 'Compare current Shadow pressure with Discipline shield and wand support at the same budget.', sections: [{ heading: 'Compare the full pull and recovery', paragraphs: ['Shadow reaches Silence after Mind Flay, Vampiric Embrace and Shadow Weaving. Discipline reaches Penance after shield and casting-support choices. Keep the wand, equipment and target lifetime constant, and record whether each selected effect is actually used.'] }] },
    },
  },
  druid: {
    leveling: 'Use the Feral example when repeated form-based melee is the session, and Balance when completed ranged casts are the intended comparison. Keep target level, weapon and mana recovery comparable. The current Feral Charge record includes Bear and Cat behavior; evaluate the form actually used.',
    pvp: 'The Feral example combines form-specific Heart of the Wild effects, Charge, Cat movement and a Bear threat ability. Separate Bear contact and control from Cat positioning before comparing opponents. The chosen allocation and point order do not supply a universal escape sequence or a measured PvP outcome.',
    dungeon: 'Agree on Bear tanking before testing the Feral group route. Inspect Heart of the Wild, Thick Hide and Primal Bite for that form, then record pack control, incoming damage and healer recovery. Cat movement and critical effects remain selected, but they do not substitute for the group’s tank role.',
    specs: [
      spec('balance', 'Ranged casts and periodic Balance effects', [['Improved Wrath', 5], ['Improved Moonfire', 2], ["Nature's Majesty", 2], ['Moonglow', 1], ["Nature's Splendor", 1], ["Nature's Reach", 2], ['Improved Entangling Roots', 2], ['Insect Swarm', 1], ['Vengeance', 4], ["Nature's Grace", 1]],
        'Improved Wrath 5/5, Improved Moonfire 2/2, Nature’s Majesty 2/2 and Moonglow 1/3 lead to Nature’s Splendor at eleven. Nature’s Reach 2/2 and Improved Entangling Roots 2/3 reach fifteen. Insect Swarm and Vengeance 4/5 precede Nature’s Grace at twenty-one.',
        'At the early stage, compare completed Wrath casts and Moonfire duration with the same target type. Add range and Roots investment before testing Insect Swarm and critical-triggered casting speed. The chosen final point is an editorial milestone, not a verified unlock schedule.',
        'Moonglow, Improved Entangling Roots and Vengeance remain partial. Nature’s Grace needs a non-periodic spell critical; Roots damage tolerance is not permanent control. The route leaves Feral form support and Restoration healing outside the budget.',
        'Record completed casts, target range, Moonfire uptime, Roots breaks, non-periodic spell criticals and mana recovery across equivalent pulls.'),
      spec('feral', 'Bear engagement and Cat positioning', [['Ferocity', 5], ['Heart of the Wild', 5], ['Feral Charge', 1], ['Thick Hide', 3], ['Feral Swiftness', 1], ['Savage Fury', 2], ['Sharpened Claws', 2], ['Primal Bite', 1], ['Leader of the Pack', 1]],
        'Ferocity 5/5 and Heart of the Wild 5/5 lead to Feral Charge at eleven. Thick Hide 3/3 and Feral Swiftness 1/2 reach fifteen. Savage Fury 2/2, Sharpened Claws 2/2 and Primal Bite precede Leader of the Pack at twenty-one.',
        'Record the form used at each stage. The current Charge record describes both Bear control and a Cat leap, while Heart of the Wild applies different Bear and Cat bonuses. Add the later Primal Bite and party aura effects only to tests that use those conditions.',
        'Feral Swiftness is partial and Feral Instinct is unselected. Primal Bite generates high threat, which matters differently while tanking and while another character tanks. Leader of the Pack’s party aura is exclusive with Moonkin Aura in the exported text.',
        'Keep weapon and target level fixed. Record form changes, Cat travel, Bear pack control, incoming damage and party range before comparing the route.'),
      spec('restoration', 'Healing cast windows and mana recovery', [["Nature's Focus", 5], ['Naturalist', 5], ['Reflection', 1], ['Gift of Nature', 4], ['Swiftmend', 1], ['Improved Rejuvenation', 3], ['Gift of the Earthmother', 1], ["Nature's Swiftness", 1]],
        'Nature’s Focus 5/5 and Naturalist 5/5 lead to Reflection 1/3 at eleven. Gift of Nature 4/5 reaches fifteen. Swiftmend, Improved Rejuvenation 3/3 and Gift of the Earthmother precede Nature’s Swiftness at twenty-one.',
        'Use the eleven-point stage for completed Healing Touch casts and casting mana recovery. Later compare Swiftmend only with an active Rejuvenation or Regrowth effect, and record whether an instant Nature spell addresses the observed healing window.',
        'Reflection and Gift of Nature remain partial. Swiftmend needs its stated periodic-heal condition, and Nature’s Swiftness is an activation window. The route does not supply the Feral melee package or establish a healing ranking.',
        'Record completed heals, active periodic heals, mana after similar pulls and how often movement or damage disrupts the intended healing window.'),
    ],
    extras: {
      'feral-druid-tank-build': { lead: 'Test the Bear conditions of a current 21-point Feral route while keeping Cat effects separate.', sections: [{ heading: 'Use the selected effects in the intended form', paragraphs: ['Heart of the Wild changes Bear Stamina and Cat Strength separately. Thick Hide supports form armor, and Primal Bite generates high threat. Feral Charge contains both Bear and Cat behavior in the current record; name the form used in the test.'] }] },
      'restoration-druid-healing-build': { lead: 'Inspect a current 21-point Restoration healing route with exact mana and periodic-heal conditions.', sections: [{ heading: 'Record the healing window and its conditions', paragraphs: ['The route selects Naturalist, Reflection, Gift of Nature, Swiftmend, Rejuvenation support and Nature’s Swiftness. Record completed casts and active periodic heals; the allocation does not establish a best gear set or a verified healing rotation.'] }] },
      'balance-vs-feral-druid-leveling': { lead: 'Compare current 21-point Balance casting and Feral form routes with eleven-point stages available separately.', sections: [{ heading: 'Two complete testing loops', paragraphs: ['Balance reaches Nature’s Grace after Wrath, Moonfire, range, Roots and Insect Swarm choices. Feral reaches Leader of the Pack after a mixed Bear and Cat package. Keep recovery and form-switch costs in the comparison; one critical hit or one favorable form does not identify a universal winner.'] }] },
    },
  },
  warlock: {
    leveling: 'Compare Affliction on targets that survive sustained effects and Demonology when the active demon determines control and recovery. Keep demon, target level and equipment fixed. Include safe Life Tap windows and pet recovery in the pull cycle; no damage simulation establishes a best leveling route.',
    pvp: 'This current Level 30 Beta example spends 21 points. Unlike the shared leveling allocation, a PvP check needs to include the opponent’s ability to interrupt pressure, force pet repositioning or punish Life Tap. For comparable PvP encounters, keep opponent level and equipment similar, then record control uptime and safe health-to-mana windows. Compare the Demonology route at the same 21-point budget if pet survival limits the route. The Affliction example uses current Corruption, drain support, Amplify Curse and Curse of Exhaustion before Siphon Life. Separate sustained pressure from an encounter that prevents useful channels or health-to-mana windows. Soul Harvest needs a non-trivial Drain Soul kill, so it is not unconditional PvP regeneration. Keep opponent level and demon comparable, record control failures across encounters and whether control lets you disengage or survive.',
    dungeon: 'The Destruction example supports completed casts, Shadowburn and Immolate/Conflagrate before Bane of Havoc. Agree on the tank and control targets. Conflagrate consumes the caster’s Immolate effect in the current text, and Bane of Havoc transfers damage from other targets; both conditions belong in the group test.',
    specs: [
      spec('affliction', 'Sustained pressure, drain windows and recovery', [['Improved Corruption', 5], ['Improved Life Tap', 2], ['Improved Drains', 3], ['Amplify Curse', 1], ['Fel Concentration', 3], ['Soul Harvest', 1], ['Curse of Exhaustion', 1], ['Nightfall', 2], ['Improved Bane of Agony', 2], ['Siphon Life', 1]],
        'Improved Corruption 5/5, Improved Life Tap 2/2 and Improved Drains 3/3 lead to Amplify Curse at eleven. Fel Concentration 3/3 and Soul Harvest 1/2 reach fifteen. Curse of Exhaustion, Nightfall 2/2 and Improved Bane of Agony 2/2 precede Siphon Life at twenty-one. Soul Siphon is a deeper current talent and is unselected.',
        'At eleven points, compare the full Corruption and drain cycle with safe Life Tap windows. Later record qualifying Soul Harvest kills, Curse of Exhaustion control and the conditions that produce Nightfall or Siphon Life value. Keep target lifetime comparable.',
        'Soul Harvest is partial and requires a qualifying Drain Soul kill. Curse of Exhaustion follows the one-Curse-per-target rule in its text. Sustained effects and channels need useful uptime, while this route leaves Demonology pet support outside the budget.',
        'Record periodic-effect uptime, completed drains, qualifying kills, safe Life Tap use, useful slows and recovery with the same demon active.'),
      spec('demonology', 'Active Voidwalker control and pet recovery', [['Demonic Embrace', 5], ['Improved Voidwalker', 3], ['Fel Vitality', 2], ['Master Summoner', 2], ['Unholy Power', 3], ['Fel Domination', 1], ['Demonic Energies', 2], ['Improved Health Funnel', 2], ['Demonic Knowledge', 1]],
        'Demonic Embrace 5/5, Improved Voidwalker 3/3 and Fel Vitality 2/3 form ten points. Master Summoner supplies the eleven-point stage and reaches 2/2 before Unholy Power 3/5 completes fifteen. Fel Domination, Demonic Energies 2/2 and Improved Health Funnel 2/2 lead to Demonic Knowledge 1/3 at twenty-one.',
        'Keep the Voidwalker active and record pet control and recovery. Add the later summon-cost, health-transfer and active-demon damage effects to comparable pulls. Demonic Sacrifice and Soul Link are unselected; the route does not sacrifice the pet it is designed to test.',
        'Improved Voidwalker applies to named Voidwalker abilities, rather than every demon. Fel Vitality, Unholy Power and Demonic Knowledge remain partial. Health Funnel transfers the player’s health, and a safer pet-supported pull does not establish a damage ranking.',
        'Record Voidwalker ability use, pet deaths, player health spent on recovery, summon time and downtime before the next comparable target.'),
      spec('destruction', 'Direct casts and conditional target effects', [['Improved Shadow Bolt', 5], ['Bane', 5], ['Shadowburn', 1], ['Cataclysm', 3], ['Destructive Reach', 1], ['Conflagrate', 1], ['Intensity', 3], ['Aftermath', 1], ['Bane of Havoc', 1]],
        'Improved Shadow Bolt 5/5 and Bane 5/5 lead to Shadowburn at eleven. Cataclysm 3/3 and Destructive Reach 1/2 reach fifteen. Conflagrate, Intensity 3/3 and Aftermath 1/5 precede Bane of Havoc at twenty-one.',
        'Keep the direct-cast sequence and target lifetime fixed at the early stage. Later record Immolate before Conflagrate and the target marked by Bane of Havoc. Check that transferred damage does not contradict the group’s intended control plan.',
        'Destructive Reach and Aftermath remain partial, while Ruin is unselected. Conflagrate consumes Immolate; Bane of Havoc is limited to one target and one Bane per Warlock per target. Its multi-target condition is not evidence of a universal dungeon rotation.',
        'Record completed casts, interruption losses, mana recovery, Immolate consumption, target marks and crowd-control failures across equivalent pulls.'),
    ],
    extras: {
      'warlock-pet-build': { lead: 'Test the current active-Voidwalker package with pet recovery and player health costs visible.', sections: [{ heading: 'Keep the active demon in the comparison', paragraphs: ['Improved Voidwalker, Fel Vitality, Unholy Power, Demonic Energies and Health Funnel support different parts of the pet loop. Fel Domination follows Master Summoner in this route. Demonic Sacrifice is unselected; changing demons requires reviewing the Voidwalker-specific investment.'] }] },
      'affliction-vs-demonology-warlock-leveling': { lead: 'Compare current 21-point sustained Affliction and active-pet Demonology routes at the same level.', sections: [{ heading: 'Sustained pressure or active demon support', paragraphs: ['Affliction reaches Siphon Life after drains, curse control and Nightfall. Demonology reaches a first Demonic Knowledge rank after a Voidwalker and recovery package. Count player and pet recovery, including health transferred through Health Funnel and safe Life Tap use.'] }] },
      'warlock-dungeon-build': { lead: 'Inspect a current 21-point Destruction group route with casting and target conditions.', sections: [{ heading: 'Name the marked and controlled targets', paragraphs: ['The route includes Shadowburn, Conflagrate and Bane of Havoc. Hold the tank target and demon behavior fixed, keep damage away from agreed control targets, and record Immolate consumption and damage transferred between targets.'] }] },
    },
  },
  shaman: {
    leveling: 'Compare Enhancement weapon actions with Elemental casting using the same equipment and target level. Enhancement selects the current Mental Dexterity and Stormstrike package; it does not spend on the old weapon-access node. Keep weapon imbue, totem placement and recovery visible.',
    pvp: 'The Elemental example separates a useful cast window from an enemy reaching the chosen totem position. Eye of the Storm reduces damage pushback, rather than preventing every interrupt; Earthbound modifies Earthbind when cast. Record line of sight, completed casts and control windows with opponent level and gear comparable.',
    dungeon: 'The Restoration example pairs Healing Wave and Water Shield with Totemic Focus, Restorative Totems, Mana Tide Totem and Nature’s Swiftness. Agree on healing and group placement, then count completed heals, totem coverage and mana after equivalent packs. No four-totem loadout or healing ranking is supplied.',
    specs: [
      spec('elemental', 'Ranged cast windows and Earthbind control', [['Convection', 5], ['Call of Flame', 3], ['Elemental Warding', 2], ['Elemental Focus', 1], ['Elemental Alacrity', 3], ['Concussion', 1], ['Eye of the Storm', 3], ['Call of Thunder', 1], ['Improved Fire Nova', 1], ['Earthbound', 1]],
        'Convection 5/5, Call of Flame 3/3 and Elemental Warding 2/3 lead to Elemental Focus at eleven. Elemental Alacrity 3/3 and Concussion 1/5 reach fifteen. Eye of the Storm 3/3, Call of Thunder and Improved Fire Nova 1/2 precede Earthbound at twenty-one.',
        'At eleven points, record completed casts, Clearcasting occurrences and recovery. Add the later cast-time and pushback effects before testing Earthbound’s cast-triggered Earthbind immobilization. A chance-based proc need not occur in a short sample.',
        'Elemental Warding, Concussion and Improved Fire Nova remain partial. Eye of the Storm addresses pushback from damage and does not verify immunity to interrupts. Earthbound needs Earthbind placement and its cast condition; the example is not a measured PvP or damage ranking.',
        'Record line of sight, completed casts, damage pushback, Clearcasting, mana recovery and useful Earthbind control windows with equipment fixed.'),
      spec('enhancement', 'Weapon actions, Shock cost and conditional threat', [['Thundering Strikes', 5], ['Mental Dexterity', 3], ['Improved Ghost Wolf', 2], ['Shamanistic Focus', 1], ['Elemental Weapons', 3], ['Improved Lightning Shield', 1], ['Stormstrike', 1], ['Flurry', 4], ['Spirit Weapons', 1]],
        'Thundering Strikes 5/5, Mental Dexterity 3/3 and Improved Ghost Wolf 2/2 lead to Shamanistic Focus at eleven. Elemental Weapons 3/3 and Improved Lightning Shield 1/3 reach fifteen. Stormstrike and Flurry 4/5 precede Spirit Weapons at twenty-one.',
        'Use the early stage to compare weapon actions, travel and Shock or Lightning Shield cost. Later inspect Stormstrike’s next-spell condition and Flurry after melee criticals. Keep the weapon and imbue unchanged when comparing the selected threat effect.',
        'Improved Lightning Shield and Flurry remain partial. Mental Dexterity scales with Intellect, and Spirit Weapons changes attack threat differently depending on whether Rockbiter Weapon is active. The allocation does not verify every imbue/totem interaction or a best weapon.',
        'Record weapon and imbue, melee criticals, the spell used after Stormstrike, travel, mana recovery and unintended threat across comparable pulls.'),
      spec('restoration', 'Healing windows, mana and chosen totem coverage', [['Improved Healing Wave', 5], ['Totemic Focus', 5], ['Water Shield', 1], ['Mindfulness', 3], ['Tidal Focus', 1], ['Mana Tide Totem', 1], ['Restorative Totems', 4], ["Nature's Swiftness", 1]],
        'Improved Healing Wave 5/5 and Totemic Focus 5/5 lead to Water Shield at eleven. Mindfulness 3/3 and Tidal Focus 1/5 reach fifteen. Mana Tide Totem and Restorative Totems 4/5 precede Nature’s Swiftness at twenty-one.',
        'Use the early stage for completed Healing Wave casts, totem mana cost and Water Shield triggers. Later inspect Mana Spring, Healing Stream and Mana Tide within the group’s actual placement, then record whether an instant eligible Nature spell answers the healing window.',
        'Tidal Focus and Restorative Totems remain partial. Water Shield follows its globe trigger and one-Elemental-Shield limit, while Nature’s Swiftness applies to the next Nature spell with a cast time below ten seconds. Totem coverage and the chosen spell loadout remain encounter conditions.',
        'Record completed heals, Water Shield triggers, mana recovery, party movement and time within useful totem placement across equivalent pulls.'),
    ],
    extras: {
      'shaman-totem-build': { lead: 'Inspect a current Restoration totem-support route with exact selected effects and party placement.', sections: [{ heading: 'Selected talents do not choose a loadout', paragraphs: ['Totemic Focus reduces totem and summon/move spell costs. Restorative Totems affects Mana Spring and Healing Stream, and Mana Tide Totem has its own range and duration. Record coverage and movement; the calculator does not automatically select four totems or verify all spell interactions.'] }] },
      'elemental-vs-enhancement-shaman-leveling': { lead: 'Compare current 21-point Elemental casting and Enhancement weapon routes, with separate eleven-point stages.', sections: [{ heading: 'Compare actual selected conditions', paragraphs: ['Elemental reaches Earthbound after cast-time, pushback and Fire support. Enhancement reaches Spirit Weapons after Mental Dexterity, Shock-cost support, Stormstrike and Flurry. Hold weapon quality and equipment steady, and keep movement and mana recovery in the test.'] }] },
      'restoration-shaman-healing-build': { lead: 'Test a current 21-point Restoration healing and totem route with mana and cast windows visible.', sections: [{ heading: 'Healing and coverage are different observations', paragraphs: ['Healing Wave, Water Shield and Nature’s Swiftness answer casting and mana conditions. Totemic Focus, Restorative Totems and Mana Tide answer chosen placement and support conditions. Record both without treating the allocation as a verified healing rotation.'] }] },
    },
  },
}

/** Preserve public route identities while requiring exact current names, ranks and legal order. */
export function buildReviewed70291Profile(profile: ExpansionProfile, talents: ClassTalent<string>[]): ExpansionProfile {
  const copy = COPY[profile.id]
  if (!copy) throw new Error(`No reviewed 70291 profile for ${profile.id}`)
  const branches = profile.specs.map(candidate => candidate.id)
  const specs = profile.specs.map(previous => {
    const reviewed = copy.specs.find(candidate => candidate.id === previous.id)
    if (!reviewed) throw new Error(`Missing current 70291 spec: ${profile.id}/${previous.id}`)
    const route: [string, number][] = reviewed.route.map(([name, rank]) => {
      const matches = talents.filter(talent => talent.branch === previous.id && talent.name === name)
      const talent = matches[0]
      if (matches.length !== 1 || !talent || !Number.isInteger(rank) || rank < 1 || rank > talent.maxRank) throw new Error(`Unresolved 70291 route: ${profile.id}/${previous.id}/${name}/${rank}`)
      if (talent.sourceClientBuild !== BUILD || talent.verifiedThroughBuild !== BUILD) throw new Error(`Route requires reviewed 70291 data: ${talent.id}`)
      if (talent.fieldEvidence.rankDescriptions !== 'community_verified' || Array.from({ length: rank }, (_, i) => talent.rankDescriptions?.[i]).some(text => !text?.trim() || /\$[a-zA-Z0-9{]|\bX%|\bUnknown\b/.test(text))) throw new Error(`Missing reviewed 70291 rank text: ${talent.id}`)
      return [talent.id, rank]
    })
    let build: PlannerBuild = {}
    for (const [id, count] of route) {
      const talent = talents.find(candidate => candidate.id === id)!
      for (let i = 0; i < count; i++) {
        if (!canIncrementPlannerTalent(build, talent, talents, { branches, pointCap: 21 })) throw new Error(`Illegal 70291 point order: ${profile.id}/${previous.id}/${talent.name}`)
        build = incrementPlannerTalent(build, talent, talents, { branches, pointCap: 21 })
      }
    }
    if (totalPlannerPoints(build) !== 21) throw new Error(`Current ${profile.id}/${previous.id} route must spend 21 points`)
    return { ...previous, ...reviewed, route }
  })
  const extras = profile.extras.map(previous => {
    const updated = copy.extras[previous.suffix]
    if (!updated) throw new Error(`Missing current 70291 extra: ${profile.id}/${previous.suffix}`)
    return { ...previous, ...updated }
  })
  return {
    ...profile, specs, extras,
    intro: `Compare ${specs.map(candidate => candidate.name).join(', ')} using the reviewed ${BUILD} talent snapshot. Each full editorial route spends 21 points at Level 30; the retained Level 20 page compares eleven-point stages of the same current tree. Rank effects and the chosen point order are separate evidence; no simulation establishes a best route.`,
    leveling: copy.leveling, pvp: copy.pvp, dungeon: copy.dungeon,
    pvpDescription: profile.id === 'warlock'
      ? 'WoW Forever Warlock PvP build: compare a Level 30 Beta Affliction route and its Level 20 starter, with exact talent effects, pet control and a planner.'
      : `Test a current Level 30, 21-point ${profile.name} PvP allocation with selected rank effects, sourced encounter conditions and an editable calculator.`,
    pvpArticle: copy.pvp, pvpUpdatedAt: '2026-10-09',
  }
}

interface Condition { id: string; label: string; names: string[]; explanation: string; alternativeSpec?: string }
interface DecisionPlan { question: string; options: Condition[] }
const condition = (id: string, label: string, names: string[], explanation: string, alternativeSpec?: string): Condition => ({ id, label, names, explanation, alternativeSpec })
const PVP: Record<string, DecisionPlan> = {
  rogue: { question: 'How does this Rogue encounter begin?', options: [
    condition('stealth-opener', 'Prepared stealth opener', ['Camouflage', 'Opportunity', 'Initiative', 'Premeditation'], 'Inspect approach speed, the named opener effects and usable combo points. Premeditation points have a stated twenty-second window; count setup time and whether the points are used before comparing the first attack.'),
    condition('open-combat', 'Combat continues after the opener', ['Ghostly Strike', 'Elusiveness', 'Heightened Senses', 'Preparation'], 'Inspect the short Dodge effect, Vanish/Blind cooldown support, selected detection/avoidance rank and cooldown reset. Record time in open combat and opportunities to re-engage. Compare Combat if repeated attacks and interrupts are the observed job; no win-rate dataset is supplied.', 'combat'),
  ] },
  priest: { question: 'Which action window does this Priest pressure allow?', options: [
    condition('shield-wand', 'Shield preparation and wand actions', ['Wand Specialization', 'Twin Disciplines', 'Improved Power Word: Shield', 'Soul Warding'], 'Keep the wand fixed and record usable wand actions, shields cast, absorbed damage and their cooldown/cost conditions. A test with no wand actions does not evaluate the wand investment.'),
    condition('support-casts', 'Support casts under pressure', ['Martyrdom', 'Inner Focus', 'Meditation', 'Mental Agility', 'Penance'], 'Separate a triggered Martyrdom window from ordinary cast pressure. Inner Focus has an eligible non-periodic critical-effect condition; Penance can target an ally or enemy. Record completed casts and mana, then compare Holy if repeated healing coverage is the actual job.', 'holy'),
  ] },
  druid: { question: 'Which form and job will this Druid use?', options: [
    condition('bear', 'Bear contact and control', ['Heart of the Wild', 'Thick Hide', 'Feral Charge'], 'Inspect the Bear Stamina and armor conditions and current Charge control text. Keep opponent level and equipment comparable; record form, terrain, useful control and recovery when helping a teammate. The rank inventory supplies no measured PvP outcome.'),
    condition('cat', 'Cat position and melee actions', ['Ferocity', 'Feral Swiftness', 'Savage Fury', 'Sharpened Claws', 'Leader of the Pack'], 'Inspect named ability cost/damage, Cat movement, form critical chance and party aura range. Record approach, form changes, opponent pressure and teammate position; the party aura condition differs from an isolated duel. One favorable fight does not establish a ranking.'),
  ] },
  warlock: { question: 'What prevents useful Warlock pressure?', options: [
    condition('sustained-target', 'Target permits sustained pressure', ['Improved Corruption', 'Improved Drains', 'Amplify Curse', 'Nightfall', 'Siphon Life'], 'Hold target lifetime and demon constant while recording periodic uptime and completed drains. Amplify Curse affects only the named next effects, while Nightfall is chance-based. A short encounter cannot establish sustained damage or a win rate.'),
    condition('control-recovery', 'Control or recovery interrupts pressure', ['Improved Life Tap', 'Fel Concentration', 'Soul Harvest', 'Curse of Exhaustion'], 'Record safe Life Tap windows, damage pushback and useful slows. Soul Harvest requires a non-trivial Drain Soul kill, so its regeneration is conditional. Curse of Exhaustion follows its one-Curse rule; compare the active-pet route if demon control is the limiting condition.', 'demonology'),
  ] },
  shaman: { question: 'Can this Shaman use the intended cast window?', options: [
    condition('cast-window', 'Useful ranged cast window', ['Convection', 'Elemental Focus', 'Elemental Alacrity', 'Eye of the Storm', 'Call of Thunder'], 'Record line of sight, completed casts, Clearcasting and mana recovery. Eye of the Storm reduces damage pushback; it does not establish immunity to every interrupt. Keep spell choice and opponent level comparable.'),
    condition('totem-contact', 'Enemy reaches the totem position', ['Elemental Warding', 'Call of Flame', 'Improved Fire Nova', 'Earthbound'], 'Inspect only the named damage schools and Fire effects, then test Earthbound when Earthbind is cast. Placement and the immobilization window are encounter conditions. Compare Enhancement if repeated weapon actions become the actual test, with the same equipment and budget.', 'enhancement'),
  ] },
}
const GROUP: Record<string, DecisionPlan> = {
  rogue: { question: 'What needs attention during this Rogue group pull?', options: [
    condition('repeated-attacks', 'Repeated attacks on the tank target', ['Improved Sinister Strike', 'Improved Eviscerate', 'Precision', 'Dual Wield Specialization'], 'Keep both weapons and the agreed target constant. Record misses and complete finisher cycles; compare Assassination where the target permits a sustained poison and finisher test.', 'assassination'),
    condition('interrupt-nearby', 'Interrupts or nearby control targets', ['Improved Kick', 'Endurance', 'Improved Sprint', 'Blade Flurry'], 'Record successful Kicks, movement impairments and cooldown recovery. Blade Flurry strikes an additional nearby opponent, so agree on controlled enemies before activation. A legal talent route does not establish safe pack handling.'),
  ] },
  priest: { question: 'What limits this Priest healing pull?', options: [
    condition('cast-window', 'Healing casts miss their window', ['Twilight Focus', 'Divine Fury', 'Holy Specialization', 'Inspiration'], 'Record completed healing casts and whether non-periodic critical heals trigger the selected armor effect. Keep line of sight and incoming damage comparable; critical-heal support is conditional, rather than a constant armor bonus.'),
    condition('party-coverage', 'Party coverage or recovery limits the pull', ['Improved Renew', 'Holy Nova', 'Binding Heal', 'Improved Healing'], 'Record periodic healing, party distance, damage on both caster and ally, and mana after equivalent pulls. Holy Nova uses proximity and Binding Heal has two targets. Compare Discipline when shield preparation and casting recovery fit the observed job.', 'discipline'),
  ] },
  warlock: { question: 'What kind of target does this Warlock group pull provide?', options: [
    condition('direct-casts', 'Completed direct casts', ['Improved Shadow Bolt', 'Bane', 'Cataclysm', 'Destructive Reach', 'Intensity'], 'Use the agreed tank target and fixed demon. Record completed casts, critical-triggered Shadow vulnerability, pushback and recovery; the exported text does not supply a damage ranking.'),
    condition('conditional-targets', 'Finishing or multiple-target conditions', ['Shadowburn', 'Aftermath', 'Conflagrate', 'Bane of Havoc'], 'Record Shadowburn kill timing, Immolate consumed by Conflagrate and the target marked by Bane of Havoc. Keep transferred damage away from agreed control targets. Compare Affliction separately if long-lived sustained targets are the actual task.', 'affliction'),
  ] },
  shaman: { question: 'What limits this Shaman healing pull?', options: [
    condition('healing-window', 'Healing or mana window', ['Improved Healing Wave', 'Water Shield', 'Mindfulness', 'Tidal Focus', "Nature's Swiftness"], 'Record completed heals, Water Shield triggers and casting mana recovery. Water Shield has its globe and one-Elemental-Shield conditions; Nature’s Swiftness applies to the next eligible Nature cast. These effects do not define a verified healing rotation.'),
    condition('totem-coverage', 'Group needs the chosen totem coverage', ['Totemic Focus', 'Restorative Totems', 'Mana Tide Totem'], 'Inspect the selected totem costs and named Mana Spring/Healing Stream effects. Mana Tide has its own range and duration. Record movement and party coverage rather than assuming a stationary placement supports every following pack.'),
  ] },
}
const DRUID_TANK: DecisionPlan = { question: 'Which form and job does this group need from the Druid?', options: [
  condition('bear', 'Bear group-tank engagement', ['Heart of the Wild', 'Thick Hide', 'Feral Charge', 'Primal Bite'], 'Agree on the Bear tank role and pack target. Inspect form Stamina and armor, Charge control and Primal Bite high threat; record enemies leaving the intended pack, incoming damage and healer recovery across comparable pulls. Legal ranks alone do not establish safe tanking.'),
  condition('cat', 'Party permits a separate Cat comparison', ['Ferocity', 'Feral Swiftness', 'Savage Fury', 'Sharpened Claws', 'Leader of the Pack'], 'Use the selected Cat movement and melee effects only when the group does not need this character to tank in Bear. Record the agreed job, form changes and party aura coverage; compare the Restoration route if the party instead expects healing.', 'restoration'),
] }
const DRUID_HEALING: DecisionPlan = { question: 'What limits this Druid healing session?', options: [
  condition('healing-window', 'Completed heals and periodic-heal conditions', ["Nature's Focus", 'Naturalist', 'Gift of Nature', 'Swiftmend', 'Improved Rejuvenation'], 'Record completed casts and active Rejuvenation or Regrowth before using Swiftmend. Compare equivalent party damage; a legal allocation does not establish a best healing setup.'),
  condition('recovery-movement', 'Recovery or movement limits support', ['Reflection', 'Gift of the Earthmother', "Nature's Swiftness"], 'Inspect the selected casting-regeneration rank, the named periodic-heal global cooldowns and the next instant Nature spell. Record mana and movement before another pull; compare Feral only when the agreed session changes to form-based melee.', 'feral'),
] }
const WARLOCK_PET: DecisionPlan = { question: 'What limits this active Warlock demon test?', options: [
  condition('voidwalker-control', 'Active Voidwalker control', ['Improved Voidwalker', 'Fel Vitality', 'Unholy Power', 'Demonic Knowledge'], 'Keep the Voidwalker active and record its named ability use, survival and useful combat time. Improved Voidwalker is demon-specific, and Demonic Knowledge requires an active summoned demon. This route leaves Demonic Sacrifice unselected and supplies no pet damage ranking.'),
  condition('pet-recovery', 'Pet recovery interrupts pulls', ['Demonic Embrace', 'Master Summoner', 'Fel Domination', 'Demonic Energies', 'Improved Health Funnel'], 'Record player health spent, pet recovery and summon time. Fel Domination modifies the next named summon, while Health Funnel transfers player health. Hold the demon fixed; compare Affliction if sustained player pressure becomes the intended test.', 'affliction'),
] }
const SHAMAN_TOTEM: DecisionPlan = { question: 'How does the party use this Shaman’s chosen placement?', options: [
  condition('stable-placement', 'Party stays near useful placement', ['Totemic Focus', 'Restorative Totems', 'Mana Tide Totem'], 'Record party position, Mana Spring/Healing Stream use and Mana Tide coverage. The selected talents affect named effects; they do not choose a four-totem loadout or validate every imbue and totem interaction. The loadout and unrecorded interactions remain unverified.'),
  condition('moving-healing', 'Movement and healing dominate', ['Improved Healing Wave', 'Water Shield', 'Mindfulness', "Nature's Swiftness"], 'Record completed heals, Water Shield triggers, mana and the next eligible instant Nature spell as the party moves. A stationary totem test does not establish that the next moving pull receives the same support.'),
] }

function planFor(def: ClassDefinition, page: ClassPageDefinition): DecisionPlan | undefined {
  if (page.kind === 'pvp' || page.kind === 'specPvp') return PVP[def.id]
  if (def.id === 'druid' && page.kind === 'tank') return DRUID_TANK
  if (def.id === 'druid' && page.kind === 'healing') return DRUID_HEALING
  if (def.id === 'warlock' && page.kind === 'pet') return WARLOCK_PET
  if (def.id === 'shaman' && page.kind === 'totem') return SHAMAN_TOTEM
  if (['dungeon', 'specDungeon', 'healing'].includes(page.kind)) return GROUP[def.id]
  return undefined
}

/** Conditions inspect exact ranks of the actual primary allocation, with no legacy-ID fallback. */
export function buildReviewed70291RoleDecision(def: ClassDefinition, page: ClassPageDefinition): RoleDecision | undefined {
  if (!COPY[def.id] || !def.dataReview?.current || def.dataReview.ready === false || def.verifiedBuild !== BUILD || !ROLE_KINDS.has(page.kind)) return undefined
  const primary = def.builds.find(build => build.id === page.primaryBuildId)
  const plan = planFor(def, page)
  if (!primary || !plan || !validClassBuild(def, primary)) return undefined
  const options: RoleDecision['options'] = []
  for (const choice of plan.options) {
    const selected = choice.names.map(name => def.talents.filter(talent => talent.branch === primary.spec && talent.name === name && primary.build[talent.id] > 0))
    if (selected.some(matches => matches.length !== 1)) return undefined
    const talents = selected.map(matches => matches[0])
    if (talents.some(talent => {
      const text = talent.rankDescriptions?.[primary.build[talent.id] - 1]
      return talent.sourceClientBuild !== BUILD || talent.verifiedThroughBuild !== BUILD || talent.fieldEvidence.rankDescriptions !== 'community_verified' || !text?.trim() || /\$[a-zA-Z0-9{]|\bX%|\bUnknown\b/.test(text)
    })) return undefined
    const effects = talents.map(talent => `${talent.name} ${primary.build[talent.id]}/${talent.maxRank}: ${talent.rankDescriptions![primary.build[talent.id] - 1]}`).join(' ')
    const alternative = choice.alternativeSpec ? def.builds.find(build => build.spec === choice.alternativeSpec && build.intent === 'spec' && build.level === primary.level && build.points === primary.points && build.levelCap === primary.levelCap && validClassBuild(def, build) && allocationSignature(build.build) !== allocationSignature(primary.build)) : undefined
    options.push({ id: choice.id, label: choice.label, talentIds: talents.map(talent => talent.id), explanation: `${choice.explanation} Selected ${BUILD} ranks: ${effects} Tooltip amounts are the export’s Level 60 snapshot, not rescaled results for the selected planner level. Point tiers, full-rank prerequisites and editorial spending order remain planning assumptions.`, ...(alternative ? { alternativeBuildId: alternative.id } : {}) })
  }
  if (new Set(options.map(option => option.talentIds.slice().sort().join(','))).size !== options.length) return undefined
  return { question: plan.question, options, sources: [
    { label: `Wago DB2: ${def.name} client structure ${BUILD}`, url: CLIENT_SOURCE },
    { label: `Talents Forever: ${def.name} ${BUILD} rank text adapted under CC BY 4.0`, url: RANK_SOURCE },
    { label: 'Creative Commons Attribution 4.0 rank-text license', url: 'https://creativecommons.org/licenses/by/4.0/' },
  ] }
}
