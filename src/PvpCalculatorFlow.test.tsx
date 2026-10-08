import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import BuildLandingPage from './BuildLandingPage'
import ClassCalculatorPage from './ClassCalculatorPage'
import ClassDocumentPage from './ClassDocumentPage'
import { hunterClass } from './data/classes/hunter'
import { warriorClass } from './data/classes/warrior'
import { decodeBuild, incrementTalent, totalPoints, type Build } from './lib/build'
import { talents } from './data/talents'

let copiedUrl = ''
let refuseClipboard = false
let scrollTargets: string[] = []

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  history.replaceState({}, '', '/paladin')
  copiedUrl = ''
  refuseClipboard = false
  scrollTargets = []
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async (value: string) => {
      if (refuseClipboard) throw new Error('Clipboard permission denied')
      copiedUrl = value
    },
  } })
  Object.defineProperty(document, 'execCommand', { configurable: true, value: () => false })
  HTMLElement.prototype.scrollIntoView = function () { scrollTargets.push(this.id) }
  vi.stubGlobal('fetch', async () => new Response('{}', { status: 200 }))
  window.fetch = globalThis.fetch
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
})

function enterPaladinVariant(pageId: 'retribution-pvp' | 'protection-pvp' | 'holy-pvp') {
  render(<BuildLandingPage pageId={pageId} />)
  const href = screen.getByRole('link', { name: 'Open Planner' }).getAttribute('href')!
  cleanup()
  history.replaceState({}, '', href)
  render(<App />)
}

function enterPaladinPvpStarter() {
  render(<BuildLandingPage pageId="pvp" />)
  const href = screen.getByRole('link', { name: /Load Retribution route/ }).getAttribute('href')!
  cleanup()
  history.replaceState({}, '', href)
  render(<App />)
}

function enterHunterPvp() {
  const page = hunterClass.pages.find(page => page.kind === 'pvp')!
  render(<ClassDocumentPage classDef={hunterClass} page={page} />)
  const href = document.querySelector<HTMLAnchorElement>('a[href^="/hunter?build="]')!.getAttribute('href')!
  cleanup()
  history.replaceState({}, '', href)
  render(<ClassCalculatorPage classDef={hunterClass} />)
}

function enterWarriorPvp() {
  const page = warriorClass.pages.find(page => page.slug === 'wow-forever-arms-warrior-pvp-build')!
  render(<ClassDocumentPage classDef={warriorClass} page={page} />)
  const href = document.querySelector<HTMLAnchorElement>('a[href^="/warrior?build="]')!.getAttribute('href')!
  cleanup()
  history.replaceState({}, '', href)
  render(<ClassCalculatorPage classDef={warriorClass} />)
}

