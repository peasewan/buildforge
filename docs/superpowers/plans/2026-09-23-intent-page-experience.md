# Intent Page Experience Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Track steps with checkboxes and use the rollout ledger to resume.

**Goal:** Upgrade and self-verify all 150 existing production URLs in batches of at most seven, then submit the production sitemap to GSC.

**Architecture:** Retain ClassDefinition and existing route metadata. Add small intent components driven by reviewed existing data, gated by an explicit pathname allowlist. Shared visual server rendering and client rendering use the same enabled composition. Legacy Paladin, Emberville and trust pages get scoped enhancements via their existing components/adapters; do not force them into a new class database.

**Tech Stack:** React, TypeScript, Vite, Vitest, existing CSS/Lucide, GitHub/Vercel, GSC MCP.

**Spec:** `docs/superpowers/specs/2026-09-23-intent-page-experience.md`

## Global constraints

Use the complete approved spec above. The user has authorized main pushes, production deployment and GSC submission. The paused Beta watcher stays paused. Do not wait for another approval between batches. No claimed ranking gains or invented data. This plan covers exactly the baseline 150 sitemap URLs, not the four withheld Mage definitions.

## Files and ownership

- `src/experiences/buildExperience.ts`: pure per-point progression, legal-prefix validation, exact build differences, editorial usage lookup; tests in `buildExperience.test.ts`.
- `src/experiences/ClassIntentExperience.tsx`: interactive composition selected by page kind; tests in `ClassIntentExperience.test.tsx`.
- `src/experiences/experience.css`: namespaced layout responsive to task and viewport; never style disabled pages.
- `src/experiences/rollout.ts`: explicit list of reviewed and enabled paths. Batches add at most seven.
- `src/ClassDocumentPage.tsx`, `src/ClassCalculatorPage.tsx`: integrate enabled composition while keeping old rendering for inactive paths.
- Legacy page components and `src/experiences/LegacyIntentExperience.tsx`: Paladin/Emberville/trust-specific improvements with existing data.
- `scripts/check-intent-rollout.ts`: sitemap/ledger coverage, enabled set, per-page static content/metadata/link checks; not a word-count or similarity ranking score.
- `docs/intent-page-rollout.json`: 150 path records, batch, status, specific change, checks, commit and production result.
- `docs/intent-page-release-log.md`: per-batch review/rulings and evidence. Never mark deployed before the production check.

## Task 1 — Inventory and baseline (before B01)

- [ ] Confirm working tree and main head, create `intent-page-experience` worktree; preserve other work.
- [ ] Reconcile the 150 JSON ledger paths exactly against `public/sitemap.xml`, no duplicates.
- [ ] Record title/canonical/robots and local screenshot baseline for the seven Warrior pilots; record key deep links.
- [ ] Run baseline/focused tests and inspect point order in Warrior and Mage. Build records can share allocations; record this, do not change ranks to make them unique.

## Task 2 — Testable data operations (ships with B01, inactive elsewhere)

- [ ] Write failing tests for progression at levels 10/15/20, invalid prerequisites, unknown IDs, point caps, exact end allocation, and identical-build diff.
- [ ] Implement `progressionForBuild(classDef, build)` returning reviewed/derived legal point steps with cumulative allocations; no source array mutation. If no legal next step, return an explicit unavailable reason, not a silently reordered claim.
- [ ] Implement `diffBuilds(classDef, left, right)` returning talent identity/name and left/right rank; identical routes yield no differences and an explicit UI message.
- [ ] Test deep-link encoding/decoding for every milestone and all published class builds using the existing planner codec.
- [ ] Review pure functions independently before integrating UI.

## Task 3 — Seven pilot compositions (B01)

