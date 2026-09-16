import { branchPoints, type Branch, type Build } from '../lib/build'
import { talents } from './talents'

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

export const PROTECTION_SHIELD_BUILD: ExampleBuild = {
  id: 'protection-shield-20-31-0',
  slug: 'wow-forever-protection-paladin-build',
  name: 'Protection Paladin Shield Build',
  allocation: '20/31/0',
  description: 'A defensive preview that reaches Holy Shield with early Holy support talents.',
  build: {
    divine_strength: 5,
    divine_intellect: 5,
    healing_light: 3,
    spiritual_focus: 2,
    improved_seals: 3,
    unyielding_faith: 2,
    toughness: 5,
    redoubt: 5,
    precision: 3,
    guardian_s_favor: 2,
    anticipation: 5,
    improved_righteous_fury: 3,
    shield_specialization: 3,
    sacred_duty: 2,
    one_handed_weapon_specialization: 1,
    templar_s_bulwark: 1,
    holy_shield: 1,
  },
}

export const RETRIBUTION_JUDGMENT_BUILD: ExampleBuild = {
  id: 'retribution-judgment-0-20-31',
  slug: 'wow-forever-retribution-paladin-build',
  name: 'Retribution Paladin Judgment Build',
  allocation: '0/20/31',
  description: 'An offensive preview that reaches Twist of Light with early Protection utility.',
  build: {
    toughness: 5,
    redoubt: 5,
    precision: 3,
    guardian_s_favor: 2,
    anticipation: 5,
    deflection: 5,
    benediction: 5,
    improved_judgement: 2,
    holy_conduit: 2,
    conviction: 5,
    sanctified_judgement: 3,
    seal_of_command: 1,
    pursuit_of_justice: 2,
    sacred_arbiter: 1,
    crusade: 2,
    two_handed_weapon_specialization: 1,
    vengeance: 1,
    twist_of_light: 1,
  },
}

export const RETRIBUTION_LEVELING_BUILD: ExampleBuild = {
  id: 'retribution-leveling-20-0-31',
  slug: 'wow-forever-retribution-paladin-leveling-build',
  name: 'Retribution Paladin Leveling Build',
  allocation: '20/0/31',
  description: 'A solo-leveling Retribution preview that reaches Twist of Light with early Holy support.',
  build: {
    divine_strength: 5,
    divine_intellect: 5,
    healing_light: 3,
    spiritual_focus: 2,
    improved_seals: 3,
    unyielding_faith: 2,
    deflection: 5,
    benediction: 5,
    improved_judgement: 2,
    holy_conduit: 2,
    conviction: 5,
    sanctified_judgement: 3,
    seal_of_command: 1,
    pursuit_of_justice: 2,
    sacred_arbiter: 1,
    crusade: 2,
    two_handed_weapon_specialization: 1,
    vengeance: 1,
    twist_of_light: 1,
  },
}

export const EXAMPLE_BUILDS = [
  HOLY_HEALING_BUILD,
  PROTECTION_SHIELD_BUILD,
  RETRIBUTION_JUDGMENT_BUILD,
  RETRIBUTION_LEVELING_BUILD,
] as const

export type ExampleBuildId = (typeof EXAMPLE_BUILDS)[number]['id']

export function exampleBuildById(id: ExampleBuildId): ExampleBuild {
  return EXAMPLE_BUILDS.find((build) => build.id === id) ?? HOLY_HEALING_BUILD
}

/**
 * The tree an example build actually spends most of its points in. Derived from the
 * allocation rather than declared alongside it, so a page cannot display one
 * specialization's tree while its configuration claims another.
 */
export function specializationOfBuild(example: ExampleBuild): Branch {
  return (['holy', 'protection', 'retribution'] as const).reduce((deepest, branch) =>
    branchPoints(example.build, branch, talents) > branchPoints(example.build, deepest, talents) ? branch : deepest,
  )
}
