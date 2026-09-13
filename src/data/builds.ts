import type { Build } from '../lib/build'

export interface ExampleBuild {
  id: string
  slug: string
  name: string
  allocation: string
  description: string
  build: Build
}

export const HOLY_HEALING_BUILD: ExampleBuild = {
  id: 'holy-healing-31-20-0',
  slug: 'wow-forever-paladin-build',
  name: 'Holy Paladin Healing Build',
  allocation: '31/20/0',
  description: "A healing-focused preview with Holy Shock, Light's Vigil, and early Protection utility.",
  build: {
    divine_strength: 5,
    divine_intellect: 5,
    healing_light: 3,
    spiritual_focus: 2,
    improved_seals: 3,
    unyielding_faith: 2,
    reverence: 3,
    purifying_power: 2,
    illumination: 4,
    holy_shock: 1,
    light_s_vigil: 1,
    toughness: 5,
    redoubt: 5,
    precision: 3,
    guardian_s_favor: 2,
    anticipation: 5,
  },
}
