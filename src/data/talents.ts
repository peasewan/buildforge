import type { Branch, TalentDefinition } from '../lib/build'

// Data provenance — see the "Talent Data Sources" block in App.tsx.
// classic_1.12 baseline. Structure (x/y), unlock (requiredTreePoints), and arrows
// (prerequisite) are kept separate so the data layer can be swapped for other
// versions (WoW Forever / Classic+ / TBC) without touching the engine.
//
// Protection and Retribution are complete first passes (with descriptions). Holy
// is a complete structure with placeholder descriptions, pending its revision.
export const DATA_VERSION = 'classic_1.12'
export const DATA_SOURCES: string[] = ['ClassicDB', 'Warcraft Tavern', 'Wowisclassic']

export type DataStatus = 'community' | 'unverified'

export interface Talent extends TalentDefinition {
  name: string
  description: string
  icon: string
  status: DataStatus
  x: number
  y: number
  source: string[]
}

export const branchNames: Record<Branch, string> = {
  holy: 'Holy',
  protection: 'Protection',
  retribution: 'Retribution',
}

export const branchTaglines: Record<Branch, string> = {
  holy: 'Channel the Light through healing and spell power.',
  protection: 'Hold the line with shields and sacred defenses.',
  retribution: 'Bring judgment through weapons and holy power.',
}

const BRANCH_ICON: Record<Branch, string> = {
  holy: '/images/icons/holy-strike.png',
  protection: '/images/icons/shield.png',
  retribution: '/images/icons/hammer.png',
}

const PLACEHOLDER_DESCRIPTION = 'Classic 1.12 talent — community preview.'

type RawTalent = {
  id: string
  name: string
  rank: number
  x: number
  y: number
  requiredTreePoints: number
  prerequisite: string[]
  description?: string
}

// Layout maps (x/y are grid indices, converted to percentages for the SVG).
const COLUMN_X: Record<number, number> = { 0: 24, 1: 50, 2: 76 }
const TIER_Y: Record<number, number> = { 0: 8, 1: 22, 2: 36, 3: 50, 4: 64, 5: 78, 6: 92 }

const holy: RawTalent[] = [
  { id: 'divine_strength', name: 'Divine Strength', rank: 5, x: 0, y: 0, requiredTreePoints: 0, prerequisite: [] },
  { id: 'divine_intellect', name: 'Divine Intellect', rank: 5, x: 2, y: 0, requiredTreePoints: 0, prerequisite: [] },
  { id: 'spiritual_focus', name: 'Spiritual Focus', rank: 5, x: 0, y: 1, requiredTreePoints: 5, prerequisite: [] },
  { id: 'improved_seal_of_righteousness', name: 'Improved Seal of Righteousness', rank: 5, x: 2, y: 1, requiredTreePoints: 5, prerequisite: [] },
  { id: 'healing_light', name: 'Healing Light', rank: 3, x: 0, y: 2, requiredTreePoints: 10, prerequisite: [] },
  { id: 'concentration_aura', name: 'Concentration Aura', rank: 1, x: 1, y: 2, requiredTreePoints: 10, prerequisite: [] },
  { id: 'improved_lay_on_hands', name: 'Improved Lay on Hands', rank: 2, x: 2, y: 2, requiredTreePoints: 10, prerequisite: [] },
  { id: 'unyielding_faith', name: 'Unyielding Faith', rank: 2, x: 0, y: 3, requiredTreePoints: 15, prerequisite: [] },
  { id: 'illumination', name: 'Illumination', rank: 5, x: 1, y: 3, requiredTreePoints: 15, prerequisite: [] },
  { id: 'improved_blessing_of_wisdom', name: 'Improved Blessing of Wisdom', rank: 2, x: 2, y: 3, requiredTreePoints: 15, prerequisite: [] },
  { id: 'divine_favor', name: 'Divine Favor', rank: 1, x: 1, y: 4, requiredTreePoints: 20, prerequisite: [] },
  { id: 'lasting_judgement', name: 'Lasting Judgement', rank: 3, x: 2, y: 4, requiredTreePoints: 20, prerequisite: [] },
  { id: 'holy_power', name: 'Holy Power', rank: 5, x: 1, y: 5, requiredTreePoints: 25, prerequisite: [] },
  { id: 'holy_shock', name: 'Holy Shock', rank: 1, x: 1, y: 6, requiredTreePoints: 30, prerequisite: ['holy_power'] },
]

