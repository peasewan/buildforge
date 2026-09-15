import { Calculator } from "lucide-react";
import { betaDataset, communityPreviewDataset } from "./data/datasets";
import { branchNames } from "./data/talents";
import { compareTalentVersions } from "./lib/talentDiff";
import { track } from "./lib/analytics";

export default function BetaChangesPage() {
  const diff = compareTalentVersions(communityPreviewDataset, betaDataset);
  const isWaiting = diff.status === "waiting";
  const isPartial = diff.status === "partial";
  const total = communityPreviewDataset.talents.length;
  const statusLabel = isWaiting ? "Waiting for Beta" : isPartial ? "Beta Partially Verified" : "Beta Verified";

  return (
    <main className="beta-page">
      <header className="guide-nav shell">
        <a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a>
        <nav aria-label="Beta navigation"><a href="/paladin#calculator">Talent Calculator</a><a href="/wow-forever-paladin-builds">All Paladin Builds</a></nav>
        <a className="button primary" href="/paladin#calculator" onClick={() => track("beta_cta_click", { placement: "header" })}>Open Calculator</a>
      </header>

      <section className="beta-hero shell">
        <div className="beta-hero-copy">
          <div className="eyebrow"><Calculator size={14} /> Beta Talent Tracker</div>
          <h1>WoW Forever Paladin Beta Talent Changes</h1>
          <p>Track every Paladin talent change discovered in the WoW Forever Beta, compared against the current Pre-Beta Demo Preview.</p>
          <a className="button primary" href="/paladin#calculator" onClick={() => track("beta_cta_click", { placement: "hero" })}>Open Paladin Calculator</a>
        </div>
        <aside className="beta-status-card" aria-label="Beta data status">
          <span>PALADIN BETA DATA</span>
          <strong>{statusLabel}</strong>
          <dl>
            <div><dt>Verified talents</dt><dd>{isWaiting ? `0 / ${total}` : `${betaDataset.talents.length} / ${total}`}</dd></div>
            <div><dt>Last updated</dt><dd>—</dd></div>
          </dl>
        </aside>
      </section>

      {isWaiting ? (
        <section className="beta-waiting shell">
          <div className="section-heading centered"><div className="eyebrow">Status</div><h2>Waiting for Beta Data</h2><p>Real WoW Forever Beta talent data has not been transcribed yet. As soon as it is added, this page will automatically compare the Beta against the current Pre-Beta Demo Preview and list every change.</p></div>
          <ul className="beta-track-list">
            <li><strong>New talents</strong> added in the Beta</li>
            <li><strong>Updated</strong> names, tooltips, and rank values</li>
            <li><strong>Moved</strong> talents and changed prerequisites</li>
            <li><strong>Removed</strong> or reworked talents</li>
          </ul>
          <p className="beta-footnote">Community preview data. This page is a change tracker, not a source of final Beta values.</p>
        </section>
      ) : (
        <section className="beta-diff shell">
          <div className="section-heading centered"><div className="eyebrow">What Changed</div><h2>Beta Talent Changes</h2><p>Changes discovered between the community preview and the current Beta.</p></div>
          {isPartial && <p className="beta-partial-note">Coverage is partial — missing talents in branches not yet fully transcribed are not shown as removals.</p>}
          <div className="beta-diff-summary">
            <p><strong>Added:</strong> {diff.added.length}</p>
            <p><strong>Removed:</strong> {diff.removed.length}</p>
            <p><strong>Changed:</strong> {diff.changed.length}</p>
            <p><strong>Unchanged:</strong> {diff.unchanged.length}</p>
          </div>

          {diff.added.length > 0 && (
            <section className="beta-talent-section">
              <h2>New Talents</h2>
              <ul>{diff.added.map((talent) => <li key={talent.id}><strong>{talent.name}</strong><span>{branchNames[talent.branch]} · Row {talent.row + 1} · {talent.maxRank} {talent.maxRank === 1 ? "rank" : "ranks"}</span></li>)}</ul>
            </section>
          )}

          {diff.removed.length > 0 && (
            <section className="beta-talent-section">
              <h2>Removed Talents</h2>
              <ul>{diff.removed.map((talent) => <li key={talent.id}><strong>{talent.name}</strong><span>{branchNames[talent.branch]}</span></li>)}</ul>
            </section>
          )}

          {diff.changed.length > 0 && (
            <section className="beta-talent-section">
              <h2>Updated Talents</h2>
              <div className="beta-changed-list">
                {diff.changed.map((change) => (
                  <article key={change.id}>
                    <h3>{change.name}</h3>
                    {change.changes.name && <p>Name: <span className="beta-old">{change.changes.name.before}</span> → <span className="beta-new">{change.changes.name.after}</span></p>}
                    {change.changes.maxRank && <p>Max rank: <span className="beta-old">{change.changes.maxRank.before}</span> → <span className="beta-new">{change.changes.maxRank.after}</span></p>}
                    {change.changes.requiredTreePoints && <p>Required tree points: <span className="beta-old">{change.changes.requiredTreePoints.before}</span> → <span className="beta-new">{change.changes.requiredTreePoints.after}</span></p>}
                    {change.changes.row && <p>Row: <span className="beta-old">{change.changes.row.before + 1}</span> → <span className="beta-new">{change.changes.row.after + 1}</span></p>}
                    {change.changes.column && <p>Column: <span className="beta-old">{change.changes.column.before + 1}</span> → <span className="beta-new">{change.changes.column.after + 1}</span></p>}
                    {change.changes.branch && <p>Tree: <span className="beta-old">{branchNames[change.changes.branch.before]}</span> → <span className="beta-new">{branchNames[change.changes.branch.after]}</span></p>}
                    {change.changes.prerequisite && <p>Prerequisite: <span className="beta-old">{change.changes.prerequisite.before.join(", ") || "none"}</span> → <span className="beta-new">{change.changes.prerequisite.after.join(", ") || "none"}</span></p>}
                    {change.changes.description && <p>Tooltip: <span className="beta-old">{change.changes.description.before}</span> → <span className="beta-new">{change.changes.description.after}</span></p>}
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      )}

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-builds">All Paladin Builds</a><a href="/wow-forever-paladin-talents">Paladin Talents</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  );
}
