import { CHART_COLORS } from "@/components/dashboard/constants";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChannelMixData, MarginsSection } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  upliftBarColor,
} from "@/lib/chart-utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useMemo } from "react";
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
            <span className="font-semibold text-gray-800 capitalize">{ch.channel}</span>
            <span className="text-gray-500">
              {formatPercent(ch.share_pct)} · {formatCurrency(ch.revenue)}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
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
      <div className="flex justify-between text-xs text-gray-500">
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

  const combinedExportRows = useMemo(() => {
    const rows: Record<string, unknown>[] = [];
    returnsData?.forEach((row) => {
      rows.push({ section: "returns", ...row });
    });
    channelData?.forEach((row) => {
      rows.push({ section: "channel", ...row });
    });
    festiveUplift?.forEach((row) => {
      rows.push({ section: "festive", ...row });
    });
    return rows;
  }, [returnsData, channelData, festiveUplift]);

  return (
    <TabSection loading={loading} error={error} hasData={!!data}>
      <div className="space-y-8">
        <div className="flex justify-end">
          <ExportCsvButton
            tab="margins"
            rows={combinedExportRows}
            disabled={loading}
            columns={[
              { key: "section", header: "section" },
              { key: "product_category", header: "product_category" },
              { key: "channel", header: "channel" },
              { key: "festival", header: "festival" },
              { key: "revenue", header: "revenue" },
              { key: "share_pct", header: "share_pct" },
              { key: "return_rate", header: "return_rate" },
              { key: "uplift_pct", header: "uplift_pct" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {returnsData && (
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Return Rates by Category
                </CardTitle>
                <CardDescription className="text-gray-500">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#9ca3af"
                      tick={CHART_AXIS_TICK}
                      tickFormatter={percentTick}
                      domain={[0, Math.max(maxReturnRate * 1.25, 0.005)]}
                    />
                    <YAxis
                      dataKey="product_category"
                      type="category"
                      stroke="#9ca3af"
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
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Channel Revenue Share
                </CardTitle>
                <CardDescription className="text-gray-500">
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
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Festive Season Revenue Uplift
              </CardTitle>
              <CardDescription className="text-gray-500">
                Sales velocity multiplier during key festive and Eid calendar dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={festiveUplift}
                  margin={{ top: 8, right: 16, left: 8, bottom: 48 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="festival"
                    stroke="#9ca3af"
                    tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis
                    stroke="#9ca3af"
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
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
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
