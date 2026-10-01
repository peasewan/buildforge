export const GLIMMERWICK_REFERENCE = {
  checkedAt: '2026-10-01',
  releaseDate: '2026-09-30',
  released: true,
} as const

/** Only observed names are prefilled. No launch crop timing or economy value is verified. */
export const GLIMMERWICK_REVIEWED_CROPS = [{
  id: 'basil',
  name: 'Basil',
  version: 'Public Demo',
  verificationStatus: 'community_verified',
  checkedAt: '2026-10-01',
  growthDays: null,
  seasons: null,
  harvestYield: null,
  seedPrice: null,
  sources: [
    { label: 'Basil footage · 1:48', href: 'https://www.youtube.com/watch?v=dm_9ViL_soU&t=108s' },
    { label: 'Demo dialogue · 51:20', href: 'https://www.youtube.com/watch?v=EgGVHbzWVZk&t=3080s' },
    { label: 'Second Demo dialogue · 1:00:38', href: 'https://www.youtube.com/watch?v=0JmmDn6Q_Ek&t=3638s' },
  ],
}, {
  id: 'marjoram', name: 'Marjoram', version: 'Launch playthrough', verificationStatus: 'firsthand_reported', checkedAt: '2026-10-01',
  growthDays: null, seasons: null, harvestYield: null, seedPrice: null,
  sources: [{ label: 'Launch playthrough · Kotaku', href: 'https://kotaku.com/im-happily-attending-the-musical-magical-garden-school-where-no-one-is-mad-if-im-hours-late-to-class-2000738461' }],
}, {
  id: 'cranberries', name: 'Cranberries', version: 'Launch playthrough', verificationStatus: 'firsthand_reported', checkedAt: '2026-10-01',
  growthDays: null, seasons: null, harvestYield: null, seedPrice: null,
  sources: [{ label: 'Launch playthrough · Kotaku', href: 'https://kotaku.com/im-happily-attending-the-musical-magical-garden-school-where-no-one-is-mad-if-im-hours-late-to-class-2000738461' }],
}] as const

export const GLIMMERWICK_GARDEN_RULES = [
  {
    id: 'daily-watering', title: 'Check watering each day',
    description: 'The Demo garden tutorial asks you to water plants daily. It does not establish a missed-watering penalty or a growth duration.',
    version: 'Public Demo footage', verificationStatus: 'community_verified',
    sourceLabel: 'Garden tutorial · 50:47', sourceHref: 'https://www.youtube.com/watch?v=EgGVHbzWVZk&t=3047s',
  },
  {
    id: 'tilling', title: 'Song of Tilling',
    description: 'The Demo tutorial uses this song to enchant a hoe and prepare soil for sowing. Demo update 0.484 identifies it as the first song in the game.',
    version: 'Demo 0.484 / tutorial', verificationStatus: 'community_verified',
    sourceLabel: 'Developer Demo update 0.484', sourceHref: 'https://store.steampowered.com/news/app/1706510/view/711152269082494267',
    footageHref: 'https://www.youtube.com/watch?v=EgGVHbzWVZk&t=2867s',
  },
  {
    id: 'garden-well', title: 'Plan around the garden well',
    description: 'The Demo tutorial describes putting grown crops in the garden well and receiving sale proceeds overnight. Prices and yield per plant are not verified here.',
    version: 'Public Demo footage', verificationStatus: 'community_verified',
    sourceLabel: 'Garden tutorial · 50:58', sourceHref: 'https://www.youtube.com/watch?v=EgGVHbzWVZk&t=3058s',
  },
  {
    id: 'casting', title: 'Stars are not required to cast',
    description: 'Demo update 0.466 confirms that casting spells does not require earning stars in the music minigame. It does not establish a crop speed bonus.',
    version: 'Demo 0.466', verificationStatus: 'official',
    sourceLabel: 'Developer Demo update 0.466', sourceHref: 'https://store.steampowered.com/news/app/1706510/view/515239886340494123',
  },
] as const

export const GLIMMERWICK_SOURCES = [
  {
    label: 'Official Steam page',
    href: 'https://store.steampowered.com/app/1706510/?l=english',
  },
  {
    label: 'Eastshade Studios game overview',
    href: 'https://eastshade.com/songs-of-glimmerwick/',
  },
  {
    label: 'Eastshade Studios release date announcement',
    href: 'https://eastshade.com/we-have-a-release-date/',
  },
  {
    label: 'Eastshade Studios public demo announcement',
    href: 'https://eastshade.com/new-gameplay-trailer-and-public-demo-incoming/',
  },
] as const

export const GLIMMERWICK_MECHANICS = [
  {
    title: 'Music-based spellcasting',
    description: 'A flute and songbook are used to cast magic through music, with songs supporting gardening and island exploration.',
    sourceHref: 'https://eastshade.com/songs-of-glimmerwick/',
  },
  {
    title: 'Magical gardening',
    description: 'Players tend the university garden and can summon rain clouds. Songs can also enchant tools to work by themselves.',
    sourceHref: 'https://store.steampowered.com/app/1706510/?l=english',
  },
  {
    title: 'Skills chosen through experience',
    description: 'Experience lets players choose skills for gardening, trading, and special abilities such as speaking to frogs.',
    sourceHref: 'https://store.steampowered.com/app/1706510/?l=english',
  },
  {
    title: 'Classes and seasonal activities',
    description: 'The story spans a year of seasons and festivals, with classes and after-school clubs to attend.',
    sourceHref: 'https://eastshade.com/songs-of-glimmerwick/',
  },
] as const
