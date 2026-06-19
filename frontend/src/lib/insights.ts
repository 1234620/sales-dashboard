import type { AnomaliesSection, OverviewSection, RegionalSection } from "@/lib/types";
import { MAPE_THRESHOLD } from "@/components/dashboard/constants";

export function buildInsights(input: {
  overview: OverviewSection;
  regional: RegionalSection;
  anomalies: AnomaliesSection;
  forecastMape?: number | null;
}): string[] {
  const insights: string[] = [];
  const { overview, regional, anomalies, forecastMape } = input;

  const trend = overview.data?.trend.data;
  if (trend && trend.length >= 2) {
    const lastTwo = trend.slice(-2);
    if (
      lastTwo.every((p) => (p.mom_growth_pct ?? 0) < 0) &&
      lastTwo[1].mom_growth_pct !== null
    ) {
      insights.push("MoM revenue growth has been negative for 2 consecutive months.");
    }
  }

  const topRegion = regional.data?.[0];
  if (topRegion && topRegion.share_pct > 35) {
    insights.push(`${topRegion.region} accounts for ${topRegion.share_pct.toFixed(1)}% of revenue.`);
  }

  const anomalyCount = anomalies.data?.flagged.anomalies_count;
  if (anomalyCount !== undefined && anomalyCount > 0) {
    insights.push(`${anomalyCount} anomalous revenue day(s) flagged in the selected period.`);
  }

  if (forecastMape !== null && forecastMape !== undefined && forecastMape > MAPE_THRESHOLD) {
    insights.push(
      `Forecast MAPE (${forecastMape.toFixed(1)}%) exceeds the ${MAPE_THRESHOLD}% threshold.`,
    );
  }

  const kpis = overview.data?.kpis;
  if (kpis && kpis.discount_impact_rate > 0.08) {
    insights.push(
      `Discount impact is elevated at ${(kpis.discount_impact_rate * 100).toFixed(1)}% of gross.`,
    );
  }

  if (insights.length === 0) {
    insights.push("No notable alerts for the current filter selection.");
  }

  return insights;
}
