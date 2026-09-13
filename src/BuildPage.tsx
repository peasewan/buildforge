import { ArrowRight, Calculator, Check, Shield, Sparkles } from 'lucide-react'
import buildContent from './content/holy-healing-build.json'
import { HOLY_HEALING_BUILD } from './data/builds'
import { branchNames, talents } from './data/talents'
import { branchPoints, encodeBuild, type Branch } from './lib/build'
import { track } from './lib/analytics'

const branches: Branch[] = ['holy', 'protection', 'retribution']
const buildHref = `/build?id=${encodeBuild(HOLY_HEALING_BUILD.build)}`

const selectedByBranch = branches.map((branch) => ({
  branch,
  points: branchPoints(HOLY_HEALING_BUILD.build, branch, talents),
  talents: talents.filter((talent) => talent.branch === branch && (HOLY_HEALING_BUILD.build[talent.id] ?? 0) > 0),
}))

function OpenBuildLink({ placement, children }: { placement: string; children: React.ReactNode }) {
  return <a className="button primary" href={buildHref} onClick={() => track('build_page_open_planner', { build_id: HOLY_HEALING_BUILD.id, placement })}>{children}</a>
}

export default function BuildPage() {
  return (
    <main className="build-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Build navigation"><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-talents">Paladin Guide</a><a href="#talent-allocation">Selected Talents</a></nav>
        <OpenBuildLink placement="header">Open Build</OpenBuildLink>
      </header>

      <section className="build-hero">
        <div className="build-hero-art" />
        <div className="build-hero-shade" />
        <div className="shell build-hero-grid">
          <div className="build-hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> {buildContent.eyebrow}</div>
            <h1>WoW Forever<br /><span>Paladin Build</span></h1>
            <h2>Holy Healing · 31/20/0</h2>
            <p>{buildContent.dek}</p>
            <div className="build-actions"><OpenBuildLink placement="hero"><Calculator size={16} /> Open This Build</OpenBuildLink><a className="text-link" href="#talent-allocation">View selected talents <ArrowRight size={15} /></a></div>
            <small>Updated {buildContent.updated} · Community preview data</small>
          </div>
          <aside className="build-allocation-card" aria-label="Build allocation">
            <span>Talent allocation</span>
            <strong>{HOLY_HEALING_BUILD.allocation}</strong>
            <div>{selectedByBranch.map(({ branch, points }) => <p key={branch}><img src={branch === 'holy' ? '/images/icons/holy-strike.png' : branch === 'protection' ? '/images/icons/shield.png' : '/images/icons/hammer.png'} alt="" /><span>{branchNames[branch]}</span><b>{points}</b></p>)}</div>
            <footer><Check size={15} /> 51 of 51 points allocated</footer>
          </aside>
        </div>
      </section>

      <section className="build-talents shell" id="talent-allocation">
        <div className="section-heading centered"><div className="eyebrow">Full allocation</div><h2>Selected Talents</h2><p>The exact ranks loaded by this 31/20/0 Holy Paladin build.</p></div>
        <div className="build-talent-columns">
          {selectedByBranch.map(({ branch, points, talents: selectedTalents }) => (
            <article key={branch} className={selectedTalents.length ? '' : 'empty'}>
              <header><img src={branch === 'holy' ? '/images/icons/holy-strike.png' : branch === 'protection' ? '/images/icons/shield.png' : '/images/icons/hammer.png'} alt="" /><div><h3>{branchNames[branch]}</h3><span>{points} points</span></div></header>
              {selectedTalents.length ? <ul>{selectedTalents.map((talent) => <li key={talent.id}><img src={talent.icon} alt="" /><span>{talent.name}</span><b>{HOLY_HEALING_BUILD.build[talent.id]}/{talent.maxRank}</b></li>)}</ul> : <p>No points selected in this branch.</p>}
            </article>
          ))}
        </div>
        <div className="build-inline-cta"><Shield size={30} /><div><strong>Make it your build</strong><span>Load all 51 points, change any rank, then copy a new share link.</span></div><OpenBuildLink placement="allocation">Edit in Calculator <ArrowRight size={15} /></OpenBuildLink></div>
      </section>

      <article className="build-copy shell">
        {buildContent.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        <aside className="guide-note"><strong>Community preview</strong><p>This build uses publicly demonstrated WoW Forever talent information. Verify current in-game tooltips before treating any value as final.</p></aside>
        <div className="guide-final-cta"><img src="/images/icons/paladin-shield.png" alt="" /><div><span>Ready to customize it?</span><h2>Open the complete 31/20/0 build.</h2></div><OpenBuildLink placement="footer">Open Build <ArrowRight size={15} /></OpenBuildLink></div>
      </article>

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-build">Paladin Build</a><a href="/wow-forever-paladin-talents">Paladin Guide</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  )
}
