/** Official announcements are separate from the older imported 69913 talent-tree payload. */
export const HUNTER_DEEP_DIVE_SOURCE = 'https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid'
export const SEPTEMBER_24_OFFICIAL_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-september-24/2360696'
export const OCTOBER_OFFICIAL_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1'
export const WARRIOR_OCTOBER_2_SOURCE = 'https://us.forums.blizzard.com/en/wow/t/warrior-updates-in-todays-beta-build/2369360'

export type OfficialOctoberClassId =
  | 'warrior'
  | 'mage'
  | 'rogue'
  | 'priest'
  | 'druid'
  | 'warlock'
  | 'hunter'
  | 'shaman'

interface OfficialOctoberClassNotes {
  name: string
  notes: readonly string[]
  dateLabel?: string
  additionalSource?: string
}

/** Concise paraphrases of the Classes section of Blizzard's October 1 post. */
export const OFFICIAL_OCTOBER_CHANGES = {
  druid: {
    name: 'Druid',
    notes: [
      'Feral: the King of the Jungle talent was removed, and Tiger’s Fury was removed.',
      'Feral: Shifting Power was added in row 4 after Shredding Attacks; Improved Shifting Power was added in row 5 after Shifting Power.',
      'Bear and Dire Bear critical strikes now generate 75% more Rage; Swipe now gains 3% of Druid attack power, and Primal Bite generates roughly twice the threat.',
      'Shapeshift forms are immune to Disarm, and Faerie Fire no longer resets the swing timer.',
    ],
  },
  hunter: {
    name: 'Hunter',
    notes: [
      'Survival Deflection now grants 1/2/3/4/5% Parry, down from 2/4/6/8/10%.',
      'The 31-point Marksmanship talent Sniper Shot now has 45-yard range and extends the next three shots within 10 seconds by 10 yards. That milestone is beyond the current Level 30 point budget.',
      'Aggressive Mode returned for pets under the pet tab in the spell book; incorrect high-rank pet abilities on some tameable beasts were fixed.',
    ],
  },
  mage: {
    name: 'Mage',
    notes: [
      'Fire Hot Streak was renamed Heating Up; Combustion returned to 3 charges from 4.',
      'Improved Scorch’s Fire Vulnerability no longer gets a second resist roll, and Frost Winter’s Chill no longer rolls separately to resist after the spell hits.',
      'Mage scrolls from comprehension were rebalanced and can no longer be cast while moving.',
    ],
  },
  priest: {
    name: 'Priest',
    notes: [
      'Shadow Word: Death no longer always receives the Early Demise bonus regardless of target health.',
      'Discipline Inner Focus no longer adds critical strike chance to periodic effects; Shadow Weaving can no longer fail to apply.',
      'Devouring Plague can now correctly critically strike.',
    ],
  },
  rogue: {
    name: 'Rogue',
    notes: [
      'Expose Armor missing no longer removes all combo points.',
      'Subtlety Setup now adds combo points to the current target only when that same target caused the dodge or spell resist.',
      'These are gameplay fixes, not an announced new talent tree.',
    ],
  },
  shaman: {
    name: 'Shaman',
    notes: [
      'Totemic Recall now restores Mana as intended.',
      'Disease Cleansing Totem now has its intended 5-minute duration.',
      'Ghost Wolf is more visible in well-lit areas. The October 1 class notes announce no Shaman talent-tree change.',
    ],
  },
  warlock: {
    name: 'Warlock',
    notes: [
      'Affliction Soul Harvesting was renamed Soul Harvest and now correctly grants its 50/100% increase to Mana regeneration.',
      'Hellfire can now critically strike; Drain Soul now stops when the Warlock begins casting another spell.',
      'Aggressive Mode returned for Warlock pets under the pet tab in the spell book.',
    ],
  },
  warrior: {
    name: 'Warrior',
    dateLabel: 'October 1–2',
    additionalSource: WARRIOR_OCTOBER_2_SOURCE,
    notes: [
      'October 2 superseded the earlier 75% critical-strike Rage increase: critical strikes now generate 100% extra Rage.',
      'Fury Improved Cleave and Boundless Rage were removed. Lingering Rage was added in row 2, Furious Precision in row 3, and Gore Drinker in row 6.',
      'Fury Flurry now requires Death Wish rather than Enrage; Improved Berserker Rage moved to row 5 from row 6.',
      'Protection Toughness was removed. Iron Will moved from Fury row 2 to Protection row 1; Anticipation moved to row 2, Improved Bloodrage to row 1, Improved Revenge to row 2, Improved Disarm to row 3, and Improved Shield Bash to row 4.',
      'Dual Wield Specialization no longer grants its off-hand Rage increase, and the October 2 follow-up removed its off-hand Hit bonus. Arms Spearing Strike no longer needs a two-handed weapon but does require Battle Stance.',
      'Booming Voice, Unbridled Wrath, Blood Craze, Raging Blows, Unbridled Rage, and Bloodthirst also received Fury tuning in the official notes.',
    ],
  },
} as const satisfies Record<OfficialOctoberClassId, OfficialOctoberClassNotes>

