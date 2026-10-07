import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import RunPrepBoard from './RunPrepBoard'

afterEach(() => { cleanup(); window.localStorage.clear() })

it('shows the selected dungeon and keeps conflicting source ranges as notes', () => {
  const view = render(<RunPrepBoard dungeonId="ruins-of-lordaeron" faction="all" level={20} role="tank" />)
  expect(screen.getByRole('article', { name: 'Ruins of Lordaeron' })).toBeTruthy()
  expect(screen.queryByRole('article', { name: 'Hall of Thanes' })).toBeNull()
  expect(screen.getByText(/Blizzard lists 15–20; the Wowhead guide recommends 16–22/i)).toBeTruthy()
  view.rerender(<RunPrepBoard dungeonId="ruins-of-lordaeron" faction="all" level={25} role="tank" />)
  expect(screen.getByRole('status').textContent).toMatch(/No listed dungeon level range includes level 25/)
  view.rerender(<RunPrepBoard dungeonId="excavation-site" faction="all" level={28} role="tank" />)
  expect(screen.getByRole('article', { name: 'Excavation Site: Wetlands' })).toBeTruthy()
  expect(screen.getByText(/final boss is level 31/i)).toBeTruthy()
})

it('filters named quest pickups by faction and links each one to its source', () => {
  const view = render(<RunPrepBoard dungeonId="ruins-of-lordaeron" faction="all" level={20} role="tank" />)
  const ruins = screen.getByRole('article', { name: 'Ruins of Lordaeron' })
  const hordeQuest = within(ruins).getByRole('checkbox', { name: /The Wrath of Rath'mael/ }).closest('.pt-run-prep-quest') as HTMLElement
  expect(within(hordeQuest).getByText('Horde')).toBeTruthy()
  const sharedQuest = within(ruins).getByRole('checkbox', { name: /Crest of Lordaeron/ }).closest('.pt-run-prep-quest') as HTMLElement
  expect(within(sharedQuest).getByText('Both factions')).toBeTruthy()
  expect(within(ruins).getAllByRole('link', { name: 'Source' })[0].getAttribute('href')).toContain('ruins-of-lordaeron')
  view.rerender(<RunPrepBoard dungeonId="ruins-of-lordaeron" faction="alliance" level={20} role="tank" />)
  expect(within(ruins).queryByRole('checkbox', { name: /The Wrath of Rath'mael/ })).toBeNull()
  expect(within(ruins).getByRole('checkbox', { name: /Crest of Lordaeron/ })).toBeTruthy()
  view.rerender(<RunPrepBoard dungeonId="excavation-site" faction="alliance" level={28} role="tank" />)
  expect(screen.getByRole('checkbox', { name: /Highland Hides/ })).toBeTruthy()
  expect(screen.getByText(/Prerequisite disputed: the guide lists Daily Delivery/i)).toBeTruthy()
})

it('persists verified quest and personal checklist ticks in local storage', () => {
  const first = render(<RunPrepBoard dungeonId="ruins-of-lordaeron" faction="all" level={20} role="tank" />)
  const ruins = screen.getByRole('article', { name: 'Ruins of Lordaeron' })
  const personal = within(ruins).getByRole('checkbox', { name: /Confirm your group/i }) as HTMLInputElement
  const quest = within(ruins).getByRole('checkbox', { name: /The Wrath of Rath'mael/ }) as HTMLInputElement
  fireEvent.click(personal)
  fireEvent.click(quest)
  const stored = window.localStorage.getItem('buildforge:run-prep:v1') ?? ''
  expect(stored).toContain('"group":true')
  expect(stored).toContain('"quest:wrath-rathmael":true')
  expect(screen.getByText(/personal reminders, not quest prerequisites/i)).toBeTruthy()
  first.unmount()
  render(<RunPrepBoard dungeonId="ruins-of-lordaeron" faction="all" level={20} role="tank" />)
  const reloaded = screen.getByRole('article', { name: 'Ruins of Lordaeron' })
  expect((within(reloaded).getByRole('checkbox', { name: /Confirm your group/i }) as HTMLInputElement).checked).toBe(true)
  expect((within(reloaded).getByRole('checkbox', { name: /The Wrath of Rath'mael/ }) as HTMLInputElement).checked).toBe(true)
})
