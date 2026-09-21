# Mage Class Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dual-source Mage `1.60.1.69913` talents into a generic `ClassDefinition` renderer that ships 15 distinct Mage URLs and can render Hunter-shaped pages without a Hunter React component.

**Architecture:** Add a ForeverDiff + TheWoWDB reconciliation importer, a class-neutral page registry, two generic React surfaces (calculator and document), and data-driven Vite/Vercel/sitemap/prerender wiring. Mage is the only published class. Paladin and Warrior stay on their current modules.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, static HTML prerendering, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-21-mage-class-template-design.md`

## Global Constraints

- Dual-source Mage talents from `https://foreverdiff.com/talents/mage` and `https://thewowdb.com/wow-forever/talents/mage/` for Beta `1.60.1.69913`.
- Field-level consensus: planner-legal fields (`name`, `branch`, `row`, `column`, `maxRank`) must match on both sources to publish a node. Metadata (`spellId`, unmatched tooltips, single-source icons) may be `client_datamined` or `unknown` without dropping the node.
- Fetch → parse → normalize → snapshot → reconcile → review report → production JSON. Manual HTML transcription is fallback only (`acquisition: manual_snapshot`).
- Talent evidence and build evidence are separate objects and separate UI labels. Builds carry `evidence`, `sources`, `verifiedThroughBuild`, `createdAt`, `updatedAt`, `levelCap`, and `phase`.
- Sitemap `<lastmod>` comes from `ClassPageDefinition.updatedAt`, never a hardcoded date in the writer.
- Publish exactly the 15 Mage URLs listed in the spec; do not publish Hunter URLs.
- Paladin and Warrior URLs, titles, canonicals, storage keys, and share codecs stay unchanged except for appended Mage sitemap/footer discovery.
- Every Mage page has a unique `intent`, `title`, `h1`, and `canonical`.
- Use test-driven development for every behavioral change.
- Publish per page, not per class: a page ships only when its declared `publishRequirements` are met (see the spec's Publish requirements section). A branch without an allocatable entry point withholds the pages that promise a build in it, not the whole class.

## File map

- Create: `src/lib/classPage.ts` — `ClassDefinition` types, registry helpers, share href, intent uniqueness.
- Create: `src/lib/classPage.test.ts`
- Create: `scripts/import-mage-talents.ts` — fetch/parse/reconcile; write JSON only for consensus nodes.
- Create: `src/data/mage-beta-1.60.1.69913.json` — produced by the importer after review.
- Create: `src/data/classes/mage.ts` — Mage `ClassDefinition` (talents adapter + 15 pages + builds).
- Create: `src/data/classes/mage.test.ts`
- Create: `src/data/fixtures/hunterClass.fixture.ts` — unpublished Hunter-shaped `ClassDefinition`.
- Create: `src/ClassCalculatorPage.tsx` + `src/ClassCalculatorPage.test.tsx`
- Create: `src/ClassDocumentPage.tsx` + `src/ClassDocumentPage.test.tsx`
- Create: `scripts/sync-class-static-pages.ts` — HTML shells from `PUBLISHED_CLASSES`.
- Modify: `src/lib/routes.ts`, `src/main.tsx`, `src/lib/prerender.ts`, `scripts/prerender-pages.ts`, `vite.config.ts`, `vercel.json`, `public/sitemap.xml`, `src/lib/internalLinks.test.ts`, `src/lib/routes.test.ts`, `src/lib/prerender.test.ts`, `src/SiteFooter.tsx` (or the existing Paladin/Warrior footers that list class links).
- Do not create: `MagePage.tsx`, `HunterPage.tsx`.

---

### Task 1: Class page schema and registry helpers

**Files:**
- Create: `src/lib/classPage.ts`
- Create: `src/lib/classPage.test.ts`

**Interfaces:**
- Produces: `ClassPageKind`, `ClassPageDefinition`, `ClassBuild`, `ClassDefinition`, `PUBLISHED_CLASSES` (starts empty or Mage-less until Task 4), `pageFromPublishedClasses(pathname)`, `assertUniquePageIntents(pages)`, `classPlannerHref(cls, build, level)`.

- [ ] **Step 1: Write failing uniqueness and lookup tests**

```ts
import { assertUniquePageIntents, pageFromPublishedClasses } from './classPage'

const pages = [
  { kind: 'calculator', slug: 'mage', intent: 'Talent Calculator', title: 'A', h1: 'HA', description: 'd', eyebrow: 'e', canonical: 'https://buildforgetools.com/mage', robots: 'index, follow', updatedAt: '2026-09-21', relatedBuildIds: [], relatedPages: [], sections: [], faqs: [] },
  { kind: 'buildsHub', slug: 'wow-forever-mage-builds', intent: 'Builds Hub', title: 'B', h1: 'HB', description: 'd', eyebrow: 'e', canonical: 'https://buildforgetools.com/wow-forever-mage-builds', robots: 'index, follow', updatedAt: '2026-09-21', relatedBuildIds: [], relatedPages: [], sections: [], faqs: [] },
] as const

expect(() => assertUniquePageIntents([...pages, { ...pages[0], slug: 'dup' }])).toThrow(/intent/)
expect(pageFromPublishedClasses('/wow-forever-mage-builds', [{ id: 'mage', pages } as never])?.kind).toBe('buildsHub')
expect(pageFromPublishedClasses('/hunter', [{ id: 'mage', pages } as never])).toBeUndefined()
```

- [ ] **Step 2: Run the focused test and confirm it fails because the module is missing**

Run: `npm test -- src/lib/classPage.test.ts`

- [ ] **Step 3: Implement the types and helpers from the spec’s Data model section**

Keep `PUBLISHED_CLASSES` as an exported array owned by `src/data/classes/index.ts` if that keeps `classPage.ts` free of Mage imports. Lookup must not fall through to Paladin.

- [ ] **Step 4: Re-run the focused tests**

Run: `npm test -- src/lib/classPage.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/classPage.ts src/lib/classPage.test.ts src/data/classes/index.ts
git commit -m "$(cat <<'EOF'
feat: add class-neutral page registry types

EOF
)"
```

---

### Task 2: Dual-source Mage talent reconciliation

**Files:**
- Create: `src/lib/mageTalentReconcile.ts`
- Create: `src/lib/mageTalentReconcile.test.ts`
- Create: `scripts/import-mage-talents.ts`

**Interfaces:**
- Consumes: ForeverDiff and TheWoWDB snapshots as typed arrays of `{ name, branch, row, column, maxRank, rankDescriptions?, sourceTalentId?, prerequisiteName? }`.
- Produces: `reconcileMageTalents(foreverDiff, theWowDb) => { published, fieldConflicts, missingInA, missingInB }`.
- A node is **published** when planner-legal fields match: `name`, `branch`, `row`, `column`, `maxRank`.
- `rankDescriptions` / `sourceTalentId` disagreement records a `fieldConflicts` entry and does **not** drop the node. Single-source metadata is kept with `fieldEvidence` `client_datamined`. Identity-only-on-one-source goes to `missingInA` / `missingInB` and is not published.

- [ ] **Step 1: Write failing reconcile tests with field-level outcomes**

```ts
const iceLance = { name: 'Ice Lance', branch: 'frost', row: 5, column: 1, maxRank: 1, rankDescriptions: ['Deals 28 Frost damage to an enemy target.'] }
const frostboltA = { name: 'Improved Frostbolt', branch: 'frost', row: 1, column: 2, maxRank: 5, rankDescriptions: ['Reduces the casting time of your Frostbolt spell by 0.1 sec.', 'r2', 'r3', 'r4', 'r5'], sourceTalentId: 38 }
const frostboltB = { name: 'Improved Frostbolt', branch: 'frost', row: 1, column: 2, maxRank: 5, rankDescriptions: frostboltA.rankDescriptions }

const spellIdOnlyOnA = reconcileMageTalents([frostboltA], [frostboltB])
expect(spellIdOnlyOnA.published).toHaveLength(1)
expect(spellIdOnlyOnA.published[0].sourceTalentId).toBe(38)
expect(spellIdOnlyOnA.published[0].fieldEvidence.sourceTalentId).toBe('client_datamined')

expect(reconcileMageTalents([iceLance, frostboltA], [frostboltB]).published.map((t) => t.name)).toEqual(['Improved Frostbolt'])
expect(reconcileMageTalents([iceLance], []).missingInB.map((t) => t.name)).toEqual(['Ice Lance'])

const tooltipClash = reconcileMageTalents(
  [{ ...frostboltB, rankDescriptions: ['Forever text', '2', '3', '4', '5'] }],
  [{ ...frostboltB, rankDescriptions: ['Different text', '2', '3', '4', '5'] }],
)
expect(tooltipClash.published).toHaveLength(1)
expect(tooltipClash.published[0].rankDescriptions).toBeUndefined()
expect(tooltipClash.fieldConflicts[0]).toMatchObject({ name: 'Improved Frostbolt', field: 'rankDescriptions' })
```

Use realistic truncated rank arrays in the test file; every published `rankDescriptions` must have length `maxRank`.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/lib/mageTalentReconcile.test.ts`

- [ ] **Step 3: Implement exact-field equality reconcile (no fuzzy Classic fill-in)**

Prerequisite links publish only when both snapshots name the same parent. `requiredRank` stays null → later mapped to `derived_assumption`.

- [ ] **Step 4: Add `scripts/import-mage-talents.ts` that fetches both URLs, parses, writes normalized snapshots with `acquisition: 'fetch'`, prints a field-level evidence report, and writes production JSON for published planner-legal nodes even when metadata conflicts.**

Completeness check: after reconcile, each branch must have at least one row-1 talent and no published prerequisite pointing at an unpublished id. Do not hard-code a talent count. If fetch/parse fails, exit non-zero unless a snapshot with `acquisition: 'manual_snapshot'` is explicitly passed as a fallback flag.

- [ ] **Step 5: Re-run reconcile tests**

Run: `npm test -- src/lib/mageTalentReconcile.test.ts`

- [ ] **Step 6: Commit**

```bash
git add src/lib/mageTalentReconcile.ts src/lib/mageTalentReconcile.test.ts scripts/import-mage-talents.ts
git commit -m "$(cat <<'EOF'
feat: reconcile Mage talents from ForeverDiff and TheWoWDB

EOF
)"
```

---

### Task 3: Import snapshots, publish consensus JSON, download icons

**Files:**
- Create: `src/data/mage-source-foreverdiff-1.60.1.69913.json`
- Create: `src/data/mage-source-thewowdb-1.60.1.69913.json`
- Create: `src/data/mage-beta-1.60.1.69913.json`
- Create: `src/data/mageTalents.ts`
- Create: `src/data/mageTalents.test.ts`
- Create: `scripts/download-mage-icons.ts` (follow `scripts/download-talent-icons.ts` / Warrior icon script)

**Interfaces:**
- Produces: `mageTalents`, `MAGE_BRANCHES = ['arcane','fire','frost']`, `MAGE_DATA_VERSION = 'wow_forever_beta_1.60.1.69913'`, `MAGE_SOURCES` URLs exactly as in the spec.

- [ ] **Step 1: Write failing dataset tests that encode field-level evidence, not a guessed node count**

```ts
expect(MAGE_DATA_VERSION).toBe('wow_forever_beta_1.60.1.69913')
expect(new Set(mageTalents.map((t) => t.id)).size).toBe(mageTalents.length)
for (const talent of mageTalents) {
  expect(talent.fieldEvidence.row).toBe('client_verified')
  expect(talent.fieldEvidence.column).toBe('client_verified')
  expect(talent.fieldEvidence.maxRank).toBe('client_verified')
  expect(talent.sources).toHaveLength(2)
  expect(talent.verifiedThroughBuild).toBe('1.60.1.69913')
  if (talent.rankDescriptions) expect(talent.rankDescriptions).toHaveLength(talent.maxRank)
}
expect(mageTalents.some((t) => t.name === 'Ice Lance')).toBe(iceLanceDualPlannerLegal)
```

`iceLanceDualPlannerLegal` is true only when both source snapshots share Ice Lance at the same name, branch, row, column, and maxRank (tooltips need not match).

- [ ] **Step 2: Run `tsx scripts/import-mage-talents.ts` to fetch, parse, snapshot, reconcile, and write production JSON. Do not hand-copy tooltips. If a parser cannot read a page, stop and add a `manual_snapshot` with review notes rather than silently transcribing.**

- [ ] **Step 3: If either tree has zero published nodes in a branch, stop and do not create Mage routes. Framework + Hunter fixture may still proceed.**

- [ ] **Step 4: Implement `mageTalents.ts` mapping row/column to `x`/`y` using the same grid as Warrior (`columnX` 12.5/37.5/62.5/87.5, `rowY` 7…92.8).**

- [ ] **Step 5: Download icons for published `iconName` values only. Tests must `existsSync` each `talent.icon`.**

- [ ] **Step 6: Run `npm test -- src/data/mageTalents.test.ts src/lib/mageTalentReconcile.test.ts`**

- [ ] **Step 7: Commit**

```bash
git add src/data/mage-source-foreverdiff-1.60.1.69913.json src/data/mage-source-thewowdb-1.60.1.69913.json src/data/mage-beta-1.60.1.69913.json src/data/mageTalents.ts src/data/mageTalents.test.ts scripts/download-mage-icons.ts public/images/mage-talents
git commit -m "$(cat <<'EOF'
feat: import dual-source Mage talent dataset for build 69913

