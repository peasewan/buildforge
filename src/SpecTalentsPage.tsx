import { ArrowRight, Calculator, Heart, Shield, Swords } from 'lucide-react'
import { TalentTree } from './App'
import { exampleBuildById, isHistoricalExample } from './data/builds'
import { branchNames } from './data/talents'
import { specTalentsPageBySpec } from './data/specTalentsPages'
import type { Branch } from './lib/build'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'

const specIcons: Record<Branch, React.ReactNode> = {
  holy: <Heart size={15} />,
  protection: <Shield size={15} />,
  retribution: <Swords size={15} />,
}

const finalIcons: Record<Branch, string> = {
  holy: '/images/icons/holy-strike.png',
  protection: '/images/icons/shield.png',
  retribution: '/images/icons/hammer.png',
}

export default function SpecTalentsPage({ spec }: { spec: Branch }) {
  const page = specTalentsPageBySpec(spec)
  const example = exampleBuildById(page.buildId)
  const isHistorical = isHistoricalExample(example)
  const plannerHref = isHistorical ? '/build?id=#calculator' : '/paladin#calculator'
  // Per-specialization event name keeps protection_talents_cta_click history continuous.
  const cta = (placement: string) => () => track(`${spec}_talents_cta_click`, { spec, placement })

  return (
    <main className="spec-talents-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label={`${page.title} navigation`}>{page.nav.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
        <a className="button primary" href={plannerHref} onClick={cta('header')}>{isHistorical ? 'Open Blank Planner' : 'Open Planner'}</a>
      </header>

      <section className="spec-talents-hero">
        <div className="shell">
          <div className="eyebrow">{specIcons[spec]} {page.eyebrow}</div>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <a className="button primary" href={plannerHref} onClick={cta('hero')}><Calculator size={17} /> {isHistorical ? 'Start a new build' : 'Build This Setup'}</a>
        </div>
      </section>

      <BetaDataStatus />

      <section className="spec-tree-section shell" id="talent-tree" aria-label={`${branchNames[spec]} talent preview`}>
        <header className="hub-section-heading"><div className="eyebrow">Beta Talent Data</div><h2>{page.title.replace('WoW Forever ', '')} Beta Talent Tree</h2><p>This read-only preview highlights a historical 51-point {page.allocation.value} reference from imported client build 1.60.1.69913. The live Beta cap is Level 30, so this is not a complete current build. {example.reviewStatus === 'under_review' ? 'Crusade also appears in a reported 70009 removal but its node identity is under review.' : 'Start a new calculator route to plan within the live Beta cap.'}</p></header>
        <div className="spec-tree-layout">
          <div className="tree-card"><TalentTree branch={spec} build={example.build} readOnly /></div>
          <aside>
            <span>{page.allocation.label}</span><strong>{page.allocation.value}</strong>
            <p>{page.allocation.note}</p>
            <a className="button primary" href={plannerHref} onClick={cta('tree')}>{isHistorical ? 'Open blank calculator' : 'Open editable calculator'} <ArrowRight size={15} /></a>
          </aside>
        </div>
      </section>

      <article className="spec-talent-copy shell">
        {page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}</section>)}
      </article>

      <section className="spec-talent-final shell"><img src={finalIcons[spec]} alt="" /><div><span>Ready to plan?</span><h2>Create Your {spec.charAt(0).toUpperCase() + spec.slice(1)} Build</h2></div><a className="button primary" href={plannerHref} onClick={cta('footer')}>{isHistorical ? 'Start a new build' : 'Build this setup'} <ArrowRight size={15} /></a></section>

      <SiteFooter links={[{ href: page.hub.href, label: page.hub.label }, { href: '/wow-forever-paladin-builds', label: 'All Paladin Builds' }, { href: '/paladin', label: 'Talent Calculator' }]} />
    </main>
  )
}
