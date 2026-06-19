import { CategoryHeatmap } from "@/components/dashboard/CategoryHeatmap";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TabSection } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductsSection, SKUData } from "@/lib/types";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
  truncateLabel,
} from "@/lib/chart-utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { palette } from "@/lib/palette";
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
      <p className="font-semibold text-gray-900 mb-1 max-w-xs">{row.product_sku}</p>
      <p className="text-gray-600">Revenue: {formatCurrency(row.revenue)}</p>
      <p className="text-gray-600">Quantity: {formatNumber(row.quantity)} cartons</p>
    </div>
  );
}

export function ProductsTab({ section }: ProductsTabProps) {
  const { data, loading, error } = section;
  const categoryData = data?.categories;
  const skuData = data?.skus;
  const heatmapData = data?.heatmap;

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

  const skuExportRows = useMemo(() => {
    if (!skuData) return [];
    return [
      ...skuData.top.map((row) => ({ section: "top", ...row })),
      ...skuData.bottom.map((row) => ({ section: "bottom", ...row })),
    ];
  }, [skuData]);

  return (
    <TabSection loading={loading} error={error} hasData={!!data}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categoryData && (
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Category Margin Contribution
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Net revenue by category with margin % annotated on each bar
                  </CardDescription>
                </div>
                <ExportCsvButton
                  tab="products-categories"
                  rows={categoryData}
                  disabled={loading}
                  columns={[
                    { key: "product_category", header: "product_category" },
                    { key: "revenue", header: "revenue" },
                    { key: "margin", header: "margin" },
                    { key: "margin_pct", header: "margin_pct" },
                  ]}
                />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ left: 8, right: 48, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#9ca3af"
                      tick={CHART_AXIS_TICK}
                      tickFormatter={currencyTick}
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
                      formatter={(val: number, name: string) => {
                        if (name === "Net Revenue") return [formatCurrency(val), name];
                        return [formatCurrency(val), name];
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar dataKey="revenue" fill={palette.maroon} name="Net Revenue" radius={[0, 4, 4, 0]}>
                      <LabelList
                        dataKey="margin_pct"
                        position="right"
                        formatter={(val: number) => `${val.toFixed(1)}% margin`}
                        fill={palette.crimson}
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
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Top 10 SKUs by Revenue
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Top-selling products and carton quantities
                  </CardDescription>
                </div>
                <ExportCsvButton
                  tab="products-skus"
                  rows={skuExportRows}
                  disabled={loading}
                  columns={[
                    { key: "section", header: "section" },
                    { key: "product_sku", header: "product_sku" },
                    { key: "revenue", header: "revenue" },
                    { key: "quantity", header: "quantity" },
                  ]}
                />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={topSkuRows}
                    layout="vertical"
                    margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#9ca3af"
                      tick={CHART_AXIS_TICK}
                      tickFormatter={currencyTick}
                    />
                    <YAxis
                      dataKey="skuLabel"
                      type="category"
                      stroke="#9ca3af"
                      tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
                      width={200}
                    />
                    <Tooltip content={<SkuTooltip />} />
                    <Bar dataKey="revenue" fill={palette.crimson} name="Revenue" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {skuData && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Bottom 10 SKUs by Revenue
              </CardTitle>
              <CardDescription className="text-gray-500">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#9ca3af"
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
                    stroke="#9ca3af"
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

        {heatmapData && heatmapData.regions.length > 0 && (
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Region × Category Revenue Heatmap
              </CardTitle>
              <CardDescription className="text-gray-500">
                CSS grid heatmap (no extra chart dependency). Darker indigo = higher revenue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryHeatmap data={heatmapData} loading={loading} />
            </CardContent>
          </Card>
        )}
      </div>
    </TabSection>
  );
}
