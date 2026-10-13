import type { Build } from '../lib/build'

/** Numerical allocation transcribed from the cited guide, not imported as client facts. */
export const RET_TWIST_REFERENCE = {
  id: 'mobalytics-ret-twist-13-0-38',
  name: 'Retribution · Twist of Light',
  allocation: '13/0/38',
  level: 60,
  dataset: 'wow_forever_beta_1.60.1.70245',
  verification: 'community_verified',
  reviewedAt: '2026-10-13',
  source: {
    label: 'Mobalytics allocation source',
    url: 'https://mobalytics.gg/wow-forever/classes/retribution-paladin-guide',
    locator: 'Talents · 51 / 51 · 13/0/38; selected ranks captured October 13, 2026',
  },
  build: {
    divine_intellect: 5,
    spiritual_focus: 2,
    improved_seals: 3,
    reverence: 3,
    deflection: 2,
    benediction: 5,
    improved_judgement: 2,
    holy_conduit: 2,
    conviction: 5,
    vindication: 3,
    sanctified_judgement: 3,
    seal_of_command: 1,
    pursuit_of_justice: 2,
    sacred_arbiter: 1,
    two_handed_weapon_specialization: 3,
    vengeance: 3,
    champion_of_the_light: 3,
    instrument_of_law: 2,
    twist_of_light: 1,
  } satisfies Build,
} as const
