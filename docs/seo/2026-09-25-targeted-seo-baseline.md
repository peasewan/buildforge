# Targeted SEO pilot baseline — 2026-09-25

## Measurement limits

GSC property: `sc-domain:buildforgetools.com`. The last finalized day available during this audit was September 22. September 23–24 figures below are preliminary. All period totals in the first table use the same `date,page` grouping, with position weighted by impressions; a `date`-only query returns different totals. GSC hides many low-volume queries, so visible query rows are not the whole page total.

| Period | Site impressions / clicks / position | Existing Paladin impressions / clicks / position |
| --- | --- | --- |
| Sep 21–22 | 368 / 19 / 11.3 | 347 / 19 / 11.4 |
| Sep 23–24 (preliminary) | 543 / 24 / 18.0 | 155 / 2 / 17.1 |

The new non-Paladin class pages received 380 impressions and 22 clicks across 83 distinct pages on Sep 23–24, at an impression-weighted position of 18.4. This is an initial discovery signal, not a stable ranking estimate. Among the nine Paladin page/query pairs visible in both periods, the fixed-prior-impression-weighted position changed from 11.15 to 9.09. The aggregate Paladin position change therefore cannot be described as all established keywords losing rank; the query mix and impressions changed substantially.

## Pilot pages and hypotheses

- `/wow-forever-warlock-pvp-build`: 30 impressions, 0 clicks, average position 6.5 on Sep 23–24. The visible query `wow forever warlock pvp build` contributed 7 impressions at position 5.7; another 21 page impressions have no visible query attribution. Its title already exactly addresses the query. A more concrete snippet and nonduplicated Level 20 Affliction route explanation may help users recognize what the page offers. This is a click and content-match experiment, not evidence of a ranking defect.
- `/wow-forever-hunter-pvp-build` is a contextual comparator: 59 impressions, 10 clicks, average position 5.4. Do not change it for this pilot.
- The Sep 23 site-discovery release replaced the root redirect to `/paladin` with a multi-game homepage. Paladin remains reachable, but the first WoW card lacks a descriptive, direct Calculator/Builds link. Add those contextual links on the homepage and Builds directory only. Do not change the 22 frozen Paladin pages or reverse the multi-game site structure. This is a crawl/context improvement, not a proven cause of the Paladin impression decline.

GA4 property `553881022` (Asia/Shanghai) reports 35 organic sessions on Sep 23–24, about 13 landing on nine new non-Paladin SEO pages. Warlock PvP has no recorded organic landing session in that interval; Hunter PvP has five. GA engaged-session figures are inconsistent with user-engagement events across all channels on Sep 24–25 and should not be used to diagnose these pages until reconciled. GSC clicks and GA sessions are not interchangeable.

## Follow-up rule

After GSC finalizes a further seven days, compare the same Warlock page/query pairs and the unchanged Hunter comparator, tracking impressions, clicks, CTR and position together. Also compare established Paladin *fixed* page/query pairs, rather than only sitewide average position. Inspect Google-selected canonicals and GA organic landing events separately. Do not infer success or failure from one low-volume day's position or from a rewritten Google snippet. The canonical sitemap currently lists 153 URLs and has no reported errors; that does not establish that every URL is indexed.
