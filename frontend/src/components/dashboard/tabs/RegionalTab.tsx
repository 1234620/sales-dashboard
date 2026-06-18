import { CHART_COLORS } from "@/components/dashboard/constants";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegionalSection } from "@/lib/types";
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
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={regionalData}
                    dataKey="revenue"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={65}
                    paddingAngle={3}
                  >
                    {regionalData.map((entry, index) => (
                      <Cell
                        key={entry.region}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                    }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
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
