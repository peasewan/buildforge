import { expect, it } from 'vitest'
import { RET_TWIST_REFERENCE } from '../data/paladinRetReference'
import { DATA_VERSION, talents } from '../data/talents'
import { branchPoints, BRANCHES, totalPoints } from './build'
import { decodeValidatedPlannerBuild, isValidPlannerBuild } from './talentPlanner'
import { comparePaladinAllocations, createPaladinSnapshot, parsePaladinSnapshot, paladinSnapshotHref } from './paladinComparison'

it('loads the exact sourced 13/0/38 allocation as a legal 51-point reference only', () => {
  const b = RET_TWIST_REFERENCE.build
  expect(BRANCHES.map(branch => branchPoints(b, branch, talents))).toEqual([13, 0, 38])
  expect(totalPoints(b)).toBe(51)
  expect(b).toMatchObject({ deflection: 2, divine_intellect: 5, vindication: 3, vengeance: 3, twist_of_light: 1 })
  expect(b.crusade).toBeUndefined()
  expect(isValidPlannerBuild(b, talents, { branches: BRANCHES, pointCap: 51 })).toBe(true)
  expect(createPaladinSnapshot(b, 30)).toBeNull()
  const snapshot = createPaladinSnapshot(b, 60)!
  const url = new URL(paladinSnapshotHref(snapshot), 'https://buildforgetools.com')
  expect(url.searchParams.get('level')).toBe('60')
  expect(url.searchParams.get('dataset')).toBe(DATA_VERSION)
  expect(decodeValidatedPlannerBuild(url.searchParams.get('id')!, talents, { branches: BRANCHES, pointCap: 51 })).toEqual(b)
})

it('rejects stale, malformed, overbudget and prerequisite-skipping saved comparisons', () => {
  const valid = createPaladinSnapshot({ divine_intellect: 5 }, 30)!
  expect(parsePaladinSnapshot(JSON.parse(JSON.stringify(valid)))).toEqual(valid)
  for (const value of [null, [], { ...valid, dataset: 'wow_forever_beta_1.60.1.69913' }, { ...valid, level: 31 },
    { ...valid, build: { holy_shock: 1 } }, { ...valid, build: { divine_intellect: 6 } }, { ...valid, build: { crusade: 1 } },
    { ...valid, level: 10 }, { ...valid, build: { divine_intellect: 1.5 } }]) {
    expect(parsePaladinSnapshot(value)).toBeNull()
  }
})

it('compares exact selected ranks in both directions without substituting generic tooltips', () => {
  const a = createPaladinSnapshot({ divine_intellect: 5, healing_light: 1 }, 30)!
  const b = createPaladinSnapshot({ divine_intellect: 4, divine_strength: 1, spiritual_focus: 1 }, 30)!
  const rows = comparePaladinAllocations(a, b)
  expect(rows.map(row => [row.talent.id, row.aRank, row.bRank, row.delta])).toEqual([
    ['divine_strength', 0, 1, 1], ['divine_intellect', 5, 4, -1], ['healing_light', 1, 0, -1], ['spiritual_focus', 0, 1, 1],
  ])
  expect(rows.find(row => row.talent.id === 'divine_intellect')).toMatchObject({
    aEffect: 'Increases your total Intellect by 10%.', bEffect: 'Increases your total Intellect by 8%.',
  })
  expect(rows.find(row => row.talent.id === 'healing_light')?.bEffect).toBe('Not selected')
  expect(comparePaladinAllocations(a, a)).toEqual([])
})
