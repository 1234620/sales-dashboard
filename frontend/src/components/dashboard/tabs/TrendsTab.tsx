import { CHART_COLORS } from "@/components/dashboard/constants";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyRevenueData, ProcessedTrendPoint, TrendGroupBy } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
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
  const groupNames = getGroupNames(dailyRevenue, trendGroupBy);

  return (
    <TabSection loading={loading} error={error} hasData={!!dailyRevenue}>
      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-white">
              Revenue Trend with Moving Averages
            </CardTitle>
            <CardDescription className="text-slate-400">
              Daily revenue curve smoothed by 30-day and 90-day rolling averages
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => onTrendGroupByChange(null)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                !trendGroupBy
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              No Grouping
            </button>
            <button
              onClick={() => onTrendGroupByChange("region")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                trendGroupBy === "region"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              By Region
            </button>
            <button
              onClick={() => onTrendGroupByChange("product_category")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                trendGroupBy === "product_category"
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              By Category
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "10px" }} />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: "11px" }}
                tickFormatter={currencyTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                }}
                formatter={(val: number) => formatCurrency(val)}
              />
              <Legend />
              {!trendGroupBy ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#334155"
                    strokeWidth={1}
                    dot={false}
                    name="Daily Revenue"
                    opacity={0.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma30"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={false}
                    name="30-day MA"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma90"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={false}
                    name="90-day MA"
                  />
                </>
              ) : (
                groupNames.map((grpName, idx) => (
                  <Line
                    key={grpName}
                    type="monotone"
                    dataKey={grpName}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={grpName}
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </TabSection>
  );
}
