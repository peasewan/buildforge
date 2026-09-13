import { describe, expect, it } from 'vitest'
import { validateFeedback } from './feedback'

describe('feedback validation', () => {
  it('accepts a useful request and normalizes optional fields', () => {
    expect(validateFeedback({
      category: 'feature',
      message: ' Please add a way to compare two builds. ',
      email: ' player@example.com ',
      page: '/paladin?build=1',
    })).toEqual({
      ok: true,
      data: {
        category: 'feature',
        message: 'Please add a way to compare two builds.',
        email: 'player@example.com',
        page: '/paladin?build=1',
      },
    })
  })

  it('rejects unknown categories, short messages, and invalid email addresses', () => {
    expect(validateFeedback({ category: 'spam', message: 'A useful message' }).ok).toBe(false)
    expect(validateFeedback({ category: 'bug', message: 'short' }).ok).toBe(false)
    expect(validateFeedback({ category: 'bug', message: 'The calculator cannot add a rank.', email: 'wrong' }).ok).toBe(false)
  })

  it('caps message and page lengths', () => {
    expect(validateFeedback({ category: 'other', message: 'x'.repeat(1001) }).ok).toBe(false)
    expect(validateFeedback({ category: 'other', message: 'This is valid feedback.', page: 'x'.repeat(501) }).ok).toBe(false)
  })
})