- [ ] Build view: allocation/selected talents and actual alternative route comparison near the title.
- [ ] Leveling view: numeric/range level input, current budget, exact cumulative allocation, next point, milestones, load-current-step deep link. At endpoint say route complete; no fictional next talent.
- [ ] Comparison view: independent build selectors, allocation columns, rank-difference table and both calculator links. Do not hide an identical result.
- [ ] PvP view: spec selection, existing authored role/playstyle/trade-off, link and compare to the published spec baseline. No subjective power bars or fabricated counters.
- [ ] Dungeon view: role board, selected tools with available descriptions and sources, existing authored preparation/testing notes, baseline comparison. No invented rotation or equipment recommendations.
- [ ] Talents view: name/branch filter, real per-rank description where present, prerequisites and separate assumed rank label, published editorial builds using each node.
- [ ] Hub view: purpose navigation plus branches/roles; make primary choices prominent instead of one long repeated article.
- [ ] Add real behavior tests (input changes budget/next point/link, selectors change diff, filters change records). Empty/missing fields remain explicit.
- [ ] Wire pathname-gated compositions into shared renderer. Keep global CSS and non-enabled markup unchanged.

## Task 4 — Apply subsequent batches B02–B22

For every batch in the exact URL schedule below:

- [ ] Re-read each page's own data/content, resolve intent and supported unique task; record concrete changes per URL in the ledger before marking ready.
- [ ] Add only the batch paths to the allowlist. Author role-specific notes from existing evidence; retain disclaimers for incomplete sources.
- [ ] Reuse approved components but test every page's actual data. If a new page family appears (cap, AoE, pet, totem, healing, trust), add its own purposeful module and tests before enabling.
- [ ] For old Paladin pages, adapt current preset/path data without renaming talent IDs, changing saved-link codecs, or replacing its calculator.
- [ ] For calculators, keep tree interaction primary and add useful preset/spec navigation. For Emberville, focus direction choice, system comparison or inheritance flow with unknown records still disabled. Trust pages get accessible local navigation and clear actions without fabricated contacts.
- [ ] Run this batch's meaningful data/UI tests, complete typecheck/lint/build and static audit. Run full suite whenever shared logic changes; carry earlier-page regression fixtures forward.
- [ ] Open every batch page at desktop 1440 and mobile 390; inspect screenshots, overflow and primary action. Compare seven pilot screenshots as a set; confirm no text-first flash on normal navigation or script-free first paint.
- [ ] Check indexability, canonical/title preservation, exact sitemap URL membership, crawlable internal links, no orphan/withheld destinations. Warning on duplicate allocation is allowed; missing page-specific value fails review.
- [ ] Review code + UX + source claims; fix findings before committing. Record self-review evidence; a failed page is not marked done.
- [ ] Commit the reviewed batch on feature branch; fast-forward/integrate into main without force; push; await Vercel success; verify each changed production URL and primary HTML content.
- [ ] Record deployment commit and production results; advance `nextBatch` only after passing. An interrupted session resumes the first incomplete batch.

## Task 5 — Final whole-site acceptance

- [ ] All 150 ledger records have a concrete enhancement and passing checks; no pending/blocked/merely queued pages count.
- [ ] Rebuild and crawl all 150 production URLs: HTTP 200, one H1, correct unchanged title/canonical, index/follow, visual first paint, supported primary module, working internal links/assets.
- [ ] Validate the nine calculators' edit/reset/load/share flows; shared query URLs remain noindex. No double-counted analytics from static rendering.
- [ ] Verify main equals deployed commit; full CI and local required checks green.
- [ ] Confirm sitemap has the same 150 canonical URLs, truthful per-page lastmod, no shared URLs/withheld Mage pages.
- [ ] GSC MCP: call list_properties, submit `https://buildforgetools.com/sitemap.xml` for `sc-domain:buildforgetools.com`, then read status. Record submission time and pending state honestly.
- [ ] Deliver main commit(s), 150-page result, representative page links, screenshots and any explicit data limitations. Do not imply Google has already reindexed them.

## Batch schedule — each URL exactly once

### B01 — 7 pages

- [ ] `/wow-forever-warrior-builds` — warrior / buildsHub
- [ ] `/wow-forever-fury-warrior-build` — warrior / specBuild
- [ ] `/wow-forever-fury-warrior-leveling-build` — warrior / specLeveling
- [ ] `/wow-forever-arms-warrior-pvp-build` — warrior / specPvp
- [ ] `/wow-forever-protection-warrior-dungeon-build` — warrior / specDungeon
- [ ] `/wow-forever-warrior-talents` — warrior / talents
- [ ] `/wow-forever-arms-vs-fury-warrior-leveling` — warrior / comparison

