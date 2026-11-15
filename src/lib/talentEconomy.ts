/** Inputs describe a player's budget, never an inferred in-game price schedule. */
export interface TalentEconomyInput {
  mode: 'fixed' | 'sequence'
  resetGold: string
  resetSequence: string
  dualGold: string
  switchGold: string
  switches: number
  level: number
}
export interface TalentEconomyResult {
  valid: true
  mode: 'fixed' | 'sequence'
  eligible: boolean
  plannedSwitches: number
  pricedSwitches: number
  complete: boolean
  respecCopper: number | null
  knownRespecCopper: number
  dualCopper: number
  netSavingsCopper: number | null
  breakEvenSwitch: number | null
  rows: { switchNumber: number; respecCopper: number; dualCopper: number }[]
}
const COPPER_PER_GOLD = 10000
const MAX_GOLD = 1000000

/** Parse decimal gold as integer copper, without floating-point currency arithmetic. */
export function parseGold(value: string): number | null {
  const text = value.trim()
  if (!/^\d+(?:\.\d{1,4})?$/.test(text)) return null
  const [whole, fraction = ''] = text.split('.')
  const copper = Number(whole) * COPPER_PER_GOLD + Number(fraction.padEnd(4, '0'))
  return Number.isSafeInteger(copper) && copper <= MAX_GOLD * COPPER_PER_GOLD ? copper : null
}

export function formatCopper(copper: number): string {
  if (!Number.isSafeInteger(copper)) throw new Error('Currency must be integer copper.')
  const amount = Math.abs(copper)
  const gold = Math.floor(amount / COPPER_PER_GOLD)
  const silver = Math.floor(amount % COPPER_PER_GOLD / 100)
  const remainder = amount % 100
  const coins = [gold ? `${gold.toLocaleString('en-US')}g` : '', silver ? `${silver}s` : '', remainder ? `${remainder}c` : ''].filter(Boolean).join(' ') || '0g'
  return copper < 0 ? `-${coins}` : coins
}

export function calculateTalentEconomy(input: TalentEconomyInput): TalentEconomyResult | { valid: false; error: string } {
  if (!['fixed', 'sequence'].includes(input.mode)) return { valid: false, error: 'Choose a fixed quote or a per-reset price list.' }
  if (!Number.isInteger(input.switches) || input.switches < 0 || input.switches > 1000) return { valid: false, error: 'Enter a whole number of paid resets from 0 to 1,000.' }
  if (!Number.isInteger(input.level) || input.level < 1 || input.level > 60) return { valid: false, error: 'Enter a character level from 1 to 60.' }
  const dual = parseGold(input.dualGold), switchFee = parseGold(input.switchGold)
  if (dual === null || switchFee === null) return { valid: false, error: 'Enter non-negative gold prices with at most four decimal places.' }
  const quotes: number[] = []
  if (input.mode === 'fixed') {
    const reset = parseGold(input.resetGold)
    if (reset === null) return { valid: false, error: 'Enter a non-negative reset quote with at most four decimal places.' }
    for (let i = 0; i < input.switches; i++) quotes.push(reset)
  } else if (input.resetSequence.trim()) {
    const entries = input.resetSequence.split(/[,\n]/)
    if (entries.length > 1000) return { valid: false, error: 'Enter at most 1,000 reset prices.' }
    for (const entry of entries) {
      const quote = parseGold(entry)
      if (quote === null) return { valid: false, error: 'Separate valid non-negative reset prices with commas or new lines; do not leave an empty price.' }
      quotes.push(quote)
    }
  }
  const priced = quotes.slice(0, input.switches)
  let total = 0
  let breakEven: number | null = dual === 0 && input.switches === 0 ? 0 : null
  const rows = priced.map((quote, index) => {
    total += quote
    const alternative = dual + switchFee * (index + 1)
    if (breakEven === null && total >= alternative) breakEven = index + 1
    return { switchNumber: index + 1, respecCopper: total, dualCopper: alternative }
  })
  if (input.mode === 'fixed') {
    // Only this explicitly selected flat-price scenario permits extrapolation beyond the horizon.
    const perReset = parseGold(input.resetGold)!
    breakEven = perReset > switchFee ? Math.ceil(dual / (perReset - switchFee))
      : perReset === switchFee && dual === 0 ? 0 : null
  }
  const complete = priced.length === input.switches
  const dualTotal = dual + switchFee * input.switches
  return {
    valid: true, mode: input.mode, eligible: input.level >= 40,
    plannedSwitches: input.switches, pricedSwitches: priced.length, complete,
    respecCopper: complete ? total : null, knownRespecCopper: total,
    dualCopper: dualTotal, netSavingsCopper: complete ? total - dualTotal : null,
    breakEvenSwitch: breakEven, rows,
  }
}
