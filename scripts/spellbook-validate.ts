import { paladinSpellbook } from "../src/data/paladinSpellbook";
import { validateSpellbook } from "../src/data/spellbook";

const errors = validateSpellbook(paladinSpellbook);
console.log(`${paladinSpellbook.className} spellbook ${paladinSpellbook.clientBuild}: ${paladinSpellbook.entries.length} entries`);
if (errors.length) {
  for (const error of errors) console.error(`  ✗ ${error.id}: ${error.message}`);
  process.exit(1);
}
console.log("  ✓ schema, provenance, ids, levels, ranks, and reviewed count valid");

