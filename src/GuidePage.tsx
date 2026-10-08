import { ArrowRight, BookOpen, Calculator, ExternalLink, Shield, Sparkles, Swords } from 'lucide-react'
import { Fragment } from 'react'
import guide from './content/paladin-guide.json'
import { BETA_DATA_VERSION, branchNames, paladinTalentIndex, talents, type Talent } from './data/talents'
import type { Branch } from './lib/build'
import { track } from './lib/analytics'
import SiteFooter from './SiteFooter'
import BetaDataStatus from './BetaDataStatus'
import PaladinRankAttribution from './PaladinRankAttribution'

const branches: Branch[] = ['holy', 'protection', 'retribution']
const octoberTunedIds = new Set(['redoubt', 'holy_shield', 'champion_of_the_light'])
const importedBuild = BETA_DATA_VERSION.replace('wow_forever_beta_', '')

const specCards = [
  { name: 'Holy Paladin', description: 'Healing, spell support, and efficient use of the Light.', icon: Sparkles, anchor: 'holy-talent-index' },
  { name: 'Protection Paladin', description: 'Shields, durability, threat, and group protection.', icon: Shield, anchor: 'protection-talent-index' },
  { name: 'Retribution Paladin', description: 'Weapon combat, judgments, and offensive holy power.', icon: Swords, anchor: 'retribution-talent-index' },
]

function talentStatus(talent: Talent) {
  if (talent.currentBetaAvailability === 'removed_official') return { label: 'Removed Sep 24', className: 'removed' }
  if (talent.currentBetaAvailability === 'removed_client_verified') return { label: 'Client-confirmed removal', className: 'removed' }
  if (talent.currentBetaAvailability === 'reported_removed_under_review') return { label: 'Removal under review', className: 'review' }
  if (octoberTunedIds.has(talent.id)) return { label: 'Oct 1 tuning', className: 'tuned' }
  return null
}

function TalentIndex() {
  return (
    <section id="talent-index" className="guide-talent-index" aria-labelledby="talent-index-heading">
      <div className="eyebrow">{talents.length} current talents · 2 historical removals · Holy / Protection / Retribution</div>
      <h2 id="talent-index-heading">Paladin talent tree index</h2>
      <p>This index shows names, tree rows, and rank caps from the last fully imported WoW Forever Beta client build {importedBuild}. The 50 current nodes are structurally checked; two removed rows preserve the 52-node historical index. This is not a recommended point order. The live Level 30 Beta grants 21 talent points. Rows requiring 25 or 30 points in one tree are beyond the current 21-point budget.</p>
      <nav className="guide-index-jump" aria-label="Jump to Paladin talent tree">
        {branches.map((branch) => <a key={branch} href={`#${branch}-talent-index`}>{branchNames[branch]} <ArrowRight size={14} /></a>)}
      </nav>
      {branches.map((branch) => {
        const branchTalents = paladinTalentIndex.filter((talent) => talent.branch === branch)
        const rows = [...new Set(branchTalents.map((talent) => talent.row))].sort((a, b) => a - b)
        return (
          <section id={`${branch}-talent-index`} className="guide-index-tree" aria-labelledby={`${branch}-talent-heading`} key={branch}>
            <div className="guide-index-tree-head">
              <div><span>{branchTalents.length} talents · {importedBuild} snapshot</span><h3 id={`${branch}-talent-heading`}>{branchNames[branch]} talent tree</h3></div>
              <a href={`/wow-forever-${branch}-paladin-talents`}>Open {branchNames[branch]} reference <ArrowRight size={14} /></a>
            </div>
            {rows.map((row) => {
              const rowTalents = branchTalents.filter((talent) => talent.row === row).sort((a, b) => a.column - b.column)
              const requiredPoints = rowTalents[0].requiredTreePoints
              return (
                <div className="guide-index-tier" key={row}>
                  <h4>Tier {row + 1} <span>{requiredPoints === 0 ? 'Starting row' : `${requiredPoints} points in ${branchNames[branch]}`}{requiredPoints > 20 ? ' · Beyond Level 30 budget' : ''}</span></h4>
                  <ul>
                    {rowTalents.map((talent) => {
                      const status = talentStatus(talent)
                      return (
                        <li key={talent.id} data-talent-id={talent.id} className={status ? `guide-index-node ${status.className}` : 'guide-index-node'}>
                          <img src={talent.icon} alt="" loading="lazy" width="34" height="34" />
                          <div><strong>{talent.name}</strong><span>{talent.maxRank} {talent.maxRank === 1 ? 'rank' : 'ranks'}{status && <b className={`guide-index-status ${status.className}`}> · {status.label}</b>}</span></div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            <a className="guide-index-calculator" href="/paladin#calculator">Test a {branchNames[branch]} route in the calculator <ArrowRight size={14} /></a>
          </section>
        )
      })}
      <p className="guide-index-caveat">Improved Holy Strike was removed by Blizzard on September 24. Crusade’s absence is client-confirmed in the reviewed 70245 tree, without an official removal claim. Historical rows remain clearly marked. The current calculator separates client structure from community-resolved rank text. <a href="/wow-forever-paladin-beta-talent-changes">Review the dated Beta changes <ArrowRight size={14} /></a></p>
      <PaladinRankAttribution />
    </section>
  )
}

export default function GuidePage() {
  return (
    <main className="guide-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Guide navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-build">Paladin Build</a><a href="#paladin-talents">Paladin Talents</a><a href="/wow-forever-paladin-abilities">Abilities</a></nav>
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
          <nav>{guide.sections.map((section, index) => <Fragment key={section.id}><a href={`#${section.id}`}><b>0{index + 1}</b>{section.heading}</a>{section.id === 'paladin-talents' && <a href="#talent-index"><b>↳</b>Talent tree index</a>}</Fragment>)}</nav>
        </aside>

        <article className="guide-article">
          {guide.sections.map((section) => (
            <Fragment key={section.id}>
              <section id={section.id}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.id === 'what-is-wow-forever' && <a className="source-link" href="https://worldofwarcraft.blizzard.com/en-us/news/24301508/" target="_blank" rel="noreferrer">Official World of Warcraft: Forever announcement <ExternalLink size={13} /></a>}
              </section>
              {section.id === 'paladin-talents' && <TalentIndex />}
            </Fragment>
          ))}
          <aside className="guide-note"><strong>Beta talent data</strong><p>Talent positions, rank caps and prerequisite links use reviewed client build 1.60.1.70245. Rank descriptions are adapted from the Talents Forever 70170 export under CC BY 4.0 with community verification. The client does not specify the required prerequisite rank, so the planner currently applies the Classic rule that the prerequisite must be maxed. Build recommendations remain community planning examples.</p></aside>
          <div className="guide-final-cta"><img src="/images/icons/paladin-shield.png" alt="" /><div><span>Ready to test a build?</span><h2>Plan a Level 30 Beta route or inspect a long-term 51-point reference.</h2></div><a className="button primary" href="/paladin#calculator" onClick={() => track('guide_cta_click', { placement: 'footer' })}>Create your WoW Forever Paladin build <ArrowRight size={15} /></a></div>
        </article>
      </div>

      <SiteFooter />
    </main>
  )
}
