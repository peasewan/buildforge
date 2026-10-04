# Leveling tools implementation plan

Goal: make the existing Paladin leveling routes actionable through level 30, and compare measured dungeon/questing XP without inventing game rules.

Scope approved in chat: existing URLs only, community route separate from imported 69913 dataset; no baseline promotion to 70205, no watcher restart, no new Hunter or Seal feature. Implement inline.

- [x] Add a sourced Retribution point sequence (Oct 3 Mobalytics recommendation, reviewed Oct 4); replay every point with existing validation. Keep original datasets and historical Protection route intact. Test all 21 steps, unavailable/invalid levels, prerequisite and codec round-trips.
- [x] Render the sequence on both existing leveling pages: slider, milestones, current ranks, next talent and deep link. Distinguish recommendation review from client verification. SSR must show meaningful default content.
- [x] Honor level 10–30 links in Paladin calculator with matching point limits, sharing, local restore and ForgePilot context. Preserve legacy 51-point links; never silently truncate over-budget links. Test cap enforcement, completion dedup, share and reload.
- [x] Add measured XP comparison to existing dungeon finder: first and repeat run measured XP, questing XP/time, waiting/travel/clear/turn-in time. No dungeon or role multipliers. Inputs start blank; label the sample. Handle zero, empty, negative, NaN/Infinity, and break-even waits. Test model and interaction.
- [x] Run focused tests, full tests, typecheck/lint, production build, browser desktop/mobile smoke. Review changed SEO fingerprints only, preserving titles/H1/canonicals/indexing/URL counts. Production deployment follows the checks below.

Review focus: current-vs-historical labels, next talent at cap, route deep-link integrity, invalid budget URLs, XP/time double counting and missing measurements.

## Verification

- Full suite: 107 files, 1509 tests passed.
- Lint and production build passed. SEO validator: 159 indexable URLs, 159 sitemap entries, 22 frozen Paladin routes, zero errors and two advisory warnings.
- Desktop: Level 20/30 timeline selection and exact Level 30 calculator link checked; calculator displays 21/21.
- Mobile (390 px): timeline and illustrative XP comparison checked; no horizontal overflow.
- [x] Pushed feature commit `b1155c0` to main; Vercel reported deployment success. All four changed feature URLs returned HTTP 200 with new content; the Level 30 shared-build route and production JS/CSS also returned 200. Sitemap remains 159 URLs with the four changed routes dated 2026-10-04.
- [x] Attempted existing sitemap submission through GSC MCP (`sc-domain:buildforgetools.com`). The call timed out after 300 seconds. Resubmission is **not confirmed**; live sitemap deployment is confirmed. No new sitemap or URL was introduced.
