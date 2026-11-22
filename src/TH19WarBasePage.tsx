import { useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, Copy, ExternalLink, Shield } from 'lucide-react'
import DiscoveryHeader from './DiscoveryHeader'
import SiteFooter from './SiteFooter'
import {
  clanWarRules,
  defenseGoals,
  friendlyChallengeRules,
  th19ReleaseNotes,
  warLayoutReviewDate,
  warLayouts,
  type DefenseGoal,
  type WarLayout,
} from './data/th19WarBases'

const canonical = 'https://buildforgetools.com/clash-of-clans/th19-war-base'
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'TH19 War Bases with Copy Links',
      url: canonical,
      dateModified: warLayoutReviewDate,
      inLanguage: 'en',
      isAccessibleForFree: true,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'BuildForgeTools', item: 'https://buildforgetools.com/' },
        { '@type': 'ListItem', position: 2, name: 'TH19 War Bases', item: canonical },
      ],
    },
  ],
}

function LayoutCard({ layout }: { layout: WarLayout }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(layout.importUrl)
      setCopyState('copied')
    } catch {
      setCopyState('manual')
    }
  }

  return (
    <article className="th19-card" id={layout.id}>
      <div className="th19-tags">{layout.goals.map(goal => <span key={goal} className="th19-tag">{defenseGoals[goal]}</span>)}</div>
      <h3>{layout.name}</h3>
      <p className="th19-card-note">{layout.note}</p>
      <p className="th19-card-note"><strong>Defender to try</strong> {layout.defenderTip}</p>
      <p className="th19-credit">
        {layout.publisher} · Published <time dateTime={layout.published}>{displayDate(layout.published)}</time>
      </p>
      <div className="th19-actions">
        <a className="th19-primary" href={layout.importUrl} aria-label={`Open in Clash of Clans: ${layout.name}`}>
          Open in Clash of Clans <ExternalLink size={15} aria-hidden="true" />
        </a>
        <button className="th19-copy" type="button" onClick={copyLink} aria-label={`Copy link: ${layout.name}`}>
          {copyState === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copyState === 'copied' ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <a className="th19-source-link" href={layout.source}>Preview at source <ArrowUpRight size={14} aria-hidden="true" /></a>
      <span className="th19-sr" role="status">{copyState === 'copied' ? `Copied the link for ${layout.name}.` : ''}</span>
      {copyState === 'manual' && <label className="th19-manual">Select and copy this link
        <input aria-label={`Import URL for ${layout.name}`} readOnly value={layout.importUrl} onFocus={event => event.currentTarget.select()} />
      </label>}
    </article>
  )
}

function displayDate(date: string, includeYear = false) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: includeYear ? 'numeric' : undefined, timeZone: 'UTC',
  })
}

function DefenderCheck() {
  const [archerUnlocked, setArcherUnlocked] = useState(false)
  const [wizardUnlocked, setWizardUnlocked] = useState(false)

  return (
    <section className="th19-section" id="defenders" aria-labelledby="th19-defenders">
      <h2 id="th19-defenders">Which TH19 defenders can you use?</h2>
      <p>Town Hall defenders are separate from Clan Castle troops. The Hall choice is saved per layout. After importing, open the War Base slot and confirm both choices.</p>
      <fieldset className="th19-defender-check">
        <legend>Your troop research</legend>
        <label><input type="checkbox" checked={archerUnlocked} onChange={event => setArcherUnlocked(event.target.checked)} /> My Archer is level 15</label>
        <label><input type="checkbox" checked={wizardUnlocked} onChange={event => setWizardUnlocked(event.target.checked)} /> My Wizard is level 15</label>
      </fieldset>
      <div className="th19-defender-grid" aria-live="polite">
        <section aria-label="Barbarian Hall"><h3>Barbarian Hall</h3><strong>Available at TH19</strong><p>The defenders use your researched Barbarian level.</p></section>
        <section aria-label="Archer Hall"><h3>Archer Hall</h3><strong>{archerUnlocked ? 'Unlocked' : 'Requires level 15'}</strong><p>Research Archer to level 15. The defending Archers are level 15.</p></section>
        <section aria-label="Wizard Hall"><h3>Wizard Hall</h3><strong>{wizardUnlocked ? 'Unlocked' : 'Requires level 15'}</strong><p>Research Wizard to level 15. The defending Wizards are level 15.</p></section>
      </div>
      <p className="th19-small"><a href={th19ReleaseNotes}>Supercell’s Town Hall troop rules</a></p>
    </section>
  )
}

