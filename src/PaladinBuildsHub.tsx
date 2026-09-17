import { ArrowRight, Calculator, Shield, Sparkles, Swords } from 'lucide-react'
import BuildCard from './BuildCard'
import { HUB_INTRO, HUB_INTRO_SUB, HUB_PLAYSTYLE_SECTIONS, HUB_SPECIALIZATIONS, HUB_TALENTS, HUB_TITLE, type SpecializationIcon } from './data/paladinBuildsHub'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'

const specializationIcons: Record<SpecializationIcon, React.ReactNode> = {
  holy: <Sparkles size={34} />,
  protection: <Shield size={34} />,
  retribution: <Swords size={34} />,
}

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
          <h1>{HUB_TITLE}</h1>
          <p>{HUB_INTRO}<br />{HUB_INTRO_SUB}</p>
          <HubLink href="/paladin#calculator" placement="hero" className="button primary"><Calculator size={17} /> Open Talent Calculator</HubLink>
        </div>
      </section>

      <section className="hub-section shell" id="specializations">
        <header className="hub-section-heading"><div className="eyebrow">Three Talent Paths</div><h2>Choose Your Paladin Specialization</h2><p>Start with the role you want to play, then open a focused build and customize its talent allocation.</p></header>
        <div className="hub-spec-grid">{HUB_SPECIALIZATIONS.map((spec) => <HubLink href={spec.href} placement={`spec-${spec.id}`} key={spec.id}><i>{specializationIcons[spec.icon]}</i><h3>{spec.name}</h3><p>{spec.role}</p><span>View Builds <ArrowRight size={15} /></span></HubLink>)}</div>
      </section>

      {HUB_PLAYSTYLE_SECTIONS.map((section) => (
        <section className="hub-section shell" id={section.id} key={section.id}>
          <header className="hub-section-heading"><div className="eyebrow">{section.eyebrow}</div><h2>{section.heading}</h2><p>{section.intro}</p></header>
          <div className="hub-build-grid">{section.builds.map((build) => <BuildCard key={build.id} eyebrow={section.eyebrow} title={build.title} description={build.description} href={build.href} icon={build.icon} onOpen={() => track('paladin_hub_click', { placement: build.id, destination: build.href })} />)}</div>
        </section>
      ))}

      <section className="hub-tool shell">
        <div><div className="eyebrow">Interactive Build Planner</div><h2>Create Your Own Paladin Build</h2><p>Plan talents.<br />Test different paths.<br />Share your setup.</p></div>
        <HubLink href="/paladin#calculator" placement="calculator-cta" className="button primary"><Calculator size={18} /> Open WoW Forever Paladin Talent Calculator</HubLink>
      </section>

      <section className="hub-data shell"><div><div className="eyebrow">About Our Data</div><h2>Transparent Community Research</h2></div><div><p>BuildForgeTools uses community research and reference materials to create preview talent planners for WoW Forever.</p><p>Talent data is continuously reviewed and updated. Every build is presented as a planning reference while the underlying information is verified.</p><a href={HUB_TALENTS.href}>{HUB_TALENTS.label} <ArrowRight size={15} /></a><br /><HubLink href="/wow-forever-paladin-beta-talent-changes" placement="beta-tracker">Track Paladin Beta talent changes <ArrowRight size={15} /></HubLink></div></section>

      <SiteFooter links={[{ href: '/paladin', label: 'Talent Calculator' }, { href: '/wow-forever-paladin-talents', label: 'Paladin Talents' }, { href: '/wow-forever-protection-paladin-build', label: 'Protection Build' }]} />
    </main>
  )
}
