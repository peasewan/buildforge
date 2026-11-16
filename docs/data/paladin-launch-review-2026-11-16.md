# Paladin launch candidate review — November 16, 2026

The public **1.60.1.70938** candidate was acquired and structurally reviewed. It is **not promoted**. The working calculator remains the reviewed **1.60.1.70245 Beta archive**, not a current launch calculator. Existing rank allocations and shares must keep their original meaning.

## Evidence acquired

[Review record](../../data/reviews/1.60.1.70938/paladin-review.json), [exact structural diff](../../data/reviews/1.60.1.70938/paladin-structural-diff.json), [trimmed client structure](../../data/reviews/1.60.1.70938/paladin-structure.json) and [source hashes](../../data/reviews/1.60.1.70938/source-manifest.json) are saved separately from runtime datasets.

Ten public [Wago DB2 tables](https://wago.tools/db2/TraitNode/csv?build=1.60.1.70938) were downloaded for both 70938 and 70755: SkillLineXTraitTree, TraitNode, TraitNodeXTraitNodeEntry, TraitNodeEntry, TraitDefinition, SpellName, Spell, TraitEdge, SpellEffect and SpellAuraOptions. The source manifest preserves each exact URL, byte count and SHA-256. Full raw responses remain in the temporary acquisition audit; the repository retains a Paladin-only structural excerpt. Reacquire and verify original hashes before reusing raw files.

SkillLine184 maps to TraitTree1100. The 70938 excerpt contains **51 talents, 17 per branch**, and eight raw links. Each node has a unique ID and one reviewed entry. Names, rank caps and display grid positions agree with both the licensed Talents Forever export and the independent Forever XP calculator. Node IDs also agree with the latter. Raw coordinates and display mapping remain distinct evidence.

The [Talents Forever export](https://talentsforever.com/data.json), generated November13, contains 139 complete Paladin rank descriptions. Its own Paladin source statement identifies **70755 plus November2 announced values and November3 server hotfixes**. It is not a same-build70938 resolved-rank source. Its CC BY4.0 attribution and hash are preserved. [License](https://creativecommons.org/licenses/by/4.0/).

## Structural differences from the production archive

The semantic-membership comparison is 70245→70938, with retained names and SpellIDs matched separately from raw-node reuse:

| Category | Count |
| --- | ---: |
| Added semantic talents | 6 |
| Removed semantic talents | 5 |
| Moved retained talents | 26 |
| Changed retained rank caps | 8 |
| Changed retained prerequisite links | 4 |
| Exact target rank-tooltip changes | **Not completed** |

The six additions are Oath of Light, Stoicism, Unsealed Wrath, Shieldsworn, Turn Evil and Boundless Light. The five removals are Voice of Truth, Improved Seal of Fury, One-Handed Weapon Specialization, Instrument of Law and Twist of Light. This is consistent with the substantial Paladin redesign in [Blizzard’s November2 update, posted November3](https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-november-2/2360696/9).

Four raw node IDs are reused with different named semantics. In particular, Twist of Light and Unsealed Wrath share node105692 and Spell1310735. A raw-ID match must not silently change an old saved build’s meaning. Divine Strength also moves away from a raw node now used by Stoicism.

The eight downloaded70938 links include one Type3 edge, Holy Shock→Boundless Light. Both community trees show that prerequisite, but the runtime interpretation is not yet reviewed. Required prerequisite ranks and five-points-per-tier timing remain `derived_assumption`; a raw connection is not evidence of the required rank.

## Why the existing importer correctly stops

The current importer requires the target build and the resolved export’s source build to have identical table bytes. The ten-table comparison is not identical: the first rejection is **TraitNode**. Running the unmodified importer in a disposable temporary mirror exited1 with `Client tables differ between resolved export and target build: TraitNode`. No candidate or review directory was written, and mirrored inputs were unchanged. The repository was never a write target for that simulation.

The Paladin-only membership, positions, rank caps and raw edges are equal between downloaded70755 and70938 records. However, the direct Two-Handed Weapon Specialization Spell wording and one direct SpellEffect record change. Neither a matching class grid nor that bounded direct-record comparison proves all rank dependencies and server hotfixes equivalent. The global-byte guard has not been bypassed.

Further importer gates would still require stable-identity review and Type3-edge interpretation. The current importer was built to reconcile an earlier, much smaller transition; relabeling the input does not make this candidate valid.

## Independent rank-text conflicts

The [Forever XP calculator](https://www.forever-xp.com/talents/paladin/) is useful as a structural crosscheck, but its embedded resolved text cannot replace an audited rank source. Its Illumination ranks2–5 show refund percentages100/150/200/250 where the licensed export keeps50. Oath of Light contains zero-valued healing placeholders, and Vindication has a different reference-level resolution. These discrepancies are recorded, not silently resolved in favor of either provider.

No exact70938 per-rank tooltip diff is claimed. In particular, `tooltip_changed: null` means incomplete review, not zero changes. [November13 official hotfixes](https://news.blizzard.com/en-us/article/24315281/wow-forever-hotfixes-november-13-2026) remain separate gameplay evidence rather than a new imported talent version.

## Publication and migration boundary

For this release, label70245 and its Level30 examples as a **historical Beta snapshot**. Blizzard’s [Now Live article](https://news.blizzard.com/en-us/article/24315820/world-of-warcraft-forever-now-live) establishes the Level60 adventure; its [launch announcement](https://news.blizzard.com/en-us/article/24302093/carve-a-new-path-with-world-of-warcraft-forever) gives November4 at3pmPST (23:00UTC). That live context, community build references and their dates can be shown separately. Do not advertise the archive’s Level30 budget as the current live cap or open an incompatible launch allocation in it.

A later promotion requires reviewed per-Paladin dependency reconciliation, every rank’s exact source and reference level, explicit identity/edge decisions, preserved70245 historical shares, versioned current links, and replayed editorial routes. It must pass candidate validation, rank-level diff, share/history regressions, content checks, typecheck, lint and production build before deployment. No watcher restart or production-data promotion is included here.
