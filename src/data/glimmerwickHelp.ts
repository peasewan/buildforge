export const GLIMMERWICK_PATCH_REVIEW = {
  reviewedAt: '2026-10-07',
  version: '1.03',
  source: 'https://steamcommunity.com/games/1706510/announcements/detail/680763661892976649',
  previousSource: 'https://steamcommunity.com/games/1706510/announcements/detail/680763027479332635',
} as const

export interface GlimmerwickHelpChoice {
  id: string
  label: string
  title: string
  evidence: string
  action: string
  version: string
  source: string
  sourceLabel: string
  nextHref?: string
  nextLabel?: string
}

export const SPELLCASTING_HELP: readonly GlimmerwickHelpChoice[] = [
  {
    id: 'short-song', label: 'No practice version', title: 'Some spells only need the short song',
    evidence: 'Version 1.03 clarifies that some songs, including Alchemical Resonance, have no practice version. They use only the short song.',
    action: 'Check the song’s in-game description before looking for a longer practice performance. A missing practice option does not by itself mean the spell is broken.',
    version: 'Release 1.03 · developer note', source: GLIMMERWICK_PATCH_REVIEW.source, sourceLabel: 'Developer update 1.03',
  },
  {
    id: 'stars', label: 'I cannot earn stars', title: 'Check casting separately from your score',
    evidence: 'Demo 0.466 says performance stars are not required for casting. This is Demo evidence, not a fresh test of every release spell.',
    action: 'Try the casting prompt for a learned song. For the rhythm challenge, check the minigame’s help options rather than treating a perfect score as an unlock.',
    version: 'Demo 0.466 · developer note', source: 'https://store.steampowered.com/news/app/1706510/view/515239886340494123', sourceLabel: 'Demo update 0.466',
  },
  {
    id: 'tilling', label: 'Starting Song of Tilling', title: 'Follow the garden lesson and your current objective',
    evidence: 'The public Demo tutorial shows Song of Tilling enchanting a hoe to prepare soil. It does not verify every launch control or a crop-growth bonus.',
    action: 'Check the song you have learned and the current garden assignment. If the issue is a missing watering can, use the garden-well help below.',
    version: 'Public Demo · tutorial footage', source: 'https://www.youtube.com/watch?v=EgGVHbzWVZk&t=2867s', sourceLabel: 'Garden tutorial · 47:47',
    nextHref: '/songs-of-glimmerwick-garden-well#garden-well-help', nextLabel: 'Garden tools and well help',
  },
  {
    id: 'unknown', label: 'Something else', title: 'Check the song and version before changing your plan',
    evidence: 'There is not enough verified information here to diagnose every song, unlock or control issue.',
    action: 'Note the song name, quest objective, input device and installed version. Check the in-game prompt and developer notes; if the issue remains, include those details in a bug report.',
    version: 'Release notes reviewed Oct 7, 2026', source: GLIMMERWICK_PATCH_REVIEW.source, sourceLabel: 'Developer update 1.03',
  },
]

export const GARDEN_WELL_HELP: readonly GlimmerwickHelpChoice[] = [
  {
    id: 'reserve', label: 'What should I keep?', title: 'Reserve your quest items before estimating a sale',
    evidence: 'A launch walkthrough describes the well as a selling point. It is not temporary item storage. This planner has no verified list of every quest requirement.',
    action: 'Read your active journal objectives, enter the amount you want to reserve under Keep, and only plan a sale for the remainder. Recheck the reserve as your quests change.',
    version: 'Launch walkthrough · community reference', source: 'https://intoindiegames.com/walkthroughs/songs-of-glimmerwick-prologue-walkthrough/', sourceLabel: 'Launch well walkthrough',
    nextHref: '#well-tool', nextLabel: 'Update my sell plan',
  },
  {
    id: 'watering-can', label: 'Missing watering can', title: 'Check behind the well, then visit Kavita',
    evidence: 'The 1.03 notes describe watering cans accidentally thrown behind the well and add replacement cans to Kavita’s shop.',
    action: 'Inspect the ground behind the well. If you still need a replacement, check your installed version and visit Kavita. The patch does not describe a general buyback service for sold items.',
    version: 'Release 1.03 · developer note', source: GLIMMERWICK_PATCH_REVIEW.source, sourceLabel: 'Developer update 1.03',
  },
  {
    id: 'cannot-sell', label: 'Item will not sell', title: 'Some items cannot be sold',
    evidence: 'Version 1.02 made mountain bees non-sellable. An item that cannot be sold should not be counted as expected well income.',
    action: 'Check the item in your current game. Remove it from this ledger or set Keep equal to Owned to exclude it from proceeds. A typed price here never proves that an item is sellable.',
    version: 'Release 1.02 · developer note', source: GLIMMERWICK_PATCH_REVIEW.previousSource, sourceLabel: 'Developer update 1.02',
    nextHref: '#well-tool', nextLabel: 'Review my sell plan',
  },
]
