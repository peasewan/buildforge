import type { ClassBuild, ClassDefinition } from './classPage'
import { classPlannerHref } from './classPage'
import { encodePlannerBuild, type PlannerBuild } from './talentPlanner'
import { officialTalentNotice } from '../data/officialOctoberChanges'

/** A 69913 allocation using a node later removed by Blizzard remains a read-only example. */
export function hasRemovedTalentInBuild<B extends string>(def: Pick<ClassDefinition<B>, 'id' | 'talents'>, build: ClassBuild): boolean {
  return def.talents.some((talent) =>
    (build.build[talent.id] ?? 0) > 0 && officialTalentNotice(def.id, talent.name)?.status === 'removed',
  )
}

/** Do not offer an unshareable prefilled URL for a historical, removed-node allocation. */
export function classBuildPlannerHref<B extends string>(def: ClassDefinition<B>, build: ClassBuild, points: PlannerBuild = build.build): string {
  // An explicit empty build suppresses localStorage restoration in the calculator.
  if (hasRemovedTalentInBuild(def, build)) return `${def.plannerPath}?build=#class-calculator`
  return classPlannerHref(def, encodePlannerBuild(points), build.level)
}
