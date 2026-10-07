export type InvokyrPageId = 'home' | 'multiplayer' | 'ending'
export const INVOKYR_PAGES = [
  { id: 'home', path: '/invokyr', title: 'Invokyr Companion — Co-op & Demo Ending Tools | BuildForgeTools', h1: 'Invokyr Companion', description: 'Check your Invokyr party size by version, or troubleshoot the Demo ending with spoiler controls and source-linked developer guidance.' },
  { id: 'multiplayer', path: '/invokyr-multiplayer', title: 'Invokyr Co-op Checker — How Many Players? | BuildForgeTools', h1: 'Invokyr Co-op Checker', description: 'Can five players join Invokyr? Check the 4-player Demo limit against announced 6-player Early Access support, with version-specific answers.' },
  { id: 'ending', path: '/invokyr-how-to-win', title: 'Invokyr How to Win — Demo Ending Troubleshooter | BuildForgeTools', h1: 'Invokyr Demo Ending Troubleshooter', description: 'Stuck at the Invokyr Demo ending? Reveal a source-linked developer hint, separate player suggestions, and track the step where you are stuck.' },
] as const

export interface InvokyrEvidence {
  id: string
  appliesTo: 'Demo' | 'Early Access'
  evidence: 'Official' | 'Developer reply' | 'Community report'
  url: string
  sourceDate: string | null
  checked: string
  label: string
}
export const INVOKYR_EVIDENCE: Record<string, InvokyrEvidence> = {
  demo: { id: 'demo', appliesTo: 'Demo', evidence: 'Official', url: 'https://store.steampowered.com/app/4704030/', sourceDate: null, checked: '2026-10-07', label: 'Steam Demo store — up to four players' },
  release: { id: 'release', appliesTo: 'Early Access', evidence: 'Official', url: 'https://game.shochiku.co.jp/news/a-6-player-cooperative-survival-horror-game-invokyr-early-access-release-set-for-thursday-october-8th/', sourceDate: '2026-10-02', checked: '2026-10-07', label: 'Shochiku Games — release schedule and six-player co-op' },
  ending: { id: 'ending', appliesTo: 'Demo', evidence: 'Developer reply', url: 'https://steamcommunity.com/app/3883570/discussions/0/569289127298646828/', sourceDate: '2026-06-14', checked: '2026-10-07', label: 'Ludogram developer reply — Demo ending' },
  voice: { id: 'voice', appliesTo: 'Demo', evidence: 'Community report', url: 'https://steamcommunity.com/app/3883570/discussions/0/569289127298646828/', sourceDate: '2026-06-15', checked: '2026-10-07', label: 'Player reply — voice-input suggestion (not developer verified)' },
}

// Prepared for reviewed records only. Not mounted on a public route until useful records exist.
export interface InvokyrLookupRecord {
  id: string
  name: string
  kind: 'dice' | 'monster'
  description: string
  evidence: InvokyrEvidence
}
export const INVOKYR_LOOKUP: InvokyrLookupRecord[] = []
