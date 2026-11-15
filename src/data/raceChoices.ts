import type { ToolActivity } from './planningTools'

export const raceClasses = ['Druid','Hunter','Mage','Paladin','Priest','Rogue','Shaman','Warlock','Warrior'] as const
export type RaceClass = (typeof raceClasses)[number]
export type RaceFaction = 'Alliance' | 'Horde'
interface RaceChoice {
  name:string; faction:RaceFaction; classes:RaceClass[]; active:string; passive:string
  uses:Record<ToolActivity,string>; pairing?: Partial<Record<RaceClass,string>>
}
// Eligibility follows Blizzard’s character-creation tables. Highlight one active and one passive per race.
export const raceChoices: RaceChoice[] = [
  {name:'Human',faction:'Alliance',classes:['Hunter','Mage','Paladin','Priest','Rogue','Warlock','Warrior'],
    active:'Will to Survive removes stuns.',passive:'Ruthless adds critical strike chance to spells and attacks.',
    uses:{solo:'Use the stun break to recover control during a bad pull.',dungeon:'Save the break for a stun that would interrupt a critical group action.',pvp:'Break a stun when you need an immediate cast, heal or escape.'},
    pairing:{Paladin:'A stun break can buy time to cast a heal on a teammate.'}},
  {name:'Dwarf',faction:'Alliance',classes:['Hunter','Paladin','Priest','Rogue','Shaman','Warrior'],
    active:'Stoneform clears bleeds, diseases and poisons and reduces physical damage briefly.',passive:'Artisan’s Precision adds hit chance to spells and attacks.',
    uses:{solo:'Keep Stoneform for stacking bleeds or poisons.',dungeon:'Time Stoneform for a physical damage spike or a removable debuff.',pvp:'Use Stoneform after a bleed or poison lands.'},
    pairing:{Rogue:'Removing a damaging bleed can help set up a restealth.',Paladin:'Stoneform gives a shield tank another answer to a bleed.'}},
  {name:'Gnome',faction:'Alliance',classes:['Mage','Priest','Rogue','Warlock','Warrior'],
    active:'Escape Artist clears movement impairment and briefly protects against roots and snares.',passive:'Expansive Mind increases your maximum class resource.',
    uses:{solo:'Escape a snare before a second enemy reaches you.',dungeon:'Break a root to move out of a hazard or get back into range.',pvp:'Save the escape for a root that separates you from your target.'},
    pairing:{Mage:'Extra mana supports longer pulls. Escape Artist helps you restore casting distance.',Priest:'Eureka! also supports direct healing during a short pressure window.'}},
  {name:'Night Elf',faction:'Alliance',classes:['Druid','Hunter','Priest','Rogue','Warrior'],
    active:'Elune’s Light briefly increases critical strike chance.',passive:'Quickness grants dodge and movement speed.',
    uses:{solo:'Save Elune’s Light for a high-health target.',dungeon:'Use the critical strike window on the group’s priority target.',pvp:'Pair the critical strike window with your team’s coordinated attack.'}},
  {name:'High Order Skyborne',faction:'Alliance',classes:['Druid','Hunter','Mage','Rogue','Warrior'],
    active:'Read Leyline boosts health and mana regeneration. Attunement near a leyline strengthens it.',passive:'Wind Blessed grants haste.',
    uses:{solo:'Trigger regeneration between pulls, especially near a leyline.',dungeon:'Use regeneration during recovery between packs.',pvp:'Consider the recovery window when regrouping at an objective.'},
    pairing:{Mage:'Read Leyline helps recover mana between spells and pulls.',Rogue:'You can use the health regeneration. The mana portion has no use for an energy user.'}},
  {name:'Orc',faction:'Horde',classes:['Hunter','Mage','Rogue','Shaman','Warlock','Warrior'],
    active:'Blood Fury raises attack power and spell power for a short burst.',passive:'Hardiness shortens stuns.',
    uses:{solo:'Use Blood Fury on the toughest target in a pull.',dungeon:'Line Blood Fury up with uninterrupted damage on a boss.',pvp:'Shorter stuns help you return to an objective fight.'},
    pairing:{Hunter:'Command increases pet damage while a pet is fighting. A petless Lone Wolf setup gives up that benefit.',Warlock:'Command applies to Warlock pets. Keep your demon active to use it.',Mage:'Blood Fury boosts spell power for a planned casting window.'}},
  {name:'Undead',faction:'Horde',classes:['Mage','Paladin','Priest','Rogue','Warlock','Warrior'],
    active:'Will of the Forsaken clears fear, sleep and charm.',passive:'Touch of the Grave can drain health from enemies.',
    uses:{solo:'Use the control break to keep a fear from pulling you into more enemies.',dungeon:'Save the break for a fear that could move you away from your party.',pvp:'Use the break after a fear lands so you can act immediately.'},
    pairing:{Paladin:'A Holy Paladin can break fear and resume healing. This is the Horde Paladin option.'}},
  {name:'Tauren',faction:'Horde',classes:['Druid','Hunter','Shaman','Warrior'],
    active:'War Stomp briefly stuns nearby enemies.',passive:'Endurance increases maximum health.',
    uses:{solo:'Stun close enemies before moving away or casting a heal.',dungeon:'Use the short stun when several enemies reach your healer.',pvp:'Stun enemies in melee range to make space for your next action.'},
    pairing:{Hunter:'War Stomp gives you an opening to move back to ranged distance.',Shaman:'A nearby stun can buy time for a heal.'}},
  {name:'Troll',faction:'Horde',classes:['Hunter','Mage','Priest','Rogue','Shaman','Warlock','Warrior'],
    active:'Berserking speeds up attacks and casting.',passive:'Beast Slaying adds damage against beasts.',
    uses:{solo:'Choose a beast-heavy quest route to benefit from the passive.',dungeon:'Reserve Berserking for a stretch of uninterrupted casts or attacks.',pvp:'Use the haste window while a teammate keeps the target in reach.'}},
  {name:'Windshaper Skyborne',faction:'Horde',classes:['Druid','Hunter','Rogue','Shaman','Warrior'],
    active:'Skysight increases travel speed. An elemental convergence can strengthen the effect.',passive:'Wind Blessed grants haste.',
    uses:{solo:'Use Skysight on long travel legs between objectives.',dungeon:'Use the speed window to catch the group after a split.',pvp:'Plan a fast rotation between objectives while the path is clear.'},
    pairing:{Shaman:'Windshapers can play Shaman. Use Skysight to move between fights and Wind Blessed during casts.'}},
]
export const raceSources = {
  access:'https://news.blizzard.com/en-us/article/24302499/wage-war-once-more-with-warcraft-iii-reforged-forsaken-kingdom',
  matrix:'https://news.blizzard.com/en-us/article/24304075/create-the-hero-you-want-to-be-in-world-of-warcraft-forever',
  tooltips:'https://www.zockify.com/forever/races/',
  guide:'https://www.method.gg/wow-forever/all-new-racial-abilities-in-world-of-warcraft-forever',
}
