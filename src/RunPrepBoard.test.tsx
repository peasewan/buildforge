import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import RunPrepBoard from './RunPrepBoard'

afterEach(() => { cleanup(); window.localStorage.clear() })

it('filters dungeons by the selected level while retaining conflicting source ranges as notes', () => {
  render(<RunPrepBoard />)
  expect(screen.getByRole('article', { name: 'Ruins of Lordaeron' })).toBeTruthy()
  expect(screen.getByText(/Blizzard lists 15–20; the Wowhead guide recommends 16–22/i)).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Run prep level'), { target: { value: '16' } })
  expect(screen.getByRole('article', { name: 'Hall of Thanes' })).toBeTruthy()
  expect(screen.getByRole('article', { name: 'Ruins of Lordaeron' })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Run prep level'), { target: { value: '25' } })
  expect(screen.getByRole('status').textContent).toMatch(/No listed dungeon level range includes level 25/)
  fireEvent.change(screen.getByLabelText('Run prep level'), { target: { value: '28' } })
  expect(screen.getByRole('article', { name: 'Excavation Site: Wetlands' })).toBeTruthy()
  expect(screen.getByText(/final boss is level 31/i)).toBeTruthy()
})

it('filters named quest pickups by faction and links each one to its source', () => {
  render(<RunPrepBoard />)
  const ruins = screen.getByRole('article', { name: 'Ruins of Lordaeron' })
  expect(within(ruins).getByRole('checkbox', { name: /The Wrath of Rath'mael/ })).toBeTruthy()
  expect(within(ruins).getAllByRole('link', { name: 'Source' })[0].getAttribute('href')).toContain('ruins-of-lordaeron')
  fireEvent.change(screen.getByLabelText('Faction view'), { target: { value: 'alliance' } })
  expect(within(ruins).queryByRole('checkbox', { name: /The Wrath of Rath'mael/ })).toBeNull()
  expect(within(ruins).getByRole('checkbox', { name: /Crest of Lordaeron/ })).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Run prep level'), { target: { value: '28' } })
  expect(screen.getByRole('checkbox', { name: /Highland Hides/ })).toBeTruthy()
  expect(screen.getByText(/Prerequisite disputed: the guide lists Daily Delivery/i)).toBeTruthy()
})

it('persists verified quest and personal checklist ticks in local storage', () => {
  const first = render(<RunPrepBoard />)
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
  render(<RunPrepBoard />)
  const reloaded = screen.getByRole('article', { name: 'Ruins of Lordaeron' })
  expect((within(reloaded).getByRole('checkbox', { name: /Confirm your group/i }) as HTMLInputElement).checked).toBe(true)
  expect((within(reloaded).getByRole('checkbox', { name: /The Wrath of Rath'mael/ }) as HTMLInputElement).checked).toBe(true)
})
