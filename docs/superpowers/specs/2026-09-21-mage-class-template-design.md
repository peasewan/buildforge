# Mage Class Template Design

## Goal

Publish a complete WoW Forever Mage cluster of **15 indexable URLs** and introduce a class-neutral `class × spec × intent` page layer. Mage is the first full `ClassDefinition` input. A Hunter-shaped fixture must render the same page kinds without new React components. **Do not publish Hunter URLs in this branch.** Paladin and Warrior stay on their current pages and are not migrated.

## Why this is not a Warrior-style 6-page MVP

Warrior proved the calculator-plus-build-cluster model. Mage is the first programmatic SEO experiment: every URL has a distinct search intent (calculator, hub, talent encyclopedia, class leveling, three spec builds, three spec leveling routes, Frost AoE, PvP hub, dungeon, current level-cap, Frost vs Fire comparison). Duplicate intent is a merge blocker.

## Evidence boundary

### Dual-source import (required)

Primary views:

1. ForeverDiff Mage change/tree view: `https://foreverdiff.com/talents/mage`
2. TheWoWDB Mage talent table for Beta `1.60.1.69913`: `https://thewowdb.com/wow-forever/talents/mage/`

Do not use Mobalytics, wowforever.gg, community guides, or another calculator to fill missing fields. `wowforevertalents.net` may be inspected only as a diagnostic third view; it is not an accepted production source in this spec.

Observed conflict that the importer must not paper over:

- ForeverDiff lists **new talent nodes** (including Arcane Blast, Missile Barrage, Hot Streak, Ice Lance, Fingers of Frost) and several row/rank-cap moves versus Classic.
- TheWoWDB’s public Mage page states the **layout matches Classic Era slot for slot** for build `1.60.1.69913`, lists a Classic-shaped tree, and treats current coordinates/rank caps/arrows as vanilla until a later build changes them. Its per-talent text is still labeled as the Beta client Talent table.

Those two views already disagree on node presence, coordinates, rank caps, and some tooltip numbers. The importer produces a **field-level** reconciliation report. Do not treat a talent as all-or-nothing.

### Field-level consensus

Match candidate nodes by normalized `name` + `branch`. Then score each field independently.

**Planner-legal fields** (required to place the node on the calculator). Both sources must agree or the node is **not published**:

- `name`
- `branch`
- `row`
- `column`
- `maxRank`

**Content and metadata fields** never veto publication. Dual agreement → `client_verified`. Present on one source only → `client_datamined` (single-source). Disagree or absent on both → omit / `unknown`. Never fill from Classic, Mobalytics, or another calculator.

| Field | Dual agree | One source | Disagree |
| --- | --- | --- | --- |
| name, branch, row, column, maxRank | publish node | do not publish | do not publish |
| rankDescriptions | `client_verified` | `client_datamined` | omit tooltip (`unknown`) |
| sourceTalentId / spellId | `client_verified` | `client_datamined` | omit |
| prerequisite **link** | `client_verified` | omit (do not half-enforce) | omit |
| prerequisite **required rank** | only if both state the rank | `derived_assumption` | `derived_assumption` |
| iconName | either source may supply; label `client_datamined` if only one has it | | |
| changeStatus vs Classic | only if both agree | `unknown` | `unknown` |

Example: both sources have Improved Frostbolt at the same slot and rank cap, but TheWoWDB omits `spellId`. **Publish the node.** Position and `maxRank` are `client_verified`. `spellId` is omitted or `client_datamined` if ForeverDiff alone has it.

Nodes that exist in only one source (for example Ice Lance on ForeverDiff but not TheWoWDB) are **not published**. That is identity consensus, not field consensus.

Each talent stores `fieldEvidence: Record<string, EvidenceStatus | 'unknown'>` so UI can badge position separately from tooltip and from ids. Node-level `verificationStatus` is `client_verified` only when every planner-legal field is dual-source; it is not a claim that every metadata field is verified.

### Talent record contract

Every **published** Mage talent keeps:

- stable local `id`
- planner-legal fields above, all dual-source
- `rankDescriptions[]` when evidence is not `unknown`; length must equal `maxRank` when the array is present
- `sourceTalentId` / spell id only when evidence is `client_verified` or `client_datamined`
- `iconName` and local icon path when an icon can be acquired; missing icon fails the icon download step, not the reconcile publish decision
- `sourceClientBuild`, `verifiedThroughBuild` (`1.60.1.69913` when the pair is reviewed through that build)
- shared evidence vocabulary only: `official` | `client_datamined` | `client_verified` | `community_verified` | `derived_assumption`
- two source URL records (`beta_client` ForeverDiff, `beta_client_crosscheck` TheWoWDB)

