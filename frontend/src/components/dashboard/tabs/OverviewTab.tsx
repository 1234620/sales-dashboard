import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard, TabSection } from "@/components/dashboard/MetricCard";
import type { OverviewSection } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  computeTickInterval,
  formatYearMonth,
} from "@/lib/chart-utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OverviewTabProps {
  section: OverviewSection;
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

export function OverviewTab({ section }: OverviewTabProps) {
  const { data, loading, error } = section;
  const kpis = data?.kpis;
  const trendData = data?.trend;
  const yoyData = data?.yoy;
  const monthCount = trendData?.data.length ?? 0;
  const yoyChartData =
    yoyData?.data.filter((row) => row.yoy_growth_pct !== null) ?? [];

  return (
    <TabSection loading={loading} error={error} hasData={!!data}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(kpis?.total_revenue)}
            change={
              kpis?.mom_growth !== undefined
                ? `${Math.abs(kpis.mom_growth).toFixed(1)}% MoM${
                    kpis.yoy_growth !== undefined
                      ? ` · ${Math.abs(kpis.yoy_growth).toFixed(1)}% YoY`
                      : ""
                  }`
                : null
            }
            changeType={
              kpis && kpis.mom_growth >= 0 && (kpis.yoy_growth ?? 0) >= 0
                ? "positive"
                : "negative"
            }
            color="from-indigo-500 to-indigo-600"
            delay={0}
          />
          <MetricCard
            title="Contribution Margin"
            value={formatCurrency(kpis?.contribution_margin)}
            change={
              kpis?.total_revenue
                ? `${((kpis.contribution_margin / kpis.total_revenue) * 100).toFixed(1)}% of Revenue`
                : null
            }
            changeType="positive"
            color="from-emerald-500 to-emerald-600"
            delay={100}
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(kpis?.average_order_value)}
            change="Per transaction"
            changeType="neutral"
            color="from-cyan-500 to-cyan-600"
            delay={200}
          />
          <MetricCard
            title="Sales Velocity"
            value={`${formatCurrency(kpis?.sales_velocity)} / day`}
            change="Revenue rate"
            changeType="neutral"
            color="from-orange-500 to-orange-600"
            delay={300}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Discount Impact"
            value={formatPercent((kpis?.discount_impact_rate ?? 0) * 100)}
            change="Weighted avg"
            changeType="negative"
            color="from-rose-500 to-rose-600"
            delay={400}
          />
          <MetricCard
            title="Repeat Purchase Rate"
            value={formatPercent(kpis?.repeat_purchase_rate)}
            change="Outlet retention"
            changeType="positive"
            color="from-purple-500 to-purple-600"
            delay={500}
          />
          <MetricCard
            title="Total Transactions"
            value={formatNumber(kpis?.total_transactions)}
            change="Orders fulfilled"
            changeType="neutral"
            color="from-pink-500 to-pink-600"
            delay={600}
          />
          <MetricCard
            title="Unique Customers"
            value={formatNumber(kpis?.unique_customers)}
            change="Retail outlets"
            changeType="neutral"
            color="from-sky-500 to-sky-600"
            delay={700}
          />
        </div>

        {trendData && (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Monthly Revenue Trend</CardTitle>
              <CardDescription className="text-slate-400">
                Track monthly sales growth trajectory and volumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={trendData.data}
                  margin={{ top: 10, right: 16, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="year_month"
                    stroke="#64748b"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={formatYearMonth}
                    interval={computeTickInterval(monthCount, 10)}
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
                    labelFormatter={(label) => formatYearMonth(String(label))}
                    formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fill="url(#revenueGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {yoyChartData.length > 0 && (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Year-over-Year Revenue Growth
              </CardTitle>
              <CardDescription className="text-slate-400">
                Monthly revenue change vs the prior year (latest year in filter range)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={yoyChartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    tick={CHART_AXIS_TICK}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={(val: number) => `${val.toFixed(0)}%`}
                    width={48}
                    label={{
                      value: "YoY %",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#94a3b8",
                      style: { textAnchor: "middle", fontSize: 11 },
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(val: number) => [`${val.toFixed(1)}%`, "YoY Growth"]}
                  />
                  <Bar dataKey="yoy_growth_pct" fill="#6366F1" name="YoY Growth" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
