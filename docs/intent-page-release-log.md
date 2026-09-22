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
