import { EXAMPLE_BUILDS } from './builds'
import { PROTECTION_LEVEL_30 } from './protectionCurrentRoute'
import { PALADIN_LEVELING_STEPS } from './paladinLevelingProgression'
import { HOLY_SHOCK_POINT_STEPS, PALADIN_COMPARATOR_PATH } from './paladinDecisionTools'
import { BETA_PATCH_REVIEW } from './betaPatchReview'
import { PALADIN_BETA_SNAPSHOT } from './betaSnapshot'
import type { Build } from '../lib/build'

export const IMPACT_ROUTES: Array<{ id: string; title: string; href: string; build: Build; historical: boolean }> = [
  { id: 'prot-30', title: 'Protection Level 30 editorial route', href: '/wow-forever-protection-paladin-leveling-build', build: PROTECTION_LEVEL_30, historical: false },
  { id: 'ret-30', title: 'Ret Level 30 community route', href: '/wow-forever-retribution-paladin-leveling-build', build: PALADIN_LEVELING_STEPS.at(-1)!.build, historical: false },
  { id: 'holy-shock-example', title: 'Holy Shock 69913 planning example', href: PALADIN_COMPARATOR_PATH, build: HOLY_SHOCK_POINT_STEPS.at(-1)!.build, historical: true },
  ...EXAMPLE_BUILDS.map(build => ({ id: build.id, title: build.name, href: `/${build.slug}`, build: build.build, historical: true })),
]
export const PALADIN_IMPACT_CHANGES = [
  { id: 'redoubt', date: '2026-10-01', summary: 'Block chance changed from 6/12/18/24/30% to 4/8/12/16/20%.', impact: 'Review the old tooltip when judging block coverage. Membership below does not quantify survivability loss.', source: PALADIN_BETA_SNAPSHOT.phase.officialSource },
  { id: 'holy_shield', date: '2026-10-01', summary: 'Block chance changed from 20% to 30%.', impact: 'The selected examples below are historical full allocations, not Level 30 recommendations.', source: PALADIN_BETA_SNAPSHOT.phase.officialSource },
  { id: 'vengeance', date: '2026-09-24', summary: 'Uses non-periodic critical effects, with three stacks.', impact: 'Review trigger assumptions in Ret play. The imported description alone cannot establish current uptime.', source: BETA_PATCH_REVIEW.officialSource },
  { id: 'sacred_arbiter', date: '2026-09-24', summary: 'Official update sets Sacred Arbiter to 20%.', impact: 'The Ret route selects this talent; consult the official note rather than calculating output from the old rank text.', source: BETA_PATCH_REVIEW.officialSource },
  { id: 'twist_of_light', date: '2026-09-24', summary: 'Adds 20% Seal mana-cost reduction.', impact: 'This tuning does not establish a new talent position. The imported 31-point gate still exceeds the standard Level 30 budget.', source: BETA_PATCH_REVIEW.officialSource },
  { id: 'light_s_vigil', date: '2026-09-24', summary: 'Text clarifies that only damage returns mana.', impact: 'Do not assume healing triggers the mana return. The historical full Holy example is above the current point budget.', source: BETA_PATCH_REVIEW.officialSource },
] as const
export function routesUsingTalent(id: string) { return IMPACT_ROUTES.filter(route => (route.build[id] ?? 0) > 0) }
