import { CHART_COLORS } from "@/components/dashboard/constants";
import { PiePercentLabel, PieSliceLabel } from "@/components/dashboard/chart-primitives";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegionalSection } from "@/lib/types";
import { CHART_LEGEND_STYLE, CHART_TOOLTIP_STYLE } from "@/lib/chart-utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface RegionalTabProps {
  section: RegionalSection;
}

export function RegionalTab({ section }: RegionalTabProps) {
  const { data: regionalData, loading, error } = section;

  return (
    <TabSection loading={loading} error={error} hasData={!!regionalData}>
      {regionalData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Regional Revenue Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Share of revenue contribution by Indian region
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={340}>
                <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                  <Pie
                    data={regionalData}
                    dataKey="revenue"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={58}
                    paddingAngle={2}
                    stroke="#0f172a"
                    strokeWidth={2}
                    label={PieSliceLabel}
                    labelLine={false}
                  >
                    {regionalData.map((entry, index) => (
                      <Cell
                        key={entry.region}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Pie
                    data={regionalData}
                    dataKey="revenue"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={58}
                    fill="none"
                    stroke="none"
                    label={PiePercentLabel}
                    labelLine={{ stroke: "#64748b", strokeWidth: 1 }}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(val: number, _name, item) => [
                      `${formatCurrency(val)} (${formatPercent(item.payload.share_pct)})`,
                      item.payload.region,
                    ]}
                  />
                  <Legend wrapperStyle={CHART_LEGEND_STYLE} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Regional Details</CardTitle>
              <CardDescription className="text-slate-400">
                Detailed list of performance statistics by territory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((reg) => (
                  <div
                    key={reg.region}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-850 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{reg.region}</p>
                      <div className="w-48 bg-slate-800 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${reg.share_pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-indigo-400">
                        {formatCurrency(reg.revenue)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatPercent(reg.share_pct)} share
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </TabSection>
  );
}
