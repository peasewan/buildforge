# BuildForgeTools Project Memory

## Project and production

- Repository: `/Users/linjia/deepresearch/war`
- GitHub: `peasewan/buildforge`
- Production: `https://buildforgetools.com`
- Canonical host is the non-`www` domain.
- GSC property: `sc-domain:buildforgetools.com`
- Canonical sitemap: `https://buildforgetools.com/sitemap.xml`
- GA4 property: `properties/553881022`
- The user previously asked completed production work in this project to be pushed to GitHub and deployed through Vercel. Verify changes before publishing.
- If ordinary `git push` is blocked by the network, use the authenticated GitHub API/Git Data API as the fallback. Never expose credentials.

## Current Beta data baseline

- Production Paladin talent dataset: reviewed client build `1.60.1.70245`, 50 talents. Raw structural fields are `client_verified`; reconciled rank text is `community_verified` with Talents Forever CC BY 4.0 attribution. Preserve the 52-node `69913` archive and explicit removed-ID share handling.
- Internal Paladin spellbook baseline: build `1.60.1.69893`, 45 trainer spell groups.
- Spellbook is currently an internal data capability. Do not add a public/indexable route unless explicitly requested.
- A later upstream build number alone is not evidence of Paladin changes. The exact `69893 → 69913` review found no Paladin additions, removals, moves, rank changes, prerequisite changes, or per-rank tooltip changes.
- The watcher named `monitor-paladin-beta-client-builds` is currently paused by the user. Do not resume it without a new user request. Treat any future watcher output as an alert to inspect, not as permission to publish unverified data.

## Required verification vocabulary

Use only these shared statuses:

- `official`
- `client_datamined`
- `client_verified`
- `community_verified`
- `derived_assumption`

A client record may verify that a prerequisite link exists. The required prerequisite rank remains `derived_assumption` unless the client data explicitly proves that rank requirement. Never label inferred Classic behavior as Beta-verified fact.

## New Beta build workflow

When a newer client build appears:

1. Preserve the existing production dataset and import the candidate into a new versioned dataset.
2. Retain stable identity and source fields, including `nodeId`, `spellId`, build, version, verification, source URLs/references, and per-rank descriptions.
3. Run validators before generating or reviewing changes.
4. Produce an exact structured diff with these categories: `added`, `removed`, `moved`, `rank_changed`, `tooltip_changed`, and `prerequisite_changed`. Compare tooltip text per rank.
5. Generate a Beta Changes draft from the structured diff.
6. Manually review every proposed production change. Do not promote partial coordinates, unknown point costs, incomplete ranks, or speculative mappings.
7. Run the relevant test suite, TypeScript checks, lint, and production build.
8. Commit and push the reviewed data change, wait for Vercel, then verify the production page and metadata.

Never overwrite production simply because an upstream build number increased. Never invent missing talent coordinates, ranks, tooltips, trainer levels, or prerequisites.

## Commands to use directly

```bash
npm run talents:validate
npm run talents:diff:json
npm run spellbook:validate
npm run spellbook:query -- --search fury
npm run beta:changes:draft
npm run pipeline:simulate
npm run analytics:report
```

The pipeline simulator must prove that a candidate build can trigger import/validation/diff behavior without changing titles, canonicals, sitemap entries, or production data on failure.

## Data and UI rules

- Preserve `nodeId`, `spellId`, source/build/version/verification metadata through schema, importer, query, diff, and UI layers.
- Spellbook rank records may include `spellId`, trainer level, tooltip, resource cost, cast time, cooldown, and range. Missing fields stay unknown; do not fill them from memory.
- Reuse the verification/source display components across Calculator, Beta Changes, and future Spellbook surfaces.
- Keep claims precise: distinguish client facts, community recommendations, and derived assumptions.
- Calculator interaction and build sharing are core product behavior; do not replace the tool with generic guide copy.

## SEO observation boundary

During an agreed SEO observation window, do not change existing URLs, title structure, canonical tags, primary navigation, sitemap structure, or publish batches of new indexable pages unless the user explicitly asks. Data engineering, internal tooling, tests, and non-indexed drafts are safe work during that window.

For shared build URLs, retain the established canonical/noindex strategy and do not create crawlable parameter duplication without reviewing the current implementation.

## Analytics decision template

Use the same daily comparison fields so decisions are based on trends rather than manual searches:

