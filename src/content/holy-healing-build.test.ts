import { describe, expect, it } from 'vitest'
import holyContent from './holy-healing-build.json'
import protectionContent from './protection-shield-build.json'
import retributionContent from './retribution-judgment-build.json'
import { HOLY_HEALING_BUILD, PROTECTION_SHIELD_BUILD, RETRIBUTION_JUDGMENT_BUILD } from '../data/builds'
import { decodeBuild } from '../lib/build'
import { talents } from '../data/talents'

const pages = [
  [holyContent, HOLY_HEALING_BUILD],
  [protectionContent, PROTECTION_SHIELD_BUILD],
  [retributionContent, RETRIBUTION_JUDGMENT_BUILD],
] as const

describe('prerendered build content', () => {
  it.each(pages)('contains the exact interactive build and every selected talent for $1.name', (content, example) => {
    expect(content.plannerPath).toMatch(/^\/build\?id=/)
    const encoded = new URLSearchParams(content.plannerPath.split('?')[1]).get('id') ?? ''
    expect(decodeBuild(encoded, talents)).toEqual(example.build)

    const expectedTalents = talents
      .filter((talent) => (example.build[talent.id] ?? 0) > 0)
      .map((talent) => `${talent.name} ${example.build[talent.id]}/${talent.maxRank}`)
    expect(content.selectedTalents).toEqual(expectedTalents)
  })
})
