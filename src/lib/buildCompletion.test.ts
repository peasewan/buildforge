import { describe, expect, it } from 'vitest'
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