If dual-source planner-legal agreement cannot produce three complete, planner-legal trees, **do not merge Mage calculator pages**. The page framework and unpublished Hunter fixture may still land; Mage URLs stay off sitemap and production until the dataset passes validation.

### Acquisition pipeline

Do not hand-copy public HTML into source JSON as the default path. The importer is:

```text
fetch ForeverDiff + TheWoWDB
  → parse each view
  → normalize
  → snapshot raw normalized JSON (acquisition: fetch)
  → field-level reconcile
  → evidence report (stdout + committed report file)
  → production JSON after review
```

If a page cannot be parsed reliably, a checked-in snapshot is allowed only with `acquisition: manual_snapshot` on that source file, and the review report must list it. Manual snapshots are a fallback, not the pipeline.

Do not use Mobalytics, wowforever.gg, community guides, or another calculator to fill missing fields. `wowforevertalents.net` may be inspected only as a diagnostic third view; it is not an accepted production source.

### Editorial vs client facts

Talent-tree facts and build recommendations are separate evidence objects. A client-verified Ice Lance **position** does not verify a Frost leveling 11-point route.

Build allocations, talent order, playstyle, “recommended for leveling”, AoE farming loops, and PvP/dungeon advice are `community_verified` or `derived_assumption`. They never become client facts and must not reuse the Talent Data “Client verified · 69913” badge.

Availability at the current Beta cap is derived from verified `requiredTreePoints` / row rules plus the 11-point Level 20 budget. Do not copy “Arcane comes online at 25” from guides. If a key node’s verified row requires more than 11 tree points, the page may state that it is **not reachable at the current 11-point cap**.

## Public Mage URLs

All 15 are `index, follow`, self-canonical, prerendered, and listed in `public/sitemap.xml`. Sitemap `<lastmod>` is `ClassPageDefinition.updatedAt` (ISO date), not a hardcoded date in the sitemap writer. Query-string share links stay on `/mage` and are not sitemap entries.

| Slug | Kind | Intent | Title | H1 |
| --- | --- | --- | --- | --- |
| `/mage` | `calculator` | Talent Calculator | WoW Forever Mage Talent Calculator – Arcane, Fire & Frost | WoW Forever Mage Talent Calculator |
| `/wow-forever-mage-builds` | `buildsHub` | Builds Hub | WoW Forever Mage Builds \| Talent Calculator | WoW Forever Mage Builds |
| `/wow-forever-mage-talents` | `talents` | Talent trees / changes | WoW Forever Mage Talents & Talent Trees | WoW Forever Mage Talents & Talent Trees |
| `/wow-forever-mage-leveling-build` | `leveling` | Mage Leveling | WoW Forever Mage Leveling Build \| Level 20 Beta | WoW Forever Mage Leveling Build |
| `/wow-forever-frost-mage-build` | `specBuild` | Frost Build | WoW Forever Frost Mage Build \| Level 20 Beta | WoW Forever Frost Mage Build |
| `/wow-forever-fire-mage-build` | `specBuild` | Fire Build | WoW Forever Fire Mage Build \| Level 20 Beta | WoW Forever Fire Mage Build |
| `/wow-forever-arcane-mage-build` | `specBuild` | Arcane Build | WoW Forever Arcane Mage Build \| Level 20 Beta | WoW Forever Arcane Mage Build |
| `/wow-forever-frost-mage-leveling-build` | `specLeveling` | Frost Leveling | WoW Forever Frost Mage Leveling Build | WoW Forever Frost Mage Leveling Build |
| `/wow-forever-fire-mage-leveling-build` | `specLeveling` | Fire Leveling | WoW Forever Fire Mage Leveling Build | WoW Forever Fire Mage Leveling Build |
| `/wow-forever-arcane-mage-leveling-build` | `specLeveling` | Arcane Leveling | WoW Forever Arcane Mage Leveling Build | WoW Forever Arcane Mage Leveling Build |
| `/wow-forever-frost-mage-aoe-build` | `aoe` | Frost AoE farming | WoW Forever Frost Mage AoE Build | WoW Forever Frost Mage AoE Build |
| `/wow-forever-mage-pvp-build` | `pvp` | Mage PvP hub | WoW Forever Mage PvP Build | WoW Forever Mage PvP Build |
| `/wow-forever-mage-dungeon-build` | `dungeon` | Dungeon | WoW Forever Mage Dungeon Build | WoW Forever Mage Dungeon Build |
| `/wow-forever-mage-level-20-build` | `levelCap` | Current Beta cap | WoW Forever Mage Level 20 Build | WoW Forever Mage Level 20 Build |
| `/wow-forever-frost-vs-fire-mage-leveling` | `comparison` | Frost vs Fire leveling | Frost vs Fire Mage for Leveling in WoW Forever | Frost vs Fire Mage for Leveling in WoW Forever |

