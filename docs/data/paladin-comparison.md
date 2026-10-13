# Paladin allocation comparison — October 13, 2026

The existing calculator supports normal Level 10–30 budgets and a separate Level 60 / 51-point planning reference. Legacy bonus points are not modeled.

`src/data/paladinRetReference.ts` records only the numerical 13/0/38 allocation shown by Mobalytics on October 13, 2026. All 19 selected nodes were checked against the current reviewed 70245 catalogue, exact rank descriptions and planner replay. This is a community recommendation, not client evidence, an official preset or a measured best build. The 69913 historical examples remain separate and unchanged.

`src/lib/paladinComparison.ts` validates and clones a snapshot with its level and dataset. Saved A uses browser key `buildforge-paladin-comparison-a-v1`; B is the live editable calculator. Stale/invalid A is not silently migrated or deleted. Storage failure retains the comparison for the current visit. Saving or clearing A never alters the calculator draft; Restore A and Load reference are explicit replacements. Loading the reference preserves a nonempty current build as A when A is not yet set.

Rank comparisons show only changed talents and the exact text for the selected rank, with source/license attribution. Different level budgets are flagged. No DPS, threat, mana-per-fight, healing-efficiency model or in-game dual-spec unlock is implied.

New copied/opened links carry `level` and `dataset`. Cross-version links are rejected instead of decoded as current data. Removed-node archive recovery remains available. Existing versionless links retain their backward-compatible validation. `/build` keeps its established noindex/canonical policy.

Loading a reference or restoring A emits `build_reference_load`; saving A emits `build_comparison_save`. These actions do not fire `build_complete` or talent-click events. Manual completion and successful-copy deduplication remain unchanged.

Verification: exact 13/0/38 totals; 51-point replay; 21-point rejection; exact rank differences; stale/invalid storage; save/edit/restore/remount; 52nd-point block; complete copy/reopen/edit flow; dataset rejection. Existing SEO titles, H1s, canonicals, robots, sitemap entries and dates remain stable. The only approved static differences are the calculator body and links.
