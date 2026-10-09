# Hunter and Warrior client-data review — 2026-10-09

## Saved evidence and publication boundary

The raw Wago DB2 CSVs and complete Talents Forever export are preserved in
`data/sources/current-classes/1.60.1.70291/`. Each class manifest records SHA-256,
byte count and exact source URL. Talents Forever identifies both classes as build
1.60.1.70291; its export was generated 2026-10-08 and is CC BY 4.0. Rank text and
icon names are adapted with visible attribution, not represented as independently
resolved raw client formula values. The prior 69913 files remain untouched.

The importer discovers each unique TraitTree through SkillLineXTraitTree:
Hunter SkillLine 50 → TraitTree 1091; Warrior SkillLine 26 → TraitTree 1117.
Every usable node is joined through its actual TraitNodeXTraitNodeEntry,
TraitNodeEntry and TraitDefinition to an actual SpellName/Spell record. Stable
application IDs never derive from a reused raw node ID. No rank spell IDs are
interpolated or invented. Missing membership, multiple entries, grid disagreement,
partial rank text, unresolved client variables, source-build disagreement and
unreviewed prerequisite changes stop candidate generation.

## Warrior

52 current raw nodes and 150 complete rank descriptions. All active grid cells,
names, canonical spell IDs, max ranks and eight Type-2 links match the licensed
resolved export. No node or edge quarantine is required.

Iron Will retains stable ID `warrior-fury-iron-will` while moving to Protection:
current node 113570 / Spell 12962. The former raw node 110857 is now Lingering
Rage with a different canonical spell, so raw-node ID reuse is not a rename.
The explicit mapping retains semantic identity by reviewed name/spell proof.
The official Warrior update corroborates the tree changes:
https://us.forums.blizzard.com/en/wow/t/warrior-updates-in-todays-beta-build/2369360

Compared with the saved 69913 snapshot: three added, four absent, eleven moved,
zero max-rank changes, ten talents with changed rank descriptions, four changed
prerequisite link sets, twenty-six otherwise unchanged. “Absent” is client snapshot
comparison, not a claim that every difference was announced in an official hotfix.

## Hunter — exact reviewed exceptions

The raw TraitTree has **52 records**, while the current reviewed visible tree has
**50 nodes / 148 complete rank descriptions**. Two exact off-grid former records
are quarantined. Their CSV rows remain preserved and their coordinates are never
silently corrected or represented as usable grid facts:

- Node 104982, Lightning Reflexes, Spell 19168, PosX 102800 / PosY 5740. Current
  on-grid node 110859 uses the same name/spell at PosX 10280 / PosY 5130, agreeing
  with the licensed current Survival row 6 / column 3. No assumption about Flags
  semantics is needed or asserted.
- Node 105003, Improved Serpent Sting, Spell 19464, PosX 6820 / PosY 39300,
  five ranks. Current Improved Stings is node 110870 / Spell 1310661, PosX 5020 /
  PosY 2730, three ranks. Blizzard’s Hunter deep dive states the rename/replacement
  and move to the second row. The current licensed export corroborates it:
  https://news.blizzard.com/en-us/article/24301515/world-of-warcraft-forever-class-deep-dives-hunter-and-druid

One exact reciprocal client connection is quarantined: **TraitEdge 124700**,
left 104961 (Bestial Wrath) → right 104964 (Intimidation), Type 2. Together with
edge 124701 in the other direction, it forms an unspendable cycle. The licensed
current graph and tier geometry corroborate Bestial Swiftness → Intimidation →
Bestial Wrath. The importer preserves all raw edges, excludes only this exact
reviewed reverse-cycle connection, and marks **Intimidation’s prerequisite link
interpretation `community_verified`**. This is not proof from a live Beta client.
All other retained link sets independently match raw data. A changed or unknown
quarantine edge stops import, rather than being broadly filtered.

The active-membership interpretation is `community_verified`; individual active
node coordinates/names/rank caps/canonical spell IDs remain directly reconciled
client facts. Full-rank prerequisite requirements and five points per tier remain
`derived_assumption` for both classes. Neither corrected coordinates nor fabricated
point costs are published.

Two explicit semantic identity mappings preserve old application IDs:

- Trueshot Aura: `hunter-1361`, historical Spell 19506 → current Spell 1299346.
- Improved Stings: `hunter-1348`, historical Improved Serpent Sting / Spell 19464
  → current Spell 1310661; maxRank 5 → 3. Historical shares that no longer replay
  legally require the consumer archive/recovery path; they must not be truncated
  or presented as valid current configurations.

Compared with saved 69913: thirteen added, nine absent, fourteen moved, four
max-rank changes, thirty-two talents with changed rank descriptions, three changed
prerequisite link sets, three otherwise unchanged. This includes historical source
coverage differences and is not presented as a single-patch official changelog.

## Verification

Candidate importer regressions cover exact client/export joins, source licensing,
complete ranks, unresolved variables, prerequisite disagreement, reused node IDs,
explicit previous/current spell transitions, nonzero membership ordering, exact
reviewed node quarantine, and exact reciprocal-edge quarantine. Both generated
snapshots pass independent raw membership/structure revalidation. Full application,
consumer archive, route, assets, static-output and production verification belongs
to the integrated release checks.

## Integrated promotion review

The current runtime adapters retain all reviewed fields and rank texts. Current
change labels compare the preserved 69913 client snapshot, while the raw source
export retains its separate Classic comparison. The original acquisition
manifest status is preserved; `release.json` records the subsequent reviewed
promotion, exact payload hashes and acceptance checks. Current URLs include a
dataset version, and original old ranks are recoverable without partial loading.
The CLI now writes only new candidate files and cannot overwrite these reviewed
production payloads or historical snapshots.
