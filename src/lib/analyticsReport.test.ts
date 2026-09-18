import { describe, expect, it } from "vitest";
import { renderDailyAnalyticsReport } from "./analyticsReport";

describe("daily analytics report", () => {
  it("renders search, engagement, and product events in a stable template", () => {
    const report = renderDailyAnalyticsReport({
      date: "2026-09-18",
      gsc: { clicks: 9, impressions: 306, ctr: 0.0294, averagePosition: 11, topQueries: [], topPages: [] },
      ga4: { organicSessions: 37, engagementRate: 0.6486, averageSessionDuration: 52.9 },
      events: { talentClickUsers: 4, buildComplete: 1, buildCopy: 3, buildShare: 3 },
      notes: ["GSC data finality pending"],
    });
    expect(report).toContain("9 clicks / 306 impressions");
    expect(report).toContain("CTR: 2.94%");
    expect(report).toContain("Organic sessions: 37");
    expect(report).toContain("Talent click users: 4");
    expect(report).toContain("GSC data finality pending");
  });
});
