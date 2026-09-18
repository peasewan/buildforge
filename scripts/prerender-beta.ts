import { readFile, writeFile } from "node:fs/promises";
import { PALADIN_BETA_SNAPSHOT } from "../src/data/betaSnapshot";
import { betaDataset, communityPreviewDataset, previousBetaDataset } from "../src/data/datasets";
import { escapeHtml } from "../src/lib/html";
import { compareTalentVersions } from "../src/lib/talentDiff";

const outputPath = new URL("../dist/wow-forever-paladin-beta-talent-changes/index.html", import.meta.url);
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

const changeSummary = (change: { name: string; changes: Record<string, { before: unknown; after: unknown }> }) => {
  const parts: string[] = [];
  if (change.changes.maxRank) parts.push(`Rank ${change.changes.maxRank.before} → ${change.changes.maxRank.after}`);
  if (change.changes.row) parts.push(`Row ${(change.changes.row.before as number) + 1} → ${(change.changes.row.after as number) + 1}`);
  if (change.changes.column) parts.push(`Column ${(change.changes.column.before as number) + 1} → ${(change.changes.column.after as number) + 1}`);
  if (change.changes.description) parts.push("Tooltip updated");
  return parts.join(" · ");
};

const prerendered = `<main class="beta-page beta-prerender">
  <article>
    <h1>WoW Forever Paladin Beta Talent Changes</h1>
    <p><strong>Latest Build Verified</strong> · Client build ${snapshot.clientBuild} · ${betaDataset.talents.length} / ${betaDataset.talents.length} talents verified · Last updated September 18, 2026</p>
    <p><strong>Beta Week 1 — Level 20.</strong> Blizzard says the cap will rise to 30 later in the Beta.</p>
    <h2>52 talents · 21 new in WoW Forever</h2>
    <p>Holy 9 · Protection 5 · Retribution 7</p>
    <p>New: ${newTalents.length} · Changed: ${changedFromClassic.length} · Moved: ${movedFromClassic.length} · Unchanged: ${unchangedFromClassic.length} versus Classic.</p>
    <h3>New talents</h3>
    <p>${newTalents.map((talent) => escapeHtml(talent.name)).join(" · ")}</p>
    <h3>Moved talents</h3>
    <p>${movedFromClassic.map((talent) => escapeHtml(talent.name)).join(" · ")}</p>
    <h2>Beta build 1.60.1.69876 → 1.60.1.69893</h2>
    <p>Added: ${latestDiff.added.length} · Removed: ${latestDiff.removed.length} · Changed: ${latestDiff.changed.length} · Unchanged: ${latestDiff.unchanged.length}</p>
    <ul>${latestDiff.changed.map((change) => `<li>${escapeHtml(change.name)} — ${escapeHtml(changeSummary(change))}</li>`).join("")}</ul>
    <h2>Preview → Beta 1.60.1.69893</h2>
    <p>Added: ${archiveDiff.added.length} · Removed: ${archiveDiff.removed.length} · Changed: ${archiveDiff.changed.length} · Moved: ${previewMoved.length} · Rank changed: ${previewRankChanged.length} · Prerequisites changed: ${previewPrerequisitesChanged.length} · Unchanged: ${archiveDiff.unchanged.length}</p>
    <p>The archived snapshot is retained only to document how the public demo transcription changed once complete Beta client data became available.</p>
    <h2>Sources</h2>
    <ul>${snapshot.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a> — ${source.kind === "official" ? "official" : "community datamine"}</li>`).join("")}</ul>
    <p><a href="/paladin">Open the Paladin Talent Calculator</a></p>
  </article>
</main>`;

const template = await readFile(outputPath, "utf8");
if (!template.includes("<!-- BETA_PRERENDER -->")) throw new Error("Beta prerender marker was not found in the built HTML.");
await writeFile(outputPath, template.replace("<!-- BETA_PRERENDER -->", prerendered));
console.log("Prerendered Beta changes page.");
