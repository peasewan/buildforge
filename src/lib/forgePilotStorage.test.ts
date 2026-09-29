import { beforeEach, describe, expect, it } from 'vitest'
import { createForgePilotSavedBuild } from './forgePilot'
import {
  FORGE_PILOT_STORAGE_KEY,
  readForgePilotSavedBuilds,
  removeForgePilotSavedBuild,
  upsertForgePilotSavedBuild,
} from './forgePilotStorage'

function record(id: string, code = 'root.5', version = 'wow_forever_beta_1.60.1.69913') {
  const result = createForgePilotSavedBuild({
    id,
    name: `Build ${id}`,
    classId: 'paladin',
    dataVersion: version,
    shareInput: code,
    savedAt: '2026-09-29T00:00:00.000Z',
  })
  if (!result.ok) throw new Error(result.error)
  return result.build
}

describe('ForgePilot local collection', () => {
  beforeEach(() => window.localStorage.clear())

  it('persists saved builds separately from the calculator auto-draft', () => {
    window.localStorage.setItem('wow-forever-paladin-build', 'draft.2')
    const saved = record('a')

    expect(upsertForgePilotSavedBuild(window.localStorage, saved)).toEqual({ ok: true, builds: [saved] })
    expect(readForgePilotSavedBuilds(window.localStorage)).toEqual({ ok: true, builds: [saved] })
    expect(window.localStorage.getItem('wow-forever-paladin-build')).toBe('draft.2')
    expect(window.localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toContain('69913')
  })

  it('updates a record by id without creating a duplicate', () => {
    const first = record('a', 'root.3')
    const revised = { ...first, originalCode: 'root.5' }
    upsertForgePilotSavedBuild(window.localStorage, first)

    expect(upsertForgePilotSavedBuild(window.localStorage, revised)).toEqual({ ok: true, builds: [revised] })
  })

  it('deduplicates the same class, source version, and code while retaining the original id', () => {
    const first = record('a')
    const second = record('b')
    upsertForgePilotSavedBuild(window.localStorage, first)

    expect(upsertForgePilotSavedBuild(window.localStorage, second)).toEqual({
      ok: true,
      builds: [{ ...second, id: 'a' }],
    })
  })

  it('keeps the same allocation at different level caps as separate saved builds', () => {
    const level20 = { ...record('level20'), level: 20 }
    const level60 = { ...record('level60'), level: 60 }
    expect(upsertForgePilotSavedBuild(window.localStorage, level20).ok).toBe(true)

    expect(upsertForgePilotSavedBuild(window.localStorage, level60)).toEqual({
      ok: true,
      builds: [level60, level20],
    })
  })

  it('deletes only the selected saved build', () => {
    const first = record('a', 'root.3')
    const second = record('b', 'root.5')
    upsertForgePilotSavedBuild(window.localStorage, first)
    upsertForgePilotSavedBuild(window.localStorage, second)

    expect(removeForgePilotSavedBuild(window.localStorage, 'a')).toEqual({ ok: true, builds: [second] })
    expect(readForgePilotSavedBuilds(window.localStorage)).toEqual({ ok: true, builds: [second] })
  })

  it('refuses to overwrite malformed storage data', () => {
    window.localStorage.setItem(FORGE_PILOT_STORAGE_KEY, '[{"id":"missing-version"}]')

    expect(readForgePilotSavedBuilds(window.localStorage)).toEqual({ ok: false, error: 'corrupt_storage' })
    expect(upsertForgePilotSavedBuild(window.localStorage, record('a'))).toEqual({ ok: false, error: 'corrupt_storage' })
    expect(window.localStorage.getItem(FORGE_PILOT_STORAGE_KEY)).toBe('[{"id":"missing-version"}]')
  })

  it('rejects saved records whose level or reopen URL was corrupted', () => {
    window.localStorage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify([{ ...record('a'), level: '20' }]))
    expect(readForgePilotSavedBuilds(window.localStorage)).toEqual({ ok: false, error: 'corrupt_storage' })

    window.localStorage.setItem(FORGE_PILOT_STORAGE_KEY, JSON.stringify([{ ...record('a'), sourceUrl: 'https://example.com/build?id=root.5' }]))
    expect(readForgePilotSavedBuilds(window.localStorage)).toEqual({ ok: false, error: 'corrupt_storage' })
  })

  it('reports unavailable browser storage instead of throwing', () => {
    const unavailable = {
      getItem(): string | null { throw new Error('blocked') },
      setItem(): void { throw new Error('blocked') },
    }

    expect(readForgePilotSavedBuilds(unavailable)).toEqual({ ok: false, error: 'storage_unavailable' })
    expect(upsertForgePilotSavedBuild(unavailable, record('a'))).toEqual({ ok: false, error: 'storage_unavailable' })
  })

  it('keeps the first twenty builds instead of silently evicting one', () => {
    for (let i = 0; i < 20; i++) {
      expect(upsertForgePilotSavedBuild(window.localStorage, record(String(i), `root.${i + 1}`)).ok).toBe(true)
    }

    expect(upsertForgePilotSavedBuild(window.localStorage, record('extra', 'capstone.1'))).toEqual({
      ok: false,
      error: 'limit_reached',
    })
    const collection = readForgePilotSavedBuilds(window.localStorage)
    expect(collection.ok && collection.builds).toHaveLength(20)
  })
})
