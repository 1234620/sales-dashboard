import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard, TabSection } from "@/components/dashboard/MetricCard";
import type { OverviewSection } from "@/lib/types";
import { pctChange } from "@/lib/date-ranges";
import { downloadCsv, exportFilename } from "@/lib/export-csv";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  computeTickInterval,
  formatYearMonth,
} from "@/lib/chart-utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
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

function compareLabel(current: number | undefined, prior: number | undefined): string | null {
  if (current === undefined || prior === undefined) return null;
  const pct = pctChange(current, prior);
  if (pct === null) return null;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% vs prior period`;
}

function exportOverviewCsv(
  kpis: NonNullable<OverviewSection["data"]>["kpis"],
  trend: NonNullable<OverviewSection["data"]>["trend"],
): void {
  const lines: string[] = ["section,key,value1,value2,value3"];
  const kpiEntries: [string, number][] = [
    ["total_revenue", kpis.total_revenue],
    ["average_order_value", kpis.average_order_value],
    ["discount_impact_rate", kpis.discount_impact_rate],
    ["sales_velocity", kpis.sales_velocity],
    ["repeat_purchase_rate", kpis.repeat_purchase_rate],
    ["contribution_margin", kpis.contribution_margin],
    ["total_transactions", kpis.total_transactions],
    ["unique_customers", kpis.unique_customers],
    ["mom_growth", kpis.mom_growth],
    ["yoy_growth", kpis.yoy_growth],
  ];
  for (const [key, value] of kpiEntries) {
    lines.push(`KPI,${key},${value},,`);
  }
  for (const row of trend.data) {
    lines.push(
      `TREND,${row.year_month},${row.revenue},${row.mom_growth_pct ?? ""},`,
    );
  }
  downloadCsv(exportFilename("overview"), lines.join("\n"));
}

export function OverviewTab({ section }: OverviewTabProps) {
  const { data, loading, error } = section;
  const kpis = data?.kpis;
  const trendData = data?.trend;
  const yoyData = data?.yoy;
  const compareKpis = data?.compareKpis;
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
            compareDelta={compareLabel(kpis?.total_revenue, compareKpis?.total_revenue)}
            changeType={
              kpis && kpis.mom_growth >= 0 && (kpis.yoy_growth ?? 0) >= 0
                ? "positive"
                : "negative"
            }
            accent="blue"
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
            compareDelta={compareLabel(
              kpis?.contribution_margin,
              compareKpis?.contribution_margin,
            )}
            changeType="positive"
            accent="teal"
            delay={100}
          />
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(kpis?.average_order_value)}
            change="Per transaction"
            compareDelta={compareLabel(
              kpis?.average_order_value,
              compareKpis?.average_order_value,
            )}
            changeType="neutral"
            accent="cyan"
            delay={200}
          />
          <MetricCard
            title="Sales Velocity"
            value={`${formatCurrency(kpis?.sales_velocity)} / day`}
            change="Revenue rate"
            compareDelta={compareLabel(kpis?.sales_velocity, compareKpis?.sales_velocity)}
            changeType="neutral"
            accent="orange"
            delay={300}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Discount Impact"
            value={formatPercent((kpis?.discount_impact_rate ?? 0) * 100)}
            change="Weighted avg"
            compareDelta={compareLabel(
              kpis?.discount_impact_rate,
              compareKpis?.discount_impact_rate,
            )}
            changeType="negative"
            accent="rose"
            delay={400}
          />
          <MetricCard
            title="Repeat Purchase Rate"
            value={formatPercent(kpis?.repeat_purchase_rate)}
            change="Outlet retention"
            compareDelta={compareLabel(
              kpis?.repeat_purchase_rate,
              compareKpis?.repeat_purchase_rate,
            )}
            changeType="positive"
            accent="purple"
            delay={500}
          />
          <MetricCard
            title="Total Transactions"
            value={formatNumber(kpis?.total_transactions)}
            change="Orders fulfilled"
            compareDelta={compareLabel(
              kpis?.total_transactions,
              compareKpis?.total_transactions,
            )}
            changeType="neutral"
            accent="pink"
            delay={600}
          />
          <MetricCard
            title="Unique Customers"
            value={formatNumber(kpis?.unique_customers)}
            change="Retail outlets"
            compareDelta={compareLabel(
              kpis?.unique_customers,
              compareKpis?.unique_customers,
            )}
            changeType="neutral"
            accent="sky"
            delay={700}
          />
        </div>

        {trendData && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Track monthly sales growth trajectory and volumes. CSV uses a single file
                  with KPI rows (section=KPI) and trend rows (section=TREND).
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || !kpis}
                className="text-xs border-gray-200 text-gray-700 shrink-0"
                onClick={() => kpis && exportOverviewCsv(kpis, trendData)}
              >
                Export CSV
              </Button>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="year_month"
                    stroke="#9ca3af"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={formatYearMonth}
                    interval={computeTickInterval(monthCount, 10)}
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
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Year-over-Year Revenue Growth
              </CardTitle>
              <CardDescription className="text-gray-500">
                Monthly revenue change vs the prior year (latest year in filter range)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={yoyChartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="label" stroke="#9ca3af" tick={CHART_AXIS_TICK} />
                  <YAxis
                    stroke="#9ca3af"
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
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(val: number) => [`${val.toFixed(1)}%`, "YoY Growth"]}
                  />
                  <Bar
                    dataKey="yoy_growth_pct"
                    fill="#6366F1"
                    name="YoY Growth"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
