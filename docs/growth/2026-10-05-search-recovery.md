# BuildForgeTools search recovery · 2026-10-05

## Baseline and target

The first business target is **10,000 production-domain page views in a rolling 30 days**. This is a measurement target, not a prediction about Google rankings.

| Window | Source and scope | Result |
| --- | --- | ---: |
| 2026-09-06–10-03 | GSC web search, domain property | 426 clicks / 8,363 impressions |
| 2026-09-27–10-03 | GSC web search, domain property | 108 clicks / 1,939 impressions / 5.57% CTR / average position 12.4 |
| 2026-09-27–10-03 | GA4 page views, production apex and `www` hostnames only | 187 PV, about 27 per day |
| Rolling 30-day target | GA4 page views, production hostnames only | 10,000 PV, about 333 per day |

At the last seven-day pace, the target needs roughly **12.5×** more daily production PV. The preceding week's unfiltered GA4 total contained 310 local `127.0.0.1` page views from one user and cannot be used as a production baseline. Compare completed days and separate GSC clicks/impressions from GA4 page views.

## What the audit ruled out

- Ten important URLs inspected in GSC were indexed, including `/songs-of-glimmerwick` after its October 4 crawl. The apex canonical, robots and sampled redirects were correct. The canonical sitemap reported 159 submitted URLs with zero errors; its pending `indexed=0` field is **not** a count of all indexed pages.
- Search did not disappear sitewide: weekly GSC clicks rose 94 → 108 while impressions fell 2,313 → 1,939. The sharpest impression losses were Protection Builds (144 → 15), Protection Leveling (127 → 2), and Paladin Beta Changes (113 → 10). Warlock PvP, Frost Mage AoE, and Shaman leveling comparison gained impressions and clicks.
- Homepage CTR is distorted by competitor-domain navigational queries. At least 517 of its 1,044 visible 28-day impressions came from three `wowforevertalents` variants with zero clicks. Do not rewrite the homepage title to chase those visits.
- GSC query rows are privacy-filtered: the Paladin Talents page had 48 page-level clicks, but only eight are represented by visible page+query rows. Make page decisions from page-level trends and actual product value, not a handful of disclosed queries.

## Release scope

1. **Restore useful existing entrances.** The highest-impression Paladin Talents page (48 clicks / 1,208 impressions in 28 days) needs a real, source-labeled talent index and direct links into its three trees and calculator. Protection Leveling and Builds need a current, legal editorial starter route only after exact node identity, rank caps, positions and relevant prerequisite edges are checked against later client data. Never present the route as Blizzard's recommendation or a performance ranking.
2. **Expose proven utility.** Link the homepage directly to distinct Warlock PvP, Frost Mage AoE and Shaman leveling comparison experiences. Keep their Level 20 starter budgets and the live Level 30 cap explicit. Do not create another batch of near-identical URLs.
3. **Keep freshness claims honest.** Correct sitemap `lastmod` to dates of substantial changes, align Article `dateModified`, and label September 20 as the last *full client import*, rather than the last page edit. A newer build number alone does not verify the entire calculator dataset.
4. **Build the next data import safely.** The current WoW Forever talent tree lives in Trait tables, not the legacy `Talent`/`TalentTab` CSVs. Promotion of a full newer dataset requires branch/build verification, stable node and spell identity, rank-level tooltip acquisition, validator, exact diff, manual review and route migration. Until then, keep the 69913 tree explicitly labeled and overlay verified official changes only.

## Review loop

Evaluate two **complete** seven-day windows after production deployment, always using GA4 production-hostname PV and GSC domain web search. Track overall clicks, impressions, CTR, top landing pages, organic sessions, `calculator_open`, deduplicated `build_complete` and successful build copies. Do not infer indexing status from the sitemap's pending field.

- If Protection impressions recover, improve the build-to-calculator flow based on actual engagement and copy events.
- If impressions remain low but ranking stays stable, compare query mix and snippets before changing a title; if ranking drops, inspect the current route's data and intent fit first.
- Expand a topic only when GSC shows a distinct query cluster or the game exposes a verified new mechanic. Keep new-game experiments small until organic landing-page demand appears.

The 10,000-PV goal will also require more **qualified search demand** and likely legitimate distribution of useful tools. This release repairs existing entrances and measurement; it cannot guarantee a 12.5× traffic increase by itself.
