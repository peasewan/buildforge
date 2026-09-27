import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EmbervillePage from './EmbervillePage'

describe('Emberville public pages', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it.each([
    ['planner', 'Emberville Build Planner'], ['builds', 'Emberville Builds'], ['classes', 'Emberville Classes'], ['inheritance', 'Emberville Skill Inheritance Guide'],
  ] as const)('renders %s with one clear H1 and sources', (id, heading) => {
    const { container } = render(<EmbervillePage pageId={id} />)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Official Steam page' })).toBeTruthy()
    expect(container.textContent).not.toContain('Swordsman')
  })

  it.each([
    ['planner', 'How planner data becomes available'],
    ['builds', 'Choose a build direction before choosing details'],
    ['classes', 'Class, weapon, and progression data status'],
    ['inheritance', 'Future compatibility matrix'],
  ] as const)('renders unique %s editorial content', (id, heading) => {
    render(<EmbervillePage pageId={id} />)
    expect(screen.getByRole('heading', { name: heading })).toBeTruthy()
  })

  it('shows source-backed class records and explicit unknown compatibility', () => {
    const { unmount } = render(<EmbervillePage pageId="classes" />)
    expect(screen.getByRole('heading', { name: 'Classes with traceable sources' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Knight' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Wanderer' })).toBeTruthy()
    unmount()
    render(<EmbervillePage pageId="inheritance" />)
    expect(screen.getByRole('table', { name: /Preview inheritance compatibility/ })).toBeTruthy()
    expect(screen.getAllByRole('cell', { name: 'Needs verification' })).toHaveLength(4)
    expect(screen.getByRole('heading', { name: 'Focus Strike' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Swift Foot' })).toBeTruthy()
  })

  it('updates the planner, persists notes, and emits bounded analytics events', () => {
    const gtag = vi.fn()
    window.gtag = gtag
    render(<EmbervillePage pageId="planner" />)
    fireEvent.click(screen.getByRole('button', { name: /Magic/ }))
    expect(screen.getByRole('heading', { name: 'Magic direction' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Skill inheritance/ }))
    expect(screen.getByText('Test active and passive skills learned through other classes.')).toBeTruthy()
    expect(screen.queryByText('Skill slots coming soon')).toBeNull()
    expect(screen.getByRole('combobox', { name: 'Base class' })).toBeTruthy()
    const notes = screen.getByPlaceholderText(/Record playstyle ideas/) as HTMLTextAreaElement
    fireEvent.change(notes, { target: { value: 'Test a flexible magic setup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(localStorage.getItem('emberville-build-notes')).toBe('Test a flexible magic setup')
    expect(gtag).toHaveBeenCalledWith('event', 'emberville_style_select', { style: 'magic' })
    expect(gtag).toHaveBeenCalledWith('event', 'emberville_notes_save', { has_notes: 1 })
  })
})
