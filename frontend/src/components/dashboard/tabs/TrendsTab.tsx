"use client";

import { GROUPED_LINE_STYLES } from "@/components/dashboard/constants";
import { dashboardTheme } from "@/components/dashboard/theme";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyRevenueData, ProcessedTrendPoint, TrendGroupBy } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_LEGEND_STYLE,
  CHART_TOOLTIP_STYLE,
  computeTickInterval,
  formatShortDate,
} from "@/lib/chart-utils";
import { formatCurrency } from "@/lib/format";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendsTabProps {
  loading: boolean;
  error: string | null;
  dailyRevenue: DailyRevenueData | null;
  processedTrendData: ProcessedTrendPoint[];
  trendGroupBy: TrendGroupBy;
  onTrendGroupByChange: (groupBy: TrendGroupBy) => void;
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

function getGroupNames(
  dailyRevenue: DailyRevenueData | null,
  trendGroupBy: TrendGroupBy,
): string[] {
  if (!dailyRevenue?.data || !trendGroupBy) return [];
  return Array.from(
    new Set(
      dailyRevenue.data
        .map((d) => d[trendGroupBy])
        .filter((g): g is string => typeof g === "string"),
    ),
  );
}

export function TrendsTab({
  loading,
  error,
  dailyRevenue,
  processedTrendData,
  trendGroupBy,
  onTrendGroupByChange,
}: TrendsTabProps) {
  const [showDaily, setShowDaily] = useState(false);
  const groupNames = getGroupNames(dailyRevenue, trendGroupBy);
  const pointCount = processedTrendData.length;

  const exportRows = processedTrendData.map((row) => ({ ...row }));

  return (
    <TabSection loading={loading} error={error} hasData={!!dailyRevenue}>
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Revenue Trend with Moving Averages
            </CardTitle>
            <CardDescription className="text-gray-500">
              Daily revenue curve smoothed by 30-day and 90-day rolling averages
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!trendGroupBy && (
              <button
                type="button"
                onClick={() => setShowDaily((v) => !v)}
                className={showDaily ? dashboardTheme.chipActive : dashboardTheme.chipIdle}
              >
                {showDaily ? "Hide daily" : "Show daily"}
              </button>
            )}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => onTrendGroupByChange(null)}
                className={!trendGroupBy ? dashboardTheme.chipActive : dashboardTheme.chipIdle}
              >
                No Grouping
              </button>
              <button
                type="button"
                onClick={() => onTrendGroupByChange("region")}
                className={
                  trendGroupBy === "region" ? dashboardTheme.chipActive : dashboardTheme.chipIdle
                }
              >
                By Region
              </button>
              <button
                type="button"
                onClick={() => onTrendGroupByChange("product_category")}
                className={
                  trendGroupBy === "product_category"
                    ? dashboardTheme.chipActive
                    : dashboardTheme.chipIdle
                }
              >
                By Category
              </button>
            </div>
            <ExportCsvButton
              tab="trends"
              rows={exportRows}
              disabled={loading}
              columns={Object.keys(exportRows[0] ?? { date: "" }).map((key) => ({
                key,
                header: key,
              }))}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420} minWidth={0} debounce={50}>
            <LineChart
              key={`${trendGroupBy ?? "all"}-${pointCount}`}
              data={processedTrendData}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={CHART_AXIS_TICK}
                tickFormatter={formatShortDate}
                interval={computeTickInterval(pointCount, 12)}
                angle={-35}
                textAnchor="end"
                height={56}
              />
              <YAxis
                stroke="#9ca3af"
                tick={CHART_AXIS_TICK}
                tickFormatter={currencyTick}
                width={72}
                label={{
                  value: "Revenue",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8",
                  style: { textAnchor: "middle", fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={(label) => formatShortDate(String(label))}
                formatter={(val: number) => formatCurrency(val)}
              />
              <Legend wrapperStyle={CHART_LEGEND_STYLE} />
              {!trendGroupBy && showDaily && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#475569"
                  strokeWidth={1}
                  dot={false}
                  name="Daily Revenue"
                  opacity={0.25}
                />
              )}
              {!trendGroupBy && (
                <Line
                  type="monotone"
                  dataKey="ma30"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={false}
                  name="30-day MA"
                />
              )}
              {!trendGroupBy && (
                <Line
                  type="monotone"
                  dataKey="ma90"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={false}
                  name="90-day MA"
                />
              )}
              {trendGroupBy &&
                groupNames.map((grpName, idx) => {
                  const style = GROUPED_LINE_STYLES[idx % GROUPED_LINE_STYLES.length];
                  return (
                    <Line
                      key={grpName}
                      type="monotone"
                      dataKey={grpName}
                      stroke={style.stroke}
                      strokeWidth={2.5}
                      strokeDasharray={style.strokeDasharray}
                      dot={false}
                      name={grpName}
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </TabSection>
  );
}
