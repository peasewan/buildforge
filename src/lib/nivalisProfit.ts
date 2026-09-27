export interface ProfitScenario {
  name: string
  price: number
  cost: number
  sales: number
  fixedCost: number
  hours: number
  investment: number
}
export interface ProfitPlan { version: 1; scenarios: ProfitScenario[] }
const moneyFields = ['price', 'cost', 'fixedCost', 'investment'] as const
const cents = (value: number) => Math.round(value * 100)

export function validScenario(value: unknown): value is ProfitScenario {
  if (!value || typeof value !== 'object') return false
  const row = value as ProfitScenario
  if (typeof row.name !== 'string' || !row.name.trim() || row.name.length > 60) return false
  if (![...moneyFields, 'sales', 'hours'].every(key => {
    const number = row[key as keyof ProfitScenario]
    return typeof number === 'number' && Number.isFinite(number) && number >= 0 && number <= 1e6
  })) return false
  return Number.isInteger(row.sales) && row.hours <= 10000
    && moneyFields.every(key => Math.abs(row[key] * 100 - cents(row[key])) < 1e-6)
}

export function calculateProfit(row: ProfitScenario) {
  if (!validScenario(row)) throw new Error('Invalid profit scenario')
  // Integer cents preserve exact two-decimal inputs, especially at break-even.
  const contributionCents = cents(row.price) - cents(row.cost)
  const revenue = cents(row.price) * row.sales / 100
  const variableCost = cents(row.cost) * row.sales / 100
  const grossProfit = contributionCents * row.sales / 100
  const netProfit = (contributionCents * row.sales - cents(row.fixedCost)) / 100
  return {
    revenue, variableCost, grossProfit, netProfit, contribution: contributionCents / 100,
    perHour: row.hours > 0 ? netProfit / row.hours : null,
    marginPercent: revenue > 0 ? netProfit / revenue * 100 : null,
    breakEvenUnits: contributionCents > 0 ? Math.ceil(cents(row.fixedCost) / contributionCents) : null,
    paybackPeriods: row.investment > 0 && netProfit > 0 ? row.investment / netProfit : null,
  }
}

export function parseProfitPlan(raw: string | null): ProfitPlan {
  const empty: ProfitPlan = { version: 1, scenarios: [] }
  try {
    const value = JSON.parse(raw ?? 'null')
    if (value?.version !== 1 || !Array.isArray(value.scenarios)) return empty
    return { version: 1, scenarios: value.scenarios.slice(0, 2).filter(validScenario) }
  } catch { return empty }
}

function csvText(value: string) {
  const safe = /^[\s]*[=+\-@]|^[\t\r\n]/.test(value) ? `'${value}` : value
  return `"${safe.replaceAll('"', '""')}"`
}
export function profitPlanCsv(scenarios: ProfitScenario[]) {
  const header = 'business,price,cost,sales,fixedCost,hours,investment,revenue,variableCost,netProfit,breakEvenUnits,profitPerHour,paybackPeriods'
  const rows = scenarios.filter(validScenario).map(row => {
    const result = calculateProfit(row)
    return [csvText(row.name), row.price, row.cost, row.sales, row.fixedCost, row.hours, row.investment,
      result.revenue, result.variableCost, result.netProfit, result.breakEvenUnits ?? '', result.perHour ?? '', result.paybackPeriods ?? ''].join(',')
  })
  return [header, ...rows].join('\r\n') + '\r\n'
}
