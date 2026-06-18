import { MetricCard, TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnomaliesSection } from "@/lib/types";
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

function formatAxisDate(val: string): string {
  return val ? val.split("T")[0] : "";
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
        r={5}
        fill="#EF4444"
        stroke="#fff"
        strokeWidth={1.5}
      />
    );
  }
  return <g />;
}

export function AnomaliesTab({ section }: AnomaliesTabProps) {
  const { data: anomalyData, loading, error } = section;

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
                Z-score deviations highlighting days with unexpected sales spikes or drops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={anomalyData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: "10px" }}
                    tickFormatter={formatAxisDate}
                  />
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
                  <Line
                    type="monotone"
                    dataKey="daily_revenue"
                    stroke="#4F46E5"
                    strokeWidth={1}
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