- For live BuildForgeTools traffic or indexing questions, query the connected GSC MCP (`mcp__gscServer__*`) and GA4 MCP (`mcp__analytics_mcp__*`) first through `functions.exec` (discover deferred tools in `ALL_TOOLS` if needed). Use the GSC property `sc-domain:buildforgetools.com` and GA4 property `properties/553881022`. Do not substitute local OAuth files, browser screenshots, or recollection for the connected MCP data. If either MCP is unavailable, say so explicitly and label any fallback source.
- Compare complete date ranges and check GSC `data_state` freshness before interpreting a daily drop. Keep GSC search impressions/clicks separate from GA4 page views and sessions.

- GSC: clicks, impressions, CTR, average position, top queries, top landing pages.
- GA4: organic sessions/users, engagement rate, average engagement/session duration, `talent_click` users, deduplicated `build_complete`, and build copy/share events.
- Separate product quality signals from acquisition signals. Strong calculator engagement can coexist with temporary ranking or impression loss.
- Successful WoW Forever build-link copies send a validated anonymous record to `/api/build-usage`. Records are private Vercel Blobs under `build-usage/YYYY-MM-DD/` and deduplicate the same session/build/day through a stable pathname.
- Do not label curated examples as popular or publish most-picked statistics until the private sample is large enough to report with a clear count and date range.

## Known implementation checkpoint

- Pipeline foundation commit: `977ce13` (`feat: add beta data publishing pipeline`).
- Rank-level spellbook support commit: `867a475` (`feat: support rank-level spellbook data`).
- At this checkpoint the repository passed 29 test files / 204 tests and the remote CI run succeeded. Re-run current checks rather than assuming this historical result still holds.

## September 27 planning tools and patch review

- `/wow-forever-dungeon-build-finder` and `/wow-forever-class-picker` use `src/data/planningTools.ts`: published/legal routes only, replayed point snapshots, editorial preference matching rather than performance rankings. Low-level snapshots open in existing calculator modes; the UI explains this difference. Excavation Site stays locked pending reviewed higher-level routes.
- `src/data/betaPatchReview.ts` records source-linked September 24 / 70009 announcements separately from imported dataset versions. `data/reviews/1.60.1.70009/review.json` documents the acquisition/reconciliation conflict. Do not stamp the existing 69913 datasets as 70009-verified. Protection Paladin is excluded from new tool recommendations while its archived route includes the removed Improved Holy Strike.
- Unified funnel events are `calculator_open`, `view_planner`, `build_complete`, `build_copy`. Generic calculators deduplicate manual completion by class, budget and allocation per session; presets/share initialization do not complete a build. Clipboard failures do not count as successful copies. Class-specific legacy copy events remain compatible.
- `docs/seo/approved-patch-notice-2026-09-27.json` amends only approved Paladin body/link signatures. Original SEO metadata and head signatures remain frozen; do not regenerate baselines to hide unrelated changes.

## Emberville reviewed-data planner (September 27)

- Production catalog: `src/data/emberville-preview-2026-09-27.json`, loaded through `src/data/embervilleCatalog.ts`; stable editorial IDs are separate from unknown game IDs.
- `src/lib/embervilleData.ts` provides strict parsing, query, structured diff and conservative inheritance evaluation. `scripts/emberville-data.ts` exposes `emberville:validate`, `emberville:query`, `emberville:diff`, `emberville:import`. Import validates before atomic output writes and cannot overwrite production or the input file. See `docs/data/emberville.md`.
- Reviewed catalog includes Knight (official), Wanderer (September press preview), Sword/Bow/Staff (official category examples), and Focus Strike/Swift Foot names plus observed effects. Their active/passive types, inheritability, slots, unlocks and compatibility remain unknown. Never infer skill type from an effect, or class equip slots from inheritance slots.
- Planner drafts are local browser intentions, not confirmed game builds. Keep old `emberville-build-notes` migration, stale-record rechecks and storage-failure fallback. Do not send notes to analytics or fire `build_complete` when saving drafts.
- Preserve the four Emberville URLs, metadata and sitemap entries during data upgrades. No new route is needed to ingest a new reviewed dataset.

## AdSense and European consent

