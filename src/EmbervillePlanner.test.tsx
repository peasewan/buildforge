import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EmbervillePlanner from './EmbervillePlanner'
import { EMBERVILLE_CATALOG } from './data/embervilleCatalog'

describe('Emberville sourced planning workspace', () => {
  beforeEach(() => { localStorage.clear(); window.gtag = vi.fn() })
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('offers sourced class and weapon choices without claiming unknown inheritance is valid', () => {
    render(<EmbervillePlanner />)
    expect(screen.getByRole('combobox', { name: 'Base class' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Weapon category' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Inherited active skills' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Inherited passive skills' })).toBeNull()
    expect(screen.getByText('Needs verification', { exact: true })).toBeTruthy()
    expect(screen.queryByText('Confirmed compatible', { exact: true })).toBeNull()
    expect(screen.getByRole('note').textContent).toMatch(/no reviewed active or passive skills/i)
    expect(screen.getByRole('textbox', { name: /Build notes/ })).toBeTruthy()
  })

  it('retains old notes and saves a versioned draft without sending note text to analytics', () => {
    localStorage.setItem('emberville-build-notes', 'Existing notes')
    render(<EmbervillePlanner />)
    const notes = screen.getByRole('textbox', { name: /Build notes/ }) as HTMLTextAreaElement
    expect(notes.value).toBe('Existing notes')
    fireEvent.click(screen.getByRole('button', { name: /Magic/ }))
    fireEvent.change(notes, { target: { value: 'Private new idea' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    const draft = JSON.parse(localStorage.getItem('emberville-build-draft-v1')!)
    expect(draft.style).toBe('magic')
    expect(draft.notes).toBe('Private new idea')
    expect(draft.dataVersion).toBeTruthy()
    expect(JSON.stringify(vi.mocked(window.gtag).mock.calls)).not.toContain('Private new idea')
    expect(localStorage.getItem('emberville-build-notes')).toBe('Private new idea')
  })

  it('keeps the tool usable when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage unavailable') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable') })
    render(<EmbervillePlanner />)
    fireEvent.click(screen.getByRole('button', { name: /Ranged/ }))
    expect(screen.getByRole('heading', { name: 'Ranged direction' })).toBeTruthy()
    fireEvent.change(screen.getByRole('textbox', { name: /Build notes/ }), { target: { value: 'An idea' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(screen.getByRole('status').textContent).toMatch(/could not be saved/i)
  })

  it('ignores a malformed stored draft and still restores legacy notes', () => {
    localStorage.setItem('emberville-build-draft-v1', '{bad json')
    localStorage.setItem('emberville-build-notes', 'Legacy idea')
    render(<EmbervillePlanner />)
    expect((screen.getByRole('textbox', { name: /Build notes/ }) as HTMLTextAreaElement).value).toBe('Legacy idea')
    expect(screen.getByRole('heading', { name: 'Melee direction' })).toBeTruthy()
  })
})

describe('Emberville reviewed record selection', () => {
  afterEach(() => cleanup())
  it('updates the summary, saves actual record IDs and restores the selection', () => {
    localStorage.clear()
    const { unmount } = render(<EmbervillePlanner />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Base class' }), { target: { value: 'knight' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Weapon category' }), { target: { value: 'sword' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Wanderer' }))
    expect(screen.getByRole('link', { name: 'Cygnus Cross: Knight reveal' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    const saved = JSON.parse(localStorage.getItem('emberville-build-draft-v1')!)
    expect(saved.baseClassId).toBe('knight')
    expect(saved.weaponId).toBe('sword')
    expect(saved.learnedClassIds).toEqual(['wanderer'])
    unmount()
    render(<EmbervillePlanner />)
    expect((screen.getByRole('combobox', { name: 'Base class' }) as HTMLSelectElement).value).toBe('knight')
    expect((screen.getByRole('combobox', { name: 'Weapon category' }) as HTMLSelectElement).value).toBe('sword')
    expect((screen.getByRole('checkbox', { name: 'Wanderer' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.getByText('Needs verification', { exact: true })).toBeTruthy()
  })
})


describe('Emberville staged skill data', () => {
  afterEach(() => cleanup())
  it('lets users remove a selected skill after its learned source class is removed', () => {
    localStorage.clear()
    const data = structuredClone(EMBERVILLE_CATALOG)
    // Synthetic classification for exercising future reviewed data, never a production claim.
    data.skills[0].name.value = 'Fixture active skill'
    data.skills[0].type = { value: 'active', verificationStatus: 'official', sourceIds: ['steam-store'] }
    render(<EmbervillePlanner data={data} />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Base class' }), { target: { value: 'knight' } })
    const learned = screen.getByRole('checkbox', { name: 'Wanderer' })
    fireEvent.click(learned)
    const skill = screen.getByRole('checkbox', { name: /Fixture active skill/ }) as HTMLInputElement
    fireEvent.click(skill)
    expect(skill.checked).toBe(true)
    fireEvent.click(learned)
    expect(skill.disabled).toBe(false)
    fireEvent.click(skill)
    expect(skill.checked).toBe(false)
  })
})
