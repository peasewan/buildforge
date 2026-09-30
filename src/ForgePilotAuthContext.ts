import { createContext, useContext } from 'react'

export interface ForgePilotAuthState {
  configured: boolean
  loaded: boolean
  userId: string | null
  getToken: () => Promise<string | null>
  openSignIn: () => void
  signOut: () => Promise<void>
}

const localOnlyAuth: ForgePilotAuthState = {
  configured: false,
  loaded: true,
  userId: null,
  getToken: async () => null,
  openSignIn: () => {},
  signOut: async () => {},
}

export const ForgePilotAuthContext = createContext<ForgePilotAuthState>(localOnlyAuth)

export function useForgePilotAuth(): ForgePilotAuthState {
  return useContext(ForgePilotAuthContext)
}
