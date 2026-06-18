import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductsSection, SKUData } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  truncateLabel,
} from "@/lib/chart-utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductsTabProps {
  section: ProductsSection;
}

interface SkuChartRow extends SKUData {
  skuLabel: string;
}

function currencyTick(value: number): string {
  return formatCurrency(value);
}

function prepareSkuRows(skus: SKUData[]): SkuChartRow[] {
  return skus.map((sku) => ({
    ...sku,
    skuLabel: truncateLabel(sku.product_sku, 32),
  }));
}

function SkuTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SkuChartRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div
      style={CHART_TOOLTIP_STYLE}
      className="px-3 py-2 text-sm shadow-lg border"
    >
      <p className="font-semibold text-white mb-1 max-w-xs">{row.product_sku}</p>
      <p className="text-slate-300">Revenue: {formatCurrency(row.revenue)}</p>
      <p className="text-slate-300">Quantity: {formatNumber(row.quantity)} cartons</p>
    </div>
  );
}

export function ProductsTab({ section }: ProductsTabProps) {
  const { data, loading, error } = section;
  const categoryData = data?.categories;
  const skuData = data?.skus;

  const topSkuRows = useMemo(
    () => (skuData ? prepareSkuRows(skuData.top) : []),
    [skuData],
  );
  const bottomSkuRows = useMemo((): SkuChartRow[] => {
    if (!skuData) return [];
    return prepareSkuRows(skuData.bottom);
  }, [skuData]);

  const bottomMinRevenue = useMemo(() => {
    if (bottomSkuRows.length === 0) return 0;
    return Math.min(...bottomSkuRows.map((r) => r.revenue));
  }, [bottomSkuRows]);

  return (
    <TabSection loading={loading} error={error} hasData={!!data}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categoryData && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Category Margin Contribution
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Net revenue by category with margin % annotated on each bar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ left: 8, right: 48, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      tick={CHART_AXIS_TICK}
                      tickFormatter={currencyTick}
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
                      formatter={(val: number, name: string) => {
                        if (name === "Net Revenue") return [formatCurrency(val), name];
                        return [formatCurrency(val), name];
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar dataKey="revenue" fill="#6366F1" name="Net Revenue" radius={[0, 4, 4, 0]}>
                      <LabelList
                        dataKey="margin_pct"
                        position="right"
                        formatter={(val: number) => `${val.toFixed(1)}% margin`}
                        fill="#10B981"
                        fontSize={10}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {skuData && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  🏆 Top 10 SKUs by Revenue
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Top-selling products and carton quantities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={topSkuRows}
                    layout="vertical"
                    margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      tick={CHART_AXIS_TICK}
                      tickFormatter={currencyTick}
                    />
                    <YAxis
                      dataKey="skuLabel"
                      type="category"
                      stroke="#64748b"
                      tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                      width={200}
                    />
                    <Tooltip content={<SkuTooltip />} />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {skuData && (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                ⬇️ Bottom 10 SKUs by Revenue
              </CardTitle>
              <CardDescription className="text-slate-400">
                Lowest-revenue products — axis zoomed to this range so differences are visible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={bottomSkuRows}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    tick={CHART_AXIS_TICK}
                    tickFormatter={currencyTick}
                    domain={[
                      Math.max(0, bottomMinRevenue * 0.92),
                      "dataMax",
                    ]}
                  />
                  <YAxis
                    dataKey="skuLabel"
                    type="category"
                    stroke="#64748b"
                    tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                    width={200}
                  />
                  <Tooltip content={<SkuTooltip />} />
                  <Bar dataKey="revenue" fill="#EF4444" name="Revenue" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
