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

