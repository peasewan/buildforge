# Dungeon finder, class picker and measurable calculator funnel

Authorized: implement in an isolated worktree, verify, push main and deploy without another approval step.

1. Build a source-linked dungeon catalogue (Hall of Thanes 13–18, Ruins of Lordaeron 15–20). Excavation Site 24–29 stays unavailable until a reviewed dataset supports it. These are reference ranges, not live access confirmations.
2. Derive available routes from published pages and legal allocations. Generate level snapshots by replaying existing talent orders. The calculator uses its existing planning modes; lower-level snapshots open as partial allocations in Level 20 mode, explicitly explained.
3. Build an editorial class/spec preference matcher, without power rankings or invented time-efficiency metrics. Show reasons, alternatives and links to published builds/calculators.
4. Keep Paladin datasets and existing SEO metadata unchanged. Exclude the known obsolete Protection Paladin route containing Improved Holy Strike. Clearly disclose that the catalogue uses reviewed 69913-era data and has not incorporated September 24 tuning.
5. Publish exactly two new URLs, connect them from discovery pages, update static shells/rewrites/sitemap.
6. Unify calculator_open/view_planner/build_complete/build_copy across classes. Completion requires a successful manual transition to the selected budget; deduplicate per class, budget and allocation per session. Do not count preset initialization or failed clipboard writes.
7. Verify model boundaries, interaction, tracking, all tests, typecheck, lint, production build, SEO and unchanged Paladin metadata. Push main, confirm production renders the tools and submit the sitemap to GSC.

Integration: remote main shipped the unified funnel in `cba2053` during this task. Reuse that implementation and its tests; remove the duplicate local implementation. Preserve the concurrent Songs of Glimmerwick release as well.
