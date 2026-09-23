# Site discovery Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for bounded implementation tasks and review gates.

**Goal:** Make the existing published tools discoverable while keeping analytics clean and Paladin frozen.
**Architecture:** Gate GA at HTML bootstrap and event calls. Derive directories from the class publish gate, with a legacy Paladin adapter; share definitions between routes and static metadata. Validate rendered artifacts in CI.
**Tech Stack:** React, TypeScript, Vite prerender, Vitest, Vercel, GSC MCP.
**Spec:** docs/superpowers/specs/2026-09-23-site-discovery.md

## Global Constraints
- Preserve 22 protected Paladin rendered bodies, metadata, links and sitemap lastmod.
- Keep existing class URLs/title/H1/canonical, calculator logic and shared-build noindex.
- Only published links; no new game data; watcher remains paused.
- User authorized push main / deploy / sitemap submission without another approval.

## Task 1: Analytics integrity
Files: src/lib/analytics.ts, a production-host bootstrap helper, HTML generation/build integration, targeted tests.
- [ ] Capture baseline dist before edits; verify starting tree clean.
- [ ] Test hostname allowlist and bootstrap before script injection; production sends config, localhost/127.0.0.1/preview do not load or send. Verify test hosts cannot send events even with a stub gtag.
- [ ] Implement one reusable bootstrap included by Vite for all HTML entries, replacing unconditional inline tags. Avoid altering protected metadata/root markup. Class shell generator must stay in sync.
- [ ] Run targeted tests, typecheck and inspect built HTML. Commit scoped changes; review.

## Task 2: Discovery surfaces
Files: src/data/siteDiscovery.ts, src/SiteDiscoveryPage.tsx, scoped CSS, src/lib/routes.ts, src/AppRoute.tsx, index.html, new two HTML shells, vite.config.ts, vercel.json, public/sitemap.xml; src/experiences/ClassIntentExperience.tsx; non-Paladin footer call sites only.
- [ ] Test all new directory hrefs map to published routes, nine classes and four groups, root metadata distinct from /paladin.
- [ ] Implement home, classes, builds definitions and UI. Derive non-Paladin routes from publishedClassPages; explicit Paladin legacy adapter preserves source pages.
- [ ] Implement spec cards and playstyle sections in existing Hub, followed by retained search. Add reachable top-level discovery navigation only to non-Paladin surfaces.
- [ ] Serve root 200, self canonical; add two Vite inputs/rewrites and three sitemap entries dated 2026-09-23. Retain all old entries/lastmod.
- [ ] Verify root/query routing and shared builds retain behavior; test responsive three new pages and eight hubs. Commit; review.

## Task 3: SEO release gate
Files: scripts/seo-validate.ts, reusable pure validation/test module, package.json, .github/workflows/quality.yml, docs/seo validation report.
- [ ] Test missing canonical, duplicate canonical/title, empty H1, noindex sitemap leak, missing sitemap entry, broken link/anchor, orphan and withheld-route artifact failures using small fixtures.
- [ ] Validate dist indexable pages against sitemap and publish gate; require per-kind intent marker and correct class hub links, exclude share/noindex parameter URLs from indexable inventory. Persist a Paladin baseline fingerprint manifest from a0d58e9 before candidate build.
- [ ] Add advisory content similarity computed without navigation/footer, duplicate-description warnings; no claims of Google penalty thresholds.
- [ ] Wire npm run seo:validate after npm run build in CI. Run full checks and protected baseline comparison.

## Task 4: Production acceptance
- [ ] Run tests/typecheck/lint/build/SEO checks; inspect desktop/mobile screenshots and all navigation routes.
- [ ] Review diff and protected-page fingerprints. Commit results and merge fast-forward main; push (Git Data API fallback if needed).
- [ ] Wait for CI and deployment for exact SHA. Check root 200, new hubs, /paladin unchanged, www permanent redirect, /build noindex; crawl 153 indexable URLs and verify metadata.
- [ ] Submit https://buildforgetools.com/sitemap.xml to sc-domain:buildforgetools.com via MCP; report actual status without promising indexing.
