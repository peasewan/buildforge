import { ArrowRight, Calculator, Shield, Sparkles, Swords } from 'lucide-react'
import BuildCard, { type BuildCardIcon } from './BuildCard'
import { track } from './lib/analytics'

const specializations = [
  { name: 'Holy', role: 'Healing & Support', href: '/wow-forever-paladin-build', icon: <Sparkles size={34} /> },
  { name: 'Protection', role: 'Tank & Defense', href: '/wow-forever-protection-paladin-builds', icon: <Shield size={34} /> },
  { name: 'Retribution', role: 'Melee Damage', href: '/wow-forever-retribution-paladin-build', icon: <Swords size={34} /> },
]

const playstyleSections = [
  {
    id: 'leveling',
    eyebrow: 'Leveling Builds',
    heading: 'Level Efficiently from 1–60',
    intro: 'Solo-friendly talent paths for steady progression while leveling.',
    builds: [
      { title: 'Paladin Leveling Build', description: 'A flexible solo path from level 10 onward, focused on steady progression and survivability.', href: '/wow-forever-paladin-leveling-build', icon: 'leveling' as BuildCardIcon },
      { title: 'Retribution Paladin Leveling Build', description: 'A damage-focused solo leveling route with early Holy support for questing.', href: '/wow-forever-retribution-paladin-leveling-build', icon: 'retribution' as BuildCardIcon },
    ],
  },
  {
    id: 'pve',
    eyebrow: 'PvE Builds',
    heading: 'Group Content Builds',
    intro: 'Tank, healing, and damage setups for dungeons and raids.',
    builds: [
      { title: 'Protection Paladin Dungeon Tank Build', description: 'A defensive tank setup for dungeons and group content.', href: '/wow-forever-protection-paladin-dungeon-build', icon: 'protection' as BuildCardIcon },
      { title: 'Protection Paladin Shield Build', description: 'A complete 20/31/0 Protection tank build for group play.', href: '/wow-forever-protection-paladin-build', icon: 'protection' as BuildCardIcon },
      { title: 'Paladin Raid Build', description: 'Raid-oriented paths for healing, tanking, and damage support.', href: '/wow-forever-paladin-raid-build', icon: 'raid' as BuildCardIcon },
    ],
  },
  {
    id: 'pvp',
    eyebrow: 'PvP Builds',
    heading: 'Arena & Battleground Builds',
    intro: 'Pressure, utility, and survivability for player-versus-player combat.',
    builds: [
      { title: 'Paladin PvP Build', description: 'Pressure, utility, and survivability for arena and battlegrounds.', href: '/wow-forever-paladin-pvp-build', icon: 'pvp' as BuildCardIcon },
    ],
  },
]

function HubLink({ href, placement, className, children }: { href: string; placement: string; className?: string; children: React.ReactNode }) {
  return <a href={href} className={className} onClick={() => track('paladin_hub_click', { placement, destination: href })}>{children}</a>
}

export default function PaladinBuildsHub() {
  return (
    <main className="hub-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Hub navigation"><a href="#specializations">Specializations</a><a href="#leveling">Leveling</a><a href="#pve">PvE</a><a href="#pvp">PvP</a></nav>
        <HubLink href="/paladin#calculator" placement="header" className="button primary">Open Planner</HubLink>
      </header>

      <section className="hub-hero">
        <div className="hub-glow" aria-hidden="true" />
        <div className="shell hub-hero-inner">
          <img src="/images/icons/paladin-shield.png" alt="" />
          <div className="eyebrow">Build Forge</div>
          <h1>WoW Forever Paladin Builds &amp; Talent Calculator</h1>
          <p>All Paladin builds for WoW Forever.<br />Choose your playstyle, then customize a talent setup.</p>
          <HubLink href="/paladin#calculator" placement="hero" className="button primary"><Calculator size={17} /> Open Talent Calculator</HubLink>
        </div>
      </section>

      <section className="hub-section shell" id="specializations">
        <header className="hub-section-heading"><div className="eyebrow">Three Talent Paths</div><h2>Choose Your Paladin Specialization</h2><p>Start with the role you want to play, then open a focused build and customize its talent allocation.</p></header>
        <div className="hub-spec-grid">{specializations.map((spec) => <HubLink href={spec.href} placement={`spec-${spec.name.toLowerCase()}`} key={spec.name}><i>{spec.icon}</i><h3>{spec.name}</h3><p>{spec.role}</p><span>View Builds <ArrowRight size={15} /></span></HubLink>)}</div>
      </section>

      {playstyleSections.map((section) => (
        <section className="hub-section shell" id={section.id} key={section.id}>
          <header className="hub-section-heading"><div className="eyebrow">{section.eyebrow}</div><h2>{section.heading}</h2><p>{section.intro}</p></header>
          <div className="hub-build-grid">{section.builds.map((build) => <BuildCard key={build.href} eyebrow={section.eyebrow} title={build.title} description={build.description} href={build.href} icon={build.icon} onOpen={() => track('paladin_hub_click', { placement: `${section.id}-${build.title.toLowerCase().slice(0, 24)}`, destination: build.href })} />)}</div>
        </section>
      ))}

      <section className="hub-tool shell">
        <div><div className="eyebrow">Interactive Build Planner</div><h2>Create Your Own Paladin Build</h2><p>Plan talents.<br />Test different paths.<br />Share your setup.</p></div>
        <HubLink href="/paladin#calculator" placement="calculator-cta" className="button primary"><Calculator size={18} /> Open WoW Forever Paladin Talent Calculator</HubLink>
      </section>

      <section className="hub-data shell"><div><div className="eyebrow">About Our Data</div><h2>Transparent Community Research</h2></div><div><p>BuildForgeTools uses community research and reference materials to create preview talent planners for WoW Forever.</p><p>Talent data is continuously reviewed and updated. Every build is presented as a planning reference while the underlying information is verified.</p><a href="/wow-forever-paladin-talents">Read about Paladin talents <ArrowRight size={15} /></a></div></section>

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-talents">Paladin Talents</a><a href="/wow-forever-protection-paladin-build">Protection Build</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  )
}
