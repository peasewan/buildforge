# Emberville reviewed preview data

Production catalog: `src/data/emberville-preview-2026-09-27.json`.

## Review baseline
Reviewed on September 27, 2026. This is a partial pre-Early Access catalog, not a client dump or complete roster:
- Knight: official developer reveal; name and sword/shield close-combat identity only.
- Wanderer: Jordan Hawes's September 11 hands-on prologue report; community/press preview evidence.
- Sword, Bow, Staff: examples in the official developer overview; category names do not verify class restrictions.
- Focus Strike and Swift Foot: named Wanderer skills observed in the hands-on report. Their effects are qualitative observations only. Active/passive type, inheritance eligibility, numerical effects, unlocks, costs and compatibility remain unknown.

The two-active/two-passive class equip slots in that report are not inheritance slot counts. Do not copy them into inheritance rules. Never infer Swift Foot is passive or Focus Strike is active from the effect description.

## Schema
Each fact uses `{ value, verificationStatus, sourceIds, note? }`. Unknown facts use `value: null`, `verificationStatus: null`, `sourceIds: []`. Reviewed names, effects, types and compatibility carry separate facts. `id` is a stable editorial ID; `gameId` remains null unless game data establishes it. Preserve the versioned source catalog and its locator text for repeatable review.

Known facts require an existing source. Status vocabulary is `official`, `client_datamined`, `client_verified`, `community_verified`, `derived_assumption`. `official` requires an official source; a press report never establishes client verification. Client statuses require a source explicitly classified as `client_export`.

## Commands
```bash
npm run emberville:validate
npm run emberville:query -- --search wanderer
npm run emberville:import -- /private/tmp/emberville-candidate.json --output /private/tmp/emberville-reviewed.json
npm run emberville:diff -- src/data/emberville-preview-2026-09-27.json /private/tmp/emberville-reviewed.json
```

Import takes a local candidate JSON, validates the whole dataset, then writes a separate reviewed output atomically. It does not scrape, publish, promote or overwrite a production catalog. Invalid candidates leave existing outputs unchanged. Diff compares records, field-level evidence, source locators and inheritance rules; it is not limited to numerical changes.

## Promotion
1. Save new evidence in a new candidate dataset with a new data version/date.
2. Validate and diff; individually inspect each changed fact against its linked source.
3. Retain unknown values and explicit incompatibilities. No compatibility cell defaults to true.
4. Copy the reviewed candidate to a new versioned production file and explicitly update `src/data/embervilleCatalog.ts` and CLI baseline scripts.
5. Run tests, typecheck, lint, build and `seo:validate`, then publish through the normal reviewed Git/Vercel flow.

## Frontend
The existing four Emberville routes consume the catalog; no new routes are added. Class/weapon selections are planning intentions, not proof of an in-game legal combination. Skills with unknown type or effect cannot be selected. Other learned classes are user intentions, not account-state verification. A complete inheritance evidence result checks recorded rules; it does not validate the player’s current level or class–weapon compatibility, and the UI states that limitation.

The draft saves under `emberville-build-draft-v1` only in the browser. Existing `emberville-build-notes` notes are retained. Stale IDs are removed on restore, notes are retained and the user receives a recheck notice. Storage failures leave the current tab usable. Analytics contain record IDs/counts and data version, never note content; saving a draft does not emit `build_complete`.
