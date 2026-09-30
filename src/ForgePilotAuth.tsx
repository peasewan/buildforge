import { lazy, Suspense, type ReactNode } from 'react'

const LazyClerkBridge = lazy(() => import('./ForgePilotClerkBridge'))

/** Mount the account SDK only after the saved-build panel opens. */
export function ForgePilotAuthBoundary({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim()
  if (!publishableKey || typeof window === 'undefined') return <>{children}</>
  return <Suspense fallback={<p role="status">Connecting account…</p>}>
    <LazyClerkBridge publishableKey={publishableKey}>{children}</LazyClerkBridge>
  </Suspense>
}
