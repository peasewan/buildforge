import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import DungeonXpCompare from './DungeonXpCompare'
afterEach(cleanup)
it('starts without invented results and clears stale calculations on input changes', () => {
  render(<DungeonXpCompare dungeonName="Ruins of Lordaeron" level={20} role="tank" faction="all" />)
  expect(screen.getByText(/Ruins of Lordaeron · Level 20 · Tank · All factions/)).toBeTruthy()
  expect(screen.queryByText('16,000 XP/hour')).toBeNull()
  expect(screen.getByLabelText('First-run total XP').getAttribute('value')).toBe('')
  fireEvent.click(screen.getByRole('button',{name:'Try illustrative numbers'}))
  fireEvent.click(screen.getByRole('button',{name:'Compare XP per hour'}))
  expect(screen.getByText('16,000 XP/hour')).toBeTruthy()
  expect(screen.getByText(/Illustrative inputs/)).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Group wait (minutes)'),{target:{value:'20'}})
  expect(screen.queryByText('16,000 XP/hour')).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:'Clear'}))
  expect(screen.getByLabelText('First-run total XP').getAttribute('value')).toBe('')
})
