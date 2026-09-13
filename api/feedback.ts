import { put } from '@vercel/blob'
import { validateFeedback } from '../src/lib/feedback.js'

const responseHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders })
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  return origin === 'https://buildforgetools.com'
    || origin === 'https://www.buildforgetools.com'
    || origin.startsWith('http://localhost:')
    || origin.startsWith('http://127.0.0.1:')
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
    if (!allowedOrigin(request)) return json({ error: 'Origin not allowed.' }, 403)

    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > 4_000) return json({ error: 'Request is too large.' }, 413)

    let input: unknown
    try {
      input = await request.json()
    } catch {
      return json({ error: 'Invalid JSON.' }, 400)
    }

    const raw = input as Record<string, unknown>
    if (typeof raw.website === 'string' && raw.website.trim()) {
      return json({ ok: true }, 201)
    }

    const result = validateFeedback(input)
    if (!result.ok) return json({ error: 'error' in result ? result.error : 'Invalid feedback.' }, 400)

    const createdAt = new Date().toISOString()
    const date = createdAt.slice(0, 10)
    const id = crypto.randomUUID()

    try {
      await put(
        `feedback/${date}/${createdAt.replaceAll(':', '-')}-${id}.json`,
        JSON.stringify({ id, createdAt, ...result.data }),
        {
          access: 'private',
          addRandomSuffix: false,
          contentType: 'application/json',
        },
      )
    } catch {
      return json({ error: 'Feedback could not be saved. Please try again.' }, 503)
    }

    return json({ ok: true }, 201)
  },
}