export type OfficialTalentNotice = { status: 'removed' | 'changed'; message: string; source: string }

/** Older 69913 calculator nodes directly affected by later official announcements. */
type AnnouncedNodeChange = Omit<OfficialTalentNotice, 'source'> & { source?: string }
const AFFECTED_TALENTS: Partial<Record<OfficialOctoberClassId, Record<string, AnnouncedNodeChange>>> = {
  druid: {
    'King of the Jungle': { status: 'removed', message: 'Removed from the Feral tree in the October 1 announcement.' },
    'Tiger’s Fury': { status: 'removed', message: 'Removed in the October 1 announcement.' },
    "Tiger's Fury": { status: 'removed', message: 'Removed in the October 1 announcement.' },
    'Primal Fury': { status: 'changed', message: 'Renamed Blood Frenzy in the September 24 announcement. The older 69913 client node still carries its former name and icon.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
  },
  hunter: {
    'Improved Eyes of the Beast': { status: 'removed', message: 'Improved Eyes of the Beast became baseline in Blizzard’s class deep dive. This older 69913 talent node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    'Thick Hide': { status: 'removed', message: 'The Hunter talent was merged into Endurance Training in Blizzard’s class deep dive. This older 69913 node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    "Improved Hunter's Mark": { status: 'removed', message: 'Improved Hunter’s Mark became baseline in Blizzard’s class deep dive. This older 69913 talent node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    'Aimed Shot': { status: 'removed', message: 'Aimed Shot is now baseline at Level 20 for all Hunters, per Blizzard’s class deep dive. This older 69913 talent node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    'Humanoid Slaying': { status: 'removed', message: 'Humanoid Slaying was combined into Improved Tracking in Blizzard’s class deep dive. This older 69913 talent node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    'Improved Feign Death': { status: 'removed', message: 'Improved Feign Death was listed among talents combined into Resourcefulness in Blizzard’s class deep dive. This older 69913 node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    'Killer Instinct': { status: 'removed', message: 'Killer Instinct was listed among talents combined into Resourcefulness in Blizzard’s class deep dive. This older 69913 node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    'Wyvern Sting': { status: 'removed', message: 'Wyvern Sting was listed among talents combined into Resourcefulness in Blizzard’s class deep dive. This older 69913 node is historical.', source: HUNTER_DEEP_DIVE_SOURCE },
    Deflection: { status: 'changed', message: 'Survival Deflection now grants 1/2/3/4/5% Parry. This 69913 tooltip may show the older values.' },
    'Sniper Shot': { status: 'changed', message: 'Sniper Shot range changed in the October 1 announcement. Check the live tooltip before planning around it.' },
  },
  mage: {
    'Hot Streak': { status: 'changed', message: 'Its buff duration rose to 20 seconds on September 24, then it was renamed Heating Up on October 1. The older 69913 node name and tooltip are historical.' },
    'Wake of Fire': { status: 'changed', message: 'Its buff duration rose to 30 seconds in the September 24 announcement. The older 69913 client tooltip may differ.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
    Combustion: { status: 'changed', message: 'Combustion returned to 3 charges in the October 1 announcement.' },
    'Improved Scorch': { status: 'changed', message: 'The Fire Vulnerability resist behavior changed in the October 1 announcement.' },
    'Winter’s Chill': { status: 'changed', message: 'The separate resist roll was removed in the October 1 announcement.' },
    "Winter's Chill": { status: 'changed', message: 'The separate resist roll was removed in the October 1 announcement.' },
  },
  priest: {
    'Inner Focus': { status: 'changed', message: 'Inner Focus no longer adds critical strike chance to periodic effects.' },
    'Shadow Weaving': { status: 'changed', message: 'Shadow Weaving can no longer fail to apply.' },
  },
  rogue: {
    Setup: { status: 'changed', message: 'Setup now awards combo points only when the same current target caused the dodge or spell resist.' },
  },
  shaman: {
    'Elemental Fury': { status: 'changed', message: 'The September 24 announcement swapped its position to row 6 with Elemental Alacrity. The older 69913 client position is historical.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
    'Elemental Alacrity': { status: 'changed', message: 'The September 24 announcement swapped its position to row 3 with Elemental Fury. The older 69913 client position is historical.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
  },
  warlock: {
    'Soul Harvesting': { status: 'changed', message: 'Renamed Soul Harvest; the announced 50/100% Mana regeneration effect was fixed.' },
    'Soul Harvest': { status: 'changed', message: 'The announced 50/100% Mana regeneration effect was fixed.' },
  },
  warrior: {
    Bastion: { status: 'changed', message: 'The September 24 announcement swapped its position with Focused Rage. The older 69913 client tree is not an imported confirmation of that move.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
    'Focused Rage': { status: 'changed', message: 'The September 24 announcement swapped its position with Bastion. The older 69913 client tree is not an imported confirmation of that move.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
    Bloodthrill: { status: 'changed', message: 'The September 24 announcement raised its activation chance to 4/8/12/16/20%. The older 69913 client tooltip may differ.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
    'Improved Slam': { status: 'changed', message: 'The September 24 announcement makes Improved Slam reduce Slam’s cooldown by 1.5/3 seconds. The older 69913 client tooltip may differ.', source: SEPTEMBER_24_OFFICIAL_SOURCE },
    'Improved Cleave': { status: 'removed', message: 'Removed from Fury in the October 2 official follow-up.' },
    'Boundless Rage': { status: 'removed', message: 'Removed from Fury in the October 2 official follow-up.' },
    Toughness: { status: 'removed', message: 'Removed from Protection in the October 2 official follow-up.' },
    Flurry: { status: 'changed', message: 'Now requires Death Wish instead of Enrage.' },
    'Improved Berserker Rage': { status: 'changed', message: 'Moved to Fury row 5 from row 6.' },
    'Iron Will': { status: 'changed', message: 'Moved from Fury row 2 to Protection row 1.' },
    Anticipation: { status: 'changed', message: 'Moved to Protection row 2.' },
    'Improved Bloodrage': { status: 'changed', message: 'Moved to Protection row 1.' },
    'Improved Revenge': { status: 'changed', message: 'Moved to Protection row 2.' },
    'Improved Disarm': { status: 'changed', message: 'Moved to Protection row 3.' },
    'Improved Shield Bash': { status: 'changed', message: 'Moved to Protection row 4.' },
    'Dual Wield Specialization': { status: 'changed', message: 'Its off-hand Rage increase and off-hand Hit bonus changed in the official notes.' },
    Bloodthirst: { status: 'changed', message: 'Its Attack Power ratio increased to 45% on October 2.' },
  },
}

export function officialTalentNotice(classId: string, talentName: string): OfficialTalentNotice | undefined {
  const notices = AFFECTED_TALENTS[classId as OfficialOctoberClassId]
  const notice = notices?.[talentName]
  if (!notice) return undefined
  return { ...notice, source: notice.source ?? (classId === 'warrior' ? WARRIOR_OCTOBER_2_SOURCE : OCTOBER_OFFICIAL_SOURCE) }
}
