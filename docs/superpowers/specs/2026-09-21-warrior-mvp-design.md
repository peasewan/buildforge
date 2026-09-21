# Warrior MVP Design

## Goal

Add Warrior as BuildForgeTools' second complete WoW Forever class and use it to test whether the site's calculator-and-build-cluster model can earn search demand beyond Paladin.

The MVP publishes exactly six indexable URLs:

- `/warrior`
- `/wow-forever-warrior-builds`
- `/wow-forever-warrior-leveling-build`
- `/wow-forever-arms-warrior-build`
- `/wow-forever-fury-warrior-build`
- `/wow-forever-protection-warrior-build`

PvP, raid, dungeon, BiS, rotation, spellbook, and additional Warrior pages are out of scope until GSC queries justify them.

## Evidence Boundary

The calculator dataset must contain the complete 53-node Arms, Fury, and Protection tree reviewed through WoW Forever Beta client build `1.60.1.69913`. The separate 51 figure is the full talent-point cap.

Every talent record must preserve:

- stable local ID
- client node or spell ID when available
- branch, row, and column
- maximum rank
- per-rank tooltip text when available
- prerequisite link when present in the reviewed data
- icon name and local icon path
- client build, verification status, and source records

The import is accepted only after the complete tree is cross-checked against two independently published client-derived views. Initial references are ForeverDiff and TheWoWDB. Editorial build recommendations remain separately labelled `community_verified` or `derived_assumption`; they never become client facts.

The public copy must distinguish three planning modes:

| Mode | Point budget | Meaning |
| --- | ---: | --- |
| Level 20 Beta Cap | 11 | Current playable Beta cap |
| Level 30 Preview | 21 | Future-phase planning reference |
| Level 60 Full Build | 51 | Complete planner model, not the current Beta cap |

The 51-point full planner excludes any additional Legacy or unverified bonus points. This limitation is shown beside the selector.

## Architecture Decision

### Rejected: copy the Paladin application

Copying `App.tsx`, the allocator, and share logic would ship quickly but would create two class-specific implementations that drift independently.

### Rejected: rewrite the whole site around a new class framework

A full rewrite would create unnecessary SEO and regression risk for the already indexed Paladin pages.

### Chosen: generic engine with class adapters

Extract the pure allocation rules from `src/lib/build.ts` into a generic talent-planner engine. Keep the current Paladin API as a compatibility adapter so existing imports, saved builds, URLs, events, and tests retain their behavior. Add a Warrior adapter with its own branch union, dataset, point modes, storage key, analytics namespace, and share codec.

Reusable tree and summary UI are extracted only where Warrior needs the same behavior. Paladin content sections remain unchanged. The Warrior page owns its class-specific hero, labels, presets, data disclosure, and SEO copy.

## Data and Build Model

Warrior branches are `arms`, `fury`, and `protection`.

The generic engine receives a configuration object containing:

- ordered branches
- point cap
- five-points-per-tier rule
- talent definitions
- prerequisite policy

It exposes the existing behaviors: add rank, remove rank and invalid dependents, branch points, dominant branch, lock reason, total points, and share encode/decode.

Changing the level selector lowers or raises the active point cap. Lowering the cap never silently deletes a build. If the current allocation exceeds the selected cap, the UI asks the user to reset or remove points and disables additional ranks until the allocation is legal.

Warrior share links use `/warrior?build=<versioned-code>&level=<20|30|60>`. The canonical remains `/warrior`; query-string shares do not create indexable thin pages. Local persistence uses a Warrior-specific key and cannot overwrite a Paladin build.

## `/warrior` Product Page

The page uses the existing dark/gold BuildForgeTools system with Warrior-specific red/steel accents and imagery already available in the site's game UI language.

The primary flow is:

1. Choose Level 20, Level 30, or Level 60 planning mode.
2. Choose Arms, Fury, or Protection.
3. Spend points in the verified tree.
4. Inspect rank tooltip, source state, and change label.
5. Reset or copy a share link.
6. Load one of three current-cap starter builds.

