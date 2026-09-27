import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import PlanningToolsPage from './PlanningToolsPage'
afterEach(cleanup)
it('filters a dungeon route and builds a lower-level calculator snapshot', () => {
  render(<PlanningToolsPage tool="dungeon-finder" />)
  fireEvent.change(screen.getByLabelText('Class'),{target:{value:'warrior'}})
  const link = screen.getByRole('link',{name:/Edit level 13 snapshot/i})
  expect(link.getAttribute('href')).toContain('/warrior?build=')
  expect(screen.getByText('4 talent points')).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Your level'),{target:{value:'17'}})
  expect(screen.getByRole('link',{name:/Edit level 17 snapshot/i})).toBeTruthy()
  expect(screen.getByText('8 talent points')).toBeTruthy()
  expect(screen.getByRole('button',{name:/Excavation Site/i}).hasAttribute('disabled')).toBe(true)
})
it('class picker shows explainable matches and a useful empty state', () => {
  render(<PlanningToolsPage tool="class-picker" />)
  fireEvent.change(screen.getByLabelText('Party role'),{target:{value:'heal'}})
  fireEvent.change(screen.getByLabelText('Activity'),{target:{value:'dungeon'}})
  expect(screen.getAllByText('Healing role matches your choice.').length).toBeGreaterThan(1)
  fireEvent.change(screen.getByLabelText('Combat style'),{target:{value:'melee'}})
  expect(screen.getByText(/No published route matches all three choices/i)).toBeTruthy()
  expect(screen.getByRole('button',{name:'Reset preferences'})).toBeTruthy()
})