- Publisher: `ca-pub-4279730688530289`. The Vite HTML hook injects the async AdSense verification/advertising tag into production build entries; Vercel Preview deployments skip it. `public/ads.txt` authorizes the matching `pub-4279730688530289` seller. The script is the chosen site-verification method; no additional account meta tag is needed.
- `/privacy` must remain free of AdSense/CMP and GA scripts so the policy linked from the consent message can be read without consent.
- The analytics bootstrap queues EEA/UK/Switzerland defaults of `denied` for `ad_storage`, `ad_user_data`, `ad_personalization`, and `analytics_storage` before measurement configuration. This is advanced consent mode, which may send cookieless measurements; it is not a complete network block.
- Google Privacy & messaging controls the certified CMP. The owner must publish the European message for `buildforgetools.com`, use `https://buildforgetools.com/privacy`, and enable consent mode for both advertising and analytics. Code deployment alone does not publish the account-side message or submit AdSense review. Do not claim either is complete without verifying it in the account.

## Content publication remediation (October 9)

- Six expansion classes opt into `intent_tasks_v1`: valid ranks/point totals/supported modes, executable progression, distinct comparisons and sourced role decisions are required. Titles or page counts do not establish usefulness.
- Twenty reviewed duplicate entry pages redirect permanently to retained endpoint-plus-progression/role pages. Retirement is explicit in `retiredTo`; `classes:sync` derives redirects, artifacts and sitemap together. No blanket noindex strategy.
- Preserve the current Hunter Pet page: it has an official 18-family ability lookup. Older source audits that say it cannot select families are outdated.
- Run `npm run content:audit` and the publication/artifact regressions before publishing new intent pages. Fix missing task data rather than bypassing the gate.
- Emberville is a preview research notebook with working saved notes; it cannot validate skill inheritance or game builds. Its incomplete planner is excluded from AdSense injection; useful mechanics guides remain accessible.

- October 9 integration keeps main c9ff3c6 content consolidation: 140 current sitemap pages, 21 generated class retirements (clean + index.html aliases), plus Emberville builds and Invokyr ending merged into their working tools. The original 150-page rollout ledger and its check-intent scripts describe a historical release; use current npm build / content:audit / smoke:production for current inventory verification.

## Hunter / Warrior reviewed release (October 9)

- Hunter and Warrior current calculators use client build `1.60.1.70291` (October 8). Hunter has 50 visible nodes / 148 full rank descriptions; Warrior has 52 / 150. Level 30 routes spend 21 points; existing Level 20 URLs retain separate legal 11-point stages. Ordinary URLs, H1s, canonicals and retirement destinations are preserved.
- Hunter raw membership has two exact off-grid records and one reciprocal edge excluded after source review. Preserve raw CSVs and exact node/edge quarantine evidence; visible membership and Intimidation link direction remain community reviewed. Other structural fields are client verified. Both classes use licensed Talents Forever rank text resolved at Level 60, not a damage model scaled to the selected level. Tier/point timing and full-rank prerequisites remain derived assumptions.
- Source hashes, original raw tables, complete licensed export, reviewed semantic ID mappings and structured 69913-to-70291 diffs are in `data/sources/current-classes/1.60.1.70291/` and `data/reviews/current-classes/1.60.1.70291/`. The source manifests retain original candidate acquisition status; `release.json` records the subsequent reviewed promotion. Runtime change labels compare the saved 69913 client snapshot; raw upstream Classic comparisons remain separate.
- The importer `scripts/import-current-class-client-talents.ts` writes only new files under `data/candidates/current-classes/<build>/`. It cannot overwrite production payloads, existing candidates, archives or conflicting saved raw sources. Explicit output must stay in that candidate namespace. Review a candidate and its complete diff before a separate production promotion.
- Archived 69913 nodes and original local keys remain available through `historicalSnapshots`. Current share URLs carry a `dataset` version. Invalid/removed old shares or local drafts preserve the original ranks in a historical recovery panel, without partial migration. Preserve stable semantic identity when raw node IDs are reused for different spells.
- ForgePilot explanation validation is per published class version. Current Hunter/Warrior and known historical 69913 saves work; cross-class and unreviewed versions are rejected. Historical saves remain review-required. The Hunter Pet page retains the official 18-family lookup.
- Paladin stays on its reviewed 70245 payload. The selected-rank completion below supersedes the earlier Mage/five-class state. The watcher remains paused. Follow current per-class data versions instead of applying a single global Beta build label.

