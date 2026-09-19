import { describe, expect, it } from 'vitest'
import {
  canIncrement,
  decrementTalent,
  decodeBuild,
  encodeBuild,
  getTalentLockReason,
  incrementTalent,
  type Build,
  type TalentDefinition,
} from './build'

const talents: TalentDefinition[] = [
  { id: 'root', branch: 'holy', requiredTreePoints: 0, maxRank: 5 },
  { id: 'focus', branch: 'holy', requiredTreePoints: 5, maxRank: 3 },
  { id: 'crown', branch: 'holy', requiredTreePoints: 10, maxRank: 1, prerequisite: [{ talentId: 'focus', requiredRank: null }] },
  { id: 'guard', branch: 'protection', requiredTreePoints: 0, maxRank: 5 },
  { id: 'filler', branch: 'holy', requiredTreePoints: 0, maxRank: 5 },
]

describe('talent allocation', () => {
  it('blocks a higher tier until five points are spent in its branch', () => {
    expect(canIncrement({}, talents[1], talents)).toBe(false)
    expect(canIncrement({ root: 5 }, talents[1], talents)).toBe(true)
  })

  it('explains how many branch points a locked tier still needs', () => {
    expect(getTalentLockReason({ root: 2 }, talents[1], talents)).toEqual({
      type: 'branch-points',
      current: 2,
      required: 5,
    })
  })

  it('explains which prerequisite rank is missing after the tier is unlocked', () => {
    expect(getTalentLockReason({ root: 5, filler: 3, focus: 2 }, talents[2], talents)).toEqual({
      type: 'prerequisite',
      talentId: 'focus',
      current: 2,
      required: 3,
    })
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

  it('uses a max-rank fallback when the client does not specify the prerequisite rank', () => {
    const linked = { ...talents[2], requiredTreePoints: 0 }
    expect(canIncrement({ root: 5, focus: 2 }, linked, talents)).toBe(false)
    expect(canIncrement({ root: 5, focus: 3 }, linked, talents)).toBe(true)
  })

  it('honors an explicit prerequisite rank when a future source confirms one', () => {
    const explicit = { ...talents[2], requiredTreePoints: 0, prerequisite: [{ talentId: 'focus', requiredRank: 2 }] }
    expect(canIncrement({ root: 5, focus: 2 }, explicit, talents)).toBe(true)
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
      { id: 'divine-strength', branch: 'holy', requiredTreePoints: 0, maxRank: 5 },
      { id: 'healing-light', branch: 'holy', requiredTreePoints: 5, maxRank: 5 },
    ]
    const code = encodeBuild({ 'divine-strength': 5, 'healing-light': 1 })

    expect(decodeBuild(code, hyphenatedTalents)).toEqual({
      'divine-strength': 5,
      'healing-light': 1,
    })
  })
})
