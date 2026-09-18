import { paladinSpellbook } from "../src/data/paladinSpellbook";
import { querySpellbook, type SpellCategory } from "../src/data/spellbook";

const valueAfter = (flag: string) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const category = valueAfter("--category") as SpellCategory | undefined;
const search = valueAfter("--search");
const minimumLevelValue = valueAfter("--minimum-level");
const minimumLevel = minimumLevelValue ? Number(minimumLevelValue) : undefined;
const entries = querySpellbook(paladinSpellbook, { category, search, minimumLevel });

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(entries, null, 2));
} else {
  for (const entry of entries) console.log(`${entry.name}\t${entry.category}\tlevel ${entry.learnedAt}\t${entry.maxRank} rank${entry.maxRank === 1 ? "" : "s"}\t${entry.verificationStatus}`);
  console.log(`\n${entries.length} result${entries.length === 1 ? "" : "s"}`);
}

