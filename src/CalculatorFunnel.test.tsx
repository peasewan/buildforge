import { StrictMode } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import ClassCalculatorPage from './ClassCalculatorPage'
import { hunterClassFixture } from './data/fixtures/hunterClass.fixture'
import { HOLY_HEALING_BUILD } from './data/builds'
import { encodeBuild } from './lib/build'

const gtag = vi.fn()
const writeText = vi.fn()
const observations: { callback: IntersectionObserverCallback; observer: IntersectionObserver; target?: Element }[] = []
function visible(entry: typeof observations[number]) {
  entry.callback([{ isIntersecting: true, target: entry.target } as IntersectionObserverEntry], entry.observer)
}
const events = (name: string) => gtag.mock.calls.filter(call => call[1] === name)
function spendHunter() {
  for (const [name, count] of [['Fixture Tracking', 5], ['Fixture Guard', 5], ['Fixture Pack Leader', 1]] as const) {
    for (let i = 0; i < count; i++) fireEvent.click(screen.getByRole('button', { name: `Add rank to ${name}` }))
  }
}

beforeEach(() => {
  gtag.mockClear()
  writeText.mockReset().mockResolvedValue(undefined)
  localStorage.clear()
  sessionStorage.clear()
  history.replaceState({}, '', '/hunter')
  window.gtag = gtag
  Object.assign(navigator, { clipboard: { writeText } })
  HTMLElement.prototype.scrollIntoView = vi.fn()
  observations.length = 0
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) {
      observations.push({ callback, observer: this as unknown as IntersectionObserver })
    }
    observe(target: Element) { observations.at(-1)!.target = target }
    disconnect() {}
  })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); delete window.gtag })

describe('all-class calculator funnel', () => {
  it('records an actual visible calculator once, including StrictMode replay', () => {
    render(<StrictMode><ClassCalculatorPage classDef={hunterClassFixture} /></StrictMode>)
    expect(events('view_planner')).toHaveLength(0)
    expect(observations.at(-1)?.target?.className).toBe('class-toolbar')
    visible(observations.at(-1)!)
    visible(observations.at(-1)!)
    expect(events('view_planner')).toHaveLength(1)
    expect(events('view_planner')[0][2]).toMatchObject({ class: 'hunter', page_path: '/hunter', level: 20, point_cap: 11 })
  })

  it('records manual completion once at the active cap, even after refund, refill and refresh', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    spendHunter()
    expect(events('build_complete')).toHaveLength(1)
    expect(events('build_complete')[0][2]).toMatchObject({ class: 'hunter', level: 20, point_cap: 11, points: 11, completion_source: 'manual' })
    fireEvent.click(screen.getByRole('button', { name: 'Remove rank from Fixture Pack Leader' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add rank to Fixture Pack Leader' }))
    cleanup()
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove rank from Fixture Pack Leader' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add rank to Fixture Pack Leader' }))
    expect(events('build_complete')).toHaveLength(1)
  })

  it('does not turn preset loading, a shared build or a level change into manual completion', () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: `Load ${hunterClassFixture.builds.find(b => b.id === hunterClassFixture.recommendedBuildIds[0])!.shortTitle}` }))
    fireEvent.click(screen.getByRole('button', { name: /Level 60/i }))
    fireEvent.click(screen.getByRole('button', { name: /Level 20/i }))
    cleanup()
    history.replaceState({}, '', '/hunter?build=bm-1.5~bm-2.5~bm-3.1&level=20')
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    expect(events('build_complete')).toHaveLength(0)
  })

  it('records canonical and legacy copy events only after a successful copy', async () => {
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy build link' }))
    await waitFor(() => expect(events('build_copy')).toHaveLength(1))
    expect(events('build_copy')[0][2]).toMatchObject({ class: 'hunter', level: 20, point_cap: 11, points: 0 })
    expect(events('hunter_fixture_build_copy')).toHaveLength(1)
    expect(events('build_shared')).toHaveLength(0)
  })

  it('does not report success when both clipboard methods fail', async () => {
    writeText.mockRejectedValue(new Error('Denied'))
    Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => false) })
    render(<ClassCalculatorPage classDef={hunterClassFixture} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy build link' }))
    await waitFor(() => expect(document.execCommand).toHaveBeenCalled())
    expect(events('build_copy')).toHaveLength(0)
    expect(events('hunter_fixture_build_copy')).toHaveLength(0)
    expect(screen.queryByText('Copied')).toBeNull()
  })
})

describe('Paladin compatibility', () => {
  beforeEach(() => history.replaceState({}, '', '/paladin'))

  it('observes the calculator tabs rather than the preceding build cards, once under StrictMode', () => {
    render(<StrictMode><App /></StrictMode>)
    expect(observations.at(-1)?.target?.className).toBe('planner-tabs')
    visible(observations.at(-1)!)
    visible(observations.at(-1)!)
    expect(events('view_planner')).toHaveLength(1)
    expect(events('view_planner')[0][2]).toMatchObject({ class: 'paladin', page_path: '/paladin', point_cap: 51 })
  })

  it('tracks the same-page hero entry without counting it as a page view', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Open Talent Calculator' }))
    expect(events('calculator_open')).toHaveLength(1)
    expect(events('calculator_open')[0][2]).toMatchObject({ class: 'paladin', placement: 'hero', target_path: '/paladin' })
    expect(events('page_view')).toHaveLength(0)
  })

  it('records the final manual rank, but not a full build loaded from storage', () => {
    const before = { ...HOLY_HEALING_BUILD.build, anticipation: 4 }
    localStorage.setItem('wow-forever-paladin-build', encodeBuild(before))
    render(<App />)
    expect(events('build_complete')).toHaveLength(0)
    fireEvent.click(screen.getByRole('tab', { name: /Protection/ }))
    fireEvent.click(screen.getByRole('button', { name: /^Anticipation, rank 4/ }))
    expect(events('build_complete')).toHaveLength(1)
    expect(events('build_complete')[0][2]).toMatchObject({ class: 'paladin', level: 60, points: 51, completion_source: 'manual' })
    fireEvent.click(screen.getByRole('button', { name: 'Remove one rank from Anticipation' }))
    fireEvent.click(screen.getByRole('button', { name: /^Anticipation, rank 4/ }))
    expect(events('build_complete')).toHaveLength(1)
  })

  it('keeps the Paladin sharing event but only after clipboard success', async () => {
    localStorage.setItem('wow-forever-paladin-build', encodeBuild(HOLY_HEALING_BUILD.build))
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    render(<App />)
    expect(events('build_complete')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Build Link' }))
    await waitFor(() => expect(events('build_copy')).toHaveLength(1))
    expect(events('build_copy')[0][2]).toMatchObject({ class: 'paladin', level: 60, point_cap: 51, points: 51 })
    expect(events('build_shared')).toHaveLength(1)
  })
})