## AdSense content-review boundaries (October 9 follow-up)

- `npm run content:audit` is a structural task/publication review, not evidence that all text is complete or AdSense will approve. Its output distinguishes legacy policy coverage and actual selected-rank gaps.
- `npm run content:review` independently checks primary and related build selected-rank endpoints on every published ClassDefinition page, including legacy Mage/Warrior. It fails on missing exact rank text or absent/unknown rank-text evidence; it never falls back to generic descriptions, another rank or Classic memory. Paladin uses its separate validator and is explicitly outside this registry report.
- Before selected-rank completion on October 9: 99 framework pages / 64 with primary builds; 45 primary-build pages and 58 including related references had rank-text gaps. Current Hunter/Warrior have zero gaps. Remaining gaps belong to historical Mage, Rogue, Priest, Druid, Warlock and Shaman. Do not label these as current complete recommendations or claim the structural green gate resolves them.
- Mage editorial copy now describes fixed allocations rather than spending/holding talent ranks as combat resources; unresolved effects stay unresolved. Editorial correction dates do not advance its 69913 source verification.
- `/emberville` is the Emberville Preview Notebook. It saves research notes in the browser; it does not validate builds or inheritance compatibility. H1/title, homepage and About/Contact/Privacy/footer labels must match this scope. Dataset/source review dates remain separate from editorial publication dates.
- Whole-site content readiness and Google AdSense approval remain separate from test/build/deployment success. No AdSense reapplication has been submitted by these releases.

## Selected-rank completion (October 9)

- The independent content review now has **zero** primary and related selected-rank gaps across 99 published framework pages / 64 primary-build pages; the existing sitemap stays at 140 URLs. `npm run build` runs the strict `content:review` gate. Missing/unknown effects, unresolved client macros, or source/verified-build mismatches stop release; a generic description, different rank or Classic recollection must never fill these gaps.
- Rogue, Priest, Druid, Warlock and Shaman are promoted to reviewed `1.60.1.70291` Trait datasets: 260 visible nodes / 732 complete rank descriptions. Their 15 editorial routes each have legal 30/21-point endpoints and 20/11-point stages. Exact selected effects, source citations and actual conditional talent evidence support retained role pages. These examples are not measured best builds.
- Five-class source/candidate/promotion hashes and original 69913-to-70291 identity diffs live in `data/reviews/current-classes/1.60.1.70291/five-class-release.json` and per-class manifests. The full licensed Talents Forever export remains immutable; its text is community verified at its exported Level 60 reference, not scaled to the calculator level. Exact Priest duplicate-membership, Warlock display-position and Druid edge exceptions remain community reviewed, with raw coordinates/edges preserved. Required-rank and point timing remain derived assumptions.
- Mage remains a historical **69913** catalogue, not a fully reviewed current tree. All ten talents selected by its nine existing route allocations have 38 precise rank texts resolved from same-build Spell/TraitDefinitionEffectPoints/CurvePoint evidence; raw hashes and resolution records are under `data/sources/rank-text/1.60.1.69913/` and `data/reviews/rank-text/1.60.1.69913/`. Unselected unknown effects stay unknown. No newer text or extrapolated rank slots were used.
- Current seven-class shares carry a dataset tag. Versionless codes that match a saved 69913 archive are recovered as historical even if their stable IDs remain legal today. Historical recovery is read-only until explicit Start a new current build; original local drafts/ranks remain preserved. ForgePilot named current saves reopen with their dataset; imported relative source links preserve tags and remain review-required.
- Post-deployment smoke derives all seven reviewed 70291 classes from the registry and checks exact selected effects/versioned 30-point links plus current/historical API metadata. Smoke sends `x-buildforge-explanation-mode: metadata-only` so these checks never call the paid explanation model.
- Paladin data and its frozen URL/title/H1/canonical identities are unchanged. The watcher remains paused. Passing the strict gate/build is not a claim of full catalogue verification or AdSense approval; this work does not submit another AdSense application.


## Protection and dungeon gameplay evidence (October 11)

