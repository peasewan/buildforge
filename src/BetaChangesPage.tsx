import { Calculator } from "lucide-react";
import { PALADIN_BETA_SNAPSHOT } from "./data/betaSnapshot";
import { betaDataset, communityPreviewDataset, previousBetaDataset } from "./data/datasets";
import { branchNames } from "./data/talents";
import { compareTalentVersions } from "./lib/talentDiff";
import { track } from "./lib/analytics";
import SiteFooter from "./SiteFooter";

export default function BetaChangesPage() {
  const latestDiff = compareTalentVersions(previousBetaDataset, betaDataset);
  const archiveDiff = compareTalentVersions(communityPreviewDataset, betaDataset);
  const snapshot = PALADIN_BETA_SNAPSHOT;

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
          <p>Track verified Paladin talent changes in the live WoW Forever Beta, including the exact diff between client builds 1.60.1.69876 and 1.60.1.69893.</p>
          <a className="button primary" href="/paladin#calculator" onClick={() => track("beta_cta_click", { placement: "hero" })}>Open Paladin Calculator</a>
        </div>
        <aside className="beta-status-card" aria-label="Beta data status">
          <span>PALADIN BETA DATA</span>
          <strong>Latest Build Verified</strong>
          <dl>
            <div><dt>Client build</dt><dd>{snapshot.clientBuild}</dd></div>
            <div><dt>Previous build</dt><dd>1.60.1.69876</dd></div>
            <div><dt>Tree-ready talents</dt><dd>{betaDataset.talents.length} / {betaDataset.talents.length}</dd></div>
            <div><dt>Last updated</dt><dd>Sep 18, 2026</dd></div>
          </dl>
        </aside>
      </section>

      <section className="beta-diff shell">
        <div className="section-heading centered">
          <div className="eyebrow">Latest Build Diff</div>
          <h2>1.60.1.69876 → 1.60.1.69893</h2>
          <p>The tree structure is unchanged. Three talent tooltips contain updated client values.</p>
        </div>
        <div className="beta-diff-summary">
          <p><strong>Added:</strong> {latestDiff.added.length}</p>
          <p><strong>Removed:</strong> {latestDiff.removed.length}</p>
          <p><strong>Changed:</strong> {latestDiff.changed.length}</p>
          <p><strong>Unchanged:</strong> {latestDiff.unchanged.length}</p>
        </div>

        <section className="beta-talent-section">
          <h2>Updated in 69893</h2>
          <div className="beta-changed-list">
            {latestDiff.changed.map((change) => (
              <article key={change.id}>
                <h3>{change.name}</h3>
                {change.changes.description && <p>Tooltip: <span className="beta-old">{change.changes.description.before}</span> → <span className="beta-new">{change.changes.description.after}</span></p>}
              </article>
            ))}
          </div>
        </section>

        <section className="beta-talent-section">
          <h2>Full Beta Tree vs Archived Demo Snapshot</h2>
          <p>This historical comparison shows how the current 52-node Beta tree differs from the public demo transcription retained for auditing.</p>
          <div className="beta-diff-summary">
            <p><strong>Added:</strong> {archiveDiff.added.length}</p>
            <p><strong>Removed:</strong> {archiveDiff.removed.length}</p>
            <p><strong>Changed:</strong> {archiveDiff.changed.length}</p>
            <p><strong>Unchanged:</strong> {archiveDiff.unchanged.length}</p>
          </div>
          {archiveDiff.added.length > 0 && <><h3>New Talents</h3><ul>{archiveDiff.added.map((talent) => <li key={talent.id}><strong>{talent.name}</strong><span>{branchNames[talent.branch]} · Row {talent.row + 1} · {talent.maxRank} {talent.maxRank === 1 ? "rank" : "ranks"}</span></li>)}</ul></>}
          {archiveDiff.removed.length > 0 && <><h3>Removed Talents</h3><ul>{archiveDiff.removed.map((talent) => <li key={talent.id}><strong>{talent.name}</strong><span>{branchNames[talent.branch]}</span></li>)}</ul></>}
        </section>

        <section className="beta-detail-block beta-sources">
          <div><div className="eyebrow">Sources</div><h2>Where This Snapshot Comes From</h2></div>
          <ul>{snapshot.sources.map((source) => <li key={source.url}><span>{source.kind === "official" ? "Official" : "Datamine"}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
        </section>
        <p className="beta-footnote">Client build {snapshot.clientBuild}, compared with previous Beta build 1.60.1.69876 and Classic Era build {snapshot.comparedWithBuild}. Beta values may change in later builds.</p>
      </section>

      <SiteFooter links={[{ href: '/paladin', label: 'Talent Calculator' }, { href: '/wow-forever-paladin-builds', label: 'All Paladin Builds' }, { href: '/wow-forever-paladin-talents', label: 'Paladin Talents' }]} />
    </main>
  );
}
