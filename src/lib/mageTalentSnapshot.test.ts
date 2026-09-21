import { describe, expect, it } from 'vitest'
import { readManualSnapshot } from './mageTalentSnapshot'

const talents = [{ name: 'Ignite', branch: 'fire' as const, row: 2, column: 1, maxRank: 5 }]

describe('mage manual snapshot fallback', () => {
  it('accepts a checked-in snapshot that declares acquisition manual_snapshot', () => {
    const contents = JSON.stringify({ acquisition: 'manual_snapshot', source: 'https://example.test', talents })
    expect(readManualSnapshot('mage-source-foreverdiff-1.60.1.69913.json', contents)).toEqual(talents)
  })

  it('refuses a fetched snapshot, so a fetch can never be relabelled manual', () => {
    const contents = JSON.stringify({ acquisition: 'fetch', talents })
    expect(() => readManualSnapshot('mage-source-foreverdiff-1.60.1.69913.json', contents))
      .toThrow(/mage-source-foreverdiff-1\.60\.1\.69913\.json.*"fetch".*manual_snapshot/s)
  })

  it('refuses an unlabelled snapshot', () => {
    expect(() => readManualSnapshot('mage-source-thewowdb-1.60.1.69913.json', JSON.stringify({ talents })))
      .toThrow(/mage-source-thewowdb-1\.60\.1\.69913\.json.*undefined.*manual_snapshot/s)
  })

  it('refuses a manual snapshot that carries no talents', () => {
    expect(() => readManualSnapshot('snapshot.json', JSON.stringify({ acquisition: 'manual_snapshot' })))
      .toThrow(/snapshot\.json.*no talents/i)
  })
})
