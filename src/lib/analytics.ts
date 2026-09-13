declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void
  }
}

export type TrackParams = Record<string, string | number>

export function track(event: string, params: TrackParams = {}): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params)
  }
}
