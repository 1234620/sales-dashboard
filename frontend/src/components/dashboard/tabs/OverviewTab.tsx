import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard, TabSection } from "@/components/dashboard/MetricCard";
import type { OverviewSection } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
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

  return (
    <TabSection
      loading={loading}
      error={error}
      hasData={!!data}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(kpis?.total_revenue)}
            change={
              kpis?.mom_growth !== undefined
                ? `${Math.abs(kpis.mom_growth).toFixed(1)}% MoM`
                : null
            }
            changeType={kpis && kpis.mom_growth >= 0 ? "positive" : "negative"}
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
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={trendData.data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year_month" stroke="#64748b" style={{ fontSize: "11px" }} />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: "11px" }}
                    tickFormatter={currencyTick}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#fff",
                      borderRadius: "12px",
                    }}
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
      </div>
    </TabSection>
  );
}
