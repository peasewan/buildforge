# Site consistency repair — 2026-09-29

## Objective

Resolve the audit's confirmed user-facing contradictions without changing published URLs, established Paladin titles/H1s/canonicals, or importing an unreviewed 70009 talent dataset. Preserve the 69913 snapshot as a dated client record. Treat the official Improved Holy Strike removal as confirmed; treat the reported Crusade removal as pending identity reconciliation.

## Work units

1. **Patch truth and recommendations** (`src/data/betaStatus.ts`, `src/BetaDataStatus.tsx`, Paladin planner/data/preset consumers): change "current" labels to explicit 69913 imported snapshot and scope 0/0/0 to the 69893→69913 comparison. Mark the officially removed talent unavailable for new/current allocations, sanitize older shared builds, and make affected 69913 examples historical/under review. Keep the unresolved Crusade record out of current recommendations until the source ID discrepancy is resolved. Add regression tests before changes.
2. **Share and restore validation** (`src/lib/talentPlanner.ts`, `src/lib/build.ts`, `src/App.tsx`, `src/ClassCalculatorPage.tsx`): validate inbound URL/local builds against point caps, tiers, and prerequisites; do not silently display impossible allocations. Make edited shared Paladin builds refresh predictably. Empty allocations must not count as copied builds. Add failing tests for illegal deep links, refresh and empty-copy analytics.
3. **Preview interaction** (`src/App.tsx`, `src/BuildLandingPage.tsx`): give talent previews a genuinely read-only node presentation and a clear edit link. Ensure no clickable node is a no-op. Add a rendered interaction test.
4. **Release guard** (`package.json`, `scripts/seo-validate.ts`, test/config as needed): make a normal production build fail when SEO validation fails; add semantic checks covering removed talents/presets and version labeling. Do not paper over failures by changing frozen baselines. Review Article `dateModified` against sitemap `lastmod` and correct only where the actual edit date is established. Keep the existing Ret duplicate-H1 SEO baseline unchanged unless separate search evidence warrants a title change.
5. **Integration**: cherry-pick isolated changes, run targeted tests, full `npm test`, lint, typecheck, full build, SEO validator and production smoke. Verify live pages and sitemap after push to GitHub main/Vercel. Update only sitemap dates for materially changed indexable pages, and explicitly document any reviewed frozen-body/head amendments.

## Acceptance checks

- No "current 69913 / 0 removed" claim without a scoped comparison date; user can identify what is historical and what is pending.
- Improved Holy Strike cannot be added to a new current build or silently restored from an old URL; archived content remains accessible as history.
- Unverified Crusade-containing examples are not advertised as verified current routes, while no dataset row is deleted without ID reconciliation.
- Incoming builds cannot display or copy allocations that violate level point cap, row thresholds, or prerequisites.
- Preview nodes are either truly editable or honestly noninteractive; successful copy metrics represent nonempty builds.
- All 156 published URLs remain healthy with unchanged URL/Title/H1/canonical unless explicitly reviewed; build and SEO checks gate publication.
