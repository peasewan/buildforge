import { describe, expect, it } from 'vitest'
import { EXPERIENCE_PATHS, EXPERIENCE_RELEASE_DATE, experienceLastmod } from './rollout'
describe('experience release timestamps', () => {
  it('advances reviewed active pages only, preserving protected and disabled timestamps', () => {
    expect(experienceLastmod(EXPERIENCE_PATHS[0], '2026-09-21')).toBe(EXPERIENCE_RELEASE_DATE)
    expect(experienceLastmod(EXPERIENCE_PATHS[0], '2026-10-02')).toBe('2026-10-02')
    expect(experienceLastmod('/paladin', '2026-09-20')).toBe('2026-09-20')
    expect(experienceLastmod('/unpublished-page', '2026-09-21')).toBe('2026-09-21')
  })
})
