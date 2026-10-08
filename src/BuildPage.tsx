import { ArrowRight, Calculator, Check, Shield, Sparkles } from 'lucide-react'
import holyContent from './content/holy-healing-build.json'
import protectionContent from './content/protection-shield-build.json'
import retributionContent from './content/retribution-judgment-build.json'
import retributionLevelingContent from './content/retribution-leveling-build.json'
import { exampleBuildById, examplePlannerHref, HOLY_HEALING_BUILD, type ExampleBuild, type ExampleBuildId } from './data/builds'
import { branchNames, historicalTalents as talents } from './data/talents'
import { branchPoints, type Branch } from './lib/build'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'
import BetaTalentAvailability from './BetaTalentAvailability'
import BetaLevelingSnapshot from './BetaLevelingSnapshot'
import PaladinBuildDecisions from './PaladinBuildDecisions'
import BetaSpecPath from './BetaSpecPath'
import OfficialBuildChangeSummary from './OfficialBuildChangeSummary'

const branches: Branch[] = ['holy', 'protection', 'retribution']

interface BuildContent {
  eyebrow: string
  title: string
  dek: string
  updated: string
  spec: string
  heroHeading: string
  allocationSummary: string
  footerHeading: string
  plannerPath: string
  sections: { id: string; heading: string; paragraphs: string[] }[]
}

const contentByBuildId: Record<ExampleBuildId, BuildContent> = {
  [HOLY_HEALING_BUILD.id]: holyContent,
  'protection-shield-20-31-0': protectionContent,
  'retribution-judgment-0-20-31': retributionContent,
  'retribution-leveling-20-0-31': retributionLevelingContent,
}

const calculatorCta: Record<string, { prompt: string; anchor: string }> = {
  [HOLY_HEALING_BUILD.id]: { prompt: 'Want to start a build from scratch?', anchor: 'Open the WoW Forever Paladin Talent Calculator' },
  'protection-shield-20-31-0': { prompt: 'Want to customize this build?', anchor: 'Open the Paladin Talent Calculator' },
  'retribution-judgment-0-20-31': { prompt: 'Ready for a current route?', anchor: 'Start a new Retribution build' },
  'retribution-leveling-20-0-31': { prompt: 'Ready for a current route?', anchor: 'Start a new Retribution leveling build' },
}

function OpenBuildLink({ build, href, placement, children }: { build: ExampleBuild; href: string; placement: string; children: React.ReactNode }) {
  return <a className="button primary" href={href} onClick={() => track('build_page_open_planner', { build_id: build.id, placement })}>{children}</a>
}

