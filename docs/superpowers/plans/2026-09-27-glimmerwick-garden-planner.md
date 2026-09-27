# Glimmerwick Garden Planner Implementation Plan

> **For agentic workers:** Use the agreed parallel implementation with independently owned files, then review the whole branch.

**Goal:** Publish a usable, source-linked garden planning tool for Songs of Glimmerwick.

**Architecture:** Pure versioned calculation/CSV functions support a React planner. A standalone page owns its forest/parchment styles and official references. Existing route and static-build infrastructure discovers one new URL.

**Tech Stack:** Existing React, TypeScript, Vite, Vitest, Lucide and Vercel; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-27-glimmerwick-garden-planner.md`

## Tasks

- [x] Data functions and tests: valid/corrupt plans, bounds, sorting, day arithmetic, CSV quotation/formula injection.
- [x] Interactive planner and tests: add/edit/remove, current day, persistence, unavailable storage, export, anonymous analytics.
- [x] Page and official references: clear user-input estimates, no unsupported numeric game data, responsive layout.
- [x] Route/static integration and tests: HTML entry, metadata, prerender, rewrite, sitemap, homepage entry and SEO primary-module requirement.
- [x] Whole-branch review and verification: 1,043 tests, lint, production build, 153/153 SEO gate, desktop/390px/320px browser smoke tests.
- [ ] Rebase on current main, resolve any concurrent changes, rerun affected checks, merge/push, verify Vercel and live page.
