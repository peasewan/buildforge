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
