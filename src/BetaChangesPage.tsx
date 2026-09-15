import { Calculator } from "lucide-react";
import { betaDataset, communityPreviewDataset } from "./data/datasets";
import { compareTalentVersions } from "./lib/talentDiff";
import { track } from "./lib/analytics";

const branches = ["holy", "protection", "retribution"] as const;

export default function BetaChangesPage() {
  const diff = compareTalentVersions(communityPreviewDataset, betaDataset);
  const isWaiting = diff.status === "waiting";
  const total = communityPreviewDataset.talents.length;

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
          <strong>{isWaiting ? "Waiting for Beta" : "Beta Verified"}</strong>
          <dl>
            <div><dt>Verified talents</dt><dd>{isWaiting ? `0 / ${total}` : `${diff.unchanged.length + diff.changed.length} / ${total}`}</dd></div>
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
          <div className="beta-diff-summary">
            <p><strong>Added:</strong> {diff.added.length}</p>
            <p><strong>Removed:</strong> {diff.removed.length}</p>
            <p><strong>Changed:</strong> {diff.changed.length}</p>
            <p><strong>Unchanged:</strong> {diff.unchanged.length}</p>
          </div>
          {branches.map((branch) => {
            const added = diff.added.filter((talent) => talent.branch === branch).length;
            const removed = diff.removed.filter((talent) => talent.branch === branch).length;
            const changed = diff.changed.filter((talent) => talent.branch === branch).length;
            if (!added && !removed && !changed) return null;
            return (
              <p key={branch} className="beta-branch-count">
                {branch[0].toUpperCase() + branch.slice(1)} — {changed} changed{added ? `, ${added} added` : ""}{removed ? `, ${removed} removed` : ""}
              </p>
            );
          })}
          {diff.changed.length > 0 && (
            <div className="beta-changed-list">
              {diff.changed.map((change) => (
                <article key={change.id}>
                  <h3>{change.name}</h3>
                  {change.changes.name && <p>Name: {change.changes.name.before} → {change.changes.name.after}</p>}
                  {change.changes.maxRank && <p>Rank: {change.changes.maxRank.before} → {change.changes.maxRank.after}</p>}
                  {change.changes.requiredTreePoints && <p>Tier: {change.changes.requiredTreePoints.before} → {change.changes.requiredTreePoints.after}</p>}
                  {change.changes.y && <p>Row: {change.changes.y.before} → {change.changes.y.after}</p>}
                  {change.changes.prerequisite && <p>Prerequisite changed</p>}
                  {change.changes.description && <p>Tooltip updated</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer><div className="shell"><a className="brand" href="/paladin"><img src="/images/icons/paladin-shield.png" alt="" /><span>BUILD</span><b>FORGE</b></a><p>WoW Forever Talent Tools</p><nav><a href="/paladin">Talent Calculator</a><a href="/wow-forever-paladin-builds">All Paladin Builds</a><a href="/wow-forever-paladin-talents">Paladin Talents</a></nav><small>Community-made planning tool. Not affiliated with Blizzard Entertainment.</small></div></footer>
    </main>
  );
}
