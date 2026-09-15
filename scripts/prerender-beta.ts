import { readFile, writeFile } from "node:fs/promises";
import { betaDataset, communityPreviewDataset } from "../src/data/datasets";
import { branchNames } from "../src/data/talents";
import { compareTalentVersions } from "../src/lib/talentDiff";

const outputPath = new URL("../dist/wow-forever-paladin-beta-talent-changes/index.html", import.meta.url);

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const diff = compareTalentVersions(communityPreviewDataset, betaDataset);
const isWaiting = diff.status === "waiting";
const total = communityPreviewDataset.talents.length;
const statusLabel = isWaiting ? "Waiting for Beta" : diff.status === "partial" ? "Beta Partially Verified" : "Beta Verified";

const waitingContent = `
  <p>Real WoW Forever Beta talent data has not been transcribed yet. This page will automatically list every change once Beta talents are added.</p>
  <ul>
    <li>New talents added in the Beta</li>
    <li>Updated names, tooltips, and rank values</li>
    <li>Moved talents and changed prerequisites</li>
    <li>Removed or reworked talents</li>
  </ul>`;

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
    <p><strong>${statusLabel}</strong> · ${isWaiting ? `0 / ${total}` : `${betaDataset.talents.length} / ${total}`} talents verified · Last updated —</p>
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
