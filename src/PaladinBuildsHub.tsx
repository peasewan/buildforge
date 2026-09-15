import { ArrowRight, Calculator, Shield, Sparkles, Swords } from 'lucide-react'
import BuildCard, { type BuildCardIcon } from './BuildCard'
import { track } from './lib/analytics'

const specializations = [
  { name: 'Holy', role: 'Raid Healing', href: '/wow-forever-paladin-build', icon: <Sparkles size={34} /> },
  { name: 'Protection', role: 'Dungeon Tank', href: '/wow-forever-protection-paladin-builds', icon: <Shield size={34} /> },
  { name: 'Retribution', role: 'DPS Builds', href: '/wow-forever-retribution-paladin-build', icon: <Swords size={34} /> },
]

const popularBuilds = [
  { type: 'Protection', title: 'Protection Paladin Dungeon Tank Build', role: 'Dungeon Tank', focus: 'Defensive', href: '/wow-forever-protection-paladin-dungeon-build', icon: 'protection' },
  { type: 'Leveling', title: 'Paladin Leveling Build', role: 'Solo Progression', focus: 'Efficient leveling', href: '/wow-forever-paladin-leveling-build', icon: 'leveling' },
  { type: 'PvP', title: 'Paladin PvP Build', role: 'Player Combat', focus: 'Utility & Survival', href: '/wow-forever-paladin-pvp-build', icon: 'pvp' },
  { type: 'Raid', title: 'Paladin Raid Build', role: 'Group Content', focus: 'Support', href: '/wow-forever-paladin-raid-build', icon: 'raid' },
]

const resources = [
  ['Paladin Talent Calculator', '/paladin#calculator'],
  ['Holy Paladin Build', '/wow-forever-paladin-build'],
  ['Protection Paladin Build', '/wow-forever-protection-paladin-build'],
  ['Retribution Paladin Build', '/wow-forever-retribution-paladin-build'],
  ['Retribution Leveling Build', '/wow-forever-retribution-paladin-leveling-build'],
  ['Paladin Leveling Build', '/wow-forever-paladin-leveling-build'],
]

function HubLink({ href, placement, className, children }: { href: string; placement: string; className?: string; children: React.ReactNode }) {
  return <a href={href} className={className} onClick={() => track('paladin_hub_click', { placement, destination: href })}>{children}</a>
}

export default function PaladinBuildsHub() {
  return (
    <main className="hub-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Hub navigation"><a href="#specializations">Specializations</a><a href="#popular-builds">Popular Builds</a><a href="#resources">Resources</a></nav>
        <HubLink href="/paladin#calculator" placement="header" className="button primary">Open Planner</HubLink>
      </header>

      <section className="hub-hero">
        <div className="hub-glow" aria-hidden="true" />
        <div className="shell hub-hero-inner">
          <img src="/images/icons/paladin-shield.png" alt="" />
          <div className="eyebrow">Build Forge</div>
          <h1>WoW Forever Paladin Builds &amp; Talent Calculator</h1>
          <p>Explore community preview builds,<br />talent paths, and specialization guides.</p>
          <HubLink href="/paladin#calculator" placement="hero" className="button primary"><Calculator size={17} /> Open Talent Calculator</HubLink>
        </div>
      </section>

      <section className="hub-section shell" id="specializations">
        <header className="hub-section-heading"><div className="eyebrow">Three Talent Paths</div><h2>Choose Your Paladin Specialization</h2><p>Start with the role you want to play, then open a focused build and customize its talent allocation.</p></header>
        <div className="hub-spec-grid">{specializations.map((spec) => <HubLink href={spec.href} placement={`spec-${spec.name.toLowerCase()}`} key={spec.name}><i>{spec.icon}</i><h3>{spec.name}</h3><p>{spec.role}</p><span>View Builds <ArrowRight size={15} /></span></HubLink>)}</div>
      </section>

      <section className="hub-popular" id="popular-builds"><div className="shell">
        <header className="hub-section-heading"><div className="eyebrow">Community Preview</div><h2>Popular Paladin Builds</h2><p>Browse build pages organized around the content and playstyle players are preparing for.</p></header>
        <div className="hub-build-grid">{popularBuilds.map((build) => <BuildCard key={build.type} eyebrow={build.type} title={build.title} role={build.role} focus={build.focus} href={build.href} icon={build.icon as BuildCardIcon} onOpen={() => track('paladin_hub_click', { placement: `popular-${build.type.toLowerCase()}`, destination: build.href })} />)}</div>
      </div></section>

      <section className="hub-tool shell">
        <div><div className="eyebrow">Interactive Build Planner</div><h2>Create Your Own Paladin Build</h2><p>Plan talents.<br />Test different paths.<br />Share your setup.</p></div>
        <HubLink href="/paladin#calculator" placement="calculator-cta" className="button primary"><Calculator size={18} /> Open WoW Forever Paladin Talent Calculator</HubLink>
      </section>

      <section className="hub-data shell"><div><div className="eyebrow">About Our Data</div><h2>Transparent Community Research</h2></div><div><p>BuildForgeTools uses community research and reference materials to create preview talent planners for WoW Forever.</p><p>Talent data is continuously reviewed and updated. Every build is presented as a planning reference while the underlying information is verified.</p><a href="/wow-forever-paladin-talents">Read about Paladin talents <ArrowRight size={15} /></a></div></section>

      <section className="hub-resources shell" id="resources"><div className="eyebrow">Keep Exploring</div><h2>More WoW Forever Paladin Resources</h2><nav>{resources.map(([label, href]) => <HubLink href={href} placement="resource" key={href + label}><span>{label}</span><ArrowRight size={17} /></HubLink>)}</nav></section>

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-talents">Paladin Talents</a><a href="/wow-forever-protection-paladin-build">Protection Build</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  )
}
