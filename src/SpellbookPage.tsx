import { BookOpen, Calculator, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import SiteFooter from './SiteFooter'
import { paladinSpellbook } from './data/paladinSpellbook'
import { querySpellbook, type SpellCategory, type SpellChange } from './data/spellbook'
import { track } from './lib/analytics'

type CategoryFilter = 'all' | SpellCategory
type LevelFilter = 'all' | '20'

const categories: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All specializations' },
  { id: 'holy', label: 'Holy' },
  { id: 'protection', label: 'Protection' },
  { id: 'retribution', label: 'Retribution' },
]

const categoryLabels: Record<SpellCategory, string> = {
  holy: 'Holy',
  protection: 'Protection',
  retribution: 'Retribution',
}

const changeLabels: Record<SpellChange, string> = {
  same: 'Carried forward',
  changed: 'Changed in Forever',
  new: 'New in Forever',
  was_talent: 'Former talent',
}

export default function SpellbookPage() {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [levelCap, setLevelCap] = useState<LevelFilter>('all')
  const [search, setSearch] = useState('')
  const entries = useMemo(() => {
    const matches = querySpellbook(paladinSpellbook, {
      category: category === 'all' ? undefined : category,
      search,
    })
    return levelCap === '20' ? matches.filter((entry) => entry.learnedAt <= 20) : matches
  }, [category, levelCap, search])

  function chooseCategory(next: CategoryFilter) {
    setCategory(next)
    track('spellbook_filter', { category: next, level_cap: levelCap })
  }

  function chooseLevel(next: LevelFilter) {
    setLevelCap(next)
    track('spellbook_filter', { category, level_cap: next })
  }

  return (
    <main className="spellbook-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Spellbook navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-builds">Paladin Builds</a><a href="/wow-forever-paladin-talents">Talent Trees</a></nav>
        <a className="button primary" href="/paladin#calculator" onClick={() => track('spellbook_cta_click', { placement: 'header' })}>Open Calculator</a>
      </header>

      <section className="spellbook-hero shell">
        <div>
          <div className="eyebrow"><BookOpen size={15} /> Beta Paladin Data</div>
          <h1>WoW Forever Paladin Abilities &amp; Spellbook</h1>
          <p>Browse Paladin abilities, skills, and spells by specialization and trainer level. Use the filters to check what is available at the current Level 20 Beta cap.</p>
          <div className="spellbook-hero-actions">
            <a className="button primary" href="/paladin#calculator" onClick={() => track('spellbook_cta_click', { placement: 'hero' })}><Calculator size={17} /> Open Talent Calculator</a>
            <a className="button ghost" href="#abilities">Browse all abilities</a>
          </div>
        </div>
        <aside className="spellbook-status" aria-label="Spellbook data status">
          <span>VERSIONED DATASET</span>
          <strong>45 abilities</strong>
          <dl>
            <div><dt>Source</dt><dd>Beta client 1.60.1.69893</dd></div>
            <div><dt>Current-cap entries</dt><dd>23 at Level 20</dd></div>
            <div><dt>Last reviewed</dt><dd>Sep 18, 2026</dd></div>
            <div><dt>Coverage</dt><dd>Trainer spell groups</dd></div>
          </dl>
        </aside>
      </section>

      <section className="spellbook-boundary shell" aria-label="Data version note">
        <ShieldCheck size={22} />
        <div><strong>Beta client 1.60.1.69893</strong><p>This spellbook snapshot remains versioned separately from the 69913 talent tree. It records spell presence, first trainer level, maximum rank, and change state; exact rank tooltips are added only when reviewed source data is available.</p></div>
      </section>

      <section className="spellbook-browser shell" id="abilities">
        <div className="section-heading">
          <div className="eyebrow"><Sparkles size={14} /> Searchable Paladin Spellbook</div>
          <h2>Find a Paladin ability</h2>
          <p>{entries.length} of {paladinSpellbook.entries.length} abilities shown</p>
        </div>

        <div className="spellbook-controls">
          <div className="spellbook-filter-group" aria-label="Specialization filter">
            {categories.map((item) => <button key={item.id} type="button" className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => chooseCategory(item.id)}>{item.label}</button>)}
          </div>
          <div className="spellbook-filter-group" aria-label="Level filter">
            <button type="button" className={levelCap === 'all' ? 'active' : ''} aria-pressed={levelCap === 'all'} onClick={() => chooseLevel('all')}>All levels</button>
            <button type="button" className={levelCap === '20' ? 'active' : ''} aria-pressed={levelCap === '20'} onClick={() => chooseLevel('20')}>Level 20 cap</button>
          </div>
          <label className="spellbook-search"><Search size={17} /><span className="sr-only">Search Paladin abilities</span><input type="search" aria-label="Search Paladin abilities" placeholder="Search abilities or spells…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        </div>

        {entries.length > 0 ? <div className="spellbook-grid">
          {entries.map((entry) => <article className={`spellbook-card spellbook-${entry.category}`} key={entry.id}>
            <div className="spellbook-card-top"><span>{categoryLabels[entry.category]}</span><span className={`spellbook-change ${entry.change}`}>{changeLabels[entry.change]}</span></div>
            <h3>{entry.name}</h3>
            <dl><div><dt>First learned</dt><dd>Level {entry.learnedAt}</dd></div><div><dt>Maximum rank</dt><dd>{entry.maxRank}</dd></div></dl>
            <small>Client-datamined · {paladinSpellbook.clientBuild}</small>
          </article>)}
        </div> : <div className="spellbook-empty"><h3>No matching abilities</h3><p>Try another specialization, level range, or search term.</p></div>}
      </section>

      <section className="spellbook-context shell">
        <article><h2>How to use this spellbook</h2><p>Search by ability name, switch between Holy, Protection, and Retribution, or limit the list to spells learned by the current Level 20 Beta cap. The category describes the spellbook grouping used by the reviewed source, not a requirement to spend points in that talent tree.</p></article>
        <article><h2>What the change labels mean</h2><p><strong>New in Forever</strong> identifies newly introduced spell groups. <strong>Changed in Forever</strong> marks existing spells with reviewed changes. <strong>Former talent</strong> means the ability moved from a talent unlock into the trainer spellbook. <strong>Carried forward</strong> records an existing spell group without that type of structural change.</p></article>
        <article><h2>Data source and verification</h2><p>The 45-entry snapshot comes from reviewed Beta client data published by WoW Handbook. BuildForgeTools stores the client build on every source record so later updates can be diffed without silently rewriting history.</p><a href={paladinSpellbook.entries[0].sources[0].url} target="_blank" rel="noreferrer">Open the reviewed source</a></article>
      </section>

      <section className="spellbook-cta shell">
        <div><div className="eyebrow">Turn data into a build</div><h2>Plan your Paladin talents</h2><p>Use the interactive calculator to create a Holy, Protection, or Retribution path and share the resulting build.</p></div>
        <a className="button primary" href="/paladin#calculator" onClick={() => track('spellbook_cta_click', { placement: 'footer' })}>Open Talent Calculator</a>
      </section>

      <SiteFooter links={[{ href: '/paladin', label: 'Talent Calculator' }, { href: '/wow-forever-paladin-builds', label: 'Paladin Builds' }, { href: '/wow-forever-paladin-talents', label: 'Talent Trees' }, { href: '/wow-forever-paladin-beta-talent-changes', label: 'Beta Changes' }]} />
    </main>
  )
}
