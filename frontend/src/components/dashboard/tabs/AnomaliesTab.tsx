"use client";

import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { MetricCard, TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnomaliesSection, AnomalyPoint } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_LEGEND_STYLE,
  CHART_TOOLTIP_STYLE,
  computeTickInterval,
  formatShortDate,
} from "@/lib/chart-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { useMemo, useState } from "react";
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

type AnomalyTypeFilter = "all" | "spike" | "drop";

const FLAGGED_PAGE_SIZE = 10;

function anomalyType(zScore: number): "spike" | "drop" {
  return zScore >= 0 ? "spike" : "drop";
}

function matchesTypeFilter(row: AnomalyPoint, filter: AnomalyTypeFilter): boolean {
  if (filter === "all") return true;
  return anomalyType(row.z_score) === filter;
}

interface AnomalyDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: { is_anomaly?: boolean };
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

function AnomalyDot({ cx, cy, index, payload }: AnomalyDotProps) {
  const dotKey = `anomaly-dot-${index ?? "x"}`;

  if (cx === undefined || cy === undefined || !payload?.is_anomaly) {
    return (
      <circle
        key={dotKey}
        cx={cx ?? 0}
        cy={cy ?? 0}
        r={0}
        fill="none"
        stroke="none"
        visibility="hidden"
      />
    );
  }
  return (
    <circle
      key={dotKey}
      cx={cx}
      cy={cy}
      r={8}
      fill="#EF4444"
      stroke="#fff"
      strokeWidth={2}
    />
  );
}

function filterButtonClass(active: boolean): string {
  return `text-xs px-3 py-1.5 rounded-lg transition-all ${
    active
      ? "bg-[#5D87FF] text-white font-semibold"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  }`;
}

