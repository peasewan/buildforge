export interface DailyAnalyticsReport {
  date: string;
  gsc: {
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
    topQueries: Array<{ query: string; clicks: number; impressions: number; position: number }>;
    topPages: Array<{ page: string; clicks: number; impressions: number; position: number }>;
  };
  ga4: { organicSessions: number; engagementRate: number; averageSessionDuration: number };
  events: { talentClickUsers: number; buildComplete: number; buildCopy: number; buildShare: number };
  notes: string[];
}

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

export function renderDailyAnalyticsReport(report: DailyAnalyticsReport): string {
  const queryRows = report.gsc.topQueries.map((item) => `| ${item.query} | ${item.clicks} | ${item.impressions} | ${item.position.toFixed(1)} |`).join("\n") || "| — | 0 | 0 | — |";
  const pageRows = report.gsc.topPages.map((item) => `| ${item.page} | ${item.clicks} | ${item.impressions} | ${item.position.toFixed(1)} |`).join("\n") || "| — | 0 | 0 | — |";
  return `# BuildForge Daily Analytics — ${report.date}

## Search

- ${report.gsc.clicks} clicks / ${report.gsc.impressions} impressions
- CTR: ${percent(report.gsc.ctr)}
- Average position: ${report.gsc.averagePosition.toFixed(1)}

### Top queries

| Query | Clicks | Impressions | Position |
| --- | ---: | ---: | ---: |
${queryRows}

### Top landing pages

| Page | Clicks | Impressions | Position |
| --- | ---: | ---: | ---: |
${pageRows}

## Organic engagement

- Organic sessions: ${report.ga4.organicSessions}
- Engagement rate: ${percent(report.ga4.engagementRate)}
- Average session duration: ${report.ga4.averageSessionDuration.toFixed(1)} seconds

## Product events

- Talent click users: ${report.events.talentClickUsers}
- Build complete: ${report.events.buildComplete}
- Build copy: ${report.events.buildCopy}
- Build share: ${report.events.buildShare}

## Notes

${report.notes.map((note) => `- ${note}`).join("\n") || "- None"}
`;
}