export default function BuildPage({ buildId = HOLY_HEALING_BUILD.id }: { buildId?: ExampleBuildId }) {
  const build = exampleBuildById(buildId)
  const buildContent = contentByBuildId[buildId]
  const selectedByBranch = branches.map((branch) => ({
    branch,
    points: branchPoints(build.build, branch, talents),
    talents: talents.filter((talent) => talent.branch === branch && (build.build[talent.id] ?? 0) > 0),
  }))
  const heroTitle = build.id === HOLY_HEALING_BUILD.id ? 'Paladin Build' : build.id === 'retribution-leveling-20-0-31' ? 'Retribution Paladin Leveling Build' : `${buildContent.spec} Paladin Build`
  const isProtection = build.id === 'protection-shield-20-31-0'
  const underReview = build.reviewStatus === 'under_review'
  const plannerHref = examplePlannerHref(build)
  const specialization = buildContent.spec.toLowerCase() as Branch

  return (
    <main className="build-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Build navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-talents">Paladin Talents</a><a href="#talent-allocation">Selected Talents</a></nav>
        <OpenBuildLink build={build} href={plannerHref} placement="header">Start a New Build</OpenBuildLink>
      </header>

      <section className="build-hero">
        <div className="build-hero-art" />
        <div className="build-hero-shade" />
        <div className="shell build-hero-grid">
          <div className="build-hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> {buildContent.eyebrow}</div>
            <h1>WoW Forever<br /><span>{heroTitle}</span></h1>
            <h2>{buildContent.heroHeading}</h2>
            <p>{buildContent.dek}</p>
            <p role="status">This 51-point allocation is a long-term historical reference. The live Beta cap is Level 30, so it cannot be played as a complete current Beta build. {underReview && 'Its historical Crusade node is absent from the reviewed 70245 client tree.'}</p>
            <div className="build-actions"><OpenBuildLink build={build} href={plannerHref} placement="hero"><Calculator size={16} /> Start a New Build</OpenBuildLink><a className="text-link" href="#talent-allocation">View selected talents <ArrowRight size={15} /></a></div>
            <small>Historical allocation reviewed {buildContent.updated} · Page updated October 5, 2026</small>
          </div>
          <aside className="build-allocation-card" aria-label="Build allocation">
            <span>Talent allocation</span>
            <strong>{build.allocation}</strong>
            <div>{selectedByBranch.map(({ branch, points }) => <p key={branch}><img src={branch === 'holy' ? '/images/icons/holy-strike.png' : branch === 'protection' ? '/images/icons/shield.png' : '/images/icons/hammer.png'} alt="" /><span>{branchNames[branch]}</span><b>{points}</b></p>)}</div>
            <div className="build-allocation-status"><Check size={15} /> 51-point long-term reference</div>
          </aside>
        </div>
      </section>

      <BetaDataStatus />
      <PaladinBuildDecisions branch={specialization} />
      <div className="shell"><OfficialBuildChangeSummary className="paladin" buildVersion="1.60.1.69913" selectedTalents={selectedByBranch.flatMap(({ talents: selected }) => selected.map((talent) => ({ name: talent.name, rank: build.build[talent.id] ?? 0 })))} /></div>
      <BetaTalentAvailability branch={specialization} />
      {build.id !== 'retribution-leveling-20-0-31' && <BetaSpecPath branch={specialization} />}
      {build.id === 'retribution-leveling-20-0-31' && <BetaLevelingSnapshot pageId="retribution-leveling" />}

      <section className="build-talents shell" id="talent-allocation">
        <div className="section-heading centered"><div className="eyebrow">Historical full allocation</div><h2>Selected Talents</h2><p>Historical ranks recorded for this {build.allocation} {buildContent.spec} Paladin example; these 51 points are not loaded as a current Level 30 build.</p></div>
        <div className="build-talent-columns">
          {selectedByBranch.map(({ branch, points, talents: selectedTalents }) => (
            <article key={branch} className={selectedTalents.length ? '' : 'empty'}>
              <header><img src={branch === 'holy' ? '/images/icons/holy-strike.png' : branch === 'protection' ? '/images/icons/shield.png' : '/images/icons/hammer.png'} alt="" /><div><h3>{branchNames[branch]}</h3><span>{points} points</span></div></header>
              {selectedTalents.length ? <ul>{selectedTalents.map((talent) => <li key={talent.id}><img src={talent.icon} alt="" /><span>{talent.name}</span><b>{build.build[talent.id]}/{talent.maxRank}</b></li>)}</ul> : <p>No points selected in this branch.</p>}
            </article>
          ))}
        </div>
        <div className="build-inline-cta"><Shield size={30} /><div><strong>Draft a Beta route</strong><span>Start with a blank reviewed 70245 tree and select Level 30 to enforce the 21-point budget. This historical 51-point allocation stays here for comparison{underReview ? ' because Crusade is absent from the current tree.' : '.'}</span></div><OpenBuildLink build={build} href={plannerHref} placement="allocation">Start in Calculator <ArrowRight size={15} /></OpenBuildLink></div>
      </section>

      <article className="build-copy shell">
        {buildContent.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        {isProtection && <section className="protection-build-more" aria-label="Continue with Protection"><h2>Continue with Protection</h2><p>Compare this historical 51-point example with the editable Level 20 and Level 30 Protection leveling routes, a dungeon setup, or the talent reference.</p><div className="protection-next-links"><a href="/wow-forever-protection-paladin-dungeon-build">Dungeon Tank Build <ArrowRight size={15} /></a><a href="/wow-forever-protection-paladin-leveling-build">Protection Leveling Routes <ArrowRight size={15} /></a><a href="/wow-forever-protection-paladin-talents">Protection Talents <ArrowRight size={15} /></a><a href="/paladin#calculator">Open Talent Calculator <ArrowRight size={15} /></a></div><a className="protection-hub-link" href="/wow-forever-protection-paladin-builds">Browse the Protection Builds Hub <ArrowRight size={15} /></a></section>}
        <aside className="guide-note"><strong>Historical community build example</strong><p>{underReview ? 'This selected allocation comes from the 1.60.1.69913 client snapshot. The reviewed 70245 client tree confirms Crusade is absent; no official removal note is claimed. The example is retained for comparison and withheld from current calculator presets.' : 'The 51-point allocation exceeds the live Level 30 Beta cap. Its talent tree and tooltips use client build 1.60.1.69913 and may not reflect later official tuning; inspect it as a long-term reference, not a current recommendation.'}</p></aside>
        <div className="guide-final-cta"><img src="/images/icons/paladin-shield.png" alt="" /><div><span>Ready to plan a current route?</span><h2>Start from a blank Paladin tree.</h2></div><OpenBuildLink build={build} href={plannerHref} placement="footer">Open Calculator <ArrowRight size={15} /></OpenBuildLink></div>
        <p className="build-calc-anchor">{calculatorCta[build.id].prompt} <a href="/paladin#calculator">{calculatorCta[build.id].anchor} <ArrowRight size={14} /></a></p>
      </article>

      <SiteFooter links={[{ href: '/wow-forever-paladin-builds', label: 'All Paladin Builds' }, { href: `/wow-forever-${buildContent.spec.toLowerCase()}-paladin-talents`, label: `${buildContent.spec} Paladin Talents` }, { href: '/wow-forever-protection-paladin-build', label: 'Protection Build' }]} />
    </main>
  )
}
