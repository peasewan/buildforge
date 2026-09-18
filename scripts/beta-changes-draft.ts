import { betaDataset, previousBetaDataset } from "../src/data/datasets";
import { createBetaChangesDraft } from "../src/lib/betaChangesDraft";
import { compareTalentVersions } from "../src/lib/talentDiff";

const draft = createBetaChangesDraft(compareTalentVersions(previousBetaDataset, betaDataset), {
  fromBuild: previousBetaDataset.sourceVersion.replace("wow_forever_beta_", ""),
  toBuild: betaDataset.sourceVersion.replace("wow_forever_beta_", ""),
});
console.log(JSON.stringify(draft, null, 2));

