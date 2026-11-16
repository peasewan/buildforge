# Paladin Current Evidence and Intent Cleanup Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the independent entry-point and consolidation tasks. Root integrates and independently verifies the complete release.

**Goal:** Make the retained Paladin resources honest about launch versus imported Beta evidence, remove one duplicate leveling entry, and make useful existing comparison/PvP tools easier to reach.

**Architecture:** Reuse the current calculator, versioned dataset pipeline, shared status components, retirement resolver and discovery layout. Preserve existing indexed metadata except the deliberately retired Ret Leveling endpoint; preserve saved allocations and share URLs. A new client number alone never promotes a dataset.

**Tech Stack:** React, TypeScript, Vite, Vitest, existing static/prerender and Vercel pipelines.

**Approved design:** The November 16 in-chat review and the owner's instruction to implement it; Protection Hub and the detailed Protection Build remain separate task entries.

## Global Constraints

- Never invent coordinates, ranks, prerequisite ranks, tooltips or launch verification.
- Preserve current and historical stable share identifiers; inferred prerequisite ranks remain derived_assumption.
- Keep all existing discovery tools and independent agents' changes.
- No new indexable routes, database rollout, languages, watcher restart or AdSense application.
- Private analytics evidence stays outside the public repository.
- Do not regenerate frozen SEO baselines. Add narrow approved body/link amendments only for deliberately changed retained pages.

## Review Focus

- Old 69913/70245 allocations must not silently become a different launch allocation.
- Permanent retirement preserves query strings and meaningful legacy fragments, without a redirect chain.
- A dated Beta cap must never be described as the current live cap.
- Discovery links must lead to published tasks and not make unsupported popularity or performance claims.
- Static HTML and hydrated UI must agree on data scope and retirement behavior.

## Task 1: Review launch client evidence and state the actual tool scope

- [x] Acquire the exact candidate client tables and licensed resolved rank export; retain hashes, versions and source status.
- [x] Run the importer/validator and structured rank-level diff in a candidate location without overwriting production.
- [x] Review every structural, rank-text and identity change. Promote only a complete candidate with tested historical share handling; otherwise keep the reviewed snapshot explicitly historical and expose separately reviewed launch guidance.
- [x] Update shared Paladin data-scope copy and current-cap claims in the existing calculator/guide components; data-review dates remain separate from editorial dates.
- [x] Add regression coverage for launch/snapshot distinction and saved build compatibility, run talent validators and pipeline simulation where relevant.

## Task 2: Consolidate Ret Leveling into the existing general leveling tool

- [x] Add regression cases for the retired route, preserved fragments/query strings and the historical 20/0/31 content.
- [x] Add HistoricalRetLevelingReference and embed it once in BuildLandingPage; keep the executable timeline once.
- [x] Retire /wow-forever-retribution-paladin-leveling-build permanently to /wow-forever-paladin-leveling-build, migrate unique explanations and anchors, flatten all internal links and remove the old sitemap/build entry.
- [x] Preserve the original ExampleBuild identity, selected ranks and historical share handling.
- [x] Keep both Protection routes, with the Hub selecting purpose/routes and the detailed Build explaining mechanics/evidence.
- [x] Run retirement, route, landing page, static artifact and internal-link regressions.

## Task 3: Expose existing useful search entry points

- [x] Add focused discovery tests in SiteDiscoveryPage.test.tsx.
- [x] Move the four comparison/PvP tasks above game cards on the homepage; reuse them in the WoW build hub.
- [x] Add direct calculator and nine-class directory actions, preserving existing Title/H1/canonical and every game section.
- [x] Run discovery tests and inspect responsive output.

## Release Verification

- [x] Run the complete test suite, typecheck, lint, content:audit/content:review and production build with strict SEO checks.
- [x] Review the complete diff independently, including redirect/metadata/artifact inventory and absence of private analytics.
- [ ] Integrate with the latest main without discarding unrelated work, rerun affected checks after integration, then push main.
- [ ] Wait for GitHub/Vercel completion and run smoke:production plus smoke:pruning; verify the retired endpoint, retained canonicals, data scope and primary tool/share behavior.

Verification before integration: 147 test files / 1,839 tests passed; typecheck, lint, talent validation, pipeline simulation and the complete production build passed. SEO checks cover 93 indexable pages with zero errors; one existing advisory similarity pair remains outside this scoped change. The browser preview channel timed out; functional and rendered-artifact checks were used.
