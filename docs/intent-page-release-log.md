# Intent page rollout release log

Baseline: 8ea3d82; 150 URLs in the site inventory. Active scope: 128 non-Paladin URLs in 19 batches (18 × 7, final 2). Protected scope: 22 Paladin URLs. No redesign batch has been published yet.

Ruling: use an isolated worktree in the actual BuildForge repository; native current-task worktree tool targets unrelated remote-job repository. User authorized branch and autonomous releases.

User scope amendment: all 22 Paladin pages are protected/excluded. Active 128 pages in 19 batches (18 × 7, final 2). Paladin agent work canceled before publication; all earlier Paladin change requirements superseded.

## B01 — Warrior pilot review, 2026-09-23
- Seven different tasks enabled: route hub, allocation workbench, per-level planner, PvP encounter notes, dungeon toolkit, talent reference, and allocation comparison.
- Desktop 1440 and mobile 390 screenshots inspected for all seven pages. No document overflow. Verified level 14 = five points / next Unbridled Wrath; comparison selectors report identical allocations honestly; talent search returns one Piercing Howl record. Dungeon uses a distinct toolkit grid; hero art fits its height.
- Independent review found and fixed specialization fallback, fractional levels, preview hero specificity, inactive-page freeze gaps and empty build links. Re-review approved; actual CSS guard proves the earlier specificity failure.
- Full suite: 828 passing; later focused guard and framing tests passing. Build, TypeScript and lint pass. Static audit: all 150 metadata records preserved, 143 frozen roots/links/lastmod unchanged, including all 22 Paladin URLs.
- Ruling: four pre-existing missing Emberville favicon references remain warnings only while those pages are inactive; fix them with their own B18 rollout. No protected-page asset regression is permitted.
- Data limitations remain explicit. Duplicate build allocations are not changed merely to manufacture differences. No watcher enabled.
- Production deployment pending.
- B01 deployed: `82cc223465828cfd27d36d556c8fe6661a2f7e4a`. Vercel and GitHub CI succeeded. Custom-domain smoke verified all seven HTTP 200 pages with candidate content/metadata/markers. Git HTTPS was unavailable; GitHub API uploaded and verified identical blobs, trees and commit hashes, then advanced main without force.

## B02 — Warrior calculator and core routes
- Seven pages reviewed at desktop 1440 and mobile 390; no document overflow. Preserved authored spec content and exact allocation IDs; all three leveling pages start from their intended route.
- Warrior calculator: loaded Fury, verified 0/11/0 live nav counters, jumped to Fury/review, copied exact 11-point URL and reset to zero. Class PvP switch selected Fury's own tools, notes and link. No browser console errors.
- 97 focused tests, build/typecheck/lint and 150-page static audit pass; 136 frozen roots and all original metadata remain unchanged. Added independently reviewed production checker with exact candidate content parity and all-URL sitemap-date checks.
- Ruling: Vite preview's extensionless fallback does not emulate Vercel rewrites. Browser QA now uses a local static server mapping the actual built canonical URL to its own HTML. Production checks always use canonical custom-domain URLs without fallback.

## B03 — Warrior completion and Mage calculator

All seven pages inspected at 1440×900 and 390×844; no horizontal overflow. Fury PvP retains its own allocation; Protection PvP explicitly has no reviewed allocation. Dungeon toolkit, level-cap budget and branch-filtered talent directories are distinct. Mage Arcane preset loads 11/0/0, share URL preserves all ranks, reset clears tree navigation counts; browser console has no errors. Static guard passed all 150 URLs, including exact content/link/lastmod freeze for all 22 Paladin URLs and inactive pages. Rollout/metadata tests: 15 passed.
