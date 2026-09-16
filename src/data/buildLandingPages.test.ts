import { describe, expect, it } from 'vitest'
import { BUILD_LANDING_PAGES } from './buildLandingPages'

describe('build landing page configurations', () => {
  it('defines unique, indexable Paladin build topics', () => {
    expect(new Set(BUILD_LANDING_PAGES.map((page) => page.slug)).size).toBe(BUILD_LANDING_PAGES.length)
    expect(BUILD_LANDING_PAGES.map((page) => page.slug)).toEqual([
      'wow-forever-paladin-leveling-build',
      'wow-forever-paladin-pvp-build',
      'wow-forever-paladin-raid-build',
      'wow-forever-protection-paladin-dungeon-build',
      'wow-forever-protection-paladin-leveling-build',
      'wow-forever-retribution-paladin-pvp-build',
      'wow-forever-holy-paladin-pvp-build',
    ])
  })

  it('uses the supplied role artwork and gives every page useful sections', () => {
    for (const page of BUILD_LANDING_PAGES) {
      expect(page.heroImage).toMatch(/^\/images\/hero\/.+\.webp$/)
      expect(page.summary.length).toBeGreaterThanOrEqual(3)
      expect(page.sections.length).toBeGreaterThanOrEqual(2)
    }
    expect(BUILD_LANDING_PAGES.find((page) => page.id === 'protection-dungeon')?.sections.some((section) => section.kind === 'talent-preview')).toBe(true)
  })

  it('describes every build as a preview rather than an authoritative best pick', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const copy = [page.title, page.metaTitle, page.description, page.subtitle, ...page.sections.flatMap((section) => [section.title, ...(('intro' in section && section.intro) ? [section.intro] : [])])].join(' ')
      const items = page.sections.flatMap((section) => (section.kind === 'talent-preview' ? [] : section.items)).map((item) => (typeof item === 'string' ? item : `${item.title} ${item.body}`)).join(' ')

      expect(`${copy} ${items}`, page.slug).not.toMatch(/\bbest\b/i)
    }
  })
})
