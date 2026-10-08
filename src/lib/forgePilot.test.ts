import { describe, expect, it } from 'vitest'
import {
  createForgePilotSavedBuild,
  inspectForgePilotSavedBuild,
} from './forgePilot'
import type { PlannerTalent } from './talentPlanner'
import { talents as publishedPaladinTalents, removedPaladinTalents, DATA_VERSION as PALADIN_DATA_VERSION } from '../data/talents'
import { BRANCHES } from './build'

const CURRENT_VERSION = 'wow_forever_beta_1.60.1.69913'
const talents: PlannerTalent<'holy'>[] = [
  { id: 'root', branch: 'holy', maxRank: 5, requiredTreePoints: 0 },
  { id: 'capstone', branch: 'holy', maxRank: 1, requiredTreePoints: 5, prerequisite: [{ talentId: 'root', requiredRank: 5 }] },
]
const dataset = {
  classId: 'paladin',
  dataVersion: CURRENT_VERSION,
  talents,
  config: { branches: ['holy'] as const, pointCap: 11 },
}

function savedBuild(shareInput: string, dataVersion = CURRENT_VERSION) {
  const result = createForgePilotSavedBuild({
    id: 'test-build',
    name: 'Holy test',
    classId: 'paladin',
    dataVersion,
    shareInput,
    savedAt: '2026-09-29T00:00:00.000Z',
  })
  if (!result.ok) throw new Error(result.error)
  return result.build
}