- `/wow-forever-protection-paladin-build` distinguishes Blizzard’s October 8 Reckoning trigger cooldown and Seal of Fury / mana-restoration threat fixes from the October 10 weapon-speed discussion. Fast versus slow is a controlled comparison checklist, not a verified best weapon or a TPS model. Holy Strike’s cooldown announcement remains September 24.
- The older 69893 Seal of Fury spellbook entry has trainer metadata, not a complete effect tooltip or threat coefficient. Do not present it as precise current threat evidence. Preserve Paladin’s reviewed 70245 dataset and its source dates; gameplay notes do not promote a new client tree.
- `/wow-forever-dungeon-build-finder#xp-compare` already compares measured first/repeat-run and questing XP/hour plus break-even wait. October 8’s approximately 20% change applies to dungeon creature-kill rewards, not all quest/run totals. Never multiply live measured XP by 1.2 or infer a role bonus / repeat penalty. The extremely overleveled-member no-XP rule remains separate from the mixed-level fix.
- This release only amends the Protection body/link fingerprint. Existing page inventory, URLs, titles, H1s, descriptions, canonicals, robots and sitemap dates remain stable. No additional AdSense review or watcher restart is included.


## Paladin reference and comparison (October 13)

- The Calculator embeds `PaladinAllocationComparison`: A is a separately saved local snapshot; B is the editable draft. Standard Level 10–30 budgets and Level 60 / 51-point reference remain distinct. Legacy bonuses are not modeled.
- `paladinRetReference.ts` holds the source-linked Mobalytics 13/0/38 numerical allocation reviewed October 13 and replayed against current 70245 rules. It is a community reference, not a measured best build or an imported client fact. Preserve historical 69913 examples separately.
- New copied comparison/current links retain level and dataset. Cross-version links are rejected; original removed-node archive handling and versionless compatibility remain. `/build` is still noindex. Snapshot A is validated against current version/rules on return; invalid/stale storage is not silently migrated.
- Saving/restoring/loading references never counts as manual build completion. Rank differences show exact selected-rank text plus community-source attribution; no simulated DPS/mana efficiency or actual dual-spec access is claimed. See `docs/data/paladin-comparison.md`.

## Dated events and Paladin review (October 15)

- `/wow-forever-stress-test` distinguishes the reported October 19 Battle.net listing from Blizzard's separately announced Server Slam plan. Hours, eligibility and stress-test level cap are unconfirmed in the October 15 source review. Do not invent a countdown or treat a normal user's official-forum post as a Blizzard announcement.
- `/wow-forever-paladin-pvp-build#forever-open` links the current Raider.IO organizer rules. Registration closed October 2; the Level 30 / 21-point examples model standard progression, not Legacy bonuses or equipment compliance. Quest/dungeon reward ilvl45 and profession-item skill226 restrictions have narrower scopes than blanket gear or character-skill caps.
- Paladin remains on reviewed `70245`. `data/reviews/1.60.1.70338/paladin-review.json` records incomplete source acquisition, not a zero-change diff. The current Reckoning tooltip separately displays the October 8 official 1.5-second trigger note without replacing preserved rank text.
- This release adds one event-status URL (141 sitemap entries). Existing ranking metadata remains stable; no AdSense submission or watcher restart is included.


## Traffic-protected publication cleanup (November 15)

- The traffic-cleanup release has **83 indexable URLs**, including 49 framework pages; the independent Atlas and Talent Economy additions below advance the inventory to 85. Historical 141/140/150 counts elsewhere describe earlier releases. The owner explicitly authorized this retirement; retained titles/H1s/canonicals stay stable.
- `src/data/pageConsolidations.ts` is the reviewed 55-entry consolidation map plus 3 gone screens. Decisions required zero GA4 pageviews during 2026-10-18..2026-11-14, zero GSC clicks since 2026-09-13 through final 2026-11-12, and redundant or obsolete/incomplete content. Detailed analytics stay in private local audit files, never browser data or the public repository.
- Framework source records, allocations and exact rank evidence remain available through retained hub task selectors. Do not republish their retired standalone shells. Preserve final current-evidence enrichment for approved merged role tasks, even when their standalone pages are retired; complete selected-rank evidence is still required.
- The two Glimmerwick help tools are embedded at `/songs-of-glimmerwick#first-days` and `#spellcasting`. Emberville inheritance is at `/emberville#skill-inheritance`; Protection dungeon reasoning is at `/wow-forever-protection-paladin-build#dungeon-tanking`; Ret hub content lives on its retained build page.
- The obsolete stress-test, incomplete Nivalis placeholder, and old Paladin ability catalogue return 410 through `api/retired-page.ts`, without advertising. Do not redirect these unrelated screens to the homepage or let the generic Paladin fallback serve them as 200.
- Keep existing stable shares, snapshots, data APIs, privacy/contact/about and analytics semantics. Run build/content checks, `smoke:production` and `smoke:pruning` before declaring a release healthy. No AdSense approval is implied by passing checks.

