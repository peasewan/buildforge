# Emberville Evidence Planner Implementation Plan

> **For agentic workers:** Use independent data implementation and evidence research alongside local UI integration, then independently review the complete branch.

**Goal:** Upgrade the existing Emberville planner with source-backed records, conservative inheritance checks and reusable import/query/diff tooling.

**Architecture:** Strict fact schema and versioned dataset feed a catalog wrapper and the existing four-page React experience. Unknown facts remain null and combinations retain verification gaps.

**Tech Stack:** TypeScript, React, JSON, tsx, Vitest; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-27-emberville-evidence-planner.md`

## Global Constraints
- Preserve four URLs, SEO metadata, sitemap and all WoW page structure.
- Use only official/client_datamined/client_verified/community_verified/derived_assumption verification vocabulary.
- Do not invent game facts or auto-promote candidate data.
- Use a new worktree and publish verified work directly as authorized.

## Review Focus
- Unknown compatibility must not become a confirmed combination.
- A name's source must not verify an unrelated effect or required level.
- Malformed import must fail before output writes and production overwrites must fail.
- Local drafts from older versions or unavailable storage must not crash SSR or browser hydration.
- Analytics must not contain notes, and selection must not misreport a completed game build.

## Tasks
- [x] Data engine: write tests covering invalid facts, missing sources, duplicate/dangling IDs, unknown/false compatibility, slot limits, diffs and candidate import safety; observe failure, implement and run tests.
- [x] Reviewed catalog: research exact official/creator sources; store only supported record fields with reviewed date and stable IDs, leave unavailable skill/rule fields empty/null; validate production dataset.
- [x] UI: write failing integration tests for class selection/evidence/unknown inheritance, retained notes, persisted draft and storage errors; implement accessible controls and evidence reference views with existing visual styles.
- [x] Tooling: add `emberville:validate`, `emberville:query`, `emberville:diff`, `emberville:import` commands and usage documentation, verify on fixture candidates and reviewed dataset.
- [x] Verify: run complete tests, lint, typecheck, production build and SEO validator. Review visual desktop/mobile output and keyboard/control behavior; independently review the diff.
- [ ] Publish: commit and integrate main without discarding concurrent work; push, verify Vercel deployment, production four-page content and canonical tags; record commands and limitations in project memory.

## Verification record

- 77 test files / 1172 tests passed on the feature branch.
- Production build and full lint passed.
- SEO: 155/155 indexable pages, 155 sitemap entries, 22 frozen pages, zero errors; existing frozen Ret H1 duplication remains advisory.
- Chrome desktop/mobile: four routes return 200, canonical/title preserved, no horizontal overflow or JavaScript errors; draft save/restore/reset and Open Planner anchor passed.
- Independent review resolved client-source provenance and selected-skill removal; UI explicitly scopes confirmation to recorded inheritance evidence.

## Latest main integration

Preserved concurrent Nivalis commits `7fb595e` and `69f05f5`. Integration verification: 79 files / 1199 tests passed, full lint and production build passed, 156/156 SEO pages with zero errors and all 22 frozen pages intact. Four Emberville routes also passed Chrome desktop/mobile interaction checks after integration.
