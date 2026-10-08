import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import App from '../App'
import GuidePage from '../GuidePage'
import { archivedBetaTalents, betaTalents, DATA_VERSION, talents } from './talents'
import { archivedBetaDataset, betaDataset } from './datasets'
import { compareTalentVersions } from '../lib/talentDiff'

afterEach(() => { cleanup(); localStorage.clear(); window.history.replaceState({}, '', '/paladin') })

describe('reviewed Paladin 70245 promotion', () => {
  it('promotes fifty current nodes with separate structural and rank-text evidence', () => {
    expect(DATA_VERSION).toBe('wow_forever_beta_1.60.1.70245')
    expect(talents).toHaveLength(50)
    expect(betaTalents).toHaveLength(50)
    expect(talents.some(t => ['improved_holy_strike', 'crusade'].includes(t.id))).toBe(false)
    for (const talent of talents) {
      expect(talent.verification.name).toBe('client_verified')
      expect(talent.verification.maxRank).toBe('client_verified')
      expect(talent.verification.tier).toBe('client_verified')
      expect(talent.verification.description).toBe('community_verified')
      expect(talent.verification.prerequisiteRule).toBe('derived_assumption')
      expect(talent.sources.some(source => source.url?.includes('wago.tools/db2/TraitNode/') && source.url.includes('70245'))).toBe(true)
      expect(talent.sources.some(source => source.url === 'https://talentsforever.com/data.json')).toBe(true)
    }
  })

  it('accounts for every archived node and the reviewed rank-string changes', () => {
    const diff = compareTalentVersions(archivedBetaDataset, betaDataset)
    expect(archivedBetaTalents).toHaveLength(52)
    expect(diff.added).toHaveLength(0)
    expect(diff.removed.map(talent => talent.id)).toEqual(['improved_holy_strike', 'crusade'])
    expect(diff.changed).toHaveLength(14)
    expect(diff.unchanged).toHaveLength(36)
    expect(diff.changed.reduce((sum, change) => sum + (change.changes.rankDescriptions?.length ?? 0), 0)).toBe(32)
    for (const talent of talents) {
      const old = archivedBetaTalents.find(candidate => candidate.id === talent.id)!
      expect([talent.clientNodeId, talent.spellId, talent.row, talent.column, talent.maxRank, talent.prerequisite])
        .toEqual([old.clientNodeId, old.spellId, old.row, old.column, old.maxRank, old.prerequisite])
    }
  })

  it('keeps two searchable historical removals and visible licensed rank-text attribution', () => {
    const html = renderToStaticMarkup(<GuidePage />)
    expect(html).toContain('50 current talents')
    expect(html).toContain('52-node historical')
    expect(html).toContain('Client-confirmed removal')
    expect(html).toContain('https://talentsforever.com/data.json')
    expect(html).toContain('https://creativecommons.org/licenses/by/4.0/')
    expect(html).toContain('adapted')
    expect(html).not.toContain('Removal under review')
  })

  it('shows old shared ranks as history without importing or rewriting part of the allocation', () => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
    const code = 'benediction.5~crusade.2~improved_holy_strike.1'
    const path = `/build?id=${code}#calculator`
    window.history.replaceState({}, '', path)
    const first = render(<App />)
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain('Crusade 2/2')
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain('Improved Holy Strike 1/2')
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain(code)
    expect(screen.getByRole('button', { name: 'Copy Build Link' }).hasAttribute('disabled')).toBe(true)
    expect(window.location.search).toBe(`?id=${code}`)
    first.unmount()
    render(<App />)
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain(code)
  })

  it.each(['shared', 'saved'] as const)('preserves a %s archive through an attempted planning-mode change and reload', (source) => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
    const code = 'benediction.5~crusade.2'
    if (source === 'shared') window.history.replaceState({}, '', `/build?id=${code}#calculator`)
    else localStorage.setItem('wow-forever-paladin-build', code)
    const originalPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const first = render(<App />)
    const mode = screen.getByRole('combobox', { name: 'Planning level' }) as HTMLSelectElement
    expect(mode.disabled).toBe(true)
    fireEvent.change(mode, { target: { value: '30' } })
    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(originalPath)
    if (source === 'saved') expect(localStorage.getItem('wow-forever-paladin-build')).toBe(code)
    first.unmount()
    render(<App />)
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain(code)
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain('Crusade 2/2')
    fireEvent.click(screen.getByRole('button', { name: 'Start a new current build' }))
    const currentMode = screen.getByRole('combobox', { name: 'Planning level' }) as HTMLSelectElement
    expect(currentMode.disabled).toBe(false)
    fireEvent.change(currentMode, { target: { value: '30' } })
    expect(currentMode.value).toBe('30')
    expect(new URLSearchParams(window.location.search).get('id')).toBe('')
  })

  it('preserves an old saved draft until the player explicitly starts a new build', () => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
    const code = 'benediction.5~crusade.2'
    localStorage.setItem('wow-forever-paladin-build', code)
    render(<App />)
    expect(screen.getByRole('region', { name: 'Historical Paladin allocation' }).textContent).toContain('Crusade 2/2')
    expect(localStorage.getItem('wow-forever-paladin-build')).toBe(code)
    fireEvent.click(screen.getByRole('button', { name: 'Start a new current build' }))
    expect(screen.queryByRole('region', { name: 'Historical Paladin allocation' })).toBeNull()
    expect(localStorage.getItem('wow-forever-paladin-build')).toBe('')
  })
})
