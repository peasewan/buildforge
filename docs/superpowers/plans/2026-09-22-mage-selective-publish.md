# Mage Selective Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Publish the eight Mage URLs whose data dependencies are actually met, while `/mage` and every fire-build page stay unpublished until the two sources converge on fire's row-1 column.

**Spec:** `docs/superpowers/specs/2026-09-21-mage-class-template-design.md` — see its **Publish requirements** section, which this plan implements. That section supersedes the earlier class-wide gate.

**Branch:** `feat/mage-selective-publish`, cut from `main` after the class-neutral framework merged.

## Global Constraints

- Publish **exactly eight** URLs: `mage-talents`, `frost-mage-build`, `frost-mage-leveling-build`, `frost-mage-aoe-build`, `arcane-mage-build`, `arcane-mage-leveling-build`, `mage-leveling-build`, `mage-dungeon-build`.
- Do **not** publish these seven. Their definitions may exist; their URLs must not.

  | Withheld slug | Unmet requirement | Why |
  | --- | --- | --- |
  | `mage` | `completeClassPlanner` | fire has no allocatable entry point, so the three-tree calculator is broken |
  | `wow-forever-fire-mage-build` | `legalBuild:fire` | no legal fire allocation exists |
  | `wow-forever-fire-mage-leveling-build` | `legalBuild:fire` | same |
  | `wow-forever-mage-pvp-build` | `legalBuild:fire` | the spec gives it one tab per spec, so it needs a legal fire build |
  | `wow-forever-mage-builds` | `completeClassPlanner` | a hub cannot advertise a class whose calculator is withheld |
  | `wow-forever-mage-level-20-build` | `completeClassPlanner` | current-cap page spanning all three specs |
  | `wow-forever-frost-vs-fire-mage-leveling` | `legalBuild:fire` | compares fire leveling without a legal fire build |

  Eight published + seven withheld = the fifteen page definitions the spec requires.
- A withheld page has no route, no sitemap row, no prerender target, no Vite input and no Vercel rewrite — enforced by evaluating requirements, never by a hand-maintained list.
- Paladin, Warrior and Emberville pages, routes, titles, canonicals, storage keys and share codecs are unchanged.
- Build allocations are `community_verified` or `derived_assumption`, never client facts. Talent evidence and build evidence stay separate in the UI.
- No page may present a build it cannot deliver: no fire allocation anywhere, because fire has no allocatable entry point (`requiredTreePoints === 0` count is 0).
- TDD for every behavioural change.

## Verified facts this plan relies on

Measured against the merged dataset (`src/data/mage-beta-1.60.1.69913.json`, 30 nodes):

| Branch | published nodes | row-1 entry points | legal 11-point build |
| --- | --- | --- | --- |
| arcane | 10 | 2 | yes — spends all 11 |
| frost | 9 | 2 | yes — spends all 11 |
| fire | 11 | 0 | **no — spends 0** |

Root cause of fire's gap: `Improved Fireball` is row 1 on both sources but column 3 (ForeverDiff) vs column 2 (TheWoWDB), so the column disagreement drops it and no fire node has `requiredTreePoints === 0`.

---

### Task 1: Publish-requirement evaluation and a gated page lookup

**Files:** Modify `src/lib/classPage.ts`, `src/lib/classPage.test.ts`

**Interfaces:** Produces `PublishRequirement`, `satisfiedRequirements(classDef): Set<PublishRequirement>`, and a `pageFromPublishedClasses` that returns only pages whose requirements are met.

- [ ] **Step 1: Write failing tests.** Requirement vocabulary is `talentDataset` | `legalBuild:<branch>` | `completeClassPlanner` | `level20Builds`. Cover: a class with a legal branch satisfies `legalBuild:<that branch>` and withholds `legalBuild:<other branch>`; `completeClassPlanner` requires *every* branch to have a `requiredTreePoints === 0` node; a page whose requirement is unmet is not returned by the lookup even though its definition exists; a page with no `publishRequirements` is treated as needing `talentDataset`.
- [ ] **Step 2: Run and confirm failure.**
- [ ] **Step 3: Implement.** Derive entry points from `classDef.talents`; derive "has a legal build" from `classDef.builds` restricted to the branch. Do not read `mageTalents` — the helper must work for any `ClassDefinition`.
- [ ] **Step 4: Re-run.**
- [ ] **Step 5: Commit.**

