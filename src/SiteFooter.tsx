import { publishedClassCatalogues } from './lib/classStaticPages'

export interface FooterLink {
  href: string
  label: string
}

/**
 * The discovery entry each published class contributes, taken from the gate: the catalogue that
 * class actually publishes. Derived, so a class whose catalogue is withheld contributes no link,
 * a new class contributes one with no edit here, and this list can never point at a withheld path
 * — a class's own calculator is exactly what a withheld class cannot back.
 */
const classLinks: FooterLink[] = publishedClassCatalogues().map(({ classDef, page }) => ({
  href: `/${page.slug}`,
  label: `${classDef.name} Talents`,
}))

const defaultLinks: FooterLink[] = [
  { href: '/emberville', label: 'Emberville Planner' },
  { href: '/warrior', label: 'Warrior Calculator' },
  { href: '/wow-forever-warrior-builds', label: 'Warrior Builds' },
  { href: '/wow-forever-paladin-builds', label: 'Paladin Builds' },
  { href: '/paladin', label: 'Talent Calculator' },
  { href: '/wow-forever-paladin-talents', label: 'Paladin Talents' },
  { href: '/wow-forever-paladin-abilities', label: 'Paladin Abilities' },
  ...classLinks,
]

/**
 * Class-specific links are prepended to the site-wide list rather than replacing it: the class
 * names and URLs of the whole site belong here, so a class-neutral renderer only ever passes its
 * own class's links and never has to know about any other class.
 */
export default function SiteFooter({ links = defaultLinks, classLinks = [] }: { links?: FooterLink[]; classLinks?: FooterLink[] }) {
  const items = [...classLinks, ...links].filter((item, index, all) => all.findIndex((candidate) => candidate.href === item.href) === index)
  return (
    <footer>
      <div className="shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <p>Build planners and verified game data</p>
        <nav aria-label="BuildForgeTools resources">{items.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
        <nav className="footer-trust" aria-label="About BuildForgeTools"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav>
        <small>Independent community tools. Not affiliated with the game developers or publishers covered here.</small>
      </div>
    </footer>
  )
}
