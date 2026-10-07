# Glimmerwick practical help release

## Scope
Improve the four existing Glimmerwick pages with actionable help and return-to-task behavior. Preserve URLs, titles, H1s, canonicals, crop evidence and every other game's content. No new routes, crop values, spell catalog, login requirement or game-save integration.

- Spellcasting: problem selector for short songs, score concerns, first tilling lesson and unknown issues. Answers carry separate release/Demo evidence, next actions and source links.
- First days: retain the v1 saved checklist; derive the next unchecked milestone, link to its card, show total progress and offer the garden planner on completion. Resume works with existing saved records; storage failures remain explicit.
- Garden well: reserve/sell, missing watering can and non-sellable item help. Edit a saved row's Keep quantity without recreating the row. Invalid drafts never change saved quantities or estimated proceeds, and explain the last-valid-value fallback beside the input.
- Garden planner: prominent links to the three specific tasks. Crop timing/yield/price/season fields remain unknown.
- Sitemap: update only the four affected pages' lastmod values. No route count changes.

## Evidence reviewed October 7
Steam ISteamNews/GetNewsForApp (appid 1706510, official Community Announcements feed) supplied the complete developer notes. Followed each feed redirect to its permanent announcement:

- Release 1.03: https://steamcommunity.com/games/1706510/announcements/detail/680763661892976649
  - Some songs have only a short version, including Alchemical Resonance.
  - Replacement watering cans sold by Kavita; dropped cans may be behind the well. No generic sold-item recovery claim.
- Release 1.02: https://steamcommunity.com/games/1706510/announcements/detail/680763027479332635
  - Mountain bees made non-sellable. This does not establish sellability of every other item.
- Existing Demo 0.466 stars/casting distinction remains labelled Demo; tilling tutorial footage remains Demo evidence.
- Original enrollment and well walkthroughs remain community references. No fresh claim that all launch mechanics were tested in-game.

## Analytics
`glimmerwick_help_select` records only a fixed topic/issue ID. `glimmerwick_checklist_step` records a fixed step ID and checked 0/1. Both use the existing production-host/consent-aware analytics pipeline. No item names, prices, personal notes or saved records are sent.

## Verification
Behavior tests exercise next-step progression, reload persistence, completed/reset states, independent troubleshooting selections, keep-count updates, invalid draft rejection and stored-value preservation. Existing malformed/blocked-storage coverage remains. Integration checks preserve route metadata and links.

Final local verification: 114 test files / 1552 tests passed; TypeScript and ESLint passed; production build prerendered 163 pages and SEO validation passed 163/163 with 22 frozen pages, zero errors and one existing advisory. Existing bundle-size and jsdom navigation notices remain. Browser checks confirmed symptom switching, checklist persistence across reload, valid/invalid Keep editing and persisted estimates. Narrow viewport DOM checks found no document-level horizontal overflow; the ledger uses its existing scroll container.
