export function wholeAmbrosia(input: string): number | null {
  const value = input.trim()
  if (!/^\d+$/.test(value)) return null
  const amount = Number(value)
  return Number.isSafeInteger(amount) ? amount : null
}

export function planAmbrosia(total: number, balanceInput: string, perRunInput: string) {
  const balance = wholeAmbrosia(balanceInput)
  if (balance === null) return { shortfall: null, runs: null }

  const shortfall = Math.max(0, total - balance)
  const perRun = wholeAmbrosia(perRunInput)
  const runs = shortfall === 0 ? 0 : perRun ? Math.ceil(shortfall / perRun) : null
  return { shortfall, runs }
}
