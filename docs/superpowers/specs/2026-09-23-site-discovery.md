# Site discovery and analytics integrity

User approved implementation and production publication on 2026-09-23.

## Scope
- Stop GA page views and events on localhost, loopback, Vercel previews and other non-production hosts. Production host is buildforgetools.com (www allowed until its redirect). Prevent QA collection before the Google script loads, including static first paint.
- Add two indexable, rendered WoW directories: /wow-forever-classes (nine classes and published calculator/builds/talents/leveling links), /wow-forever-builds (leveling/PvP/dungeon/current planning cap). All links derived from existing published routes, explicit adapter for frozen legacy Paladin.
- Replace the root 308 to /paladin with a true BuildForgeTools home, self canonical, retaining both WoW and Emberville discovery.
- Add spec and intent grouping to eight non-Paladin class build hubs. Keep route search, existing URLs, metadata and original content.
- Add a portable seo:validate CI check for rendered metadata, canonical/sitemap membership, withheld routes, route/anchor links, inbound discovery, class hub links and intent markers. Duplicate description/similarity reports may warn for legacy content; existing frozen pages must never be edited to satisfy a gate.
- Preserve the 22 Paladin pages' metadata, rendered root markup, links and sitemap lastmod byte for byte. Production calculator/share behavior unchanged. Only analytics exclusion outside production applies globally.
- Do not change talent datasets, unpause watcher, add pet mechanics or rewrite existing page bodies.

## Presentation
Keep the current dark/gold palette and existing art. Home offers game choice and clear tool entries. Classes directory uses nine visual cards, builds directory has four navigable intent sections. No unsupported ranks, best-build claims, fabricated popularity or current server-cap promises.

## Publication and verification
Use an isolated worktree. Test production/nonproduction analytics bootstrap, gated directory links, route metadata and SEO validator failures. Build/lint/typecheck/full suite; inspect desktop/mobile new pages plus updated hubs; compare protected markup against the a0d58e9 build. Publish to main, wait for CI and Vercel, verify new root returns 200 and canonical /, all 153 sitemap URLs remain healthy, existing share noindex and www redirect unchanged. Resubmit canonical sitemap via GSC MCP and record outcome. Indexing is not guaranteed.
