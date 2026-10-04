import { describe, expect, it } from 'vitest'
import { compareDungeonXp } from './dungeonXp'
const measurement = { firstRunXp:12000, repeatRunXp:3000, waitMinutes:10, travelMinutes:5, runMinutes:25, turnInMinutes:5, questXp:6000, questMinutes:30 }
describe('measured XP comparison', () => {
  it('counts the entire trip and compares first and repeat separately', () => {
    const result = compareDungeonXp(measurement)!
    expect(result.totalMinutes).toBe(45)
    expect(result.firstPerHour).toBeCloseTo(16000)
    expect(result.repeatPerHour).toBeCloseTo(4000)
    expect(result.questPerHour).toBe(12000)
    expect(result.firstMaxWait).toBe(25)
    expect(result.repeatMaxWait).toBeNull()
  })
  it('allows zero XP and zero overhead without dividing by zero', () => {
    const result = compareDungeonXp({...measurement, firstRunXp:0, repeatRunXp:0, waitMinutes:0, travelMinutes:0, turnInMinutes:0, questXp:0})!
    expect(result.firstPerHour).toBe(0)
    expect(result.firstMaxWait).toBeNull()
    expect(result.repeatPerHour).toBe(0)
  })
  it.each([-1,NaN,Infinity])('rejects invalid measurements %s', value => {
    for(const key of Object.keys(measurement)) expect(compareDungeonXp({...measurement,[key]:value})).toBeNull()
  })
  it('requires positive measured run and quest times', () => {
    expect(compareDungeonXp({...measurement,runMinutes:0})).toBeNull()
    expect(compareDungeonXp({...measurement,questMinutes:0})).toBeNull()
  })
})
