import { readFileSync } from "node:fs";
import { renderDailyAnalyticsReport, type DailyAnalyticsReport } from "../src/lib/analyticsReport";

const inputPath = process.argv[2];
const report: DailyAnalyticsReport = inputPath
  ? JSON.parse(readFileSync(inputPath, "utf8")) as DailyAnalyticsReport
  : {
      date: new Date().toISOString().slice(0, 10),
      gsc: { clicks: 0, impressions: 0, ctr: 0, averagePosition: 0, topQueries: [], topPages: [] },
      ga4: { organicSessions: 0, engagementRate: 0, averageSessionDuration: 0 },
      events: { talentClickUsers: 0, buildComplete: 0, buildCopy: 0, buildShare: 0 },
      notes: ["Replace zeros after GSC and GA4 data reaches final state."],
    };

console.log(renderDailyAnalyticsReport(report));

