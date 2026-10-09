import type { ClassDefinition, ClassTalent, PlannerLevel } from './classPage'
import { decodeValidatedPlannerBuild, encodePlannerBuild, isValidPlannerBuild, type PlannerBuild } from './talentPlanner'

export interface HistoricalClassBuild {
  code: string
  level: PlannerLevel
  clientBuild: string
  dataVersion: string
  build: PlannerBuild
  talents: ClassTalent<string>[]
}
export function recoverHistoricalClassBuild<B extends string>(def: ClassDefinition<B>, code: string, level: PlannerLevel, expectedBuild?: string): HistoricalClassBuild | undefined {
  if (!code) return undefined
  for (const snapshot of def.historicalSnapshots ?? []) {
    if (expectedBuild && snapshot.clientBuild !== expectedBuild) continue
    const build = decodeValidatedPlannerBuild(code, snapshot.talents, { branches: def.branches, pointCap: level - 9 })
    if (!build || !Object.keys(build).length) continue
    return { code, level, clientBuild: snapshot.clientBuild, dataVersion: snapshot.dataVersion, build,
      talents: snapshot.talents.filter(talent => (build[talent.id] ?? 0) > 0) }
  }
  return undefined
}

/** Validate the entire untrusted saved object before encoding, including invalid extra ranks. */
export function recoverHistoricalStoredClassBuild<B extends string>(def: ClassDefinition<B>, untrustedBuild: PlannerBuild, level: PlannerLevel): HistoricalClassBuild | undefined {
  for (const snapshot of def.historicalSnapshots ?? []) {
    if (!isValidPlannerBuild(untrustedBuild, snapshot.talents, {branches:def.branches,pointCap:level - 9})) continue
    return recoverHistoricalClassBuild(def, encodePlannerBuild(untrustedBuild), level, snapshot.clientBuild)
  }
  return undefined
}