describe('ForgePilot saved builds', () => {
  it('imports a Paladin share URL and preserves its original code and version', () => {
    const result = savedBuild('https://buildforgetools.com/build?id=capstone.1~root.5#calculator')

    expect(result.originalCode).toBe('capstone.1~root.5')
    expect(result.dataVersion).toBe(CURRENT_VERSION)
    expect(result.id).toBe('test-build')
    expect(result.level).toBeNull()
    expect(result.sourceUrl).toBe('/build?id=capstone.1~root.5#calculator')
  })

  it('imports a class calculator URL without treating its level parameter as part of the code', () => {
    const result = createForgePilotSavedBuild({
      id: 'warrior-test', name: 'Warrior test', classId: 'warrior', dataVersion: CURRENT_VERSION,
      shareInput: '/warrior?build=root.5&level=20#class-calculator',
      savedAt: '2026-09-29T00:00:00.000Z',
    })

    expect(result.ok && result.build.originalCode).toBe('root.5')
    expect(result.ok && result.build.level).toBe(20)
    expect(result.ok && result.build.sourceUrl).toBe('/warrior?build=root.5&level=20#class-calculator')
  })

  it('keeps an explicitly chosen level for a raw code', () => {
    const result = createForgePilotSavedBuild({
      id: 'warrior-test', name: 'Warrior test', classId: 'warrior', dataVersion: CURRENT_VERSION,
      shareInput: 'root.5', level: 30, savedAt: '2026-09-29T00:00:00.000Z',
    })

    expect(result.ok && result.build.level).toBe(30)
  })

  it('stores a validated local reopen URL supplied with a raw code', () => {
    const result = createForgePilotSavedBuild({
      id: 'warrior-test', name: 'Warrior test', classId: 'warrior', dataVersion: CURRENT_VERSION,
      shareInput: 'root.5', level: 20, sourceUrl: 'https://buildforgetools.com/warrior?build=root.5&level=20',
      savedAt: '2026-09-29T00:00:00.000Z',
    })

    expect(result.ok && result.build.sourceUrl).toBe('/warrior?build=root.5&level=20')
  })

  it('rejects an external URL even when its route resembles our calculator', () => {
    expect(createForgePilotSavedBuild({
      id: 'test-build', name: 'Holy test', classId: 'paladin', dataVersion: CURRENT_VERSION,
      shareInput: 'https://example.com/build?id=root.5', savedAt: '2026-09-29T00:00:00.000Z',
    })).toEqual({ ok: false, error: 'unsupported_share_link' })
  })

  it('rejects an external reopen URL', () => {
    expect(createForgePilotSavedBuild({
      id: 'test-build', name: 'Holy test', classId: 'paladin', dataVersion: CURRENT_VERSION,
      shareInput: 'root.5', sourceUrl: 'https://example.com/build?id=root.5',
      savedAt: '2026-09-29T00:00:00.000Z',
    })).toEqual({ ok: false, error: 'unsupported_share_link' })
  })

  it('does not save a Paladin reopen URL that the Paladin calculator cannot restore', () => {
    expect(createForgePilotSavedBuild({
      id: 'test-build', name: 'Holy test', classId: 'paladin', dataVersion: CURRENT_VERSION,
      shareInput: 'root.5', sourceUrl: '/paladin#calculator',
      savedAt: '2026-09-29T00:00:00.000Z',
    })).toEqual({ ok: false, error: 'unsupported_share_link' })
  })

  it('reports a legal allocation as ready on the same dataset', () => {
    const result = inspectForgePilotSavedBuild(savedBuild('capstone.1~root.5'), dataset)

    expect(result).toEqual({
      status: 'ready',
      allocation: { root: 5, capstone: 1 },
      points: 6,
    })
  })

  it('requires review across dataset versions, even if talent IDs still exist', () => {
    const old = savedBuild('capstone.1~root.5', 'wow_forever_beta_1.60.1.69893')

    expect(inspectForgePilotSavedBuild(old, dataset)).toEqual({
      status: 'needs_review',
      reason: 'dataset_changed',
    })
    expect(old.originalCode).toBe('capstone.1~root.5')
  })

  it('keeps official and client-confirmed Paladin removals as historical review records', () => {
    const published = {
      classId: 'paladin', dataVersion: PALADIN_DATA_VERSION,
      talents: publishedPaladinTalents, removedTalents: removedPaladinTalents,
      config: { branches: BRANCHES, pointCap: 51 },
    }
    expect(inspectForgePilotSavedBuild(savedBuild('improved_holy_strike.1'), published)).toEqual({
      status: 'needs_review', reason: 'removed_official', talentId: 'improved_holy_strike',
    })
    expect(inspectForgePilotSavedBuild(savedBuild('crusade.1'), published)).toEqual({
      status: 'needs_review', reason: 'removed_client_verified', talentId: 'crusade',
    })
  })

  it('does not open a Paladin save in a different class calculator', () => {
    expect(inspectForgePilotSavedBuild(savedBuild('root.5'), { ...dataset, classId: 'warrior' })).toEqual({
      status: 'invalid',
      reason: 'class_mismatch',
    })
  })

  it('rejects an unknown talent without dropping it silently', () => {
    expect(inspectForgePilotSavedBuild(savedBuild('root.5~removed.1'), dataset)).toEqual({
      status: 'invalid',
      reason: 'unknown_talent',
      talentId: 'removed',
    })
  })

  it('rejects an over-rank value without clamping it', () => {
    expect(inspectForgePilotSavedBuild(savedBuild('root.6'), dataset)).toEqual({
      status: 'invalid',
      reason: 'rank_out_of_range',
      talentId: 'root',
    })
  })

  it('rejects a talent locked by a missing prerequisite', () => {
    expect(inspectForgePilotSavedBuild(savedBuild('capstone.1'), dataset)).toEqual({
      status: 'invalid',
      reason: 'illegal_allocation',
    })
  })

  it('rejects duplicate talent tokens rather than overwriting one', () => {
    expect(inspectForgePilotSavedBuild(savedBuild('root.2~root.3'), dataset)).toEqual({
      status: 'invalid',
      reason: 'duplicate_talent',
      talentId: 'root',
    })
  })

  it('rejects a blank or unsupported share input at import', () => {
    expect(createForgePilotSavedBuild({
      id: 'test-build', name: 'Holy test', classId: 'paladin', dataVersion: CURRENT_VERSION,
      shareInput: '/warrior?build=root.5', savedAt: '2026-09-29T00:00:00.000Z',
    })).toEqual({ ok: false, error: 'unsupported_share_link' })
  })
})
