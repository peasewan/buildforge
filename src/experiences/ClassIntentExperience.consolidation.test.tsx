import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import ClassCalculatorPage from '../ClassCalculatorPage'
import { hunterClassFixture } from '../data/fixtures/hunterClass.fixture'
import type { ClassDefinition, ClassPageDefinition } from '../lib/classPage'
import { decodeValidatedPlannerBuild } from '../lib/talentPlanner'
import ClassIntentExperience from './ClassIntentExperience'

afterEach(() => {
  cleanup()
  localStorage.clear()
  history.replaceState({}, '', '/')
})

function consolidatedFixture() {
  const source = (kind: ClassPageDefinition['kind']) => hunterClassFixture.pages.find(page => page.kind === kind)!
  const hub = { ...source('buildsHub'), slug: 'fixture-hunter-builds', relatedBuildIds: ['hunter-bm-leveling', 'hunter-mm-aoe'] }
  const destination = `/${hub.slug}`
  const spec = {
    ...source('specBuild'), slug: 'fixture-spec', retiredTo: destination,
    sections: [{ heading: 'Specialization testing notes', paragraphs: ['Keep pet uptime fixed while comparing these points.'] }],
  }
  const duplicate = {
    ...spec, slug: 'fixture-spec-duplicate', h1: 'Equivalent specialization route',
    sections: [{ heading: 'Additional specialization notes', paragraphs: ['Keep pet uptime fixed while comparing these points.', 'Record recovery after each pull.'] }],
  }
  const snapshot = {
    ...source('levelCap'), slug: 'fixture-level-20', retiredTo: destination,
    relatedBuildIds: ['hunter-bm-leveling', 'hunter-mm-aoe'],
    sections: [{ heading: 'Snapshot limits', paragraphs: ['This comparison preserves the eleven-point budget.'] }],
  }
  const role = {
    ...source('pvp'), slug: 'fixture-role', retiredTo: destination,
    sections: [{ heading: 'Encounter notes', paragraphs: ['Keep opponent and equipment unchanged.'] }],
    roleDecision: {
      question: 'Which encounter condition needs review?',
      options: [
        { id: 'opening', label: 'Opening window', explanation: 'Inspect the entry investment before the opening.', talentIds: ['mm-1'] },
        { id: 'recovery', label: 'Recovery window', explanation: 'Inspect the later investment during recovery.', talentIds: ['mm-2'] },
      ],
      sources: [{ label: 'Fixture encounter source', url: 'https://example.test/encounter' }],
    },
  }
  const def: ClassDefinition = {
    ...hunterClassFixture, id: 'fixture-hunter', contentPolicy: 'intent_tasks_v1',
    dataReview: { ready: true, current: true, notice: 'Reviewed fixture data.' },
    builds: hunterClassFixture.builds.map(build => ({ ...build, href: destination })),
    pages: [
      source('calculator'), hub, { ...source('talents'), slug: 'fixture-talents' }, spec, duplicate, snapshot, role,
      { ...spec, slug: 'fixture-other-hub', h1: 'Other hub task', retiredTo: '/different-hub' },
      { ...spec, slug: 'fixture-no-build', h1: 'No allocation task', primaryBuildId: undefined, relatedBuildIds: [] },
      { ...hub, slug: 'fixture-old-hub', h1: 'Old hub', retiredTo: destination },
    ],
  }
  return { def, hub, spec, snapshot, role }
}

function editedAllocation(link: HTMLElement, def: ClassDefinition) {
  const url = new URL(link.getAttribute('href')!, 'https://buildforgetools.com')
  expect(url.pathname).toBe('/hunter')
  expect(url.searchParams.get('level')).toBe('20')
  expect(url.searchParams.get('dataset')).toBe('1.60.1.69913')
  return decodeValidatedPlannerBuild(url.searchParams.get('build')!, def.talents, { ...def.plannerConfig, pointCap: 11 })
}

