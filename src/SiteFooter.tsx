export interface FooterLink {
  href: string
  label: string
}

const defaultLinks: FooterLink[] = [
  { href: '/emberville', label: 'Emberville Planner' },
  { href: '/warrior', label: 'Warrior Calculator' },
  { href: '/wow-forever-warrior-builds', label: 'Warrior Builds' },
  { href: '/wow-forever-paladin-builds', label: 'Paladin Builds' },
  { href: '/paladin', label: 'Talent Calculator' },
  { href: '/wow-forever-paladin-talents', label: 'Paladin Talents' },
  { href: '/wow-forever-paladin-abilities', label: 'Paladin Abilities' },
]

export default function SiteFooter({ links = defaultLinks }: { links?: FooterLink[] }) {
  return (
    <footer>
      <div className="shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <p>Build planners and verified game data</p>
        <nav aria-label="BuildForgeTools resources">{links.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
        <nav className="footer-trust" aria-label="About BuildForgeTools"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav>
        <small>Independent community tools. Not affiliated with the game developers or publishers covered here.</small>
      </div>
    </footer>
  )
}
