# Protection Paladin route audit — client 1.60.1.70170

Reviewed October 5, 2026. This is a focused read of public WoW Forever Beta client records. It does **not** promote the site-wide 52-node 69913 import to a new build. The latest public build [70205](https://foreverdiff.com/builds/1.60.1.70205/) reports entity-identical tables to 70170; this last step relies on ForeverDiff’s comparison, not a separate in-game test.

## Reproducible client joins

[SkillLineXTraitTree](https://wago.tools/db2/SkillLineXTraitTree/csv?build=1.60.1.70170) maps Paladin SkillLineID **184** to TraitTreeID **1100**. Join [TraitNode](https://wago.tools/db2/TraitNode/csv?build=1.60.1.70170) → [TraitNodeXTraitNodeEntry](https://wago.tools/db2/TraitNodeXTraitNodeEntry/csv?build=1.60.1.70170) → [TraitNodeEntry](https://wago.tools/db2/TraitNodeEntry/csv?build=1.60.1.70170) → [TraitDefinition](https://wago.tools/db2/TraitDefinition/csv?build=1.60.1.70170) → [SpellName](https://wago.tools/db2/SpellName/csv?build=1.60.1.70170). Prerequisite arrows come from [TraitEdge](https://wago.tools/db2/TraitEdge/csv?build=1.60.1.70170). The old `Talent`/`TalentTab` CSVs are Classic-era leftovers and cannot replace this join.

All 16 Protection nodes in 70170 have the same node ID, spell ID, rank cap, normalized grid row/column, and prerequisite arrow as the site’s 69913 Protection snapshot. The whole Paladin tree has 50 nodes in 70170 versus 52 in the preserved 69913 snapshot.

| Talent | Node ID | Spell ID | Raw X,Y | Grid row,col | Max ranks |
|---|---:|---:|---:|---:|---:|
| Toughness | 105630 | 20143 | 5620,2130 | 0,1 | 5 |
| Redoubt | 105626 | 20127 | 6220,2130 | 0,2 | 5 |
| Precision | 105638 | 20189 | 5020,2730 | 1,0 | 3 |
| Guardian's Favor | 105637 | 20174 | 5620,2730 | 1,1 | 2 |
| Anticipation | 105636 | 20096 | 6820,2730 | 1,3 | 5 |
| Improved Seal of Fury | 110875 | 1314103 | 5030,3330 | 2,0 | 1 |
| Improved Righteous Fury | 105634 | 20468 | 5620,3330 | 2,1 | 3 |
| Shield Specialization | 110874 | 20150 | 6220,3330 | 2,2 | 3 |
| Sacred Duty | 105632 | 1224697 | 6820,3330 | 2,3 | 2 |
| Swift Judgement | 110878 | 1310994 | 5030,3930 | 3,0 | 1 |
| One-Handed Weapon Specialization | 105629 | 20196 | 5620,3930 | 3,1 | 3 |
| Improved Hammer of Justice | 105633 | 20487 | 6220,3930 | 3,2 | 3 |
| Templar's Bulwark | 105625 | 1311015 | 5620,4530 | 4,1 | 1 |
| Reckoning | 105627 | 20177 | 6220,4530 | 4,2 | 5 |
| Iron Creed | 110879 | 1311034 | 6220,5130 | 5,2 | 5 |
| Holy Shield | 105628 | 20925 | 5620,5730 | 6,1 | 1 |

The Protection arrows are Redoubt (105626) → Shield Specialization (110874), Improved Seal of Fury (110875) → Swift Judgement (110878), and Templar’s Bulwark (105625) → Holy Shield (105628). None of the five selected route nodes is the dependent end of an arrow. The client supplies arrow links but does not prove a required predecessor **rank**; the calculator continues to label its Classic max-rank fallback `derived_assumption`.

## Editorial standard-progression route

- **Level 20, 11 points, 0/11/0:** Toughness 5/5 → Redoubt 5/5 → Precision 1/3.
- **Level 30, 21 points, 0/21/0:** add Precision ranks 2–3 → Anticipation 5/5 → Improved Righteous Fury 3/3.
- Both allocations replay legally through the current calculator engine at their respective point budgets. They assume one point per level from Level 10 and exclude Legacy: Talented. Their effectiveness is untested; these are **BuildForgeTools editorial** routes, not Blizzard recommendations.
- [Blizzard October 1 Beta notes](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-1/2360696/1) increased the Beta cap to Level 30 and changed Redoubt’s block chance to 4/8/12/16/20% (previously 6/12/18/24/30%). Holy Shield changed to 30%, but it is not selectable in this 21-point route. The imported 69913 tooltip remains separately labeled as older.

## Publication boundary

Only the five selected nodes are represented as later-client-checked route evidence. Keep the full 69913 talent dataset, version label, tooltip caveat, canonical URLs, and historical 51-point examples intact until a complete Trait importer, validator, and diff review can replace them.
