# Warrior MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a verified Warrior talent calculator and five supporting SEO pages without changing existing Paladin behavior.

**Architecture:** Extract a class-neutral allocation engine behind the existing Paladin adapter, then add a Warrior adapter, versioned dataset, calculator shell, shared build-page template, and static prerender targets. Warrior state, URLs, events, and content stay isolated from Paladin while both use the same allocation rules.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, static HTML prerendering, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-21-warrior-mvp-design.md`

## Global Constraints

- Publish exactly six Warrior URLs in the first release.
- Use WoW Forever Beta client build `1.60.1.69913` data with source records.
- Treat Level 20 as current; Level 30 and Level 60 are planning modes.
- Do not claim a preset is proven best.
- Do not change Paladin URLs, canonical metadata, storage, share links, or behavior.
- Use test-driven development for every behavioral change.

---

### Task 1: Generic Talent Allocation Engine

**Files:**
- Create: `src/lib/talentPlanner.ts`
- Create: `src/lib/talentPlanner.test.ts`
- Modify: `src/lib/build.ts`
- Test: `src/lib/build.test.ts`

**Interfaces:**
- Produces: `PlannerTalent<B>`, `PlannerConfig<B>`, `incrementPlannerTalent`, `decrementPlannerTalent`, `plannerLockReason`, `encodePlannerBuild`, and `decodePlannerBuild`.
- Preserves: every existing export from `src/lib/build.ts` as the Paladin adapter.

- [ ] **Step 1: Write failing generic-engine tests**

```ts
const config = { branches: ['left', 'right'] as const, pointCap: 11 }
expect(incrementPlannerTalent({}, root, talents, config)).toEqual({ root: 1 })
expect(plannerLockReason({}, tierTwo, talents, config)).toMatchObject({ type: 'branch-points', required: 5 })
```

- [ ] **Step 2: Run the focused tests and verify they fail because the generic API is missing**

Run: `npm test -- src/lib/talentPlanner.test.ts`

- [ ] **Step 3: Implement the class-neutral engine and make `build.ts` delegate to it**

```ts
export interface PlannerConfig<B extends string> {
  branches: readonly B[]
  pointCap: number
}
```

- [ ] **Step 4: Verify generic and existing Paladin engine tests**

Run: `npm test -- src/lib/talentPlanner.test.ts src/lib/build.test.ts src/App.test.tsx`

### Task 2: Warrior 69913 Dataset and Presets

**Files:**
- Create: `src/data/warrior-beta-1.60.1.69913.json`
- Create: `src/data/warriorTalents.ts`
- Create: `src/data/warriorTalents.test.ts`
- Create: `src/data/warriorBuilds.ts`
- Create: `src/data/warriorBuilds.test.ts`
- Create: `scripts/import-warrior-talents.ts`
- Create: `scripts/download-warrior-icons.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `WarriorBranch = 'arms' | 'fury' | 'protection'`, `warriorTalents`, `WARRIOR_DATA_VERSION`, `WARRIOR_LEVEL_MODES`, `WARRIOR_LEVEL_20_BUILDS`.
- Each talent satisfies the generic `PlannerTalent<WarriorBranch>` contract.

- [ ] **Step 1: Write failing dataset validation tests**

```ts
expect(warriorTalents).toHaveLength(51)
expect(new Set(warriorTalents.map((talent) => talent.id)).size).toBe(51)
expect(warriorTalents.every((talent) => talent.sources.length >= 2)).toBe(true)
```

- [ ] **Step 2: Run the focused tests and verify missing Warrior data fails**

Run: `npm test -- src/data/warriorTalents.test.ts src/data/warriorBuilds.test.ts`

- [ ] **Step 3: Import and normalize the complete 69913 tree**

The importer records branch, zero-based row and column, max rank, every available rank description, prerequisite, change status, icon name, and both reviewed source URLs. It rejects unreadable or duplicated public nodes.

- [ ] **Step 4: Add and validate three legal Level 20 presets**

```ts
export const WARRIOR_LEVEL_20_BUILDS = {
  arms: { level: 20, allocation: '11/0/0', build: armsLevel20Build },
  fury: { level: 20, allocation: '0/11/0', build: furyLevel20Build },
  protection: { level: 20, allocation: '0/0/11', build: protectionLevel20Build },
}
```

- [ ] **Step 5: Download available icons locally and verify every public node has an asset or explicit reviewed fallback**

Run: `npm run warrior:icons && npm test -- src/data/warriorTalents.test.ts src/data/warriorBuilds.test.ts`

### Task 3: Warrior Calculator and Sharing

