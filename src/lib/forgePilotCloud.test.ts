import { describe, expect, it } from 'vitest'
import { createForgePilotSavedBuild } from './forgePilot'
import { cloudBuildPath, cloudUserPrefix, parseCloudBuild } from './forgePilotCloud'

function saved(id = 'build-1', classId = 'paladin') {
  const result = createForgePilotSavedBuild({
    id,
    name: 'Holy test',
    classId,
    dataVersion: 'wow_forever_beta_1.60.1.69913',
    shareInput: 'divine_intellect.5',
    savedAt: '2026-09-29T00:00:00.000Z',
  })
  if (!result.ok) throw new Error(result.error)
  return result.build
}

describe('ForgePilot cloud record validation', () => {
  it('accepts a saved WoW record without changing its original version or code', () => {
    expect(parseCloudBuild(saved())).toEqual(saved())
  })

  it('rejects non-WoW classes and malformed local records before storage', () => {
    expect(parseCloudBuild(saved('a', 'emberville'))).toBeNull()
    expect(parseCloudBuild({ ...saved(), id: '../other-user' })).toBeNull()
    expect(parseCloudBuild({ ...saved(), sourceUrl: 'https://evil.example/build?id=divine_intellect.5' })).toBeNull()
    expect(parseCloudBuild({ ...saved(), originalCode: 'invalid code' })).toBeNull()
    expect(parseCloudBuild({ ...saved(), secret: 'must-not-persist' })).toBeNull()
  })

  it('derives every private pathname from the verified account identifier', () => {
    expect(cloudUserPrefix('user_one')).toBe('forge-pilot/user_one/')
    expect(cloudBuildPath('user_one', 'build-1')).toBe('forge-pilot/user_one/build-1.json')
    expect(cloudUserPrefix('../other')).toBeNull()
    expect(cloudBuildPath('user_one', '../other')).toBeNull()
  })
})