---

### Task 2: The Mage `ClassDefinition`

**Files:** Create `src/data/classes/mage.ts`, `src/data/classes/mage.test.ts`; modify `src/data/classes/index.ts`

**Interfaces:** Consumes `mageTalents`, `MAGE_*` constants, the planner helpers. Produces `mageClass: ClassDefinition<'arcane' | 'fire' | 'frost'>` and `PUBLISHED_CLASSES = [mageClass]`.

- [ ] **Step 1: Write failing tests** for: the 15 page definitions exist with unique `intent`/`title`/`h1`/`canonical`; **exactly eight** have all their requirements met, and the unmet seven match the Global Constraints table slug for slug; every `ClassBuild` reconstructs from its `order` and is spendable at level 20 within 11 points; no build allocates fire.
- [ ] **Step 2: Run and confirm failure.**
- [ ] **Step 3: Author the 15 page definitions and the builds.** Frost leveling is the class-level recommendation. Frost AoE is a distinct allocation, not a copy of the frost spec build. No composite scores. Every build uses only published talent ids.
- [ ] **Step 4: Re-run**, plus `src/lib/classPage.test.ts`.
- [ ] **Step 5: Commit.**

---

### Task 3: Routes, prerender, static shells, sitemap, Vercel

**Files:** Modify `src/lib/routes.ts`, `src/lib/routes.test.ts`, `src/main.tsx`, `src/lib/prerender.ts`, `src/lib/prerender.test.ts`, `scripts/prerender-pages.ts`, `vite.config.ts`, `vercel.json`, `public/sitemap.xml`; create `scripts/sync-class-static-pages.ts`

- [ ] **Step 1: Write failing tests** for all eight published paths resolving to `{ kind: 'class-calculator' | 'class-document', classId, slug, ... }`, and for **each withheld path NOT resolving** — `/mage`, both fire builds, the pvp page, the hub, level-20 and frost-vs-fire must fall through to the existing default rather than matching a class page.
- [ ] **Step 2: Implement `pageFromPublishedClasses` inside `pageForPath`** without touching the Paladin/Warrior/Emberville cases.
- [ ] **Step 3: Generate one shell per published page** from the requirement-gated lookup — never from a hand-written slug list. Drive Vite inputs, Vercel rewrites and sitemap rows from the same source. Sitemap `<lastmod>` is each page's `updatedAt`.
- [ ] **Step 4: Prerender.** The calculator prerender must include every published talent name; build pages must include the allocation string. Neither may contain fire allocation copy. **Amended by R18:** the calculator href must be **absent** on a class whose calculator is withheld, so for these eight Mage pages it is asserted absent rather than required — see R17.
- [ ] **Step 5: Wire `main.tsx`.** Add Mage discovery links to the existing footers without removing any existing link.
- [ ] **Step 6: Run the route/prerender/internal-link/share-indexing tests and `npm run build`.**
- [ ] **Step 7: Commit.**

---

### Task 4: State the fire conflict on the talent catalogue, non-interactively

**Files:** Modify `src/ClassDocumentPage.tsx`, `src/ClassDocumentPage.test.tsx`, `src/styles.css`

- [ ] **Step 1: Write failing tests.** The fire branch is visible on the catalogue page and each fire node is marked as excluded from build validation with the reason; a marked node **cannot be allocated** — assert the exclusion is enforced, not merely labelled; the exclusion marker is visually and textually distinct from both the client-verified and editorial chrome, so it cannot be mistaken for either.
- [ ] **Step 2: Run and confirm failure.**
- [ ] **Step 3: Implement.** Withheld-branch nodes appear in the catalogue with their conflict stated. They must not be present in any build preset or copyable allocation.
- [ ] **Step 4: Re-run.**
- [ ] **Step 5: Commit.**

---

### Task 5: Full verification

- [ ] **Step 1:** `npm test && npm run lint && npm run typecheck && npm run build`
- [ ] **Step 2:** Confirm dist contains exactly the eight Mage slugs and no HTML page for the seven withheld ones.
- [ ] **Step 3:** Confirm `/paladin` and `/warrior` titles are unchanged from the merge base.
- [ ] **Step 4:** Confirm no withheld slug appears in sitemap, vercel rewrites, or Vite inputs.
