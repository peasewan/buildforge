# Intent Page Experience Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Track steps with checkboxes and use the rollout ledger to resume.

**Goal:** Upgrade and self-verify all 128 non-Paladin production URLs in batches of at most seven, then submit the production sitemap to GSC.

**Architecture:** Retain ClassDefinition and existing route metadata. Add small intent components driven by reviewed existing data, gated by an explicit pathname allowlist. Shared visual server rendering and client rendering use the same enabled composition. Legacy Emberville and trust pages get scoped enhancements via their existing components/adapters; do not force them into a new class database.

**Tech Stack:** React, TypeScript, Vite, Vitest, existing CSS/Lucide, GitHub/Vercel, GSC MCP.

**Spec:** `docs/superpowers/specs/2026-09-23-intent-page-experience.md`

## Global constraints

**HARD SCOPE AMENDMENT:** 128 active pages; 22 Paladin pages excluded by the user. All earlier Paladin enhancement tasks are canceled. Maintain site inventory at 150; do not touch protected components or expand shared styling into them. Lastmod for Paladin must remain unchanged. Shared CSS, navigation, footer, rendering and data changes must not alter Paladin output or behavior. Any protected-page regression blocks the batch release; fix or isolate the shared change before pushing main.


Use the complete approved spec above. The user has authorized main pushes, production deployment and GSC submission. The paused Beta watcher stays paused. Do not wait for another approval between batches. No claimed ranking gains or invented data. This plan covers exactly the baseline 150 sitemap URLs, not the four withheld Mage definitions.

## Files and ownership

- `src/experiences/buildExperience.ts`: pure per-point progression, legal-prefix validation, exact build differences, editorial usage lookup; tests in `buildExperience.test.ts`.
- `src/experiences/ClassIntentExperience.tsx`: interactive composition selected by page kind; tests in `ClassIntentExperience.test.tsx`.
- `src/experiences/experience.css`: namespaced layout responsive to task and viewport; never style disabled pages.
- `src/experiences/rollout.ts`: explicit list of reviewed and enabled paths. Batches add at most seven.
- `src/ClassDocumentPage.tsx`, `src/ClassCalculatorPage.tsx`: integrate enabled composition while keeping old rendering for inactive paths.
- Legacy page components and `src/experiences/LegacyIntentExperience.tsx`: Emberville/trust-specific improvements with existing data only. Paladin adapters and components are excluded.
- `scripts/check-intent-rollout.ts`: sitemap/ledger coverage, enabled set, per-page static content/metadata/link checks; not a word-count or similarity ranking score.
- `docs/intent-page-rollout.json`: 150 path records, batch, status, specific change, checks, commit and production result.
- `docs/intent-page-release-log.md`: per-batch review/rulings and evidence. Never mark deployed before the production check.

## Task 1 — Inventory and baseline (before B01)

- [x] Confirm working tree and main head, create `intent-page-experience` worktree; preserve other work.
- [x] Reconcile the 150 JSON ledger paths exactly against `public/sitemap.xml`, no duplicates.
- [x] Record title/canonical/robots and local screenshot baseline for the seven Warrior pilots; record key deep links.
- [x] Run baseline/focused tests and inspect point order in Warrior and Mage. Build records can share allocations; record this, do not change ranks to make them unique.

## Task 2 — Testable data operations (ships with B01, inactive elsewhere)

- [x] Write failing tests for progression at levels 10/15/20, invalid prerequisites, unknown IDs, point caps, exact end allocation, and identical-build diff.
- [x] Implement `progressionForBuild(classDef, build)` returning reviewed/derived legal point steps with cumulative allocations; no source array mutation. If no legal next step, return an explicit unavailable reason, not a silently reordered claim.
- [x] Implement `diffBuilds(classDef, left, right)` returning talent identity/name and left/right rank; identical routes yield no differences and an explicit UI message.
- [x] Test deep-link encoding/decoding for every milestone and all published class builds using the existing planner codec.
- [x] Review pure functions independently before integrating UI.

