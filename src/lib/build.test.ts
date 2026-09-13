import { describe, expect, it } from 'vitest'
import {
  canIncrement,
  decrementTalent,
  decodeBuild,
  encodeBuild,
  incrementTalent,
  type Build,
  type TalentDefinition,
} from './build'

const talents: TalentDefinition[] = [
  { id: 'root', branch: 'holy', tier: 0, maxRank: 5 },
  { id: 'focus', branch: 'holy', tier: 1, maxRank: 3 },
  { id: 'crown', branch: 'holy', tier: 2, maxRank: 1, requires: 'focus' },
  { id: 'guard', branch: 'protection', tier: 0, maxRank: 5 },
]

describe('talent allocation', () => {
  it('blocks a higher tier until five points are spent in its branch', () => {
    expect(canIncrement({}, talents[1], talents)).toBe(false)
    expect(canIncrement({ root: 5 }, talents[1], talents)).toBe(true)
  })

  it('caps a talent at its maximum rank and the whole build at 51 points', () => {
    expect(incrementTalent({ root: 5 }, talents[0], talents)).toEqual({ root: 5 })

    const fullBuild: Build = { root: 5, focus: 3, crown: 1, guard: 42 }
    expect(incrementTalent(fullBuild, talents[1], talents)).toEqual(fullBuild)
  })

  it('removing a prerequisite also clears descendants that become invalid', () => {
    const build = { root: 5, focus: 3, crown: 1 }
    expect(decrementTalent(build, talents[1], talents)).toEqual({ root: 5, focus: 2 })
  })
})

describe('share codes', () => {
  it('round-trips a build with a compact stable code', () => {
    const build = { root: 5, focus: 2, guard: 1 }
    const code = encodeBuild(build)
    expect(code).toBe('focus.2~guard.1~root.5')
    expect(decodeBuild(code, talents)).toEqual(build)
  })

  it('ignores malformed, unknown, zero, and over-cap ranks', () => {
    expect(decodeBuild('root.99~focus.nope~unknown.3~guard.0', talents)).toEqual({ root: 5 })
  })

  it('preserves talent ids that contain hyphens', () => {
    const hyphenatedTalents: TalentDefinition[] = [
      { id: 'divine-strength', branch: 'holy', tier: 0, maxRank: 5 },
      { id: 'healing-light', branch: 'holy', tier: 1, maxRank: 5 },
    ]
    const code = encodeBuild({ 'divine-strength': 5, 'healing-light': 1 })

    expect(decodeBuild(code, hyphenatedTalents)).toEqual({
      'divine-strength': 5,
      'healing-light': 1,
    })
  })
})
