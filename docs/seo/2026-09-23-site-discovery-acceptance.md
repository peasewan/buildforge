# Site discovery acceptance — 2026-09-23

## Scope

Production home now serves WoW Forever and Emberville. New classes and builds directories use published route definitions. Eight non-Paladin class hubs group specialization and playstyle links while retaining search. Analytics bootstrap and events allow only the two production hostnames; local and preview traffic is excluded prospectively.

## Verified candidate

Implementation through `d72cd3f`, based on production `a0d58e9`.

- Full suite: 61 files, 904 tests passed.
- Typecheck, lint, shell generation check, production build and SEO gate passed.
- 153 rendered pages and sitemap entries; all reachable from root; zero SEO errors.
- 22 frozen Paladin pages match baseline body, links, metadata, social metadata, structured data and sitemap dates.
- All 150 previously indexed-in-sitemap routes retain title, H1, description, canonical, robots and sitemap dates.
- Local HTTP acceptance: 153 pages and 377 referenced assets passed.
- Desktop and mobile QA: home, two directories and eight class hubs; search, anchors, images and calculator interaction checked. No horizontal overflow. Local Google script count is zero.
- Independent reviews approved analytics, discovery and final validator fixes.

Two existing advisory warnings remain: the frozen Retribution build/leveling H1 pair and the explicit unavailable Protection Warrior PvP allocation. No talent data or calculator rules were changed. The paused Beta watcher was not restarted.

## Production acceptance

Release `d5b0da035e8ac356e5edbe0bb87725802d614090` fast-forwarded to main and pushed using the Git Data API with identical Git object hashes and a non-force ref update.

- Vercel deployment succeeded; GitHub CI run 35865023394 passed for that exact SHA.
- Public acceptance at 2026-09-23 13:10 UTC: all 153 pages and 377 referenced assets passed; rendered bodies and metadata matched the candidate, sitemap matched exactly.
- `/build?id=invalid` and `/warrior?build=invalid&level=20` returned 200 with `X-Robots-Tag: noindex, follow`.
- `www` directory URL returned 308 to the exact non-www URL.
- GSC MCP resubmitted the canonical sitemap at 13:11 UTC. Follow-up returned processed, 153 submitted URLs, zero errors and zero warnings. Sitemap processing is not a claim of page indexing.

Raw local evidence: `/tmp/site-discovery-final-tests.log`, `/tmp/site-discovery-final-seo.log`, `/tmp/site-discovery-final-local-acceptance.json`, `/tmp/site-discovery-production.json`. Portable baseline and CI checks are committed; raw local evidence is not required by CI.
