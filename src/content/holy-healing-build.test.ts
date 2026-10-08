import { describe, expect, it } from 'vitest'
import holyContent from './holy-healing-build.json'
import protectionContent from './protection-shield-build.json'
import retributionContent from './retribution-judgment-build.json'
import retributionLevelingContent from './retribution-leveling-build.json'
import { SPEC_BUILDS_HUBS } from '../data/specBuildsHubs'
import { HOLY_HEALING_BUILD, PROTECTION_SHIELD_BUILD, RETRIBUTION_JUDGMENT_BUILD } from '../data/builds'
import { decodeBuild } from '../lib/build'
import { historicalTalents as talents } from '../data/talents'

const pages = [
  [holyContent, HOLY_HEALING_BUILD],
  [protectionContent, PROTECTION_SHIELD_BUILD],
  [retributionContent, RETRIBUTION_JUDGMENT_BUILD],
] as const

describe('prerendered build content', () => {
  it.each(pages)('contains the exact interactive build and every selected talent for $1.name', (content, example) => {
    expect(content.plannerPath).toMatch(/^\/build\?id=/)
    const encoded = new URL(content.plannerPath, 'https://buildforgetools.com').searchParams.get('id') ?? ''
    if (example.reviewStatus === 'under_review') {
      expect(content.plannerPath).toBe('/build?id=#calculator')
      expect(encoded).toBe('')
    } else {
      expect(decodeBuild(encoded, talents)).toEqual(example.build)
    }

    const expectedTalents = talents
      .filter((talent) => (example.build[talent.id] ?? 0) > 0)
      .map((talent) => `${talent.name} ${example.build[talent.id]}/${talent.maxRank}`)
    expect(content.selectedTalents).toEqual(expectedTalents)
  })

  it('keeps 51-point examples historical under the official Level 30 cap', () => {
    const protectionCopy = [protectionContent.dek, ...protectionContent.sections.flatMap((section) => section.paragraphs)].join(' ')

    expect(protectionCopy).toMatch(/historical.*51-point.*Level 30/i)
    expect(protectionCopy).not.toMatch(/dependable Protection leveling route|current 20\/31\/0 example/i)
    expect(protectionCopy).toMatch(/Redoubt.*Holy Shield.*October 1/i)
  })

  it('calls Level 20 routes starting snapshots rather than current-cap builds', () => {
    const retributionHub = SPEC_BUILDS_HUBS.find((hub) => hub.spec === 'retribution')!
    const copy = [
      ...retributionHub.editorialSections.flatMap((section) => section.paragraphs),
      ...retributionLevelingContent.sections.flatMap((section) => section.paragraphs),
      ...holyContent.sections.flatMap((section) => section.paragraphs),
    ].join(' ')

    expect(copy).toMatch(/Level 20 starting snapshot.*Level 30/i)
    expect(copy).not.toMatch(/current-cap (planning )?example|verified current data/i)
  })
})
