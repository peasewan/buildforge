import { describe, expect, it } from 'vitest'
import { calculateTalentEconomy, formatCopper, parseGold } from './talentEconomy'

const base = { mode: 'fixed' as const, resetGold: '5', resetSequence: '1,5,10', dualGold: '50', switchGold: '0', switches: 8, level: 40 }
function result(input: Partial<Parameters<typeof calculateTalentEconomy>[0]> = {}) {
  const value = calculateTalentEconomy({ ...base, ...input })
  if (!value.valid) throw new Error(value.error)
  return value
}

describe('talent economy budget scenarios', () => {
  it('compares a fixed trainer quote without inventing a future fee ladder', () => {
    const value = result()
    expect(value.respecCopper).toBe(400000)
    expect(value.dualCopper).toBe(500000)
    expect(value.netSavingsCopper).toBe(-100000)
    expect(value.breakEvenSwitch).toBe(10)
    expect(value.rows.at(-1)).toEqual({ switchNumber: 8, respecCopper: 400000, dualCopper: 500000 })
  })
  it('includes the entered per-switch charge on the dual side', () => {
    const value = result({ switchGold: '1', switches: 13 })
    expect(value.breakEvenSwitch).toBe(13)
    expect(value.dualCopper).toBe(630000)
    expect(value.netSavingsCopper).toBe(20000)
  })
  it('does not claim a break-even when the alternative never becomes cheaper', () => {
    expect(result({ resetGold: '0' }).breakEvenSwitch).toBeNull()
    expect(result({ switchGold: '5' }).breakEvenSwitch).toBeNull()
    expect(result({ switchGold: '6' }).breakEvenSwitch).toBeNull()
  })
  it('models a free unlock and zero planned changes without division errors', () => {
    expect(result({ dualGold: '0' }).breakEvenSwitch).toBe(0)
    const value = result({ switches: 0 })
    expect(value.respecCopper).toBe(0)
    expect(value.dualCopper).toBe(500000)
    expect(value.rows).toEqual([])
  })
  it('does not call a free unlock paid back when each later switch costs more', () => {
    const value = result({ dualGold: '0', resetGold: '1', switchGold: '5' })
    expect(value.breakEvenSwitch).toBeNull()
    expect(value.netSavingsCopper).toBe(-320000)
    expect(result({ mode: 'sequence', dualGold: '0', resetSequence: '1,1', switchGold: '5', switches: 2 }).breakEvenSwitch).toBeNull()
  })
  it('keeps the final saving separate from a sequence that crosses and later crosses back', () => {
    const value = result({ mode: 'sequence', resetSequence: '100,0,0', switchGold: '20', switches: 3 })
    expect(value.breakEvenSwitch).toBe(1)
    expect(value.netSavingsCopper).toBe(-100000)
  })
  it('separates future budgeting from the official level-40 eligibility condition', () => {
    expect(result({ level: 39 }).eligible).toBe(false)
    expect(result({ level: 40 }).eligible).toBe(true)
    expect(result({ level: 39 }).respecCopper).toBe(400000)
  })
  it('sums exact per-reset quotes and locates the first cumulative break-even', () => {
    const value = result({ mode: 'sequence', resetSequence: '1,5,10,15,20', switches: 5 })
    expect(value.respecCopper).toBe(510000)
    expect(value.breakEvenSwitch).toBe(5)
    expect(value.netSavingsCopper).toBe(10000)
    expect(value.complete).toBe(true)
  })
  it('leaves an incomplete sequence unresolved instead of repeating or extrapolating it', () => {
    const value = result({ mode: 'sequence', switches: 8 })
    expect(value.pricedSwitches).toBe(3)
    expect(value.knownRespecCopper).toBe(160000)
    expect(value.complete).toBe(false)
    expect(value.respecCopper).toBeNull()
    expect(value.netSavingsCopper).toBeNull()
    expect(value.breakEvenSwitch).toBeNull()
    expect(value.rows).toHaveLength(3)
  })
  it('ignores quotes beyond the selected horizon rather than counting unplanned resets', () => {
    const value = result({ mode: 'sequence', resetSequence: '1,5,100', switches: 2 })
    expect(value.respecCopper).toBe(60000)
    expect(value.pricedSwitches).toBe(2)
    expect(value.breakEvenSwitch).toBeNull()
  })
  it('does not require quotes for zero planned changes', () => {
    const value = result({ mode: 'sequence', resetSequence: '', switches: 0 })
    expect(value.complete).toBe(true)
    expect(value.respecCopper).toBe(0)
  })
  it.each([
    { resetGold: '' }, { resetGold: '-1' }, { resetGold: '1e2' },
    { dualGold: 'Infinity' }, { switchGold: '0.00001' }, { switches: 1.5 },
    { switches: -1 }, { switches: 1001 }, { level: 0 }, { level: 61 },
    { mode: 'sequence' as const, resetSequence: '1,,5' },
    { mode: 'sequence' as const, resetSequence: '1,-5' },
  ])('rejects invalid or ambiguous money/count input: %j', patch => {
    expect(calculateTalentEconomy({ ...base, ...patch }).valid).toBe(false)
  })
})

describe('gold and copper conversion', () => {
  it('converts four decimal gold places to exact integer copper', () => {
    expect(parseGold('0.0001')).toBe(1)
    expect(parseGold('1.0101')).toBe(10101)
    expect(parseGold(' 50.25 ')).toBe(502500)
    expect(parseGold('1000001')).toBeNull()
  })
  it('formats tiny amounts and mixed coin values without floating-point rounding', () => {
    expect(formatCopper(1)).toBe('1c')
    expect(formatCopper(10101)).toBe('1g 1s 1c')
    expect(formatCopper(500000)).toBe('50g')
    expect(formatCopper(0)).toBe('0g')
    expect(formatCopper(-10000)).toBe('-1g')
  })
})
