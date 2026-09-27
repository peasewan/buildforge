# PvP calculator flow and Glimmerwick garden evidence

User scope: implement today's two growth improvements on existing pages, in an isolated worktree, verify, then integrate into main and deploy. No new public URL or SEO metadata change.

## PvP to calculator

- Paladin restores the allocated specialization from a shared build. Hunter PvP opens its Survival tree and Level 20 point budget, including on mobile.
- Explicit empty share parameters override browser-saved allocations.
- Full allocations explain removing a rank before adding another. Editing, resetting, loading a preset or changing Hunter mode invalidates copy feedback and any manual fallback URL.
- Clipboard failure exposes the exact URL for manual copy. Delayed clipboard results do not overwrite a newer edit.
- Existing Paladin PvP page offers the published Holy/Ret eleven-point editorial starts. They are not measured PvP recommendations. It identifies imported 69913 versus unreconciled 70009 and explains the legacy calculator's 51-point reference mode. No new Protection recommendation uses removed Improved Holy Strike.

## Glimmerwick garden notebook

- Basil is a reviewed Demo crop name, with timestamped public footage links. Growth, yield, seasons and seed price remain unknown.
- Four distinct garden rules show source and Demo version: daily watering, Song of Tilling, the garden well, and the developer's casting clarification.
- Unknown growth duration can stay blank. It never produces an estimated readiness day.
- A personal harvest records the current garden day and elapsed days for that planting. It does not establish the earliest possible maturity day or a universal game default.
- Version-1 saved plans remain compatible; records survive reload and CSV export. Harvest analytics contain a row count, never crop names or notes.
- Evidence archive: `data/sources/glimmerwick/review-2026-09-27.json`. Public footage review is not an in-game playtest or full-release validation.

## Verification

- Full Vitest suite: 80 files, 1,223 tests passed.
- Typecheck, lint and production build passed; prerender produced 156 pages.
- SEO gate: 156 indexable pages / 156 sitemap entries; 22 frozen pages; zero errors. A separate explicit amendment permits only body/link fingerprints of `/paladin` and `/wow-forever-paladin-pvp-build`; original head fields and sitemap remain frozen.
- Two independent read-only reviews found no blocking P1/P2 issues.
- Chromium at 390×844: actual Hunter PvP link → Survival → edit → real clipboard → restore; Paladin PvP → Ret → edit → real clipboard → reload; Basil unknown duration → personal harvest → reload. Analytics endpoints blocked during browser tests; no page errors.
- Existing build-size and legacy duplicate-H1 advisory warnings remain outside this task's scope.

Production acceptance will be checked after main deployment, before reporting the work as live.
