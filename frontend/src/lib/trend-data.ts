import type {
  DailyRevenueData,
  GroupedTrendPoint,
  ProcessedTrendPoint,
  TrendGroupBy,
  UngroupedTrendPoint,
} from "@/lib/types";

export function processTrendData(
  dailyRevenue: DailyRevenueData | null,
  trendGroupBy: TrendGroupBy,
): ProcessedTrendPoint[] {
  if (!dailyRevenue?.data) return [];

  const rawList = dailyRevenue.data;

  if (!trendGroupBy) {
    const dailyTotals = new Map<string, number>();
    rawList.forEach((d) => {
      const day = d.date.split("T")[0];
      dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + d.net_revenue);
    });
    const sorted = [...dailyTotals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, net_revenue]) => ({ date, net_revenue }));

    return sorted.map((d, index): UngroupedTrendPoint => {
      const start30 = Math.max(0, index - 29);
      const sub30 = sorted.slice(start30, index + 1);
      const ma30 = sub30.reduce((acc, curr) => acc + curr.net_revenue, 0) / sub30.length;

      const start90 = Math.max(0, index - 89);
      const sub90 = sorted.slice(start90, index + 1);
      const ma90 = sub90.reduce((acc, curr) => acc + curr.net_revenue, 0) / sub90.length;

      return {
        date: d.date,
        revenue: d.net_revenue,
        ma30,
        ma90,
      };
    });
  }

  const groups = Array.from(
    new Set(rawList.map((d) => d[trendGroupBy]).filter((g): g is string => typeof g === "string")),
  );
  const dateMap: Record<string, Record<string, number>> = {};

  rawList.forEach((d) => {
    const day = d.date.split("T")[0];
    const groupValue = d[trendGroupBy];
    if (typeof groupValue !== "string") return;
    if (!dateMap[day]) dateMap[day] = {};
    dateMap[day][groupValue] = d.net_revenue;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const groupHistories: Record<string, number[]> = {};
  groups.forEach((g) => {
    groupHistories[g] = [];
  });

  return sortedDates.map((day) => {
    const row: GroupedTrendPoint = { date: day };
    groups.forEach((g) => {
      const rev = dateMap[day][g] ?? 0;
      groupHistories[g].push(rev);
      if (groupHistories[g].length > 30) groupHistories[g].shift();
      const sum = groupHistories[g].reduce((a, b) => a + b, 0);
      row[g] = sum / groupHistories[g].length;
    });
    return row;
  });
}