## Task 3 — Seven pilot compositions (B01)

- [x] Build view: allocation/selected talents and actual alternative route comparison near the title.
- [x] Leveling view: numeric/range level input, current budget, exact cumulative allocation, next point, milestones, load-current-step deep link. At endpoint say route complete; no fictional next talent.
- [x] Comparison view: independent build selectors, allocation columns, rank-difference table and both calculator links. Do not hide an identical result.
- [x] PvP view: spec selection, existing authored role/playstyle/trade-off, link and compare to the published spec baseline. No subjective power bars or fabricated counters.
- [x] Dungeon view: role board, selected tools with available descriptions and sources, existing authored preparation/testing notes, baseline comparison. No invented rotation or equipment recommendations.
- [x] Talents view: name/branch filter, real per-rank description where present, prerequisites and separate assumed rank label, published editorial builds using each node.
- [x] Hub view: purpose navigation plus branches/roles; make primary choices prominent instead of one long repeated article.
- [x] Add real behavior tests (input changes budget/next point/link, selectors change diff, filters change records). Empty/missing fields remain explicit.
- [x] Wire pathname-gated compositions into shared renderer. Keep global CSS and non-enabled markup unchanged.

## Task 4 — Apply subsequent batches B02–B19

For every batch in the exact URL schedule below:

- [x] Re-read each page's own data/content, resolve intent and supported unique task; record concrete changes per URL in the ledger before marking ready.
- [x] Add only the batch paths to the allowlist. Author role-specific notes from existing evidence; retain disclaimers for incomplete sources.
- [x] Reuse approved components but test every page's actual data. If a new page family appears (cap, AoE, pet, totem, healing, trust), add its own purposeful module and tests before enabling.
- [x] For the 22 protected Paladin pages, require identical root markup, metadata and links versus baseline; make no component or data changes.
- [x] For calculators, keep tree interaction primary and add useful preset/spec navigation. For Emberville, focus direction choice, system comparison or inheritance flow with unknown records still disabled. Trust pages get accessible local navigation and clear actions without fabricated contacts.
- [x] Run this batch's meaningful data/UI tests, complete typecheck/lint/build and static audit. Run full suite whenever shared logic changes; carry earlier-page regression fixtures forward.
- [x] Open every batch page at desktop 1440 and mobile 390; inspect screenshots, overflow and primary action. Compare seven pilot screenshots as a set; confirm no text-first flash on normal navigation or script-free first paint.
- [x] Check indexability, canonical/title preservation, exact sitemap URL membership, crawlable internal links, no orphan/withheld destinations. Warning on duplicate allocation is allowed; missing page-specific value fails review.
- [x] Review code + UX + source claims; fix findings before committing. Record self-review evidence; a failed page is not marked done.
- [x] Commit the reviewed batch on feature branch; fast-forward/integrate into main without force; push; await Vercel success; verify each changed production URL and primary HTML content.
- [x] Record deployment commit and production results; advance `nextBatch` only after passing. An interrupted session resumes the first incomplete batch.

## Task 5 — Final whole-site acceptance

- [x] All 128 active ledger records have a concrete enhancement and passing checks; no pending/blocked/merely queued pages count.
- [x] Rebuild and crawl all 150 production URLs: HTTP 200, one H1, unchanged title/canonical and indexability, visual first paint, working internal links/assets. Require the new intent module on the 128 active pages only; require unchanged content and rendering on the 22 protected Paladin pages.
- [x] Validate the nine calculators' edit/reset/load/share flows; shared query URLs remain noindex. No double-counted analytics from static rendering.
- [x] Verify main equals deployed commit; full CI and local required checks green.
- [x] Confirm sitemap has the same 150 canonical URLs, truthful per-page lastmod, no shared URLs/withheld Mage pages.
- [x] GSC MCP: call list_properties, submit `https://buildforgetools.com/sitemap.xml` for `sc-domain:buildforgetools.com`, then read status. Record submission time and pending state honestly.
- [x] Deliver main commit(s), 128-page upgrade result plus 22-page protection result, representative page links, screenshots and any explicit data limitations. Do not imply Google has already reindexed them.

