# Intent page rollout release log

Baseline: 8ea3d82; 150 URLs in the site inventory. Active scope: 128 non-Paladin URLs in 19 batches (18 × 7, final 2). Protected scope: 22 Paladin URLs. Batches are released only after browser review, static checks, CI, Vercel and production verification. The JSON ledger records each deployed commit.

Ruling: use an isolated worktree in the actual BuildForge repository; native current-task worktree tool targets unrelated remote-job repository. User authorized branch and autonomous releases.

User scope amendment: all 22 Paladin pages are protected/excluded. Active 128 pages in 19 batches (18 × 7, final 2). Paladin agent work canceled before publication; all earlier Paladin change requirements superseded.

## B01 — Warrior pilot review, 2026-09-23
- Seven different tasks enabled: route hub, allocation workbench, per-level planner, PvP encounter notes, dungeon toolkit, talent reference, and allocation comparison.
- Desktop 1440 and mobile 390 screenshots inspected for all seven pages. No document overflow. Verified level 14 = five points / next Unbridled Wrath; comparison selectors report identical allocations honestly; talent search returns one Piercing Howl record. Dungeon uses a distinct toolkit grid; hero art fits its height.
- Independent review found and fixed specialization fallback, fractional levels, preview hero specificity, inactive-page freeze gaps and empty build links. Re-review approved; actual CSS guard proves the earlier specificity failure.
- Full suite: 828 passing; later focused guard and framing tests passing. Build, TypeScript and lint pass. Static audit: all 150 metadata records preserved, 143 frozen roots/links/lastmod unchanged, including all 22 Paladin URLs.
- Ruling: four pre-existing missing Emberville favicon references remain warnings only while those pages are inactive; fix them with their own B18 rollout. No protected-page asset regression is permitted.
- Data limitations remain explicit. Duplicate build allocations are not changed merely to manufacture differences. No watcher enabled.
- B01 deployed: `82cc223465828cfd27d36d556c8fe6661a2f7e4a`. Vercel and GitHub CI succeeded. Custom-domain smoke verified all seven HTTP 200 pages with candidate content/metadata/markers. Git HTTPS was unavailable; GitHub API uploaded and verified identical blobs, trees and commit hashes, then advanced main without force.

## B02 — Warrior calculator and core routes
- Seven pages reviewed at desktop 1440 and mobile 390; no document overflow. Preserved authored spec content and exact allocation IDs; all three leveling pages start from their intended route.
- Warrior calculator: loaded Fury, verified 0/11/0 live nav counters, jumped to Fury/review, copied exact 11-point URL and reset to zero. Class PvP switch selected Fury's own tools, notes and link. No browser console errors.
- 97 focused tests, build/typecheck/lint and 150-page static audit pass; 136 frozen roots and all original metadata remain unchanged. Added independently reviewed production checker with exact candidate content parity and all-URL sitemap-date checks.
- Ruling: Vite preview's extensionless fallback does not emulate Vercel rewrites. Browser QA now uses a local static server mapping the actual built canonical URL to its own HTML. Production checks always use canonical custom-domain URLs without fallback.

## B03 — Warrior completion and Mage calculator

All seven pages inspected at 1440×900 and 390×844; no horizontal overflow. Fury PvP retains its own allocation; Protection PvP explicitly has no reviewed allocation. Dungeon toolkit, level-cap budget and branch-filtered talent directories are distinct. Mage Arcane preset loads 11/0/0, share URL preserves all ranks, reset clears tree navigation counts; browser console has no errors. Static guard passed all 150 URLs, including exact content/link/lastmod freeze for all 22 Paladin URLs and inactive pages. Rollout/metadata tests: 15 passed.

B03 corrective verification: CI exposed two legacy-CSS-dependent tests after enabling cap/talent pages. Legacy renderer tests now isolate the disabled gate; separate enabled tests retain exact build/talent/icon/link assertions. Fixed the not-yet-published Mage AoE route selector losing its primary choice after switching away, with a failing-then-passing roundtrip regression. Independent review approved. Relevant 32 tests pass; full suite 827 passed/5 timed out under concurrent load, then all 5 timed-out cases passed alone. Lint, typecheck, build and 150-page static guard pass.

## B04 — reviewed batch