export function AnomaliesTab({ section }: AnomaliesTabProps) {
  const { data: anomalyData, loading, error } = section;
  const seriesData = anomalyData?.series;
  const flaggedData = anomalyData?.flagged;

  const [typeFilter, setTypeFilter] = useState<AnomalyTypeFilter>("all");
  const [flaggedPage, setFlaggedPage] = useState(1);
  const [includeFullSeries, setIncludeFullSeries] = useState(false);

  const zscoreThreshold = seriesData?.zscore_threshold ?? 2.5;
  const rollingWindow = seriesData?.rolling_window_days ?? 30;
  const minRevenueDelta = seriesData?.min_revenue_delta ?? 100_000;
  const excludeFestive = seriesData?.exclude_festive_days ?? true;

  const sortedFlagged = useMemo(() => {
    if (!flaggedData?.data) return [];
    return [...flaggedData.data].sort(
      (a, b) => Math.abs(b.z_score) - Math.abs(a.z_score),
    );
  }, [flaggedData]);

  const filteredFlagged = useMemo(
    () => sortedFlagged.filter((row) => matchesTypeFilter(row, typeFilter)),
    [sortedFlagged, typeFilter],
  );

  const flaggedPageCount = Math.max(
    1,
    Math.ceil(filteredFlagged.length / FLAGGED_PAGE_SIZE),
  );

  const safePage = Math.min(flaggedPage, flaggedPageCount);

  const tableRows = useMemo(() => {
    const start = (safePage - 1) * FLAGGED_PAGE_SIZE;
    return filteredFlagged.slice(start, start + FLAGGED_PAGE_SIZE);
  }, [filteredFlagged, safePage]);

  const tableRangeStart =
    filteredFlagged.length === 0 ? 0 : (safePage - 1) * FLAGGED_PAGE_SIZE + 1;
  const tableRangeEnd = Math.min(safePage * FLAGGED_PAGE_SIZE, filteredFlagged.length);

  const chartData = useMemo(() => {
    if (!seriesData?.data) return [];
    return seriesData.data.map((d) => ({
      ...d,
      date: d.date.split("T")[0],
    }));
  }, [seriesData]);

  const defaultBrushStart = useMemo(() => {
    if (chartData.length <= 90) return 0;
    return Math.max(0, chartData.length - 90);
  }, [chartData.length]);

  const anomalyExportRows = useMemo(() => {
    const source = includeFullSeries ? seriesData?.data ?? [] : filteredFlagged;
    return source.map((row) => ({
      date: row.date.split("T")[0],
      daily_revenue: row.daily_revenue,
      rolling_mean: row.rolling_mean,
      z_score: row.z_score,
      revenue_deviation: row.revenue_deviation ?? "",
      is_anomaly: row.is_anomaly,
    }));
  }, [includeFullSeries, seriesData, filteredFlagged]);

  return (
    <TabSection loading={loading} error={error} hasData={!!seriesData}>
      {seriesData && flaggedData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Days Analyzed"
              value={seriesData.total_days}
              change="Daily trend size"
              changeType="neutral"
              accent="blue"
            />
            <MetricCard
              title="Anomalous Days"
              value={seriesData.anomalies_count}
              change={`${((seriesData.anomalies_count / seriesData.total_days) * 100).toFixed(1)}% anomaly rate`}
              changeType="negative"
              accent="rose"
            />
            <MetricCard
              title="Detection Rules"
              value={`|z| > ${zscoreThreshold.toFixed(1)}`}
              change={`Min Δ ${formatCurrency(minRevenueDelta)}${excludeFestive ? " · festive excluded" : ""}`}
              changeType="neutral"
              accent="orange"
            />
          </div>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Daily Revenue Anomaly Timeline
              </CardTitle>
              <CardDescription className="text-gray-500">
                {rollingWindow}-day rolling z-score. Red dots = flagged days (festive windows
                excluded when configured).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={formatShortDate}
                    interval={computeTickInterval(chartData.length, 10)}
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
                    name={`${rollingWindow}-day Mean`}
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

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Flagged Anomalous Days
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Sorted by severity (highest |z-score| first), 10 rows per page.
                  </CardDescription>
                </div>
                {filteredFlagged.length > 0 && (
                  <p className="text-xs text-gray-500 shrink-0">
                    Showing {tableRangeStart}–{tableRangeEnd} of {filteredFlagged.length}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFullSeries}
                    onChange={(e) => setIncludeFullSeries(e.target.checked)}
                    className="rounded border-slate-600 bg-gray-100 text-indigo-500"
                  />
                  Include full series in CSV
                </label>
                <ExportCsvButton
                  tab="anomalies"
                  rows={anomalyExportRows}
                  disabled={loading}
                  columns={[
                    { key: "date", header: "date" },
                    { key: "daily_revenue", header: "daily_revenue" },
                    { key: "rolling_mean", header: "rolling_mean" },
                    { key: "z_score", header: "z_score" },
                    { key: "revenue_deviation", header: "revenue_deviation" },
                    { key: "is_anomaly", header: "is_anomaly" },
                  ]}
                />
                <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("all");
                      setFlaggedPage(1);
                    }}
                    className={filterButtonClass(typeFilter === "all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("spike");
                      setFlaggedPage(1);
                    }}
                    className={filterButtonClass(typeFilter === "spike")}
                  >
                    Spikes only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter("drop");
                      setFlaggedPage(1);
                    }}
                    className={filterButtonClass(typeFilter === "drop")}
                  >
                    Drops only
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFlagged.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">
                  No flagged days match the current filters and detection rules.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4 text-right">Actual Revenue</th>
                          <th className="py-3 px-4 text-right">Rolling Average</th>
                          <th className="py-3 px-4 text-right">Deviation</th>
                          <th className="py-3 px-4 text-right">Z-Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((row) => {
                          const type = anomalyType(row.z_score);
                          const deviation =
                            row.revenue_deviation ??
                            Math.abs(row.daily_revenue - row.rolling_mean);
                          return (
                            <tr
                              key={row.date}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3.5 px-4 font-bold text-gray-800">
                                {row.date.split("T")[0]}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                                    type === "spike"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  }`}
                                >
                                  {type === "spike" ? "Spike" : "Drop"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                                {formatCurrency(row.daily_revenue)}
                              </td>
                              <td className="py-3.5 px-4 text-right text-gray-500">
                                {formatCurrency(row.rolling_mean)}
                              </td>
                              <td className="py-3.5 px-4 text-right text-gray-600">
                                {formatCurrency(deviation)}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs">
                                  {row.z_score.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredFlagged.length > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setFlaggedPage((p) => p - 1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#5D87FF] hover:text-[#5D87FF] transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-500">
                        Page {safePage} of {flaggedPageCount}
                      </span>
                      <button
                        type="button"
                        disabled={safePage >= flaggedPageCount}
                        onClick={() => setFlaggedPage((p) => p + 1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#5D87FF] hover:text-[#5D87FF] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </TabSection>
  );
}