Do not add Frost/Fire/Arcane PvP splits, Mage spellbook, Hunter routes, or Mage pages 16–30 in this branch.

## Architecture

### Rejected: copy `WarriorPage` fifteen times

Fifteen Mage-specific React files would ship the cluster but force Hunter to clone the same files.

### Rejected: Mage-only structured records plus Mage templates

That is still a class-specific renderer. Hunter would need new components for comparison, AoE, PvP tabs, and talent encyclopedia.

### Chosen: `ClassDefinition` + generic renderer + published-class registry

One typed class package drives calculator state, editorial builds, page metadata, prerender HTML, Vite inputs, Vercel rewrites, and sitemap rows. React knows `ClassDefinition`, not Mage. Mage is `src/data/classes/mage.ts` (plus versioned talent JSON). Paladin and Warrior keep their current modules.

Registry:

```ts
export const PUBLISHED_CLASSES: ClassDefinition[] = [mageClass]
```

Tests may import an unpublished `hunterClassFixture` that is **not** in `PUBLISHED_CLASSES`.

Route generation must be data-driven. Adding Hunter later should not require a new `HunterPage.tsx`; it should require a new class module and appending it to `PUBLISHED_CLASSES`. Vite, Vercel, sitemap, and prerender consume `PUBLISHED_CLASSES.flatMap(c => c.pages)`.

## Data model

```ts
export type PlannerLevel = 20 | 30 | 60
export type ClassPageKind =
  | 'calculator' | 'buildsHub' | 'talents'
  | 'specBuild' | 'leveling' | 'specLeveling'
  | 'aoe' | 'pvp' | 'dungeon' | 'levelCap' | 'comparison'

export interface ClassTalentSource {
  label: string
  type: 'beta_client' | 'beta_client_crosscheck'
  url: string
}

export type FieldEvidenceKey =
  | 'name' | 'branch' | 'row' | 'column' | 'maxRank'
  | 'rankDescriptions' | 'sourceTalentId' | 'prerequisiteLink' | 'iconName' | 'changeStatus'

export interface ClassTalent<B extends string> extends PlannerTalent<B> {
  name: string
  description?: string
  rankDescriptions?: string[]
  row: number
  column: number
  x: number
  y: number
  iconName?: string
  icon?: string
  sourceClientBuild: string
  verifiedThroughBuild: string
  sourceTalentId?: number
  fieldEvidence: Partial<Record<FieldEvidenceKey, EvidenceStatus | 'unknown'>>
  verificationStatus: EvidenceStatus
  prerequisiteRuleStatus: 'derived_assumption' | 'not_applicable'
  changeStatus: 'new' | 'changed' | 'same' | 'unknown'
  sources: ClassTalentSource[]
}

export interface ClassBuildSource {
  label: string
  url?: string
}

export interface ClassBuild {
  id: string
  spec: string
  intent: string
  level: PlannerLevel
  levelCap: number
  phase: string
  points: number
  allocation: string
  title: string
  shortTitle: string
  role: string
  playstyle: string[]
  strengths: string[]
  keyTalentIds: string[]
  order: string[]
  build: PlannerBuild
  evidence: 'community_verified' | 'derived_assumption'
  sources: ClassBuildSource[]
  verifiedThroughBuild: string
  createdAt: string
  updatedAt: string
  href: string
}

export interface ClassPageSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface ClassPageDefinition {
  kind: ClassPageKind
  slug: string
  intent: string
  title: string
  h1: string
  description: string
  eyebrow: string
  canonical: string
  robots: 'index, follow'
  updatedAt: string
  spec?: string
  primaryBuildId?: string
  relatedBuildIds: string[]
  relatedPages: { href: string; label: string }[]
  sections: ClassPageSection[]
  faqs: { question: string; answer: string }[]
  comparison?: { columns: string[]; rows: { label: string; values: string[] }[] }
}

export interface ClassDefinition<B extends string = string> {
  id: string
  name: string
  plannerPath: string
  branches: readonly B[]
  branchNames: Record<B, string>
  branchTaglines: Record<B, string>
  storageKey: string
  analyticsClass: string
  dataVersion: string
  verifiedBuild: string
  talentCount: number
  beta: { phaseLabel: string; levelCap: number; pointsAtCap: number }
  plannerModes: { level: PlannerLevel; points: number; label: string }[]
  talents: ClassTalent<B>[]
  plannerConfig: PlannerConfig<B>
  builds: ClassBuild[]
  pages: ClassPageDefinition[]
  recommendedBuildIds: string[]
  sources: ClassTalentSource[]
}
```