All seven Mage pages inspected at 1440×900 and 390×844; no overflow. Hub exposes only published routes, reference has 31 real records and missing tooltip notices, Frost/Arcane builds show their own allocations and alternatives. All three progression defaults match their page; Arcane level 20 produces 11/0/0 and exact calculator rank link. Original metadata preserved on 150 pages; 122 frozen roots unchanged. Focused tests, lint, build and static audit pass.


## B05 — reviewed batch

All seven pages inspected at 1440×900 and 390×844, no overflow. Mage AoE retains its route after selecting leveling and back; level 20 link restores Improved Blizzard 1. Mage dungeon renders toolkit first, level 20 lists only published Frost/Arcane examples. Rogue calculator loads Combat 0/11/0, copies exact ranks, resets, and single-point edit updates live counters; no console errors. Rogue directory shows 51 records with explicit unavailable text for blank tooltip; real Remorseless Attacks search verified after fix. Shared blank-rank fallback independently reviewed, regression tests cover valid text precedence and missing/whitespace data. Build, lint, static guard and full suite results verified before release. 115 frozen roots including 22 Paladin remain exact; 150 original metadata preserved.


## B06 — reviewed batch

Seven Rogue spec/leveling/PvP pages reviewed at 1440×900 and 390×844 without overflow. Assassination, Combat and Subtlety start from correct allocations and talents. All three level controls reach legal 11-point endpoints; identical spec/leveling allocations explicitly report no talent differences. PvP preparation checkbox updates 1/2 notes reviewed; source gaps remain visible. Focused tests, lint, build and 150-page static guard pass, 108 frozen roots unchanged including 22 Paladin.


## B07 — reviewed batch

Seven pages inspected at 1440×900/390×844, no overflow. Rogue cap shows three 11-point routes; comparison defaults Combat vs Assassination with exact different ranks; Subtlety PvP stays spec-matched; dungeon toolkit uses Combat allocation and explicit missing-rank text. Hunter reference has 46 records and real rank descriptions. Hunter calculator single point ->1/0/0, Marksmanship preset ->0/11/0, share URL preserves exact rank IDs and reset restores zero; no console errors. Build, lint, scope tests and 150-page static guard pass; 101 frozen roots including 22 Paladin unchanged.


## B08 — reviewed batch


- Reviewed all seven pages at 1440×900 and 390×844; no horizontal overflow, clipped titles, or broken talent images.
- All four leveling controls reach Level 20 / 11 points, with Beast Mastery 11/0/0, Marksmanship 0/11/0, and Survival 0/0/11. Each build workbench matches its own specialization.
- Build, leveling, and alternative-allocation compositions retain honest editorial labels. Identical allocations are not presented as fabricated differences.
- Build, lint, scope tests and 150-URL audit passed: 56 enabled, 94 frozen, all 22 Paladin pages unchanged.


## B09 — reviewed batch


- All seven pages inspected at desktop 1440×900 and mobile 390×844; no document overflow. Hunter PvP checklist, pet planning, dungeon toolkit, cap snapshot and two-route comparison retain distinct tasks and explicit missing-rank evidence.
- Warlock hub search for pet returns its relevant route. Calculator single Suppression point gives 1/0/0; Demonology preset loads, Review & share works, copied URL preserves all four talent ranks and Level 20; Reset restores 0/0/0. Browser has no errors.
- Paladin local regression also passed single-point editing, Protection Level 20 loading, exact build-link copying and reset; no Paladin source/output changed. Warrior and Mage individual-point/reset flows passed again.
- Scope tests, lint, production build and all-150 static audit passed before release.


## B10 — reviewed batch


- Seven Warlock pages reviewed at 1440×900 and 390×844 with no overflow. The 50-record talent directory filters Shadowburn to exactly one record with rank selector and evidence.
- Affliction, Demonology and Destruction workbenches show 11/0/0, 0/11/0 and 0/0/11 respectively, with their actual talent icons and authored roles. All three progression pages reach the correct legal 11-point endpoint at Level 20.
- Same-allocation alternatives are disclosed. Exact tooltip gaps remain explicit; no client dataset was changed.
- Build, lint, scope tests and 150-page static audit passed: 70 enabled, 80 frozen, all 22 Paladin pages protected.


## B11 — reviewed batch


