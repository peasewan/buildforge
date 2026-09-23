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

Pending main deployment, exact-SHA CI, public HTTP crawl and GSC sitemap resubmission. Results will be recorded after verification.
