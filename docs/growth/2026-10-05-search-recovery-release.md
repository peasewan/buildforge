# Search recovery release — October 5, 2026

## Scope and URL decisions

This completes the second part of the October 5 recovery pass, following the indexed talent library, Protection route evidence, homepage discovery improvements and metadata/date repairs in 9409b0c / 5d84667.

- All existing public URLs, page titles, canonicals and index directives remain intact. The Ret leveling H1 is corrected to include “Leveling”, removing its exact duplication with the general Ret page. No mass merges, redirects or noindex changes were justified by the observed GSC data.
- One new, distinct tool: `/wow-forever-paladin-build-comparator`. Its purpose is point-budget comparison and route replay, not another general Ret guide. It links to the existing Ret, Holy, leveling and patch pages.
- Seven existing pages receive scoped content changes: Paladin Builds Hub; Holy/general Build; Protection Build; Retribution Build; Retribution Leveling; Protection Leveling; Beta Talent Changes.
- Four descriptions now advertise the actual route/patch function instead of stale Level 20-only wording or an unsupported promise to track every change. Historical allocations remain clearly marked. Article modification dates and sitemap dates match the pages edited.

## Product changes

- Ret community route and Holy Shock editorial example can be replayed from level 10 to 30. Exact allocation and next talent update together, with a share URL for the selected level.
- No fabricated Level 30 Twist build. Imported 69913 gate requires 31 points; the UI offers an explanation instead of a load button. Light's Vigil has the same snapshot point floor. These are not newly verified current-client positions.
- Protection adds the same replay workflow using the five nodes already reviewed against 70170. No full-tree dataset promotion is implied.
- Three existing build pages answer different decisions: Holy healing vs Holy Shock; Protection dungeon route and threat evidence; Ret vs Holy investment and twisting point gates.
- Patch Impact maps official announcements to actual allocations that select the changed talent. It labels historical examples and avoids invented DPS/healing/threat percentages or popularity claims.
- Analytics: `build_comparison_select`, existing `leveling_step_select` and delegated `calculator_open`. Merely selecting a route does not emit `build_complete` or a copy event. Production-host filtering remains active.

## Index submission priority

Request indexing manually in GSC for these canonical pages if desired. Submission is not a guarantee or prerequisite for indexing; the sitemap exposes all pages.

1. https://buildforgetools.com/wow-forever-paladin-build-comparator
2. https://buildforgetools.com/wow-forever-paladin-beta-talent-changes
3. https://buildforgetools.com/wow-forever-protection-paladin-leveling-build
4. https://buildforgetools.com/wow-forever-retribution-paladin-leveling-build
5. https://buildforgetools.com/wow-forever-paladin-builds

Existing Holy alias continues to redirect to `/wow-forever-paladin-build`; do not submit the alias or `/build?id=...` share URLs.

## Measurement, not promised recovery

Target: 10,000 real production-host PV per rolling 30 days. Baseline: 187 production PV in September 27–October 3; previous local testing inflated unfiltered totals. This release alone cannot guarantee 333 PV/day.

Compare complete seven-day windows after deployment, then review again after 14 days:
- GSC: clicks, impressions, CTR, position by the edited canonical landing pages, with disclosed queries interpreted as a privacy-filtered subset.
- GA4: production-only PV, organic landing sessions, engagement, calculator opens, progression selections, comparator selections, deduplicated build completions and successful copies.
- Separate acquisition (impressions/clicks) from product use (calculator/completion/copy). Do not infer demand from our test traffic or route-selection event counts alone.
- If impressions rise without clicks, inspect query intent and snippet match. If clicks rise without calculator use, inspect entry placement. If sessions engage but impressions stay flat, prioritize verified query gaps and relevant community distribution rather than mass publishing.

## Deliberate limits

- Complete 69913 data remains historical; no fabricated current tree, tuning or live performance claims.
- Threat calculator withheld because validated coefficients and current inputs are missing.
- No forum posts, Reddit comments or YouTube messages sent. See `2026-10-05-distribution-drafts.md` for ready-to-review ownership-disclosed copy.
- Paused watcher remains paused. No analytics account or AdSense configuration changed.
- Existing shared JS bundle size remains an advisory; no claim that it caused the traffic change. Crawlable body content is prerendered.
- Browser automation was unavailable in this session (browser connector fetch failed). Route switching, point sliders, disabled loading, SSR content and links are checked through automated component/data tests; production HTTP checks follow deployment.

## Pre-deployment verification

- Full suite: 109 files / 1,521 tests passed (`npm test -- --maxWorkers=2`). The default-concurrency run encountered a five-second subprocess test timeout while building concurrently; the bounded-worker rerun passed without weakening the test.
- Final H1 correction: 23 BuildPage tests passed after the last UI edit.
- ESLint and final production build passed.
- Rendered 160 pages; SEO gate: 160/160 indexable, 160 sitemap, 22 protected baseline pages, zero errors. One advisory covers seven shared-text pairs; the exact duplicate Ret H1 was fixed.
- No production dataset, secrets, analytics account settings or watcher configuration changed.
