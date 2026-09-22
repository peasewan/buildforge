import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LegacyIntentExperience from './LegacyIntentExperience'
import EmbervillePage from '../EmbervillePage'
import TrustPage from '../TrustPage'
import { EMBERVILLE_PAGES } from '../data/emberville'
import { TRUST_PAGES } from '../data/trustPages'

const gate = vi.hoisted(() => ({ enabled: true }))
vi.mock('./rollout', () => ({ experienceEnabled: () => gate.enabled }))
afterEach(() => { cleanup(); gate.enabled = true })

const paths = ['/emberville', '/emberville-builds', '/emberville-classes', '/emberville-skill-inheritance', '/about', '/contact', '/privacy']

describe('Emberville and trust intent tasks', () => {
  it.each(paths)('renders a useful task for enabled %s and nothing for an inactive path', (path) => {
    const { rerender, container } = render(<LegacyIntentExperience path={path} />)
    expect(screen.getByRole('region', { name: 'Page planning task' })).toBeTruthy()
    expect(container.querySelector('a,button,select')).not.toBeNull()
    gate.enabled = false
    rerender(<LegacyIntentExperience path={path} />)
    expect(container.innerHTML).toBe('')
  })

  it('never renders a task on protected Paladin routes, even if enabled accidentally', () => {
    const { container } = render(<LegacyIntentExperience path="/paladin" />)
    expect(container.innerHTML).toBe('')
  })

  it('compares directions honestly, including identical choices', () => {
    render(<LegacyIntentExperience path="/emberville-builds" />)
    fireEvent.change(screen.getByLabelText('First direction'), { target: { value: 'Hybrid' } })
    expect(screen.getByRole('status').textContent).toContain('Depends on confirmed inheritance compatibility')
    fireEvent.change(screen.getByLabelText('Second direction'), { target: { value: 'Hybrid' } })
    expect(screen.getByRole('status').textContent).toContain('Same direction selected')
    expect(screen.getByText(/Exact class, weapon and skill combinations remain unknown/)).toBeTruthy()
  })

  it('switches class evidence between distinct supported systems', () => {
    render(<LegacyIntentExperience path="/emberville-classes" />)
    fireEvent.click(screen.getByRole('button', { name: '2. Weapons and combos' }))
    expect(screen.getByRole('status').textContent).toContain('Exact weapon records and class relationships remain in review')
    fireEvent.click(screen.getByRole('button', { name: '3. Progression and inheritance' }))
    expect(screen.getByRole('status').textContent).toContain('Unlock thresholds and compatibility rules remain in review')
  })

  it('traces inheritance without making unverified skills selectable', () => {
    render(<LegacyIntentExperience path="/emberville-skill-inheritance" />)
    fireEvent.click(screen.getByRole('button', { name: '2. Review active or passive skill' }))
    expect(screen.getByRole('status').textContent).toContain('Individual skill names, ranks and effects are not verified')
    fireEvent.click(screen.getByRole('button', { name: '3. Check destination compatibility' }))
    expect(screen.getByRole('status').textContent).toContain('No source-to-destination combination can be validated')
  })

  it('connects the planner to its actual notes and companion tasks', () => {
    render(<EmbervillePage pageId="planner" />)
    const task = screen.getByRole('region', { name: 'Page planning task' })
    expect(within(task).getByRole('link', { name: 'Choose a direction and write local notes' }).getAttribute('href')).toBe('#planner')
    expect(document.querySelector('#planner textarea')).toBeTruthy()
    expect(within(task).getAllByRole('link')).toHaveLength(4)
  })

  it('tailors report instructions and opens the existing private form', () => {
    const open = vi.fn()
    render(<><button className="feedback-trigger" onClick={open}>Feedback</button><LegacyIntentExperience path="/contact" /></>)
    fireEvent.change(screen.getByLabelText('Report topic'), { target: { value: 'Bug' } })
    expect(screen.getByRole('status').textContent).toContain('steps to reproduce')
    fireEvent.click(screen.getByRole('button', { name: 'Open private feedback form' }))
    expect(open).toHaveBeenCalledOnce()
  })

  it.each(TRUST_PAGES)('provides working local section links for $id', (page) => {
    render(<TrustPage pageId={page.id} />)
    const nav = screen.getByRole('navigation', { name: `${page.title} sections` })
    for (const link of within(nav).getAllByRole('link')) {
      const id = link.getAttribute('href')!.slice(1)
      expect(document.getElementById(id)?.querySelector('h2')?.textContent).toBe(link.textContent)
    }
  })

  it.each(EMBERVILLE_PAGES)('keeps $slug original heading and editorial content', (page) => {
    const { container, rerender } = render(<EmbervillePage pageId={page.id} />)
    const headings = [...container.querySelectorAll('h1')].map((item) => item.textContent)
    const oldEditorial = container.querySelector('.ember-editorial')?.innerHTML
    const oldLinks = [...container.querySelectorAll('.ember-editorial a')].map((item) => item.getAttribute('href'))
    gate.enabled = false
    rerender(<EmbervillePage pageId={page.id} />)
    expect([...container.querySelectorAll('h1')].map((item) => item.textContent)).toEqual(headings)
    expect(container.querySelector('.ember-editorial')?.innerHTML).toEqual(oldEditorial)
    expect([...container.querySelectorAll('.ember-editorial a')].map((item) => item.getAttribute('href'))).toEqual(oldLinks)
  })
  it.each(paths)('preserves every preexisting body node and anchor on %s', (path) => {
    const ember = EMBERVILLE_PAGES.find((page) => `/${page.slug}` === path)
    const trust = TRUST_PAGES.find((page) => `/${page.slug}` === path)
    const page = ember ? <EmbervillePage pageId={ember.id} /> : <TrustPage pageId={trust!.id} />
    const { container, rerender } = render(page)
    const originalWithTask = container.querySelector('main')!.cloneNode(true) as HTMLElement
    originalWithTask.querySelector('[data-intent-experience]')!.remove()
    gate.enabled = false
    // A fresh element forces the page composition to re-evaluate its pathname gate.
    rerender(ember ? <EmbervillePage pageId={ember.id} /> : <TrustPage pageId={trust!.id} />)
    expect(container.querySelector('main')!.innerHTML).toBe(originalWithTask.innerHTML)
  })

})
