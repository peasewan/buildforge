# BuildForge

BuildForge is a visual WoW Forever Paladin talent planner for Holy, Protection, and Retribution builds.

> **Beta talent data.** The current Paladin planner uses reviewed client build 1.60.1.70245 with 50 nodes (Holy 17, Protection 16, Retribution 17). The 52-node 69913 archive remains available for historical comparisons and removed-talent allocations. Rank descriptions are adapted from the Talents Forever 70170 export under CC BY 4.0 with community verification; client structure, official tuning and editorial allocations remain separate evidence.

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```

Current Paladin identities, positions, rank caps and prerequisite links carry client verification. Rank text carries community verification; prerequisite-rank rules and point budgets remain derived assumptions. Existing allocations are planning examples, with no performance ranking implied. See [the integration review](data/reviews/1.60.1.70245/integration-2026-10-09.md) for source checks and limits.
