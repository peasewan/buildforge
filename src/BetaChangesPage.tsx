import { Calculator } from "lucide-react";
import { PALADIN_BETA_SNAPSHOT } from "./data/betaSnapshot";
import { betaDataset, communityPreviewDataset } from "./data/datasets";
import { branchNames } from "./data/talents";
import { compareTalentVersions } from "./lib/talentDiff";
import { track } from "./lib/analytics";
import SiteFooter from "./SiteFooter";

export default function BetaChangesPage() {
  const diff = compareTalentVersions(communityPreviewDataset, betaDataset);
  const isWaiting = diff.status === "waiting";
  const isPartial = diff.status === "partial";
  const total = communityPreviewDataset.talents.length;
  const statusLabel = isWaiting ? "Beta Client Data Available" : isPartial ? "Beta Partially Verified" : "Beta Verified";
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
          <p>Follow verified Paladin changes from the live WoW Forever Beta while client data is normalized and checked against the current Pre-Beta Demo Preview.</p>
          <a className="button primary" href="/paladin#calculator" onClick={() => track("beta_cta_click", { placement: "hero" })}>Open Paladin Calculator</a>
        </div>
        <aside className="beta-status-card" aria-label="Beta data status">
          <span>PALADIN BETA DATA</span>
          <strong>{statusLabel}</strong>
          <dl>
            <div><dt>Client build</dt><dd>{snapshot.clientBuild}</dd></div>
            <div><dt>New talent spell records</dt><dd>{snapshot.counts.paladinTalentSpells}</dd></div>
            <div><dt>Tree-ready talents</dt><dd>{isWaiting ? `0 / ${total}` : `${betaDataset.talents.length} / ${total}`}</dd></div>
            <div><dt>Last updated</dt><dd>Sep 18, 2026</dd></div>
          </dl>
        </aside>
      </section>

      {isWaiting ? (
        <section className="beta-waiting shell">
          <div className="section-heading centered"><div className="eyebrow">Client Data Status</div><h2>Beta Data Is Here. Tree Coordinates Are Still Pending.</h2><p>Client build {snapshot.clientBuild} exposes new Paladin spell records, but it does not yet provide enough structured information to place every talent safely in the calculator. The production tree stays on the reviewed preview dataset until positions, costs, ranks, and prerequisites are confirmed.</p></div>

          <div className="beta-signal-grid" aria-label="Beta client data summary">
            <article><strong>{snapshot.counts.paladinTalentSpells}</strong><span>Paladin talent spells</span></article>
            <article><strong>{snapshot.counts.paladinSpells}</strong><span>New Paladin spells</span></article>
            <article><strong>{snapshot.counts.allClassTalentSpells}</strong><span>Talent spells across all classes</span></article>
            <article><strong>{snapshot.counts.paladinSets}</strong><span>Paladin sets represented</span></article>
          </div>

          <section className="beta-detail-block">
            <div><div className="eyebrow">Not Ready for the Tree</div><h2>What the Client Data Still Does Not Tell Us</h2></div>
            <ul className="beta-track-list">{snapshot.missingTreeFields.map((field) => <li key={field}>{field}</li>)}</ul>
          </section>

          <section className="beta-detail-block">
            <div><div className="eyebrow">Officially Described</div><h2>Confirmed Paladin Direction</h2><p>These mechanics come from Blizzard's Forever Deep Dive. Exact Beta values can still change.</p></div>
            <div className="beta-confirmed-grid">{snapshot.confirmedChanges.map((change) => <article key={change.title}><h3>{change.title}</h3><p>{change.detail}</p></article>)}</div>
          </section>

          <section className="beta-detail-block">
            <div><div className="eyebrow">Update Pipeline</div><h2>How Beta Data Reaches the Calculator</h2></div>
            <ol className="beta-pipeline">
              <li><strong>Client data received</strong><span>Build-tagged spell records are captured without filling missing fields.</span></li>
              <li><strong>Fields normalized</strong><span>Names and tooltips are matched against the current preview.</span></li>
              <li><strong>Tree structure confirmed</strong><span>Coordinates, ranks, costs, and prerequisites require reliable evidence.</span></li>
              <li><strong>Manual review</strong><span>Conflicts remain visible instead of silently replacing production data.</span></li>
              <li><strong>Calculator update</strong><span>Only tree-ready records move into the interactive planner.</span></li>
            </ol>
          </section>

          <section className="beta-detail-block beta-sources">
            <div><div className="eyebrow">Sources</div><h2>Where This Snapshot Comes From</h2></div>
            <ul>{snapshot.sources.map((source) => <li key={source.url}><span>{source.kind === "official" ? "Official" : "Datamine"}</span><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
          </section>

          <p className="beta-footnote">Client build {snapshot.clientBuild}, compared with {snapshot.comparedWithBuild}. Datamined values may change during the Beta. This tracker does not treat a spell record as a complete talent-tree node.</p>
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

      <SiteFooter links={[{ href: '/paladin', label: 'Talent Calculator' }, { href: '/wow-forever-paladin-builds', label: 'All Paladin Builds' }, { href: '/wow-forever-paladin-talents', label: 'Paladin Talents' }]} />
    </main>
  );
}
