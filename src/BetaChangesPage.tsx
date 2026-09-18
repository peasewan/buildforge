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
  const newTalents = betaDataset.talents.filter((talent) => talent.changeType === "new");
  const movedFromClassic = betaDataset.talents.filter((talent) => talent.changeType === "moved");
  const changedFromClassic = betaDataset.talents.filter((talent) => talent.changeType === "updated");
  const unchangedFromClassic = betaDataset.talents.filter((talent) => talent.changeType === "classic_unchanged");
  const previewMoved = archiveDiff.changed.filter((change) => change.changes.row || change.changes.column || change.changes.branch);
  const previewRankChanged = archiveDiff.changed.filter((change) => change.changes.maxRank);
  const previewPrerequisitesChanged = archiveDiff.changed.filter((change) => change.changes.prerequisite);

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
          <p>Track verified Paladin talent changes in the live WoW Forever Beta, including the current Week 1 level cap, changes from Classic, the archived Preview comparison, and exact client build diffs.</p>
          <p className="beta-phase-label">Beta Week 1 — Level 20</p>
          <a className="button primary" href="/paladin#calculator" onClick={() => track("beta_cta_click", { placement: "hero" })}>Open Paladin Calculator</a>
        </div>
        <aside className="beta-status-card" aria-label="Beta data status">
          <span>PALADIN BETA DATA</span>
          <strong>Latest Build Verified</strong>
          <dl>
            <div><dt>Client build</dt><dd>{snapshot.clientBuild}</dd></div>
            <div><dt>Previous build</dt><dd>1.60.1.69876</dd></div>
            <div><dt>Tree-ready talents</dt><dd>{betaDataset.talents.length} / {betaDataset.talents.length}</dd></div>
            <div><dt>New in Forever</dt><dd>{snapshot.counts.paladinNewTalents}</dd></div>
            <div><dt>Current level cap</dt><dd>{snapshot.phase.levelCap}</dd></div>
            <div><dt>Last updated</dt><dd>Sep 18, 2026</dd></div>
          </dl>
        </aside>
      </section>

      <section className="beta-diff shell">
        <section className="beta-detail-block">
          <div><div className="eyebrow">Current Beta Baseline</div><h2>52 talents · 21 new in WoW Forever</h2><p>Client build {snapshot.clientBuild} contains the complete Holy, Protection, and Retribution trees used by the calculator.</p></div>
          <div className="beta-signal-grid">
            <article><strong>{newTalents.length}</strong><span>New talents versus Classic</span></article>
            <article><strong>{changedFromClassic.length}</strong><span>Changed talents versus Classic</span></article>
            <article><strong>{movedFromClassic.length}</strong><span>Moved talents versus Classic</span></article>
            <article><strong>{unchangedFromClassic.length}</strong><span>Unchanged talents versus Classic</span></article>
          </div>
          <p className="beta-branch-count">Holy 9 · Protection 5 · Retribution 7</p>
          <div className="beta-changed-list">
            <article><h3>New talents</h3><p>{newTalents.map((talent) => talent.name).join(" · ")}</p></article>
            <article><h3>Moved talents</h3><p>{movedFromClassic.map((talent) => talent.name).join(" · ")}</p></article>
          </div>
        </section>

        <section className="beta-detail-block beta-phase-block">
          <div><div className="eyebrow">Live Test Phase</div><h2>Beta Week 1 — Level 20</h2><p>The current Beta level cap is 20. Blizzard says it will rise to 30 later in the test, so Level 30 routes are upcoming planning references rather than builds available to test today.</p></div>
          <a href="https://news.blizzard.com/en-us/article/24304160/the-world-of-warcraft-forever-beta-now-live" target="_blank" rel="noreferrer">Read the official Beta schedule</a>
        </section>

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
          <h2>Preview → Beta 1.60.1.69893</h2>
          <p>This historical comparison shows how the current 52-node Beta tree differs from the archived public Preview transcription retained for auditing.</p>
          <div className="beta-diff-summary">
            <p><strong>Added:</strong> {archiveDiff.added.length}</p>
            <p><strong>Removed:</strong> {archiveDiff.removed.length}</p>
            <p><strong>Changed:</strong> {archiveDiff.changed.length}</p>
            <p><strong>Moved:</strong> {previewMoved.length}</p>
            <p><strong>Rank changed:</strong> {previewRankChanged.length}</p>
            <p><strong>Prerequisites changed:</strong> {previewPrerequisitesChanged.length}</p>
            <p><strong>Unchanged:</strong> {archiveDiff.unchanged.length}</p>
          </div>
          <p className="beta-footnote">No talents were added, removed, moved, re-ranked, or rewired between the archived Preview tree and Beta 69893. The 26 detected changes are tooltip text or values.</p>
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
