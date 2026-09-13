import { describe, expect, it } from 'vitest'
import { branchPoints, incrementTalent, totalPoints, type Build } from '../lib/build'
import { HOLY_HEALING_BUILD } from './builds'
import { talents } from './talents'

describe('example builds', () => {
  it('provides a legal 31/20/0 Holy Paladin healing build', () => {
    let allocated: Build = {}

    for (const talent of talents) {
      const targetRank = HOLY_HEALING_BUILD.build[talent.id] ?? 0
      for (let rank = 0; rank < targetRank; rank += 1) {
        allocated = incrementTalent(allocated, talent, talents)
      }
    }

    expect(allocated).toEqual(HOLY_HEALING_BUILD.build)
    expect(totalPoints(allocated)).toBe(51)
    expect([
      branchPoints(allocated, 'holy', talents),
      branchPoints(allocated, 'protection', talents),
      branchPoints(allocated, 'retribution', talents),
    ]).toEqual([31, 20, 0])
  })

  it('gives the example build a stable public page slug', () => {
    const publicBuild = HOLY_HEALING_BUILD as typeof HOLY_HEALING_BUILD & { slug?: string }

    expect(publicBuild.slug).toBe('wow-forever-paladin-build')
    expect(HOLY_HEALING_BUILD.name).toBe('Holy Paladin Healing Build')
    expect(HOLY_HEALING_BUILD.allocation).toBe('31/20/0')
  })
})
