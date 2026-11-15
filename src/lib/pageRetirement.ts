import { PAGE_CONSOLIDATIONS, REMOVED_PAGE_PATHS } from '../data/pageConsolidations'

/** Normalize internal navigation to the final retained page; never change a build/share URL. */
export function resolvePageHref(href: string): string {
  if (!href.startsWith('/') && !href.startsWith('https://buildforgetools.com/')) return href
  const url = new URL(href, 'https://buildforgetools.com')
  const seen = new Set<string>()
  let path = url.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/'
  let changed = false
  while (PAGE_CONSOLIDATIONS[path]) {
    if (seen.has(path)) throw new Error(`Retirement cycle: ${path}`)
    seen.add(path)
    path = PAGE_CONSOLIDATIONS[path]
    changed = true
  }
  return changed ? `${path}${url.search}` : href
}

export function isRemovedPage(href: string): boolean {
  if (!href.startsWith('/') && !href.startsWith('https://buildforgetools.com/')) return false
  const path = new URL(href, 'https://buildforgetools.com').pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/'
  return REMOVED_PAGE_PATHS.includes(path)
}

export function isRetiredPage(path: string): boolean {
  return isRemovedPage(path) || resolvePageHref(path) !== path
}