const protection: RawTalent[] = [
  { id: 'improved_devotion_aura', name: 'Improved Devotion Aura', rank: 5, x: 0, y: 0, requiredTreePoints: 0, prerequisite: [], description: 'Increases the armor bonus provided by your Devotion Aura.' },
  { id: 'redoubt', name: 'Redoubt', rank: 5, x: 1, y: 0, requiredTreePoints: 0, prerequisite: [], description: 'Gives you a chance to gain increased Block chance after suffering a critical strike.' },
  { id: 'precision', name: 'Precision', rank: 3, x: 0, y: 1, requiredTreePoints: 5, prerequisite: [], description: 'Increases your chance to hit with melee weapons.' },
  { id: 'guardian_favor', name: "Guardian's Favor", rank: 2, x: 2, y: 1, requiredTreePoints: 5, prerequisite: [], description: 'Reduces the cooldown of Blessing of Protection and increases the duration of Blessing of Freedom.' },
  { id: 'toughness', name: 'Toughness', rank: 5, x: 0, y: 2, requiredTreePoints: 10, prerequisite: [], description: 'Increases your armor value from items.' },
  { id: 'blessing_of_kings', name: 'Blessing of Kings', rank: 1, x: 1, y: 2, requiredTreePoints: 10, prerequisite: [], description: 'Places a blessing on the friendly target, increasing all stats.' },
  { id: 'improved_hammer_of_justice', name: 'Improved Hammer of Justice', rank: 2, x: 2, y: 2, requiredTreePoints: 10, prerequisite: [], description: 'Reduces the cooldown of Hammer of Justice.' },
  { id: 'improved_concentration_aura', name: 'Improved Concentration Aura', rank: 3, x: 0, y: 3, requiredTreePoints: 15, prerequisite: [], description: 'Increases the effect of your Concentration Aura.' },
  { id: 'spell_warding', name: 'Spell Warding', rank: 5, x: 1, y: 3, requiredTreePoints: 15, prerequisite: [], description: 'Reduces all spell damage taken.' },
  { id: 'blessing_of_sanctuary', name: 'Blessing of Sanctuary', rank: 1, x: 2, y: 3, requiredTreePoints: 15, prerequisite: [], description: 'Places a blessing on the friendly target, reducing damage taken and dealing Holy damage when blocked.' },
  { id: 'reckoning', name: 'Reckoning', rank: 5, x: 1, y: 4, requiredTreePoints: 20, prerequisite: [], description: 'Gives you a chance to gain extra attacks after being critically hit.' },
  { id: 'one_handed_weapon_specialization', name: 'One-Handed Weapon Specialization', rank: 5, x: 2, y: 4, requiredTreePoints: 20, prerequisite: [], description: 'Increases damage you deal with one-handed melee weapons.' },
  { id: 'holy_shield', name: 'Holy Shield', rank: 1, x: 1, y: 5, requiredTreePoints: 25, prerequisite: ['blessing_of_sanctuary'], description: 'Increases your chance to block and deals Holy damage when you block.' },
]

const retribution: RawTalent[] = [
  { id: 'improved_blessing_of_might', name: 'Improved Blessing of Might', rank: 5, x: 0, y: 0, requiredTreePoints: 0, prerequisite: [], description: 'Increases the attack power bonus of your Blessing of Might.' },
  { id: 'benediction', name: 'Benediction', rank: 5, x: 1, y: 0, requiredTreePoints: 0, prerequisite: [], description: 'Reduces the mana cost of your Judgement and Seal spells.' },
  { id: 'improved_judgement', name: 'Improved Judgement', rank: 2, x: 1, y: 1, requiredTreePoints: 5, prerequisite: [], description: 'Reduces the cooldown of your Judgement spell.' },
  { id: 'deflection', name: 'Deflection', rank: 5, x: 2, y: 1, requiredTreePoints: 5, prerequisite: [], description: 'Increases your Parry chance.' },
  { id: 'vindication', name: 'Vindication', rank: 3, x: 0, y: 2, requiredTreePoints: 10, prerequisite: [], description: "Gives your damaging attacks a chance to reduce the target's attributes." },
  { id: 'conviction', name: 'Conviction', rank: 5, x: 1, y: 2, requiredTreePoints: 10, prerequisite: [], description: 'Increases your chance to critically hit with melee weapons.' },
  { id: 'seal_of_command', name: 'Seal of Command', rank: 1, x: 2, y: 2, requiredTreePoints: 10, prerequisite: [], description: 'Grants your attacks a chance to deal additional Holy damage.' },
  { id: 'pursuit_of_justice', name: 'Pursuit of Justice', rank: 2, x: 0, y: 3, requiredTreePoints: 15, prerequisite: [], description: 'Increases movement speed and reduces chance of being affected by movement impairing effects.' },
  { id: 'eye_for_an_eye', name: 'Eye for an Eye', rank: 2, x: 1, y: 3, requiredTreePoints: 15, prerequisite: [], description: 'Reflects a portion of critical spell damage back to the attacker.' },
  { id: 'two_handed_weapon_specialization', name: 'Two-Handed Weapon Specialization', rank: 5, x: 2, y: 3, requiredTreePoints: 15, prerequisite: [], description: 'Increases damage dealt by two-handed weapons.' },
  { id: 'sanctity_aura', name: 'Sanctity Aura', rank: 1, x: 1, y: 4, requiredTreePoints: 20, prerequisite: [], description: 'Increases Holy damage dealt by party members.' },
  { id: 'improved_seal_of_the_crusader', name: 'Improved Seal of the Crusader', rank: 3, x: 2, y: 4, requiredTreePoints: 20, prerequisite: [], description: 'Increases the attack power bonus from Seal of the Crusader.' },
  { id: 'vengeance', name: 'Vengeance', rank: 5, x: 1, y: 5, requiredTreePoints: 25, prerequisite: ['conviction'], description: 'Gives you increased damage after landing a critical strike.' },
  { id: 'repentance', name: 'Repentance', rank: 1, x: 1, y: 6, requiredTreePoints: 30, prerequisite: ['vengeance'], description: 'Puts the enemy target into a state of meditation, incapacitating them.' },
]

function toTalents(branch: Branch, raw: RawTalent[]): Talent[] {
  return raw.map((talent) => ({
    id: talent.id,
    name: talent.name,
    branch,
    maxRank: talent.rank,
    requiredTreePoints: talent.requiredTreePoints,
    prerequisite: talent.prerequisite.length ? talent.prerequisite : undefined,
    icon: BRANCH_ICON[branch],
    status: 'community',
    description: talent.description ?? PLACEHOLDER_DESCRIPTION,
    x: COLUMN_X[talent.x],
    y: TIER_Y[talent.y],
    source: DATA_SOURCES,
  }))
}

export const talents: Talent[] = [
  ...toTalents('holy', holy),
  ...toTalents('protection', protection),
  ...toTalents('retribution', retribution),
]
