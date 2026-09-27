/** User-entered garden assumptions, rather than game-sourced growth values. */
export type GardenPlanting = {
  id: string
  crop: string
  quantity: number
  plantedDay: number
  growthDays: number
  notes: string
}

export type GardenPlan = {
  version: 1
  currentDay: number
  plantings: GardenPlanting[]
}

export function createGardenPlan(): GardenPlan {
  return { version: 1, currentDay: 1, plantings: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function parsePlanting(value: unknown): GardenPlanting | undefined {
  if (!isRecord(value)) return undefined
  const { id, crop, quantity, plantedDay, growthDays, notes } = value
  if (typeof id !== 'string' || !id.trim()
    || typeof crop !== 'string' || !crop.trim() || crop.length > 80
    || typeof notes !== 'string' || notes.length > 240
    || !isIntegerInRange(quantity, 1, 999)
    || !isIntegerInRange(plantedDay, 1, 9999)
    || !isIntegerInRange(growthDays, 1, 365)) return undefined

  // Rebuild only the supported fields; stored extras never enter the application state.
  return { id, crop, quantity, plantedDay, growthDays, notes }
}

/** Recover valid rows independently, without coercing or silently rewriting user input. */
export function parseGardenPlan(raw: string | null): GardenPlan {
  if (typeof raw !== 'string' || !raw) return createGardenPlan()
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return createGardenPlan()
  }
  if (!isRecord(value) || value.version !== 1) return createGardenPlan()

  const plan = createGardenPlan()
  if (isIntegerInRange(value.currentDay, 1, 9999)) plan.currentDay = value.currentDay
  if (!Array.isArray(value.plantings)) return plan

  const ids = new Set<string>()
  for (const candidate of value.plantings) {
    const row = parsePlanting(candidate)
    if (!row || ids.has(row.id)) continue
    ids.add(row.id)
    plan.plantings.push(row)
    if (plan.plantings.length === 30) break
  }
  return plan
}

export function harvestDay(row: GardenPlanting): number {
  return row.plantedDay + row.growthDays
}

export function gardenSchedule(plan: GardenPlan): { planting: GardenPlanting; readyDay: number; daysRemaining: number }[] {
  return plan.plantings.map((planting) => {
    const readyDay = harvestDay(planting)
    return { planting, readyDay, daysRemaining: Math.max(0, readyDay - plan.currentDay) }
  }).sort((left, right) => left.readyDay - right.readyDay)
}

function csvText(value: string): string {
  // CSV quoting alone does not stop spreadsheet formula execution. Prefix potentially active
  // cells before quoting, including formula markers hidden behind leading whitespace/controls.
  // eslint-disable-next-line no-control-regex -- Leading control characters can conceal a spreadsheet formula.
  const formulaLike = /^[\s\u0000-\u001f\u007f]*[=+\-@]/u.test(value) || /^[\s]*[\t\r\n]/u.test(value)
  const safe = formulaLike ? `'${value}` : value
  return `"${safe.replaceAll('"', '""')}"`
}

export function gardenPlanCsv(plan: GardenPlan): string {
  const header = 'currentDay,id,crop,quantity,plantedDay,growthDays,notes,readyDay'
  const rows = plan.plantings.map((row) => [
    plan.currentDay, csvText(row.id), csvText(row.crop), row.quantity,
    row.plantedDay, row.growthDays, csvText(row.notes), harvestDay(row),
  ].join(','))
  return `${[header, ...rows].join('\r\n')}\r\n`
}
