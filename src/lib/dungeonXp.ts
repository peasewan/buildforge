export interface DungeonXpMeasurement {
  firstRunXp:number; repeatRunXp:number; waitMinutes:number; travelMinutes:number
  runMinutes:number; turnInMinutes:number; questXp:number; questMinutes:number
}
export function compareDungeonXp(input:DungeonXpMeasurement) {
  if (Object.values(input).some(value=>!Number.isFinite(value)||value<0) || input.runMinutes<=0 || input.questMinutes<=0) return null
  const activeMinutes = input.travelMinutes+input.runMinutes+input.turnInMinutes
  const totalMinutes = activeMinutes+input.waitMinutes
  const questPerMinute = input.questXp/input.questMinutes
  const maximumWait = (xp:number) => {
    if (questPerMinute<=0) return null
    const wait = xp/questPerMinute-activeMinutes
    return wait<0 ? null : wait
  }
  const result = { totalMinutes, firstPerHour:input.firstRunXp/totalMinutes*60, repeatPerHour:input.repeatRunXp/totalMinutes*60, questPerHour:questPerMinute*60, firstMaxWait:maximumWait(input.firstRunXp), repeatMaxWait:maximumWait(input.repeatRunXp) }
  return Object.values(result).every(value=>value===null||Number.isFinite(value)) ? result : null
}
