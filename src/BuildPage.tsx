import { ArrowRight, Calculator, Check, Shield, Sparkles } from 'lucide-react'
import holyContent from './content/holy-healing-build.json'
import protectionContent from './content/protection-shield-build.json'
import retributionContent from './content/retribution-judgment-build.json'
import { EXAMPLE_BUILDS, HOLY_HEALING_BUILD, type ExampleBuild } from './data/builds'
import { branchNames, talents } from './data/talents'
import { branchPoints, type Branch } from './lib/build'
import { track } from './lib/analytics'

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

const contentByBuildId: Record<string, BuildContent> = {
  [HOLY_HEALING_BUILD.id]: holyContent,
  'protection-shield-20-31-0': protectionContent,
  'retribution-judgment-0-20-31': retributionContent,
}

function OpenBuildLink({ build, href, placement, children }: { build: ExampleBuild; href: string; placement: string; children: React.ReactNode }) {
  return <a className="button primary" href={href} onClick={() => track('build_page_open_planner', { build_id: build.id, placement })}>{children}</a>
}

export default function BuildPage({ buildId = HOLY_HEALING_BUILD.id }: { buildId?: string }) {
  const build = EXAMPLE_BUILDS.find((candidate) => candidate.id === buildId) ?? HOLY_HEALING_BUILD
  const buildContent = contentByBuildId[build.id] ?? holyContent
  const selectedByBranch = branches.map((branch) => ({
    branch,
    points: branchPoints(build.build, branch, talents),
    talents: talents.filter((talent) => talent.branch === branch && (build.build[talent.id] ?? 0) > 0),
  }))
  const heroTitle = build.id === HOLY_HEALING_BUILD.id ? 'Paladin Build' : `${buildContent.spec} Paladin Build`

  return (
    <main className="build-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Build navigation"><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-talents">Paladin Talents</a><a href="#talent-allocation">Selected Talents</a></nav>
        <OpenBuildLink build={build} href={buildContent.plannerPath} placement="header">Open Build</OpenBuildLink>
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
            <div className="build-actions"><OpenBuildLink build={build} href={buildContent.plannerPath} placement="hero"><Calculator size={16} /> Open This Build</OpenBuildLink><a className="text-link" href="#talent-allocation">View selected talents <ArrowRight size={15} /></a></div>
            <small>Updated {buildContent.updated} · Community preview data</small>
          </div>
          <aside className="build-allocation-card" aria-label="Build allocation">
            <span>Talent allocation</span>
            <strong>{build.allocation}</strong>
            <div>{selectedByBranch.map(({ branch, points }) => <p key={branch}><img src={branch === 'holy' ? '/images/icons/holy-strike.png' : branch === 'protection' ? '/images/icons/shield.png' : '/images/icons/hammer.png'} alt="" /><span>{branchNames[branch]}</span><b>{points}</b></p>)}</div>
            <div className="build-allocation-status"><Check size={15} /> 51 of 51 points allocated</div>
          </aside>
        </div>
      </section>

      <section className="build-talents shell" id="talent-allocation">
        <div className="section-heading centered"><div className="eyebrow">Full allocation</div><h2>Selected Talents</h2><p>The exact ranks loaded by this {build.allocation} {buildContent.spec} Paladin build.</p></div>
        <div className="build-talent-columns">
          {selectedByBranch.map(({ branch, points, talents: selectedTalents }) => (
            <article key={branch} className={selectedTalents.length ? '' : 'empty'}>
              <header><img src={branch === 'holy' ? '/images/icons/holy-strike.png' : branch === 'protection' ? '/images/icons/shield.png' : '/images/icons/hammer.png'} alt="" /><div><h3>{branchNames[branch]}</h3><span>{points} points</span></div></header>
              {selectedTalents.length ? <ul>{selectedTalents.map((talent) => <li key={talent.id}><img src={talent.icon} alt="" /><span>{talent.name}</span><b>{build.build[talent.id]}/{talent.maxRank}</b></li>)}</ul> : <p>No points selected in this branch.</p>}
            </article>
          ))}
        </div>
        <div className="build-inline-cta"><Shield size={30} /><div><strong>Make it your build</strong><span>Load all 51 points, change any rank, then copy a new share link.</span></div><OpenBuildLink build={build} href={buildContent.plannerPath} placement="allocation">Edit in Calculator <ArrowRight size={15} /></OpenBuildLink></div>
      </section>

      <article className="build-copy shell">
        {buildContent.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        <aside className="guide-note"><strong>Community preview</strong><p>This build uses publicly demonstrated WoW Forever talent information. Verify current in-game tooltips before treating any value as final.</p></aside>
        <div className="guide-final-cta"><img src="/images/icons/paladin-shield.png" alt="" /><div><span>Ready to customize it?</span><h2>{buildContent.footerHeading}</h2></div><OpenBuildLink build={build} href={buildContent.plannerPath} placement="footer">Open Build <ArrowRight size={15} /></OpenBuildLink></div>
      </article>

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/wow-forever-paladin-build">Holy Build</a><a href="/wow-forever-protection-paladin-build">Protection Build</a><a href="/wow-forever-retribution-paladin-build">Retribution Build</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  )
}