it('keeps consolidated specialization, Level 20, and role tasks usable within the hub', () => {
  const { def, hub, spec, snapshot, role } = consolidatedFixture()
  render(<ClassIntentExperience classDef={def} page={hub} />)
  const tasks = screen.getByRole('region', { name: 'Build planning tasks' })
  const picker = within(tasks).getByLabelText('Planning task') as HTMLSelectElement
  expect([...picker.options].map(option => option.value)).toEqual([spec.slug, snapshot.slug, role.slug])
  expect(editedAllocation(within(tasks).getByRole('link', { name: 'Edit in Calculator' }), def)).toEqual({ 'bm-1': 5, 'bm-2': 5, 'bm-3': 1 })
  fireEvent.change(within(tasks).getByLabelText('Your level'), { target: { value: '14' } })
  expect(editedAllocation(within(tasks).getByRole('link', { name: 'Edit this level in Calculator' }), def)).toEqual({ 'bm-1': 5 })
  expect(within(tasks).getAllByText('Keep pet uptime fixed while comparing these points.')).toHaveLength(1)
  expect(within(tasks).getByText('Record recovery after each pull.')).toBeTruthy()
  expect(within(tasks).queryByText('This comparison preserves the eleven-point budget.')).toBeNull()

  fireEvent.change(picker, { target: { value: snapshot.slug } })
  expect(within(tasks).queryByLabelText('Your level')).toBeNull()
  const snapshots = within(tasks).getAllByRole('link', { name: 'Inspect Level 20 snapshot' })
  expect(snapshots).toHaveLength(2)
  expect(editedAllocation(snapshots[0], def)).toEqual({ 'bm-1': 5, 'bm-2': 5, 'bm-3': 1 })
  expect(editedAllocation(snapshots[1], def)).toEqual({ 'mm-1': 5, 'mm-2': 5, 'mm-3': 1 })

  fireEvent.change(picker, { target: { value: role.slug } })
  expect(editedAllocation(within(tasks).getByRole('link', { name: 'Edit in Calculator' }), def)).toEqual({ 'mm-1': 5, 'mm-2': 5, 'mm-3': 1 })
  expect(within(tasks).getByRole('link', { name: 'Fixture encounter source' }).getAttribute('href')).toBe('https://example.test/encounter')
  fireEvent.click(within(tasks).getByRole('button', { name: 'Recovery window' }))
  expect(within(tasks).getByText('Inspect the later investment during recovery.')).toBeTruthy()
  const evidence = tasks.querySelector('.rs-evidence')!
  expect(evidence.textContent).toContain('Fixture Piercing Shots')
  expect(evidence.textContent).not.toContain('Fixture Steady Aim')

  fireEvent.change(picker, { target: { value: spec.slug } })
  expect(editedAllocation(within(tasks).getByRole('link', { name: 'Edit in Calculator' }), def)).toEqual({ 'bm-1': 5, 'bm-2': 5, 'bm-3': 1 })
  expect(tasks.querySelectorAll('[data-surface="build-discovery"]')).toHaveLength(0)
})

it('shows no consolidated task control on a hub without retired source tasks', () => {
  const { def, hub } = consolidatedFixture()
  render(<ClassIntentExperience classDef={{ ...def, pages: def.pages.filter(page => !page.retiredTo) }} page={hub} />)
  expect(screen.queryByLabelText('Planning task')).toBeNull()
})

it('keeps calculator navigation and its class footer off retired routes', () => {
  const { def, hub } = consolidatedFixture()
  const retiredLeveling = { ...def.pages.find(page => page.kind === 'calculator')!, kind: 'leveling' as const, slug: 'fixture-retired-leveling', retiredTo: `/${hub.slug}` }
  const retiredHub = { ...hub, retiredTo: '/fixture-talents' }
  const view = render(<ClassCalculatorPage classDef={{ ...def, pages: [...def.pages.filter(page => page !== hub), retiredHub, retiredLeveling] }} />)
  const nav = within(screen.getByRole('navigation', { name: 'Hunter pages' }))
  expect(nav.getByRole('link', { name: /Talents/ }).getAttribute('href')).toBe('/fixture-talents')
  const links = [...view.container.querySelectorAll('a[href]')].map(link => link.getAttribute('href'))
  expect(links).not.toContain('/fixture-retired-leveling')
  expect(links).not.toContain(`/${hub.slug}`)
})
