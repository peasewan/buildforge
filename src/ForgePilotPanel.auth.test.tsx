import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ForgePilotPanel from './ForgePilotPanel'
import { BETA_SPEC_PATHS } from './data/betaSpecPaths'
import { betaDataset } from './data/datasets'
import { talents } from './data/talents'
import { BRANCHES, encodeBuild } from './lib/build'
import { createForgePilotSavedBuild } from './lib/forgePilot'
import { FORGE_PILOT_STORAGE_KEY } from './lib/forgePilotStorage'

const auth = vi.hoisted(() => ({
  configured: true,
  loaded: true,
  userId: 'user_A' as string | null,
  getToken: vi.fn(async () => 'session-token' as string | null),
  openSignIn: vi.fn(),
  signOut: vi.fn(async () => {}),
}))

vi.mock('./ForgePilotAuth', () => ({
  ForgePilotAuthBoundary: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('./ForgePilotAuthContext', () => ({
  useForgePilotAuth: () => auth,
}))

const localResult = createForgePilotSavedBuild({
  id: 'local-one', name: 'Local Holy', classId: 'paladin',
  dataVersion: betaDataset.sourceVersion,
  shareInput: encodeBuild(BETA_SPEC_PATHS.holy.current.build),
  level: 20,
  savedAt: '2026-09-29T00:00:00.000Z',
})
if (!localResult.ok) throw new Error('Local fixture failed')
const localBuild = localResult.build
const cloudBuild = { ...localBuild, id: 'cloud-one', name: 'Cloud Holy' }

function renderPanel() {
  return render(<ForgePilotPanel
    classId="paladin" className="Paladin" dataVersion={betaDataset.sourceVersion}
    level={20} pointCaps={{ 20: 11, 60: 51 }} points={11}
    buildCode={localBuild.originalCode} defaultName="Holy Paladin build"
    talents={talents} config={{ branches: BRANCHES, pointCap: 51 }}
  />)
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: 'Save to ForgePilot' }))
}

