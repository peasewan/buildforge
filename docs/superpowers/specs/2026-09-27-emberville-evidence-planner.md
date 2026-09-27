# Emberville evidence-backed planner

## User intent and authorization
Upgrade the existing Emberville planner into a sourced, versioned data product, in a new worktree. The user requested direct coding, testing and production publication without another approval handoff. Preserve the existing four URLs, titles, H1s, canonical tags, sitemap membership, shared navigation and all WoW pages.

## Scope
1. Add a versioned JSON dataset and strict schema for sources, reviewed class/weapon/skill records and inheritance facts. Stable editorial IDs are distinct from unknown game IDs. Every known fact carries evidence and one of the project verification statuses; unknown values are null and never inferred.
2. Add validated import/query/diff commands. Candidate validation precedes writing an output and cannot overwrite production data. Diff includes changed evidence and compatibility rules.
3. Upgrade the existing planner with sourced class/weapon selection, active/passive skill sections, saved local draft and a summary of confirmation gaps. Skill choices require reviewed names/types/effects. Unknown or incompatible inheritance must not appear as a valid build. Preserve legacy local notes.
4. Reuse a concise evidence component on classes/inheritance pages to expose source links, reviewed date, known records and unknown limits. Class records can be selected as planning intentions without asserting their compatible weapons/skills.

## Evidence boundaries
Official Steam confirms classes, weapon-bound combos and active/passive inheritance. Individual records require direct evidence; creator footage is community evidence, not official or client verified. No invented skills, defaults, rankings, slots, unlock levels, costs or statistics. An empty skill list is an honest state supported by an importer ready for reviewed data.

## Architecture
`src/lib/embervilleData.ts` owns runtime schema, query, compatibility and diff. `src/data/emberville-preview-2026-09-27.json` is the reviewed catalog. `src/data/embervilleCatalog.ts` imports it through validation. `scripts/emberville-data.ts` exposes CLI tools. The existing React planner and a compact reference component consume these records.

## Acceptance
Validation rejects malformed or unsourced known facts, duplicate identities and dangling references. Missing compatibility stays unknown; explicit incompatibility is blocked; numeric limits are enforced. Import failure writes nothing. Old notes survive, storage failures cannot break rendering and note text never enters analytics. Four Emberville pages keep metadata and existing links; full tests, lint, typecheck, build and SEO validation pass. Publish main and verify the production bundle plus four URLs.
