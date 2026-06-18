import { CHART_COLORS } from "@/components/dashboard/constants";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChannelMixData, MarginsSection } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  upliftBarColor,
} from "@/lib/chart-utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
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

function ChannelShareBar({ data }: { data: ChannelMixData[] }) {
  const sorted = [...data].sort((a, b) => b.share_pct - a.share_pct);

  return (
    <div className="space-y-5 py-2">
      {sorted.map((ch, index) => (
        <div key={ch.channel}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-semibold text-slate-200 capitalize">{ch.channel}</span>
            <span className="text-slate-400">
              {formatPercent(ch.share_pct)} · {formatCurrency(ch.revenue)}
            </span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${ch.share_pct}%`,
                backgroundColor: CHART_COLORS[(index + 2) % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
      <div className="flex h-4 rounded-full overflow-hidden mt-2">
        {sorted.map((ch, index) => (
          <div
            key={`stack-${ch.channel}`}
            className="h-full"
            style={{
              width: `${ch.share_pct}%`,
              backgroundColor: CHART_COLORS[(index + 2) % CHART_COLORS.length],
            }}
            title={`${ch.channel}: ${formatPercent(ch.share_pct)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        {sorted.map((ch) => (
          <span key={`lbl-${ch.channel}`} className="capitalize">
            {ch.channel} {formatPercent(ch.share_pct, 0)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MarginsTab({ section }: MarginsTabProps) {
  const { data, loading, error } = section;
  const returnsData = data?.returns;
  const channelData = data?.channel;
  const festiveUplift = data?.festive;

  const maxReturnRate = returnsData
    ? Math.max(...returnsData.map((r) => r.return_rate))
    : 0;

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
                  <BarChart
                    data={returnsData}
                    layout="vertical"
                    margin={{ left: 8, right: 40, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      tick={CHART_AXIS_TICK}
                      tickFormatter={percentTick}
                      domain={[0, Math.max(maxReturnRate * 1.25, 0.005)]}
                    />
                    <YAxis
                      dataKey="product_category"
                      type="category"
                      stroke="#64748b"
                      tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(val: number) => `${(val * 100).toFixed(2)}%`}
                    />
                    <Bar
                      dataKey="return_rate"
                      fill="#EF4444"
                      name="Return Rate"
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="return_rate"
                        position="right"
                        formatter={(val: number) => `${(val * 100).toFixed(2)}%`}
                        fill="#fca5a5"
                        fontSize={10}
                      />
                    </Bar>
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
              <CardContent>
                <ChannelShareBar data={channelData} />
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
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={festiveUplift}
                  margin={{ top: 8, right: 16, left: 8, bottom: 48 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="festival"
                    stroke="#64748b"
                    tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={(val: number) => `${val.toFixed(0)}%`}
                    label={{
                      value: "Uplift %",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#94a3b8",
                      style: { textAnchor: "middle", fontSize: 11 },
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(val: number) => [`${val.toFixed(1)}%`, "Revenue Uplift"]}
                  />
                  <Bar dataKey="uplift_pct" name="Uplift %" radius={[4, 4, 0, 0]}>
                    {festiveUplift.map((entry) => (
                      <Cell key={entry.festival} fill={upliftBarColor(entry.uplift_pct)} />
                    ))}
                    <LabelList
                      dataKey="uplift_pct"
                      position="top"
                      formatter={(val: number) => `${val.toFixed(0)}%`}
                      fill="#e2e8f0"
                      fontSize={10}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