### B02 — 7 pages

- [ ] `/warrior` — warrior / calculator
- [ ] `/wow-forever-warrior-leveling-build` — warrior / leveling
- [ ] `/wow-forever-arms-warrior-build` — warrior / specBuild
- [ ] `/wow-forever-protection-warrior-build` — warrior / specBuild
- [ ] `/wow-forever-arms-warrior-leveling-build` — warrior / specLeveling
- [ ] `/wow-forever-protection-warrior-leveling-build` — warrior / specLeveling
- [ ] `/wow-forever-warrior-pvp-build` — warrior / pvp

### B03 — 7 pages

- [ ] `/wow-forever-fury-warrior-pvp-build` — warrior / specPvp
- [ ] `/wow-forever-protection-warrior-pvp-build` — warrior / specPvp
- [ ] `/wow-forever-warrior-dungeon-build` — warrior / dungeon
- [ ] `/wow-forever-warrior-level-20-build` — warrior / levelCap
- [ ] `/wow-forever-arms-warrior-talents` — warrior / specTalents
- [ ] `/wow-forever-protection-warrior-talents` — warrior / specTalents
- [ ] `/mage` — mage / calculator

### B04 — 7 pages

- [ ] `/wow-forever-mage-builds` — mage / buildsHub
- [ ] `/wow-forever-mage-talents` — mage / talents
- [ ] `/wow-forever-mage-leveling-build` — mage / leveling
- [ ] `/wow-forever-frost-mage-build` — mage / specBuild
- [ ] `/wow-forever-arcane-mage-build` — mage / specBuild
- [ ] `/wow-forever-frost-mage-leveling-build` — mage / specLeveling
- [ ] `/wow-forever-arcane-mage-leveling-build` — mage / specLeveling

### B05 — 7 pages

- [ ] `/wow-forever-frost-mage-aoe-build` — mage / aoe
- [ ] `/wow-forever-mage-dungeon-build` — mage / dungeon
- [ ] `/wow-forever-mage-level-20-build` — mage / levelCap
- [ ] `/paladin` — paladin / planner
- [ ] `/wow-forever-paladin-builds` — paladin / build-hub
- [ ] `/wow-forever-paladin-talents` — paladin / guide
- [ ] `/wow-forever-paladin-build` — paladin / build-guide

### B06 — 7 pages

- [ ] `/wow-forever-protection-paladin-build` — paladin / build-guide
- [ ] `/wow-forever-retribution-paladin-build` — paladin / build-guide
- [ ] `/wow-forever-retribution-paladin-leveling-build` — paladin / build-guide
- [ ] `/wow-forever-paladin-leveling-build` — paladin / build-landing
- [ ] `/wow-forever-paladin-pvp-build` — paladin / build-landing
- [ ] `/wow-forever-paladin-raid-build` — paladin / build-landing
- [ ] `/wow-forever-protection-paladin-dungeon-build` — paladin / build-landing

### B07 — 7 pages

- [ ] `/wow-forever-retribution-paladin-builds` — paladin / spec-hub
- [ ] `/wow-forever-protection-paladin-builds` — paladin / spec-hub
- [ ] `/wow-forever-protection-paladin-leveling-build` — paladin / build-landing
- [ ] `/wow-forever-protection-paladin-pvp-build` — paladin / build-landing
- [ ] `/wow-forever-retribution-paladin-pvp-build` — paladin / build-landing
- [ ] `/wow-forever-holy-paladin-pvp-build` — paladin / build-landing
- [ ] `/wow-forever-holy-paladin-talents` — paladin / spec-talents

### B08 — 7 pages

- [ ] `/wow-forever-retribution-paladin-talents` — paladin / spec-talents
- [ ] `/wow-forever-protection-paladin-talents` — paladin / spec-talents
- [ ] `/wow-forever-paladin-beta-talent-changes` — paladin / beta-changes
- [ ] `/wow-forever-paladin-abilities` — paladin / spellbook
- [ ] `/rogue` — rogue / calculator
- [ ] `/wow-forever-rogue-builds` — rogue / buildsHub
- [ ] `/wow-forever-rogue-talents` — rogue / talents

