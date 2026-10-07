export type CoopState = { version: 'demo' | 'early-access'; players: number; issue: 'planning' | 'join' }
export const DEFAULT_COOP: CoopState = { version: 'demo', players: 4, issue: 'planning' }
export const releaseNotice = 'Scheduled by the publisher: October 8, 2026 at 08:00 UTC / 16:00 Beijing / 17:00 Japan. Early Access support is announced, not independently play-tested here. Last checked October 7, 2026.'
export function parseCoop(hash: string): CoopState {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const version = params.get('version'), issue = params.get('issue'), players = Number(params.get('players'))
  if ((version !== 'demo' && version !== 'early-access') || (issue !== 'planning' && issue !== 'join') || !Number.isInteger(players) || players < 1 || players > 6) return { ...DEFAULT_COOP }
  return { version, issue, players }
}
export function shareCoop(state: CoopState) {
  return `#${new URLSearchParams({ version: state.version, players: String(state.players), issue: state.issue })}`
}
export function checkParty(state: CoopState) {
  const limit = state.version === 'demo' ? 4 : 6
  const overLimit = state.players > limit
  const title = overLimit ? `${state.players} players exceed the Demo limit` : state.version === 'demo' ? `${state.players} ${state.players === 1 ? 'player fits' : 'players fit'} the Demo limit` : `${state.players} players fit the announced Early Access limit`
  const detail = overLimit ? `The Demo supports up to ${limit} players including the host. A group of ${state.players} needs to split into smaller groups or use a version that supports the whole group.` : state.issue === 'join' ? 'The player-count limit does not explain this join failure. This check cannot diagnose lobby, version mismatch, service or connection problems.' : 'Your group fits the published player-count rule. This checks capacity only; it does not guarantee a successful connection.'
  return { limit, overLimit, title, detail }
}
