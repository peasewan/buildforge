# Intent Surface v2 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for bounded implementation and review.

**Goal:** Make the first useful action and page composition visibly different across published non-Paladin class intents, while preserving the 22 Paladin pages and existing URL/SEO metadata.

**Architecture:** Keep shared ClassDefinition, editorials and calculators. Validate fresh rendered artifacts first. Change only ClassExperiencePage and scoped intent components for non-Paladin pages; give each intent its own top-level module, order supporting evidence/editorial content by intent, and add evidence-qualified class signature panels sourced from existing profiles. Start with seven Warrior visual QA routes, then let the shared composition cover all other published non-Paladin pages.

**Tech Stack:** React, TypeScript, Vite prerender, Vitest, JSDOM, Vercel.

**Spec:** User's pasted “页面体验像同一张模板皮肤” design, 2026-09-23; current classes and publish gate in src/lib/classPage.ts.

## Global constraints

- Do not change Paladin rendered bodies, links, SEO metadata or sitemap dates; compare committed 22-page frozen baseline after every build.
- Keep all existing URLs, titles, H1 text, canonical, robots, sitemap entries, published inventory, beta source/version claims, calculator allocation/link behavior.
- No unsupported game abilities, performance claims or invented pet/totem values. Editorial prompts are labeled as such; empty source fields stay unknown.
- Leave Beta watcher paused.
- Production main push, Vercel deploy and verification are already authorized by the user.

## Task 1: Rendered artifact gate

**Files:** scripts/seo-validate.ts, scripts/seo/validate.ts, scripts/seo/validate.test.ts, .github/workflows/quality.yml if needed.

**Interfaces:** For every published non-Paladin class document enabled by `experienceEnabled(path)`, the built HTML must contain exactly one `main.class-page.intent-page[data-intent-page=kind]`, exactly one `[data-experience-kind=kind]`, and no `main.class-document`. Exempt calculator routes rendered by ClassCalculatorPage.

- [ ] Write a fixture with an enabled route containing old `class-document`; assert validator errors on stale rendered layout and kind mismatch.
- [ ] Run the fixture and observe failure; implement the smallest artifact assertion in the existing SEO validator adapter/pure module.
- [ ] Rebuild from current source; prove the previously stale Fury Warrior Leveling HTML now carries `intent-page` and `data-experience-kind="specLeveling"`.
- [ ] Run `npm run seo:validate`, preserve all 22 frozen hashes and 153 sitemap URLs; commit.

## Task 2: Warrior intent composition pilot

**Files:** src/experiences/ClassExperiencePage.tsx, src/experiences/ClassIntentExperience.tsx, src/experiences/experience.css, focused component tests.

**Interfaces:** `data-intent-page` stays stable; add a `data-surface` marker on each top-level interactive module. Each kind has a distinct first interactive control/task; support section order is an explicit function of page kind, not the same fixed post-tool order. H1/meta remain present.

- [ ] Test seven Warrior routes: Hub, Fury Build, Fury Leveling, Arms PvP, Protection Dungeon, Warrior Talents, Arms vs Fury. Assert their first `data-surface` values and user-action controls differ.
- [ ] Replace the repeated large hero with a compact intent-aware title treatment; put the active tool adjacent to the title in the first viewport.
- [ ] Keep the existing BuildWorkbench/Progression/TalentReference/Comparison/Hub behavior, but give them distinct first-panel arrangement and `data-surface` markers.
- [ ] Move supporting editorial/evidence/FAQ/related sections behind a kind-specific order without deleting any content or anchors. Ensure evidence remains readable.
- [ ] Test desktop 1440x900 and mobile 390x844 for all seven, no horizontal overflow; capture screenshots and check feature is visible within first viewport.

## Task 3: Split role intents

**Files:** src/experiences/RoleIntentSurfaces.tsx, src/experiences/role-surfaces.css, src/experiences/ClassIntentExperience.tsx and focused tests.

**Interfaces:** Export distinct `PvpPlanner`, `DungeonPlanner`, `TankPlanner`, `HealingPlanner`, `PetPlanner`, `TotemPlanner`; each accepts `{classDef,page}` and emits its kind's `data-surface` and a class-specific action or evidence view. Remove the shared `RoleExperience` dispatch. Reuse only non-visual data helpers.

- [ ] Test each role with existing class data: distinct controls and module sequence, legal edited allocation, explicit source gaps for missing mechanics.
- [ ] Implement PvP matchup/pressure checks; dungeon pull prep; tank threat/mitigation inventory; healing mana/support comparison; pet supporting-talent view; totem coverage and limitations. Do not assert undocumented ability effects.
- [ ] Route all eight role kinds to their distinct component; keep existing PageDefinitions, links, optional diff behavior.
- [ ] Run focused tests and SEO gate; commit.

## Task 4: Class signatures and cross-class rollout

**Files:** src/experiences/ClassSignature.tsx, scoped CSS, src/experiences/ClassExperiencePage.tsx, src/data/expansion/createClass.ts and focused tests as needed.

**Interfaces:** Every non-Paladin class exposes an evidence-qualified signature module on Builds Hub, general Leveling, one class feature route and one core spec page; use only source-backed or explicitly editorial testing prompts, not new data records.

- [ ] Test that Warrior, Mage, Rogue, Priest, Druid, Warlock, Hunter, Shaman each render a meaningful signature on required available routes, and no Paladin route changes.
- [ ] Use profile/class-specific prompts and talent names to render distinct planning flows; avoid an eightfold boilerplate card with merely replaced nouns.
- [ ] Vary the editorial section sequence/heading emphasis where six-class generator creates repeated outlines; keep editorial claims tied to existing profiles.
- [ ] Inspect representative routes for every class, then run all published-route surface checks. Commit.

## Task 5: Release acceptance

- [ ] Run full tests, typecheck, lint, build, SEO validator, fresh-dist intent checks, existing pipeline checks.
- [ ] Compare 22 protected Paladin page hashes and all existing title/H1/description/canonical/robots/sitemap dates to baseline; confirm 153 inventory.
- [ ] Review seven Warrior 1440x900 screenshots side by side with H1 mentally ignored; confirm intent is visually identifiable from task order and controls. Check mobile 390x844.
- [ ] Review diff; fast-forward main and push without force; wait for exact-SHA CI/Vercel.
- [ ] Verify all 153 production URLs against built candidate and assets, plus share noindex and www redirect. GSC sitemap is unchanged; resubmit only if URL inventory or sitemap content changed.
