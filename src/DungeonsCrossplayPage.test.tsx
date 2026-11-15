import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import DungeonsCrossplayPage from './DungeonsCrossplayPage'

afterEach(cleanup)
const choose = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

it('diagnoses a cross-platform invite and explains console access', () => {
  render(<DungeonsCrossplayPage />)
  expect(screen.getByRole('heading', { name: 'Crossplay is supported' })).toBeTruthy()
  choose('Troubleshoot a symptom', 'My friend’s code fails')
  expect(screen.getByText(/old party’s code expires/)).toBeTruthy()
  expect(screen.getByText(/Check Nintendo Switch Online/)).toBeTruthy()
  choose('Friend’s device', 'PlayStation 4')
  expect(screen.getByRole('heading', { name: /PlayStation 4 has no native/ })).toBeTruthy()
})
it('counts couch and remote heroes together and supports offline play on one device', () => {
  render(<DungeonsCrossplayPage />)
  fireEvent.click(screen.getByRole('button', { name: 'Couch + online' }))
  choose('Remote players', '3')
  expect(screen.getByRole('heading', { name: /5 heroes exceed/ })).toBeTruthy()
  choose('Players on host device', '3')
  choose('Remote players', '1')
  expect(screen.getByRole('heading', { name: 'Mixed co-op is supported' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Couch co-op' }))
  expect(screen.queryByLabelText('Friend’s device')).toBeNull()
  expect(screen.getByText(/For an offline session/)).toBeTruthy()
  choose('Troubleshoot a symptom', 'My second controller cannot join')
  expect(screen.getByText(/Pair the extra controller/)).toBeTruthy()
})
it('shows the applicable platform requirements and targeted symptom checks', () => {
  render(<DungeonsCrossplayPage />)
  choose('Host device', 'PlayStation 5')
  choose('Friend’s device', 'Xbox Series X|S')
  expect(screen.getByText(/Check PlayStation Plus/)).toBeTruthy()
  expect(screen.getByText(/Game Pass Essential, Premium and Ultimate/)).toBeTruthy()
  for (const [issue, advice] of [
    ['Join a Party is greyed out', /filter to Online Heroes/],
    ['Multiplayer is restricted', /family organizer/],
    ['Our versions differ', /Compare the full in-game version/],
  ] as const) {
    choose('Troubleshoot a symptom', issue)
    expect(screen.getByText(advice)).toBeTruthy()
  }
  choose('Host device', 'Steam (Windows)')
  expect(screen.getByText(/On Steam, sign in with the Microsoft account/)).toBeTruthy()
})
