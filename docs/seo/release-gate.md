# Rendered SEO release gate

Run `npm run build` and then `npm run seo:validate`. CI runs both, after the existing data, lint, type and test checks. The command reads only the repository and its generated `dist`; no baseline directory, browser, server, credentials or network is needed. It writes `dist/seo-report.json` (already ignored by Git) and exits nonzero on errors.

The expected inventory comes from the class publish gate, the discovery/trust/Emberville definitions and the frozen legacy Paladin manifest. It is not locked to a page count. Every HTML file is scanned, including artifacts absent from the sitemap. Indexable pages require one nonempty, unique title, H1, description and self-canonical matching the sitemap. Withheld class artifacts, sitemap noindex leaks, unrendered roots, broken local links/anchors, missing primary intent modules, missing class hub links and pages with no other-page inbound link fail the gate. The same discovery edges must also make every expected page reachable from `/`; disconnected cycles fail separately from orphan checks. Generic robots and Googlebot directives are interpreted case-insensitively, with `none` equivalent to `noindex`. Local redirects are limited to the permanent, unconditional entries in `vercel.json`; the established `/build` alias resolves to the Paladin document without becoming an indexable discovery edge. Parameter links likewise do not supply discovery edges.

## Frozen baseline and narrow exceptions

`paladin-frozen-baseline.json` records the 22 protected pages from commit `a0d58e98f21c31dfba2e5e834b70bd97d2ed78a8`. The gate compares title, H1, description, canonical, robots (including absence), sitemap lastmod, and SHA-256 of:

- JSDOM `#root.innerHTML`;
- JSON serialization of ordered `a[href],area[href]` href values;
- JSON serialization of ordered `head title,head meta,head link[rel="canonical"],head script[type="application/ld+json"]` outerHTML values.

One H1 duplicate is grandfathered: exactly `/wow-forever-retribution-paladin-build` and `/wow-forever-retribution-paladin-leveling-build`, only when both retain their baseline H1 value. Adding a third duplicate or changing that value fails. Existing protected pages must not be edited to satisfy the gate.

An intent module may render its existing, exact unavailable-data message inside the correct kind wrapper instead of invented build data. This produces a warning. Removing the wrapper, changing to generic filler, or putting the message elsewhere cannot satisfy the module check.

## Advisory report

The report lists up to 30 strongest content pairs with five-word shingle Jaccard overlap at least 0.65. Navigation, header, footer, script and style content are removed. This is an editorial comparison aid, not a Google quality score or penalty threshold. Similarity does not fail CI; duplicate metadata does, apart from the single frozen H1 pair above.

## Validation on 2026-09-23

The existing Task 2 rendered build passed: **153 expected/indexable HTML pages, 153 sitemap entries, 22 unchanged frozen pages, zero errors**. Two warnings were recorded: the frozen Retribution H1 pair and the explicit unavailable allocation on `/wow-forever-protection-warrior-pvp-build`. No content pairs exceeded the advisory overlap threshold. The pure validator has mutation fixtures covering metadata, sitemap, links, anchors, noindex destinations, orphan/self-link behavior, withheld artifacts, intent modules, frozen fingerprints and both narrow exceptions.