The three starter cards are Arms `11/0/0`, Fury `0/11/0`, and Protection `0/0/11`. Each preset is validated by the engine, names its editorial evidence level, and loads directly into the calculator. No preset is described as proven best.

Analytics events are class-specific and bounded: `warrior_talent_click`, `warrior_level_select`, `warrior_preset_load`, `warrior_build_copy`, and deduplicated `warrior_build_complete`.

## Warrior Builds Hub

`/wow-forever-warrior-builds` is the crawlable topic center. It contains:

- Arms, Fury, and Protection cards
- the three current-cap 11-point allocations
- an explanation of current Beta versus future planning modes
- links to the four focused build pages
- a prominent calculator CTA
- data provenance and update status

Unavailable content types are described as future work in one concise section and do not link to empty routes.

## Focused Build Pages

All four pages use one tested `WarriorBuildPage` component and independent data configurations. Each page provides unique crawlable copy and a legal deep link into the calculator.

### Leveling

The Leveling page presents a community-recommended Level 20 Fury route, an Arms alternative, talent order from levels 10–20, reasons for the recommendation, and the limits of current evidence. It does not claim a universally best build.

### Arms

The Arms page focuses on two-handed solo play, exact Level 20 allocation, talent order, key talent interactions, and a visually separated Level 30 preview.

### Fury

The Fury page focuses on Level 20 Rage flow, its exact allocation and talent order, and concise answers to Rage starvation, Arms-versus-Fury, and dual-wield questions. Gameplay claims remain recommendations unless directly verified.

### Protection

The Protection page uses the reviewed `0/0/11` route with Shield Specialization, Improved Bloodrage, Improved Thunder Clap, and Last Stand. It explains dungeon-tank planning, Rage, early multi-target limits, defensive cooldowns, and what the build does not prove.

## SEO and Crawling

Each URL receives unique title, description, canonical, H1, and static prerendered content. All six routes enter `vite.config.ts`, `vercel.json`, and `public/sitemap.xml` with `2026-09-21` as the first publication date.

Internal links form this loop:

`Warrior calculator → Builds hub → focused build → calculator`

The global resource footer adds Warrior without replacing Paladin links. The main Paladin page receives one restrained cross-game/class link rather than a navigation rewrite.

Share URLs remain canonicalized to `/warrior` and do not enter the sitemap.

## Error Handling and Data Safety

- Fail the build if the imported dataset has duplicate IDs, invalid rank counts, coordinates outside the tree, missing source evidence, or unresolved prerequisite targets.
- Fail preset validation if a build exceeds its point cap, violates row requirements, or skips a prerequisite.
- Do not silently substitute Classic text for missing Forever tooltips.
- Do not publish a talent node whose required public fields are incomplete.
- Keep Paladin datasets, storage, analytics, share links, and canonical metadata unchanged.

## Testing

The implementation uses test-driven development and adds coverage for:

- Warrior dataset completeness and source provenance
- all three tree layouts and prerequisites
- 11/21/51 point caps
- legal Level 20 presets
- rank addition, removal, dependent cleanup, and cap enforcement
- Warrior share-link round trips and Paladin isolation
- level selector behavior
- calculator preset loading and analytics
- six route definitions and metadata
- all 53 talents in static prerender output
- sitemap, Vercel rewrites, and internal-link reachability
- full existing Paladin regression suite

Production release requires the full test suite, lint, TypeScript build, prerender verification, and HTTP checks for all six deployed routes.

## Release and Measurement

Ship the six pages in one release so Google sees a coherent class cluster. Observe 3–7 days before adding more Warrior URLs.

Measure:

- GSC impressions, clicks, CTR, and average position by Warrior query and page
- `/warrior` organic sessions and engagement
- talent clicks per engaged user
- preset loads
- copied builds
- deduplicated build completions

The next Warrior page is chosen only from observed query demand or a confirmed Beta phase/data change.