## Batch schedule — 128 active URLs, each exactly once

### B01 — 7 pages

- [x] `/wow-forever-warrior-builds` — warrior / buildsHub
- [x] `/wow-forever-fury-warrior-build` — warrior / specBuild
- [x] `/wow-forever-fury-warrior-leveling-build` — warrior / specLeveling
- [x] `/wow-forever-arms-warrior-pvp-build` — warrior / specPvp
- [x] `/wow-forever-protection-warrior-dungeon-build` — warrior / specDungeon
- [x] `/wow-forever-warrior-talents` — warrior / talents
- [x] `/wow-forever-arms-vs-fury-warrior-leveling` — warrior / comparison

### B02 — 7 pages

- [x] `/warrior` — warrior / calculator
- [x] `/wow-forever-warrior-leveling-build` — warrior / leveling
- [x] `/wow-forever-arms-warrior-build` — warrior / specBuild
- [x] `/wow-forever-protection-warrior-build` — warrior / specBuild
- [x] `/wow-forever-arms-warrior-leveling-build` — warrior / specLeveling
- [x] `/wow-forever-protection-warrior-leveling-build` — warrior / specLeveling
- [x] `/wow-forever-warrior-pvp-build` — warrior / pvp

### B03 — 7 pages

- [x] `/wow-forever-fury-warrior-pvp-build` — warrior / specPvp
- [x] `/wow-forever-protection-warrior-pvp-build` — warrior / specPvp
- [x] `/wow-forever-warrior-dungeon-build` — warrior / dungeon
- [x] `/wow-forever-warrior-level-20-build` — warrior / levelCap
- [x] `/wow-forever-arms-warrior-talents` — warrior / specTalents
- [x] `/wow-forever-protection-warrior-talents` — warrior / specTalents
- [x] `/mage` — mage / calculator

### B04 — 7 pages

- [x] `/wow-forever-mage-builds` — mage / buildsHub
- [x] `/wow-forever-mage-talents` — mage / talents
- [x] `/wow-forever-mage-leveling-build` — mage / leveling
- [x] `/wow-forever-frost-mage-build` — mage / specBuild
- [x] `/wow-forever-arcane-mage-build` — mage / specBuild
- [x] `/wow-forever-frost-mage-leveling-build` — mage / specLeveling
- [x] `/wow-forever-arcane-mage-leveling-build` — mage / specLeveling

### B05 — 7 pages

- [x] `/wow-forever-frost-mage-aoe-build` — mage / aoe
- [x] `/wow-forever-mage-dungeon-build` — mage / dungeon
- [x] `/wow-forever-mage-level-20-build` — mage / levelCap
- [x] `/rogue` — rogue / calculator
- [x] `/wow-forever-rogue-builds` — rogue / buildsHub
- [x] `/wow-forever-rogue-talents` — rogue / talents
- [x] `/wow-forever-rogue-leveling-build` — rogue / leveling

### B06 — 7 pages

- [x] `/wow-forever-assassination-rogue-build` — rogue / specBuild
- [x] `/wow-forever-assassination-rogue-leveling-build` — rogue / specLeveling
- [x] `/wow-forever-combat-rogue-build` — rogue / specBuild
- [x] `/wow-forever-combat-rogue-leveling-build` — rogue / specLeveling
- [x] `/wow-forever-subtlety-rogue-build` — rogue / specBuild
- [x] `/wow-forever-subtlety-rogue-leveling-build` — rogue / specLeveling
- [x] `/wow-forever-rogue-pvp-build` — rogue / pvp

### B07 — 7 pages

- [x] `/wow-forever-rogue-level-20-build` — rogue / levelCap
- [x] `/wow-forever-subtlety-rogue-pvp-build` — rogue / specPvp
- [x] `/wow-forever-combat-vs-assassination-rogue-leveling` — rogue / comparison
- [x] `/wow-forever-rogue-dungeon-build` — rogue / dungeon
- [x] `/hunter` — hunter / calculator
- [x] `/wow-forever-hunter-builds` — hunter / buildsHub
- [x] `/wow-forever-hunter-talents` — hunter / talents

