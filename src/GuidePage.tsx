import { ArrowRight, BookOpen, Calculator, ExternalLink, Shield, Sparkles, Swords } from 'lucide-react'
import guide from './content/paladin-guide.json'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'

const specCards = [
  { name: 'Holy Paladin', description: 'Healing, spell support, and efficient use of the Light.', icon: Sparkles, anchor: 'holy-paladin' },
  { name: 'Protection Paladin', description: 'Shields, durability, threat, and group protection.', icon: Shield, anchor: 'protection-paladin' },
  { name: 'Retribution Paladin', description: 'Weapon combat, judgments, and offensive holy power.', icon: Swords, anchor: 'retribution-paladin' },
]

export default function GuidePage() {
  return (
    <main className="guide-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Guide navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-build">Paladin Build</a><a href="#paladin-talents">Paladin Talents</a></nav>
        <a className="nav-cta guide-nav-cta" href="/paladin#calculator" onClick={() => track('guide_cta_click', { placement: 'header' })}>Open Planner</a>
      </header>

      <section className="guide-hero">
        <div className="guide-hero-art" />
        <div className="guide-hero-shade" />
        <div className="shell guide-hero-inner">
          <div className="eyebrow"><BookOpen size={14} /> {guide.eyebrow}</div>
          <h1>{guide.title}</h1>
          <p>{guide.dek}</p>
          <div className="guide-actions">
            <a className="button primary" href="/paladin#calculator" onClick={() => track('guide_cta_click', { placement: 'hero' })}><Calculator size={16} /> Open Talent Calculator</a>
            <a className="text-link" href="#what-is-wow-forever">Read the guide <ArrowRight size={15} /></a>
          </div>
        </div>
      </section>

      <BetaDataStatus />

      <section className="guide-specs shell" aria-label="Paladin specializations">
        {specCards.map(({ name, description, icon: Icon, anchor }) => (
          <a href={`#${anchor}`} key={name}><Icon size={21} /><span><strong>{name}</strong><small>{description}</small></span><ArrowRight size={15} /></a>
        ))}
      </section>

      <div className="guide-layout shell">
        <aside className="guide-toc">
          <span>On this page</span>
          <nav>{guide.sections.map((section, index) => <a href={`#${section.id}`} key={section.id}><b>0{index + 1}</b>{section.heading}</a>)}</nav>
        </aside>

        <article className="guide-article">
          {guide.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.id === 'what-is-wow-forever' && <a className="source-link" href="https://worldofwarcraft.blizzard.com/en-us/news/24301508/" target="_blank" rel="noreferrer">Official World of Warcraft: Forever announcement <ExternalLink size={13} /></a>}
            </section>
          ))}
          <aside className="guide-note"><strong>Beta talent data</strong><p>Talent positions, ranks, prerequisite links, and tooltips use Beta client build 1.60.1.69913. The client does not specify the required prerequisite rank, so the planner currently applies the Classic rule that the prerequisite must be maxed. Build recommendations remain community planning examples.</p></aside>
          <div className="guide-final-cta"><img src="/images/icons/paladin-shield.png" alt="" /><div><span>Ready to test a build?</span><h2>Plan all 51 points in the Paladin calculator.</h2></div><a className="button primary" href="/paladin#calculator" onClick={() => track('guide_cta_click', { placement: 'footer' })}>Create your WoW Forever Paladin build <ArrowRight size={15} /></a></div>
        </article>
      </div>

      <SiteFooter />
    </main>
  )
}