EOF
)"
```

---

### Task 4: Mage builds and 15-page `ClassDefinition`

**Files:**
- Create: `src/data/classes/mage.ts`
- Create: `src/data/classes/mage.test.ts`
- Modify: `src/data/classes/index.ts` to export `PUBLISHED_CLASSES = [mageClass]` **only after** Task 3 produced a planner-legal tree.

**Interfaces:**
- Consumes: `mageTalents`, `incrementPlannerTalent` / `encodePlannerBuild`.
- Produces: `mageClass: ClassDefinition<'arcane' | 'fire' | 'frost'>` with 15 pages whose titles/H1s match the spec table exactly.

- [ ] **Step 1: Write failing tests for 15 unique SEO fields, legal presets, and calculator loop links**

```ts
expect(mageClass.pages).toHaveLength(15)
assertUniquePageIntents(mageClass.pages)
expect(mageClass.pages.map((p) => p.slug).sort()).toEqual([
  'mage',
  'wow-forever-arcane-mage-build',
  'wow-forever-arcane-mage-leveling-build',
  'wow-forever-fire-mage-build',
  'wow-forever-fire-mage-leveling-build',
  'wow-forever-frost-mage-aoe-build',
  'wow-forever-frost-mage-build',
  'wow-forever-frost-mage-leveling-build',
  'wow-forever-frost-vs-fire-mage-leveling',
  'wow-forever-mage-builds',
  'wow-forever-mage-dungeon-build',
  'wow-forever-mage-level-20-build',
  'wow-forever-mage-leveling-build',
  'wow-forever-mage-pvp-build',
  'wow-forever-mage-talents',
].sort())
expect(mageClass.pages.find((p) => p.slug === 'mage')?.h1).toBe('WoW Forever Mage Talent Calculator')
for (const build of mageClass.builds) {
  expect(totalPlannerPoints(build.build)).toBe(build.points)
  expect(build.evidence === 'community_verified' || build.evidence === 'derived_assumption').toBe(true)
  expect(build.sources.length).toBeGreaterThan(0)
  expect(build.verifiedThroughBuild).toBe('1.60.1.69913')
  expect(build.levelCap).toBe(20)
  expect(build.phase).toBeTruthy()
  expect(build.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(build.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
}
for (const page of mageClass.pages) expect(page.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
```

Every `ClassBuild.order` must reconstruct `build` and remain increment-legal at `level` 20 unless the build is explicitly a Level 30 preview (none required in this branch). Arcane copy must include a Current Beta note **if** a listed `keyTalentIds` node has `requiredTreePoints > 11`.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/data/classes/mage.test.ts`

- [ ] **Step 3: Author editorial 11-point builds using only published talent ids. Frost leveling is the class-level recommendation. Frost AoE is a distinct allocation, not a copy of the Frost spec build. Do not write composite scores on the comparison page.**

Comparison table columns: Playstyle, AoE, Safety, Key mechanics, Current Beta. Values are editorial and must not invent unpublished talent names.

- [ ] **Step 4: Re-run Mage class tests plus `src/lib/classPage.test.ts`**

- [ ] **Step 5: Commit**

```bash
git add src/data/classes/mage.ts src/data/classes/mage.test.ts src/data/classes/index.ts
git commit -m "$(cat <<'EOF'
feat: add Mage ClassDefinition with 15 distinct intents

EOF
)"
```

---

### Task 5: Generic calculator and document renderers

**Files:**
- Create: `src/ClassCalculatorPage.tsx`
- Create: `src/ClassCalculatorPage.test.tsx`
- Create: `src/ClassDocumentPage.tsx`
- Create: `src/ClassDocumentPage.test.tsx`
- Create: `src/data/fixtures/hunterClass.fixture.ts`

**Interfaces:**
- Consumes: `ClassDefinition`.
- Produces: `ClassCalculatorPage({ classDef })`, `ClassDocumentPage({ classDef, page })`.
- Hunter fixture includes one page per `ClassPageKind` and a tiny talent set; it is not in `PUBLISHED_CLASSES`.

- [ ] **Step 1: Write failing Hunter fixture tests proving the renderer is class-agnostic**

```ts
render(<ClassCalculatorPage classDef={hunterClassFixture} />)
expect(screen.getByRole('heading', { level: 1, name: hunterClassFixture.pages[0].h1 })).toBeInTheDocument()
render(<ClassDocumentPage classDef={hunterClassFixture} page={hunterClassFixture.pages.find((p) => p.kind === 'comparison')!} />)
expect(screen.getByRole('heading', { level: 1, name: /Hunter/ })).toBeInTheDocument()
expect(() => require.resolve('../HunterPage.tsx')).toThrow()
```

Also test Mage calculator copy: recommended builds load `recommendedBuildIds`, copy-link writes `/mage?build=` and `level=`, localStorage uses `mageClass.storageKey` and does not write `wow-forever-warrior-build` or `wow-forever-paladin-build`.

Talent vs build chrome must both appear: “Client Verified” (or equivalent) on talent data, and “Community / Editorial Build” on presets. A preset must not be labeled only as client verified.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/ClassCalculatorPage.test.tsx src/ClassDocumentPage.test.tsx`

- [ ] **Step 3: Implement both pages. Document kinds render `sections`, selected talents from `primaryBuildId`, FAQ, related links, and `comparison` table when present. PvP kind renders one tab per spec that has a pvp-intent build. Talents kind lists every `classDef.talents` grouped by branch and `changeStatus`.**

Reuse existing CSS where possible (`warrior-page` patterns or a `class-page` stylesheet copied from Warrior). Do not import `warriorTalents`.

- [ ] **Step 4: Re-run renderer tests**

- [ ] **Step 5: Commit**

```bash
git add src/ClassCalculatorPage.tsx src/ClassCalculatorPage.test.tsx src/ClassDocumentPage.tsx src/ClassDocumentPage.test.tsx src/data/fixtures/hunterClass.fixture.ts src/styles.css
git commit -m "$(cat <<'EOF'
feat: render class calculator and document pages from ClassDefinition

EOF
)"
```

---

### Task 6: Routes, static shells, prerender, sitemap, Vercel

**Files:**
- Modify: `src/lib/routes.ts`, `src/lib/routes.test.ts`, `src/main.tsx`
- Modify: `src/lib/prerender.ts`, `src/lib/prerender.test.ts`, `scripts/prerender-pages.ts`
- Create: `scripts/sync-class-static-pages.ts`
- Modify: `vite.config.ts`, `vercel.json`, `public/sitemap.xml`
- Modify: `src/lib/internalLinks.test.ts`

**Interfaces:**
- `pageForPath` returns `{ kind: 'class-calculator' | 'class-document', classId, slug, title, description, canonical, robots }` for published class pages.
- `renderClassPrerender(classDef, page)` emits unique H1 and crawlable copy.

- [ ] **Step 1: Write failing route/sitemap/internal-link tests for all 15 Mage paths and assert `/hunter` is not a published canonical**

```ts
expect(pageForPath('/wow-forever-frost-mage-aoe-build')).toMatchObject({
  kind: 'class-document',
  title: 'WoW Forever Frost Mage AoE Build',
  canonical: 'https://buildforgetools.com/wow-forever-frost-mage-aoe-build',
  robots: 'index, follow',
})
expect(pageForPath('/mage').canonical).toBe('https://buildforgetools.com/mage')
expect(readFileSync('public/sitemap.xml', 'utf8')).not.toContain('https://buildforgetools.com/hunter')
```

- [ ] **Step 2: Implement `pageFromPublishedClasses` inside `pageForPath` without changing Paladin/Warrior/Emberville cases.**

- [ ] **Step 3: Generate one `index.html` shell per published slug (copy `warrior/index.html` marker `<!-- PAGES_PRERENDER -->`). Drive Vite inputs, Vercel rewrites, and sitemap rows from `PUBLISHED_CLASSES`. Sitemap `<lastmod>` is each page’s `updatedAt`. Tests fail if the writer emits a hardcoded date that does not equal `page.updatedAt`.**

- [ ] **Step 4: Prerender every published class page. Calculator prerender must include every published talent `name`. Build pages must include the allocation string and calculator href.**

- [ ] **Step 5: Wire `main.tsx`: class-calculator → `ClassCalculatorPage`, class-document → `ClassDocumentPage`. Add a Mage footer/discovery link on Warrior/Paladin footers without removing existing links.**

- [ ] **Step 6: Run `npm test -- src/lib/routes.test.ts src/lib/prerender.test.ts src/lib/internalLinks.test.ts src/lib/share-indexing.test.ts` and `npm run build`.**

- [ ] **Step 7: Commit**

```bash
git add src/lib/routes.ts src/main.tsx src/lib/prerender.ts scripts/prerender-pages.ts scripts/sync-class-static-pages.ts vite.config.ts vercel.json public/sitemap.xml mage wow-forever-mage-* src/lib/*.test.ts
git commit -m "$(cat <<'EOF'
feat: publish 15 Mage class pages from the shared registry

EOF
)"
```

---

### Task 7: Full verification

**Files:** none new unless a test fails.

- [ ] **Step 1: Run `npm test && npm run lint && npm run typecheck && npm run build`**

- [ ] **Step 2: Confirm dist HTML for all 15 Mage slugs contains the spec H1 and does not contain Hunter fixture copy.**

- [ ] **Step 3: Confirm Paladin `/paladin` title and Warrior `/warrior` title are unchanged.**

- [ ] **Step 4: Commit any test-only fixes; do not push unless asked.**

---

## Spec coverage

- Dual-source field-level importer → Tasks 2–3
- Fetch pipeline and manual_snapshot fallback → Task 3
- Talent vs build evidence + provenance timestamps → Tasks 4–5
- Sitemap lastmod from `updatedAt` → Task 6
- 15 URLs, titles, H1s, intents → Task 4
- Calculator behavior and share links → Task 5
- Page-kind content rules → Tasks 4–5
- Data-driven routes/prerender/sitemap → Task 6
- Hunter fixture without published URLs → Task 5–6
- Paladin/Warrior isolation → Tasks 6–7
