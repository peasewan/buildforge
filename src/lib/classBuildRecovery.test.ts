import { describe, expect, it } from 'vitest'
import { recoverHistoricalClassBuild, recoverHistoricalStoredClassBuild } from './classBuildRecovery'
import { hunterClassFixture } from '../data/fixtures/hunterClass.fixture'

describe('historical class build recovery', () => {
  const old = { ...hunterClassFixture.talents[0], id: 'old-removed-talent', name: 'Archived talent', nodeId: 123 }
  const def = { ...hunterClassFixture, historicalSnapshots: [{ clientBuild: 'old-build', dataVersion: 'old-version', talents: [old] }] }
  it('keeps old semantic IDs and ranks without transferring a reused raw node ID', () => {
    const result = recoverHistoricalClassBuild(def, 'old-removed-talent.2', 20)
    expect(result?.build).toEqual({ 'old-removed-talent': 2 })
    expect(result?.talents[0].name).toBe('Archived talent')
    expect(result?.code).toBe('old-removed-talent.2')
    expect(result?.clientBuild).toBe('old-build')
  })
  it('rejects an unknown, impossible or excess-rank historical payload', () => {
    expect(recoverHistoricalClassBuild(def, 'other.2', 20)).toBeUndefined()
    expect(recoverHistoricalClassBuild(def, 'old-removed-talent.6', 20)).toBeUndefined()
    expect(recoverHistoricalClassBuild(def, 'old-removed-talent.2~other.1', 20)).toBeUndefined()
  })
  it('rejects all ranks of malformed local drafts instead of dropping invalid extras', () => {
    expect(recoverHistoricalStoredClassBuild(def, {'old-removed-talent':2,extra:-1},20)).toBeUndefined()
    expect(recoverHistoricalStoredClassBuild(def, {'old-removed-talent':2,extra:0},20)).toBeUndefined()
    expect(recoverHistoricalClassBuild(def,'old-removed-talent.2',20,'unknown-build')).toBeUndefined()
  })
})