beforeEach(() => {
  localStorage.clear()
  auth.configured = true
  auth.loaded = true
  auth.userId = 'user_A'
  auth.openSignIn.mockClear()
  auth.signOut.mockClear()
  auth.getToken.mockClear()
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('ForgePilot account panel', () => {
  it('shows local and account records separately and explicitly imports without removing local records', async () => {
    localStorage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify([localBuild]))
    const fetcher = vi.fn(async (_url: string, options?: RequestInit) => options?.method === 'POST'
      ? new Response(JSON.stringify({ build: localBuild }), { status: 200 })
      : new Response(JSON.stringify({ builds: [cloudBuild] }), { status: 200 }))
    vi.stubGlobal('fetch', fetcher)

    renderPanel()
    openPanel()
    expect(await screen.findByText('Cloud Holy')).toBeTruthy()
    expect(screen.getByText('Local Holy')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'On this device' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'In your account' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Import 1 local build to account' }))
    await waitFor(() => expect(fetcher.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(true))
    expect(localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toContain('Local Holy')
    expect(await screen.findByText(/local build imported/i)).toBeTruthy()
  })

  it('keeps local records and offers a retry when cloud import fails', async () => {
    localStorage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify([localBuild]))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => options?.method === 'POST'
      ? new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 })
      : new Response(JSON.stringify({ builds: [] }), { status: 200 })))

    renderPanel()
    openPanel()
    fireEvent.click(await screen.findByRole('button', { name: 'Import 1 local build to account' }))

    expect(await screen.findByText(/import stopped/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Import 1 local build to account' })).toBeTruthy()
    expect(localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toContain('Local Holy')
  })

  it('retries the initial cloud load after a transient failure without losing local builds', async () => {
    localStorage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify([localBuild]))
    let listAttempts = 0
    const fetcher = vi.fn(async () => {
      listAttempts += 1
      return listAttempts === 1
        ? new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 })
        : new Response(JSON.stringify({ builds: [cloudBuild] }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetcher)

    renderPanel()
    openPanel()
    expect(await screen.findByText('Local Holy')).toBeTruthy()
    fireEvent.click(await screen.findByRole('button', { name: 'Retry cloud saves' }))

    expect(await screen.findByText('Cloud Holy')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save to account' }).hasAttribute('disabled')).toBe(false)
    expect(localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toContain('Local Holy')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('hides another account’s cloud records as soon as the session changes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ builds: [cloudBuild] }), { status: 200 })))
    const view = renderPanel()
    openPanel()
    expect(await screen.findByText('Cloud Holy')).toBeTruthy()

    auth.userId = null
    view.rerender(<ForgePilotPanel
      classId="paladin" className="Paladin" dataVersion={betaDataset.sourceVersion}
      level={20} pointCaps={{ 20: 11, 60: 51 }} points={11}
      buildCode={localBuild.originalCode} defaultName="Holy Paladin build"
      talents={talents} config={{ branches: BRANCHES, pointCap: 51 }}
    />)

    expect(screen.queryByText('Cloud Holy')).toBeNull()
    expect(screen.getByRole('button', { name: 'Sign in to sync builds' })).toBeTruthy()
  })

  it('does not reveal an in-flight list response after sign-out begins', async () => {
    let finishList: ((value: Response) => void) | undefined
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { finishList = resolve })))
    renderPanel()
    openPanel()
    expect(screen.getByText('Loading cloud builds…')).toBeTruthy()
    await waitFor(() => expect(finishList).toBeDefined())

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await act(async () => finishList?.(new Response(JSON.stringify({ builds: [cloudBuild] }), { status: 200 })))

    expect(screen.queryByText('Cloud Holy')).toBeNull()
  })

  it('does not show a completed save from account A in account B after switching users', async () => {
    let finishSave: ((value: Response) => void) | undefined
    const fetcher = vi.fn((_url: string, options?: RequestInit) => options?.method === 'POST'
      ? new Promise<Response>((resolve) => { finishSave = resolve })
      : Promise.resolve(new Response(JSON.stringify({ builds: [] }), { status: 200 })))
    vi.stubGlobal('fetch', fetcher)
    const view = renderPanel()
    openPanel()
    await waitFor(() => expect(screen.getByText('No named builds saved in your account yet.')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: 'Save to account' }))
    await waitFor(() => expect(finishSave).toBeDefined())
    auth.userId = 'user_B'
    view.rerender(<ForgePilotPanel
      classId="paladin" className="Paladin" dataVersion={betaDataset.sourceVersion}
      level={20} pointCaps={{ 20: 11, 60: 51 }} points={11}
      buildCode={localBuild.originalCode} defaultName="Holy Paladin build"
      talents={talents} config={{ branches: BRANCHES, pointCap: 51 }}
    />)
    await waitFor(() => expect(fetcher.mock.calls.filter(([, options]) => options?.method === 'GET')).toHaveLength(2))

    await act(async () => finishSave?.(new Response(JSON.stringify({ build: { ...cloudBuild, name: 'Account A Build' } }), { status: 200 })))
    expect(screen.queryByText('Account A Build')).toBeNull()
    expect(screen.getByText('No named builds saved in your account yet.')).toBeTruthy()
  })

  it('shows one cloud record when two local records import to the same server build', async () => {
    localStorage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify([localBuild, { ...localBuild, id: 'local-two' }]))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, options?: RequestInit) => options?.method === 'POST'
      ? new Response(JSON.stringify({ build: cloudBuild }), { status: 200 })
      : new Response(JSON.stringify({ builds: [] }), { status: 200 })))
    renderPanel()
    openPanel()
    fireEvent.click(await screen.findByRole('button', { name: 'Import 2 local builds to account' }))
    await screen.findByText(/2 local builds imported/i)

    expect(screen.getAllByText('Cloud Holy')).toHaveLength(1)
    expect(localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toContain('local-two')
  })

  it('lets a guest continue saving locally without an account request', () => {
    auth.configured = false
    auth.userId = null
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    renderPanel()
    openPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Save this build' }))
    expect(screen.getByText('Holy Paladin build')).toBeTruthy()
    expect(localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toContain('Holy Paladin build')
    expect(fetcher).not.toHaveBeenCalled()
  })
})
