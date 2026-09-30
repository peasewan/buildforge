import type { ForgePilotSavedBuild } from './forgePilot'
import { isSavedBuild } from './forgePilotStorage'

const endpoint = '/api/forge-pilot-builds'
const unavailable = 'Cloud saves are unavailable. Your local builds are still here.'

function validBuilds(value: unknown): ForgePilotSavedBuild[] {
  if (!Array.isArray(value) || value.length > 1_000 || !value.every(isSavedBuild)) throw new Error(unavailable)
  if (new Set(value.map((build) => build.id)).size !== value.length) throw new Error(unavailable)
  return value
}

export function createForgePilotCloudClient(getToken: () => Promise<string | null>, fetcher: typeof fetch = fetch, expectedUserId?: string) {
  async function request(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', payload?: object, id?: string): Promise<unknown> {
    let token: string | null
    try { token = await getToken() } catch { throw new Error('Sign in to use cloud saves.') }
    if (!token) throw new Error('Sign in to use cloud saves.')
    let response: Response
    try {
      response = await fetcher(id ? `${endpoint}?id=${encodeURIComponent(id)}` : endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(expectedUserId ? { 'X-ForgePilot-User': expectedUserId } : {}),
          ...(payload ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(payload ? { body: JSON.stringify(payload) } : {}),
        cache: 'no-store',
      })
    } catch {
      throw new Error(unavailable)
    }
    if (response.status === 401 || response.status === 403) throw new Error('Sign in to use cloud saves.')
    if (response.status === 409) {
      const conflict = await response.json().catch(() => null) as { error?: unknown } | null
      if (conflict?.error === 'Cloud save limit reached.') throw new Error('Your account has 20 saved builds. Remove one before saving another.')
      throw new Error('This build conflicts with an account record. Your local copy remains available.')
    }
    if (!response.ok) throw new Error(unavailable)
    try { return await response.json() } catch { throw new Error(unavailable) }
  }

  return {
    async list(): Promise<ForgePilotSavedBuild[]> {
      const result = await request('GET') as { builds?: unknown }
      return validBuilds(result?.builds)
    },
    async save(build: ForgePilotSavedBuild): Promise<ForgePilotSavedBuild> {
      const result = await request('POST', { build }) as { build?: unknown }
      const records = validBuilds([result?.build])
      return records[0]
    },
    async rename(id: string, name: string): Promise<ForgePilotSavedBuild> {
      const result = await request('PATCH', { id, name }) as { build?: unknown }
      const records = validBuilds([result?.build])
      return records[0]
    },
    async remove(id: string): Promise<void> {
      const result = await request('DELETE', undefined, id) as { ok?: unknown }
      if (result?.ok !== true) throw new Error(unavailable)
    },
  }
}
