# Beta Data Publishing Implementation Plan

**Goal:** Add an internal Paladin spellbook store, publishable Beta-change drafts, reusable evidence labels, a safe watcher simulation, and a repeatable analytics report without changing indexed routes or SEO metadata.

**Architecture:** Keep raw spellbook input separate from normalized records, and expose pure import, validation, and query functions. Convert talent diffs into a structured draft model that both scripts and UI can consume. Treat verification labels as a shared presentation layer, and exercise the release pipeline entirely in memory so simulations cannot write production datasets.

**Tech Stack:** TypeScript, React, Vitest, tsx, Vite.

**Global Constraints:** No public Spellbook route. Do not change titles, URLs, canonicals, navigation, sitemap entries, or existing redirect behavior. Never promote simulated or incomplete data.

## Task 1: Spellbook data layer

- Add schema, importer, validator, query helpers, and a build-tagged raw Paladin manifest.
- Test stable normalization, duplicate rejection, incomplete records, category/name queries, source preservation, and the reviewed 45-entry count.
- Add CLI validation/query commands and CI validation.

## Task 2: Beta Changes draft model

- Convert `TalentDiff` into explicit `added`, `removed`, `moved`, `rank_changed`, `tooltip_changed`, and `prerequisite_changed` entries.
- Preserve build metadata and evidence status in the draft.
- Add JSON CLI output and tests for every category.

## Task 3: Verification UI

- Add a reusable badge and evidence legend for `official`, `client_datamined`, `client_verified`, `community_verified`, and `derived_assumption`.
- Reuse it in the calculator and Beta Changes UI without altering page metadata or structure.
- Add component tests and accessible labels.

## Task 4: Watcher simulation

- Simulate build `1.60.1.69900` in memory.
- Prove valid data produces a diff, invalid data is blocked, and protected SEO files remain byte-identical.
- Add the simulation command to CI.

## Task 5: Analytics report template

- Define the daily input schema and deterministic Markdown renderer.
- Cover GSC totals, top queries/pages, GA organic engagement, and product events.
- Add a CLI template command, documentation, and tests.

## Verification

- Run spellbook validation, talent validation, talent diff draft generation, watcher simulation, typecheck, lint, all tests, and production build.
- Confirm `vercel.json`, `public/sitemap.xml`, route metadata, and canonical behavior are unchanged.