`pages[].canonical` is always `https://buildforgetools.com/${slug}` for slug `mage` and `https://buildforgetools.com/${slug}` for the others. `pageForPath` looks up `PUBLISHED_CLASSES` before Paladin/Warrior/Emberville handlers do not need to change except to add a generic class kind.

Intent uniqueness is validated in tests: 15 Mage pages → 15 distinct `intent`, `title`, `h1`, and `canonical` values.

## Calculator (`/mage`)

Reuse `talentPlanner` with Mage branches and the same Level 20 / 30 / 60 point caps as Warrior (`11` / `21` / `51`). Bonus/Legacy points stay excluded.

Hero copy:

> Build and share Arcane, Fire and Frost Mage talent trees using current WoW Forever Beta data.

Status line: **Beta · Build 1.60.1.69913**, **Current Level Cap: 20**, **11 Talent Points Available**.

Capabilities retained: copy build link, reset, rank tooltips, lock/prerequisite messaging, verification badges, required-tree-point labels. Beta Changes is linked only if a Mage changelog page exists; this branch does **not** add `/wow-forever-mage-beta-talent-changes`. The talents encyclopedia page covers new/changed labels instead.

Recommended build buttons load `recommendedBuildIds` (Frost leveling, Fire damage, Arcane phase-preview). Labels come from build records, not hardcoded Mage strings in the component.

Talent vs build evidence is always split in the UI (calculator, document pages, prerender):

```text
Talent Data
✓ Client Verified · 69913   // planner-legal fields only

Build
Community / Editorial Build
Current Beta · Level 20
```

Never show a single “Beta Verified” chip on an editorial allocation.

Share URL: `/mage?build=<code>&level=<20|30|60>`. Canonical remains `/mage`. Storage key is Mage-specific.

Lowering the cap never silently deletes an over-budget build: reset or disable increment until legal, matching Warrior’s published rule (Warrior currently resets on level-down; Mage must follow the same explicit UI: if allocation exceeds the new cap, reset the tree and say so). Document the actual implemented behavior in tests.

Analytics: `talent_click` with `{ class: 'mage', talent, rank }`, `mage_level_mode`, `mage_preset_load`, `mage_build_copy`, and existing build-completion plumbing only if it can be namespaced without changing Paladin/Warrior event shapes.

## Page-kind content rules

Every page ends with **Edit this build in Calculator** (or open empty calculator). The calculator lists recommended builds that point back at SEO pages.

### `buildsHub`

H1 **WoW Forever Mage Builds**. First screen: three spec cards (Frost leveling / Fire damage / Arcane Phase 2 preview) with distinct mechanics bullets taken only from verified talent **names** plus editorial playstyle. Then current Beta 11-point builds. Then intent groups: Leveling / AoE / Dungeon / PvP. Then a complete Mage URL list.

### `talents`

Not a build page. Show Arcane | Fire | Frost catalogs. Group by `changeStatus` when dual-source agrees (`new` / `changed` / `same`). Each talent block: what changed (if known), reachable at 11-point cap?, builds that spend it, open calculator. Do not highlight Ice Lance / Hot Streak / Fingers of Frost / Arcane Blast / Missile Barrage as talent nodes unless they survive dual-source publication. If they appear only in another talent’s verified tooltip, describe them as **spells mentioned in client talent text**, not as tree nodes.

### `leveling`

Lead with the editorial recommendation (Frost) labeled community recommendation. Show the Level 20 11-point build, then Level 10 → 15 → 20 order from `order[]`. Then Frost vs Fire vs Arcane playstyle without “absolute best”.

### `specBuild`

Shared section order: current-cap build → talent order → key talents → calculator CTA. Copy differs per spec. Arcane includes a **Current Beta note** when verified row requirements show core nodes beyond 11 points.

### `specLeveling`

Frost: talent order, single-target, AoE, kiting. Fire: can you level as Fire, Fire vs Frost, Hot Streak only if it is a published talent. Arcane: should you level as Arcane; Phase 1 vs later rows from verified `requiredTreePoints`.

### `aoe`

Lead with the AoE allocation and tree, then order, then core **spells** that appear in verified talent text or are named only as editorial utility (editorial spell lists must not invent talent ranks). Farming loop is `derived_assumption`. FAQ may ask whether Forever changed Blizzard chill **only if** Improved Blizzard text is dual-source agreed; quote the agreed tooltip, do not analogize Classic farming.

