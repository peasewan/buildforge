import { betaDataset, communityPreviewDataset } from "../src/data/datasets";
import { validateTalentDataset } from "../src/lib/talentValidator";

let failed = false;

for (const dataset of [communityPreviewDataset, betaDataset]) {
  const errors = validateTalentDataset(dataset);
  console.log(`${dataset.label} (${dataset.role}, ${dataset.status}): ${dataset.talents.length} talents`);

  if (errors.length === 0) {
    console.log("  ✓ no errors");
    continue;
  }

  failed = true;
  for (const error of errors) {
    console.log(`  ✗ ${error.id}: ${error.message}`);
  }
}

if (failed) process.exit(1);