## PoE Atlas comparison (November 15)

- The separate /poe-atlas-tree-compare tool brings the indexable inventory to 84. It compares GGG standard Atlas exports 3.29.1 and 3.30.0 by skill ID, excluding mastery decorations. Effect text and neighboring IDs are compared; reachability and refund costs are not inferred. Regenerate with scripts/generate-atlas-comparison.py and the two tagged data.json files.


## Talent Economy tool (November 15)

- `/wow-forever-respec-cost-calculator` is one indexable tool covering respec cost, talent reset cost and dual spec cost. Current inventory is 85 URLs; the 55 consolidations and 3 gone screens from the cleanup remain retired.
- `src/lib/talentEconomy.ts` compares user-entered budgets using integer copper. Fixed-quote mode is a constant-price scenario, not a forecast of the live fee ladder. Per-reset mode only sums supplied prices; missing future quotes remain unknown. A break-even is the first cumulative crossing within the available sequence, not a guarantee against later price changes.
- The source review distinguishes Blizzard's major-city trainer/Level 40 dual-spec announcement from November 11 player-reported 1/5/10g reset fees and 50g dual unlock. Reported prices are editable budget assumptions (`derived_assumption`), not an official or client-verified price table. Historical September Beta 1-silver/hour rules do not become live defaults. Do not invent the full ladder, caps, discounts or decay schedule from Classic rules.
- Comparing two saved game setups does not make later edits to either setup free. Editable dual-side per-change fees are budget assumptions. This tool neither unlocks dual spec in game nor changes Calculator Reset/A-B semantics or talent datasets, and cost calculations must not emit `build_complete`.

## Paladin scope and duplicate leveling cleanup (November 16)

- This release retains 93 indexable URLs and 56 explicit consolidations. The only new retirement is `/wow-forever-retribution-paladin-leveling-build` (including its index.html alias) to `/wow-forever-paladin-leveling-build`. The latter preserves the old 69913 20/0/31 allocation, all 19 selected ranks and original section anchors in `HistoricalRetLevelingReference`; its executable Beta timeline is not duplicated. `exampleReferenceHref` sends historical Ret links to `#ret-history`. Retirement resolution preserves query strings and fragments; game/share allocation semantics are unchanged.
- Protection Hub and the detailed Protection Build both remain published: the Hub selects a scenario/route, the detailed Build explains weapon-speed/threat evidence and dungeon pulls. Do not infer that one should be retired just because its slug is singular/plural.
- The editable Paladin calculator remains the reviewed **70245 historical Beta snapshot**, not a launch tree. Level 30 is the dated October Beta cap, not the live level cap. Shared scope notices link separately sourced launch references. Only three obsolete description/OG-description claims were corrected; retained titles/H1s/canonicals/robots and sitemap dates remain unchanged. The narrow body/link/description amendment is `docs/seo/approved-paladin-scope-and-leveling-2026-11-16.json`; never regenerate old baselines to hide unrelated changes.
- Candidate **70938** is reviewed but **not promoted**. See `data/reviews/1.60.1.70938/paladin-review.json` and its exact structural diff/source manifest: 51 nodes; 6 added, 5 removed, 26 moved, 8 changed rank caps, 4 changed retained prerequisite links. `tooltip_changed: null` explicitly means incomplete rank-level review, never zero changes.
- The licensed resolved export identifies 70755 plus November 2/3 announced/server changes; target/source tables differ, so the existing importer correctly refuses promotion. Four raw node IDs are semantically reused and a Type3 edge needs interpretation. A future importer/promotion must review the per-Paladin dependency closure, every rank and reference level, stable identities, old 70245 shares and all affected routes. Do not copy unresolved or contradictory Forever XP rank values or bypass the byte-equality gate.
- Homepage and WoW Builds expose existing comparison/PvP tools and direct calculator choices more clearly, preserving other games and metadata. No new indexable route, watcher restart, AdSense application or approval is included.
