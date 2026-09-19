# Emberville P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish four indexable Emberville pages with a source-controlled interactive preview planner and a distinct dark-fantasy visual system.

**Architecture:** Add a standalone typed Emberville content module and four route-driven React pages, sharing common shell, status, and related-link components. Extend the existing static metadata/prerender pipeline and sitemap without changing any WoW page definition.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Lucide React, static HTML prerendering, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-19-emberville-p0-design.md`

## Global Constraints

- Publish exactly `/emberville`, `/emberville-builds`, `/emberville-classes`, and `/emberville-skill-inheritance` as `index, follow`.
- Do not publish unverified class names, weapon names, skills, values, slot rules, compatibility rules, builds, or recommendations.
- Keep `/` redirecting to `/paladin` and do not change existing WoW URLs, titles, canonicals, or sitemap entries.
- Use only supplied artwork and Lucide UI icons.
- React and prerender output must consume the same Emberville content/source data.

---

### Task 1: Add verified Emberville data and assets

**Files:**
- Create: `src/data/emberville.ts`
- Create: `src/data/emberville.test.ts`
- Create: `public/images/emberville/planner-hero.png`
- Create: `public/images/emberville/builds-hero.png`
- Create: `public/images/emberville/classes-hero.png`
- Create: `public/images/emberville/inheritance-hero.png`
- Create: `public/images/emberville/inheritance-flow.png`

**Interfaces:**
- Produces: `EMBERVILLE_STATUS`, `EMBERVILLE_SOURCES`, `EMBERVILLE_MECHANICS`, `EMBERVILLE_PAGES`, and `embervillePageById(id)`.

- [ ] Write `src/data/emberville.test.ts` asserting the release date, four slugs, source URLs, confirmed mechanics, and absence of `Swordsman`, `Longsword`, invented skills, slot limits, or best-build claims.
- [ ] Run `npm test -- src/data/emberville.test.ts` and verify the module-missing failure.
- [ ] Copy the five supplied source artworks to the named asset paths without editing their pixels.
- [ ] Implement the typed data module with official Steam and Cygnus Cross sources and the exact four page records from the design.
- [ ] Run `npm test -- src/data/emberville.test.ts` and verify it passes.

### Task 2: Build the interactive Emberville planner and page system

**Files:**
- Create: `src/EmbervillePage.tsx`
- Create: `src/EmbervillePage.test.tsx`
- Create: `src/EmbervillePlanner.tsx`
- Create: `src/EmbervillePlanner.test.tsx`
- Create: `src/EmbervilleShell.tsx`
- Create: `src/emberville.css`

**Interfaces:**
- Consumes: Emberville data exports from Task 1.
- Produces: `<EmbervillePage pageId>` for all four public routes and `<EmbervillePlanner>` for the interactive `/emberville` surface.

- [ ] Write page tests that render all four page IDs and assert one H1, status/source labels, required related links, and no invented entity names.
- [ ] Write planner tests that assert disabled class/weapon selectors, confirmed style choices, summary updates, 500-character notes, local-storage restoration, and analytics events.
- [ ] Run the two test files and verify they fail because components are missing.
- [ ] Implement the shared header/status/footer shell, page-specific sections, planner state, local storage, and tracking.
- [ ] Implement responsive ember-orange visual styles based on the supplied mockups, including visible focus states and mobile stacking.
- [ ] Run the two test files and verify they pass.

### Task 3: Register routes, metadata, and discoverability

**Files:**
- Modify: `src/lib/routes.ts`
- Modify: `src/lib/routes.test.ts`
- Modify: `src/main.tsx`
- Modify: `src/SiteFooter.tsx`
- Modify: `vercel.json`
- Modify: `public/sitemap.xml`
- Modify: `src/lib/static-pages.test.ts`
- Create: `emberville/index.html`
- Create: `emberville-builds/index.html`
- Create: `emberville-classes/index.html`
- Create: `emberville-skill-inheritance/index.html`

**Interfaces:**
- Consumes: `<EmbervillePage>` and the shared page metadata.
- Produces: route kind `emberville`, `embervillePageId`, four Vercel rewrites, static templates, footer discovery, and sitemap entries.

- [ ] Extend route/static-page tests with all four paths, exact metadata, self-canonicals, and `index, follow` expectations.
- [ ] Run the route/static-page tests and verify failures for unregistered paths/templates.
- [ ] Add the route type/lookup, renderer branch, four templates, Vercel rewrites, footer link, and sitemap entries without changing existing records.
- [ ] Run the route/static-page tests and verify they pass.

### Task 4: Add crawlable prerender output and structured data

**Files:**
- Modify: `src/lib/prerender.ts`
- Modify: `src/lib/prerender.test.ts`
- Modify: `scripts/prerender-pages.ts`
- Modify: the four Emberville HTML templates from Task 3

**Interfaces:**
- Consumes: `EMBERVILLE_PAGES`, `EMBERVILLE_SOURCES`, and route templates.
- Produces: `renderEmbervillePrerender(pageId)` and build-time HTML for every Emberville route.

- [ ] Write prerender tests asserting one H1, page-specific sections, official source URLs, mutual internal links, and no unverified entity copy.
- [ ] Run `npm test -- src/lib/prerender.test.ts` and verify the new assertions fail.
- [ ] Implement `renderEmbervillePrerender` from the shared data and register all four targets in `scripts/prerender-pages.ts`.
- [ ] Add `WebApplication`, `CollectionPage`, or `Article` JSON-LD to each template using its canonical URL.
- [ ] Run the prerender tests and verify they pass.

### Task 5: Validate, publish, and verify production

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Produces: a production deployment whose live HTML and browser UI match the spec.

- [ ] Run `npm test` and require all test files to pass.
- [ ] Run `npm run typecheck` and require exit code 0.
- [ ] Run `npm run lint` and require exit code 0.
- [ ] Run `npm run build` and inspect all four generated `dist/*/index.html` files for metadata, prerender copy, source links, and sitemap consistency.
- [ ] Review the final diff for invented data and accidental WoW metadata changes.
- [ ] Merge `codex/emberville-p0` into `main`, push GitHub, wait for CI and Vercel, then verify all four live routes return 200 with the expected canonical and `index, follow` metadata.
