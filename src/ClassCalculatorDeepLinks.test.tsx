import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ClassCalculatorPage from './ClassCalculatorPage'
import { PUBLISHED_CLASSES } from './data/classes'
import { classPlannerHref } from './lib/classPage'
import { dominantPlannerBranch, encodePlannerBuild, totalPlannerPoints } from './lib/talentPlanner'

const scrolled = vi.fn()

beforeEach(() => {
  localStorage.clear()
  history.replaceState({}, '', '/')
  scrolled.mockClear()
  HTMLElement.prototype.scrollIntoView = scrolled
})

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear() })

describe('published class calculator links', () => {
  for (const classDef of PUBLISHED_CLASSES) {
    it(`${classDef.name} opens an exact editorial route at its editable tree`, () => {
      const route = classDef.builds.find(build => build.level === 20 && totalPlannerPoints(build.build) === 11)!
      expect(route, `${classDef.name} needs a legal Level 20 route`).toBeTruthy()
      const branch = dominantPlannerBranch(route.build, classDef.talents, classDef.branches, classDef.branches[0])
      history.replaceState({}, '', classPlannerHref(classDef, encodePlannerBuild(route.build), 20))

      render(<ClassCalculatorPage classDef={classDef} />)

      const tree = document.getElementById(`tree-${branch}`)!
      expect(tree).toBeTruthy()
      expect(scrolled).toHaveBeenCalled()
      expect(scrolled.mock.instances).toContain(tree)
      const selectedName = document.querySelector('.class-detail-title h3')?.textContent
      const selectedTalent = classDef.talents.find(talent => talent.name === selectedName)!
      expect(selectedTalent.branch).toBe(branch)
      expect(route.build[selectedTalent.id]).toBeGreaterThan(0)
      expect(within(tree).getByRole('button', { name: 'Start blank build' })).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Copy build link' })).toBeTruthy()
    })
  }
})
