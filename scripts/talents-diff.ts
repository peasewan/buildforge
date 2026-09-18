import { betaDataset, previousBetaDataset } from "../src/data/datasets";
import { compareTalentVersions } from "../src/lib/talentDiff";
import type { Branch } from "../src/lib/build";

const diff = compareTalentVersions(previousBetaDataset, betaDataset);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({
    from: previousBetaDataset.sourceVersion,
    to: betaDataset.sourceVersion,
    summary: {
      added: diff.added.length,
      removed: diff.removed.length,
      changed: diff.changed.length,
      unchanged: diff.unchanged.length,
      metadataChanged: diff.metadataChanged.length,
    },
    changes: diff.changed,
    metadataChanges: diff.metadataChanged,
  }, null, 2));
  process.exit(0);
}

console.log("Paladin Talent Diff");
console.log(`${previousBetaDataset.label} → ${betaDataset.label}`);
console.log("");

if (diff.status === "waiting") {
  console.log(`Beta data: waiting (${betaDataset.label} has no transcribed talents yet).`);
  console.log("");
  console.log("Added: 0");
  console.log("Removed: 0");
  console.log("Changed: 0");
  console.log("Unchanged: 0");
  console.log("");
  console.log("Add real beta data to src/data/datasets.ts to see a diff.");
} else {
  console.log(`Added: ${diff.added.length}`);
  console.log(`Removed: ${diff.removed.length}`);
  console.log(`Changed: ${diff.changed.length}`);
  console.log(`Unchanged: ${diff.unchanged.length}`);
  console.log(`Metadata changed: ${diff.metadataChanged.length}`);
  console.log("");

  const branches: Branch[] = ["holy", "protection", "retribution"];
  for (const branch of branches) {
    const added = diff.added.filter((talent) => talent.branch === branch).length;
    const removed = diff.removed.filter((talent) => talent.branch === branch).length;
    const changed = diff.changed.filter((talent) => talent.branch === branch).length;
    console.log(`${branch[0].toUpperCase()}${branch.slice(1)}`);
    if (added) console.log(`  ${added} added`);
    if (removed) console.log(`  ${removed} removed`);
    if (changed) console.log(`  ${changed} changed`);
  }
}
