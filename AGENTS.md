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

- Production Paladin talent dataset: WoW Forever client build `1.60.1.69913`, 52 talents, verified unchanged from `1.60.1.69893`.
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

- GSC: clicks, impressions, CTR, average position, top queries, top landing pages.
- GA4: organic sessions/users, engagement rate, average engagement/session duration, `talent_click` users, deduplicated `build_complete`, and build copy/share events.
- Separate product quality signals from acquisition signals. Strong calculator engagement can coexist with temporary ranking or impression loss.
- Successful WoW Forever build-link copies send a validated anonymous record to `/api/build-usage`. Records are private Vercel Blobs under `build-usage/YYYY-MM-DD/` and deduplicate the same session/build/day through a stable pathname.
- Do not label curated examples as popular or publish most-picked statistics until the private sample is large enough to report with a clear count and date range.

## Known implementation checkpoint

- Pipeline foundation commit: `977ce13` (`feat: add beta data publishing pipeline`).
- Rank-level spellbook support commit: `867a475` (`feat: support rank-level spellbook data`).
- At this checkpoint the repository passed 29 test files / 204 tests and the remote CI run succeeded. Re-run current checks rather than assuming this historical result still holds.