### `pvp`

One hub, three spec tabs, each with a legal 11-point (or stated planning) build. No Frost/Fire/Arcane PvP child URLs.

### `dungeon`

Utility and AoE/CC emphasis. Recommended dungeon build Frost; Fire as alternative. Polymorph / food & water are class utility claims and must be labeled `derived_assumption` unless a client talent/spellbook record exists (Mage spellbook is out of scope, so they stay assumption).

### `levelCap`

Time-sensitive Level 20 cards for three specs. Phase 2 later **archives** this page in place; do not delete it. No Level 30 URL in this branch.

### `comparison`

Table only: Playstyle, AoE, Safety, Key mechanics, Current Beta. No composite scores. CTAs to Frost and Fire calculator loads.

## Internal linking

```
/mage ⇄ /wow-forever-mage-builds
        ├─ spec builds
        ├─ spec leveling
        ├─ frost aoe
        ├─ dungeon / pvp
        ├─ level 20
        ├─ talents
        └─ frost vs fire
```

Every Mage `relatedPages` href must resolve through `pageForPath` to its own canonical (extend `internalLinks.test.ts` to include published class data). Footer on existing Paladin/Warrior/home surfaces adds one Mage calculator link without rewriting Paladin primary nav.

## Rendering and prerender

React:

- `ClassCalculatorPage` — trees, presets, share, level modes
- `ClassDocumentPage` — all non-calculator kinds via `page.kind` + sections/builds/comparison/faqs

No `MagePage.tsx` / `MageBuildPage.tsx`.

Prerender: one `renderClassPage(classId, slug)` used by `scripts/prerender-pages.ts` for every published class page. Output includes unique H1, unique description, listed talents or selected ranks, and internal links. Calculator prerender lists every published talent name.

Static HTML entry files and Vite `build.rollupOptions.input` keys are generated from the registry (a small `scripts/sync-class-static-pages.ts` or Vite config import). Do not hand-maintain 15 Mage filenames in four places.

## Hunter fixture (unpublished)

`src/data/classes/hunter.fixture.ts` (or under `src/data/fixtures/`) defines a **minimal** `ClassDefinition` with:

- three fake specs
- enough fake talents to allocate an 11-point build
- at least one page of each `ClassPageKind` used by Mage (same 11 kinds)

Tests assert:

- `ClassCalculatorPage` and `ClassDocumentPage` render Hunter H1s and titles from the fixture
- no `HunterPage` module exists
- `PUBLISHED_CLASSES` does not include Hunter
- sitemap / vercel production lists do not contain `/hunter`

## Error handling

- Import script fails on duplicate ids, broken prerequisite targets, rank-description length mismatch when descriptions are published, or a published node whose planner-legal fields are not dual-source.
- Missing icons fail the icon step after publish, not field reconcile.
- Preset validation fails if a build exceeds its level cap, skips `requiredTreePoints`, or spends unknown talent ids.
- Missing Forever tooltip is not replaced with Classic text.
- Paladin/Warrior datasets, storage keys, share codecs, titles, canonicals, and existing sitemap rows stay unchanged except for **appended** Mage URLs and a single footer discovery link.

## Testing

TDD coverage:

- dual-source field-level reconciliation (planner-legal vs metadata; agree / single-source / disagree / missing identity)
- Mage dataset completeness for published (planner-legal) nodes
- sitemap lastmod equals each page `updatedAt`
- planner legality of every Mage `ClassBuild`
- 15 unique title/H1/intent/canonical
- `pageForPath` + robots + canonical for all 15
- share encode/decode isolated from Paladin and Warrior storage
- renderer kind coverage via Hunter fixture
- prerender contains each page H1 and does not emit unpublished Hunter URLs
- sitemap, Vercel rewrites, Vite inputs match `PUBLISHED_CLASSES`
- existing Paladin, Warrior, Emberville suites still pass

## Release and measurement

Ship all 15 Mage URLs in one production release so the cluster is coherent. Do not generate Hunter URLs after Mage ships; the next step is only if this registry is proven: a later branch can add Hunter data to `PUBLISHED_CLASSES`.

Measure with the existing GSC/GA4 template, split by Mage landing page. Do not publish “most picked” Mage stats until `/api/build-usage` sample size is explicitly large enough.

## Out of scope

- Migrating Paladin or Warrior onto `ClassDefinition`
- Mage spellbook / abilities URL
- Mage Beta changelog URL
- Spec-specific PvP child pages
- Level 30 archive URL
- Actually publishing Hunter
- Resume of `monitor-paladin-beta-client-builds`
