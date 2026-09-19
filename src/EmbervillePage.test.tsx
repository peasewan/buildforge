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

  it('updates the planner, persists notes, and emits bounded analytics events', () => {
    const gtag = vi.fn()
    window.gtag = gtag
    render(<EmbervillePage pageId="planner" />)
    fireEvent.click(screen.getByRole('button', { name: /Magic/ }))
    expect(screen.getByRole('heading', { name: 'Magic direction' })).toBeTruthy()
    const notes = screen.getByPlaceholderText(/Record playstyle ideas/) as HTMLTextAreaElement
    fireEvent.change(notes, { target: { value: 'Test a flexible magic setup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save notes' }))
    expect(localStorage.getItem('emberville-build-notes')).toBe('Test a flexible magic setup')
    expect(gtag).toHaveBeenCalledWith('event', 'emberville_style_select', { style: 'magic' })
    expect(gtag).toHaveBeenCalledWith('event', 'emberville_notes_save', { has_notes: 1 })
  })
})
