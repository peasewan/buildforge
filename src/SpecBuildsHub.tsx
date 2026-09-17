import { ArrowRight, Calculator, Heart, Shield, Swords } from 'lucide-react'
import BuildCard from './BuildCard'
import { specBuildsHubBySpec } from './data/specBuildsHubs'
import type { Branch } from './lib/build'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'

const specIcons: Record<Branch, React.ReactNode> = {
  holy: <Heart size={15} />,
  protection: <Shield size={15} />,
  retribution: <Swords size={15} />,
}

const heroIcons: Record<Branch, React.ReactNode> = {
  holy: <Heart size={42} />,
  protection: <Shield size={42} />,
  retribution: <Swords size={42} />,
}

export default function SpecBuildsHub({ spec }: { spec: Branch }) {
  const hub = specBuildsHubBySpec(spec)
  // The event name is per specialization so the existing protection_hub_click history stays continuous.
  const link = (placement: string) => (href: string) => () => track(`${spec}_hub_click`, { spec, placement, destination: href })

  return (
    <main className="hub-page spec-hub-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label={`${hub.title} navigation`}><a href="#featured-build">Featured Build</a><a href="#build-types">Build Types</a><a href="#talents">Talents</a></nav>
        <a href="/paladin#calculator" className="button primary" onClick={link('header')('/paladin#calculator')}>Open Planner</a>
      </header>

      <section className="spec-hub-hero">
        <div className="spec-hub-art" />
        <div className="spec-hub-shade" />
        <div className="shell spec-hub-hero-inner">
          <div className="eyebrow">{specIcons[spec]} {spec.charAt(0).toUpperCase() + spec.slice(1)} Paladin</div>
          <h1>{hub.title}</h1>
          <p>{hub.intro}</p>
          <span>Builds, talent paths, and community preview setups.</span>
          <a href="/paladin#calculator" className="button primary" onClick={link('hero')('/paladin#calculator')}><Calculator size={17} /> Open Talent Calculator</a>
        </div>
      </section>

      <section className="spec-feature shell" id="featured-build">
        <header className="hub-section-heading"><div className="eyebrow">Featured Build</div><h2>{hub.featured.title}</h2><p>{hub.featured.description}</p></header>
        <article>
          <div className="spec-feature-icon">{heroIcons[spec]}</div>
          <dl><div><dt>Role</dt><dd>{hub.featured.role}</dd></div><div><dt>Playstyle</dt><dd>{hub.featured.playstyle}</dd></div><div><dt>Status</dt><dd>Community Preview</dd></div></dl>
          <a href={hub.featured.href} className="button primary" onClick={link('featured')(hub.featured.href)}>View Build <ArrowRight size={16} /></a>
        </article>
      </section>

      <section className="hub-popular" id="build-types"><div className="shell">
        <header className="hub-section-heading"><div className="eyebrow">Choose a Starting Point</div><h2>{spec.charAt(0).toUpperCase() + spec.slice(1)} Build Types</h2><p>Compare routes by the kind of content you want to prepare for.</p></header>
        <div className="spec-type-grid">{hub.buildTypes.map((build) => <BuildCard compact key={build.id} eyebrow={build.eyebrow} title={build.title} description={build.description} href={build.href} icon={build.icon} onOpen={link(`type-${build.id}`)(build.href)} />)}</div>
      </div></section>

      <article className="spec-editorial shell">
        {hub.editorialSections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 50)}>{paragraph}</p>)}</section>)}
      </article>

      <section className="hub-tool shell">
        <div><div className="eyebrow">Interactive Talent Planner</div><h2>Create Your {spec.charAt(0).toUpperCase() + spec.slice(1)} Paladin Build</h2><p>Customize talents.<br />Test different paths.<br />Share your setup.</p></div>
        <a href="/paladin#calculator" className="button primary" onClick={link('calculator')('/paladin#calculator')}><Calculator size={18} /> Open Paladin Talent Calculator</a>
      </section>

      <section className="hub-data shell" id="talents"><div><div className="eyebrow">{spec.charAt(0).toUpperCase() + spec.slice(1)} Talent Tree</div><h2>{spec.charAt(0).toUpperCase() + spec.slice(1)} Paladin Talents</h2></div>{hub.talents.map((item) => <div key={item.href}><p>Explore {spec} talent choices, key talents, and recommended paths before committing to a build.</p><p>The dedicated talent page shows the current community preview tree and connects every selected route back to the interactive calculator.</p><a href={item.href} onClick={link('talents')(item.href)}>{item.label} <ArrowRight size={15} /></a></div>)}</section>

      <section className="hub-resources shell"><div className="eyebrow">Keep Exploring</div><h2>More Paladin Builds</h2><nav>{hub.related.map((item) => <a href={item.href} key={item.href} onClick={link('related')(item.href)}><span>{item.label}</span><ArrowRight size={17} /></a>)}</nav></section>

      <SiteFooter links={[{ href: '/wow-forever-paladin-builds', label: 'All Paladin Builds' }, { href: hub.talents[0]?.href ?? '/wow-forever-paladin-talents', label: `${spec.charAt(0).toUpperCase() + spec.slice(1)} Talents` }, { href: '/paladin', label: 'Talent Calculator' }]} />
    </main>
  )
}
