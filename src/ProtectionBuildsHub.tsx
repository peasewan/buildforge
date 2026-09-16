import { ArrowRight, Calculator, Shield } from 'lucide-react'
import BuildCard from './BuildCard'
import { PROTECTION_HUB_BUILD_TYPES, PROTECTION_HUB_INTRO, PROTECTION_HUB_RELATED, PROTECTION_HUB_TALENTS, PROTECTION_HUB_TITLE } from './data/protectionBuildsHub'
import { track } from './lib/analytics'

function ProtectionLink({ href, placement, className, children }: { href: string; placement: string; className?: string; children: React.ReactNode }) {
  return <a href={href} className={className} onClick={() => track('protection_hub_click', { placement, destination: href })}>{children}</a>
}

export default function ProtectionBuildsHub() {
  return (
    <main className="hub-page protection-hub-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Protection hub navigation"><a href="#featured-build">Featured Build</a><a href="#build-types">Build Types</a><a href="#protection-talents">Talents</a></nav>
        <ProtectionLink href="/paladin#calculator" placement="header" className="button primary">Open Planner</ProtectionLink>
      </header>

      <section className="protection-hub-hero">
        <div className="protection-hub-art" />
        <div className="protection-hub-shade" />
        <div className="shell protection-hub-hero-inner">
          <div className="eyebrow"><Shield size={15} /> Protection Paladin</div>
          <h1>{PROTECTION_HUB_TITLE}</h1>
          <p>{PROTECTION_HUB_INTRO}</p>
          <span>Tank builds, talent paths, and community preview setups.</span>
          <ProtectionLink href="/paladin#calculator" placement="hero" className="button primary"><Calculator size={17} /> Open Talent Calculator</ProtectionLink>
        </div>
      </section>

      <section className="protection-feature shell" id="featured-build">
        <header className="hub-section-heading"><div className="eyebrow">Featured Build</div><h2>Protection Paladin Dungeon Tank Build</h2><p>A complete community preview setup for players exploring a defensive Protection path.</p></header>
        <article>
          <div className="protection-feature-icon"><Shield size={42} /></div>
          <dl><div><dt>Role</dt><dd>Dungeon Tank</dd></div><div><dt>Playstyle</dt><dd>Defensive / Utility</dd></div><div><dt>Status</dt><dd>Community Preview</dd></div></dl>
          <ProtectionLink href="/wow-forever-protection-paladin-dungeon-build" placement="featured" className="button primary">View Build <ArrowRight size={16} /></ProtectionLink>
        </article>
      </section>

      <section className="hub-popular" id="build-types"><div className="shell">
        <header className="hub-section-heading"><div className="eyebrow">Choose a Starting Point</div><h2>Protection Build Types</h2><p>Compare defensive routes by the kind of content you want to prepare for.</p></header>
        <div className="protection-type-grid">{PROTECTION_HUB_BUILD_TYPES.map((build) => <BuildCard compact key={build.eyebrow} eyebrow={build.eyebrow} title={build.title} description={build.description} href={build.href} icon={build.icon} onOpen={() => track('protection_hub_click', { placement: `type-${build.eyebrow.toLowerCase().replaceAll(' ', '-')}`, destination: build.href })} />)}</div>
      </div></section>

      <section className="hub-tool shell">
        <div><div className="eyebrow">Interactive Talent Planner</div><h2>Create Your Protection Paladin Build</h2><p>Customize talents.<br />Test different paths.<br />Share your setup.</p></div>
        <ProtectionLink href="/paladin#calculator" placement="calculator" className="button primary"><Calculator size={18} /> Open Paladin Talent Calculator</ProtectionLink>
      </section>

      <section className="hub-data shell" id="protection-talents"><div><div className="eyebrow">Protection Talent Tree</div><h2>Protection Paladin Talents</h2></div><div><p>Explore Protection talent choices, key talents, and recommended paths before committing to a tank build.</p><p>The dedicated talent page shows the current community preview tree and connects every selected route back to the interactive calculator.</p><ProtectionLink href={PROTECTION_HUB_TALENTS.href} placement="talents">{PROTECTION_HUB_TALENTS.label} <ArrowRight size={15} /></ProtectionLink></div></section>

      <section className="hub-resources shell"><div className="eyebrow">Keep Exploring</div><h2>More Paladin Builds</h2><nav>{PROTECTION_HUB_RELATED.map(({ label, href }) => <ProtectionLink href={href} placement="related" key={href}><span>{label}</span><ArrowRight size={17} /></ProtectionLink>)}</nav></section>

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/wow-forever-paladin-builds">All Paladin Builds</a><a href="/wow-forever-protection-paladin-talents">Protection Talents</a><a href="/paladin">Talent Calculator</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  )
}
