import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EmbervillePage from './EmbervillePage'

describe('Emberville public pages', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it.each([
    ['planner', 'Emberville Preview Notebook'], ['classes', 'Emberville Classes'], ['inheritance', 'Emberville Skill Inheritance Guide'],
  ] as const)('renders %s with one clear H1 and sources', (id, heading) => {
    const { container } = render(<EmbervillePage pageId={id} />)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    const sourceReview = container.querySelector('.ember-hero .ember-status')
    expect(sourceReview?.textContent).toContain('Source reviewed Sep 27, 2026')
    expect(sourceReview?.textContent).not.toContain('Updated')
    expect(sourceReview?.textContent).not.toContain('Oct 9, 2026')
    expect(screen.getByRole('link', { name: 'Official Steam page' })).toBeTruthy()
    expect(container.textContent).not.toContain('Swordsman')
  })

  it.each([
    ['planner', 'How notebook evidence is reviewed'],
    ['classes', 'Class, weapon, and progression data status'],
    ['inheritance', 'Future compatibility matrix'],
  ] as const)('renders unique %s editorial content', (id, heading) => {
    render(<EmbervillePage pageId={id} />)
    expect(screen.getByRole('heading', { name: heading })).toBeTruthy()
  })

  it('keeps build-direction cards and a practical planning sequence on the planner', () => {
    render(<EmbervillePage pageId="planner" />)
    expect(screen.getByRole('heading', { name: 'Explore a playstyle' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Hybrid direction' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Build planning principles' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Turn a direction into questions to test' })).toBeTruthy()
  })

  it('names the notebook in Emberville navigation without promising build validation', () => {
    const { container } = render(<EmbervillePage pageId="planner" />)
    const nav = screen.getByRole('navigation', { name: 'Emberville' })
    expect(within(nav).getByRole('link', { name: 'Preview notebook' }).getAttribute('href')).toBe('/emberville')
    expect(screen.getByRole('heading', { name: 'Keep a sourced planning notebook' })).toBeTruthy()
    expect(container.textContent).not.toContain('Emberville Build Planner')
    expect(container.textContent).toContain('cannot validate game builds or inheritance compatibility')
    expect(container.querySelector('.ember-footer')?.textContent).toContain('Preview notes and source guides for Emberville.')
    expect(container.querySelector('.ember-footer')?.textContent).not.toContain('skill calculators')
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
    expect(within(screen.getByRole('complementary')).getByRole('heading', { name: 'Magic direction' })).toBeTruthy()
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
