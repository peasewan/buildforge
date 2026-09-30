import { ClerkProvider, useAuth, useClerk } from '@clerk/react'
import { useCallback, useMemo, type ReactNode } from 'react'
import { ForgePilotAuthContext, type ForgePilotAuthState } from './ForgePilotAuthContext'

function SessionBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId: clerkUserId, getToken: clerkGetToken } = useAuth()
  const clerk = useClerk()
  const userId = isLoaded && isSignedIn ? clerkUserId : null
  const getToken = useCallback(async () => userId ? clerkGetToken() : null, [clerkGetToken, userId])
  const openSignIn = useCallback(() => { if (isLoaded && !userId) clerk.openSignIn() }, [isLoaded, clerk, userId])
  const signOut = useCallback(async () => { if (userId) await clerk.signOut() }, [clerk, userId])
  const value = useMemo<ForgePilotAuthState>(() => ({
    configured: true,
    loaded: isLoaded,
    userId,
    getToken,
    openSignIn,
    signOut,
  }), [isLoaded, userId, getToken, openSignIn, signOut])
  return <ForgePilotAuthContext.Provider value={value}>{children}</ForgePilotAuthContext.Provider>
}

export default function ForgePilotClerkBridge({ publishableKey, children }: { publishableKey: string; children: ReactNode }) {
  return <ClerkProvider publishableKey={publishableKey}><SessionBridge>{children}</SessionBridge></ClerkProvider>
}
