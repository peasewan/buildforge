export interface FooterLink {
  href: string
  label: string
}

const defaultLinks: FooterLink[] = [
  { href: '/wow-forever-paladin-builds', label: 'Paladin Builds' },
  { href: '/paladin', label: 'Talent Calculator' },
  { href: '/wow-forever-paladin-talents', label: 'Paladin Talents' },
]

export default function SiteFooter({ links = defaultLinks }: { links?: FooterLink[] }) {
  return (
    <footer>
      <div className="shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <p>WoW Forever Talent Tools</p>
        <nav aria-label="BuildForgeTools resources">{links.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
        <nav className="footer-trust" aria-label="About BuildForgeTools"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></nav>
        <small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small>
      </div>
    </footer>
  )
}
