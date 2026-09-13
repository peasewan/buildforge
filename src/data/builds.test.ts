import { describe, expect, it } from 'vitest'
import { branchPoints, incrementTalent, totalPoints, type Build } from '../lib/build'
import { EXAMPLE_BUILDS, HOLY_HEALING_BUILD, PROTECTION_SHIELD_BUILD, RETRIBUTION_JUDGMENT_BUILD } from './builds'
import { talents } from './talents'

describe('example builds', () => {
  it.each([
    [HOLY_HEALING_BUILD, [31, 20, 0]],
    [PROTECTION_SHIELD_BUILD, [20, 31, 0]],
    [RETRIBUTION_JUDGMENT_BUILD, [0, 20, 31]],
  ] as const)('provides a legal 51-point $name', (example, expectedAllocation) => {
    let allocated: Build = {}

    for (const talent of talents) {
      const targetRank = example.build[talent.id] ?? 0
      for (let rank = 0; rank < targetRank; rank += 1) {
        allocated = incrementTalent(allocated, talent, talents)
      }
    }

    expect(allocated).toEqual(example.build)
    expect(totalPoints(allocated)).toBe(51)
    expect([
      branchPoints(allocated, 'holy', talents),
      branchPoints(allocated, 'protection', talents),
      branchPoints(allocated, 'retribution', talents),
    ]).toEqual(expectedAllocation)
  })

  it('gives the example build a stable public page slug', () => {
    const publicBuild = HOLY_HEALING_BUILD as typeof HOLY_HEALING_BUILD & { slug?: string }

    expect(publicBuild.slug).toBe('wow-forever-paladin-build')
    expect(HOLY_HEALING_BUILD.name).toBe('Holy Paladin Healing Build')
    expect(HOLY_HEALING_BUILD.allocation).toBe('31/20/0')
    expect(EXAMPLE_BUILDS.map((build) => build.slug)).toEqual([
      'wow-forever-paladin-build',
      'wow-forever-protection-paladin-build',
      'wow-forever-retribution-paladin-build',
    ])
  })
})