### B09 — 7 pages

- [ ] `/wow-forever-rogue-leveling-build` — rogue / leveling
- [ ] `/wow-forever-assassination-rogue-build` — rogue / specBuild
- [ ] `/wow-forever-assassination-rogue-leveling-build` — rogue / specLeveling
- [ ] `/wow-forever-combat-rogue-build` — rogue / specBuild
- [ ] `/wow-forever-combat-rogue-leveling-build` — rogue / specLeveling
- [ ] `/wow-forever-subtlety-rogue-build` — rogue / specBuild
- [ ] `/wow-forever-subtlety-rogue-leveling-build` — rogue / specLeveling

### B10 — 7 pages

- [ ] `/wow-forever-rogue-pvp-build` — rogue / pvp
- [ ] `/wow-forever-rogue-level-20-build` — rogue / levelCap
- [ ] `/wow-forever-subtlety-rogue-pvp-build` — rogue / specPvp
- [ ] `/wow-forever-combat-vs-assassination-rogue-leveling` — rogue / comparison
- [ ] `/wow-forever-rogue-dungeon-build` — rogue / dungeon
- [ ] `/hunter` — hunter / calculator
- [ ] `/wow-forever-hunter-builds` — hunter / buildsHub

### B11 — 7 pages

- [ ] `/wow-forever-hunter-talents` — hunter / talents
- [ ] `/wow-forever-hunter-leveling-build` — hunter / leveling
- [ ] `/wow-forever-beast-mastery-hunter-build` — hunter / specBuild
- [ ] `/wow-forever-beast-mastery-hunter-leveling-build` — hunter / specLeveling
- [ ] `/wow-forever-marksmanship-hunter-build` — hunter / specBuild
- [ ] `/wow-forever-marksmanship-hunter-leveling-build` — hunter / specLeveling
- [ ] `/wow-forever-survival-hunter-build` — hunter / specBuild

### B12 — 7 pages

- [ ] `/wow-forever-survival-hunter-leveling-build` — hunter / specLeveling
- [ ] `/wow-forever-hunter-pvp-build` — hunter / pvp
- [ ] `/wow-forever-hunter-level-20-build` — hunter / levelCap
- [ ] `/wow-forever-hunter-pet-build` — hunter / pet
- [ ] `/wow-forever-beast-mastery-vs-marksmanship-hunter-leveling` — hunter / comparison
- [ ] `/wow-forever-hunter-dungeon-build` — hunter / dungeon
- [ ] `/warlock` — warlock / calculator

### B13 — 7 pages

- [ ] `/wow-forever-warlock-builds` — warlock / buildsHub
- [ ] `/wow-forever-warlock-talents` — warlock / talents
- [ ] `/wow-forever-warlock-leveling-build` — warlock / leveling
- [ ] `/wow-forever-affliction-warlock-build` — warlock / specBuild
- [ ] `/wow-forever-affliction-warlock-leveling-build` — warlock / specLeveling
- [ ] `/wow-forever-demonology-warlock-build` — warlock / specBuild
- [ ] `/wow-forever-demonology-warlock-leveling-build` — warlock / specLeveling

### B14 — 7 pages

- [ ] `/wow-forever-destruction-warlock-build` — warlock / specBuild
- [ ] `/wow-forever-destruction-warlock-leveling-build` — warlock / specLeveling
- [ ] `/wow-forever-warlock-pvp-build` — warlock / pvp
- [ ] `/wow-forever-warlock-level-20-build` — warlock / levelCap
- [ ] `/wow-forever-warlock-pet-build` — warlock / pet
- [ ] `/wow-forever-affliction-vs-demonology-warlock-leveling` — warlock / comparison
- [ ] `/wow-forever-warlock-dungeon-build` — warlock / dungeon

### B15 — 7 pages

- [ ] `/priest` — priest / calculator
- [ ] `/wow-forever-priest-builds` — priest / buildsHub
- [ ] `/wow-forever-priest-talents` — priest / talents
- [ ] `/wow-forever-priest-leveling-build` — priest / leveling
- [ ] `/wow-forever-discipline-priest-build` — priest / specBuild
- [ ] `/wow-forever-discipline-priest-leveling-build` — priest / specLeveling
- [ ] `/wow-forever-holy-priest-build` — priest / specBuild

