import { describe, expect, it } from 'vitest'
import { calculateProfit, parseProfitPlan, profitPlanCsv, validScenario, type ProfitScenario } from './nivalisProfit'

const scenario: ProfitScenario = { name: 'Noodle stand', price: 12, cost: 5, sales: 40, fixedCost: 100, hours: 4, investment: 500 }

describe('profit scenarios from player observations', () => {
  it('separates revenue, contribution and net profit for the same trading period', () => {
    expect(calculateProfit(scenario)).toMatchObject({ revenue: 480, variableCost: 200, contribution: 7, grossProfit: 280, netProfit: 180, perHour: 45, marginPercent: 37.5, breakEvenUnits: 15 })
    expect(calculateProfit(scenario).paybackPeriods).toBeCloseTo(500 / 180)
  })
  it('ceil-rounds break-even units without floating point overcount', () => {
    expect(calculateProfit({ ...scenario, price: .3, cost: .1, fixedCost: .6 }).breakEvenUnits).toBe(3)
    expect(calculateProfit({ ...scenario, price: 10, cost: 7, fixedCost: 10 }).breakEvenUnits).toBe(4)
  })
  it('does not invent a payback or break-even for a loss-making business', () => {
    expect(calculateProfit({ ...scenario, cost: 15 })).toMatchObject({ netProfit: -220, breakEvenUnits: null, paybackPeriods: null })
    expect(calculateProfit({ ...scenario, cost: 12 })).toMatchObject({ breakEvenUnits: null, paybackPeriods: null })
  })
  it('handles zero sales, unknown hours and no investment without Infinity or NaN', () => {
    expect(calculateProfit({ ...scenario, sales: 0, hours: 0, investment: 0 })).toMatchObject({ netProfit: -100, perHour: null, marginPercent: null, paybackPeriods: null })
    expect(calculateProfit({ ...scenario, fixedCost: 0 })).toMatchObject({ breakEvenUnits: 0 })
  })
  it.each(['price', 'cost', 'sales', 'fixedCost', 'hours', 'investment'] as const)('rejects invalid numeric %s', field => {
    for (const value of [-1, Infinity, NaN, 1e10]) expect(validScenario({ ...scenario, [field]: value })).toBe(false)
  })
  it('rejects fractional sales and malformed names and accepts free goods', () => {
    expect(validScenario({ ...scenario, sales: 1.5 })).toBe(false)
    expect(validScenario({ ...scenario, name: '' })).toBe(false)
    expect(validScenario({ ...scenario, name: 'a'.repeat(61) })).toBe(false)
    expect(validScenario({ ...scenario, price: .001 })).toBe(false)
    expect(validScenario({ ...scenario, price: 0, cost: 0 })).toBe(true)
  })
  it('refuses invalid input before calculating', () => {
    expect(() => calculateProfit({ ...scenario, sales: NaN })).toThrow()
  })
  it('restores valid versioned plans and discards bad rows independently', () => {
    expect(parseProfitPlan(JSON.stringify({ version: 1, scenarios: [scenario, { ...scenario, sales: -1 }] }))).toEqual({ version: 1, scenarios: [scenario] })
    expect(parseProfitPlan(JSON.stringify({ version: 1, scenarios: [scenario, scenario, scenario] })).scenarios).toHaveLength(2)
  })
  it.each([null, '{', '{}', '{"version":2,"scenarios":[]}', '{"version":1,"scenarios":null}'])('safely handles corrupt storage %s', value => {
    expect(parseProfitPlan(value)).toEqual({ version: 1, scenarios: [] })
  })
  it('exports reproducible inputs and results with safe quoted names', () => {
    const csv = profitPlanCsv([{ ...scenario, name: '=SUM(1,2)' }])
    expect(csv).toContain('"\'=SUM(1,2)"')
    expect(csv).toContain('netProfit')
    expect(csv).toContain(',480,200,180,15')
    expect(profitPlanCsv([{ ...scenario, name: 'A "small", stand' }])).toContain('"A ""small"", stand"')
  })
})