describe('Published PvP route → adjust → share', () => {
  it('opens Holy PvP as a blank Level 30 Holy plan, overriding a saved build', () => {
    localStorage.setItem('wow-forever-paladin-build', 'divine_intellect.5')
    enterPaladinVariant('holy-pvp')
    expect(document.querySelector('.current-build')?.textContent).toContain('21 points remaining at Level 30')
    expect(screen.getByRole('tab', { name: /^Holy/ }).getAttribute('aria-selected')).toBe('true')
    expect(scrollTargets).toContain('calculator')
  })

  it('explains a full Level 20 Paladin starter and preserves level and spec when reset', () => {
    enterPaladinPvpStarter()
    expect(screen.getByText(/All 11 points at Level 20 are spent/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Start blank build' }))
    expect(document.querySelector('.current-build')?.textContent).toContain('11 points remaining at Level 20')
    cleanup()
    render(<App />)
    expect(document.querySelector('.current-build')?.textContent).toContain('11 points remaining at Level 20')
    expect(screen.getByRole('tab', { name: /^Retribution/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('opens the historical Protection PvP reference on a blank calculator', () => {
    enterPaladinVariant('protection-pvp')
    expect(new URLSearchParams(location.search).get('id')).toBe('')
    expect(document.querySelector('.current-build')?.textContent).toContain('51 reference points remaining')
    expect(screen.getByRole('tab', { name: /^Holy/ }).getAttribute('aria-selected')).toBe('true')
    expect(scrollTargets).toContain('calculator')
  })

  it('opens the historical Retribution PvP reference on a blank calculator', () => {
    enterPaladinVariant('retribution-pvp')
    expect(new URLSearchParams(location.search).get('id')).toBe('')
    expect(document.querySelector('.current-build')?.textContent).toContain('51 reference points remaining')
    expect(scrollTargets).toContain('calculator')
  })

  it('opens the production Hunter PvP allocation at its Survival tree', () => {
    enterHunterPvp()
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0/0/11')
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('Level 20')
    expect(scrollTargets).toContain('tree-survival')
    const selectedName = document.querySelector('.class-detail-title h3')?.textContent
    expect(['Deflection', 'Entrapment', 'Savage Strikes', 'Deterrence']).toContain(selectedName)
  })

  it('opens a production Warrior PvP route at its allocated tree and detail', () => {
    enterWarriorPvp()
    expect(scrollTargets).toContain('tree-arms')
    const selectedName = document.querySelector('.class-detail-title h3')?.textContent
    const selectedTalent = warriorClass.talents.find(talent => talent.name === selectedName)
    expect(selectedTalent?.branch).toBe('arms')
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('11 / 11')
  })

  it('honors an explicitly empty Warrior share over the recipient’s saved allocation', () => {
    const pvp = warriorClass.builds.find(build => build.id === 'warrior-arms-pvp')!
    localStorage.setItem(warriorClass.storageKey, JSON.stringify({ build: pvp.build, level: 20 }))
    history.replaceState({}, '', '/warrior?build=&level=20')
    render(<ClassCalculatorPage classDef={warriorClass} />)
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0/0/0')
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0 / 11')
  })

  it('honors an explicitly empty Hunter share over the recipient’s saved allocation', () => {
    const pvp = hunterClass.builds.find(build => build.id === 'hunter-pvp')!
    localStorage.setItem(hunterClass.storageKey, JSON.stringify({ build: pvp.build, level: 20 }))
    history.replaceState({}, '', '/hunter?build=&level=20')
    render(<ClassCalculatorPage classDef={hunterClass} />)
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0/0/0')
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0 / 11')
  })

  it('explains a filled Hunter route, then shares and restores a legal adjustment', async () => {
    enterHunterPvp()
    expect(document.querySelector('.class-full-route')?.textContent).toMatch(/remove.*rank.*add/i)
    fireEvent.click(screen.getByRole('button', { name: 'Remove rank from Deterrence' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add rank to Improved Wing Clip' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy build link' }))
    await waitFor(() => expect(copiedUrl).toContain('/hunter?build='))
    const url = new URL(copiedUrl)
    expect(url.searchParams.get('level')).toBe('20')
    expect(url.hash).toBe('#tree-survival')
    cleanup()
    localStorage.clear()
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    render(<ClassCalculatorPage classDef={hunterClass} />)
    expect(document.getElementById('hunter-1308')?.textContent).toContain('0/1')
    expect(screen.getByRole('button', { name: 'Remove rank from Improved Wing Clip' })).toBeTruthy()
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('11 / 11')
  })

  it('offers a blank starting point beside a full Hunter tree and keeps it blank after refresh', () => {
    enterHunterPvp()
    const tree = document.getElementById('tree-survival')!
    expect(within(tree).getByText(/uses all 11 points/i)).toBeTruthy()
    fireEvent.click(within(tree).getByRole('button', { name: 'Start blank build' }))
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0 / 11')
    expect(new URLSearchParams(location.search).get('build')).toBe('')
    cleanup()
    render(<ClassCalculatorPage classDef={hunterClass} />)
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0 / 11')
  })

  it('keeps a shared Warrior route cleared after using the summary Reset and refreshing', () => {
    enterWarriorPvp()
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0 / 11')
    expect(new URLSearchParams(location.search).get('build')).toBe('')
    cleanup()
    render(<ClassCalculatorPage classDef={warriorClass} />)
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0 / 11')
  })

  it('keeps edits to a shared Warrior route after refreshing', () => {
    enterWarriorPvp()
    fireEvent.click(screen.getByRole('button', { name: 'Remove rank from Anger Management' }))
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('10 / 11')
    cleanup()
    render(<ClassCalculatorPage classDef={warriorClass} />)
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('10 / 11')
  })

  it('keeps a new level mode on a shared Warrior route after refreshing', () => {
    enterWarriorPvp()
    fireEvent.click(screen.getByRole('button', { name: /Level 30/ }))
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('Level 30')
    cleanup()
    render(<ClassCalculatorPage classDef={warriorClass} />)
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('Level 30')
  })

  it('restores an adjusted Paladin PvP starter and its tree from the copied URL', async () => {
    enterPaladinPvpStarter()
    expect(screen.getByRole('tab', { name: /^Retribution/ }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Remove one rank from Seal of Command' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Build Link' }))
    await waitFor(() => expect(copiedUrl).toContain('/build?id='))
    const url = new URL(copiedUrl)
    expect(url.hash).toBe('#calculator')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Link copied' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /^Seal of Command, rank 0 of/ }))
    expect(screen.getByRole('button', { name: 'Copy Build Link' })).toBeTruthy()
    cleanup()
    localStorage.clear()
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    render(<App />)
    expect(screen.getByRole('tab', { name: /^Retribution/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /^Seal of Command, rank 0 of/ })).toBeTruthy()
  })

  it('keeps the Paladin URL on clipboard failure and offers its exact link for manual copy', async () => {
    enterPaladinPvpStarter()
    fireEvent.click(screen.getByRole('button', { name: 'Remove one rank from Seal of Command' }))
    const before = location.href
    refuseClipboard = true
    fireEvent.click(screen.getByRole('button', { name: 'Copy Build Link' }))
    const field = await screen.findByRole('textbox', { name: 'Build link for manual copy' })
    expect((field as HTMLInputElement).value).toContain('#calculator')
    expect((field as HTMLInputElement).readOnly).toBe(true)
    expect(location.href).toBe(before)
  })

  it('offers a manual Hunter share when clipboard access fails', async () => {
    enterHunterPvp()
    refuseClipboard = true
    fireEvent.click(screen.getByRole('button', { name: 'Copy build link' }))
    const field = await screen.findByRole('textbox', { name: 'Build link for manual copy' })
    expect((field as HTMLInputElement).value).toContain('#tree-survival')
  })

  it('clears Hunter copy confirmation when the copied allocation is edited', async () => {
    enterHunterPvp()
    const copy = screen.getByRole('button', { name: 'Copy build link' })
    fireEvent.click(copy)
    await waitFor(() => expect(copy.textContent).toContain('Copied'))
    fireEvent.click(screen.getByRole('button', { name: 'Remove rank from Deterrence' }))
    expect(copy.textContent).toContain('Copy build link')
  })

  it('clears Hunter copy confirmation when its mode is reselected despite blocked storage', async () => {
    enterHunterPvp()
    const copy = screen.getByRole('button', { name: 'Copy build link' })
    fireEvent.click(copy)
    await waitFor(() => expect(copy.textContent).toContain('Copied'))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    fireEvent.click(screen.getByRole('button', { name: /Level 20 preview/ }))
    expect(copy.textContent).toContain('Copy build link')
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('0/0/11')
    fireEvent.click(screen.getByRole('button', { name: 'Remove rank from Deterrence' }))
    expect(document.querySelector('.class-summary aside')?.textContent).toContain('10 / 11')
  })

  it('clears an outdated manual Hunter link when the planner mode is selected', async () => {
    enterHunterPvp()
    refuseClipboard = true
    fireEvent.click(screen.getByRole('button', { name: 'Copy build link' }))
    await screen.findByRole('textbox', { name: 'Build link for manual copy' })
    fireEvent.click(screen.getByRole('button', { name: /Level 20 preview/ }))
    expect(screen.queryByRole('textbox', { name: 'Build link for manual copy' })).toBeNull()
  })

  it('offers only legal, versioned Holy and Ret editorial starters on the existing Paladin PvP page', () => {
    render(<BuildLandingPage pageId="pvp" />)
    const section = screen.getByRole('region', { name: 'Paladin PvP starting routes' })
    expect(section.textContent).toContain('Editorial')
    expect(section.textContent).toContain('1.60.1.70245')
    expect(section.textContent).toContain('70009')
    expect(within(section).queryByRole('link', { name: /Load Protection/ })).toBeNull()
    const links = within(section).getAllByRole('link', { name: /Load.*route/ })
    expect(links).toHaveLength(2)
    for (const link of links) {
      const href = new URL(link.getAttribute('href')!, location.origin)
      const target = decodeBuild(href.searchParams.get('id')!, talents)
      expect(totalPoints(target)).toBe(11)
      let built: Build = {}
      const entries = Object.entries(target).sort(([left], [right]) => talents.find(talent => talent.id === left)!.requiredTreePoints - talents.find(talent => talent.id === right)!.requiredTreePoints)
      for (const [id, rank] of entries) {
        const talent = talents.find(talent => talent.id === id)!
        for (let point = 0; point < rank; point++) built = incrementTalent(built, talent, talents)
      }
      expect(built).toEqual(target)
      expect(href.hash).toBe('#calculator')
    }
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('WoW Forever Paladin PvP Build')
  })
})
