import rawPaladinSpellbook from "./paladin-spellbook-1.60.1.69893.json";
import { importSpellbook, type RawSpellbook } from "./spellbook";

export const paladinSpellbook = importSpellbook(rawPaladinSpellbook as RawSpellbook);