### B08 — 7 pages

- [x] `/wow-forever-hunter-leveling-build` — hunter / leveling
- [x] `/wow-forever-beast-mastery-hunter-build` — hunter / specBuild
- [x] `/wow-forever-beast-mastery-hunter-leveling-build` — hunter / specLeveling
- [x] `/wow-forever-marksmanship-hunter-build` — hunter / specBuild
- [x] `/wow-forever-marksmanship-hunter-leveling-build` — hunter / specLeveling
- [x] `/wow-forever-survival-hunter-build` — hunter / specBuild
- [x] `/wow-forever-survival-hunter-leveling-build` — hunter / specLeveling

### B09 — 7 pages

- [x] `/wow-forever-hunter-pvp-build` — hunter / pvp
- [x] `/wow-forever-hunter-level-20-build` — hunter / levelCap
- [x] `/wow-forever-hunter-pet-build` — hunter / pet
- [x] `/wow-forever-beast-mastery-vs-marksmanship-hunter-leveling` — hunter / comparison
- [x] `/wow-forever-hunter-dungeon-build` — hunter / dungeon
- [x] `/warlock` — warlock / calculator
- [x] `/wow-forever-warlock-builds` — warlock / buildsHub

### B10 — 7 pages

- [x] `/wow-forever-warlock-talents` — warlock / talents
- [x] `/wow-forever-warlock-leveling-build` — warlock / leveling
- [x] `/wow-forever-affliction-warlock-build` — warlock / specBuild
- [x] `/wow-forever-affliction-warlock-leveling-build` — warlock / specLeveling
- [x] `/wow-forever-demonology-warlock-build` — warlock / specBuild
- [x] `/wow-forever-demonology-warlock-leveling-build` — warlock / specLeveling
- [x] `/wow-forever-destruction-warlock-build` — warlock / specBuild

### B11 — 7 pages

- [x] `/wow-forever-destruction-warlock-leveling-build` — warlock / specLeveling
- [x] `/wow-forever-warlock-pvp-build` — warlock / pvp
- [x] `/wow-forever-warlock-level-20-build` — warlock / levelCap
- [x] `/wow-forever-warlock-pet-build` — warlock / pet
- [x] `/wow-forever-affliction-vs-demonology-warlock-leveling` — warlock / comparison
- [x] `/wow-forever-warlock-dungeon-build` — warlock / dungeon
- [x] `/priest` — priest / calculator

### B12 — 7 pages

- [x] `/wow-forever-priest-builds` — priest / buildsHub
- [x] `/wow-forever-priest-talents` — priest / talents
- [x] `/wow-forever-priest-leveling-build` — priest / leveling
- [x] `/wow-forever-discipline-priest-build` — priest / specBuild
- [x] `/wow-forever-discipline-priest-leveling-build` — priest / specLeveling
- [x] `/wow-forever-holy-priest-build` — priest / specBuild
- [x] `/wow-forever-holy-priest-leveling-build` — priest / specLeveling

### B13 — 7 pages

- [x] `/wow-forever-shadow-priest-build` — priest / specBuild
- [x] `/wow-forever-shadow-priest-leveling-build` — priest / specLeveling
- [x] `/wow-forever-priest-pvp-build` — priest / pvp
- [x] `/wow-forever-priest-level-20-build` — priest / levelCap
- [x] `/wow-forever-priest-healing-build` — priest / healing
- [x] `/wow-forever-holy-priest-dungeon-build` — priest / specDungeon
- [x] `/wow-forever-shadow-vs-discipline-priest-leveling` — priest / comparison

### B14 — 7 pages