**Files:**
- Create: `src/WarriorPage.tsx`
- Create: `src/WarriorPage.test.tsx`
- Create: `src/WarriorTalentTree.tsx`
- Create: `src/lib/warriorShare.ts`
- Create: `src/lib/warriorShare.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `warriorTalents`, `WARRIOR_LEVEL_MODES`, `WARRIOR_LEVEL_20_BUILDS`, generic planner functions.
- Produces: calculator UI and `/warrior?build=<code>&level=<mode>` share links.

- [ ] **Step 1: Write failing share-codec and page interaction tests**

```ts
expect(decodeWarriorShare(encodeWarriorShare(build, 20))).toEqual({ build, level: 20 })
fireEvent.click(screen.getByRole('button', { name: 'Protection' }))
fireEvent.click(screen.getByRole('button', { name: 'Load Protection Level 20 build' }))
expect(screen.getByText('0 / 0 / 11')).toBeTruthy()
```

- [ ] **Step 2: Run focused tests and observe the missing UI and codec failures**

Run: `npm test -- src/WarriorPage.test.tsx src/lib/warriorShare.test.ts`

- [ ] **Step 3: Implement level modes, tree interaction, reset, local persistence, preset load, and share copy**

Use storage key `wow-forever-warrior-build`. Emit only the Warrior event names listed in the design.

- [ ] **Step 4: Verify calculator behavior and Paladin isolation**

Run: `npm test -- src/WarriorPage.test.tsx src/lib/warriorShare.test.ts src/App.test.tsx src/lib/buildCompletion.test.ts`

### Task 4: Warrior Hub and Four Build Pages

**Files:**
- Create: `src/data/warriorPages.ts`
- Create: `src/data/warriorPages.test.ts`
- Create: `src/WarriorBuildsHub.tsx`
- Create: `src/WarriorBuildsHub.test.tsx`
- Create: `src/WarriorBuildPage.tsx`
- Create: `src/WarriorBuildPage.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: one hub configuration and four unique build-page configurations keyed by `leveling`, `arms`, `fury`, and `protection`.
- Every CTA uses `warriorPlannerHref(build, level)` and loads a validated preset.

- [ ] **Step 1: Write failing page-data uniqueness and CTA tests**

```ts
expect(new Set(WARRIOR_BUILD_PAGES.map((page) => page.title)).size).toBe(4)
expect(screen.getByRole('link', { name: /Open in Warrior Calculator/ })).toHaveAttribute('href', expect.stringContaining('/warrior?build='))
```

- [ ] **Step 2: Run focused tests and verify the missing page modules fail**

Run: `npm test -- src/data/warriorPages.test.ts src/WarriorBuildsHub.test.tsx src/WarriorBuildPage.test.tsx`

- [ ] **Step 3: Implement the hub and shared build-page component with unique crawlable sections**

Each build page includes current-cap status, exact allocation, levels 10–20 talent order, evidence label, explanation, limitations, FAQ, and calculator CTA.

- [ ] **Step 4: Verify all page component tests**

Run: `npm test -- src/data/warriorPages.test.ts src/WarriorBuildsHub.test.tsx src/WarriorBuildPage.test.tsx`

### Task 5: Routing, Prerendering, Sitemap, and Internal Links

**Files:**
- Modify: `src/lib/routes.ts`
- Modify: `src/lib/routes.test.ts`
- Modify: `src/main.tsx`
- Modify: `src/lib/prerender.ts`
- Modify: `src/lib/prerender.test.ts`
- Modify: `scripts/prerender-pages.ts`
- Modify: `vite.config.ts`
- Modify: `vercel.json`
- Modify: `public/sitemap.xml`
- Modify: `src/SiteFooter.tsx`
- Create: `warrior/index.html`
- Create: `wow-forever-warrior-builds/index.html`
- Create: `wow-forever-warrior-leveling-build/index.html`
- Create: `wow-forever-arms-warrior-build/index.html`
- Create: `wow-forever-fury-warrior-build/index.html`
- Create: `wow-forever-protection-warrior-build/index.html`

**Interfaces:**
- Produces: six indexable route definitions and six built HTML entry points.

- [ ] **Step 1: Write failing route and prerender tests for all six URLs**

```ts
expect(pageForPath('/warrior')).toMatchObject({ kind: 'warrior-planner', robots: 'index, follow' })
expect(renderWarriorPlannerPrerender().match(/data-warrior-talent/g)).toHaveLength(51)
```

- [ ] **Step 2: Run focused tests and verify missing routes/prerenders fail**

Run: `npm test -- src/lib/routes.test.ts src/lib/prerender.test.ts src/lib/static-pages.test.ts src/lib/internalLinks.test.ts`

- [ ] **Step 3: Add route rendering, metadata, static entry files, Vercel rewrites, sitemap records, and footer links**

- [ ] **Step 4: Build and inspect generated HTML**

Run: `npm run build`

Expected: all six directories exist in `dist`; `/warrior` prerender contains 53 talent records; every focused page contains one H1 and its calculator deep link.

### Task 6: Full Verification and Release

**Files:**
- Modify only files required by failures found during verification.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`

- [ ] **Step 2: Run lint and production build**

Run: `npm run lint && npm run build`

- [ ] **Step 3: Validate data and working tree**

Run: `npm run talents:validate && git diff --check && git status --short`

- [ ] **Step 4: Commit and publish to `main`**

Commit message: `feat: launch Warrior talent planner`

- [ ] **Step 5: Verify Vercel and production HTTP output**

Check each URL for HTTP 200, correct canonical, one H1, index/follow, and static Warrior content. Confirm the GitHub Vercel status is successful.
