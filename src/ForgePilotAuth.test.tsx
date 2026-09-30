import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ForgePilotAuthBoundary } from './ForgePilotAuth'
import { useForgePilotAuth } from './ForgePilotAuthContext'

const clerk = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: false,
  userId: null as string | null,
  getToken: vi.fn(async () => 'account-token' as string | null),
  signOut: vi.fn(async () => {}),
  openSignIn: vi.fn(),
}))

vi.mock('@clerk/react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => clerk,
  useClerk: () => clerk,
}))

function Consumer() {
  const auth = useForgePilotAuth()
  return <div>
    <output>{auth.configured ? auth.userId ?? 'signed out' : 'local only'}</output>
    <button onClick={auth.openSignIn}>Sign in</button>
    <button onClick={() => void auth.signOut()}>Sign out</button>
  </div>
}

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  clerk.isLoaded = true
  clerk.isSignedIn = false
  clerk.userId = null
  clerk.openSignIn.mockClear()
  clerk.signOut.mockClear()
})

describe('ForgePilot auth boundary', () => {
  it('leaves the calculator in local-only mode when the public Clerk key is missing', () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '')
    render(<ForgePilotAuthBoundary><Consumer /></ForgePilotAuthBoundary>)

    expect(screen.getByText('local only')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(clerk.openSignIn).not.toHaveBeenCalled()
  })

  it('loads account code only after the configured boundary mounts', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_public')
    render(<ForgePilotAuthBoundary><Consumer /></ForgePilotAuthBoundary>)

    expect(screen.getByText('Connecting account…')).toBeTruthy()
    expect(await screen.findByText('signed out')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(clerk.openSignIn).toHaveBeenCalledOnce()
  })

  it('exposes the Clerk session and sign-out action inside the account boundary', async () => {
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_public')
    clerk.isSignedIn = true
    clerk.userId = 'user_123'
    render(<ForgePilotAuthBoundary><Consumer /></ForgePilotAuthBoundary>)

    expect(await screen.findByText('user_123')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(clerk.signOut).toHaveBeenCalledOnce()
  })
})
