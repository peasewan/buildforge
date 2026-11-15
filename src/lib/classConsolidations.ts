import { PAGE_CONSOLIDATIONS } from '../data/pageConsolidations'
import { publishedClassPages, type ClassDefinition, type ClassPageDefinition } from './classPage'

/**
 * Retire approved entry URLs while keeping their task records and every allocation intact.
 * Run after class-specific data/copy preparation so a retained hub can reopen the original tasks.
 * The site-wide map may also contain other classes and hand-authored routes; each class owns only
 * its own sources and requires its final destination to be a published page of the same class.
 */
export function applyClassConsolidations<B extends string>(
  def: ClassDefinition<B>,
  map: Record<string, string> = PAGE_CONSOLIDATIONS,
): ClassDefinition<B> {
  const pagesByPath = new Map(def.pages.map(page => [`/${page.slug}`, page]))
  const redirects = new Map<string, string>()
  for (const [path, page] of pagesByPath) {
    const target = Object.hasOwn(map, path) ? map[path] : page.retiredTo
    if (target !== undefined) redirects.set(path, target)
  }
  if (!redirects.size) return def

  const finalTargets = new Map<string, string>()
  for (const source of redirects.keys()) {
    const visited = new Set<string>()
    let target = source
    while (redirects.has(target)) {
      if (visited.has(target)) throw new Error(`Invalid class consolidation cycle: ${source} -> ${target}`)
      visited.add(target)
      target = redirects.get(target)!
    }
    if (!pagesByPath.has(target)) throw new Error(`Invalid class consolidation destination: ${source} -> ${target}`)
    finalTargets.set(source, target)
  }

  const resolveHref = (href: string): string => {
    const boundary = href.search(/[?#]/)
    const path = boundary < 0 ? href : href.slice(0, boundary)
    const suffix = boundary < 0 ? '' : href.slice(boundary)
    return `${finalTargets.get(path) ?? path}${suffix}`
  }
  const result: ClassDefinition<B> = {
    ...def,
    builds: def.builds.map(build => ({ ...build, href: resolveHref(build.href) })),
    pages: def.pages.map(page => {
      const path = `/${page.slug}`
      const retiredTo = finalTargets.get(path)
      const relatedPages = page.relatedPages.map(link => ({ ...link, href: resolveHref(link.href) }))
        .filter((link, index, links) => link.href !== (retiredTo ?? path)
          && links.findIndex(candidate => candidate.href === link.href) === index)
      return { ...page, ...(retiredTo ? { retiredTo } : {}), relatedPages }
    }),
  }
  const publishedPaths = new Set(publishedClassPages([result]).map(({ page }) => `/${page.slug}`))
  for (const [source, target] of finalTargets) {
    if (!publishedPaths.has(target)) throw new Error(`Class consolidation destination cannot publish: ${source} -> ${target}`)
  }
  return result
}

/** Original source pages power a retained page's task selector, without nesting hub selectors. */
export function consolidatedClassTasks<B extends string>(def: ClassDefinition<B>, page: ClassPageDefinition): ClassPageDefinition[] {
  if (page.retiredTo) return []
  return def.pages.filter(source => source.retiredTo === `/${page.slug}`
    && source.kind !== 'buildsHub' && source.kind !== 'calculator')
}
