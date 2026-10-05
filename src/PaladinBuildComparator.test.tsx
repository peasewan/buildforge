import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import PaladinBuildComparator from './PaladinBuildComparator'
import PaladinRouteTimeline from './PaladinRouteTimeline'
import { PROTECTION_POINT_STEPS } from './data/paladinDecisionTools'
import { pageForPath } from './lib/routes'
import { track } from './lib/analytics'
vi.mock('./lib/analytics', () => ({ track: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('switches route and suppresses impossible Twist loading without recording a completed build', () => {
  render(<PaladinBuildComparator />)
  fireEvent.click(screen.getByRole('button', { name: 'Holy Shock example' }))
  expect(screen.getByRole('link', { name: 'Edit Level 30 in Calculator' }).getAttribute('href')).toContain('holy_shock.1')
  fireEvent.click(screen.getByRole('button', { name: 'Level 25' }))
  expect(screen.getByRole('link', { name: 'Edit Level 25 in Calculator' }).getAttribute('href')).not.toContain('holy_shock.1')
  fireEvent.click(screen.getByRole('button', { name: 'Twist of Light' }))
  expect(screen.queryByRole('link', { name: /Edit Level/ })).toBeNull()
  expect(screen.getByRole('status').textContent).toContain('31 points')
  expect(vi.mocked(track).mock.calls.map(call => call[0])).toEqual(['build_comparison_select', 'leveling_step_select', 'build_comparison_select'])
})
it('updates Protection allocation and Next Talent together', () => {
  render(<PaladinRouteTimeline steps={PROTECTION_POINT_STEPS} routeId="protection" title="Protection timeline" evidence="Editorial" />)
  fireEvent.click(screen.getByRole('button', { name: 'Level 20' }))
  expect(screen.getByText('Next: Precision · rank 2')).toBeTruthy()
  const href = screen.getByRole('link', { name: 'Edit Level 20 in Calculator' }).getAttribute('href')!
  expect(href).toContain('precision.1')
  expect(href).not.toContain('improved_righteous_fury')
})
it('serves crawlable distinct comparisons with one H1 and keeps shared builds noindex', () => {
  const html = renderToStaticMarkup(<PaladinBuildComparator />)
  expect(html.match(/<h1>/g)).toHaveLength(1)
  expect(html).toContain('Twist of Light')
  expect(html).toContain('Holy Shock example')
  expect(html).toContain('data-surface="paladin-build-comparator"')
  expect(pageForPath('/wow-forever-paladin-build-comparator').canonical).toBe('https://buildforgetools.com/wow-forever-paladin-build-comparator')
  expect(pageForPath('/build').robots).toBe('noindex, follow')
})
