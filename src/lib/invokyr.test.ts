import { describe, expect, it } from 'vitest'
import { checkParty, parseCoop, shareCoop, releaseNotice } from './invokyr'

describe('Invokyr version rules', () => {
  it('checks all six party sizes against the correct version', () => {
    for (let players = 1; players <= 6; players++) {
      expect(checkParty({ version: 'demo', players, issue: 'join' }).overLimit).toBe(players > 4)
      expect(checkParty({ version: 'early-access', players, issue: 'planning' }).overLimit).toBe(false)
    }
  })
  it('does not promise to fix join failures within the limit', () => {
    expect(checkParty({ version: 'demo', players: 3, issue: 'join' }).detail).toContain('does not explain')
  })
  it('round trips shared state and rejects invalid fragments', () => {
    const state = { version: 'early-access', players: 6, issue: 'join' } as const
    expect(parseCoop(shareCoop(state))).toEqual(state)
    for (const hash of ['#players=0', '#players=NaN', '#players=2.5', '#players=999', '#version=hack&spoilers=1']) {
      expect(parseCoop(hash)).toEqual({ version: 'demo', players: 4, issue: 'planning' })
    }
  })
  it('never promotes a release schedule to verification as time passes', () => {
    expect(releaseNotice).toContain('Scheduled')
    expect(releaseNotice).toContain('not independently play-tested')
  })
})