- Seven pages inspected at desktop 1440×900 and mobile 390×844, no overflow. Destruction progression reaches 0/0/11 at Level 20. Warlock cap compares all three eleven-point routes; pet setup explicitly invests in Voidwalker; dungeon toolkit uses Destruction; Affliction/Demonology comparison retains actual ranks and authored trade-offs.
- Priest calculator single Unbreakable Will point gives 1/0/0. Holy preset loads, Review & share jumps correctly, copied URL includes all four talent ranks and Level 20, Reset returns 0/0/0. No console errors.
- Build, lint, scope tests and 150-URL static audit passed: 77 enabled / 73 frozen, including all 22 Paladin pages.


## B12 — reviewed batch


- Seven Priest pages reviewed at desktop 1440×900 and mobile 390×844; no overflow or broken images. Hub gives purpose-based routes; reference displays all 47 records with rank/evidence controls.
- General leveling starts Shadow and reaches 0/0/11. Discipline and Holy leveling reach 11/0/0 and 0/11/0. Their initial talents, final ranks, authored roles and calculator links stay specialization-specific.
- Holy uses current Twilight Focus / Improved Renew / Divine Fury / Holy Nova records. Same-allocation comparisons remain explicit, with no invented power claim.
- Build, lint, scope tests and all-150 audit pass: 84 enabled, 66 frozen, 22 Paladin pages unchanged.


## B13 — reviewed batch


- All seven remaining Priest pages inspected at 1440×900 and 390×844 without overflow. Shadow workbench and progression use Spirit Tap, Improved Shadow Word: Pain, Shadow Focus and Mind Flay; Level 20 reaches 0/0/11.
- PvP uses the Discipline allocation, healing and Holy dungeon use Holy. Dungeon places its toolkit before preparation notes; healing keeps a role checklist; cap gives all three point budgets. Shadow versus Discipline presents separate allocations and actual rank differences.
- Page-specific notes and data gaps remain visible. Build, lint, scope tests and all-150 audit passed: 91 enabled / 59 frozen, including all 22 Paladin pages unchanged.


## B14 — reviewed batch


- All seven Druid pages inspected at 1440×900 and 390×844; no overflow. Artwork retains the character's head. Directory exposes 47 evidence records; hub links existing routes.
- General leveling starts Feral and reaches 0/11/0; Balance leveling reaches 11/0/0. Feral Charge (Bear) keeps its form-specific name and limitations.
- Calculator: Improved Wrath single point -> 1/0/0; Feral preset loads exact three-node eleven-point build; Review & share, copied rank URL and reset all pass. No browser errors.
- Build, lint, scope tests and all-150 audit passed: 98 enabled, 52 frozen including 22 protected Paladin pages.


## B15 — reviewed batch


- Seven Druid pages reviewed at 1440×900 and 390×844 without overflow. Feral and Restoration progression reach the correct 0/11/0 and 0/0/11 Level 20 endpoints.
- Tank page exposes its Bear toolkit above the checklist; restoration healing has its recovery-oriented notes; PvP keeps Feral's authored form limitations. Cap compares all three real eleven-point allocations.
- Exact rank gaps are visible, and duplicate allocations are not given invented differences. Build, lint, scope tests and all-150 static audit passed: 105 enabled / 45 frozen, including all 22 Paladin pages.


## B16 — reviewed batch


### B16 — Druid comparison and Shaman foundations
- Reviewed all seven pages at 1440×900 and 390×844; no horizontal overflow, readable artwork, distinct comparison/hub/reference/build/progression layouts.
- General Shaman progression reaches 0/11/0 at Level 20; Elemental reaches 11/0/0. Druid comparison shows distinct Feral and Balance allocations.
- Shaman calculator: Convection single point → 1/0/0; Enhancement preset → 0/11/0; exact copied ranks shaman-613.5~shaman-614.5~shaman-617.1 with level=20; reset → 0/0/0; no browser console errors.
- Local build, lint, 15 scope/metadata tests and all-150 static audit pass; 112 active and 38 frozen pages, including all 22 Paladin pages.


## B17 — reviewed batch


- Reviewed all seven Shaman pages at desktop 1440×900 and mobile 390×844. No overflow; separate build, progression, PvP, cap and totem tasks remain readable.
- Enhancement and Restoration progression reach 0/11/0 and 0/0/11 at Level 20. Cap view renders three distinct allocations. Enhancement weapon-access caveat and missing rank descriptions remain explicit.
- Totem checklist changes to 1/2 after checking a note and resets to 0/2 when changing route; no unsupported four-totem loadout is claimed.
- Build, lint, 15 focused tests and 150-page static audit pass; 119 enabled / 31 frozen, including all 22 protected Paladin pages.

