import { describe, expect, it } from "vitest";
import rawPaladinSpellbook from "./paladin-spellbook-1.60.1.69893.json";
import { importSpellbook, querySpellbook, validateSpellbook } from "./spellbook";

describe("Paladin spellbook data layer", () => {
  it("imports the reviewed 45 trainer spell groups with build provenance", () => {
    const dataset = importSpellbook(rawPaladinSpellbook);
    expect(dataset.entries).toHaveLength(45);
    expect(dataset.clientBuild).toBe("1.60.1.69893");
    expect(dataset.entries.every((entry) => entry.sources.length > 0)).toBe(true);
    expect(validateSpellbook(dataset)).toEqual([]);
  });

  it("queries by category, name, and minimum level", () => {
    const dataset = importSpellbook(rawPaladinSpellbook);
    expect(querySpellbook(dataset, { category: "protection" })).toHaveLength(20);
    expect(querySpellbook(dataset, { search: "fury" }).map((entry) => entry.name)).toEqual(["Seal of Fury", "Righteous Fury"]);
    expect(querySpellbook(dataset, { minimumLevel: 60 }).every((entry) => entry.learnedAt >= 60)).toBe(true);
  });

  it("rejects duplicate ids and missing source evidence", () => {
    const dataset = importSpellbook(rawPaladinSpellbook);
    const duplicate = { ...dataset.entries[0], sources: [] };
    const errors = validateSpellbook({ ...dataset, entries: [...dataset.entries, duplicate] });
    expect(errors.map((error) => error.message)).toContain("Duplicate spellbook id");
    expect(errors.map((error) => error.message)).toContain("Missing source evidence");
  });
});
