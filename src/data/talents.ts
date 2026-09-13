import type { Branch, TalentDefinition } from '../lib/build'

export type DataStatus = 'community' | 'unverified'

export interface Talent extends TalentDefinition {
  name: string
  description: string
  icon: string
  status: DataStatus
  x: number
  y: number
}

const commonDescription = 'Community-reported talent. Exact rank values are still being checked.'

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

export const talents: Talent[] = [
  { id: 'divine-strength', name: 'Divine Strength', branch: 'holy', tier: 0, maxRank: 5, icon: '/images/icons/paladin-shield.png', status: 'community', x: 24, y: 8, description: commonDescription },
  { id: 'spiritual-focus', name: 'Spiritual Focus', branch: 'holy', tier: 0, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'community', x: 68, y: 8, description: commonDescription },
  { id: 'healing-light', name: 'Healing Light', branch: 'holy', tier: 1, maxRank: 5, icon: '/images/icons/paladin-shield.png', status: 'community', x: 46, y: 24, description: commonDescription },
  { id: 'illumination', name: 'Illumination', branch: 'holy', tier: 2, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'community', x: 68, y: 40, requires: 'healing-light', description: commonDescription },
  { id: 'improved-blessing-wisdom', name: 'Blessing of Wisdom', branch: 'holy', tier: 3, maxRank: 5, icon: '/images/icons/paladin-shield.png', status: 'unverified', x: 25, y: 56, description: commonDescription },
  { id: 'divine-favor', name: 'Divine Favor', branch: 'holy', tier: 4, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'community', x: 47, y: 72, requires: 'illumination', description: commonDescription },
  { id: 'holy-shock', name: 'Holy Shock', branch: 'holy', tier: 5, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'unverified', x: 68, y: 88, requires: 'divine-favor', description: commonDescription },

  { id: 'redoubt', name: 'Redoubt', branch: 'protection', tier: 0, maxRank: 5, icon: '/images/icons/shield.png', status: 'community', x: 24, y: 8, description: commonDescription },
  { id: 'precision', name: 'Precision', branch: 'protection', tier: 0, maxRank: 5, icon: '/images/icons/hammer.png', status: 'community', x: 68, y: 8, description: commonDescription },
  { id: 'guardians-favor', name: "Guardian's Favor", branch: 'protection', tier: 1, maxRank: 5, icon: '/images/icons/shield.png', status: 'community', x: 46, y: 24, description: commonDescription },
  { id: 'toughness', name: 'Toughness', branch: 'protection', tier: 2, maxRank: 5, icon: '/images/icons/shield.png', status: 'community', x: 24, y: 40, requires: 'guardians-favor', description: commonDescription },
  { id: 'blessing-kings', name: 'Blessing of Kings', branch: 'protection', tier: 3, maxRank: 5, icon: '/images/icons/paladin-shield.png', status: 'unverified', x: 68, y: 56, description: commonDescription },
  { id: 'holy-shield', name: 'Holy Shield', branch: 'protection', tier: 4, maxRank: 5, icon: '/images/icons/shield.png', status: 'community', x: 46, y: 72, requires: 'toughness', description: commonDescription },
  { id: 'sanctuary', name: 'Sanctuary', branch: 'protection', tier: 5, maxRank: 5, icon: '/images/icons/paladin-shield.png', status: 'unverified', x: 68, y: 88, requires: 'holy-shield', description: commonDescription },

  { id: 'benediction', name: 'Benediction', branch: 'retribution', tier: 0, maxRank: 5, icon: '/images/icons/hammer.png', status: 'community', x: 24, y: 8, description: commonDescription },
  { id: 'deflection', name: 'Deflection', branch: 'retribution', tier: 0, maxRank: 5, icon: '/images/icons/shield.png', status: 'community', x: 68, y: 8, description: commonDescription },
  { id: 'improved-judgement', name: 'Improved Judgement', branch: 'retribution', tier: 1, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'community', x: 46, y: 24, description: commonDescription },
  { id: 'conviction', name: 'Conviction', branch: 'retribution', tier: 2, maxRank: 5, icon: '/images/icons/hammer.png', status: 'community', x: 68, y: 40, requires: 'improved-judgement', description: commonDescription },
  { id: 'seal-command', name: 'Seal of Command', branch: 'retribution', tier: 3, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'unverified', x: 24, y: 56, description: commonDescription },
  { id: 'vengeance', name: 'Vengeance', branch: 'retribution', tier: 4, maxRank: 5, icon: '/images/icons/hammer.png', status: 'community', x: 46, y: 72, requires: 'conviction', description: commonDescription },
  { id: 'repentance', name: 'Repentance', branch: 'retribution', tier: 5, maxRank: 5, icon: '/images/icons/holy-strike.png', status: 'unverified', x: 68, y: 88, requires: 'vengeance', description: commonDescription },
]
