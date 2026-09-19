import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, Heart, Route, Shield, Sparkles, Swords, UsersRound } from 'lucide-react'
import { TalentTree } from './App'
import { exampleBuildById, specializationOfBuild } from './data/builds'
import { buildLandingPageById, type BuildLandingPageId, type LandingIcon, type LandingSection } from './data/buildLandingPages'
import { encodeBuild } from './lib/build'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'
import BetaLevelingSnapshot from './BetaLevelingSnapshot'
import { betaLevelingPlannerHref } from './data/levelingBeta'

const icons: Record<LandingIcon, ReactNode> = {
  sword: <Swords size={24} />,
  shield: <Shield size={24} />,
  sparkles: <Sparkles size={24} />,
  heart: <Heart size={24} />,
  users: <UsersRound size={24} />,
  route: <Route size={24} />,
}

function TrackedLink({ href, pageId, placement, className, children }: { href: string; pageId: string; placement: string; className?: string; children: ReactNode }) {
  return <a href={href} className={className} onClick={() => track('build_landing_cta_click', { page_id: pageId, placement })}>{children}</a>
}

function LandingSectionView({ section, pageId }: { section: LandingSection; pageId: BuildLandingPageId }) {
  if (section.kind === 'copy') return (
    <section className="landing-content-section landing-copy-section">
      <header><div className="eyebrow">Build Notes</div><h2>{section.title}</h2>{section.intro && <p>{section.intro}</p>}</header>
      <div>{section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 50)}>{paragraph}</p>)}</div>
    </section>
  )

  if (section.kind === 'cards') return (
    <section className="landing-content-section">
      <header><div className="eyebrow">Build Focus</div><h2>{section.title}</h2>{section.intro && <p>{section.intro}</p>}</header>
      <div className="landing-card-grid">{section.items.map((item) => {
        const card = <article><i>{icons[item.icon]}</i><h3>{item.title}</h3><p>{item.body}</p></article>
        return item.href
          ? <TrackedLink key={item.title} href={item.href} pageId={pageId} placement="card">{card}</TrackedLink>
          : <article key={item.title}><i>{icons[item.icon]}</i><h3>{item.title}</h3><p>{item.body}</p></article>
      })}</div>
    </section>
  )

  if (section.kind === 'steps') return (
    <section className="landing-content-section">
      <header><div className="eyebrow">Build Path</div><h2>{section.title}</h2>{section.intro && <p>{section.intro}</p>}</header>
      <div className="landing-step-grid">{section.items.map((item, index) => <article key={item.title}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div></article>)}</div>
    </section>
  )

  if (section.kind === 'bullets') return (
    <section className="landing-content-section landing-bullets">
      <header><div className="eyebrow">Planning Notes</div><h2>{section.title}</h2><p>{section.intro}</p></header>
      <ul>{section.items.map((item) => <li key={item}><Sparkles size={16} />{item}</li>)}</ul>
    </section>
  )

  if (section.kind === 'talent-preview') {
    const example = exampleBuildById(section.buildId)
    const editHref = `/build?id=${encodeBuild(example.build)}#calculator`
    return (
      <section className="landing-content-section landing-talent-preview">
        <header><div className="eyebrow">Beta Talent Tree</div><h2>{section.title}</h2><p>{section.intro}</p></header>
        <div className="landing-tree-card"><TalentTree branch={specializationOfBuild(example)} build={example.build} /></div>
        <TrackedLink href={editHref} pageId={pageId} placement="talent-preview" className="button primary">Edit this build <ArrowRight size={16} /></TrackedLink>
      </section>
    )
  }

  return (
    <section className="landing-content-section">
      <header><div className="eyebrow">Continue Exploring</div><h2>{section.title}</h2></header>
      <div className="landing-related-grid">{section.items.map((item) => <TrackedLink key={item.href} href={item.href} pageId={pageId} placement="related"><span>{item.title}</span><p>{item.body}</p><ArrowRight size={17} /></TrackedLink>)}</div>
    </section>
  )
}

export default function BuildLandingPage({ pageId }: { pageId: BuildLandingPageId }) {
  const page = buildLandingPageById(pageId)
  const heroStyle = { '--landing-hero-image': `url(${page.heroImage})`, '--landing-hero-position': page.heroPosition } as CSSProperties
  const preview = page.sections.find((section) => section.kind === 'talent-preview')
  const ctaBuildId = preview?.buildId ?? page.ctaBuildId
  const levelingHref = pageId === 'leveling' || pageId === 'protection-leveling' ? betaLevelingPlannerHref(pageId) : null
  const primaryHref = levelingHref ?? (ctaBuildId ? `/build?id=${encodeBuild(exampleBuildById(ctaBuildId).build)}#calculator` : '/paladin#calculator')

  return (
    <main className="landing-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Build navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-talents">Paladin Talents</a><a href="#build-content">Build Details</a></nav>
        <TrackedLink href={primaryHref} pageId={pageId} placement="header" className="button primary">Open Planner</TrackedLink>
      </header>

      <section className="landing-hero" style={heroStyle}>
        <div className="landing-hero-art" /><div className="landing-hero-shade" />
        <div className="shell landing-hero-grid">
          <div className="landing-hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> {page.eyebrow}</div>
            <h1>{page.title}</h1>
            <p>{page.subtitle}</p>
            <span>Community build example using the current WoW Forever Beta talent tree.</span>
            <div className="button-row"><TrackedLink href={primaryHref} pageId={pageId} placement="hero" className="button primary">Open Talent Calculator</TrackedLink>{preview && <a href="#build-content" className="button secondary">View Talent Tree <ArrowRight size={15} /></a>}</div>
          </div>
          <aside className="landing-summary-card" aria-label="Build summary">
            <div><span>Build Summary</span><i>Beta</i></div>
            <dl>{page.summary.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          </aside>
        </div>
      </section>

      <BetaDataStatus />
      {(pageId === 'leveling' || pageId === 'protection-leveling') && <BetaLevelingSnapshot pageId={pageId} />}

      <div className="shell landing-content" id="build-content">
        {page.sections.map((section) => <LandingSectionView key={section.title} section={section} pageId={pageId} />)}
        <section className="landing-final-cta"><img src="/images/icons/paladin-shield.png" alt="" /><div><span>{page.finalCta.eyebrow}</span><h2>{page.finalCta.title}</h2></div><TrackedLink href={ctaBuildId ? primaryHref : '/paladin#calculator'} pageId={pageId} placement="footer" className="button primary">{page.finalCta.label} <ArrowRight size={16} /></TrackedLink></section>
      </div>

      <SiteFooter />
    </main>
  )
}
