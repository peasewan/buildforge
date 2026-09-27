import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installCalculatorLinkTracking } from './calculatorLinkTracking'

let removeTracking: (() => void) | undefined
let gtag: ReturnType<typeof vi.fn>

beforeEach(() => {
  document.body.innerHTML = ''
  window.history.replaceState(null, '', '/wow-forever-hunter-pvp-build?query=private#notes')
  gtag = vi.fn()
  window.gtag = gtag
})

afterEach(() => {
  removeTracking?.()
  removeTracking = undefined
  document.body.innerHTML = ''
  delete window.gtag
  vi.unstubAllGlobals()
})

function click(target: Element): MouseEvent {
  // Let the capture listener observe a real click without asking jsdom to navigate.
  target.addEventListener('click', (event) => event.preventDefault(), { once: true })
  const event = new MouseEvent('click', { bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

describe('delegated calculator link tracking', () => {
  it('tracks a nested hero link added after installation without copying private URL fields', () => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = '<section class="class-hero ix-hero"><a href="/hunter?level=20&build=private#calculator"><span>Open calculator</span></a></section>'
    click(document.querySelector('span')!)

    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'calculator_open', {
      class: 'hunter',
      page_path: '/wow-forever-hunter-pvp-build',
      target_path: '/hunter',
      placement: 'hero',
    })
  })

  it.each([
    ['/paladin', 'paladin'], ['/warrior', 'warrior'], ['/mage', 'mage'],
    ['/rogue', 'rogue'], ['/priest', 'priest'], ['/druid', 'druid'],
    ['/warlock', 'warlock'], ['/hunter', 'hunter'], ['/shaman', 'shaman'],
    ['/build?id=private#calculator', 'paladin'],
  ])('recognizes %s as a %s calculator', (href, className) => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = `<article><a href="${href}">Open</a></article>`
    click(document.querySelector('a')!)

    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'calculator_open', {
      class: className,
      page_path: '/wow-forever-hunter-pvp-build',
      target_path: href.startsWith('/build') ? '/build' : href,
      placement: 'content',
    })
  })

  it.each([
    ['<header><a href="/druid">Open</a></header>', 'navigation'],
    ['<nav><a href="/druid">Open</a></nav>', 'navigation'],
    ['<footer><nav><a href="/druid">Open</a></nav></footer>', 'footer'],
    ['<section class="guide-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="spec-talents-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="spellbook-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="beta-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="build-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="landing-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="hub-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="spec-hub-hero"><a href="/druid">Open</a></section>', 'hero'],
    ['<section class="hero"><a href="/druid">Open</a></section>', 'hero'],
  ])('labels the existing page placement in %s as %s', (html, placement) => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = html
    click(document.querySelector('a')!)
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'calculator_open', expect.objectContaining({ placement }))
  })

  it.each([
    '/hunter#top', '/hunter#tree', '/hunter#tree-marksmanship',
    '/wow-forever-hunter-pvp-build', '/emberville#planner',
    'https://external.example/hunter#calculator',
    'https://www.buildforgetools.com/hunter#calculator',
    'https://buildforgetools.com.evil.test/hunter',
    'javascript:alert(1)', 'mailto:test@example.com', 'https://[invalid',
  ])('ignores a non-planner or invalid destination %s', (href) => {
    removeTracking = installCalculatorLinkTracking(document)
    const anchor = document.createElement('a')
    anchor.setAttribute('href', href)
    document.body.append(anchor)
    click(anchor)
    expect(gtag).not.toHaveBeenCalled()
  })

  it('tracks an absolute same-origin link', () => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = '<a href="https://buildforgetools.com/druid?level=20#calculator">Open</a>'
    click(document.querySelector('a')!)
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'calculator_open', expect.objectContaining({ class: 'druid', target_path: '/druid' }))
  })

  it.each([
    ['/paladin', '#calculator', 'paladin'],
    ['/hunter', '#class-calculator', 'hunter'],
  ])('tracks the %s planner start link %s', (pathname, hash, className) => {
    window.history.replaceState(null, '', pathname)
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = `<section class="class-hero"><a href="${hash}">Start building</a></section>`
    click(document.querySelector('a')!)
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'calculator_open', {
      class: className,
      page_path: pathname,
      target_path: pathname,
      placement: 'hero',
    })
  })

  it('ignores elements that are not real links', () => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = '<button>Open</button><a>No href</a>'
    click(document.querySelector('button')!)
    click(document.querySelector('a')!)
    expect(gtag).not.toHaveBeenCalled()
  })

  it('captures links without preventing navigation or interrupting existing click events', () => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = '<a href="/paladin#calculator">Open</a>'
    const anchor = document.querySelector('a')!
    anchor.addEventListener('click', (event) => {
      expect(event.defaultPrevented).toBe(false)
      event.stopPropagation()
      window.gtag!('event', 'guide_cta_click', { placement: 'hero' })
    })
    click(anchor)
    expect(gtag.mock.calls).toEqual([
      ['event', 'calculator_open', { class: 'paladin', page_path: '/wow-forever-hunter-pvp-build', target_path: '/paladin', placement: 'content' }],
      ['event', 'guide_cta_click', { placement: 'hero' }],
    ])
  })

  it('removes the listener and allows reinstalling after cleanup', () => {
    const remove = installCalculatorLinkTracking(document)
    document.body.innerHTML = '<a href="/hunter">Open</a>'
    remove()
    click(document.querySelector('a')!)
    expect(gtag).not.toHaveBeenCalled()
    removeTracking = installCalculatorLinkTracking(document)
    click(document.querySelector('a')!)
    expect(gtag).toHaveBeenCalledTimes(1)
  })

  it('does not send duplicate events when installed twice', () => {
    removeTracking = installCalculatorLinkTracking(document)
    installCalculatorLinkTracking(document)
    document.body.innerHTML = '<a href="/hunter">Open</a>'
    click(document.querySelector('a')!)
    expect(gtag).toHaveBeenCalledTimes(1)
  })

  it('keeps preview hostname suppression in the existing analytics function', () => {
    removeTracking = installCalculatorLinkTracking(document)
    document.body.innerHTML = '<a href="/hunter">Open</a>'
    vi.stubGlobal('window', { location: { hostname: 'preview-buildforge.vercel.app' }, gtag })
    click(document.querySelector('a')!)
    expect(gtag).not.toHaveBeenCalled()
  })
})