- [x] `/druid` — druid / calculator
- [x] `/wow-forever-druid-builds` — druid / buildsHub
- [x] `/wow-forever-druid-talents` — druid / talents
- [x] `/wow-forever-druid-leveling-build` — druid / leveling
- [x] `/wow-forever-balance-druid-build` — druid / specBuild
- [x] `/wow-forever-balance-druid-leveling-build` — druid / specLeveling
- [x] `/wow-forever-feral-druid-build` — druid / specBuild

### B15 — 7 pages

- [x] `/wow-forever-feral-druid-leveling-build` — druid / specLeveling
- [x] `/wow-forever-restoration-druid-build` — druid / specBuild
- [x] `/wow-forever-restoration-druid-leveling-build` — druid / specLeveling
- [x] `/wow-forever-druid-pvp-build` — druid / pvp
- [x] `/wow-forever-druid-level-20-build` — druid / levelCap
- [x] `/wow-forever-feral-druid-tank-build` — druid / tank
- [x] `/wow-forever-restoration-druid-healing-build` — druid / healing

### B16 — 7 pages

- [x] `/wow-forever-balance-vs-feral-druid-leveling` — druid / comparison
- [x] `/shaman` — shaman / calculator
- [x] `/wow-forever-shaman-builds` — shaman / buildsHub
- [x] `/wow-forever-shaman-talents` — shaman / talents
- [x] `/wow-forever-shaman-leveling-build` — shaman / leveling
- [x] `/wow-forever-elemental-shaman-build` — shaman / specBuild
- [x] `/wow-forever-elemental-shaman-leveling-build` — shaman / specLeveling

### B17 — 7 pages

- [x] `/wow-forever-enhancement-shaman-build` — shaman / specBuild
- [x] `/wow-forever-enhancement-shaman-leveling-build` — shaman / specLeveling
- [x] `/wow-forever-restoration-shaman-build` — shaman / specBuild
- [x] `/wow-forever-restoration-shaman-leveling-build` — shaman / specLeveling
- [x] `/wow-forever-shaman-pvp-build` — shaman / pvp
- [x] `/wow-forever-shaman-level-20-build` — shaman / levelCap
- [x] `/wow-forever-shaman-totem-build` — shaman / totem

### B18 — 7 pages

- [x] `/wow-forever-elemental-vs-enhancement-shaman-leveling` — shaman / comparison
- [x] `/wow-forever-restoration-shaman-healing-build` — shaman / healing
- [x] `/emberville` — emberville / emberville
- [x] `/emberville-builds` — emberville / emberville
- [x] `/emberville-classes` — emberville / emberville
- [x] `/emberville-skill-inheritance` — emberville / emberville
- [x] `/about` — site / trust

### B19 — 2 pages

- [x] `/contact` — site / trust
- [x] `/privacy` — site / trust

## Frozen Paladin scope — verify, do not redesign

- `/paladin`
- `/wow-forever-paladin-builds`
- `/wow-forever-paladin-talents`
- `/wow-forever-paladin-build`
- `/wow-forever-protection-paladin-build`
- `/wow-forever-retribution-paladin-build`
- `/wow-forever-retribution-paladin-leveling-build`
- `/wow-forever-paladin-leveling-build`
- `/wow-forever-paladin-pvp-build`
- `/wow-forever-paladin-raid-build`
- `/wow-forever-protection-paladin-dungeon-build`
- `/wow-forever-retribution-paladin-builds`
- `/wow-forever-protection-paladin-builds`
- `/wow-forever-protection-paladin-leveling-build`
- `/wow-forever-protection-paladin-pvp-build`
- `/wow-forever-retribution-paladin-pvp-build`
- `/wow-forever-holy-paladin-pvp-build`
- `/wow-forever-holy-paladin-talents`
- `/wow-forever-retribution-paladin-talents`
- `/wow-forever-protection-paladin-talents`
- `/wow-forever-paladin-beta-talent-changes`
- `/wow-forever-paladin-abilities`

## Recovery
Resume first incomplete active batch. No page is complete before tests, desktop/mobile inspection and production checks pass. Preserve already reviewed commits; never force-push main. Final sitemap submission covers all 150 canonical URLs but only changed non-Paladin lastmod values advance.
