import { readFile, writeFile } from "node:fs/promises";
import { PALADIN_BETA_SNAPSHOT } from "../src/data/betaSnapshot";
import { betaDataset, communityPreviewDataset } from "../src/data/datasets";
import { branchNames } from "../src/data/talents";
import { escapeHtml } from "../src/lib/html";
import { compareTalentVersions } from "../src/lib/talentDiff";

const outputPath = new URL("../dist/wow-forever-paladin-beta-talent-changes/index.html", import.meta.url);

const diff = compareTalentVersions(communityPreviewDataset, betaDataset);
const isWaiting = diff.status === "waiting";
const total = communityPreviewDataset.talents.length;
const statusLabel = isWaiting ? "Beta Client Data Available" : diff.status === "partial" ? "Beta Partially Verified" : "Beta Verified";
const snapshot = PALADIN_BETA_SNAPSHOT;

const waitingContent = `
  <h2>Beta Client Data Is Available</h2>
  <p>WoW Forever Beta client build ${snapshot.clientBuild} is now available. Community datamine records identify ${snapshot.counts.allClassTalentSpells} new talent spells across all nine classes, including ${snapshot.counts.paladinTalentSpells} Paladin talent spells. The Paladin client comparison also contains ${snapshot.counts.paladinSpells} new spell records and ${snapshot.counts.paladinSets} sets with Paladin bonuses.</p>
  <p>These records are useful evidence, but they are not yet complete talent-tree nodes. The available client data does not provide reliable tree positions, point costs, complete ranks, icons, or every prerequisite. BuildForge therefore keeps the interactive calculator on the reviewed Pre-Beta Demo Preview instead of guessing where a spell belongs.</p>
  <h2>Officially Confirmed Paladin Changes</h2>
  <p>Blizzard has described the wider Paladin direction for Forever. Holy Strike becomes a baseline instant weapon strike at level 6. Seal of Fury supports Protection tanking with Holy damage, absorb shields, and a Judgment taunt. Consecration becomes baseline at level 20. Holy, Protection, and Retribution each receive updated talent paths while preserving the class's distinct limitations.</p>
  <h2>What We Still Need</h2>
  <ul>${snapshot.missingTreeFields.map((field) => `<li>${escapeHtml(field)}</li>`).join("")}</ul>
  <h2>How Updates Reach the Calculator</h2>
  <ol>
    <li>Capture build-tagged client records without filling missing fields.</li>
    <li>Normalize names and tooltips against the current preview.</li>
    <li>Confirm coordinates, ranks, point costs, and prerequisites.</li>
    <li>Review conflicts manually and preserve their sources.</li>
    <li>Publish only tree-ready records to the calculator.</li>
  </ol>
  <h2>Sources</h2>
  <ul>${snapshot.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a> — ${source.kind === "official" ? "official" : "community datamine"}</li>`).join("")}</ul>
  <p>Client build ${snapshot.clientBuild}, compared with ${snapshot.comparedWithBuild}. Datamined values may change during the Beta.</p>`;

const changeSummary = (change: { name: string; changes: Record<string, { before: unknown; after: unknown }> }) => {
  const parts: string[] = [];
  if (change.changes.maxRank) parts.push(`Rank ${change.changes.maxRank.before} → ${change.changes.maxRank.after}`);
  if (change.changes.row) parts.push(`Row ${(change.changes.row.before as number) + 1} → ${(change.changes.row.after as number) + 1}`);
  if (change.changes.column) parts.push(`Column ${(change.changes.column.before as number) + 1} → ${(change.changes.column.after as number) + 1}`);
  if (change.changes.requiredTreePoints) parts.push(`Required points ${change.changes.requiredTreePoints.before} → ${change.changes.requiredTreePoints.after}`);
  if (change.changes.prerequisite) parts.push(`Prerequisite ${(change.changes.prerequisite.before as string[]).join(", ") || "none"} → ${(change.changes.prerequisite.after as string[]).join(", ") || "none"}`);
  if (change.changes.name) parts.push(`Name ${change.changes.name.before} → ${change.changes.name.after}`);
  if (change.changes.description) parts.push("Tooltip updated");
  return parts.join(" · ");
};

const diffContent = `
  <p>Added: ${diff.added.length} · Removed: ${diff.removed.length} · Changed: ${diff.changed.length} · Unchanged: ${diff.unchanged.length}</p>
  ${diff.added.length ? `<h2>New Talents</h2><ul>${diff.added.map((t) => `<li>${escapeHtml(t.name)} — ${branchNames[t.branch]} · Row ${t.row + 1} · ${t.maxRank} ranks</li>`).join("")}</ul>` : ""}
  ${diff.removed.length ? `<h2>Removed Talents</h2><ul>${diff.removed.map((t) => `<li>${escapeHtml(t.name)} — ${branchNames[t.branch]}</li>`).join("")}</ul>` : ""}
  ${diff.changed.length ? `<h2>Updated Talents</h2><ul>${diff.changed.map((c) => `<li>${escapeHtml(c.name)} — ${escapeHtml(changeSummary(c))}</li>`).join("")}</ul>` : ""}`;

const prerendered = `<main class="beta-page beta-prerender">
  <article>
    <h1>WoW Forever Paladin Beta Talent Changes</h1>
    <p><strong>${statusLabel}</strong> · Client build ${snapshot.clientBuild} · ${isWaiting ? `0 / ${total} tree-ready talents` : `${betaDataset.talents.length} / ${total} talents verified`} · Last updated September 17, 2026</p>
    ${isWaiting ? waitingContent : diffContent}
    <p><a href="/paladin">Open the Paladin Talent Calculator</a></p>
  </article>
</main>`;

const template = await readFile(outputPath, "utf8");
if (!template.includes("<!-- BETA_PRERENDER -->")) {
  throw new Error("Beta prerender marker was not found in the built HTML.");
}
await writeFile(outputPath, template.replace("<!-- BETA_PRERENDER -->", prerendered));
console.log("Prerendered Beta changes page.");
