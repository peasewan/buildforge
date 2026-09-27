// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  createGardenPlan,
  gardenPlanCsv,
  gardenSchedule,
  harvestDay,
  parseGardenPlan,
  type GardenPlanting,
} from './glimmerwickPlanner'

const planting = (overrides: Partial<GardenPlanting> = {}): GardenPlanting => ({
  id: 'plot-a', crop: 'My crop', quantity: 2, plantedDay: 3, growthDays: 4, notes: 'Near the gate',
  ...overrides,
})
const stored = (plantings: unknown[], currentDay: unknown = 8) => JSON.stringify({ version: 1, currentDay, plantings })

describe('garden plan recovery', () => {
  it('starts fresh plans on day one without sharing mutable planting arrays', () => {
    const first = createGardenPlan()
    first.plantings.push(planting())
    expect(createGardenPlan()).toEqual({ version: 1, currentDay: 1, plantings: [] })
  })

  it.each([null, '', '{', 'null', '[]', 'true', '5', '"plan"', '{"version":2,"currentDay":8,"plantings":[]}', '{"currentDay":8,"plantings":[]}'])(
    'recovers an empty plan from invalid or unsupported storage (%s)', (raw) => {
      expect(parseGardenPlan(raw)).toEqual({ version: 1, currentDay: 1, plantings: [] })
    },
  )

  it('restores valid user input while discarding unrecognized properties', () => {
    const raw = '{"version":1,"currentDay":8,"plantings":[{"id":"plot-a","crop":"My crop","quantity":2,"plantedDay":3,"growthDays":4,"notes":"Near the gate","untrusted":true}],"__proto__":{"polluted":true}}'
    expect(parseGardenPlan(raw)).toEqual({ version: 1, currentDay: 8, plantings: [planting()] })
    expect(Object.prototype).not.toHaveProperty('polluted')
  })

  it.each([0, 10000, 1.5, '8', null])('defaults an invalid current day without losing valid rows (%s)', (day) => {
    expect(parseGardenPlan(stored([planting()], day))).toEqual({ version: 1, currentDay: 1, plantings: [planting()] })
  })

  it('accepts all inclusive input boundaries', () => {
    const first = planting({ id: 'first', quantity: 1, plantedDay: 1, growthDays: 1, crop: 'x'.repeat(80), notes: 'n'.repeat(240) })
    const last = planting({ id: 'last', quantity: 999, plantedDay: 9999, growthDays: 365, notes: '' })
    expect(parseGardenPlan(stored([first, last], 9999))).toEqual({ version: 1, currentDay: 9999, plantings: [first, last] })
  })

  it.each([
    { quantity: 0 }, { quantity: 1000 }, { quantity: 1.5 }, { quantity: '2' },
    { plantedDay: 0 }, { plantedDay: 10000 }, { plantedDay: 2.5 }, { plantedDay: '3' },
    { growthDays: 0 }, { growthDays: 366 }, { growthDays: 2.5 }, { growthDays: '4' },
    { id: '' }, { id: '   ' }, { id: null },
    { crop: '' }, { crop: '   ' }, { crop: 'x'.repeat(81) }, { crop: null },
    { notes: 'n'.repeat(241) }, { notes: null },
  ])('isolates an invalid row without changing its valid neighbors (%j)', (badFields) => {
    const before = planting({ id: 'before' })
    const after = planting({ id: 'after', plantedDay: 10 })
    const bad = { ...planting({ id: 'bad' }), ...badFields }
    expect(parseGardenPlan(stored([before, bad, after])).plantings).toEqual([before, after])
  })

  it('ignores non-record plantings and a non-array planting collection', () => {
    expect(parseGardenPlan(stored([null, false, [], 'crop', planting()])).plantings).toEqual([planting()])
    expect(parseGardenPlan('{"version":1,"currentDay":12,"plantings":{}}')).toEqual({ version: 1, currentDay: 12, plantings: [] })
  })

  it('retains at most thirty valid rows in the original order', () => {
    const rows = Array.from({ length: 32 }, (_, index) => planting({ id: `plot-${index}` }))
    const restored = parseGardenPlan(stored([null, ...rows]))
    expect(restored.plantings).toHaveLength(30)
    expect(restored.plantings[0].id).toBe('plot-0')
    expect(restored.plantings[29].id).toBe('plot-29')
  })

  it('keeps the first valid occurrence of an ID so a duplicate cannot overwrite a planting', () => {
    const first = planting()
    const duplicate = planting({ crop: 'Different crop', plantedDay: 40 })
    expect(parseGardenPlan(stored([first, duplicate])).plantings).toEqual([first])
  })
})

