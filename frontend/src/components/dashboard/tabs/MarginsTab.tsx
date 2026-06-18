import { CHART_COLORS } from "@/components/dashboard/constants";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarginsSection } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MarginsTabProps {
  section: MarginsSection;
}

function percentTick(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function MarginsTab({ section }: MarginsTabProps) {
  const { data, loading, error } = section;
  const returnsData = data?.returns;
  const channelData = data?.channel;
  const festiveUplift = data?.festive;

  return (
    <TabSection loading={loading} error={error} hasData={!!data}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {returnsData && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Return Rates by Category
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Percentage of unit quantities returned by retailers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={returnsData} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      style={{ fontSize: "11px" }}
                      tickFormatter={percentTick}
                    />
                    <YAxis
                      dataKey="product_category"
                      type="category"
                      stroke="#64748b"
                      style={{ fontSize: "10px" }}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                      }}
                      formatter={(val: number) => `${(val * 100).toFixed(2)}%`}
                    />
                    <Bar
                      dataKey="return_rate"
                      fill="#EF4444"
                      name="Return Rate"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {channelData && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Channel Revenue Share
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Offline distributor logistics vs online supply chains
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      dataKey="revenue"
                      nameKey="channel"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={60}
                      paddingAngle={3}
                    >
                      {channelData.map((entry, index) => (
                        <Cell
                          key={entry.channel}
                          fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]}
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {festiveUplift && (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                Festive Season Revenue Uplift
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sales velocity multiplier during key festive and Eid calendar dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={festiveUplift}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="festival" stroke="#64748b" style={{ fontSize: "11px" }} />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: "11px" }}
                    tickFormatter={(val: number) => `${val.toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                    }}
                    formatter={(val: number) => [`${val.toFixed(1)}%`, "Revenue Uplift"]}
                  />
                  <Bar dataKey="uplift_pct" fill="#EC4899" name="Uplift %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
