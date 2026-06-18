"use client";

import { MetricCard, TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnomaliesSection } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_LEGEND_STYLE,
  CHART_TOOLTIP_STYLE,
  computeTickInterval,
  formatShortDate,
} from "@/lib/chart-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { useMemo } from "react";
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnomaliesTabProps {
  section: AnomaliesSection;
}

interface AnomalyDotProps {
  cx?: number;
  cy?: number;
  payload?: { is_anomaly?: boolean };
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

function AnomalyDot({ cx, cy, payload }: AnomalyDotProps) {
  if (cx === undefined || cy === undefined) {
    return <g />;
  }
  if (payload?.is_anomaly) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="#EF4444"
        stroke="#fff"
        strokeWidth={2}
      />
    );
  }
  return <g />;
}

export function AnomaliesTab({ section }: AnomaliesTabProps) {
  const { data: anomalyData, loading, error } = section;

  const chartData = useMemo(() => {
    if (!anomalyData?.data) return [];
    return anomalyData.data.map((d) => ({
      ...d,
      date: d.date.split("T")[0],
    }));
  }, [anomalyData]);

  const defaultBrushStart = useMemo(() => {
    if (chartData.length <= 90) return 0;
    return Math.max(0, chartData.length - 90);
  }, [chartData.length]);

  return (
    <TabSection loading={loading} error={error} hasData={!!anomalyData}>
      {anomalyData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Days Analyzed"
              value={anomalyData.total_days}
              change="Daily trend size"
              changeType="neutral"
              color="from-indigo-500 to-indigo-600"
            />
            <MetricCard
              title="Anomalous Days"
              value={anomalyData.anomalies_count}
              change={`${((anomalyData.anomalies_count / anomalyData.total_days) * 100).toFixed(1)}% anomaly rate`}
              changeType="negative"
              color="from-rose-500 to-rose-600"
            />
            <MetricCard
              title="Z-Score Limit"
              value="±2.00 Std Dev"
              change="Statistical cutoff"
              changeType="neutral"
              color="from-amber-500 to-amber-600"
            />
          </div>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Daily Revenue Anomaly Timeline
              </CardTitle>
              <CardDescription className="text-slate-400">
                Z-score deviations highlighting days with unexpected sales spikes or drops.
                Drag the brush below to zoom into a date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={formatShortDate}
                    interval={computeTickInterval(chartData.length, 10)}
                    angle={-35}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    stroke="#64748b"
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
                    labelFormatter={(label) => formatDate(String(label))}
                    formatter={(val: number, name: string) => [formatCurrency(val), name]}
                  />
                  <Legend wrapperStyle={CHART_LEGEND_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="daily_revenue"
                    stroke="#4F46E5"
                    strokeWidth={1.5}
                    name="Daily Revenue"
                    dot={AnomalyDot}
                  />
                  <Line
                    type="monotone"
                    dataKey="rolling_mean"
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                    name="30-day Mean"
                  />
                  <Brush
                    dataKey="date"
                    height={28}
                    stroke="#6366F1"
                    fill="#1e293b"
                    tickFormatter={formatShortDate}
                    startIndex={defaultBrushStart}
                    travellerWidth={10}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                🚨 Flagged Anomalous Days
              </CardTitle>
              <CardDescription className="text-slate-400">
                Detailed list of dates exceeding the statistical z-score bounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actual Revenue</th>
                      <th className="py-3 px-4 text-right">Rolling Average</th>
                      <th className="py-3 px-4 text-right">Z-Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalyData.data
                      .filter((d) => d.is_anomaly)
                      .map((row) => (
                        <tr
                          key={row.date}
                          className="border-b border-slate-900 hover:bg-slate-900/40"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-200">
                            {row.date.split("T")[0]}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-white">
                            {formatCurrency(row.daily_revenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-400">
                            {formatCurrency(row.rolling_mean)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs">
                              {row.z_score.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </TabSection>
  );
}
