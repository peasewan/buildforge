export const th19ReleaseNotes = 'https://supercell.com/en/games/clashofclans/blog/release-notes/the-clash-of-titans-update-is-rolling-out/'
export const clanWarRules = 'https://support.supercell.com/clash-of-clans/en/articles/participating-in-a-clan-war.html'
export const friendlyChallengeRules = 'https://support.supercell.com/clash-of-clans/en/articles/friendly-challenges-3.html'
export const warLayoutReviewDate = '2026-11-22'

export const defenseGoals = {
  'anti-three': 'Anti 3-star',
  'anti-two': 'Anti 2-star',
} as const

export type DefenseGoal = keyof typeof defenseGoals

export interface WarLayout {
  id: string
  name: string
  goals: readonly DefenseGoal[]
  note: string
  defenderTip: string
  publisher: string
  source: string
  published: string
  importUrl: string
}

// The links are publisher-shared TH19:WB links. Browser responses cannot attest to an in-game import.
export const warLayouts: readonly WarLayout[] = [
  {
    id: 'compartment-war',
    name: 'Compartment war base',
    goals: ['anti-three'],
    note: 'Small compartments break up the route to the core. Try a ground attack through the middle to see how much time the extra walls buy.',
    defenderTip: 'Start with Barbarian Hall and compare Wizard Hall if unlocked. Keep the ground army and entry point fixed.',
    publisher: 'Rocky on ClashBuilder',
    source: 'https://clashbuilder.com/town-hall-bases/th19/war/th19-anti-3-star-war-base-strong-defensive-layout-with-com-3971',
    published: '2026-11-21',
    importUrl: 'https://link.clashofclans.com/en/?action=OpenLayout&id=TH19%3AWB%3AAAAAKAAAAAK-l0BscRCZaEZKvK2h1Z4n',
  },
  {
    id: 'cwl-255',
    name: 'Layered CWL base',
    goals: ['anti-three'],
    note: 'Try this layered layout when practicing for CWL. Start with two attack entries and see which one leaves the most defenses standing late.',
    defenderTip: 'Use your usual Hall defender for the first run. Try Wizard Hall in a repeat challenge with the same league modifier if unlocked.',
    publisher: 'Clash with Kash · #255',
    source: 'https://clashwithkash.com/base/255',
    published: '2026-11-20',
    importUrl: 'https://link.clashofclans.com/en/?action=OpenLayout&id=TH19%3AWB%3AAAAAQwAAAAJUn8iJID7NOAkm6GTTiOwx',
  },
  {
    id: 'air-defense-box',
    name: 'Anti-air box base',
    goals: ['anti-three', 'anti-two'],
    note: 'The builder tags this box layout for air defense. Run a Dragon attack from each side of the box and watch how early attackers reach the Hall.',
    defenderTip: 'Start with Archer Hall if unlocked. Compare it with your current defender against the same air army.',
    publisher: 'Raazace Maharjan on ClashLy',
    source: 'https://clashly.app/layout/jNPnDQ6BMY',
    published: '2026-11-20',
    importUrl: 'https://link.clashofclans.com/en/?action=OpenLayout&id=TH19%3AWB%3AAAAAQwAAAAJUvUY0sNvoDpl8NyYc4676',
  },
  {
    id: 'war-251',
    name: 'Anti 2-star clan war base',
    goals: ['anti-two', 'anti-three'],
    note: 'This layout is tagged for both star goals. Test it first against an attack built to secure the Town Hall and 50% destruction.',
    defenderTip: 'Start with Barbarian Hall. If the Hall falls consistently, compare Archer or Wizard Hall once unlocked and record the time it falls.',
    publisher: 'Clash with Kash · #251',
    source: 'https://clashwithkash.com/base/251',
    published: '2026-11-18',
    importUrl: 'https://link.clashofclans.com/en/?action=OpenLayout&id=TH19%3AWB%3AAAAAEwAAAALb0fMgC_AJwJNvCWw0gQP5',
  },
]
