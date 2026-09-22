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
      'wow-forever-protection-paladin-pvp-build',
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

  it('gives every page a way to reach sibling builds', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const related = page.sections.find((section) => section.kind === 'related')

      expect(related, `${page.slug} has no related section`).toBeTruthy()
      expect(page.sections.filter((section) => section.kind === 'related')).toHaveLength(1)
    }
  })

  it('describes every build as a preview rather than an authoritative best pick', () => {
    for (const page of BUILD_LANDING_PAGES) {
      const copy = [page.title, page.metaTitle, page.description, page.subtitle, ...page.sections.flatMap((section) => [section.title, ...(('intro' in section && section.intro) ? [section.intro] : [])])].join(' ')
      const items = page.sections.flatMap((section) => (section.kind === 'talent-preview' || section.kind === 'copy' ? [] : section.items)).map((item) => (typeof item === 'string' ? item : `${item.title} ${item.body}`)).join(' ')

      expect(`${copy} ${items}`, page.slug).not.toMatch(/\bbest\b/i)
    }
  })

  it.each(['leveling', 'pvp', 'raid', 'protection-pvp', 'retribution-pvp', 'holy-pvp'] as const)(
    'gives the %s landing page its own editorial explanation',
    (pageId) => {
      const page = BUILD_LANDING_PAGES.find((candidate) => candidate.id === pageId)!
      const editorial = page.sections.filter((section) => (section as { kind: string }).kind === 'copy') as unknown as { title: string; paragraphs: string[] }[]

      expect(editorial.length).toBeGreaterThanOrEqual(2)
      expect(editorial.every((section) => section.paragraphs.length >= 2)).toBe(true)
      expect(new Set(editorial.map((section) => section.title)).size).toBe(editorial.length)
    },
  )
})
