"use client";

import { MAPE_THRESHOLD } from "@/components/dashboard/constants";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForecastData, ForecastSection } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_LEGEND_STYLE,
  CHART_TOOLTIP_STYLE,
  computeMape,
  computeTickInterval,
  formatYearMonth,
  normalizeDateKey,
} from "@/lib/chart-utils";
import { formatCurrency } from "@/lib/format";
import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ForecastingTabProps {
  section: ForecastSection;
  forecastHorizon: number;
  onForecastHorizonChange: (horizon: number) => void;
}

interface EnrichedForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
  ciRange: number;
  actual?: number;
  fitted?: number;
  projected?: number;
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

function enrichForecastData(data: ForecastData): {
  chartData: EnrichedForecastPoint[];
  forecastStart: string | null;
  mape: number | null;
} {
  const actualsByDs = new Map(
    (data.validation ?? []).map((v) => [normalizeDateKey(v.ds), v.y]),
  );
  const forecastByDs = new Map(
    data.forecast.map((f) => [normalizeDateKey(f.ds), f.yhat]),
  );

  const validationDates = (data.validation ?? [])
    .map((v) => normalizeDateKey(v.ds))
    .sort();
  const lastActualDs = validationDates.at(-1) ?? null;

  const chartData: EnrichedForecastPoint[] = data.forecast.map((point) => {
    const ds = normalizeDateKey(point.ds);
    const actual = actualsByDs.get(ds);
    const isFuture = lastActualDs ? ds > lastActualDs : false;

    return {
      ...point,
      ds,
      ciRange: point.yhat_upper - point.yhat_lower,
      actual,
      fitted: !isFuture ? point.yhat : undefined,
      projected: isFuture ? point.yhat : undefined,
    };
  });

  const forecastStart =
    chartData.find((p) => p.projected !== undefined)?.ds ?? null;

  const mapePoints = (data.validation ?? []).map((v) => ({
    actual: v.y,
    predicted: forecastByDs.get(normalizeDateKey(v.ds)) ?? 0,
  }));

  return {
    chartData,
    forecastStart,
    mape: computeMape(mapePoints),
  };
}

export function ForecastingTab({
  section,
  forecastHorizon,
  onForecastHorizonChange,
}: ForecastingTabProps) {
  const { data: forecastData, loading, error } = section;

  const { chartData, forecastStart, mape } = useMemo(() => {
    if (!forecastData || !forecastData.forecast?.length) {
      return { chartData: [], forecastStart: null, mape: null };
    }
    return enrichForecastData(forecastData);
  }, [forecastData]);

  const mapePasses = mape !== null && mape <= MAPE_THRESHOLD;

  const forecastExportRows = useMemo(() => {
    if (!forecastData) return [];
    const forecastRows = forecastData.forecast.map((row) => ({
      section: "forecast",
      ds: row.ds,
      yhat: row.yhat,
      yhat_lower: row.yhat_lower,
      yhat_upper: row.yhat_upper,
      y: row.y ?? "",
    }));
    const validationRows = (forecastData.validation ?? []).map((row) => ({
      section: "validation",
      ds: row.ds,
      yhat: "",
      yhat_lower: "",
      yhat_upper: "",
      y: row.y,
    }));
    return [...forecastRows, ...validationRows];
  }, [forecastData]);

  return (
    <TabSection loading={loading} error={error} hasData={!!forecastData}>
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Machine Learning Revenue Forecast
            </CardTitle>
            <CardDescription className="text-gray-500">
              Prophet model forecasting monthly revenue with Indian holiday modifiers
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <ExportCsvButton
              tab="forecasting"
              rows={forecastExportRows}
              disabled={loading}
              columns={[
                { key: "section", header: "section" },
                { key: "ds", header: "ds" },
                { key: "yhat", header: "yhat" },
                { key: "yhat_lower", header: "yhat_lower" },
                { key: "yhat_upper", header: "yhat_upper" },
                { key: "y", header: "y" },
              ]}
            />
            <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-xl border border-slate-700/60">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500">
                  Forecast Horizon: {forecastHorizon} Months
                </p>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={forecastHorizon}
                  onChange={(e) => onForecastHorizonChange(parseInt(e.target.value, 10))}
                  className="w-40 accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {forecastData && chartData.length > 0 ? (
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  {forecastStart && (
                    <ReferenceArea
                      x1={forecastStart}
                      x2={chartData[chartData.length - 1]?.ds}
                      fill="#F59E0B"
                      fillOpacity={0.06}
                      strokeOpacity={0}
                    />
                  )}
                  <XAxis
                    dataKey="ds"
                    stroke="#9ca3af"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={(val) => formatYearMonth(String(val).substring(0, 7))}
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
                    labelFormatter={(label) => formatYearMonth(String(label).substring(0, 7))}
                    formatter={(val: number, name: string) => [formatCurrency(val), name]}
                  />
                  <Legend wrapperStyle={CHART_LEGEND_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="yhat_lower"
                    stackId="ci"
                    stroke="none"
                    fill="transparent"
                    legendType="none"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="ciRange"
                    stackId="ci"
                    stroke="none"
                    fill="#F59E0B"
                    fillOpacity={0.2}
                    name="95% Confidence"
                    isAnimationActive={false}
                  />
                  {forecastStart && (
                    <ReferenceLine
                      x={forecastStart}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{
                        value: "Forecast start",
                        position: "insideTopRight",
                        fill: "#94a3b8",
                        fontSize: 10,
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Actuals (holdout)"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fitted"
                    stroke="#818CF8"
                    strokeWidth={1.5}
                    dot={false}
                    name="In-sample fit"
                    connectNulls={false}
                    strokeOpacity={0.7}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#F59E0B"
                    strokeDasharray="6 4"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name="Forecast"
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Forecast Model Performance</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    MAPE computed from out-of-sample holdout validation data
                  </p>
                </div>
                <div className="flex items-center gap-6 justify-end">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Model accuracy (MAPE)</p>
                    <p
                      className={`text-2xl font-black ${
                        mapePasses ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {mape !== null ? `${mape.toFixed(1)}%` : "N/A"}
                    </p>
                  </div>
                  {mape !== null && (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        mapePasses
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {mapePasses
                        ? `✅ PASS (Threshold ${MAPE_THRESHOLD}%)`
                        : `❌ FAIL (Threshold ${MAPE_THRESHOLD}%)`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No forecast loaded</p>
          )}
        </CardContent>
      </Card>
    </TabSection>
  );
}
