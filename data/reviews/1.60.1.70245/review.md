# Paladin 69913 → 70245 candidate review

Reviewed October 7, 2026. **Candidate only.** The production calculator still imports the preserved 69913 snapshot. This review concerns the complete Paladin TraitTree 1100, not the five-node Protection route checked earlier.

## Source chain

- [Wago SkillLineXTraitTree](https://wago.tools/db2/SkillLineXTraitTree/csv?build=1.60.1.70245) maps Paladin SkillLine 184 to TraitTree 1100. The importer joins TraitNode → TraitNodeXTraitNodeEntry → TraitNodeEntry → TraitDefinition → SpellName and Spell; TraitEdge supplies arrows. The exact ten CSV URLs, byte counts and SHA-256 hashes are in [source-manifest.json](source-manifest.json).
- All ten checked tables are **byte-identical** for client builds [70170](https://wago.tools/db2/TraitNode/csv?build=1.60.1.70170) and [70245](https://wago.tools/db2/TraitNode/csv?build=1.60.1.70245), including SpellEffect and SpellAuraOptions. Thus this review finds no later *client-table* Paladin change in that interval.
- [Talents Forever's CC-BY-4.0 export](https://talentsforever.com/data.json), generated October 6, supplies fully resolved rank descriptions for its 70170 Paladin tree. Its 50-node excerpt is saved as [paladin-resolved-source.json](paladin-resolved-source.json), with the upstream export hash and attribution. These resolved descriptions are tagged `community_verified`; raw Wago records and identical table hashes do not independently prove every displayed number.
- [Blizzard's September 24 and October 1 Beta notes](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696) independently establish several tuning changes. Required prerequisite **rank** is still `derived_assumption`; TraitEdge confirms only the link.

## Complete structural check

The importer validated all 50 current nodes and all their confirmed rank descriptions before writing the candidate. Its publication gate separately parses the raw 70245 TraitNode table and requires the candidate's node set and count to match TraitTree 1100 exactly; it also requires dataset-level client and resolved-rank URLs, source build, CC BY 4.0 license link, attribution, and adaptation notice. Against the 52-node 69913 archive, [diff.json](diff.json) reports **0 added, 2 removed, 0 moved, 0 rank-cap changes, 0 prerequisite-link changes, 14 talents with rank-description changes (32 rank strings), and 36 unchanged talents**. Every surviving node preserves its stable ID, client node ID, spell ID, branch, grid position, rank cap and arrow. The seven existing arrows remain seven.

| Removed talent | Client node | Evidence |
| --- | ---: | --- |
| Improved Holy Strike | 105328 | Absent from TraitTree 1100; Blizzard announced its September 24 removal and baseline cooldown behavior. |
| Crusade | 110883 | Absent from TraitTree 1100. This is client evidence; the cited Blizzard notes do not announce this removal. |

## Manual review of all 14 description changes

| Talent | Changed ranks | Review |
| --- | ---: | --- |
| Holy Power | 5 | Blizzard names Holy Strike crit support; Wago Spell template also changed. |
| Light's Vigil | 1 | Blizzard confirms a reordered tooltip. The export also renders one heal upper bound as 343 instead of 344; treat that digit as resolved-export evidence only. |
| Voice of Truth | 1 | Wago Spell wording changed from “Lasts” to “for”; no numeric tuning inferred. |
| Redoubt | 5 | Blizzard confirms 4/8/12/16/20% instead of 6/12/18/24/30%. The raw 70245 client effect for the proc still contains 30 at spell 20128, so do not present this value as client-verified server behavior. |
| Holy Shield | 1 | Blizzard confirms 30%; Wago SpellEffect for spell 20925 changed from 20 to 30. |
| Twist of Light | 1 | Blizzard confirms 20% Seal mana reduction; Wago Spell and SpellEffect changed. |
| Vengeance | 3 | Blizzard confirms non-periodic critical hits and three stacks; Wago Spell wording changed. |
| Seal of Command | 1 | The export changed rendered Judgement ranges and whitespace. Wago Spell and SpellEffect rows for the referenced rank-1 spells are unchanged. The range correction needs an in-game or independently resolved check before being called a game change. |
| Two-Handed Weapon Specialization | 3 | Blizzard confirms 2/4/6% instead of 3/6/9%; the export agrees. |
| Sacred Arbiter | 1 | Blizzard confirms 20%; Wago SpellEffect changed from 10 to 20. |
| Infusion of Light | 1 | “1 sec” became “1.0 sec” in the resolved export; formatting only. |
| Iron Creed | 5 | Wago Spell inserts “by” before the threat percentage; wording only. |
| Instrument of Law | 1 | “1 sec” became “1.0 sec” in the resolved export; formatting only. |
| Champion of the Light | 3 | Blizzard confirms 20/40/60% spell-damage conversion and removal of the misleading healing claim. Wago Spell removes the healing wording, but raw effect rows alone do not resolve all rank values. |

The candidate keeps the exact 50-node resolved text, with `rankTextVerification: community_verified` per talent and the source-build split recorded at dataset level. That is deliberately narrower than a blanket “70245 client verified tooltip” claim. No invented coordinates, ranks, prerequisites or tooltips were inserted.

The candidate's root `basedOnBuild`, `verificationSummary` and `verificationSources` are generated from this comparison and its reviewed sources. They do not inherit the archived 69913 snapshot's 69893 comparison or zero-change claim.

## Release boundary

Promoting this candidate needs a separate calculator integration review: archived links must continue to explain removed IDs, the two published `src/data/builds.ts` examples allocating two Crusade points need a valid replacement, and 52-node historical index checks and SEO baselines need review. Do not stamp all pages “Last verified 70245” solely from this data candidate. The importer never writes the production 69913 file.

The resolved rank text is copied and adapted from the Talents Forever export under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [license deed](https://creativecommons.org/licenses/by/4.0/) calls for appropriate credit, a license link and an indication of modifications. The candidate carries those fields, but **metadata in JSON is not visible page attribution**. Before publishing its rank text:

1. In `src/data/talents.ts`, keep the Wago client-table source for node identity separate from Talents Forever's resolved-rank source; set the description verification to `community_verified`, retain official links for server tuning, and show the source/license/adaptation notice in the calculator's source UI. The currently visible source links are rendered in `src/App.tsx`; check the static talent and build pages too.
2. Keep tombstone handling for old shared codes containing `improved_holy_strike` or `crusade`. `decodeBuild` currently discards IDs absent from the supplied tree, so a direct 50-node replacement would silently lose those points. Show a removed-talent message and retain an archive view or explicit migration; add a reload/share regression test.
3. Resolve the two historical `src/data/builds.ts` examples that allocate `crusade: 2`: retain them as clearly archived and non-loadable, or review new legal allocations before presenting them as current. Check Forge Pilot's saved-build review reason for both removed IDs.
4. Update the 52-node historical index expectation separately from the 50-node current calculator expectation, then review `src/lib/prerender.ts`, `scripts/post-deploy-smoke.ts` and SEO baselines. Run the full test, typecheck, lint and production build before release.

To regenerate, download the ten Wago CSV tables named in the manifest for both 70170 and 70245 into one directory as `<Table>.<last build segment>.csv`, then run:

```bash
node --import tsx scripts/import-paladin-client.ts --build 1.60.1.70245 --client-dir /path/to/csv --resolved-export data/reviews/1.60.1.70245/paladin-resolved-source.json
```