export default function TH19WarBasePage() {
  const [goal, setGoal] = useState<DefenseGoal | 'all'>('all')
  const filtered = goal === 'all' ? warLayouts : warLayouts.filter(layout => layout.goals.includes(goal))

  return (
    <div className="site-discovery th19-page">
      <DiscoveryHeader />
      <main className="sd-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <header className="th19-hero">
          <div>
            <p className="sd-kicker">CLASH OF CLANS</p>
            <h1>TH19 War Bases</h1>
            <p>Compare Town Hall 19 war layouts, preview the original designs, and open a copy link on your Clash of Clans device.</p>
            <div className="th19-hero-links">
              <a className="th19-primary" href="#war-layouts">Browse war bases <ArrowDown size={17} aria-hidden="true" /></a>
              <a href="#defenders">Check defender unlocks</a>
            </div>
          </div>
          <aside className="th19-hero-note" aria-label="Town Hall 19 layout notes">
            <Shield size={26} aria-hidden="true" />
            <h2>Before war starts</h2>
            <p>Save the layout in a War Base slot. Check the Town Hall defender and Clan Castle troops, then run a Friendly Challenge with the rules you expect to play.</p>
            <a href="#import-checklist">See the import checklist <ArrowDown size={15} aria-hidden="true" /></a>
          </aside>
        </header>

        <section className="th19-section" id="war-layouts" aria-label="TH19 war layouts">
          <div className="th19-directory-heading">
            <div><h2>TH19 war base copy links</h2><p>Choose a defense goal and compare the previews before importing.</p></div>
            <label>Defense goal<select value={goal} onChange={event => setGoal(event.target.value as DefenseGoal | 'all')}>
              <option value="all">All war layouts</option>
              {Object.entries(defenseGoals).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
          </div>
          <div className="th19-check-summary">
            <p role="status">{filtered.length} {filtered.length === 1 ? 'layout' : 'layouts'} shown</p>
            <p>Source links checked <time dateTime={warLayoutReviewDate}>{displayDate(warLayoutReviewDate, true)}</time> · In-game import untested</p>
          </div>
          <div className="th19-grid">{filtered.map(layout => <LayoutCard key={layout.id} layout={layout} />)}</div>
          <p className="th19-small">Defense labels reflect the source’s stated goals. Defender suggestions are starting points for your own Friendly Challenges.</p>
        </section>

        <DefenderCheck />

        <section className="th19-section" id="import-checklist" aria-labelledby="th19-checklist">
          <h2 id="th19-checklist">Import and test a TH19 war layout</h2>
          <ol className="th19-checklist">
            <li><h3>Open the link on your game device</h3><p>Update Clash of Clans, open the layout link on the phone or tablet you play on, and use its War Base slot. If it opens on desktop, copy the link to your game device.</p></li>
            <li><h3>Check what fits your village</h3><p>Review placements in the editor, including traps and any buildings your village still needs. Choose the defending Town Hall troop for that slot and confirm the separate Clan Castle setup.</p></li>
            <li><h3>Run a Friendly Challenge</h3><p>Ask a clanmate to attack the saved layout. Choose the layout, Clan Castle troops and battle modifier for the challenge, then watch the replay to see which entry gives up the Town Hall or lets the attacker clear the remaining defenses.</p></li>
          </ol>
          <p>For CWL practice, match your clan’s league rules. Supercell lists separate modifiers for CWL Legend, Titan I, Titan II and Titan III, and a distinct Hard Mode modifier.</p>
          <p className="th19-small"><a href={clanWarRules}>Clan War layout rules</a> · <a href={friendlyChallengeRules}>Friendly Challenge setup</a> · <a href={th19ReleaseNotes}>TH19 update and modifiers</a></p>
        </section>

        <section className="th19-section th19-method" aria-labelledby="th19-source-method">
          <h2 id="th19-source-method">How the links were checked</h2>
          <p>Each card links to a public preview and a Supercell share link identified as a Town Hall 19 War Base. We checked that the link was published by the source and that Supercell’s handoff page opened. Only the game client can confirm whether the layout imports into your village.</p>
          <p>If a link no longer imports, open its source for a replacement. You can <a href="/contact">report a broken link</a> with the layout name.</p>
        </section>
      </main>
      <SiteFooter discovery links={[]} />
    </div>
  )
}
