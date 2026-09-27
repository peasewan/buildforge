import { track } from './analytics'

const calculatorClasses: Readonly<Record<string, string>> = {
  '/paladin': 'paladin',
  '/build': 'paladin',
  '/warrior': 'warrior',
  '/mage': 'mage',
  '/rogue': 'rogue',
  '/priest': 'priest',
  '/druid': 'druid',
  '/warlock': 'warlock',
  '/hunter': 'hunter',
  '/shaman': 'shaman',
}

const heroSelector = [
  '.hero', '.class-hero', '.guide-hero', '.build-hero', '.landing-hero',
  '.hub-hero', '.spec-hub-hero', '.spec-talents-hero', '.spellbook-hero', '.beta-hero',
].join(',')

const installedDocuments = new WeakMap<Document, () => void>()

function linkPlacement(anchor: Element): 'hero' | 'navigation' | 'footer' | 'content' {
  if (anchor.closest('footer')) return 'footer'
  if (anchor.closest(heroSelector)) return 'hero'
  if (anchor.closest('header,nav')) return 'navigation'
  return 'content'
}

/** Observe existing links without altering their markup, navigation or legacy analytics. */
export function installCalculatorLinkTracking(doc: Document): () => void {
  const installed = installedDocuments.get(doc)
  if (installed) return installed

  const onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return
    const anchor = event.target.closest('a[href]')
    if (!anchor) return

    let target: URL
    try {
      target = new URL(anchor.getAttribute('href')!, doc.location.href)
    } catch {
      return
    }
    if (target.origin !== doc.location.origin || !['', '#calculator', '#class-calculator'].includes(target.hash)) return
    const className = calculatorClasses[target.pathname]
    if (!className) return

    track('calculator_open', {
      class: className,
      page_path: doc.location.pathname,
      target_path: target.pathname,
      placement: linkPlacement(anchor),
    })
  }

  const cleanup = () => {
    if (installedDocuments.get(doc) !== cleanup) return
    doc.removeEventListener('click', onClick, true)
    installedDocuments.delete(doc)
  }
  doc.addEventListener('click', onClick, true)
  installedDocuments.set(doc, cleanup)
  return cleanup
}