describe('garden harvest schedule', () => {
  it('adds only the user supplied growth duration, including dates beyond the input-day limit', () => {
    expect(harvestDay(planting({ plantedDay: 1, growthDays: 1 }))).toBe(2)
    expect(harvestDay(planting({ plantedDay: 9999, growthDays: 365 }))).toBe(10364)
  })

  it('orders harvests stably and never reports negative days remaining or mutates the plan', () => {
    const late = planting({ id: 'late', plantedDay: 10, growthDays: 3 })
    const ready = planting({ id: 'ready', plantedDay: 5, growthDays: 3 })
    const sameDay = planting({ id: 'same-day', plantedDay: 6, growthDays: 2 })
    const overdue = planting({ id: 'overdue', plantedDay: 1, growthDays: 2 })
    const plan = { version: 1 as const, currentDay: 8, plantings: [late, ready, sameDay, overdue] }
    const original = JSON.stringify(plan)
    expect(gardenSchedule(plan)).toEqual([
      { planting: overdue, readyDay: 3, daysRemaining: 0 },
      { planting: ready, readyDay: 8, daysRemaining: 0 },
      { planting: sameDay, readyDay: 8, daysRemaining: 0 },
      { planting: late, readyDay: 13, daysRemaining: 5 },
    ])
    expect(JSON.stringify(plan)).toBe(original)
    expect(gardenSchedule(createGardenPlan())).toEqual([])
  })
})

describe('garden CSV export', () => {
  it('exports every input field and an estimated ready day with valid CSV escaping', () => {
    const row = planting({ id: 'plot,"north"', crop: 'My, crop', notes: 'Line 1\nHe said "grow"' })
    expect(gardenPlanCsv({ version: 1, currentDay: 8, plantings: [row] })).toBe(
      'currentDay,id,crop,quantity,plantedDay,growthDays,notes,readyDay\r\n' +
      '8,"plot,""north""","My, crop",2,3,4,"Line 1\nHe said ""grow""",7\r\n',
    )
  })

  it.each(['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1)', '  =HYPERLINK("https://example.test")', '\t=1+1', '\r=1+1', '\n=1+1', '\tplain text', '\rplain text', '\nplain text'])(
    'neutralizes formula-like text in all user controlled columns (%j)', (text) => {
      const row = planting({ id: text, crop: text, notes: text })
      const csv = gardenPlanCsv({ version: 1, currentDay: 8, plantings: [row] })
      const safe = `"'${text.replaceAll('"', '""')}"`
      expect(csv).toBe('currentDay,id,crop,quantity,plantedDay,growthDays,notes,readyDay\r\n' +
        `8,${safe},${safe},2,3,4,${safe},7\r\n`)
    },
  )

  it('preserves ordinary text and produces a header for an empty plan', () => {
    const row = planting({ id: "plot-a", crop: "Growers' mix", notes: "'=already text" })
    expect(gardenPlanCsv({ version: 1, currentDay: 1, plantings: [row] })).toBe(
      'currentDay,id,crop,quantity,plantedDay,growthDays,notes,readyDay\r\n' +
      '1,"plot-a","Growers\' mix",2,3,4,"\'=already text",7\r\n',
    )
    expect(gardenPlanCsv(createGardenPlan())).toBe('currentDay,id,crop,quantity,plantedDay,growthDays,notes,readyDay\r\n')
  })
})
