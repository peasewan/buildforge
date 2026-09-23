import { isProductionAnalyticsHost } from './analyticsBootstrap'

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void
  }
}

export type TrackParams = Record<string, string | number>

export function track(event: string, params: TrackParams = {}): void {
  if (typeof window !== 'undefined' && isProductionAnalyticsHost(window.location.hostname) && typeof window.gtag === 'function') {
    window.gtag('event', event, params)
  }
}

const BUILD_USAGE_SESSION_KEY = 'buildforge-build-usage-session'

export interface BuildUsageDependencies {
  fetch: typeof fetch
  storage: Storage
  randomUUID: () => string
}

function defaultBuildUsageDependencies(): BuildUsageDependencies | null {
  if (typeof window === 'undefined') return null
  return {
    fetch: window.fetch.bind(window),
    storage: window.sessionStorage,
    randomUUID: () => crypto.randomUUID(),
  }
}

export async function reportSharedBuild(
  buildCode: string,
  dependencies: BuildUsageDependencies | null = defaultBuildUsageDependencies(),
): Promise<boolean> {
  if (!dependencies) return false
  try {
    let sessionId = dependencies.storage.getItem(BUILD_USAGE_SESSION_KEY)
    if (!sessionId) {
      sessionId = dependencies.randomUUID()
      dependencies.storage.setItem(BUILD_USAGE_SESSION_KEY, sessionId)
    }
    const response = await dependencies.fetch('/api/build-usage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ buildCode, sessionId }),
      keepalive: true,
    })
    return response.ok
  } catch {
    return false
  }
}
