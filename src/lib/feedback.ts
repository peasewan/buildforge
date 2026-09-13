export const FEEDBACK_CATEGORIES = ['talent-data', 'feature', 'bug', 'other'] as const

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]

export interface FeedbackData {
  category: FeedbackCategory
  message: string
  email?: string
  page?: string
}

type ValidationResult =
  | { ok: true; data: FeedbackData }
  | { ok: false; error: string }

export function validateFeedback(value: unknown): ValidationResult {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Invalid request.' }

  const input = value as Record<string, unknown>
  const category = typeof input.category === 'string' ? input.category : ''
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const page = typeof input.page === 'string' ? input.page.trim() : ''

  if (!FEEDBACK_CATEGORIES.includes(category as FeedbackCategory)) {
    return { ok: false, error: 'Choose a feedback type.' }
  }
  if (message.length < 10 || message.length > 1000) {
    return { ok: false, error: 'Feedback must be between 10 and 1,000 characters.' }
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return { ok: false, error: 'Enter a valid email address or leave it blank.' }
  }
  if (page.length > 500) return { ok: false, error: 'Invalid page URL.' }

  return {
    ok: true,
    data: {
      category: category as FeedbackCategory,
      message,
      ...(email ? { email } : {}),
      ...(page ? { page } : {}),
    },
  }
}
