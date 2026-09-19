import { describe, expect, it } from 'vitest'
import { EMBERVILLE_MECHANICS, EMBERVILLE_PAGES, EMBERVILLE_SOURCES, EMBERVILLE_STATUS } from './emberville'

describe('Emberville verified preview data', () => {
  it('publishes exactly four sourced pre-Early Access pages', () => {
    expect(EMBERVILLE_STATUS.releaseDate).toBe('Oct 27, 2026')
    expect(EMBERVILLE_PAGES.map((page) => page.slug)).toEqual(['emberville', 'emberville-builds', 'emberville-classes', 'emberville-skill-inheritance'])
    expect(EMBERVILLE_SOURCES.map((source) => source.href)).toContain('https://store.steampowered.com/app/2295170/Emberville/')
    expect(EMBERVILLE_MECHANICS).toContain('Active and passive skill inheritance')
  })

  it('does not ship invented gameplay entities', () => {
    const content = JSON.stringify({ EMBERVILLE_PAGES, EMBERVILLE_MECHANICS })
    for (const claim of ['Swordsman', 'Longsword', 'best build', '3 slots', 'mastery threshold']) expect(content).not.toContain(claim)
  })
})
