# Songs of Glimmerwick Garden Planner

## Scope

Ship one useful game page at `/songs-of-glimmerwick` on BuildForgeTools. The user selected Songs of Glimmerwick and authorized isolated development, testing, merge to main and deployment. Existing AdSense work, WoW content and Emberville are out of scope. Add only a homepage discovery card and the route/build/SEO configuration required for this page.

## Product

Players record crop names, quantities, planting days, observed growth durations and notes. The planner estimates readiness using `planting day + observed growth days`, sorts a harvest schedule, persists the plan locally, supports editing/removing rows, and exports a CSV. Dates use the player's own consecutive day count, with no assumed season length. No unverified crop names, yields, skill names, slot counts or game values are supplied.

The page pairs the working tool with short source-linked official references. Steam lists release on 2026-09-30 and currently offers a Demo; that is reported as a dated reference, not an automatic claim of release status. The visual language uses forest green, parchment and restrained botanical motifs, distinct from the existing WoW pages. No new dependencies or game artwork are required.

## Data and privacy

Version 1 plan contains `currentDay` and up to 30 planting rows. Integers are bounded: days 1–9999, growth days 1–365, quantity 1–999. Crop text is limited to 80 characters, notes to 240. Corrupt storage and unknown schema versions fall back safely. User-entered text remains in the browser and is not sent to analytics. CSV exports neutralize spreadsheet formulas. Calculator output is an estimate based on user input, not verified game timing.

## Acceptance

- Add, edit and remove a planting; changing the current day changes the remaining-day result.
- Reload restores saved inputs. Denied browser storage does not break planning or export.
- Valid input produces stable schedules; invalid/oversized input does not enter saved state.
- Export contains the plan inputs and readiness estimate with safe CSV quoting.
- Metadata, canonical, sitemap and the prerendered tool agree; homepage links to the page.
- Existing frozen pages remain unchanged. Run full tests, lint, build and SEO validation before merge; verify production after Vercel deploys.
