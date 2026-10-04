import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import PaladinLevelingTimeline from './PaladinLevelingTimeline'
afterEach(cleanup)
it('moves snapshots, next talent and the link together without spending future points', () => {
  render(<PaladinLevelingTimeline/>)
  expect(screen.getByRole('link',{name:'Edit Level 30 in Calculator'}).getAttribute('href')).toContain('&level=30#calculator')
  expect(screen.getByText('Current Beta cap reached')).toBeTruthy()
  fireEvent.click(screen.getByRole('button',{name:'Level 20'}))
  expect(screen.getByText('Next talent · Level 21')).toBeTruthy()
  expect(screen.getByRole('link',{name:'Edit Level 20 in Calculator'}).getAttribute('href')).toContain('pursuit_of_justice.1')
  fireEvent.change(screen.getByRole('slider'),{target:{value:'29'}})
  expect(screen.getByText('Vengeance · rank 1')).toBeTruthy()
  expect(screen.getByRole('link',{name:'Edit Level 29 in Calculator'}).getAttribute('href')).not.toContain('vengeance.1')
})
