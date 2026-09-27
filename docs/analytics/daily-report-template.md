# BuildForge Daily Analytics Template

Generate a blank report:

```bash
npm run analytics:report
```

Generate a completed report from a JSON input matching `DailyAnalyticsReport`:

```bash
npm run analytics:report -- reports/2026-09-20.json
```

The stable decision set is: GSC clicks, impressions, CTR, average position, top queries and landing pages; GA4 organic sessions, engagement rate, average session duration; and users/events for `talent_click`, `build_complete`, `build_copy`, and `build_shared`.


## Unified calculator funnel (2026-09-27)

Production instrumentation now uses the same canonical events across all nine WoW classes:

| Event | Meaning | Counting rule |
| --- | --- | --- |
| `calculator_open` | An existing calculator link or Paladin entry button was clicked | One per actual click; this is intent, not proof the destination loaded |
| `view_planner` | The calculator entry controls entered the viewport | Once per mounted calculator page, including StrictMode; first visible level mode |
| `talent_click` | A manual click successfully added one rank | Existing event retained; maxed or locked clicks do not count |
| `build_complete` | A manual addition reached the active point budget | Once per class, level, budget and allocation per browser session |
| `build_copy` | The build URL was successfully copied | Clipboard API or supported fallback must succeed |

`calculator_open` includes `class`, source `page_path`, `target_path`, and `placement` (`hero`, `navigation`, `footer`, `content`). Visibility/completion/copy include `class`, `page_path`, `level`, and `point_cap`. Completion also includes points, branch, selected talent count and `completion_source=manual`. Payloads do not include share query strings or build codes.

Loading a preset, opening a shared URL, restoring a saved allocation or changing level never automatically fires `build_complete`. Refund/refill and refresh cannot recount an already claimed allocation in the same session. When browser session storage is unavailable, in-memory deduplication remains active for the mounted page.

The Paladin calculator retains its existing 51-point budget. Shared generic calculators use their selected level's published budget. Paladin's old unscoped session claims are respected after this upgrade.

For backward compatibility, the existing `<class>_build_copy` events remain alongside `build_copy`; do not sum both. `build_shared` remains the legacy Paladin successful-copy event and is **not** a whole-site adoption count or proof another person opened the link. Only Paladin continues to report to its existing build-usage endpoint.

Compare event users as well as counts, and segment by Organic Search and landing page. A low `calculator_open` rate suggests the entry needs work; opens without `view_planner` suggest navigation/loading issues; views without talent clicks suggest the calculator needs work. Session-scoped funnel analysis is required: dividing unrelated aggregate event counts does not prove conversion.

Mark this deployment as a measurement change. Older `build_copy` data included attempts on Paladin and omitted generic class copies; older `view_planner`/`build_complete` covered Paladin only. Do not backfill or interpret a post-release increase as traffic growth. `page_view` behavior is unchanged.

Register event-scoped GA4 dimensions for `class`, `placement`, `level`, and `point_cap` if they are not already present before relying on those fields in standard reports. New event parameters do not retroactively populate historical custom-dimension data.
