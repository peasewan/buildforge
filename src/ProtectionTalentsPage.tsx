import { ArrowRight, Calculator, Shield } from 'lucide-react'
import { TalentTree } from './App'
import { PROTECTION_SHIELD_BUILD } from './data/builds'
import { track } from './lib/analytics'

export default function ProtectionTalentsPage() {
  return (
    <main className="protection-talents-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Protection talents navigation"><a href="/wow-forever-protection-paladin-builds">Protection Builds</a><a href="#talent-tree">Talent Tree</a><a href="/paladin">Calculator</a></nav>
        <a className="button primary" href="/paladin" onClick={() => track('protection_talents_cta_click', { placement: 'header' })}>Open Planner</a>
      </header>

      <section className="protection-talents-hero">
        <div className="shell">
          <div className="eyebrow"><Shield size={15} /> Protection Talent Guide</div>
          <h1>WoW Forever Protection Paladin Talents</h1>
          <p>Explore the Protection Paladin talent tree. Plan talent points, review key talents, and create your own build.</p>
          <a className="button primary" href="/paladin" onClick={() => track('protection_talents_cta_click', { placement: 'hero' })}><Calculator size={17} /> Build This Setup</a>
        </div>
      </section>

      <section className="protection-tree-section shell" id="talent-tree">
        <header className="hub-section-heading"><div className="eyebrow">Community Preview</div><h2>Protection Talent Tree Preview</h2><p>This preview highlights a complete 31-point Protection route. Open the calculator to remove ranks, compare another path, or share a custom setup.</p></header>
        <div className="protection-tree-layout">
          <div className="tree-card"><TalentTree branch="protection" build={PROTECTION_SHIELD_BUILD.build} /></div>
          <aside>
            <span>Preview allocation</span><strong>31 Protection</strong>
            <p>The selected route reaches Holy Shield through defensive, threat, shield, and utility talents represented in the current community transcription.</p>
            <a className="button primary" href="/paladin" onClick={() => track('protection_talents_cta_click', { placement: 'tree' })}>Open Talent Calculator <ArrowRight size={15} /></a>
          </aside>
        </div>
      </section>

      <article className="protection-talent-copy shell">
        <section><h2>Planning Protection Paladin Talents</h2><p>Protection Paladin talents organize the defensive side of the WoW Forever Paladin tree. The opening rows in this preview include armor, blocking, precision, and survivability choices. Deeper rows add threat support, shield specialization, stamina-related options, and prerequisites that lead toward Holy Shield. BuildForgeTools presents these nodes as community preview data so players can inspect the structure without treating every tooltip as final.</p><p>A tank build can use the tree as a starting point for dungeon play, group utility, or a safer leveling route. The preview allocation is one legal example rather than a universal recommendation. Each player can open the Talent Calculator, move points between available talents, and see whether the resulting path still satisfies the required tree points and prerequisites.</p></section>
        <section><h2>From Talent Tree to Tank Build</h2><p>The Protection tree becomes more useful when it connects to a complete build. The featured 20/31/0 setup combines 31 Protection points with early Holy support and can be opened from the Protection Builds Hub. From there, the calculator shows every selected node, counts all 51 points, and creates a shareable URL for the edited result.</p><p>WoW Forever talent information may change while new captures and testing become available. Review current in-game tooltips before treating a talent value as confirmed. The planner keeps uncertain data visible, makes each edit reversible, and gives the community one consistent way to compare Protection Paladin builds.</p></section>
      </article>

      <section className="protection-talent-final shell"><img src="/images/icons/shield.png" alt="" /><div><span>Ready to plan?</span><h2>Create Your Protection Build</h2></div><a className="button primary" href="/paladin" onClick={() => track('protection_talents_cta_click', { placement: 'footer' })}>Build this setup <ArrowRight size={15} /></a></section>

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/wow-forever-protection-paladin-builds">Protection Builds</a><a href="/wow-forever-protection-paladin-build">Protection Build</a><a href="/paladin">Talent Calculator</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  )
}
