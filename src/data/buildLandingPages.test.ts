import { describe, expect, it } from 'vitest'
import { BUILD_LANDING_PAGES } from './buildLandingPages'

describe('build landing page configurations', () => {
  it('defines four unique, indexable Paladin build topics', () => {
    expect(BUILD_LANDING_PAGES).toHaveLength(4)
    expect(new Set(BUILD_LANDING_PAGES.map((page) => page.slug)).size).toBe(4)
    expect(BUILD_LANDING_PAGES.map((page) => page.slug)).toEqual([
      'wow-forever-paladin-leveling-build',
      'wow-forever-paladin-pvp-build',
      'wow-forever-paladin-raid-build',
      'wow-forever-protection-paladin-dungeon-build',
    ])
  })

  it('uses the supplied role artwork and gives every page useful sections', () => {
    for (const page of BUILD_LANDING_PAGES) {
      expect(page.heroImage).toMatch(/^\/images\/hero\/.+\.webp$/)
      expect(page.summary.length).toBeGreaterThanOrEqual(3)
      expect(page.sections.length).toBeGreaterThanOrEqual(2)
    }
    expect(BUILD_LANDING_PAGES.at(-1)?.sections.some((section) => section.kind === 'talent-preview')).toBe(true)
  })
})
