import { afterEach, describe, expect, it, vi } from 'vitest'
import { encodeBuild } from './build'
import {
  claimBuildCompletion,
  loadClaimedBuildCompletions,
  saveClaimedBuildCompletions,
} from './buildCompletion'

describe('claimBuildCompletion', () => {
  it('claims a manually completed 51-point build once per session', () => {
    const completedBuilds = new Set<string>()
    const before = { first: 50 }
    const complete = { first: 50, final: 1 }

    expect(claimBuildCompletion(before, complete, completedBuilds)).toBe(true)
    expect(claimBuildCompletion(before, complete, completedBuilds)).toBe(false)
  })

  it('does not claim an incomplete or already-complete transition', () => {
    const completedBuilds = new Set<string>()

    expect(claimBuildCompletion({ first: 49 }, { first: 50 }, completedBuilds)).toBe(false)
    expect(claimBuildCompletion({ first: 51 }, { first: 51 }, completedBuilds)).toBe(false)
  })

  it('persists claimed builds for the current browser session', () => {
    let stored: string | null = null
    const storage = {
      getItem: () => stored,
      setItem: (_key: string, value: string) => { stored = value },
    }
    const complete = { first: 50, final: 1 }
    const firstPage = loadClaimedBuildCompletions(storage)

    expect(claimBuildCompletion({ first: 50 }, complete, firstPage)).toBe(true)
    saveClaimedBuildCompletions(firstPage, storage)

    const refreshedPage = loadClaimedBuildCompletions(storage)
    expect(claimBuildCompletion({ first: 50 }, complete, refreshedPage)).toBe(false)
  })
})


describe('completion context', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses the active level budget and isolates classes and modes', () => {
    const claimed = new Set<string>()
    const before = { first: 10 }
    const next = { first: 10, final: 1 }
    const context = { classId: 'hunter', level: 20, pointCap: 11 }
    expect(claimBuildCompletion(before, next, claimed, context)).toBe(true)
    expect(claimBuildCompletion(before, next, claimed, context)).toBe(false)
    expect(claimBuildCompletion(before, next, claimed, { ...context, classId: 'mage' })).toBe(true)
    expect(claimBuildCompletion(before, next, claimed, { ...context, level: 30, pointCap: 21 })).toBe(false)
    expect(claimBuildCompletion({ first: 20 }, { first: 20, final: 1 }, claimed, { ...context, level: 30, pointCap: 21 })).toBe(true)
  })

  it('retains legacy Paladin deduplication when context is added', () => {
    const before = { first: 50 }
    const next = { first: 50, final: 1 }
    const claimed = new Set([encodeBuild(next)])
    expect(claimBuildCompletion(before, next, claimed, { classId: 'paladin', level: 60, pointCap: 51 })).toBe(false)
    expect(claimBuildCompletion(before, next, claimed)).toBe(false)
  })

  it('persists the class and level claims across a page refresh', () => {
    let data: string | null = null
    const storage = { getItem: () => data, setItem: (_key: string, value: string) => { data = value } }
    const context = { classId: 'warrior', level: 20, pointCap: 11 }
    const claimed = loadClaimedBuildCompletions(storage)
    expect(claimBuildCompletion({ first: 10 }, { first: 11 }, claimed, context)).toBe(true)
    saveClaimedBuildCompletions(claimed, storage)
    expect(claimBuildCompletion({ first: 10 }, { first: 11 }, loadClaimedBuildCompletions(storage), context)).toBe(false)
  })

  it('does not break building when access to sessionStorage itself is blocked', () => {
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => { throw new Error('Blocked') })
    expect(() => loadClaimedBuildCompletions()).not.toThrow()
    expect(() => saveClaimedBuildCompletions(new Set(['example']))).not.toThrow()
  })
})