### B16 — 7 pages

- [ ] `/wow-forever-holy-priest-leveling-build` — priest / specLeveling
- [ ] `/wow-forever-shadow-priest-build` — priest / specBuild
- [ ] `/wow-forever-shadow-priest-leveling-build` — priest / specLeveling
- [ ] `/wow-forever-priest-pvp-build` — priest / pvp
- [ ] `/wow-forever-priest-level-20-build` — priest / levelCap
- [ ] `/wow-forever-priest-healing-build` — priest / healing
- [ ] `/wow-forever-holy-priest-dungeon-build` — priest / specDungeon

### B17 — 7 pages

- [ ] `/wow-forever-shadow-vs-discipline-priest-leveling` — priest / comparison
- [ ] `/druid` — druid / calculator
- [ ] `/wow-forever-druid-builds` — druid / buildsHub
- [ ] `/wow-forever-druid-talents` — druid / talents
- [ ] `/wow-forever-druid-leveling-build` — druid / leveling
- [ ] `/wow-forever-balance-druid-build` — druid / specBuild
- [ ] `/wow-forever-balance-druid-leveling-build` — druid / specLeveling

### B18 — 7 pages

- [ ] `/wow-forever-feral-druid-build` — druid / specBuild
- [ ] `/wow-forever-feral-druid-leveling-build` — druid / specLeveling
- [ ] `/wow-forever-restoration-druid-build` — druid / specBuild
- [ ] `/wow-forever-restoration-druid-leveling-build` — druid / specLeveling
- [ ] `/wow-forever-druid-pvp-build` — druid / pvp
- [ ] `/wow-forever-druid-level-20-build` — druid / levelCap
- [ ] `/wow-forever-feral-druid-tank-build` — druid / tank

### B19 — 7 pages

- [ ] `/wow-forever-restoration-druid-healing-build` — druid / healing
- [ ] `/wow-forever-balance-vs-feral-druid-leveling` — druid / comparison
- [ ] `/shaman` — shaman / calculator
- [ ] `/wow-forever-shaman-builds` — shaman / buildsHub
- [ ] `/wow-forever-shaman-talents` — shaman / talents
- [ ] `/wow-forever-shaman-leveling-build` — shaman / leveling
- [ ] `/wow-forever-elemental-shaman-build` — shaman / specBuild

### B20 — 7 pages

- [ ] `/wow-forever-elemental-shaman-leveling-build` — shaman / specLeveling
- [ ] `/wow-forever-enhancement-shaman-build` — shaman / specBuild
- [ ] `/wow-forever-enhancement-shaman-leveling-build` — shaman / specLeveling
- [ ] `/wow-forever-restoration-shaman-build` — shaman / specBuild
- [ ] `/wow-forever-restoration-shaman-leveling-build` — shaman / specLeveling
- [ ] `/wow-forever-shaman-pvp-build` — shaman / pvp
- [ ] `/wow-forever-shaman-level-20-build` — shaman / levelCap

### B21 — 7 pages

- [ ] `/wow-forever-shaman-totem-build` — shaman / totem
- [ ] `/wow-forever-elemental-vs-enhancement-shaman-leveling` — shaman / comparison
- [ ] `/wow-forever-restoration-shaman-healing-build` — shaman / healing
- [ ] `/emberville` — emberville / emberville
- [ ] `/emberville-builds` — emberville / emberville
- [ ] `/emberville-classes` — emberville / emberville
- [ ] `/emberville-skill-inheritance` — emberville / emberville

### B22 — 3 pages

- [ ] `/about` — site / trust
- [ ] `/contact` — site / trust
- [ ] `/privacy` — site / trust

## Completion and recovery rules

A batch is complete only after implementation + data tests + desktop/mobile inspection + SEO invariants + successful production verification. Do not use percentage progress as a substitute for page records. Source limitations affect claims, not permission to fabricate missing game facts. If network/deployment fails, retain the reviewed commit and retry safely; do not mark online. Revert a faulty batch rather than hiding content, changing canonicals, or loosening evidence gates. The original 150 URL inventory remains fixed unless the user changes scope.
